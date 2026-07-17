import type { WeaponGrip } from '../store/characterStore'

// Bono de Fuerza al daño cuerpo a cuerpo según empuñadura: ×1.5 a dos manos, ×0.5 en mano
// secundaria (redondeando hacia abajo). Las penalizaciones de Fuerza (mod. negativo) nunca
// se multiplican — se aplican siempre completas, por regla SRD.
export function getStrDamageBonus(strMod: number, grip: WeaponGrip | undefined): number {
  if (strMod <= 0) return strMod
  if (grip === 'two-handed') return Math.floor(strMod * 1.5)
  if (grip === 'off-hand') return Math.floor(strMod * 0.5)
  return strMod
}

// Bono de daño de Ataque Poderoso según empuñadura: ×2 una mano, ×3 a dos manos, ×1 en mano
// secundaria (mitad del bono a una mano).
export function getPowerAttackDamageBonus(penalty: number, grip: WeaponGrip | undefined): number {
  if (grip === 'two-handed') return penalty * 3
  if (grip === 'off-hand') return penalty * 1
  return penalty * 2
}
