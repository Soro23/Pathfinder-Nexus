import { describe, expect, it } from 'vitest'
import { getBonusSpells } from '../../data/bonusSpells'
import { getClassById } from '../../data/classes'
import { computeSyncedSpellSlots } from '../spellSlots'

const abilities = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 18,
  wisdom: 16,
  charisma: 10,
}

describe('spellSlots.ts', () => {
  it('devuelve null cuando no hay clases lanzadoras', () => {
    expect(computeSyncedSpellSlots([{ id: 'fighter', level: 5 }], abilities, {})).toBeNull()
  })

  it('suma los espacios de varias clases lanzadoras por nivel de conjuro', () => {
    const classes = [
      { id: 'wizard', level: 3 },
      { id: 'cleric', level: 3 },
    ]
    const wizard = getClassById('wizard')!
    const cleric = getClassById('cleric')!
    const wizardRow = wizard.spellsPerDay![2]
    const clericRow = cleric.spellsPerDay![2]

    const slots = computeSyncedSpellSlots(classes, abilities, {})!

    expect(slots[0].max).toBe((wizardRow[0] ?? 0) + (clericRow[0] ?? 0))
    expect(slots[1].max).toBe(
      (wizardRow[1] ?? 0) + getBonusSpells(abilities.intelligence)[1]
      + (clericRow[1] ?? 0) + getBonusSpells(abilities.wisdom)[1],
    )
    expect(slots[2].max).toBe(
      (wizardRow[2] ?? 0) + getBonusSpells(abilities.intelligence)[2]
      + (clericRow[2] ?? 0) + getBonusSpells(abilities.wisdom)[2],
    )
  })

  it('conserva los usos actuales sin superar el nuevo maximo', () => {
    const slots = computeSyncedSpellSlots(
      [{ id: 'wizard', level: 1 }],
      abilities,
      { 1: { max: 9, used: 9 } },
    )!

    expect(slots[1].used).toBe(slots[1].max)
  })
})
