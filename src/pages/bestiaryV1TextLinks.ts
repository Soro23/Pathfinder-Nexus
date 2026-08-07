// ── Enlaces de texto libre en la ficha de criatura (schema v1) ──────────────
// v1.creatures no tiene relación estructurada entre una criatura y sus dotes,
// habilidades o conjuros — statistics.dotes/statistics.habilidades y las
// entradas de frecuencia de offense (constante/a_voluntad/N_dia/N_semana/
// N_mes) son texto libre. Igual que featsV1PrerequisiteLinks.ts infiere el
// vínculo dote→dote comparando texto, estas utilidades infieren
// dote/habilidad/conjuro mencionados comparando contra v1.feats/v1.skills/
// v1.spells. Es best-effort: solo detecta coincidencias de nombre completo
// (dotes) o de prefijo (habilidades, conjuros), así que variantes de
// redacción no van a enlazar.
//
// El listado de conjuros trae peculiaridades propias que exigen su propio
// analizador (no se puede reutilizar parsePrerequisiteLinks tal cual):
// - Empieza con un guion largo introductorio ("—proyección astral, ...").
// - Algunas entradas (conjuros de dominio) llevan una "D" pegada sin espacio
//   justo después del nombre (ej. "disfrazarseD").
// - Puede haber comas DENTRO de un paréntesis (ej. "convocar (nivel 6, 1d4+2
//   leones o tigres, o ...)") — dividir por comas a ciegas rompería esa
//   entrada en fragmentos falsos, así que la división respeta la profundidad
//   de paréntesis.

import { supabase } from '../lib/supabase'
import { linkSkillMention, type PrerequisiteSegment, type SkillRef, type SkillSubtypeRef } from './featsV1PrerequisiteLinks'

export interface SpellRef {
  id: string
  name_es: string
}

export function buildSpellPrefixList(spells: SpellRef[]): SpellRef[] {
  return [...spells].sort((a, b) => b.name_es.length - a.name_es.length)
}

// Fetch paginado genérico de un índice global {id, name_es} — usado tanto
// para v1.feats (3270 filas) como v1.spells (2670 filas): demasiadas para
// traer en el select de una sola criatura, pero baratas de cargar una vez
// por página y reutilizar en todos los enlaces que se abran después.
export async function fetchAllNameRefs(table: string): Promise<SpellRef[]> {
  const PAGE_SIZE = 1000
  const rows: SpellRef[] = []
  let offset = 0
  while (true) {
    const { data, error } = await supabase
      .schema('v1')
      .from(table)
      .select('id, name_es')
      .order('name_es')
      .order('id')
      .range(offset, offset + PAGE_SIZE - 1)
    if (error || !data || data.length === 0) break
    rows.push(...(data as unknown as SpellRef[]))
    if (data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }
  return rows
}

// Divide `text` por `separator` sin cruzar paréntesis abiertos — ej.
// "mordisco +21, convocar (nivel 6, 1d4+2 leones)" → ["mordisco +21",
// " convocar (nivel 6, 1d4+2 leones)"], no tres fragmentos.
export function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const char of text) {
    if (char === '(') depth++
    else if (char === ')') depth = Math.max(0, depth - 1)
    if (depth === 0 && char === separator) {
      parts.push(current)
      current = ''
    } else {
      current += char
    }
  }
  parts.push(current)
  return parts
}

function matchSpellAtStart(text: string, spellsByLengthDesc: SpellRef[]): { spell: SpellRef; length: number } | null {
  const lower = text.toLowerCase()
  for (const spell of spellsByLengthDesc) {
    const name = spell.name_es.toLowerCase()
    if (!lower.startsWith(name)) continue
    const end = name.length
    const nextChar = text[end]
    if (nextChar === undefined || nextChar === ' ' || nextChar === '(') {
      return { spell, length: end }
    }
    // Marcador de conjuro de dominio pegado sin espacio (ej. "disfrazarseD").
    const afterMarker = text[end + 1]
    if (/[A-ZÁÉÍÓÚÑ]/.test(nextChar) && (afterMarker === undefined || afterMarker === ' ' || afterMarker === '(')) {
      return { spell, length: end + 1 }
    }
  }
  return null
}

function linkSpellClause(clause: string, spellsByLengthDesc: SpellRef[]): PrerequisiteSegment[] {
  const leading = clause.match(/^\s*/)?.[0] ?? ''
  const rest = clause.slice(leading.length)
  const match = matchSpellAtStart(rest, spellsByLengthDesc)
  if (!match) return leading ? [{ text: leading }, { text: rest }].filter((s) => s.text !== '') : [{ text: clause }]

  const segments: PrerequisiteSegment[] = []
  if (leading) segments.push({ text: leading })
  segments.push({ text: rest.slice(0, match.length), spell: match.spell })
  const remainder = rest.slice(match.length)
  if (remainder) segments.push({ text: remainder })
  return segments
}

// Enlaza las menciones de conjuro dentro de una entrada de frecuencia de
// offense (ej. "—dominar monstruo (CD 23)" o "—excursión etérea, acelerar
// (solo a uno mismo), convocar (nivel 6, ...)").
export function linkSpellMentions(rawText: string, spellsByLengthDesc: SpellRef[]): PrerequisiteSegment[] {
  if (!rawText) return []

  const dashMatch = rawText.match(/^[\s—–-]+/)
  const prefix = dashMatch ? dashMatch[0] : ''
  const body = rawText.slice(prefix.length)

  const segments: PrerequisiteSegment[] = []
  if (prefix) segments.push({ text: prefix })

  splitTopLevel(body, ',').forEach((clause, i) => {
    if (i > 0) segments.push({ text: ',' })
    segments.push(...linkSpellClause(clause, spellsByLengthDesc))
  })

  return segments
}

// Enlaza las menciones de habilidad dentro de statistics.habilidades (ej.
// "Percepción +8, Sigilo +6 (+14 Sigilo cuando ...), Saber (arcano) +14") —
// una lista separada por comas de "Habilidad +bono (nota)", a diferencia de
// un prerrequisito de dote (una sola mención por cláusula). Reutiliza
// linkSkillMention por cláusula en vez de reescribir el matching.
export function linkSkillListMentions(
  text: string,
  skillsByLengthDesc: SkillRef[],
  subtypesBySkillId: Map<string, SkillSubtypeRef[]>
): PrerequisiteSegment[] {
  if (!text) return []

  const segments: PrerequisiteSegment[] = []
  splitTopLevel(text, ',').forEach((clause, i) => {
    if (i > 0) segments.push({ text: ',' })
    const leading = clause.match(/^\s*/)?.[0] ?? ''
    const core = clause.slice(leading.length)
    if (leading) segments.push({ text: leading })
    if (core) segments.push(...linkSkillMention(core, skillsByLengthDesc, subtypesBySkillId))
  })
  return segments
}
