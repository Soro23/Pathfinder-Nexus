import type { Character } from '../store/characterStore'
import { RACES } from '../data/races'
import { getEncumbranceLevel } from './carryingCapacity'

// Reducción de velocidad por llevar armadura media/pesada o carga media/pesada (no se
// acumulan entre sí). Solo cubre las velocidades base usadas por las razas del catálogo
// (20 y 30 pies); para cualquier otro valor se aproxima con la regla general (×2/3,
// redondeado al múltiplo de 5 más cercano).
const SPEED_REDUCTION_TABLE: Record<number, number> = {
  10: 5,
  15: 10,
  20: 15,
  30: 20,
  40: 30,
}

function reduceSpeed(baseSpeed: number): number {
  return SPEED_REDUCTION_TABLE[baseSpeed] ?? Math.max(5, Math.round((baseSpeed * 2) / 3 / 5) * 5)
}

// Velocidad de tierra del personaje: velocidad racial, reducida a la velocidad indicada en
// la tabla si lleva armadura media/pesada equipada o si su carga es media/pesada/sobrecargada.
export function computeSpeed(character: Character, totalWeight: number): number {
  const raceData = RACES.find((r) => r.id === character.race?.toLowerCase())
  const baseSpeed = raceData?.speed ?? 30

  const wearsHeavyArmor = (character.armor ?? []).some(
    (a) => a.equipped && (a.type === 'medium' || a.type === 'heavy')
  )
  const encumbrance = getEncumbranceLevel(totalWeight, character.abilities.strength)
  const isEncumbered = encumbrance === 'medium' || encumbrance === 'heavy' || encumbrance === 'overloaded'

  return (wearsHeavyArmor || isEncumbered) ? reduceSpeed(baseSpeed) : baseSpeed
}
