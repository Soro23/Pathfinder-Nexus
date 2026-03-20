import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from './characterStore'

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface CampaignNote {
  id: string
  title: string
  content: string
  category: 'story' | 'npc' | 'location' | 'loot' | 'misc'
  sessionNumber?: number
  createdAt: string
  updatedAt: string
}

export interface CampaignNPC {
  id: string
  name: string
  role: 'ally' | 'enemy' | 'neutral' | 'unknown'
  notes: string
  location?: string
}

export interface Campaign {
  id: string
  name: string
  description: string
  setting: string
  gmName: string
  status: 'active' | 'paused' | 'completed'
  characterIds: string[]
  notes: CampaignNote[]
  npcs: CampaignNPC[]
  sessionCount: number
  createdAt: string
  updatedAt: string
}

// ── Store ────────────────────────────────────────────────────────────────────

interface CampaignStore {
  campaigns: Campaign[]
  addCampaign: (data: Omit<Campaign, 'id' | 'characterIds' | 'notes' | 'npcs' | 'sessionCount' | 'createdAt' | 'updatedAt'>) => string
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
  getCampaign: (id: string) => Campaign | undefined
  addCharacterToCampaign: (campaignId: string, characterId: string) => void
  removeCharacterFromCampaign: (campaignId: string, characterId: string) => void
  addNote: (campaignId: string, note: Omit<CampaignNote, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateNote: (campaignId: string, noteId: string, updates: Partial<CampaignNote>) => void
  deleteNote: (campaignId: string, noteId: string) => void
  addNPC: (campaignId: string, npc: Omit<CampaignNPC, 'id'>) => void
  updateNPC: (campaignId: string, npcId: string, updates: Partial<CampaignNPC>) => void
  deleteNPC: (campaignId: string, npcId: string) => void
}

export const useCampaignStore = create<CampaignStore>()(
  persist(
    (set, get) => ({
      campaigns: [],

      addCampaign: (data) => {
        const id = generateId()
        const now = new Date().toISOString()
        const campaign: Campaign = {
          id,
          ...data,
          characterIds: [],
          notes: [],
          npcs: [],
          sessionCount: 0,
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ campaigns: [...s.campaigns, campaign] }))
        return id
      },

      updateCampaign: (id, updates) => {
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        }))
      },

      deleteCampaign: (id) => {
        set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) }))
      },

      getCampaign: (id) => get().campaigns.find((c) => c.id === id),

      addCharacterToCampaign: (campaignId, characterId) => {
        set((s) => ({
          campaigns: s.campaigns.map((c) => {
            if (c.id !== campaignId) return c
            if (c.characterIds.includes(characterId)) return c
            return { ...c, characterIds: [...c.characterIds, characterId], updatedAt: new Date().toISOString() }
          }),
        }))
      },

      removeCharacterFromCampaign: (campaignId, characterId) => {
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === campaignId
              ? { ...c, characterIds: c.characterIds.filter((id) => id !== characterId), updatedAt: new Date().toISOString() }
              : c
          ),
        }))
      },

      addNote: (campaignId, note) => {
        const now = new Date().toISOString()
        const newNote: CampaignNote = { id: generateId(), ...note, createdAt: now, updatedAt: now }
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === campaignId
              ? { ...c, notes: [...c.notes, newNote], updatedAt: now }
              : c
          ),
        }))
      },

      updateNote: (campaignId, noteId, updates) => {
        const now = new Date().toISOString()
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === campaignId
              ? {
                  ...c,
                  notes: c.notes.map((n) => n.id === noteId ? { ...n, ...updates, updatedAt: now } : n),
                  updatedAt: now,
                }
              : c
          ),
        }))
      },

      deleteNote: (campaignId, noteId) => {
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === campaignId
              ? { ...c, notes: c.notes.filter((n) => n.id !== noteId), updatedAt: new Date().toISOString() }
              : c
          ),
        }))
      },

      addNPC: (campaignId, npc) => {
        const newNPC: CampaignNPC = { id: generateId(), ...npc }
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === campaignId
              ? { ...c, npcs: [...c.npcs, newNPC], updatedAt: new Date().toISOString() }
              : c
          ),
        }))
      },

      updateNPC: (campaignId, npcId, updates) => {
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === campaignId
              ? {
                  ...c,
                  npcs: c.npcs.map((n) => n.id === npcId ? { ...n, ...updates } : n),
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }))
      },

      deleteNPC: (campaignId, npcId) => {
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === campaignId
              ? { ...c, npcs: c.npcs.filter((n) => n.id !== npcId), updatedAt: new Date().toISOString() }
              : c
          ),
        }))
      },
    }),
    { name: 'pathfinder-nexus-campaigns' }
  )
)
