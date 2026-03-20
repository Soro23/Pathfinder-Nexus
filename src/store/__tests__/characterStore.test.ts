/**
 * Unit tests for pure utility functions exported from characterStore.ts:
 *   - calculateModifier
 *   - getModifierString
 *   - generateId
 *
 * These are stateless pure functions — no store setup required.
 */

import { describe, it, expect } from 'vitest'
import {
  calculateModifier,
  getModifierString,
  generateId,
} from '../characterStore'

describe('calculateModifier', () => {
  it('should return 0 for a score of 10', () => {
    expect(calculateModifier(10)).toBe(0)
  })

  it('should return 0 for a score of 11', () => {
    expect(calculateModifier(11)).toBe(0)
  })

  it('should return -1 for a score of 8', () => {
    expect(calculateModifier(8)).toBe(-1)
  })

  it('should return +4 for a score of 18', () => {
    expect(calculateModifier(18)).toBe(4)
  })

  it('should return -5 for a score of 1', () => {
    expect(calculateModifier(1)).toBe(-5)
  })

  it('should return +5 for a score of 20', () => {
    expect(calculateModifier(20)).toBe(5)
  })

  it('should floor negative half-scores correctly for score 9', () => {
    expect(calculateModifier(9)).toBe(-1)
  })

  it('should return +3 for a score of 16', () => {
    expect(calculateModifier(16)).toBe(3)
  })
})

describe('getModifierString', () => {
  it('should return "+1" for a score of 12', () => {
    expect(getModifierString(12)).toBe('+1')
  })

  it('should return "-1" for a score of 8', () => {
    expect(getModifierString(8)).toBe('-1')
  })

  it('should return "+0" for a score of 10', () => {
    expect(getModifierString(10)).toBe('+0')
  })

  it('should return "+0" for a score of 11', () => {
    expect(getModifierString(11)).toBe('+0')
  })

  it('should return "+4" for a score of 18', () => {
    expect(getModifierString(18)).toBe('+4')
  })

  it('should return "-5" for a score of 1', () => {
    expect(getModifierString(1)).toBe('-5')
  })
})

describe('generateId', () => {
  it('should return a non-empty string', () => {
    const id = generateId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('should return different IDs on successive calls', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })

  it('should return a string that does not contain spaces', () => {
    const id = generateId()
    expect(id).not.toContain(' ')
  })
})
