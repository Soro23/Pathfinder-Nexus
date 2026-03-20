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

// ── Shared slug helper ────────────────────────────────────────────────────────

export function makeSlug(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

// ── Skill Parser ─────────────────────────────────────────────────────────────

const ABILITY_ABBR_MAP: Record<string, string> = {
  str: 'strength', dex: 'dexterity', con: 'constitution',
  int: 'intelligence', wis: 'wisdom', cha: 'charisma',
}

export function parseD20SkillPage(html: string): Record<string, unknown> {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Title: "Acrobatics (Dex; Armor Check Penalty)" or "Climb (Str)"
  const nameEl = doc.querySelector('h1.page-title') ?? doc.querySelector('h1')
  const fullTitle = nameEl?.textContent?.trim() ?? ''
  const name = fullTitle.split('(')[0].trim()

  const abilityMatch = fullTitle.match(/\(\s*([A-Za-z]+)/)
  const ability = ABILITY_ABBR_MAP[abilityMatch?.[1]?.toLowerCase() ?? ''] ?? 'strength'
  const has_armor_check_penalty = /armor check penalty/i.test(fullTitle)

  // Description: first substantive paragraphs in main content
  const main = doc.querySelector('main, #article-content, .article-content, .entry-content')
  const paras = main
    ? Array.from(main.querySelectorAll('p'))
        .map(p => p.textContent?.trim() ?? '')
        .filter(t => t.length > 20)
        .slice(0, 4)
    : []
  const description = (paras.join('\n\n') || name).substring(0, 2000)

  return { id: makeSlug(name), name, ability, is_class_skill: false, has_armor_check_penalty, description }
}

// ── Feat Parser ───────────────────────────────────────────────────────────────

const FEAT_TYPE_MAP: Record<string, string> = {
  'combat': 'combat', 'general': 'general', 'metamagic': 'metamagic',
  'item creation': 'item_creation', 'teamwork': 'teamwork',
  'critical': 'critical', 'style': 'style',
}

export function parseD20FeatPage(html: string): Record<string, unknown> {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Title: "Power Attack (Combat)" — type is last parenthesised token
  const nameEl = doc.querySelector('h1.page-title') ?? doc.querySelector('h1')
  const fullTitle = nameEl?.textContent?.trim() ?? ''
  const typeMatch = fullTitle.match(/\(([^)]+)\)\s*$/)
  const typeRaw = typeMatch?.[1]?.toLowerCase() ?? ''
  const type = FEAT_TYPE_MAP[typeRaw] ?? 'general'
  const name = fullTitle.replace(/\s*\([^)]+\)\s*$/, '').trim()

  // Bold labels — d20pfsrd uses <b>Prerequisites:</b> inline in paragraphs
  const prerequisite = textAfterBold(doc, 'Prerequisites') || textAfterBold(doc, 'Prerequisite') || null
  const benefit = textAfterBold(doc, 'Benefit') || ''
  const normal = textAfterBold(doc, 'Normal') || null
  const special = textAfterBold(doc, 'Special') || null

  return { id: makeSlug(name), name, type, prerequisite, benefit, normal, special, effects: null }
}

// ── Class Parser ──────────────────────────────────────────────────────────────

