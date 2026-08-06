// v1.feats no tiene relación estructurada entre dotes (prerequisites_structured
// está vacío) — el único dato es prerequisites_es en texto libre. Estas utilidades
// infieren el vínculo dote→dote comparando ese texto contra los nombres de las
// demás dotes. Es best-effort: solo detecta coincidencias exactas (normalizadas),
// así que algunos prerrequisitos reales no van a enlazar (ej. variantes de nombre
// como "Esquiva" vs "Esquivar").

export interface FeatRef {
  id: string
  name_es: string
}

export interface SkillRef {
  id: string
  name_es: string
}

export interface SkillSubtypeRef {
  id: string
  name_es: string
  skillId: string
}

export interface PrerequisiteSegment {
  text: string
  feat?: FeatRef
  skill?: SkillRef
  skillSubtype?: SkillSubtypeRef
}

const DIACRITIC_PATTERN = /\p{Diacritic}/gu

export function normalizeFeatName(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(DIACRITIC_PATTERN, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

export function buildFeatNameIndex(feats: FeatRef[]): Map<string, FeatRef> {
  const index = new Map<string, FeatRef>()
  for (const feat of feats) {
    index.set(normalizeFeatName(feat.name_es), feat)
  }
  return index
}

const OR_AND_SPLIT = /(\s+(?:o|y)\s+)/i
const OR_AND_TOKEN = /^\s+(?:o|y)\s+$/i

// Intenta hacer coincidir `text` entero (recortado y sin punto final) con una dote
// del índice. Se prueba SIEMPRE como frase completa antes de fragmentar por "o"/"y"
// — así una dote cuyo propio nombre contiene esas palabras (ej. "Muerte o Gloria",
// "Prosperidad y Orgullo") se resuelve aquí y nunca llega a fragmentarse.
function matchWholePhrase(text: string, index: Map<string, FeatRef>): PrerequisiteSegment[] | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  const withoutTrailingDot = trimmed.replace(/\.$/, '')
  const hasTrailingDot = withoutTrailingDot.length !== trimmed.length
  const match = index.get(normalizeFeatName(withoutTrailingDot))
  if (!match) return null

  const segments: PrerequisiteSegment[] = [{ text: withoutTrailingDot, feat: match }]
  if (hasTrailingDot) segments.push({ text: '.' })
  return segments
}

// Una dote de Pathfinder a veces cita varios prerrequisitos alternativos con "o"
// (o conjuntos con "y") dentro de una misma cláusula separada por comas, ej.
// "Conjuros perforantes o Engañar 3 rangos". Si la cláusula entera no coincide con
// ninguna dote, se fragmenta por "o"/"y" y se prueba cada fragmento por separado;
// si tampoco así hay coincidencia, se deja la cláusula tal cual (sin fragmentar
// visualmente sin motivo).
function parseClause(text: string, index: Map<string, FeatRef>): PrerequisiteSegment[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const whole = matchWholePhrase(trimmed, index)
  if (whole) return whole

  const parts = trimmed.split(OR_AND_SPLIT)
  if (parts.length === 1) return [{ text: trimmed }]

  const hasAnyMatch = parts.some((p) => !OR_AND_TOKEN.test(p) && matchWholePhrase(p, index))
  if (!hasAnyMatch) return [{ text: trimmed }]

  const segments: PrerequisiteSegment[] = []
  for (const part of parts) {
    if (OR_AND_TOKEN.test(part)) {
      segments.push({ text: part })
      continue
    }
    const matched = matchWholePhrase(part, index)
    if (matched) segments.push(...matched)
    else if (part.trim()) segments.push({ text: part.trim() })
  }
  return segments
}

export function parsePrerequisiteLinks(text: string, index: Map<string, FeatRef>): PrerequisiteSegment[] {
  if (!text) return []

  const segments: PrerequisiteSegment[] = []

  for (const part of text.split(/([,;])/)) {
    if (part === ',' || part === ';') {
      segments.push({ text: part + ' ' })
      continue
    }
    segments.push(...parseClause(part, index))
  }

  return segments
}

export function extractPrerequisiteFeatIds(text: string, index: Map<string, FeatRef>): string[] {
  const seen = new Set<string>()
  const ids: string[] = []
  for (const segment of parsePrerequisiteLinks(text, index)) {
    if (segment.feat && !seen.has(segment.feat.id)) {
      seen.add(segment.feat.id)
      ids.push(segment.feat.id)
    }
  }
  return ids
}

// Las dotes de Pathfinder suelen reafirmar toda la cadena de prerrequisitos en su
// propio texto (ej. una dote de nivel alto que exige "Disparo preciso mejorado,
// Disparo a bocajarro, Disparo preciso" cuando en realidad Disparo preciso
// mejorado ya exige a los otros dos). Sin reducir, esa dote aparecería repetida
// bajo cada antepasado en vez de solo bajo su prerrequisito más específico.
function computeAncestorSets(requires: Map<string, string[]>): Map<string, Set<string>> {
  const cache = new Map<string, Set<string>>()

  function resolve(id: string, stack: Set<string>): Set<string> {
    const cached = cache.get(id)
    if (cached) return cached
    if (stack.has(id)) return new Set() // ciclo defensivo — no debería darse en datos reales

    stack.add(id)
    const ancestors = new Set<string>()
    for (const parentId of requires.get(id) ?? []) {
      ancestors.add(parentId)
      for (const grandparentId of resolve(parentId, stack)) ancestors.add(grandparentId)
    }
    stack.delete(id)
    cache.set(id, ancestors)
    return ancestors
  }

  for (const id of requires.keys()) resolve(id, new Set())
  return cache
}

// Devuelve la reducción transitiva de `requires`: para cada dote, descarta los
// prerrequisitos directos que ya quedan implicados por otro prerrequisito directo
// de esa misma dote.
export function transitiveReduceRequires(requires: Map<string, string[]>): Map<string, string[]> {
  const ancestorSets = computeAncestorSets(requires)
  const reduced = new Map<string, string[]>()

  for (const [featId, prereqs] of requires) {
    const minimal = prereqs.filter(
      (p) => !prereqs.some((other) => other !== p && ancestorSets.get(other)?.has(p))
    )
    reduced.set(featId, minimal)
  }

  return reduced
}

// ── Enlace dote → habilidad ──────────────────────────────────────────────────
// A diferencia de los prerrequisitos de dote (donde la cláusula entera coincide
// con el nombre de otra dote), un prerrequisito de habilidad va seguido de
// "N rango(s)" y a veces de un subtipo entre paréntesis — ej. "Diplomacia 3
// rangos" o "Saber (planos) 3 rangos". No se puede reutilizar matchWholePhrase
// (exige que la cláusula ENTERA sea el nombre); aquí se busca el nombre de
// habilidad más largo que coincide con el INICIO de la cláusula, y opcionalmente
// un subtipo suyo justo a continuación entre paréntesis.
//
// Se ordenan los nombres por longitud descendente para que un nombre compuesto
// ("Trato con animales") no quede eclipsado por uno más corto que también
// encajara como prefijo.
export function buildSkillPrefixList(skills: SkillRef[]): SkillRef[] {
  return [...skills].sort((a, b) => b.name_es.length - a.name_es.length)
}

function matchSkillAtStart(text: string, skillsByLengthDesc: SkillRef[]): { skill: SkillRef; length: number } | null {
  const lower = text.toLowerCase()
  for (const skill of skillsByLengthDesc) {
    const name = skill.name_es.toLowerCase()
    if (!lower.startsWith(name)) continue
    const nextChar = text[name.length]
    if (nextChar === undefined || nextChar === ' ' || nextChar === '(') {
      return { skill, length: name.length }
    }
  }
  return null
}

// Reparte un segmento de texto SIN dote asociada (ya descartado como
// prerrequisito de otra dote) en sub-segmentos que enlazan la mención de una
// habilidad y, si el paréntesis que la sigue coincide con uno de sus subtipos
// reales, también el subtipo por separado (ej. el "(planos)" de "Saber
// (planos)" enlaza directo al subtipo Planos, no solo a Saber en general).
export function linkSkillMention(
  text: string,
  skillsByLengthDesc: SkillRef[],
  subtypesBySkillId: Map<string, SkillSubtypeRef[]>
): PrerequisiteSegment[] {
  const match = matchSkillAtStart(text, skillsByLengthDesc)
  if (!match) return [{ text }]

  const { skill, length } = match
  const skillSegment: PrerequisiteSegment = { text: text.slice(0, length), skill }
  const rest = text.slice(length)

  const parenMatch = rest.match(/^(\s*)\(([^)]+)\)/)
  if (parenMatch) {
    const subtype = (subtypesBySkillId.get(skill.id) ?? [])
      .find((s) => s.name_es.toLowerCase() === parenMatch[2].trim().toLowerCase())
    if (subtype) {
      const afterParen = rest.slice(parenMatch[0].length)
      return [
        skillSegment,
        { text: parenMatch[1] },
        { text: `(${parenMatch[2]})`, skillSubtype: subtype },
        { text: afterParen },
      ].filter((s) => s.text !== '' || s.skill || s.skillSubtype)
    }
  }

  return [skillSegment, { text: rest }].filter((s) => s.text !== '' || s.skill)
}
