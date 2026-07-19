import type { Character } from '../store/characterStore'
import { calculateModifier } from '../store/characterStore'
import { getMulticlassStats } from '../data/classes'
import { getCharacterSize, getSizeACModifier, getSizeCMBModifier } from './size'
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

// Dex efectiva para CA: topada por el maxDex de la armadura corporal equipada.
// El tope aplica también a la CA de toque — es una restricción sobre el propio
// modificador de Destreza, no sobre el bono de armadura (que sí se excluye del toque).
function getDexForAC(character: Character, dexMod: number): number {
  const equippedBody = (character.armor ?? []).find((a) => a.equipped && a.type !== 'shield')
  return equippedBody ? Math.min(dexMod, equippedBody.maxDex ?? 99) : dexMod
}

// Fuente única de las estadísticas de combate derivadas (CA, salvaciones, BAB, CMB/CMD,
// iniciativa). Sustituye a las implementaciones duplicadas que existían en CharacterView,
// PlayMode, ArsenalManager y PartyCard.
export function computeCombatStats(character: Character, resolvedStats: ResolvedStats): CombatStats {
  const { abilities } = character
  const strMod = calculateModifier(abilities.strength)
  const dexMod = calculateModifier(abilities.dexterity)
  const conMod = calculateModifier(abilities.constitution)
  const intMod = calculateModifier(abilities.intelligence)
  const wisMod = calculateModifier(abilities.wisdom)
  const chaMod = calculateModifier(abilities.charisma)

  const mcStats = getMulticlassStats(character.classes)
  const bab = mcStats.bab
  const negativeLevelPenalty = getNegativeLevelPenalty(character)

  const size = getCharacterSize(character)
  const sizeMod = getSizeACModifier(size)     // se usa también para ataque
  const sizeCmbMod = getSizeCMBModifier(size) // signo opuesto, para CMB/CMD

  const dexForAC = getDexForAC(character, dexMod)
  const { natural, deflection, dodge, armor, shield, total: acMisc } = resolvedStats.acBonuses

  // acMisc son bonos con target genérico 'ac' (p.ej. un efecto de estado creado a mano
  // sin tipo específico). Al no poder saber si son de tipo esquiva/armadura/etc, se
  // aplican en los tres estados de CA por simplicidad.
  const ac = 10 + dexForAC + armor + shield + natural + deflection + dodge + sizeMod + acMisc
  const acTouch = 10 + dexForAC + deflection + dodge + sizeMod + acMisc
  const acFlatFooted = 10 + armor + shield + natural + deflection + sizeMod + acMisc

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
