import type { XpProgressionSpeed } from '../store/characterStore'

export const XP_SLOW_TRACK = [
  0,
  3000,
  7500,
  14000,
  23000,
  35000,
  53000,
  77000,
  115000,
  160000,
  235000,
  330000,
  475000,
  665000,
  955000,
  1350000,
  1900000,
  2700000,
  3850000,
  5350000,
] as const

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

export const XP_FAST_TRACK = [
  0,
  1300,
  3300,
  6000,
  10000,
  15000,
  23000,
  34000,
  50000,
  71000,
  105000,
  145000,
  210000,
  295000,
  425000,
  600000,
  850000,
  1200000,
  1700000,
  2400000,
] as const

const XP_TRACKS: Record<XpProgressionSpeed, readonly number[]> = {
  slow: XP_SLOW_TRACK,
  medium: XP_MEDIUM_TRACK,
  fast: XP_FAST_TRACK,
}

export const XP_SPEED_LABELS: Record<XpProgressionSpeed, string> = {
  slow: 'Lenta',
  medium: 'Normal',
  fast: 'Rápida',
}

export function getXpThresholdForLevel(level: number, speed: XpProgressionSpeed = 'medium'): number | null {
  const track = XP_TRACKS[speed]
  if (level < 1 || level > track.length) return null
  return track[level - 1]
}

export function getNextLevelXp(currentLevel: number, speed: XpProgressionSpeed = 'medium'): number | null {
  return getXpThresholdForLevel(currentLevel + 1, speed)
}

export function canLevelUpFromXp(currentLevel: number, xp: number, speed: XpProgressionSpeed = 'medium'): boolean {
  const nextLevelXp = getNextLevelXp(currentLevel, speed)
  return nextLevelXp !== null && xp >= nextLevelXp
}

export function getXpToNextLevel(currentLevel: number, xp: number, speed: XpProgressionSpeed = 'medium'): number | null {
  const nextLevelXp = getNextLevelXp(currentLevel, speed)
  if (nextLevelXp === null) return null
  return Math.max(0, nextLevelXp - xp)
}