function parseClassProgression(doc: Document): {
  base_attack_bonus: 'good' | 'medium' | 'poor'
  fortitude_save: 'good' | 'poor'
  reflex_save: 'good' | 'poor'
  will_save: 'good' | 'poor'
} {
  const defaults = { base_attack_bonus: 'medium' as const, fortitude_save: 'poor' as const, reflex_save: 'poor' as const, will_save: 'poor' as const }

  // Find progression table by looking for BAB + save columns
  const tables = Array.from(doc.querySelectorAll('table'))
  const progTable = tables.find(t => {
    const text = t.textContent?.toLowerCase() ?? ''
    return text.includes('attack') && text.includes('fort') && text.includes('ref')
  })
  if (!progTable) return defaults

  // Map header positions
  const headerCells = Array.from(progTable.querySelectorAll('tr:first-child th, thead tr:first-child th'))
    .map(th => th.textContent?.trim().toLowerCase() ?? '')
  const babIdx = headerCells.findIndex(h => h.includes('attack') || h === 'bab')
  const fortIdx = headerCells.findIndex(h => h.includes('fort'))
  const refIdx = headerCells.findIndex(h => h.includes('ref'))
  const willIdx = headerCells.findIndex(h => h.includes('will'))
  if (babIdx < 0 || fortIdx < 0) return defaults

  // Get level-1 row
  const dataRows = Array.from(progTable.querySelectorAll('tbody tr, tr')).filter(r => r.querySelectorAll('td').length > 0)
  const lv1Row = dataRows.find(r => /^1st$|^1$/.test(Array.from(r.querySelectorAll('td'))[0]?.textContent?.trim() ?? ''))
  if (!lv1Row) return defaults

  const cells = Array.from(lv1Row.querySelectorAll('td'))
  const val = (idx: number) => parseInt(cells[idx]?.textContent?.trim().replace(/[^0-9-]/g, '') ?? '0') || 0

  const bab1 = val(babIdx)
  let bab_progression: 'good' | 'medium' | 'poor'
  if (bab1 >= 1) {
    bab_progression = 'good'
  } else {
    // Distinguish medium vs poor using level-5 row
    const lv5Row = dataRows.find(r => /^5th$|^5$/.test(Array.from(r.querySelectorAll('td'))[0]?.textContent?.trim() ?? ''))
    const bab5 = lv5Row ? parseInt(Array.from(lv5Row.querySelectorAll('td'))[babIdx]?.textContent?.trim().replace(/[^0-9]/g, '') ?? '0') || 0 : 0
    bab_progression = bab5 >= 4 ? 'medium' : 'poor'
  }

  return {
    base_attack_bonus: bab_progression,
    fortitude_save: val(fortIdx) >= 2 ? 'good' : 'poor',
    reflex_save: refIdx >= 0 ? (val(refIdx) >= 2 ? 'good' : 'poor') : 'poor',
    will_save: willIdx >= 0 ? (val(willIdx) >= 2 ? 'good' : 'poor') : 'poor',
  }
}

export function parseD20ClassPage(html: string): Record<string, unknown> {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const nameEl = doc.querySelector('h1.page-title') ?? doc.querySelector('h1')
  const name = nameEl?.textContent?.trim() ?? ''

  // Stat lines: bold labels inline in paragraphs
  const hitDieRaw = textAfterBold(doc, 'Hit Die')
  const hitDieMatch = hitDieRaw.match(/d(\d+)/)
  const hit_die = hitDieMatch ? parseInt(hitDieMatch[1]) : 8

  const wealthRaw = textAfterBold(doc, 'Starting Wealth')
  const goldMatch = wealthRaw.match(/(\d+d\d+)\s*[×x\u00d7]\s*(\d+)/)
  const starting_gold_dice = goldMatch ? `${goldMatch[1]}×${goldMatch[2]}` : '3d6×10'

  const spRaw = textAfterBold(doc, 'Skill Ranks per Level')
    || textAfterBold(doc, 'Skill Ranks Per Level')
    || textAfterBold(doc, 'Skill Ranks at Each Additional Level')
    || textAfterBold(doc, 'Skill Points at Each Additional Level')
  const spMatch = spRaw.match(/(\d+)/)
  const skill_points_per_level = spMatch ? parseInt(spMatch[1]) : 2

  // BAB/saves from progression table
  const progression = parseClassProgression(doc)

  // Description: first non-empty paragraphs in main content
  const main = doc.querySelector('main, #article-content, .article-content, .entry-content')
  const description = main
    ? Array.from(main.querySelectorAll('p'))
        .map(p => p.textContent?.trim() ?? '')
        .filter(t => t.length > 30)
        .slice(0, 3)
        .join('\n\n')
    : name

  // Class skills: under <h3>Class Skills</h3>, skills are linked in a paragraph
  const classSkills: string[] = []
  const headings = Array.from(doc.querySelectorAll('h2, h3, h4'))
  const csHeading = headings.find(el => /class skills/i.test(el.textContent ?? ''))
  if (csHeading) {
    let el: Element | null = csHeading.nextElementSibling
    while (el) {
      if (/^h[2-4]$/.test(el.tagName.toLowerCase())) break
      const links = Array.from(el.querySelectorAll('a'))
      if (links.length >= 2) {
        links.forEach(a => { const t = a.textContent?.trim(); if (t) classSkills.push(t) })
        break
      }
      el = el.nextElementSibling
    }
  }

  return {
    id: makeSlug(name), name, hit_die, ...progression,
    skill_points_per_level, magic_type: null, caster_ability: null,
    starting_gold_dice, description: description || name,
    class_skills: classSkills, features: [], alignment: [], spells_per_day: null,
  }
}

