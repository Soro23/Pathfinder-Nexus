export type CompanionType =
  | 'animal' | 'aberration' | 'magical_beast' | 'plant' | 'vermin' | 'third_party' | 'drake'

export const COMPANION_TYPE_LABELS: Record<CompanionType, string> = {
  animal: 'Animal',
  aberration: 'Aberración',
  magical_beast: 'Bestia Mágica',
  plant: 'Planta',
  vermin: 'Alimaña',
  third_party: 'Terceros',
  drake: 'Draco',
}

export interface CompanionSpeed {
  land?: number
  fly?: number
  swim?: number
  climb?: number
  burrow?: number
  fly_maneuverability?: string
  text?: string
}

export interface CompanionAbilityScores {
  str?: number | null
  dex?: number | null
  con?: number | null
  int?: number | null
  wis?: number | null
  cha?: number | null
}

export interface CompanionStatblock {
  size?: string
  speed?: CompanionSpeed
  natural_armor?: number
  ac_text?: string
  attacks?: string[]
  ability_scores?: CompanionAbilityScores
  special_qualities?: string
  special_attacks?: string
  languages?: string
  resist?: string
  cmd?: string | number
  alignment?: string
}

export interface CompanionSpecialAbility {
  name: string
  type: string // 'Ex' | 'Su' | 'Sp' habitualmente
  text: string
}

export interface CompanionMastery {
  level: number
  text: string
  statblock?: Record<string, unknown>
}

export interface CompanionListItem {
  id: string
  name: string
  companionType: CompanionType
  sizeStart?: string
  sizeAdvanced?: string
  source?: string
}

export interface CompanionDetail extends CompanionListItem {
  description?: string
  prerequisites?: string
  advancementLevel?: number
  starting: CompanionStatblock
  advancement?: CompanionStatblock // deltas (ability_scores/natural_armor) con signo; attacks es reemplazo, no delta
  mastery?: CompanionMastery
  specialAbilities?: CompanionSpecialAbility[]
  // Statblock traducido completo (solo disponible en parte del catálogo) — se usa como
  // preferencia de texto vía pickLocalized, con fallback a starting/advancement en inglés.
  startingEs?: CompanionStatblock
  advancementEs?: CompanionStatblock
  drakePowers?: { name: string; text: string }[]
}
