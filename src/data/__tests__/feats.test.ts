/**
 * Data integrity tests for src/data/feats.ts.
 *
 * Tests cover:
 *   - getFeatById: lookup by known id, undefined for unknown id
 *   - FEATS array: no duplicate IDs, alphabetical name order
 *   - All effects[].type are valid ModifierType values
 *   - All effects[].target are valid ModifierTarget patterns
 */

import { describe, it, expect } from 'vitest'
import { FEATS, getFeatById } from '../feats'
import type { ModifierType, ModifierTarget } from '../../engine/types'

// ── getFeatById ────────────────────────────────────────────────────────────

describe('getFeatById', () => {
  it('should return the dodge feat when called with "dodge"', () => {
    const feat = getFeatById('dodge')
    expect(feat).toBeDefined()
    expect(feat?.id).toBe('dodge')
  })

  it('should return undefined for a non-existent feat id', () => {
    expect(getFeatById('nonexistent_feat_xyz')).toBeUndefined()
  })

  it('should return the great_fortitude feat when called with "great_fortitude"', () => {
    const feat = getFeatById('great_fortitude')
    expect(feat).toBeDefined()
    expect(feat?.id).toBe('great_fortitude')
  })
})

// ── FEATS array integrity ──────────────────────────────────────────────────

describe('FEATS — no duplicate IDs', () => {
  it('should have no two feats sharing the same id', () => {
    const ids = FEATS.map((f) => f.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

describe('FEATS — alphabetical order by name', () => {
  it('should be sorted alphabetically by name', () => {
    const names = FEATS.map((f) => f.name)
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'es'))
    expect(names).toEqual(sorted)
  })
})

// ── Effect type/target validity ────────────────────────────────────────────

const VALID_MODIFIER_TYPES: ModifierType[] = [
  'competence',
  'enhancement',
  'insight',
  'luck',
  'morale',
  'natural',
  'circumstance',
  'racial',
  'deflection',
  'dodge',
  'sacred',
  'profane',
  'untyped',
]

const VALID_STATIC_TARGETS: ModifierTarget[] = [
  'ac',
  'ac_natural',
  'ac_deflection',
  'ac_dodge',
  'attack',
  'damage',
  'save_fort',
  'save_ref',
  'save_will',
  'initiative',
  'cmb',
  'cmd',
  'speed',
  'hp',
]

function isValidTarget(target: string): boolean {
  if (VALID_STATIC_TARGETS.includes(target as ModifierTarget)) return true
  if (target.startsWith('skill:') && target.length > 6) return true
  return false
}

describe('FEATS — all effect types are valid ModifierType', () => {
  it('should have only recognized modifier types across all feat effects', () => {
    const allEffects = FEATS.flatMap((f) => f.effects ?? [])
    for (const effect of allEffects) {
      expect(VALID_MODIFIER_TYPES).toContain(effect.type)
    }
  })
})

describe('FEATS — all effect targets are valid ModifierTarget', () => {
  it('should have only recognized modifier targets across all feat effects', () => {
    const allEffects = FEATS.flatMap((f) => f.effects ?? [])
    for (const effect of allEffects) {
      expect(isValidTarget(effect.target)).toBe(true)
    }
  })
})
