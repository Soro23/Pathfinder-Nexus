import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { SKILLS } from '../data/skills'
import { FEATS } from '../data/feats'
import { CLASSES } from '../data/classes'
import { RACES } from '../data/races'
import { ARCHETYPES } from '../data/archetypes'
import type { Skill } from '../data/skills'
import type { Feat, FeatType } from '../data/feats'
import type { ClassData } from '../data/classes'
import type { Race } from '../data/races'
import type { Archetype } from '../data/archetypes'

export interface NPC {
  id: string
  name: string
  cr: number
  xp?: number
  race?: string
  classes?: string
  alignment?: string
  size?: string
  creatureType?: string
  init: number
  aura?: string
  description?: string
  senses: { darkvision?: string; perception?: string; [key: string]: string | undefined }
  defense: {
    ac?: number
    touchAc?: number
    flatFootedAc?: number
    acDetails?: string
    hp?: number
    hpFormula?: string
    fort?: number
    ref?: number
    will?: number
    saveNotes?: string
    defensiveAbilities?: string
    dr?: string
    resistances?: string
  }
  offense: {
    speed?: string
    melee?: string
    ranged?: string
    specialAttacks?: string
    spellLikeAbilities?: string
    spellsPrepared?: string
  }
  statistics: {
    str?: number
    dex?: number
    con?: number
    int?: number
    wis?: number
    cha?: number
    bab?: number
    cmb?: number
    cmd?: number
    cmdNotes?: string
    traits?: string
    feats?: string
    skillsList?: string
    languages?: string
    sq?: string
  }
  gear: string[]
}

interface SRDStore {
  skills: Skill[]
  feats: Feat[]
  classes: ClassData[]
  races: Race[]
  archetypes: Archetype[]
  npcs: NPC[]
  loading: boolean
  initialized: boolean
  fetchAll: () => Promise<void>
  getArchetypesByClass: (classId: string) => Archetype[]
  getArchetypeById: (id: string) => Archetype | undefined
}

// ── Row mappers (snake_case DB → camelCase TS) ─────────────────────────────

function mapSkillRow(r: Record<string, unknown>): Skill {
  return {
    id: r.id as string,
    name: r.name as string,
    ability: r.ability as Skill['ability'],
    isClassSkill: r.is_class_skill as boolean,
    hasArmorCheckPenalty: r.has_armor_check_penalty as boolean,
    description: (r.description as string) ?? '',
  }
}

function mapFeatRow(r: Record<string, unknown>): Feat {
  return {
    id: r.id as string,
    name: r.name as string,
    type: (r.type as string || '').split(',').map(t => t.trim()) as FeatType[],
    prerequisite: r.prerequisite as string | undefined,
    benefit: r.benefit as string,
    normal: r.normal as string | undefined,
    special: r.special as string | undefined,
    effects: r.effects as Feat['effects'],
  }
}

function mapClassRow(r: Record<string, unknown>): ClassData {
  return {
    id: r.id as string,
    name: r.name as string,
    hitDie: r.hit_die as number,
    baseAttackBonus: r.base_attack_bonus as ClassData['baseAttackBonus'],
    fortitudeSave: r.fortitude_save as ClassData['fortitudeSave'],
    reflexSave: r.reflex_save as ClassData['reflexSave'],
    willSave: r.will_save as ClassData['willSave'],
    skillPointsPerLevel: r.skill_points_per_level as number,
    classSkills: (r.class_skills as string[]) ?? [],
    features: (r.features as ClassData['features']) ?? [],
    alignment: (r.alignment as string[]) ?? [],
    description: (r.description as string) ?? '',
    magicType: (r.magic_type as ClassData['magicType']) ?? null,
    casterAbility: (r.caster_ability as ClassData['casterAbility']) ?? null,
    startingGoldDice: (r.starting_gold_dice as string) ?? '',
    source: (r.source as ClassData['source']) ?? 'core',
    spellsPerDay: r.spells_per_day as ClassData['spellsPerDay'],
  }
}

function mapRaceRow(r: Record<string, unknown>): Race {
  return {
    id: r.id as string,
    label: r.label as string,
    size: r.size as Race['size'],
    speed: r.speed as number,
    bonuses: (r.bonuses as Race['bonuses']) ?? {},
    bonusDesc: (r.bonus_desc as string) ?? '',
    favoredClass: r.favored_class as string | undefined,
    traits: (r.traits as Race['traits']) ?? [],
    subraces: r.subraces as Race['subraces'],
    desc: (r.desc as string) ?? '',
  }
}

function mapArchetypeRow(r: Record<string, unknown>): Archetype {
  return {
    id: r.id as string,
    classId: r.class_id as string,
    name: r.name as string,
    description: (r.description as string) ?? '',
    replaces: (r.replaces as Archetype['replaces']) ?? [],
    features: (r.features as Archetype['features']) ?? [],
    classSkillsAdded: r.class_skills_added as string[] | undefined,
    classSkillsRemoved: r.class_skills_removed as string[] | undefined,
    spellsPerDayOverride: r.spells_per_day_override as Archetype['spellsPerDayOverride'],
  }
}

