import type { Character, CharacterClass, CharacterFeat, LevelChoice, SkillRank } from '../store/characterStore'

export interface DerivedProgression {
  level: number
  classes: CharacterClass[]
  hpMax: number
  skills: SkillRank[]
  feats: CharacterFeat[]
}

export interface ProgressionMismatch {
  field: keyof DerivedProgression
  expected: unknown
  actual: unknown
}

export function deriveClassesFromLevelHistory(levelHistory: LevelChoice[]): CharacterClass[] {
  const byClass = new Map<string, CharacterClass>()

  for (const choice of levelHistory) {
    const current = byClass.get(choice.classId) ?? { id: choice.classId, level: 0, archetypeIds: [] }
    const archetypeIds = [...new Set([...(current.archetypeIds ?? []), ...(choice.archetypeIds ?? [])])]
    byClass.set(choice.classId, {
      ...current,
      level: Math.max(current.level, choice.classLevel),
      archetypeIds,
    })
  }

  return [...byClass.values()]
}

export function deriveSkillRanksFromLevelHistory(levelHistory: LevelChoice[]): SkillRank[] {
  const ranks = new Map<string, number>()

  for (const choice of levelHistory) {
    for (const [skillId, spent] of Object.entries(choice.skillRanksSpent ?? {})) {
      ranks.set(skillId, (ranks.get(skillId) ?? 0) + spent)
    }
  }

  return [...ranks.entries()]
    .filter(([, rank]) => rank > 0)
    .map(([id, rank]) => ({ id, ranks: rank }))
}

export function deriveFeatsFromLevelHistory(levelHistory: LevelChoice[]): CharacterFeat[] {
  return levelHistory.flatMap((choice) =>
    (choice.featIds ?? []).map((id) => ({ id }))
  )
}

export function deriveProgressionFromLevelHistory(levelHistory: LevelChoice[]): DerivedProgression {
  return {
    level: levelHistory.length,
    classes: deriveClassesFromLevelHistory(levelHistory),
    hpMax: levelHistory.reduce((sum, choice) => sum + choice.hpGained, 0),
    skills: deriveSkillRanksFromLevelHistory(levelHistory),
    feats: deriveFeatsFromLevelHistory(levelHistory),
  }
}

export function validateProgressionAgainstCharacter(character: Character): ProgressionMismatch[] {
  const history = character.levelHistory ?? []
  if (history.length === 0) return []

  const derived = deriveProgressionFromLevelHistory(history)
  const mismatches: ProgressionMismatch[] = []

  if (derived.level !== character.level) {
    mismatches.push({ field: 'level', expected: derived.level, actual: character.level })
  }

  if (JSON.stringify(normalizeClasses(derived.classes)) !== JSON.stringify(normalizeClasses(character.classes))) {
    mismatches.push({ field: 'classes', expected: derived.classes, actual: character.classes })
  }

  if (derived.hpMax !== character.hp.max) {
    mismatches.push({ field: 'hpMax', expected: derived.hpMax, actual: character.hp.max })
  }

  if (JSON.stringify(normalizeSkills(derived.skills)) !== JSON.stringify(normalizeSkills(character.skills))) {
    mismatches.push({ field: 'skills', expected: derived.skills, actual: character.skills })
  }

  if (JSON.stringify(derived.feats.map((f) => f.id).sort()) !== JSON.stringify(character.feats.map((f) => f.id).sort())) {
    mismatches.push({ field: 'feats', expected: derived.feats, actual: character.feats })
  }

  return mismatches
}

function normalizeClasses(classes: CharacterClass[]): CharacterClass[] {
  return [...classes]
    .map((c) => ({ ...c, archetypeIds: [...(c.archetypeIds ?? [])].sort() }))
    .sort((a, b) => a.id.localeCompare(b.id))
}

function normalizeSkills(skills: SkillRank[]): SkillRank[] {
  return [...skills]
    .map((s) => ({ id: s.id, ranks: s.ranks }))
    .filter((s) => s.ranks > 0)
    .sort((a, b) => a.id.localeCompare(b.id))
}
