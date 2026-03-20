/**
 * seed-srd.ts — Genera SQL de seed para Skills, Feats, Classes y Races.
 * Uso: npx tsx scripts/seed-srd.ts
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Imports de datos estáticos ─────────────────────────────────────────────
import { SKILLS } from '../src/data/skills.js'
import { FEATS } from '../src/data/feats.js'
import { CLASSES } from '../src/data/classes.js'
import { RACES } from '../src/data/races.js'

// ── Helpers ────────────────────────────────────────────────────────────────

function esc(s: string | null | undefined): string {
  if (s === null || s === undefined) return 'NULL'
  return `'${String(s).replace(/'/g, "''")}'`
}

function json(v: unknown): string {
  if (v === null || v === undefined) return 'NULL'
  return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`
}

function bool(v: boolean | undefined): string {
  return v ? 'true' : 'false'
}

function num(v: number | null | undefined): string {
  if (v === null || v === undefined) return 'NULL'
  return String(v)
}

// ── Skills ─────────────────────────────────────────────────────────────────

function generateSkillsSQL(): string {
  const lines: string[] = []
  lines.push('-- Skills seed')
  lines.push('INSERT INTO skills (id, name, ability, is_class_skill, has_armor_check_penalty, description)')
  lines.push('VALUES')
  const rows = SKILLS.map((s) =>
    `  (${esc(s.id)}, ${esc(s.name)}, ${esc(s.ability)}, ${bool(s.isClassSkill)}, ${bool(s.hasArmorCheckPenalty)}, ${esc(s.description)})`
  )
  lines.push(rows.join(',\n'))
  lines.push('ON CONFLICT (id) DO UPDATE SET')
  lines.push('  name = EXCLUDED.name,')
  lines.push('  ability = EXCLUDED.ability,')
  lines.push('  is_class_skill = EXCLUDED.is_class_skill,')
  lines.push('  has_armor_check_penalty = EXCLUDED.has_armor_check_penalty,')
  lines.push('  description = EXCLUDED.description;')
  return lines.join('\n')
}

// ── Feats ──────────────────────────────────────────────────────────────────

function generateFeatsSQL(): string {
  const lines: string[] = []
  lines.push('-- Feats seed')
  lines.push('INSERT INTO feats (id, name, type, prerequisite, benefit, normal, special, effects)')
  lines.push('VALUES')
  const rows = FEATS.map((f) => {
    const prereq = f.prerequisite !== undefined ? esc(f.prerequisite) : 'NULL'
    const normal = f.normal !== undefined ? esc(f.normal) : 'NULL'
    const special = f.special !== undefined ? esc(f.special) : 'NULL'
    const effects = f.effects !== undefined ? json(f.effects) : 'NULL'
    return `  (${esc(f.id)}, ${esc(f.name)}, ${esc(f.type)}, ${prereq}, ${esc(f.benefit)}, ${normal}, ${special}, ${effects})`
  })
  lines.push(rows.join(',\n'))
  lines.push('ON CONFLICT (id) DO UPDATE SET')
  lines.push('  name = EXCLUDED.name,')
  lines.push('  type = EXCLUDED.type,')
  lines.push('  prerequisite = EXCLUDED.prerequisite,')
  lines.push('  benefit = EXCLUDED.benefit,')
  lines.push('  normal = EXCLUDED.normal,')
  lines.push('  special = EXCLUDED.special,')
  lines.push('  effects = EXCLUDED.effects;')
  return lines.join('\n')
}

// ── Classes ────────────────────────────────────────────────────────────────

function generateClassesSQL(): string {
  const lines: string[] = []
  lines.push('-- Classes seed')
  lines.push('INSERT INTO classes (id, name, hit_die, base_attack_bonus, fortitude_save, reflex_save, will_save, skill_points_per_level, class_skills, features, alignment, description, magic_type, caster_ability, starting_gold_dice, spells_per_day)')
  lines.push('VALUES')
  const rows = CLASSES.map((c) => {
    const magicType = c.magicType !== null ? esc(c.magicType) : 'NULL'
    const casterAbility = c.casterAbility !== null ? esc(c.casterAbility) : 'NULL'
    const spellsPerDay = c.spellsPerDay !== undefined ? json(c.spellsPerDay) : 'NULL'
    return (
      `  (${esc(c.id)}, ${esc(c.name)}, ${num(c.hitDie)}, ${esc(c.baseAttackBonus)}, ` +
      `${esc(c.fortitudeSave)}, ${esc(c.reflexSave)}, ${esc(c.willSave)}, ${num(c.skillPointsPerLevel)}, ` +
      `${json(c.classSkills)}, ${json(c.features)}, ${json(c.alignment)}, ${esc(c.description)}, ` +
      `${magicType}, ${casterAbility}, ${esc(c.startingGoldDice)}, ${spellsPerDay})`
    )
  })
  lines.push(rows.join(',\n'))
  lines.push('ON CONFLICT (id) DO UPDATE SET')
  lines.push('  name = EXCLUDED.name,')
  lines.push('  hit_die = EXCLUDED.hit_die,')
  lines.push('  base_attack_bonus = EXCLUDED.base_attack_bonus,')
  lines.push('  fortitude_save = EXCLUDED.fortitude_save,')
  lines.push('  reflex_save = EXCLUDED.reflex_save,')
  lines.push('  will_save = EXCLUDED.will_save,')
  lines.push('  skill_points_per_level = EXCLUDED.skill_points_per_level,')
  lines.push('  class_skills = EXCLUDED.class_skills,')
  lines.push('  features = EXCLUDED.features,')
  lines.push('  alignment = EXCLUDED.alignment,')
  lines.push('  description = EXCLUDED.description,')
  lines.push('  magic_type = EXCLUDED.magic_type,')
  lines.push('  caster_ability = EXCLUDED.caster_ability,')
  lines.push('  starting_gold_dice = EXCLUDED.starting_gold_dice,')
  lines.push('  spells_per_day = EXCLUDED.spells_per_day;')
  return lines.join('\n')
}

// ── Races ──────────────────────────────────────────────────────────────────

function generateRacesSQL(): string {
  const lines: string[] = []
  lines.push('-- Races seed')
  lines.push('INSERT INTO races (id, label, size, speed, bonuses, bonus_desc, favored_class, traits, subraces, desc)')
  lines.push('VALUES')
  const rows = RACES.map((r) => {
    const favoredClass = r.favoredClass !== undefined ? esc(r.favoredClass) : 'NULL'
    const subraces = r.subraces !== undefined ? json(r.subraces) : 'NULL'
    return (
      `  (${esc(r.id)}, ${esc(r.label)}, ${esc(r.size)}, ${num(r.speed)}, ` +
      `${json(r.bonuses)}, ${esc(r.bonusDesc)}, ${favoredClass}, ` +
      `${json(r.traits)}, ${subraces}, ${esc(r.desc)})`
    )
  })
  lines.push(rows.join(',\n'))
  lines.push('ON CONFLICT (id) DO UPDATE SET')
  lines.push('  label = EXCLUDED.label,')
  lines.push('  size = EXCLUDED.size,')
  lines.push('  speed = EXCLUDED.speed,')
  lines.push('  bonuses = EXCLUDED.bonuses,')
  lines.push('  bonus_desc = EXCLUDED.bonus_desc,')
  lines.push('  favored_class = EXCLUDED.favored_class,')
  lines.push('  traits = EXCLUDED.traits,')
  lines.push('  subraces = EXCLUDED.subraces,')
  lines.push('  desc = EXCLUDED.desc;')
  return lines.join('\n')
}

// ── Main ───────────────────────────────────────────────────────────────────

const skillsSQL = generateSkillsSQL()
const featsSQL = generateFeatsSQL()
const classesSQL = generateClassesSQL()
const racesSQL = generateRacesSQL()

writeFileSync(resolve(__dirname, 'skills-seed.sql'), skillsSQL, 'utf8')
writeFileSync(resolve(__dirname, 'feats-seed.sql'), featsSQL, 'utf8')
writeFileSync(resolve(__dirname, 'classes-seed.sql'), classesSQL, 'utf8')
writeFileSync(resolve(__dirname, 'races-seed.sql'), racesSQL, 'utf8')

console.log(`Skills: ${SKILLS.length}`)
console.log(`Feats: ${FEATS.length}`)
console.log(`Classes: ${CLASSES.length}`)
console.log(`Races: ${RACES.length}`)
console.log('SQL files written to scripts/')
