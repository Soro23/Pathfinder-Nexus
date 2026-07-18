/**
 * Tests de computeCompanionStats con fixtures reales extraídos de la tabla Supabase
 * animal_companions (Allosaurus con avance a nivel 7, Beetle Giant con avance a nivel 4,
 * Basilisk como caso con Int nula).
 */

import { describe, it, expect } from 'vitest'
import { computeCompanionStats } from '../companion'
import type { CompanionDetail } from '../../types/animalCompanion'

const ALLOSAURUS: CompanionDetail = {
  id: 'allosaurus',
  name: 'Allosaurus',
  companionType: 'animal',
  sizeStart: 'Medium',
  sizeAdvanced: 'Large',
  advancementLevel: 7,
  starting: {
    size: 'Medium',
    speed: { land: 40, text: '40 ft' },
    ac_text: '+4 natural armor',
    attacks: ['bite (1d6)', '2 claws (1d4)'],
    natural_armor: 4,
    ability_scores: { cha: 10, con: 10, dex: 16, int: 2, str: 14, wis: 15 },
    special_qualities: 'low-light vision, scent',
  },
  advancement: {
    size: 'Large',
    ac_text: '+2 natural armor',
    attacks: ['bite (1d8)', '2 claws (1d6)'],
    natural_armor: 2,
    ability_scores: { con: 4, dex: -2, str: 8 },
    special_qualities: 'grab, pounce',
  },
}

const BEETLE_GIANT: CompanionDetail = {
  id: 'beetle_giant',
  name: 'Beetle, Giant',
  companionType: 'vermin',
  sizeStart: 'Small',
  sizeAdvanced: 'Medium',
  advancementLevel: 4,
  starting: {
    size: 'Small',
    speed: { fly: 20, land: 20, text: '20 ft., fly 20 ft. (poor)', fly_maneuverability: 'poor' },
    ac_text: '+6 natural armor',
    attacks: ['bite (1d6)'],
    natural_armor: 6,
    ability_scores: { cha: 4, con: 13, dex: 12, int: null, str: 13, wis: 11 },
    special_qualities: 'darkvision',
  },
  advancement: {
    size: 'Medium',
    attacks: ['bite (1d8)'],
    ability_scores: { con: 2, dex: -2, str: 4 },
    special_attacks: 'trample (1d4)',
  },
}

describe('computeCompanionStats', () => {
  it('a nivel bajo (sin avance) usa el statblock "starting" tal cual + progresión de nivel', () => {
    const stats = computeCompanionStats(ALLOSAURUS, 1)
    // Progresión nivel 1: naBonus 0, strDexBonus 0
    expect(stats.naturalArmor).toBe(4)
    expect(stats.str).toBe(14)
    expect(stats.dex).toBe(16)
    expect(stats.con).toBe(10)
    // CA = 10 + mod(DES=16 → +3) + NA 4 + tamaño Mediano (0) = 17
    expect(stats.ac).toBe(17)
    expect(stats.attacks).toEqual([
      { name: 'bite', damage: '1d6' },
      { name: '2 claws', damage: '1d4' },
    ])
  })

  it('al alcanzar advancement_level aplica los deltas y sustituye ataques/tamaño', () => {
    const stats = computeCompanionStats(ALLOSAURUS, 7)
    // Progresión nivel 7: naBonus 4, strDexBonus 2
    // NA = starting(4) + delta(2) + progresión(4) = 10
    expect(stats.naturalArmor).toBe(10)
    // STR = 14 + delta(8) + progresión(2) = 24 ; DEX = 16 + delta(-2) + progresión(2) = 16
    expect(stats.str).toBe(24)
    expect(stats.dex).toBe(16)
    // CON = 10 + delta(4) = 14 (CON no recibe bono de progresión)
    expect(stats.con).toBe(14)
    // Tamaño Grande → modificador de tamaño a CA -1. CA = 10 + mod(DES=16→+3) + NA 10 + (-1) = 22
    expect(stats.ac).toBe(22)
    expect(stats.attacks).toEqual([
      { name: 'bite', damage: '1d8' },
      { name: '2 claws', damage: '1d6' },
    ])
    expect(stats.special).toContain('grab')
    expect(stats.special).toContain('pounce')
    expect(stats.special).toContain('low-light vision') // las cualidades de starting se mantienen
  })

  it('no aplica advancement por debajo del nivel requerido aunque exista en el catálogo', () => {
    const stats = computeCompanionStats(ALLOSAURUS, 6)
    // NA = starting(4) + delta advancement (no aplica) + progresión nivel 6 (4) = 8
    expect(stats.naturalArmor).toBe(8)
    expect(stats.attacks).toEqual([
      { name: 'bite', damage: '1d6' },
      { name: '2 claws', damage: '1d4' },
    ])
  })

  it('una puntuación de característica nula (ej. Int en alimañas) se expone como undefined, sin modificador', () => {
    const stats = computeCompanionStats(BEETLE_GIANT, 1)
    expect(stats.int).toBeUndefined()
    expect(stats.str).toBe(13)
  })

  it('tras el avance, las cualidades especiales de starting y advancement se combinan', () => {
    const stats = computeCompanionStats(BEETLE_GIANT, 4)
    expect(stats.special).toContain('darkvision')
    expect(stats.special).toContain('trample (1d4)')
  })
})
