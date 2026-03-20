import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CharacterClass {
  id: string
  level: number
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

export interface StatusEffect {
  id: string
  name: string
  description: string
  bonus?: string
  duration?: string
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
  createdAt: string
  updatedAt: string
}

interface CharacterStore {
  characters: Character[]
  addCharacter: (character: Character) => void
  updateCharacter: (id: string, updates: Partial<Character>) => void
  deleteCharacter: (id: string) => void
  getCharacter: (id: string) => Character | undefined
}

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      characters: [],

      addCharacter: (character) => {
        set((state) => ({
          characters: [...state.characters, character],
        }))
      },

      updateCharacter: (id, updates) => {
        set((state) => ({
          characters: state.characters.map((char) =>
            char.id === id
              ? { ...char, ...updates, updatedAt: new Date().toISOString() }
              : char
          ),
        }))
      },

      deleteCharacter: (id) => {
        set((state) => ({
          characters: state.characters.filter((char) => char.id !== id),
        }))
      },

      getCharacter: (id) => {
        return get().characters.find((char) => char.id === id)
      },
    }),
    {
      name: 'pathfinder-nexus-characters',
    }
  )
)

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function getModifierString(score: number): string {
  const mod = calculateModifier(score)
  return mod >= 0 ? `+${mod}` : `${mod}`
}
