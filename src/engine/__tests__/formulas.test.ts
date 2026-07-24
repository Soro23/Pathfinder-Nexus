/**
 * Tests de las fórmulas añadidas/corregidas en la auditoría de reglas Pathfinder:
 * tamaño (size.ts), puntos/total de habilidad (skills.ts), daño de arma según
 * empuñadura (weapon.ts), capacidad de carga (carryingCapacity.ts) y velocidad (speed.ts).
 */

import { describe, it, expect } from 'vitest'
import { makeCharacter } from '../../test/fixtures'
import { getCharacterSize, getSizeACModifier, getSizeCMBModifier, getSizeSkillModifier } from '../size'
import { computeSkillPointsAvailable, computeSkillTotal, isClassSkillForCharacter } from '../skills'
import { getStrDamageBonus, getPowerAttackDamageBonus } from '../weapon'
import { getCarryingCapacity, getCarryingCapacityTiers, getEncumbranceLevel, getEncumbranceDexCap, getEncumbranceSkillPenalty } from '../carryingCapacity'
import { computeSpeed } from '../speed'
import { computeCombatStats, computeEffectiveMaxHp, computeWeaponAttackBonus } from '../combatStats'
import { getExpectedFeatCount } from '../levelProgression'
import type { ResolvedStats } from '../types'

const EMPTY_RESOLVED: ResolvedStats = {
  skillBonuses: {},
  saveBonuses: { fort: 0, ref: 0, will: 0 },
  acBonuses: { natural: 0, deflection: 0, dodge: 0, armor: 0, shield: 0, total: 0 },
  abilityBonuses: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
  initiativeBonus: 0, attackBonus: 0, damageBonus: 0,
  hpBonus: 0, speedBonus: 0, cmbBonus: 0, cmdBonus: 0, allModifiers: [],
}

describe('size.ts', () => {
  it('resuelve Mediano para razas sin tamaño reconocido o Humano', () => {
    expect(getCharacterSize(makeCharacter({ race: 'human' }))).toBe('medium')
    expect(getCharacterSize(makeCharacter({ race: 'no-existe' }))).toBe('medium')
  })

  it('resuelve Pequeño para Halfling', () => {
    expect(getCharacterSize(makeCharacter({ race: 'halfling' }))).toBe('small')
  })

  it('modificador de tamaño a CA/ataque: Pequeño +1, Mediano 0, Grande -1', () => {
    expect(getSizeACModifier('small')).toBe(1)
    expect(getSizeACModifier('medium')).toBe(0)
    expect(getSizeACModifier('large')).toBe(-1)
  })

  it('modificador especial de tamaño a CMB/CMD es el opuesto al de CA', () => {
    expect(getSizeCMBModifier('small')).toBe(-1)
    expect(getSizeCMBModifier('large')).toBe(1)
    expect(getSizeCMBModifier('medium')).toBe(0)
  })

  it('Sigilo y Volar reciben modificador de tamaño; el resto de habilidades no', () => {
    expect(getSizeSkillModifier('small', 'stealth')).toBe(4)
    expect(getSizeSkillModifier('small', 'fly')).toBe(2)
    expect(getSizeSkillModifier('small', 'perception')).toBe(0)
  })
})

