/**
 * Integration tests for the Zustand character store (useCharacterStore).
 * Tests cover: addCharacter, getCharacter, updateCharacter, deleteCharacter,
 * and Supabase persistence.
 *
 * addCharacter/updateCharacter/deleteCharacter are async and go through
 * Supabase (auth + the `characters` table), so `../../lib/supabase` is
 * mocked with a minimal chainable/awaitable query builder — no real network
 * calls happen in this suite.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCharacterStore } from '../characterStore'
import { supabase } from '../../lib/supabase'
import { makeCharacter } from '../../test/fixtures'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: { getSession: vi.fn() },
    from: vi.fn(),
  },
}))

// Mimics the subset of the supabase-js query builder used by characterStore:
// chain methods (insert/select/update/delete/eq/single) return the builder itself,
// and `then` makes `await builder` resolve — whether or not `.single()` was called.
function createQueryBuilder() {
  let insertedRow: { id: string } | null = null
  const builder: {
    insert: (row: { id: string }) => typeof builder
    select: (columns: string) => typeof builder
    update: (row: unknown) => typeof builder
    delete: () => typeof builder
    eq: (column: string, value: unknown) => typeof builder
    single: () => typeof builder
    then: (resolve: (result: { data: { id: string } | null; error: null }) => void) => void
  } = {
    insert: (row) => { insertedRow = row; return builder },
    select: () => builder,
    update: () => builder,
    delete: () => builder,
    eq: () => builder,
    single: () => builder,
    then: (resolve) => resolve({ data: insertedRow ? { id: insertedRow.id } : null, error: null }),
  }
  return builder
}

beforeEach(() => {
  useCharacterStore.setState({ characters: [] })
  vi.mocked(supabase.auth.getSession).mockResolvedValue({
    data: { session: { user: { id: 'user-1' } } },
  } as Awaited<ReturnType<typeof supabase.auth.getSession>>)
  vi.mocked(supabase.from).mockImplementation(() => createQueryBuilder() as unknown as ReturnType<typeof supabase.from>)
})

describe('addCharacter', () => {
  it('should add a character and make it visible in the characters list', async () => {
    const char = makeCharacter({ id: 'char-1', name: 'Aragorn' })
    await useCharacterStore.getState().addCharacter(char)
    const { characters } = useCharacterStore.getState()
    expect(characters).toHaveLength(1)
    expect(characters[0].name).toBe('Aragorn')
  })

  it('should accumulate multiple added characters', async () => {
    await useCharacterStore.getState().addCharacter(makeCharacter({ id: 'char-1', name: 'Aragorn' }))
    await useCharacterStore.getState().addCharacter(makeCharacter({ id: 'char-2', name: 'Legolas' }))
    expect(useCharacterStore.getState().characters).toHaveLength(2)
  })
})

describe('getCharacter', () => {
  it('should return the correct character by id', async () => {
    const char = makeCharacter({ id: 'char-42', name: 'Gimli' })
    await useCharacterStore.getState().addCharacter(char)
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
  it('should update the name of an existing character', async () => {
    const char = makeCharacter({ id: 'char-1', name: 'Old Name' })
    await useCharacterStore.getState().addCharacter(char)
    await useCharacterStore.getState().updateCharacter('char-1', { name: 'New Name' })
    const updated = useCharacterStore.getState().getCharacter('char-1')
    expect(updated?.name).toBe('New Name')
  })

  it('should update updatedAt when a character is modified', async () => {
    const originalTime = new Date('2024-01-01T00:00:00.000Z').toISOString()
    const char = makeCharacter({ id: 'char-1', updatedAt: originalTime })
    await useCharacterStore.getState().addCharacter(char)
    await useCharacterStore.getState().updateCharacter('char-1', { name: 'Changed' })
    const updated = useCharacterStore.getState().getCharacter('char-1')
    expect(updated?.updatedAt).not.toBe(originalTime)
  })

  it('should not affect other characters in the store', async () => {
    await useCharacterStore.getState().addCharacter(makeCharacter({ id: 'char-1', name: 'Alpha' }))
    await useCharacterStore.getState().addCharacter(makeCharacter({ id: 'char-2', name: 'Beta' }))
    await useCharacterStore.getState().updateCharacter('char-1', { name: 'Alpha Updated' })
    const beta = useCharacterStore.getState().getCharacter('char-2')
    expect(beta?.name).toBe('Beta')
  })
})

describe('deleteCharacter', () => {
  it('should remove the character from the store', async () => {
    await useCharacterStore.getState().addCharacter(makeCharacter({ id: 'char-1' }))
    await useCharacterStore.getState().deleteCharacter('char-1')
    expect(useCharacterStore.getState().characters).toHaveLength(0)
  })

  it('should only remove the targeted character', async () => {
    await useCharacterStore.getState().addCharacter(makeCharacter({ id: 'char-1', name: 'Keep Me' }))
    await useCharacterStore.getState().addCharacter(makeCharacter({ id: 'char-2', name: 'Delete Me' }))
    await useCharacterStore.getState().deleteCharacter('char-2')
    const { characters } = useCharacterStore.getState()
    expect(characters).toHaveLength(1)
    expect(characters[0].name).toBe('Keep Me')
  })

  it('should not throw when deleting an id that does not exist', async () => {
    await expect(useCharacterStore.getState().deleteCharacter('nonexistent-id')).resolves.toBeUndefined()
  })
})

describe('Supabase persistence', () => {
  it('should insert the character into the "characters" table when added', async () => {
    const char = makeCharacter({ id: 'char-persist', name: 'Persisted' })
    await useCharacterStore.getState().addCharacter(char)
    expect(supabase.from).toHaveBeenCalledWith('characters')
  })
})