function mapNpcRow(r: Record<string, unknown>): NPC {
  const defense = (r.defense as Record<string, unknown>) ?? {}
  const offense = (r.offense as Record<string, unknown>) ?? {}
  const statistics = (r.statistics as Record<string, unknown>) ?? {}
  return {
    id: r.id as string,
    name: r.name as string,
    cr: r.cr as number,
    xp: r.xp as number | undefined,
    race: r.race as string | undefined,
    classes: r.classes as string | undefined,
    alignment: r.alignment as string | undefined,
    size: r.size as string | undefined,
    creatureType: r.creature_type as string | undefined,
    init: (r.init as number) ?? 0,
    aura: r.aura as string | undefined,
    description: r.description as string | undefined,
    senses: (r.senses as NPC['senses']) ?? {},
    defense: {
      ac: defense.ac as number | undefined,
      touchAc: defense.touch_ac as number | undefined,
      flatFootedAc: defense.flat_footed_ac as number | undefined,
      acDetails: defense.ac_details as string | undefined,
      hp: defense.hp as number | undefined,
      hpFormula: defense.hp_formula as string | undefined,
      fort: defense.fort as number | undefined,
      ref: defense.ref as number | undefined,
      will: defense.will as number | undefined,
      saveNotes: defense.save_notes as string | undefined,
      defensiveAbilities: defense.defensive_abilities as string | undefined,
      dr: defense.dr as string | undefined,
      resistances: defense.resistances as string | undefined,
    },
    offense: {
      speed: offense.speed as string | undefined,
      melee: offense.melee as string | undefined,
      ranged: offense.ranged as string | undefined,
      specialAttacks: offense.special_attacks as string | undefined,
      spellLikeAbilities: offense.spell_like_abilities as string | undefined,
      spellsPrepared: offense.spells_prepared as string | undefined,
    },
    statistics: {
      str: statistics.str as number | undefined,
      dex: statistics.dex as number | undefined,
      con: statistics.con as number | undefined,
      int: statistics.int as number | undefined,
      wis: statistics.wis as number | undefined,
      cha: statistics.cha as number | undefined,
      bab: statistics.bab as number | undefined,
      cmb: statistics.cmb as number | undefined,
      cmd: statistics.cmd as number | undefined,
      cmdNotes: statistics.cmd_notes as string | undefined,
      traits: statistics.traits as string | undefined,
      feats: statistics.feats as string | undefined,
      skillsList: statistics.skills_list as string | undefined,
      languages: statistics.languages as string | undefined,
      sq: statistics.sq as string | undefined,
    },
    gear: (r.gear as string[]) ?? [],
  }
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useSRDStore = create<SRDStore>()((set, get) => ({
  // Static arrays as initial fallback — app works offline immediately
  skills: SKILLS,
  feats: FEATS,
  classes: CLASSES,
  races: RACES,
  archetypes: ARCHETYPES,
  npcs: [],
  loading: false,
  initialized: false,

  getArchetypesByClass: (classId) =>
    get().archetypes.filter((a) => a.classId === classId),

  getArchetypeById: (id) =>
    get().archetypes.find((a) => a.id === id),

  fetchAll: async () => {
    if (get().initialized) return
    set({ loading: true })

    try {
      const [skillsRes, featsRes, classesRes, racesRes, archetypesRes, npcsRes] = await Promise.all([
        supabase.from('skills').select('*').order('name'),
        supabase.from('feats').select('*').order('name'),
        supabase.from('classes').select('*').order('name'),
        supabase.from('races').select('*'),
        supabase.from('archetypes').select('*').order('name'),
        supabase.from('npcs').select('*').order('cr'),
      ])

      const updates: Partial<SRDStore> = { loading: false, initialized: true }

      if (skillsRes.data && skillsRes.data.length > 0) {
        updates.skills = (skillsRes.data as Record<string, unknown>[]).map(mapSkillRow)
      }
      if (featsRes.data && featsRes.data.length > 0) {
        updates.feats = (featsRes.data as Record<string, unknown>[]).map(mapFeatRow)
      }
      if (classesRes.data && classesRes.data.length > 0) {
        updates.classes = (classesRes.data as Record<string, unknown>[]).map(mapClassRow)
      }
      if (racesRes.data && racesRes.data.length > 0) {
        updates.races = (racesRes.data as Record<string, unknown>[]).map(mapRaceRow)
      }
      if (npcsRes.data && npcsRes.data.length > 0) {
        updates.npcs = (npcsRes.data as Record<string, unknown>[]).map(mapNpcRow)
      }
      if (archetypesRes.data && archetypesRes.data.length > 0) {
        // Merge: Supabase rows override static by id
        const dbArchetypes = (archetypesRes.data as Record<string, unknown>[]).map(mapArchetypeRow)
        const staticById = new Map(ARCHETYPES.map((a) => [a.id, a]))
        for (const a of dbArchetypes) staticById.set(a.id, a)
        updates.archetypes = Array.from(staticById.values())
      }

      set(updates)
    } catch {
      // On any error, keep static data — just mark done
      set({ loading: false, initialized: true })
    }
  },
}))

// Non-hook accessor for use outside React
export const srdStore = useSRDStore
