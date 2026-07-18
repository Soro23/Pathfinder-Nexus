import { create } from 'zustand'
import { supabase } from '../lib/supabase'

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

export interface Character {
  id: string
  name: string
  race: string
  classes: CharacterClass[]
  level: number
  xp: number
  alignment: string
  abilities: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  hp: { current: number; max: number; temp: number }
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
      const characters = data.map((row) => {
        const c = { ...row.data as Character, id: row.id }
        c.feats = (c.feats ?? []).map((f) => typeof f === 'string' ? { id: f } : f)
        c.classes = c.classes.map((cls) => {
          const legacyId = (cls as CharacterClass & { archetypeId?: string }).archetypeId
          if (cls.archetypeIds) return cls
          return { ...cls, archetypeIds: legacyId ? [legacyId] : [] }
        })
        if (c.companion) {
          c.companion.tricks = c.companion.tricks ?? []
          c.companion.feats = c.companion.feats ?? []
          c.companion.customSpecialAbilities = c.companion.customSpecialAbilities ?? []
          c.companion.attacks = c.companion.attacks ?? []
        }
        return c
      })
      set({ characters })
    }
    set({ loading: false })
  },

  addCharacter: async (character) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('characters')
      .insert({ id: character.id, user_id: user.id, data: character })
      .select('id')
      .single()
    if (error) {
      console.warn('[characterStore] addCharacter failed:', error.message)
    } else if (data) {
      set((state) => ({ characters: [...state.characters, { ...character, id: data.id }] }))
    }
  },

  updateCharacter: async (id, updates) => {
    const existing = get().characters.find((c) => c.id === id)
    if (!existing) return
    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() }
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
