import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { normalizeCharacter } from './characterMigration'

export interface CharacterClass {
  id: string
  level: number
  archetypeIds?: string[]
}

export interface InventoryItem {
  id: string
  name: string
  quantity: number
  weight: number
  equipped: boolean
  notes?: string
  // Optional fields from the items catalog
  itemDbId?: string
  itemType?: string
  priceGp?: number
  magical?: boolean
  consumable?: boolean
  description?: string
}

export interface EquipmentSlot {
  slotId: string
  itemId: string | null
}

export interface CustomSlot {
  id: string
  label: string
}

export interface MiscBonus {
  value: number
  description: string
}

export interface SkillRank {
  id: string
  ranks: number
  miscBonuses?: MiscBonus[]
}

export interface Armor {
  id: string
  name: string
  type: 'light' | 'medium' | 'heavy' | 'shield'
  acBonus: number
  armorCheckPenalty: number
  maxDex: number | null
  spellFailure: number
  weight: number
  equipped: boolean
  notes?: string
}

export interface SpellSlot {
  max: number
  used: number
}

export type WeaponGrip = 'one-handed' | 'two-handed' | 'off-hand'

export interface Weapon {
  id: string
  name: string
  attackBonus: number
  damage: string
  critical: string
  range: string
  type: string
  notes: string
  // Empuñadura cuerpo a cuerpo — afecta al multiplicador de mod. Fuerza en el daño y al
  // bono de daño de Ataque Poderoso. undefined = una mano (comportamiento previo).
  grip?: WeaponGrip
}

export interface AnimalCompanion {
  name: string
  animalTypeId: string          // id from ANIMAL_TYPES e.g. 'wolf'
  level: number
  hp: { current: number; max: number }
  tricks: string[]
  feats: string[]
  customSpecialAbilities: string[]
  attacks: { name: string; bonus: number; damage: string }[]
  skills: Record<string, number>
  notes?: string
}

export interface JournalEntry {
  id: string
  date: string
  content: string
  importantCharacters: { name: string; role: 'ally' | 'enemy' | 'neutral'; notes: string }[]
  discoveredPlaces: { name: string; description: string }[]
}

export type BonusTarget =
  | 'attack'
  | 'damage'
  | 'ac'
  | 'fort'
  | 'ref'
  | 'will'
  | 'initiative'
  | 'cmb'
  | 'cmd'
  | `skill:${string}`

export interface StatusEffect {
  id: string
  name: string
  description: string
  bonusTarget?: BonusTarget
  bonusValue?: number
  duration?: string
  active?: boolean  // undefined/true = active, false = disabled
}

export interface CharacterFeat {
  id: string
  specification?: string
}

export type AbilityKey = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'

export type HpGainMode = 'roll' | 'average' | 'manual'

export type FavoredClassChoice = 'hp' | 'skill' | 'racial'

// Registro de las decisiones tomadas en UNA subida de nivel. La hoja de personaje sigue
// derivándose de los totales agregados en `Character` (classes[].level, hp.max, skills[].ranks…);
// `levelHistory` no los sustituye, los complementa como bitácora para poder mostrar/auditar
// qué pasó en cada nivel y aplicar el pipeline guiado (orden, validaciones, clase predilecta).
// Los personajes creados antes de esta funcionalidad no tienen entradas para sus niveles ya
// vividos (no se fabrica historial retroactivo); `levelHistory` empieza a registrar desde la
// primera subida de nivel posterior a la migración.
export interface LevelChoice {
  characterLevel: number
  classId: string
  classLevel: number
  archetypeIds: string[]
  hpMode: HpGainMode
  hpRolled: number | null
  hpGained: number
  abilityIncrease?: AbilityKey
  featIds: string[]
  favoredClassChoice?: FavoredClassChoice
  skillRanksSpent: Record<string, number>
  spellsLearned?: string[]
  spellsExchanged?: { removed: string; added: string }[]
  inferred?: boolean
  source?: 'creation' | 'level-up' | 'retroactive' | 'manual-correction'
  createdAt: string
}

export interface Condition {
  id: string
  label: string
  active: boolean
}

export interface TemporaryEffect {
  id: string
  name: string
  modifiers: import('../engine/types').Modifier[]
  duration?: string
  active?: boolean
}

