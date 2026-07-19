import { describe, expect, it } from 'vitest'
import { getBonusFeatSlotsForClassLevel, getExpectedFeatCount, isGenericFeatLevel } from '../levelProgression'

describe('levelProgression.ts', () => {
  it('marca dotes genericas en niveles impares', () => {
    expect(isGenericFeatLevel(1)).toBe(true)
    expect(isGenericFeatLevel(2)).toBe(false)
    expect(isGenericFeatLevel(3)).toBe(true)
  })

  it('otorga dotes de bono de guerrero en nivel 1 y niveles pares', () => {
    expect(getBonusFeatSlotsForClassLevel('fighter', 1)).toHaveLength(1)
    expect(getBonusFeatSlotsForClassLevel('fighter', 2)).toHaveLength(1)
    expect(getBonusFeatSlotsForClassLevel('fighter', 3)).toHaveLength(0)
  })

  it('otorga dotes de bono de mago cada 5 niveles', () => {
    expect(getBonusFeatSlotsForClassLevel('wizard', 4)).toHaveLength(0)
    expect(getBonusFeatSlotsForClassLevel('wizard', 5)).toHaveLength(1)
  })

  it('calcula dotes esperadas combinando genericas y bono de clase', () => {
    expect(getExpectedFeatCount(2, [{ id: 'fighter', level: 2, archetypeIds: [] }])).toBe(3)
    expect(getExpectedFeatCount(5, [{ id: 'wizard', level: 5, archetypeIds: [] }])).toBe(4)
  })
})
