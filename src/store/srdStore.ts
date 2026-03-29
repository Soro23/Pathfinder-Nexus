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

interface SRDStore {
  skills: Skill[]
  feats: Feat[]
  classes: ClassData[]
  races: Race[]
  archetypes: Archetype[]
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

// ── Store ──────────────────────────────────────────────────────────────────

export const useSRDStore = create<SRDStore>()((set, get) => ({
  // Static arrays as initial fallback — app works offline immediately
  skills: SKILLS,
  feats: FEATS,
  classes: CLASSES,
  races: RACES,
  archetypes: ARCHETYPES,
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
      const [skillsRes, featsRes, classesRes, racesRes, archetypesRes] = await Promise.all([
        supabase.from('skills').select('*').order('name'),
        supabase.from('feats').select('*').order('name'),
        supabase.from('classes').select('*').order('name'),
        supabase.from('races').select('*'),
        supabase.from('archetypes').select('*').order('name'),
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