describe('skills.ts — puntos de habilidad', () => {
  it('suma el mod. Int a la base de la clase, con mínimo 1 por nivel', () => {
    const fighterIntPos = makeCharacter({
      race: 'dwarf',
      classes: [{ id: 'fighter', level: 3 }],
      abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 16, wisdom: 10, charisma: 10 },
    })
    // Fighter: 2 base + 3 (mod Int 16) = 5/nivel × 3 niveles = 15
    expect(computeSkillPointsAvailable(fighterIntPos, 0)).toBe(15)
  })

  it('aplica el mínimo de 1 punto/nivel incluso con Int muy baja', () => {
    const lowInt = makeCharacter({
      race: 'dwarf',
      classes: [{ id: 'fighter', level: 2 }],
      abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 6, wisdom: 10, charisma: 10 },
    })
    // Fighter: 2 base + (-2 mod) = 0 → mínimo 1/nivel × 2 = 2
    expect(computeSkillPointsAvailable(lowInt, 0)).toBe(2)
  })

  it('soporta multiclase: cada clase aporta según su propia base', () => {
    const multiclass = makeCharacter({
      race: 'dwarf',
      classes: [{ id: 'fighter', level: 2 }, { id: 'rogue', level: 1 }],
      abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    })
    // Fighter: 2/nivel × 2 = 4. Rogue: 8/nivel × 1 = 8. Total = 12
    expect(computeSkillPointsAvailable(multiclass, 0)).toBe(12)
  })

  it('resta los rangos ya gastados', () => {
    const c = makeCharacter({ race: 'dwarf', classes: [{ id: 'fighter', level: 1 }] })
    expect(computeSkillPointsAvailable(c, 1)).toBe(1) // 2 base - 1 gastado
  })

  it('Humano: +1 punto de habilidad adicional por cada nivel de personaje', () => {
    const human = makeCharacter({
      race: 'human',
      classes: [{ id: 'fighter', level: 3 }],
      abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    })
    // Fighter: 2/nivel × 3 niveles = 6. Humano: +1 × 3 niveles = 3. Total = 9
    expect(computeSkillPointsAvailable(human, 0)).toBe(9)
  })
})

