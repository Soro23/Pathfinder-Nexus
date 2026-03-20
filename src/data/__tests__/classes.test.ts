/**
 * Data integrity tests for src/data/classes.ts.
 *
 * Tests cover:
 *   - getBABForLevel: returns a value for each level 1–20, is non-decreasing across levels
 *   - getSaveForLevel: good and poor progressions for all levels 1–20
 *   - CLASSES: each class has required fields (hitDie, baseAttackBonus, saves)
 */

import { describe, it, expect } from 'vitest'
import { CLASSES, getBABForLevel, getSaveForLevel, getClassById } from '../classes'

const LEVELS = Array.from({ length: 20 }, (_, i) => i + 1)

// ── getBABForLevel ─────────────────────────────────────────────────────────

describe('getBABForLevel — good progression', () => {
  it('should return a defined number for every level 1-20', () => {
    for (const level of LEVELS) {
      const bab = getBABForLevel(level, 'good')
      expect(typeof bab).toBe('number')
      expect(Number.isFinite(bab)).toBe(true)
    }
  })

  it('should be non-decreasing across levels 1-20', () => {
    for (let i = 1; i < 20; i++) {
      expect(getBABForLevel(i + 1, 'good')).toBeGreaterThanOrEqual(getBABForLevel(i, 'good'))
    }
  })

  it('should return 1 at level 1', () => {
    expect(getBABForLevel(1, 'good')).toBe(1)
  })

  it('should return 20 at level 20', () => {
    expect(getBABForLevel(20, 'good')).toBe(20)
  })
})

describe('getBABForLevel — medium progression', () => {
  it('should be non-decreasing across levels 1-20', () => {
    for (let i = 1; i < 20; i++) {
      expect(getBABForLevel(i + 1, 'medium')).toBeGreaterThanOrEqual(getBABForLevel(i, 'medium'))
    }
  })

  it('should return a value less than or equal to good progression at same level', () => {
    for (const level of LEVELS) {
      expect(getBABForLevel(level, 'medium')).toBeLessThanOrEqual(getBABForLevel(level, 'good'))
    }
  })
})

describe('getBABForLevel — poor progression', () => {
  it('should be non-decreasing across levels 1-20', () => {
    for (let i = 1; i < 20; i++) {
      expect(getBABForLevel(i + 1, 'poor')).toBeGreaterThanOrEqual(getBABForLevel(i, 'poor'))
    }
  })

  it('should return a value less than or equal to medium progression at same level', () => {
    for (const level of LEVELS) {
      expect(getBABForLevel(level, 'poor')).toBeLessThanOrEqual(getBABForLevel(level, 'medium'))
    }
  })
})

// ── getSaveForLevel ────────────────────────────────────────────────────────

describe('getSaveForLevel — good save progression', () => {
  it('should return a defined number for every level 1-20', () => {
    for (const level of LEVELS) {
      const save = getSaveForLevel(level, 'good')
      expect(typeof save).toBe('number')
      expect(Number.isFinite(save)).toBe(true)
    }
  })

  it('should be non-decreasing across levels 1-20', () => {
    for (let i = 1; i < 20; i++) {
      expect(getSaveForLevel(i + 1, 'good')).toBeGreaterThanOrEqual(getSaveForLevel(i, 'good'))
    }
  })

  it('should start at 2 at level 1 (good save base)', () => {
    expect(getSaveForLevel(1, 'good')).toBe(2)
  })
})

describe('getSaveForLevel — poor save progression', () => {
  it('should return a defined number for every level 1-20', () => {
    for (const level of LEVELS) {
      const save = getSaveForLevel(level, 'poor')
      expect(typeof save).toBe('number')
      expect(Number.isFinite(save)).toBe(true)
    }
  })

  it('should be non-decreasing across levels 1-20', () => {
    for (let i = 1; i < 20; i++) {
      expect(getSaveForLevel(i + 1, 'poor')).toBeGreaterThanOrEqual(getSaveForLevel(i, 'poor'))
    }
  })

  it('good save should always be greater than or equal to poor save at same level', () => {
    for (const level of LEVELS) {
      expect(getSaveForLevel(level, 'good')).toBeGreaterThanOrEqual(getSaveForLevel(level, 'poor'))
    }
  })
})

// ── CLASSES array integrity ────────────────────────────────────────────────

describe('CLASSES — required fields present on all classes', () => {
  it('should have a valid hitDie on every class', () => {
    for (const cls of CLASSES) {
      expect(typeof cls.hitDie).toBe('number')
      expect(cls.hitDie).toBeGreaterThan(0)
    }
  })

  it('should have a valid baseAttackBonus type on every class', () => {
    const VALID_BAB = ['good', 'medium', 'poor']
    for (const cls of CLASSES) {
      expect(VALID_BAB).toContain(cls.baseAttackBonus)
    }
  })

  it('should have valid save progressions on every class', () => {
    const VALID_SAVES = ['good', 'poor']
    for (const cls of CLASSES) {
      expect(VALID_SAVES).toContain(cls.fortitudeSave)
      expect(VALID_SAVES).toContain(cls.reflexSave)
      expect(VALID_SAVES).toContain(cls.willSave)
    }
  })

  it('should have no two classes sharing the same id', () => {
    const ids = CLASSES.map((c) => c.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

describe('getClassById', () => {
  it('should return the fighter class when called with "fighter"', () => {
    const cls = getClassById('fighter')
    expect(cls).toBeDefined()
    expect(cls?.id).toBe('fighter')
  })

  it('should return undefined for an unknown class id', () => {
    expect(getClassById('nonexistent_class')).toBeUndefined()
  })
})
