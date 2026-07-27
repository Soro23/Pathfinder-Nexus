/**
 * Los conjuros vienen de Supabase con `name`/`description` traducidos (columnas
 * `name_es`/`description_es`, ver `pickLocalized`), pero el esquema no tiene columnas
 * `_es` para tiempo de lanzamiento, alcance, duración, salvación o RC — esos campos
 * llegan siempre en inglés. Esto traduce el vocabulario estándar de la SRD por
 * sustitución de palabras/frases; términos no reconocidos quedan tal cual.
 */

type Rule = [RegExp, string]

const UNIT_RULES: Rule[] = [
  [/\bstandard action\b/gi, 'acción estándar'],
  [/\bmove action\b/gi, 'acción de movimiento'],
  [/\bswift action\b/gi, 'acción veloz'],
  [/\bimmediate action\b/gi, 'acción inmediata'],
  [/\bfull-round action\b/gi, 'ronda completa'],
  [/\bfree action\b/gi, 'acción libre'],
  [/\brounds\b/gi, 'asaltos'],
  [/\bround\b/gi, 'asalto'],
  [/\bminutes\b/gi, 'minutos'],
  [/\bminute\b/gi, 'minuto'],
  [/\bhours\b/gi, 'horas'],
  [/\bhour\b/gi, 'hora'],
  [/\bdays\b/gi, 'días'],
  [/\bday\b/gi, 'día'],
  [/\bweeks\b/gi, 'semanas'],
  [/\bweek\b/gi, 'semana'],
  [/\byears\b/gi, 'años'],
  [/\byear\b/gi, 'año'],
  [/\blevels\b/gi, 'niveles'],
  [/\blevel\b/gi, 'nivel'],
  [/\bft\./gi, 'pies'],
  [/\bfeet\b/gi, 'pies'],
  [/\bor more\b/gi, 'o más'],
  [/\bplus\b/gi, 'más'],
]

const RANGE_RULES: Rule[] = [
  [/^personal$/i, 'Personal'],
  [/^touch$/i, 'Toque'],
  [/^close\b/i, 'Corta'],
  [/^medium\b/i, 'Media'],
  [/^long\b/i, 'Larga'],
  [/^unlimited$/i, 'Ilimitado'],
  [/^see text$/i, 'Ver texto'],
]

const DURATION_RULES: Rule[] = [
  [/\binstantaneous\b/gi, 'Instantáneo'],
  [/\bpermanent\b/gi, 'Permanente'],
  [/\bconcentration\b/gi, 'Concentración'],
  [/\buntil discharged\b/gi, 'hasta descargarse'],
  [/\buntil triggered\b/gi, 'hasta activarse'],
  [/\bdismissible\b/gi, 'descartable'],
  [/\bsee text\b/gi, 'ver texto'],
]

const SAVE_RULES: Rule[] = [
  [/\bwill negates\b/gi, 'Voluntad niega'],
  [/\bwill half\b/gi, 'Voluntad mitad'],
  [/\breflex negates\b/gi, 'Reflejos niega'],
  [/\breflex half\b/gi, 'Reflejos mitad'],
  [/\bfortitude negates\b/gi, 'Fortaleza niega'],
  [/\bfortitude half\b/gi, 'Fortaleza mitad'],
  [/\bharmless\b/gi, 'inofensivo'],
  [/\bobject\b/gi, 'objeto'],
  [/^none$/i, 'Ninguna'],
  [/\bsee text\b/gi, 'ver texto'],
]

const RESISTANCE_RULES: Rule[] = [
  [/^yes$/i, 'Sí'],
  [/^no$/i, 'No'],
  [/\bharmless\b/gi, 'inofensivo'],
  [/\bobject\b/gi, 'objeto'],
  [/^see text$/i, 'Ver texto'],
]

