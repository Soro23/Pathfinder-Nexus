/**
 * Generates a SQL file with INSERT statements for all spells.
 * Run:  npx tsx scripts/generate-sql.ts > scripts/spells-seed.sql
 */
import { SPELLS } from '../src/data/spells.js'

function escape(s: string | undefined | null): string {
  if (s == null) return 'NULL'
  return `'${s.replace(/'/g, "''")}'`
}

function escapeJson(o: unknown): string {
  if (o == null) return 'NULL'
  return `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`
}

console.log('-- Auto-generated spell seed. Run in Supabase SQL Editor.')
console.log('-- Generated:', new Date().toISOString())
console.log()
console.log('INSERT INTO spells (id, name, school, subschool, descriptor, level, type, class_lists, casting_time, range, target, area, effect, duration, saving_throw, spell_resistance, description, material, arcane_focus, divine_focus, costly_components)')
console.log('VALUES')

const lines = SPELLS.map((s, i) => {
  const vals = [
    escape(s.id),
    escape(s.name),
    escape(s.school),
    escape(s.subschool),
    escape(s.descriptor),
    s.level,
    escape(s.type),
    escapeJson(s.classLists),
    escape(s.castingTime),
    escape(s.range),
    escape(s.target),
    escape(s.area),
    escape(s.effect),
    escape(s.duration),
    escape(s.savingThrow),
    escape(s.spellResistance),
    escape(s.description),
    escape(s.material),
    escape(s.arcaneFocus),
    escape(s.divineFocus),
    escape(s.costlyComponents),
  ]
  const comma = i < SPELLS.length - 1 ? ',' : ''
  return `  (${vals.join(', ')})${comma}`
})

console.log(lines.join('\n'))
console.log('ON CONFLICT (id) DO UPDATE SET')
console.log('  name = EXCLUDED.name,')
console.log('  school = EXCLUDED.school,')
console.log('  subschool = EXCLUDED.subschool,')
console.log('  descriptor = EXCLUDED.descriptor,')
console.log('  level = EXCLUDED.level,')
console.log('  type = EXCLUDED.type,')
console.log('  class_lists = EXCLUDED.class_lists,')
console.log('  casting_time = EXCLUDED.casting_time,')
console.log('  range = EXCLUDED.range,')
console.log('  target = EXCLUDED.target,')
console.log('  area = EXCLUDED.area,')
console.log('  effect = EXCLUDED.effect,')
console.log('  duration = EXCLUDED.duration,')
console.log('  saving_throw = EXCLUDED.saving_throw,')
console.log('  spell_resistance = EXCLUDED.spell_resistance,')
console.log('  description = EXCLUDED.description,')
console.log('  material = EXCLUDED.material,')
console.log('  arcane_focus = EXCLUDED.arcane_focus,')
console.log('  divine_focus = EXCLUDED.divine_focus,')
console.log('  costly_components = EXCLUDED.costly_components;')
