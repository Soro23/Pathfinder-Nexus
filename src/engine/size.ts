import { RACES } from '../data/races'

export type CreatureSize =
  | 'fine' | 'diminutive' | 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan' | 'colossal'

// Modificador de tamaño estándar a CA y a la tirada de ataque (Pequeño +1, Grande -1, ...).
const SIZE_AC_ATTACK_MOD: Record<CreatureSize, number> = {
  fine: 8, diminutive: 4, tiny: 2, small: 1, medium: 0, large: -1, huge: -2, gargantuan: -4, colossal: -8,
}

// Modificador especial de tamaño para CMB/CMD — signo opuesto al de CA/ataque (Pequeño -1, Grande +1, ...).
const SIZE_CMB_MOD: Record<CreatureSize, number> = {
  fine: -8, diminutive: -4, tiny: -2, small: -1, medium: 0, large: 1, huge: 2, gargantuan: 4, colossal: 8,
}

const SIZE_STEALTH_MOD: Record<CreatureSize, number> = {
  fine: 16, diminutive: 12, tiny: 8, small: 4, medium: 0, large: -4, huge: -8, gargantuan: -12, colossal: -16,
}

const SIZE_FLY_MOD: Record<CreatureSize, number> = {
  fine: 8, diminutive: 6, tiny: 4, small: 2, medium: 0, large: -2, huge: -4, gargantuan: -6, colossal: -8,
}

export function getSizeACModifier(size: CreatureSize): number {
  return SIZE_AC_ATTACK_MOD[size] ?? 0
}

export function getSizeCMBModifier(size: CreatureSize): number {
  return SIZE_CMB_MOD[size] ?? 0
}

// Solo Sigilo y Volar reciben un modificador de tamaño en Pathfinder 1e; el resto de habilidades no.
export function getSizeSkillModifier(size: CreatureSize, skillId: string): number {
  if (skillId === 'stealth') return SIZE_STEALTH_MOD[size] ?? 0
  if (skillId === 'fly') return SIZE_FLY_MOD[size] ?? 0
  return 0
}

// Tamaño del personaje según su raza (por defecto Mediano si la raza no se reconoce).
export function getCharacterSize(character: { race: string }): CreatureSize {
  const raceData = RACES.find((r) => r.id === character.race?.toLowerCase())
  return raceData?.size ?? 'medium'
}

// Normaliza un nombre de tamaño en texto libre (ej. "Tiny", "Large" de un statblock
// importado) a la clave interna de CreatureSize. Por defecto Mediano si no se reconoce.
export function normalizeSizeString(size: string | null | undefined): CreatureSize {
  const key = size?.trim().toLowerCase()
  const valid: CreatureSize[] = ['fine', 'diminutive', 'tiny', 'small', 'medium', 'large', 'huge', 'gargantuan', 'colossal']
  return (valid as string[]).includes(key ?? '') ? (key as CreatureSize) : 'medium'
}
