/**
 * Migrates all static spells from src/data/spells.ts into Supabase table `spells`.
 *
 * Table schema expected:
 *   create table spells (
 *     id text primary key,
 *     name text not null,
 *     school text not null,
 *     subschool text,
 *     descriptor text,
 *     level smallint not null,
 *     type text not null,
 *     class_lists jsonb,
 *     casting_time text not null,
 *     range text not null,
 *     target text,
 *     area text,
 *     effect text,
 *     duration text not null,
 *     saving_throw text,
 *     spell_resistance text,
 *     description text not null,
 *     material text,
 *     arcane_focus text,
 *     divine_focus text,
 *     costly_components text
 *   );
 *
 * Run:  npx tsx scripts/migrate-spells.ts
 */

import { createClient } from '@supabase/supabase-js'
import { SPELLS } from '../src/data/spells.js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Map camelCase Spell fields → snake_case DB columns
const rows = SPELLS.map(s => ({
  id: s.id,
  name: s.name,
  school: s.school,
  subschool: s.subschool ?? null,
  descriptor: s.descriptor ?? null,
  level: s.level,
  type: s.type,
  class_lists: s.classLists ?? null,
  casting_time: s.castingTime,
  range: s.range,
  target: s.target ?? null,
  area: s.area ?? null,
  effect: s.effect ?? null,
  duration: s.duration,
  saving_throw: s.savingThrow ?? null,
  spell_resistance: s.spellResistance ?? null,
  description: s.description,
  material: s.material ?? null,
  arcane_focus: s.arcaneFocus ?? null,
  divine_focus: s.divineFocus ?? null,
  costly_components: s.costlyComponents ?? null,
}))

console.log(`Migrating ${rows.length} spells to Supabase...`)

// Upsert in batches of 100
const BATCH = 100
let inserted = 0
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const { error } = await supabase
    .from('spells')
    .upsert(batch, { onConflict: 'id' })

  if (error) {
    console.error(`Batch ${i / BATCH + 1} error:`, error.message)
    process.exit(1)
  }
  inserted += batch.length
  console.log(`  ${inserted}/${rows.length} spells upserted`)
}

console.log('Done!')
