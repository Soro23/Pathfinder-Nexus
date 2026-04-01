import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface CharacterClass {
  id: string
  level: number
  archetypeId?: string
}

export interface InventoryItem {
  id: string
  name: string
  quantity: number
  weight: number
  equipped: boolean
  notes?: string
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

export interface Weapon {
  id: string
  name: string
  attackBonus: number
  damage: string
  critical: string
  range: string
  type: string
  notes: string
}

export interface AnimalCompanion {
  name: string
  type: string
  level: number
  hp: { current: number; max: number }
  abilities: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  attacks: { name: string; bonus: number; damage: string }[]
  skills: Record<string, number>
  specialAbilities: string[]
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
  feats: string[]
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
  journalEntries?: JournalEntry[]
  preparedSpells?: string[]
  classFeatureUses?: Record<string, number>
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
    if (!error && data) {
      const characters = data.map((row) => ({ ...row.data as Character, id: row.id }))
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
    if (!error && data) {
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
    if (!error) {
      set((state) => ({
        characters: state.characters.map((c) => c.id === id ? merged : c),
      }))
    }
  },

  deleteCharacter: async (id) => {
    const { error } = await supabase.from('characters').delete().eq('id', id)
    if (!error) {
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
