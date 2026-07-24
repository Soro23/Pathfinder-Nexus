// Tabla oficial de capacidad de carga (Pathfinder Core Rulebook, Tabla 7-9), índice = Fuerza (1-20).
const LIGHT_LOAD =  [0, 3, 6, 10, 13, 16, 20, 23, 26, 30, 33, 38, 43, 50, 58, 66, 76, 86, 100, 116, 133]
const MEDIUM_LOAD = [0, 6, 13, 20, 26, 33, 40, 46, 53, 60, 66, 76, 86, 100, 116, 133, 153, 173, 200, 233, 266]
const HEAVY_LOAD =  [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 115, 130, 150, 175, 200, 230, 260, 300, 350, 400]

// Por cada 10 puntos de Fuerza por encima de 20, la capacidad de carga se multiplica ×4.
function scaledStrIndex(strength: number): { idx: number; multiplier: number } {
  let str = Math.max(1, Math.round(strength))
  let multiplier = 1
  while (str > 20) {
    str -= 10
    multiplier *= 4
  }
  return { idx: str, multiplier }
}

export interface CarryingCapacityTiers {
  light: number
  medium: number
  heavy: number
}

export function getCarryingCapacityTiers(strength: number): CarryingCapacityTiers {
  const { idx, multiplier } = scaledStrIndex(strength)
  return {
    light: LIGHT_LOAD[idx] * multiplier,
    medium: MEDIUM_LOAD[idx] * multiplier,
    heavy: HEAVY_LOAD[idx] * multiplier,
  }
}

// Capacidad de carga máxima (umbral "pesada") — el número que se muestra habitualmente
// como "capacidad de carga" de un personaje.
export function getCarryingCapacity(strength: number): number {
  return getCarryingCapacityTiers(strength).heavy
}

export type EncumbranceLevel = 'light' | 'medium' | 'heavy' | 'overloaded'

export function getEncumbranceLevel(totalWeight: number, strength: number): EncumbranceLevel {
  const { light, medium, heavy } = getCarryingCapacityTiers(strength)
  if (totalWeight <= light) return 'light'
  if (totalWeight <= medium) return 'medium'
  if (totalWeight <= heavy) return 'heavy'
  return 'overloaded'
}

// Tope de Destreza a CA por carga (Tabla: Carrying Capacity). Carga ligera no impone tope
// (null). Sobrecargado se trata como carga pesada a estos efectos (el SRD no define un
// tope propio más allá del de carga pesada).
export function getEncumbranceDexCap(level: EncumbranceLevel): number | null {
  if (level === 'medium') return 3
  if (level === 'heavy' || level === 'overloaded') return 1
  return null
}

// Penalización a pruebas de habilidad por carga, idéntica en efecto a la penalización de
// armadura (no se acumulan entre sí, se aplica la más restrictiva de las dos).
export function getEncumbranceSkillPenalty(level: EncumbranceLevel): number {
  if (level === 'medium') return -3
  if (level === 'heavy' || level === 'overloaded') return -6
  return 0
}