const SCHOOL_RULES: Rule[] = [
  [/\babjuration\b/gi, 'Abjuración'],
  [/\bconjuration\b/gi, 'Conjuración'],
  [/\bdivination\b/gi, 'Adivinación'],
  [/\benchantment\b/gi, 'Encantamiento'],
  [/\bevocation\b/gi, 'Evocación'],
  [/\billusion\b/gi, 'Ilusión'],
  [/\bnecromancy\b/gi, 'Nigromancia'],
  [/\btransmutation\b/gi, 'Transmutación'],
  [/\buniversal\b/gi, 'Universal'],
  // Subescuelas
  [/\bcalling\b/gi, 'llamado'],
  [/\bcreation\b/gi, 'creación'],
  [/\bhealing\b/gi, 'curación'],
  [/\bsummoning\b/gi, 'convocación'],
  [/\bteleportation\b/gi, 'teleportación'],
  [/\bcharm\b/gi, 'encanto'],
  [/\bcompulsion\b/gi, 'compulsión'],
  [/\bfigment\b/gi, 'quimera'],
  [/\bglamer\b/gi, 'ensueño'],
  [/\bpattern\b/gi, 'patrón'],
  [/\bphantasm\b/gi, 'fantasma'],
  [/\bshadow\b/gi, 'sombra'],
  [/\bpolymorph\b/gi, 'polimorfia'],
]

const DESCRIPTOR_RULES: Rule[] = [
  [/\bacid\b/gi, 'ácido'],
  [/\bair\b/gi, 'aire'],
  [/\bchaotic\b/gi, 'caótico'],
  [/\bcold\b/gi, 'frío'],
  [/\bcurse\b/gi, 'maldición'],
  [/\bdarkness\b/gi, 'oscuridad'],
  [/\bdeath\b/gi, 'muerte'],
  [/\bdisease\b/gi, 'enfermedad'],
  [/\bearth\b/gi, 'tierra'],
  [/\belectricity\b/gi, 'electricidad'],
  [/\bemotion\b/gi, 'emoción'],
  [/\bevil\b/gi, 'malvado'],
  [/\bfear\b/gi, 'miedo'],
  [/\bfire\b/gi, 'fuego'],
  [/\bforce\b/gi, 'fuerza'],
  [/\bgood\b/gi, 'bueno'],
  [/\blanguage-dependent\b/gi, 'depende del idioma'],
  [/\blawful\b/gi, 'legal'],
  [/\blight\b/gi, 'luz'],
  [/\bmind-affecting\b/gi, 'afecta a la mente'],
  [/\bpain\b/gi, 'dolor'],
  [/\bpoison\b/gi, 'veneno'],
  [/\bsonic\b/gi, 'sónico'],
  [/\bwater\b/gi, 'agua'],
]

function applyRules(text: string, rules: Rule[]): string {
  return rules.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text)
}

/**
 * Para campos de texto libre (target, area, effect) que no tienen un vocabulario
 * cerrado — solo traduce unidades (pies, nivel, asalto...), el resto queda en inglés.
 */
export function translateUnits(text?: string): string {
  if (!text) return ''
  return applyRules(text, UNIT_RULES)
}

export function translateCastingTime(text?: string): string {
  if (!text) return ''
  return applyRules(text, UNIT_RULES)
}

export function translateRange(text?: string): string {
  if (!text) return ''
  return applyRules(applyRules(text, RANGE_RULES), UNIT_RULES)
}

export function translateDuration(text?: string): string {
  if (!text) return ''
  return applyRules(applyRules(text, DURATION_RULES), UNIT_RULES)
}

export function translateSavingThrow(text?: string): string {
  if (!text) return ''
  return applyRules(text, SAVE_RULES)
}

export function translateSpellResistance(text?: string): string {
  if (!text) return ''
  return applyRules(text, RESISTANCE_RULES)
}

export function translateSchool(text?: string): string {
  if (!text) return ''
  return applyRules(text, SCHOOL_RULES)
}

export function translateDescriptor(text?: string): string {
  if (!text) return ''
  return applyRules(text, DESCRIPTOR_RULES)
}
