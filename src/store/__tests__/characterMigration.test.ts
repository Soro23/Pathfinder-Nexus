import { describe, expect, it } from 'vitest'
import { deriveProgressionFromLevelHistory } from '../../engine/characterProgression'
import { makeCharacter } from '../../test/fixtures'
import { inferLevelHistory, normalizeCharacter } from '../characterMigration'

describe('characterMigration', () => {
  it('crea historial retroactivo inferido para personajes antiguos', () => {
    const character = makeCharacter({
      classes: [
        { id: 'fighter', level: 2, archetypeIds: ['two-handed-fighter'] },
        { id: 'wizard', level: 1, archetypeIds: [] },
      ],
      level: 3,
      hp: { current: 24, max: 24, temp: 0 },
      feats: [{ id: 'power-attack' }, { id: 'cleave' }],
      skills: [{ id: 'climb', ranks: 2 }, { id: 'knowledge_arcana', ranks: 1 }],
      levelHistory: undefined,
    })

    const normalized = normalizeCharacter(character)

    expect(normalized.levelHistory).toHaveLength(3)
    expect(normalized.levelHistory?.every((choice) => choice.inferred)).toBe(true)
    expect(normalized.levelHistory?.[0].archetypeIds).toEqual(['two-handed-fighter'])
    expect(normalized.levelHistory?.reduce((sum, choice) => sum + choice.hpGained, 0)).toBe(24)
  })

  it('completa huecos de historial sin duplicar niveles ya existentes', () => {
    const character = makeCharacter({
      classes: [{ id: 'fighter', level: 2, archetypeIds: [] }],
      level: 2,
      levelHistory: [{
        characterLevel: 1,
        classId: 'fighter',
        classLevel: 1,
        archetypeIds: [],
        hpMode: 'manual',
        hpRolled: null,
        hpGained: 10,
        featIds: [],
        skillRanksSpent: {},
        source: 'creation',
        createdAt: '2024-01-01T00:00:00.000Z',
      }],
    })

    const normalized = normalizeCharacter(character)

    expect(normalized.levelHistory).toHaveLength(2)
    expect(normalized.levelHistory?.[0].source).toBe('creation')
    expect(normalized.levelHistory?.[1].source).toBe('retroactive')
  })

  it('deriva clases, PG, habilidades y dotes desde el historial', () => {
    const history = inferLevelHistory(makeCharacter({
      classes: [{ id: 'fighter', level: 2, archetypeIds: [] }],
      level: 2,
      hp: { current: 18, max: 18, temp: 0 },
      feats: [{ id: 'power-attack' }],
      skills: [{ id: 'climb', ranks: 2 }],
    }))

    const derived = deriveProgressionFromLevelHistory(history)

    expect(derived.level).toBe(2)
    expect(derived.classes).toEqual([{ id: 'fighter', level: 2, archetypeIds: [] }])
    expect(derived.hpMax).toBe(18)
    expect(derived.feats).toEqual([{ id: 'power-attack' }])
    expect(derived.skills).toEqual([{ id: 'climb', ranks: 2 }])
  })
})