describe('skills.ts — total de habilidad', () => {
  const climbSkill = { id: 'climb', name: 'Trepar', ability: 'strength' as const, isClassSkill: true, hasArmorCheckPenalty: true, description: '' }
  const perceptionSkill = { id: 'perception', name: 'Percepción', ability: 'wisdom' as const, isClassSkill: true, hasArmorCheckPenalty: false, description: '' }

  it('rangos + mod. característica + bono de clase (+3 con ≥1 rango)', () => {
    const c = makeCharacter({
      classes: [{ id: 'fighter', level: 1 }],
      skills: [{ id: 'climb', ranks: 1 }],
      abilities: { strength: 14, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    })
    // climb es de clase para fighter: 1 rango + 2 mod FUE + 3 clase = 6
    expect(computeSkillTotal(c, climbSkill, EMPTY_RESOLVED, 0)).toBe(6)
  })

  it('no aplica el bono de clase con 0 rangos', () => {
    const c = makeCharacter({ classes: [{ id: 'fighter', level: 1 }], skills: [] })
    expect(computeSkillTotal(c, climbSkill, EMPTY_RESOLVED, 0)).toBe(0)
  })

  it('aplica la penalización de armadura (ACP) solo si la habilidad la sufre', () => {
    const c = makeCharacter({ classes: [{ id: 'fighter', level: 1 }], skills: [{ id: 'climb', ranks: 1 }] })
    expect(computeSkillTotal(c, climbSkill, EMPTY_RESOLVED, -4)).toBe(1 + 0 + 3 - 4)
    expect(computeSkillTotal(c, perceptionSkill, EMPTY_RESOLVED, -4)).toBe(0) // sin ACP, sin rangos
  })

  it('una habilidad es de clase si lo es en cualquiera de las clases (multiclase)', () => {
    const c = makeCharacter({ classes: [{ id: 'fighter', level: 1 }, { id: 'rogue', level: 1 }] })
    expect(isClassSkillForCharacter(c, 'stealth')).toBe(true) // de clase para rogue, no para fighter
    expect(isClassSkillForCharacter(c, 'knowledge_planes')).toBe(false)
  })

  it('aplica penalizacion de niveles negativos a las habilidades', () => {
    const c = makeCharacter({
      classes: [{ id: 'fighter', level: 1 }],
      skills: [{ id: 'climb', ranks: 1 }],
      negativeLevels: 2,
    })
    expect(computeSkillTotal(c, climbSkill, EMPTY_RESOLVED, 0)).toBe(2)
  })

  it('combina ACP de armadura y penalización por carga usando la más restrictiva de las dos', () => {
    const c = makeCharacter({ classes: [{ id: 'fighter', level: 1 }], skills: [{ id: 'climb', ranks: 1 }] })
    // ACP -2, carga -6 (pesada): se aplica -6 (más restrictiva)
    expect(computeSkillTotal(c, climbSkill, EMPTY_RESOLVED, -2, -6)).toBe(1 + 0 + 3 - 6)
    // ACP -6, carga -2: se aplica -6 (más restrictiva)
    expect(computeSkillTotal(c, climbSkill, EMPTY_RESOLVED, -6, -2)).toBe(1 + 0 + 3 - 6)
    // La penalización por carga no aplica a habilidades sin ACP
    expect(computeSkillTotal(c, perceptionSkill, EMPTY_RESOLVED, 0, -6)).toBe(0)
  })
})

describe('negative levels', () => {
  it('penaliza salvaciones, CMB/CMD, iniciativa y ataques', () => {
    const c = makeCharacter({
      classes: [{ id: 'fighter', level: 1 }],
      negativeLevels: 1,
    })
    const combat = computeCombatStats(c, EMPTY_RESOLVED)

    expect(combat.fortitude).toBe(1)
    expect(combat.reflex).toBe(-1)
    expect(combat.will).toBe(-1)
    expect(combat.cmb).toBe(0)
    expect(combat.cmd).toBe(10)
    expect(combat.initiative).toBe(-1)
    expect(computeWeaponAttackBonus(combat.bab, combat.strMod, 0, EMPTY_RESOLVED, combat.sizeMod, combat.negativeLevelPenalty)).toBe(0)
  })

  it('reduce los PV maximos efectivos en 5 por nivel negativo', () => {
    const c = makeCharacter({
      hp: { current: 20, max: 20, temp: 0 },
      negativeLevels: 2,
    })
    expect(computeEffectiveMaxHp(c, EMPTY_RESOLVED)).toBe(10)
  })
})

describe('combatStats.ts — CA desprevenido y tope de Destreza por carga', () => {
  it('CA desprevenido pierde el bono de Destreza pero conserva la penalización', () => {
    const withPositiveDex = makeCharacter({ abilities: { strength: 10, dexterity: 16, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 } })
    const withNegativeDex = makeCharacter({ abilities: { strength: 10, dexterity: 6, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 } })
    // Destreza +3: CA normal 13, desprevenido 10 (sin el bono)
    expect(computeCombatStats(withPositiveDex, EMPTY_RESOLVED).ac).toBe(13)
    expect(computeCombatStats(withPositiveDex, EMPTY_RESOLVED).acFlatFooted).toBe(10)
    // Destreza -2: CA normal 8, desprevenido también 8 (conserva la penalización)
    expect(computeCombatStats(withNegativeDex, EMPTY_RESOLVED).ac).toBe(8)
    expect(computeCombatStats(withNegativeDex, EMPTY_RESOLVED).acFlatFooted).toBe(8)
  })

  it('el tope de Destreza por carga se combina con el de la armadura (el más restrictivo)', () => {
    const c = makeCharacter({
      abilities: { strength: 10, dexterity: 18, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    })
    // Sin carga: Destreza +4 sin tope → CA 14
    expect(computeCombatStats(c, EMPTY_RESOLVED, 0).ac).toBe(14)
    // Carga pesada (FUE 10, carga pesada > 66 lb): tope de Destreza +1 → CA 11
    expect(computeCombatStats(c, EMPTY_RESOLVED, 90).ac).toBe(11)
  })
})

describe('levelProgression.ts — dote adicional de Humano', () => {
  it('Humano recibe una dote adicional respecto a otra raza en el mismo nivel', () => {
    // Mago no tiene dote de bonificación en nivel 1 (solo múltiplos de 5), aísla el bono racial
    const classes = [{ id: 'wizard', level: 1, archetypeIds: [] }]
    expect(getExpectedFeatCount(1, classes, 'dwarf')).toBe(1)
    expect(getExpectedFeatCount(1, classes, 'human')).toBe(2)
  })
})

describe('weapon.ts', () => {
  it('bono de daño de Fuerza: ×1.5 a dos manos, ×0.5 en mano secundaria (redondeado hacia abajo)', () => {
    expect(getStrDamageBonus(4, 'two-handed')).toBe(6)   // 4*1.5 = 6
    expect(getStrDamageBonus(3, 'two-handed')).toBe(4)   // 3*1.5 = 4.5 → 4
    expect(getStrDamageBonus(3, 'off-hand')).toBe(1)     // 3*0.5 = 1.5 → 1
    expect(getStrDamageBonus(4, undefined)).toBe(4)      // una mano, sin cambios
  })

  it('las penalizaciones de Fuerza nunca se multiplican', () => {
    expect(getStrDamageBonus(-2, 'two-handed')).toBe(-2)
    expect(getStrDamageBonus(-2, 'off-hand')).toBe(-2)
  })

  it('bono de daño de Ataque Poderoso: ×2 una mano, ×3 dos manos, ×1 mano secundaria', () => {
    expect(getPowerAttackDamageBonus(2, undefined)).toBe(4)
    expect(getPowerAttackDamageBonus(2, 'two-handed')).toBe(6)
    expect(getPowerAttackDamageBonus(2, 'off-hand')).toBe(2)
  })
})

describe('carryingCapacity.ts', () => {
  it('coincide con la tabla oficial en los valores de referencia', () => {
    expect(getCarryingCapacityTiers(10)).toEqual({ light: 33, medium: 66, heavy: 100 })
    expect(getCarryingCapacityTiers(20)).toEqual({ light: 133, medium: 266, heavy: 400 })
    expect(getCarryingCapacityTiers(8)).toEqual({ light: 26, medium: 53, heavy: 80 })
  })

  it('aplica ×4 por cada 10 puntos de Fuerza por encima de 20', () => {
    expect(getCarryingCapacity(21)).toBe(460)  // heavy(11) * 4 = 115*4
    expect(getCarryingCapacity(30)).toBe(1600) // heavy(20) * 4 = 400*4
  })

  it('clasifica el nivel de carga según el peso total', () => {
    expect(getEncumbranceLevel(30, 10)).toBe('light')
    expect(getEncumbranceLevel(50, 10)).toBe('medium')
    expect(getEncumbranceLevel(90, 10)).toBe('heavy')
    expect(getEncumbranceLevel(150, 10)).toBe('overloaded')
  })

  it('tope de Destreza por carga: ligera sin tope, media +3, pesada/sobrecargada +1', () => {
    expect(getEncumbranceDexCap('light')).toBeNull()
    expect(getEncumbranceDexCap('medium')).toBe(3)
    expect(getEncumbranceDexCap('heavy')).toBe(1)
    expect(getEncumbranceDexCap('overloaded')).toBe(1)
  })

  it('penalización de habilidad por carga: ligera 0, media -3, pesada/sobrecargada -6', () => {
    expect(getEncumbranceSkillPenalty('light')).toBe(0)
    expect(getEncumbranceSkillPenalty('medium')).toBe(-3)
    expect(getEncumbranceSkillPenalty('heavy')).toBe(-6)
    expect(getEncumbranceSkillPenalty('overloaded')).toBe(-6)
  })
})

describe('speed.ts', () => {
  it('usa la velocidad base de la raza', () => {
    expect(computeSpeed(makeCharacter({ race: 'human' }), 0)).toBe(30)
    expect(computeSpeed(makeCharacter({ race: 'halfling' }), 0)).toBe(20)
  })

  it('reduce la velocidad con armadura media o pesada equipada', () => {
    const c = makeCharacter({
      race: 'human',
      armor: [{ id: 'a1', name: 'Cota', type: 'heavy', acBonus: 8, armorCheckPenalty: -6, maxDex: 1, spellFailure: 35, weight: 50, equipped: true }],
    })
    expect(computeSpeed(c, 0)).toBe(20)
  })

  it('no reduce la velocidad con armadura ligera', () => {
    const c = makeCharacter({
      race: 'human',
      armor: [{ id: 'a1', name: 'Cuero', type: 'light', acBonus: 2, armorCheckPenalty: 0, maxDex: 6, spellFailure: 10, weight: 10, equipped: true }],
    })
    expect(computeSpeed(c, 0)).toBe(30)
  })

  it('reduce la velocidad con carga media o pesada aunque no haya armadura', () => {
    const c = makeCharacter({ race: 'human', abilities: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 } })
    expect(computeSpeed(c, 40)).toBe(20) // 40 lb > carga ligera (33) para FUE 10
  })
})
