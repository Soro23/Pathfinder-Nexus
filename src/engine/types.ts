export type ModifierType =
  | 'competence'
  | 'enhancement'
  | 'insight'
  | 'luck'
  | 'morale'
  | 'natural'
  | 'circumstance'
  | 'racial'
  | 'deflection'
  | 'dodge'
  | 'sacred'
  | 'profane'
  | 'armor'
  | 'shield'
  | 'untyped'

export type ModifierTarget =
  | 'ac'
  | 'ac_natural'
  | 'ac_deflection'
  | 'ac_dodge'
  | 'ac_armor'
  | 'ac_shield'
  | 'str'
  | 'dex'
  | 'con'
  | 'int'
  | 'wis'
  | 'cha'
  | 'attack'
  | 'damage'
  | 'save_fort'
  | 'save_ref'
  | 'save_will'
  | 'initiative'
  | 'cmb'
  | 'cmd'
  | 'speed'
  | 'hp'
  | `skill:${string}`

export interface Modifier {
  id: string
  source: string
  type: ModifierType
  target: ModifierTarget
  value: number
  condition?: string
  // Para bonuses que escalan con rangos de habilidad (ej: Skill Focus +3, o +6 si ≥10 rangos)
  rankCondition?: {
    skillId: string    // id de la habilidad a comprobar
    minRanks: number   // mínimo de rangos requeridos
    bonusValue: number // valor a usar en lugar de `value` si se cumple la condición
  }
}

export interface ResolvedStats {
  skillBonuses: Record<string, number>
  saveBonuses: { fort: number; ref: number; will: number }
  acBonuses: { natural: number; deflection: number; dodge: number; armor: number; shield: number; total: number }
  abilityBonuses: { str: number; dex: number; con: number; int: number; wis: number; cha: number }
  initiativeBonus: number
  attackBonus: number
  damageBonus: number
  hpBonus: number
  speedBonus: number
  cmbBonus: number
  cmdBonus: number
  allModifiers: Modifier[]
}
