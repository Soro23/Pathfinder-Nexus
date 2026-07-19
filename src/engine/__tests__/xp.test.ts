import { describe, expect, it } from 'vitest'
import { canLevelUpFromXp, getNextLevelXp, getXpToNextLevel, getXpThresholdForLevel } from '../xp'

describe('xp.ts', () => {
  it('usa la progresion media de Pathfinder', () => {
    expect(getXpThresholdForLevel(1)).toBe(0)
    expect(getXpThresholdForLevel(2)).toBe(2000)
    expect(getXpThresholdForLevel(20)).toBe(3600000)
  })

  it('calcula XP restante y disponibilidad de subida', () => {
    expect(getNextLevelXp(3)).toBe(9000)
    expect(getXpToNextLevel(3, 8000)).toBe(1000)
    expect(canLevelUpFromXp(3, 8999)).toBe(false)
    expect(canLevelUpFromXp(3, 9000)).toBe(true)
  })
})
