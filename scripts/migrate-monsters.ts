/**
 * Migrates all monsters from src/data/monsters.ts into Supabase table `monsters`.
 *
 * Run: npx tsx scripts/migrate-monsters.ts
 */

import { createClient } from '@supabase/supabase-js'
import { MONSTERS } from '../src/data/monsters.js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Map camelCase Monster fields → snake_case DB columns
function mapMonster(m: typeof MONSTERS[0]) {
  return {
    id: m.id,
    name: m.name,
    cr: m.cr,
    xp: m.xp,
    alignment: m.alignment,
    size: m.size,
    type: m.type,
    subtype: m.subtype ?? null,
    init: m.init,
    senses: m.senses ?? null,
    aura: m.aura ?? null,
    ac: m.ac,
    ac_notes: m.acNotes ?? null,
    hp: m.hp,
    hp_notes: m.hpNotes ?? null,
    fort: m.fort,
    ref: m.ref,
    will: m.will,
    defensive_abilities: m.defensiveAbilities ?? null,
    dr: m.dr ?? null,
    immune: m.immune ?? null,
    resist: m.resist ?? null,
    speed: m.speed ?? null,
    melee: m.melee ?? null,
    ranged: m.ranged ?? null,
    space: m.space ?? null,
    reach: m.reach ?? null,
    special_attacks: m.specialAttacks ?? null,
    spell_like_abilities: m.spellLikeAbilities ?? null,
    str: m.str,
    dex: m.dex,
    con: m.con,
    int: m.int,
    wis: m.wis,
    cha: m.cha,
    base_atk: m.baseAtk,
    cmb: m.cmb,
    cmd: m.cmd,
    feats: m.feats ?? null,
    skills: m.skills ?? null,
    languages: m.languages ?? null,
    sq: m.sq ?? null,
    environment: m.environment ?? null,
    organization: m.organization ?? null,
    treasure: m.treasure ?? null,
    description: m.description ?? null,
    source: m.source ?? null,
    special_abilities: m.specialAbilities ?? null,
  }
}

async function migrate() {
  // Get unique monsters by ID
  const uniqueMonsters = MONSTERS.filter(
    (m, index, self) => self.findIndex(x => x.id === m.id) === index
  )
  console.log(`Total: ${MONSTERS.length}, Unique: ${uniqueMonsters.length}`)

  const BATCH_SIZE = 100
  let inserted = 0

  for (let i = 0; i < uniqueMonsters.length; i += BATCH_SIZE) {
    const batch = uniqueMonsters.slice(i, i + BATCH_SIZE).map(mapMonster)
    const { error } = await supabase.from('monsters').upsert(batch, { onConflict: 'id' })

    if (error) {
      console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message)
      continue
    }

    inserted += batch.length
    console.log(`Inserted ${inserted}/${uniqueMonsters.length}`)
  }

  console.log(`Done! ${inserted} monsters migrated.`)
}

migrate().catch(console.error)