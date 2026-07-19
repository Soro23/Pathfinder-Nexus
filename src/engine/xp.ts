export const XP_MEDIUM_TRACK = [
  0,
  2000,
  5000,
  9000,
  15000,
  23000,
  35000,
  51000,
  75000,
  105000,
  155000,
  220000,
  315000,
  445000,
  635000,
  890000,
  1300000,
  1800000,
  2550000,
  3600000,
] as const

export function getXpThresholdForLevel(level: number): number | null {
  if (level < 1 || level > XP_MEDIUM_TRACK.length) return null
  return XP_MEDIUM_TRACK[level - 1]
}

export function getNextLevelXp(currentLevel: number): number | null {
  return getXpThresholdForLevel(currentLevel + 1)
}

export function canLevelUpFromXp(currentLevel: number, xp: number): boolean {
  const nextLevelXp = getNextLevelXp(currentLevel)
  return nextLevelXp !== null && xp >= nextLevelXp
}

export function getXpToNextLevel(currentLevel: number, xp: number): number | null {
  const nextLevelXp = getNextLevelXp(currentLevel)
  if (nextLevelXp === null) return null
  return Math.max(0, nextLevelXp - xp)
}