// ── Race Parser ───────────────────────────────────────────────────────────────

export function parseD20RacePage(html: string): Record<string, unknown> {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const nameEl = doc.querySelector('h1.page-title') ?? doc.querySelector('h1')
  const label = nameEl?.textContent?.trim() ?? ''

  // Standard Racial Traits section: <h3> then <ul>/<li> with <strong> trait names
  const headings = Array.from(doc.querySelectorAll('h2, h3'))
  const traitsH = headings.find(el => /standard racial traits/i.test(el.textContent ?? ''))

  let size: 'small' | 'medium' = 'medium'
  let speed = 30
  const bonuses: Record<string, number> = {}
  const traits: Array<{ name: string; description: string }> = []

  if (traitsH) {
    let el: Element | null = traitsH.nextElementSibling
    while (el && !/^h[2-3]$/.test(el.tagName.toLowerCase())) {
      const items = el.tagName === 'UL'
        ? Array.from(el.querySelectorAll('li'))
        : [el]
      for (const item of items) {
        const bold = item.querySelector('b, strong')
        const traitName = bold?.textContent?.trim().replace(/:$/, '') ?? ''
        const fullText = item.textContent?.trim() ?? ''
        const traitDesc = fullText.replace(bold?.textContent ?? '', '').replace(/^[\s:]+/, '').trim()

        if (traitName) traits.push({ name: traitName, description: traitDesc })

        // Size: "Medium creatures" or "Small creatures"
        if (/size/i.test(traitName)) {
          if (/small/i.test(fullText)) size = 'small'
          else if (/medium/i.test(fullText)) size = 'medium'
        }
        // Speed: "base speed of 20 feet" or "speed of 30 feet"
        if (/speed/i.test(traitName) || /speed/i.test(fullText.slice(0, 60))) {
          const m = fullText.match(/(\d+)\s*feet/)
          if (m) speed = parseInt(m[1])
        }
        // Ability bonuses: "+2 Constitution, +2 Wisdom, –2 Charisma"
        if (/ability score/i.test(traitName)) {
          const re = /([+\-\u2013]\d+)\s+(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)/gi
          let m: RegExpExecArray | null
          while ((m = re.exec(fullText)) !== null) {
            bonuses[m[2].toLowerCase()] = parseInt(m[1].replace('\u2013', '-'))
          }
        }
      }
      el = el.nextElementSibling
    }
  }

  const bonus_desc = Object.entries(bonuses)
    .map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${k[0].toUpperCase() + k.slice(1)}`)
    .join(', ') || 'None'

  const main = doc.querySelector('main, #article-content, .article-content, .entry-content')
  const desc = main
    ? Array.from(main.querySelectorAll('p'))
        .map(p => p.textContent?.trim() ?? '')
        .filter(t => t.length > 30)
        .slice(0, 3)
        .join('\n\n')
    : label

  return { id: makeSlug(label), label, size, speed, bonus_desc, favored_class: null, desc: desc || label, bonuses, traits, subraces: null }
}
