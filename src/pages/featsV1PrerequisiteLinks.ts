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

export interface PrerequisiteSegment {
  text: string
  feat?: FeatRef
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

export function parsePrerequisiteLinks(text: string, index: Map<string, FeatRef>): PrerequisiteSegment[] {
  if (!text) return []

  const segments: PrerequisiteSegment[] = []

  for (const part of text.split(/([,;])/)) {
    if (part === ',' || part === ';') {
      segments.push({ text: part + ' ' })
      continue
    }

    const trimmed = part.trim()
    if (!trimmed) continue

    const withoutTrailingDot = trimmed.replace(/\.$/, '')
    const hasTrailingDot = withoutTrailingDot.length !== trimmed.length
    const match = index.get(normalizeFeatName(withoutTrailingDot))

    if (match) {
      segments.push({ text: withoutTrailingDot, feat: match })
      if (hasTrailingDot) segments.push({ text: '.' })
    } else {
      segments.push({ text: trimmed })
    }
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
