import { getClassById } from '../data/classes'
import type { Character, CharacterClass, CharacterFeat, LevelChoice, SkillRank } from './characterStore'

const GENERIC_FEAT_LEVEL = (level: number) => level % 2 === 1
const abilityModifier = (score: number) => Math.floor((score - 10) / 2)

export function normalizeCharacter(raw: Character): Character {
  const classes = normalizeClasses(raw.classes ?? [])
  const level = Math.max(1, classes.reduce((sum, c) => sum + c.level, 0) || raw.level || 1)
  const base: Character = {
    ...raw,
    classes,
    level,
    feats: normalizeFeats(raw.feats ?? []),
    skills: normalizeSkills(raw.skills ?? []),
    spells: raw.spells ?? [],
    spellSlots: raw.spellSlots ?? {},
    inventory: raw.inventory ?? [],
    weapons: raw.weapons ?? [],
    armor: raw.armor ?? [],
    coins: raw.coins ?? { pp: 0, gp: 0, sp: 0, cp: 0 },
    notes: raw.notes ?? '',
    hp: {
      current: raw.hp?.current ?? raw.hp?.max ?? 1,
      max: raw.hp?.max ?? raw.hp?.current ?? 1,
      temp: raw.hp?.temp ?? 0,
    },
    negativeLevels: Math.max(0, raw.negativeLevels ?? 0),
  }

  if (base.companion) {
    base.companion = {
      ...base.companion,
      tricks: base.companion.tricks ?? [],
      feats: base.companion.feats ?? [],
      customSpecialAbilities: base.companion.customSpecialAbilities ?? [],
      attacks: base.companion.attacks ?? [],
    }
  }

  const normalizedHistory = normalizeLevelHistory(base.levelHistory ?? [])
  base.levelHistory = completeLevelHistory(base, normalizedHistory)
  return base
}

export function inferLevelHistory(character: Character): LevelChoice[] {
  const now = character.createdAt || new Date().toISOString()
  const classTimeline = expandClasses(character.classes)
  const hpByLevel = distributeHp(character, classTimeline)
  const skillRanksByLevel = distributeSkillRanks(character.skills ?? [], character.level)
  const featsByLevel = distributeFeats(character.feats ?? [], character.level)
  const classLevels = new Map<string, number>()

  return classTimeline.map((classId, index) => {
    const characterLevel = index + 1
    const classLevel = (classLevels.get(classId) ?? 0) + 1
    classLevels.set(classId, classLevel)
    const classEntry = character.classes.find((c) => c.id === classId)

    return {
      characterLevel,
      classId,
      classLevel,
      archetypeIds: classLevel === 1 ? [...(classEntry?.archetypeIds ?? [])] : [],
      hpMode: 'manual',
      hpRolled: null,
      hpGained: hpByLevel[index] ?? 1,
      featIds: featsByLevel[characterLevel] ?? [],
      favoredClassChoice: character.favoredClassId === classId ? 'hp' : undefined,
      skillRanksSpent: skillRanksByLevel[characterLevel] ?? {},
      inferred: true,
      source: 'retroactive',
      createdAt: now,
    }
  })
}

function completeLevelHistory(character: Character, levelHistory: LevelChoice[]): LevelChoice[] {
  if (levelHistory.length >= character.level) {
    return levelHistory.slice(0, character.level)
  }

  const inferred = inferLevelHistory(character)
  if (levelHistory.length === 0) return inferred

  const existingLevels = new Set(levelHistory.map((choice) => choice.characterLevel))
  return [
    ...levelHistory,
    ...inferred.filter((choice) => !existingLevels.has(choice.characterLevel)),
  ].sort((a, b) => a.characterLevel - b.characterLevel)
}

function normalizeLevelHistory(levelHistory: LevelChoice[]): LevelChoice[] {
  return levelHistory
    .filter((choice) => choice && choice.characterLevel > 0 && choice.classId)
    .map((choice) => ({
      ...choice,
      archetypeIds: choice.archetypeIds ?? [],
      hpMode: choice.hpMode ?? 'manual',
      hpRolled: choice.hpRolled ?? null,
      hpGained: Math.max(1, choice.hpGained ?? 1),
      featIds: choice.featIds ?? [],
      skillRanksSpent: choice.skillRanksSpent ?? {},
      createdAt: choice.createdAt ?? new Date().toISOString(),
    }))
    .sort((a, b) => a.characterLevel - b.characterLevel)
}

function normalizeClasses(classes: CharacterClass[]): CharacterClass[] {
  return classes
    .filter((cls) => cls && cls.id)
    .map((cls) => {
      const legacyId = (cls as CharacterClass & { archetypeId?: string }).archetypeId
      return {
        id: cls.id,
        level: Math.max(1, cls.level ?? 1),
        archetypeIds: cls.archetypeIds ?? (legacyId ? [legacyId] : []),
      }
    })
}

function normalizeFeats(feats: Array<CharacterFeat | string>): CharacterFeat[] {
  return feats.map((feat) => typeof feat === 'string' ? { id: feat } : feat)
}

function normalizeSkills(skills: SkillRank[]): SkillRank[] {
  return skills
    .filter((skill) => skill && skill.id)
    .map((skill) => ({ ...skill, ranks: Math.max(0, skill.ranks ?? 0) }))
}

function expandClasses(classes: CharacterClass[]): string[] {
  const timeline: string[] = []
  for (const cls of classes) {
    for (let level = 0; level < cls.level; level += 1) {
      timeline.push(cls.id)
    }
  }
  return timeline
}

function distributeHp(character: Character, classTimeline: string[]): number[] {
  const conMod = abilityModifier(character.abilities.constitution)
  const estimates = classTimeline.map((classId, index) => {
    const hitDie = getClassById(classId)?.hitDie ?? 8
    const base = index === 0 ? hitDie : Math.floor(hitDie / 2) + 1
    return Math.max(1, base + conMod)
  })

  const target = Math.max(character.level, character.hp.max)
  const total = estimates.reduce((sum, hp) => sum + hp, 0)
  if (estimates.length === 0) return []
  estimates[estimates.length - 1] = Math.max(1, estimates[estimates.length - 1] + target - total)
  return estimates
}

function distributeSkillRanks(skills: SkillRank[], level: number): Record<number, Record<string, number>> {
  const byLevel: Record<number, Record<string, number>> = {}
  for (const skill of skills) {
    for (let rank = 1; rank <= skill.ranks; rank += 1) {
      const characterLevel = Math.min(rank, level)
      byLevel[characterLevel] = byLevel[characterLevel] ?? {}
      byLevel[characterLevel][skill.id] = (byLevel[characterLevel][skill.id] ?? 0) + 1
    }
  }
  return byLevel
}

function distributeFeats(feats: CharacterFeat[], level: number): Record<number, string[]> {
  const featLevels = Array.from({ length: level }, (_, index) => index + 1).filter(GENERIC_FEAT_LEVEL)
  const byLevel: Record<number, string[]> = {}

  feats.forEach((feat, index) => {
    const characterLevel = featLevels[index] ?? 1
    byLevel[characterLevel] = byLevel[characterLevel] ?? []
    byLevel[characterLevel].push(feat.id)
  })

  return byLevel
}
