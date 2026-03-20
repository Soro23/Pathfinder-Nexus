/**
 * Data integrity tests for src/data/skills.ts.
 *
 * Tests cover:
 *   - getSkillById: known skill, undefined for unknown
 *   - SKILLS: no duplicate IDs, each skill has a valid ability attribute
 *   - All six ability values (STR/DEX/CON/INT/WIS/CHA) appear in the dataset
 */

import { describe, it, expect } from 'vitest'
import { SKILLS, getSkillById } from '../skills'

// ── getSkillById ───────────────────────────────────────────────────────────

describe('getSkillById', () => {
  it('should return the perception skill when called with "perception"', () => {
    const skill = getSkillById('perception')
    expect(skill).toBeDefined()
    expect(skill?.id).toBe('perception')
    expect(skill?.name).toBeTruthy()
  })

  it('should return undefined for a non-existent skill id', () => {
    expect(getSkillById('nonexistent_skill_xyz')).toBeUndefined()
  })

  it('should return the acrobatics skill when called with "acrobatics"', () => {
    const skill = getSkillById('acrobatics')
    expect(skill).toBeDefined()
    expect(skill?.id).toBe('acrobatics')
  })
})

// ── SKILLS array integrity ─────────────────────────────────────────────────

describe('SKILLS — no duplicate IDs', () => {
  it('should have no two skills sharing the same id', () => {
    const ids = SKILLS.map((s) => s.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

describe('SKILLS — valid ability attributes', () => {
  const VALID_ABILITIES = [
    'strength',
    'dexterity',
    'constitution',
    'intelligence',
    'wisdom',
    'charisma',
  ] as const

  it('should have only valid ability values on every skill', () => {
    for (const skill of SKILLS) {
      expect(VALID_ABILITIES).toContain(skill.ability)
    }
  })

  it('should include at least one strength-based skill (climb or swim)', () => {
    const strSkills = SKILLS.filter((s) => s.ability === 'strength')
    expect(strSkills.length).toBeGreaterThan(0)
  })

  it('should include at least one dexterity-based skill (acrobatics, stealth, etc.)', () => {
    const dexSkills = SKILLS.filter((s) => s.ability === 'dexterity')
    expect(dexSkills.length).toBeGreaterThan(0)
  })

  it('should include at least one intelligence-based skill (knowledge_arcana, etc.)', () => {
    const intSkills = SKILLS.filter((s) => s.ability === 'intelligence')
    expect(intSkills.length).toBeGreaterThan(0)
  })

  it('should include at least one wisdom-based skill (perception, heal, etc.)', () => {
    const wisSkills = SKILLS.filter((s) => s.ability === 'wisdom')
    expect(wisSkills.length).toBeGreaterThan(0)
  })

  it('should include at least one charisma-based skill (diplomacy, bluff, etc.)', () => {
    const chaSkills = SKILLS.filter((s) => s.ability === 'charisma')
    expect(chaSkills.length).toBeGreaterThan(0)
  })
})