export type XpProgressionSpeed = 'slow' | 'medium' | 'fast'

export interface Character {
  id: string
  name: string
  race: string
  // Característica elegida para el bonificador racial flotante de +2 (Humano, Medio Elfo,
  // Medio Orco — razas cuyo `Race.bonuses` viene vacío porque el jugador elige el atributo).
  raceAbilityChoice?: AbilityKey
  classes: CharacterClass[]
  level: number
  xp: number
  xpProgression?: XpProgressionSpeed
  alignment: string
  abilities: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  hp: { current: number; max: number; temp: number; maxModifier?: number; maxOverride?: number | null }
  feats: CharacterFeat[]
  skills: SkillRank[]
  spells: string[]
  spellSlots: Record<number, SpellSlot>
  inventory: InventoryItem[]
  weapons: Weapon[]
  armor?: Armor[]
  coins: { pp: number; gp: number; sp: number; cp: number }
  notes: string
  campaignId?: string
  imageUrl?: string
  companion?: AnimalCompanion
  statusEffects?: StatusEffect[]
  conditions?: Condition[]
  temporaryEffects?: TemporaryEffect[]
  journalEntries?: JournalEntry[]
  equippedSlots?: EquipmentSlot[]
  customSlots?: CustomSlot[]
  preparedSpells?: string[]
  classFeatureUses?: Record<string, number>
  selectedDomains?: string[]
  selectedBlessings?: string[]
  channelType?: 'positive' | 'negative'
  favoredClassId?: string
  levelHistory?: LevelChoice[]
  negativeLevels?: number
  createdAt: string
  updatedAt: string
}

interface CharacterStore {
  characters: Character[]
  loading: boolean
  fetchCharacters: () => Promise<void>
  addCharacter: (character: Character) => Promise<void>
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<void>
  deleteCharacter: (id: string) => Promise<void>
  getCharacter: (id: string) => Character | undefined
}

export const useCharacterStore = create<CharacterStore>()((set, get) => ({
  characters: [],
  loading: false,

  fetchCharacters: async () => {
    set({ loading: true })
    const { data, error } = await supabase.from('characters').select('id, data')
    if (error) {
      console.warn('[characterStore] fetchCharacters failed:', error.message)
    } else if (data) {
      const characters = data.map((row) => normalizeCharacter({ ...row.data as Character, id: row.id }))
      set({ characters })
    }
    set({ loading: false })
  },

  addCharacter: async (character) => {
    // Se usa la sesión local (la misma que ya valida AuthContext) en vez de `getUser()`,
    // que revalida contra el servidor y puede lanzar AuthSessionMissingError incluso con
    // sesión activa. RLS sigue protegiendo el insert en el servidor de todos modos.
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) throw new Error('No hay una sesión activa: inicia sesión de nuevo.')
    const { data, error } = await supabase
      .from('characters')
      .insert({ id: character.id, user_id: user.id, data: character })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    set((state) => ({ characters: [...state.characters, normalizeCharacter({ ...character, id: data.id })] }))
  },

  updateCharacter: async (id, updates) => {
    const existing = get().characters.find((c) => c.id === id)
    if (!existing) return
    const merged = normalizeCharacter({ ...existing, ...updates, updatedAt: new Date().toISOString() })
    const { error } = await supabase
      .from('characters')
      .update({ data: merged })
      .eq('id', id)
    if (error) {
      console.warn('[characterStore] updateCharacter failed:', error.message)
    } else {
      set((state) => ({
        characters: state.characters.map((c) => c.id === id ? merged : c),
      }))
    }
  },

  deleteCharacter: async (id) => {
    const { error } = await supabase.from('characters').delete().eq('id', id)
    if (error) {
      console.warn('[characterStore] deleteCharacter failed:', error.message)
    } else {
      set((state) => ({ characters: state.characters.filter((c) => c.id !== id) }))
    }
  },

  getCharacter: (id) => get().characters.find((c) => c.id === id),
}))

export function generateId(): string {
  return crypto.randomUUID()
}

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function getModifierString(score: number): string {
  const mod = calculateModifier(score)
  return mod >= 0 ? `+${mod}` : `${mod}`
}
