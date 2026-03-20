/**
 * Integration tests for the Zustand character store (useCharacterStore).
 * Tests cover: addCharacter, getCharacter, updateCharacter, deleteCharacter,
 * localStorage persistence, and non-existent ID handling.
 *
 * State is reset before each test via setState to prevent cross-test pollution.
 * localStorage is stubbed so tests never touch real browser storage.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useCharacterStore } from '../characterStore'
import { makeCharacter } from '../../test/fixtures'

// jsdom provides a real localStorage implementation in this test environment.
// We clear it before each test to prevent state leaking between tests.
beforeEach(() => {
  // Reset Zustand store state to empty before each test
  useCharacterStore.setState({ characters: [] })
  // Wipe jsdom localStorage so the persist middleware does not hydrate stale data
  localStorage.clear()
})

describe('addCharacter', () => {
  it('should add a character and make it visible in the characters list', () => {
    const char = makeCharacter({ id: 'char-1', name: 'Aragorn' })
    useCharacterStore.getState().addCharacter(char)
    const { characters } = useCharacterStore.getState()
    expect(characters).toHaveLength(1)
    expect(characters[0].name).toBe('Aragorn')
  })

  it('should accumulate multiple added characters', () => {
    useCharacterStore.getState().addCharacter(makeCharacter({ id: 'char-1', name: 'Aragorn' }))
    useCharacterStore.getState().addCharacter(makeCharacter({ id: 'char-2', name: 'Legolas' }))
    expect(useCharacterStore.getState().characters).toHaveLength(2)
  })
})

describe('getCharacter', () => {
  it('should return the correct character by id', () => {
    const char = makeCharacter({ id: 'char-42', name: 'Gimli' })
    useCharacterStore.getState().addCharacter(char)
    const found = useCharacterStore.getState().getCharacter('char-42')
    expect(found).toBeDefined()
    expect(found?.name).toBe('Gimli')
  })

  it('should return undefined for a non-existent id', () => {
    const result = useCharacterStore.getState().getCharacter('does-not-exist')
    expect(result).toBeUndefined()
  })
})

describe('updateCharacter', () => {
  it('should update the name of an existing character', () => {
    const char = makeCharacter({ id: 'char-1', name: 'Old Name' })
    useCharacterStore.getState().addCharacter(char)
    useCharacterStore.getState().updateCharacter('char-1', { name: 'New Name' })
    const updated = useCharacterStore.getState().getCharacter('char-1')
    expect(updated?.name).toBe('New Name')
  })

  it('should update updatedAt when a character is modified', () => {
    const originalTime = new Date('2024-01-01T00:00:00.000Z').toISOString()
    const char = makeCharacter({ id: 'char-1', updatedAt: originalTime })
    useCharacterStore.getState().addCharacter(char)
    useCharacterStore.getState().updateCharacter('char-1', { name: 'Changed' })
    const updated = useCharacterStore.getState().getCharacter('char-1')
    expect(updated?.updatedAt).not.toBe(originalTime)
  })

  it('should not affect other characters in the store', () => {
    useCharacterStore.getState().addCharacter(makeCharacter({ id: 'char-1', name: 'Alpha' }))
    useCharacterStore.getState().addCharacter(makeCharacter({ id: 'char-2', name: 'Beta' }))
    useCharacterStore.getState().updateCharacter('char-1', { name: 'Alpha Updated' })
    const beta = useCharacterStore.getState().getCharacter('char-2')
    expect(beta?.name).toBe('Beta')
  })
})

describe('deleteCharacter', () => {
  it('should remove the character from the store', () => {
    useCharacterStore.getState().addCharacter(makeCharacter({ id: 'char-1' }))
    useCharacterStore.getState().deleteCharacter('char-1')
    expect(useCharacterStore.getState().characters).toHaveLength(0)
  })

  it('should only remove the targeted character', () => {
    useCharacterStore.getState().addCharacter(makeCharacter({ id: 'char-1', name: 'Keep Me' }))
    useCharacterStore.getState().addCharacter(makeCharacter({ id: 'char-2', name: 'Delete Me' }))
    useCharacterStore.getState().deleteCharacter('char-2')
    const { characters } = useCharacterStore.getState()
    expect(characters).toHaveLength(1)
    expect(characters[0].name).toBe('Keep Me')
  })

  it('should not throw when deleting an id that does not exist', () => {
    expect(() => {
      useCharacterStore.getState().deleteCharacter('nonexistent-id')
    }).not.toThrow()
  })
})

describe('localStorage persistence', () => {
  it('should write to localStorage when a character is added', () => {
    const char = makeCharacter({ id: 'char-persist', name: 'Persisted' })
    useCharacterStore.getState().addCharacter(char)
    const raw = localStorage.getItem('pathfinder-nexus-characters')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    // Zustand persist stores state under a `state` key
    expect(parsed.state.characters).toHaveLength(1)
    expect(parsed.state.characters[0].name).toBe('Persisted')
  })
})
