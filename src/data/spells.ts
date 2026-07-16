export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface Spell {
  id: string
  name: string
  school: string
  subschool?: string
  descriptor?: string
  level: SpellLevel
  type: 'arcane' | 'divine' | 'both'
  /** classLists maps classId -> spell level for that class (may differ from generic level) */
  classLists?: Record<string, SpellLevel>
  castingTime: string
  range: string
  target?: string
  area?: string
  effect?: string
  duration: string
  savingThrow?: string
  spellResistance?: string
  description: string
  material?: string
  arcaneFocus?: string
  divineFocus?: string
  costlyComponents?: string
  /** Editorial: NULL/undefined = Paizo (oficial), con valor = contenido de terceros. */
  source?: string
}

export const SPELL_TYPES = [
  { value: 'all', label: 'Todos' },
  { value: 'arcane', label: 'Arcano' },
  { value: 'divine', label: 'Divino' },
  { value: 'both', label: 'Ambos' },
] as const

export const SPELL_SCHOOLS = [
  'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
  'Evocation', 'Illusion', 'Necromancy', 'Transmutation', 'Universal'
]

export const SPELL_DESCRIPTORS = [
  'Acid', 'Air', 'Chaotic', 'Cold', 'Darkness', 'Death', 'Earth',
  'Electricity', 'Evil', 'Fear', 'Fire', 'Force', 'Good', 'Language-dependent',
  'Lawful', 'Light', 'Mind-affecting', 'Sonic'
]

export function calculateSpellDC(spellLevel: SpellLevel, casterAbilityModifier: number, focusBonus: number = 0): number {
  return 10 + spellLevel + casterAbilityModifier + focusBonus
}
