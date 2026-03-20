import { create } from 'zustand'
import { supabase } from '../lib/supabase'
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
  loading: boolean
  fetchCampaigns: () => Promise<void>
  addCampaign: (data: Omit<Campaign, 'id' | 'characterIds' | 'notes' | 'npcs' | 'sessionCount' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>
  deleteCampaign: (id: string) => Promise<void>
  getCampaign: (id: string) => Campaign | undefined
  addCharacterToCampaign: (campaignId: string, characterId: string) => Promise<void>
  removeCharacterFromCampaign: (campaignId: string, characterId: string) => Promise<void>
  addNote: (campaignId: string, note: Omit<CampaignNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateNote: (campaignId: string, noteId: string, updates: Partial<CampaignNote>) => Promise<void>
  deleteNote: (campaignId: string, noteId: string) => Promise<void>
  addNPC: (campaignId: string, npc: Omit<CampaignNPC, 'id'>) => Promise<void>
  updateNPC: (campaignId: string, npcId: string, updates: Partial<CampaignNPC>) => Promise<void>
  deleteNPC: (campaignId: string, npcId: string) => Promise<void>
}

async function persistCampaign(id: string, campaigns: Campaign[]) {
  const campaign = campaigns.find((c) => c.id === id)
  if (!campaign) return
  await supabase.from('campaigns').update({ data: campaign }).eq('id', id)
}

export const useCampaignStore = create<CampaignStore>()((set, get) => ({
  campaigns: [],
  loading: false,

  fetchCampaigns: async () => {
    set({ loading: true })
    const { data, error } = await supabase.from('campaigns').select('id, data')
    if (!error && data) {
      const campaigns = data.map((row) => ({ ...row.data as Campaign, id: row.id }))
      set({ campaigns })
    }
    set({ loading: false })
  },

  addCampaign: async (data) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return ''
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
    const { data: row, error } = await supabase
      .from('campaigns')
      .insert({ id: campaign.id, user_id: user.id, data: campaign })
      .select('id')
      .single()
    if (!error && row) {
      const finalCampaign = { ...campaign, id: row.id }
      set((s) => ({ campaigns: [...s.campaigns, finalCampaign] }))
      return row.id
    }
    return ''
  },

  updateCampaign: async (id, updates) => {
    const existing = get().campaigns.find((c) => c.id === id)
    if (!existing) return
    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() }
    const { error } = await supabase.from('campaigns').update({ data: merged }).eq('id', id)
    if (!error) {
      set((s) => ({ campaigns: s.campaigns.map((c) => c.id === id ? merged : c) }))
    }
  },

  deleteCampaign: async (id) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id)
    if (!error) {
      set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) }))
    }
  },

  getCampaign: (id) => get().campaigns.find((c) => c.id === id),

  addCharacterToCampaign: async (campaignId, characterId) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) => {
        if (c.id !== campaignId) return c
        if (c.characterIds.includes(characterId)) return c
        return { ...c, characterIds: [...c.characterIds, characterId], updatedAt: new Date().toISOString() }
      })
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  removeCharacterFromCampaign: async (campaignId, characterId) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, characterIds: c.characterIds.filter((id) => id !== characterId), updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  addNote: async (campaignId, note) => {
    const now = new Date().toISOString()
    const newNote: CampaignNote = { id: generateId(), ...note, createdAt: now, updatedAt: now }
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId ? { ...c, notes: [...c.notes, newNote], updatedAt: now } : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  updateNote: async (campaignId, noteId, updates) => {
    const now = new Date().toISOString()
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, notes: c.notes.map((n) => n.id === noteId ? { ...n, ...updates, updatedAt: now } : n), updatedAt: now }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  deleteNote: async (campaignId, noteId) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, notes: c.notes.filter((n) => n.id !== noteId), updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  addNPC: async (campaignId, npc) => {
    const newNPC: CampaignNPC = { id: generateId(), ...npc }
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId ? { ...c, npcs: [...c.npcs, newNPC], updatedAt: new Date().toISOString() } : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  updateNPC: async (campaignId, npcId, updates) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, npcs: c.npcs.map((n) => n.id === npcId ? { ...n, ...updates } : n), updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  deleteNPC: async (campaignId, npcId) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, npcs: c.npcs.filter((n) => n.id !== npcId), updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },
}))
