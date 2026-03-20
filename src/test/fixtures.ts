/**
 * Test fixtures for Pathfinder Nexus.
 * Provides a minimal valid Character object for use across all test files.
 * Override any field by passing a partial object to makeCharacter().
 */

import type { Character } from '../store/characterStore'

export function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test-char-1',
    name: 'Test Character',
    race: 'Human',
    classes: [{ id: 'fighter', level: 1 }],
    level: 1,
    xp: 0,
    alignment: 'Neutral Good',
    abilities: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    hp: { current: 10, max: 10, temp: 0 },
    feats: [],
    skills: [],
    spells: [],
    spellSlots: {},
    inventory: [],
    weapons: [],
    armor: [],
    coins: { pp: 0, gp: 0, sp: 0, cp: 0 },
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}
