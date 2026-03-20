/**
 * Downloads all Pathfinder spell data from the PSRD-Data GitHub repo
 * (https://github.com/devonjones/PSRD-Data) and generates a SQL seed file.
 *
 * Run:  npx tsx scripts/import-psrd-spells.ts > scripts/spells-seed-full.sql
 */

import { writeFileSync } from 'fs'

const GITHUB_API = 'https://api.github.com/repos/devonjones/PSRD-Data/contents/pathfinder/core_rulebook'
const RAW_BASE    = 'https://raw.githubusercontent.com/devonjones/PSRD-Data/master'

// Known spell file paths in the PSRD-Data repo (spells are under multiple books)
const SPELL_DIRS = [
  'pathfinder/core_rulebook/spell',
  'pathfinder/advanced_players_guide/spell',
  'pathfinder/ultimate_magic/spell',
  'pathfinder/ultimate_combat/spell',
  'pathfinder/advanced_race_guide/spell',
  'pathfinder/advanced_class_guide/spell',
  'pathfinder/occult_adventures/spell',
  'pathfinder/horror_adventures/spell',
  'pathfinder/ultimate_wilderness/spell',
  'pathfinder/ultimate_intrigue/spell',
]

type PSRDSpell = {
  name: string
  school?: { name?: string; subschool?: string; descriptor?: string[] }
  casting_time?: string
  range?: string
  area?: string
  effect?: string
  targets?: string
  duration?: string
  saving_throw?: string
  spell_resistance?: string
  description?: string
  description_formated?: string
  spell_lists?: { name: string; level: number }[]
  type?: string
  subtype?: string[]
  body?: { sections?: { body?: string; name?: string }[] }
}

