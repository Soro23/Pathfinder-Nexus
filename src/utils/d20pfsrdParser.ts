import type { Spell, SpellLevel } from '../data/spells'

type ParsedSpell = Partial<Spell> & { rawName: string }

function textAfterBold(doc: Document, label: string): string {
  const bolds = Array.from(doc.querySelectorAll('b, strong'))
  const bold = bolds.find(b => b.textContent?.trim().toLowerCase() === label.toLowerCase())
  if (!bold) return ''
  // Walk next siblings collecting text until next <b>/<br> or end
  let result = ''
  let node: Node | null = bold.nextSibling
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      if (el.tagName === 'B' || el.tagName === 'STRONG') break
      if (el.tagName === 'BR') { result += ' '; node = node.nextSibling; continue }
      result += el.textContent ?? ''
    } else if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent ?? ''
    }
    node = node.nextSibling
  }
  return result.trim().replace(/^[:\s]+/, '')
}

function parseClassLevels(levelStr: string): Record<string, SpellLevel> {
  const result: Record<string, SpellLevel> = {}
  // e.g. "bard 1, sorcerer/wizard 3, cleric 2"
  const parts = levelStr.split(',')
  for (const part of parts) {
    const m = part.trim().match(/^(.+?)\s+(\d)$/)
    if (!m) continue
    const classNames = m[1].split('/').map(c => c.trim().toLowerCase())
    const lvl = parseInt(m[2], 10) as SpellLevel
    for (const cls of classNames) {
      result[cls] = lvl
    }
  }
  return result
}

export function parseD20SpellPage(html: string): ParsedSpell {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Name
  const nameEl = doc.querySelector('h1.page-title') ?? doc.querySelector('h1')
  const rawName = nameEl?.textContent?.trim() ?? 'Unknown'

  // School line — find text after <b>School</b>
  const schoolRaw = textAfterBold(doc, 'School')
  const schoolBase = schoolRaw.split(';')[0].split('[')[0].trim()
  const school = schoolBase.replace(/\(.*\)/, '').trim()
  const subschoolMatch = schoolBase.match(/\(([^)]+)\)/)
  const subschool = subschoolMatch?.[1]?.trim()
  const descriptorMatch = schoolRaw.match(/\[([^\]]+)\]/)
  const descriptor = descriptorMatch?.[1]?.trim()

  // Level
  const levelRaw = textAfterBold(doc, 'Level')
  const classLists = parseClassLevels(levelRaw)
  const levelValues = Object.values(classLists)
  const level: SpellLevel = levelValues.length > 0
    ? (Math.min(...levelValues) as SpellLevel)
    : 0

  // Type
  const divineClasses = ['cleric', 'druid', 'paladin', 'ranger', 'inquisitor', 'oracle']
  const hasDivine = Object.keys(classLists).some(c => divineClasses.includes(c))
  const hasArcane = Object.keys(classLists).some(c => !divineClasses.includes(c))
  const type: 'arcane' | 'divine' = hasDivine && !hasArcane ? 'divine' : 'arcane'

  // Other fields
  const castingTime = textAfterBold(doc, 'Casting Time')
  const range = textAfterBold(doc, 'Range')
  const target = textAfterBold(doc, 'Target') || textAfterBold(doc, 'Targets') || undefined
  const area = textAfterBold(doc, 'Area') || undefined
  const effect = textAfterBold(doc, 'Effect') || undefined
  const duration = textAfterBold(doc, 'Duration')
  const savingThrow = textAfterBold(doc, 'Saving Throw') || undefined
  const spellResistance = textAfterBold(doc, 'Spell Resistance') || undefined

  // Description — look for DESCRIPTION heading then grab following paragraphs
  let description = ''
  const allEls = Array.from(doc.body.querySelectorAll('*'))
  const descHeading = allEls.find(el =>
    /^(h[2-6]|b|strong|p)$/i.test(el.tagName) &&
    /^\s*description\s*$/i.test(el.textContent ?? '')
  )
  if (descHeading) {
    let el: Element | null = descHeading.nextElementSibling
    const parts: string[] = []
    while (el && parts.length < 10) {
      const tag = el.tagName.toLowerCase()
      if (['h2', 'h3', 'h4'].includes(tag)) break
      const text = el.textContent?.trim()
      if (text) parts.push(text)
      el = el.nextElementSibling
    }
    description = parts.join('\n\n')
  }
  // Fallback: grab the largest text block in the main content
  if (!description) {
    const mainContent = doc.querySelector('#article-content, .article-content, main, .entry-content')
    description = mainContent?.textContent?.trim().slice(0, 2000) ?? ''
  }

  // ID from name
  const id = rawName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

  const spell: ParsedSpell = {
    rawName,
    id,
    name: rawName,
    school: school || 'Unknown',
    level,
    type,
    classLists: Object.keys(classLists).length > 0 ? classLists : undefined,
    castingTime: castingTime || '1 standard action',
    range: range || 'See text',
    duration: duration || 'See text',
    description: description || 'No description available.',
  }

  if (subschool) spell.subschool = subschool
  if (descriptor) spell.descriptor = descriptor
  if (target) spell.target = target
  if (area) spell.area = area
  if (effect) spell.effect = effect
  if (savingThrow) spell.savingThrow = savingThrow
  if (spellResistance) spell.spellResistance = spellResistance

  return spell
}
