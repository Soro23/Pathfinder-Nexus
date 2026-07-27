import type { Character } from '../store/characterStore'
import { calculateModifier } from '../store/characterStore'
import { getMulticlassStats } from '../data/classes'
import { getCharacterSize, getSizeACModifier, getSizeCMBModifier } from './size'
import { getEncumbranceDexCap, getEncumbranceLevel } from './carryingCapacity'
import type { ResolvedStats } from './types'

export interface CombatStats {
  bab: number
  strMod: number
  dexMod: number
  conMod: number
  intMod: number
  wisMod: number
  chaMod: number
  sizeMod: number
  ac: number
  acTouch: number
  acFlatFooted: number
  fortitude: number
  reflex: number
  will: number
  cmb: number
  cmd: number
  initiative: number
  negativeLevelPenalty: number
}

export function getNegativeLevelPenalty(character: Pick<Character, 'negativeLevels'>): number {
  return Math.max(0, character.negativeLevels ?? 0)
}

export function computeEffectiveMaxHp(character: Character, resolvedStats: ResolvedStats): number {
  return Math.max(1, character.hp.max + resolvedStats.hpBonus - getNegativeLevelPenalty(character) * 5)
}

// Dex efectiva para CA: topada por el maxDex de la armadura corporal equipada y por el
// tope de Destreza de la carga (encumbrance), usando el más restrictivo de los dos.
// El tope aplica también a la CA de toque — es una restricción sobre el propio
// modificador de Destreza, no sobre el bono de armadura (que sí se excluye del toque).
function getDexForAC(character: Character, dexMod: number, encumbranceDexCap: number | null): number {
  const equippedBody = (character.armor ?? []).find((a) => a.equipped && a.type !== 'shield')
  const armorCap = equippedBody ? equippedBody.maxDex ?? 99 : 99
  const cap = encumbranceDexCap === null ? armorCap : Math.min(armorCap, encumbranceDexCap)
  return Math.min(dexMod, cap)
}

// Fuente única de las estadísticas de combate derivadas (CA, salvaciones, BAB, CMB/CMD,
// iniciativa). Sustituye a las implementaciones duplicadas que existían en CharacterView,
// PlayMode, ArsenalManager y PartyCard. `totalWeight` (peso total del inventario) se usa
// para derivar el tope de Destreza y —a través de skills.ts— la penalización de habilidad
// por llevar carga media/pesada, combinándolos con los de la armadura equipada.
export function computeCombatStats(character: Character, resolvedStats: ResolvedStats, totalWeight = 0): CombatStats {
  const { abilities } = character
  const { abilityBonuses } = resolvedStats
  const strMod = calculateModifier(abilities.strength) + abilityBonuses.str
  const dexMod = calculateModifier(abilities.dexterity) + abilityBonuses.dex
  const conMod = calculateModifier(abilities.constitution) + abilityBonuses.con
  const intMod = calculateModifier(abilities.intelligence) + abilityBonuses.int
  const wisMod = calculateModifier(abilities.wisdom) + abilityBonuses.wis
  const chaMod = calculateModifier(abilities.charisma) + abilityBonuses.cha

  const mcStats = getMulticlassStats(character.classes)
  const bab = mcStats.bab
  const negativeLevelPenalty = getNegativeLevelPenalty(character)

  const size = getCharacterSize(character)
  const sizeMod = getSizeACModifier(size)     // se usa también para ataque
  const sizeCmbMod = getSizeCMBModifier(size) // signo opuesto, para CMB/CMD

  const encumbranceLevel = getEncumbranceLevel(totalWeight, abilities.strength)
  const encumbranceDexCap = getEncumbranceDexCap(encumbranceLevel)
  const dexForAC = getDexForAC(character, dexMod, encumbranceDexCap)
  const { natural, deflection, dodge, armor, shield, total: acMisc } = resolvedStats.acBonuses

  // acMisc son bonos con target genérico 'ac' (p.ej. un efecto de estado creado a mano
  // sin tipo específico). Al no poder saber si son de tipo esquiva/armadura/etc, se
  // aplican en los tres estados de CA por simplicidad.
  const ac = 10 + dexForAC + armor + shield + natural + deflection + dodge + sizeMod + acMisc
  const acTouch = 10 + dexForAC + deflection + dodge + sizeMod + acMisc
  // Desprevenido: se pierde el bonificador de Destreza (y el de esquiva), pero se conserva
  // cualquier penalización de Destreza — un modificador negativo nunca es un "bonificador".
  const acFlatFooted = 10 + Math.min(dexForAC, 0) + armor + shield + natural + deflection + sizeMod + acMisc

  const fortitude = mcStats.fortitude + conMod + resolvedStats.saveBonuses.fort - negativeLevelPenalty
  const reflex = mcStats.reflex + dexMod + resolvedStats.saveBonuses.ref - negativeLevelPenalty
  const will = mcStats.will + wisMod + resolvedStats.saveBonuses.will - negativeLevelPenalty

  const cmb = bab + strMod + sizeCmbMod + resolvedStats.cmbBonus - negativeLevelPenalty
  const cmd = 10 + bab + strMod + dexMod + sizeCmbMod + resolvedStats.cmdBonus - negativeLevelPenalty

  const initiative = dexMod + resolvedStats.initiativeBonus - negativeLevelPenalty

  return {
    bab, strMod, dexMod, conMod, intMod, wisMod, chaMod, sizeMod,
    ac, acTouch, acFlatFooted,
    fortitude, reflex, will,
    cmb, cmd,
    initiative,
    negativeLevelPenalty,
  }
}

// Bono de ataque de un arma concreta: BAB + mod. característica + bono propio del arma
// + modificador de tamaño + modificadores del motor (dotes, objetos, efectos). Sustituye
// a las versiones parciales de WeaponManager/ArsenalManager que omitían resolvedStats.attackBonus.
export function computeWeaponAttackBonus(
  bab: number,
  abilityMod: number,
  weaponBonus: number,
  resolvedStats: ResolvedStats,
  sizeMod = 0,
  negativeLevelPenalty = 0,
): number {
  return bab + abilityMod + weaponBonus + resolvedStats.attackBonus + sizeMod - negativeLevelPenalty
}

// Ataques iterativos: a partir de BAB +6 se gana un ataque adicional cada +5 de BAB
// (hasta 4 ataques a BAB +16), cada uno a −5 acumulativo respecto al anterior. Devuelve
// los descuentos a restar del bono de ataque principal (0 para el primer ataque).
export function getIterativeAttackOffsets(bab: number): number[] {
  const offsets: number[] = [0]
  for (let threshold = 6; threshold <= bab && offsets.length < 4; threshold += 5) {
    offsets.push(offsets.length * 5)
  }
  return offsets
}