function slugify(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function escape(s: string | undefined | null): string {
  if (s == null) return 'NULL'
  return `'${String(s).replace(/'/g, "''")}'`
}

function escapeJson(o: unknown): string {
  if (o == null) return 'NULL'
  return `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`
}

async function listFiles(dir: string): Promise<string[]> {
  const url = `https://api.github.com/repos/devonjones/PSRD-Data/contents/${dir}`
  const res = await fetch(url, { headers: { 'User-Agent': 'pathfinder-nexus-importer' } })
  if (!res.ok) {
    process.stderr.write(`  Warning: could not list ${dir}: ${res.status}\n`)
    return []
  }
  const items = await res.json() as { name: string; type: string }[]
  return items
    .filter(i => i.type === 'file' && i.name.endsWith('.json'))
    .map(i => `${dir}/${i.name}`)
}

async function fetchJson(path: string): Promise<PSRDSpell | null> {
  const url = `${RAW_BASE}/${path}`
  const res = await fetch(url, { headers: { 'User-Agent': 'pathfinder-nexus-importer' } })
  if (!res.ok) return null
  try { return await res.json() } catch { return null }
}

function convertSpell(raw: PSRDSpell): Record<string, unknown> | null {
  if (!raw.name) return null

  // Parse spell lists → classLists map + minimum level
  const classLists: Record<string, number> = {}
  if (raw.spell_lists) {
    for (const entry of raw.spell_lists) {
      const cls = entry.name.toLowerCase().replace(/\s+/g, '_')
      classLists[cls] = entry.level
    }
  }
  const levels = Object.values(classLists)
  const level = levels.length > 0 ? Math.min(...levels) : 0

  // Type: divine or arcane
  const divineClasses = ['cleric', 'druid', 'paladin', 'ranger', 'inquisitor', 'oracle', 'shaman', 'warpriest', 'hunter']
  const hasDivine = Object.keys(classLists).some(c => divineClasses.some(d => c.includes(d)))
  const hasArcane = Object.keys(classLists).some(c => !divineClasses.some(d => c.includes(d)))
  const type = hasDivine && !hasArcane ? 'divine' : 'arcane'

  // Description — try multiple fields
  let description = raw.description ?? raw.description_formated ?? ''
  if (!description && raw.body?.sections) {
    description = raw.body.sections.map(s => s.body ?? '').join('\n\n')
  }
  // Strip HTML tags
  description = description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!description) description = 'No description available.'

  const school = raw.school?.name ?? 'Universal'
  const subschool = raw.school?.subschool ?? null
  const descriptor = raw.school?.descriptor?.join(', ') ?? null

  return {
    id: slugify(raw.name),
    name: raw.name,
    school,
    subschool,
    descriptor,
    level,
    type,
    class_lists: Object.keys(classLists).length > 0 ? classLists : null,
    casting_time: raw.casting_time ?? '1 standard action',
    range: raw.range ?? 'See text',
    target: raw.targets ?? null,
    area: raw.area ?? null,
    effect: raw.effect ?? null,
    duration: raw.duration ?? 'See text',
    saving_throw: raw.saving_throw ?? null,
    spell_resistance: raw.spell_resistance ?? null,
    description,
    material: null,
    arcane_focus: null,
    divine_focus: null,
    costly_components: null,
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

process.stderr.write('Fetching spell file lists from PSRD-Data...\n')

const allFiles: string[] = []
for (const dir of SPELL_DIRS) {
  process.stderr.write(`  Listing ${dir}...\n`)
  const files = await listFiles(dir)
  process.stderr.write(`    ${files.length} files\n`)
  allFiles.push(...files)
}

process.stderr.write(`\nTotal spell files found: ${allFiles.length}\n`)
process.stderr.write('Fetching and converting spells...\n')

const spells: Record<string, unknown>[] = []
const seen = new Set<string>()

for (let i = 0; i < allFiles.length; i++) {
  const file = allFiles[i]
  if (i % 50 === 0) process.stderr.write(`  ${i}/${allFiles.length}...\n`)

  const raw = await fetchJson(file)
  if (!raw) continue

  const spell = convertSpell(raw)
  if (!spell) continue

  const id = spell.id as string
  if (seen.has(id)) continue  // skip duplicates (same spell in multiple books)
  seen.add(id)
  spells.push(spell)
}

process.stderr.write(`\nConverted ${spells.length} unique spells.\n`)
process.stderr.write('Generating SQL...\n')

// Write SQL
const lines: string[] = []
lines.push('-- Auto-generated full Pathfinder spell seed from PSRD-Data.')
lines.push(`-- Generated: ${new Date().toISOString()}`)
lines.push(`-- Total spells: ${spells.length}`)
lines.push('')
lines.push('INSERT INTO spells (id, name, school, subschool, descriptor, level, type, class_lists, casting_time, range, target, area, effect, duration, saving_throw, spell_resistance, description, material, arcane_focus, divine_focus, costly_components)')
lines.push('VALUES')

spells.forEach((s, i) => {
  const vals = [
    escape(s.id as string),
    escape(s.name as string),
    escape(s.school as string),
    escape(s.subschool as string),
    escape(s.descriptor as string),
    s.level,
    escape(s.type as string),
    escapeJson(s.class_lists),
    escape(s.casting_time as string),
    escape(s.range as string),
    escape(s.target as string),
    escape(s.area as string),
    escape(s.effect as string),
    escape(s.duration as string),
    escape(s.saving_throw as string),
    escape(s.spell_resistance as string),
    escape(s.description as string),
    'NULL', // material
    'NULL', // arcane_focus
    'NULL', // divine_focus
    'NULL', // costly_components
  ]
  const comma = i < spells.length - 1 ? ',' : ''
  lines.push(`  (${vals.join(', ')})${comma}`)
})

lines.push('ON CONFLICT (id) DO UPDATE SET')
lines.push('  name = EXCLUDED.name,')
lines.push('  school = EXCLUDED.school,')
lines.push('  subschool = EXCLUDED.subschool,')
lines.push('  descriptor = EXCLUDED.descriptor,')
lines.push('  level = EXCLUDED.level,')
lines.push('  type = EXCLUDED.type,')
lines.push('  class_lists = EXCLUDED.class_lists,')
lines.push('  casting_time = EXCLUDED.casting_time,')
lines.push('  range = EXCLUDED.range,')
lines.push('  target = EXCLUDED.target,')
lines.push('  area = EXCLUDED.area,')
lines.push('  effect = EXCLUDED.effect,')
lines.push('  duration = EXCLUDED.duration,')
lines.push('  saving_throw = EXCLUDED.saving_throw,')
lines.push('  spell_resistance = EXCLUDED.spell_resistance,')
lines.push('  description = EXCLUDED.description;')

const sql = lines.join('\n')
writeFileSync('scripts/spells-seed-full.sql', sql, 'utf8')
process.stderr.write(`SQL written to scripts/spells-seed-full.sql (${Math.round(sql.length / 1024)} KB)\n`)
