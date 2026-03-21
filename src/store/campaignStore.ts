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
  race?: string
  appearance?: string
  personality?: string
  motivation?: string
  cr?: number
  hp?: number
  ac?: number
}

export interface CampaignSession {
  id: string
  number: number
  date: string
  title: string
  summary: string
  xpAwarded: number
  highlights: string[]
}

export interface CampaignLocation {
  id: string
  name: string
  type: 'city' | 'town' | 'dungeon' | 'wilderness' | 'building' | 'ruin' | 'other'
  description: string
  status: 'unknown' | 'known' | 'explored' | 'cleared'
  notes: string
  parentId?: string
}

export interface CampaignQuest {
  id: string
  title: string
  description: string
  type: 'main' | 'side' | 'personal'
  status: 'active' | 'completed' | 'failed' | 'unknown'
  xpReward?: number
  goldReward?: number
  notes: string
}

export interface EncounterEnemy {
  id: string
  name: string
  hpMax: number
  hpCurrent: number
  ac: number
  initiative: number | null
}

export interface CampaignEncounter {
  id: string
  name: string
  locationId?: string
  difficulty: 'trivial' | 'low' | 'moderate' | 'severe' | 'extreme'
  status: 'pending' | 'active' | 'completed'
  enemies: EncounterEnemy[]
  xpReward: number
  treasure: string
  notes: string
}

export interface CampaignLoot {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'magic' | 'coin' | 'misc'
  value?: number
  assignedTo?: string
  notes: string
}

export interface CampaignCharacter {
  id: string
  name: string
  race: string
  className: string
  level: number
  bab: number
  ac: number
  hpMax: number
  hpCurrent: number
  stealth: number
  perception: number
  notes: string
  inParty: boolean
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
  sessions: CampaignSession[]
  locations: CampaignLocation[]
  quests: CampaignQuest[]
  encounters: CampaignEncounter[]
  loot: CampaignLoot[]
  campaignCharacters: CampaignCharacter[]
  createdAt: string
  updatedAt: string
}

// ── Store ────────────────────────────────────────────────────────────────────

interface CampaignStore {
  campaigns: Campaign[]
  loading: boolean
  fetchCampaigns: () => Promise<void>
  addCampaign: (data: Omit<Campaign, 'id' | 'characterIds' | 'notes' | 'npcs' | 'sessionCount' | 'sessions' | 'locations' | 'quests' | 'encounters' | 'loot' | 'campaignCharacters' | 'createdAt' | 'updatedAt'>) => Promise<string>
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
  addSession: (campaignId: string, session: Omit<CampaignSession, 'id'>) => Promise<void>
  updateSession: (campaignId: string, sessionId: string, updates: Partial<CampaignSession>) => Promise<void>
  deleteSession: (campaignId: string, sessionId: string) => Promise<void>
  addLocation: (campaignId: string, location: Omit<CampaignLocation, 'id'>) => Promise<void>
  updateLocation: (campaignId: string, locationId: string, updates: Partial<CampaignLocation>) => Promise<void>
  deleteLocation: (campaignId: string, locationId: string) => Promise<void>
  addQuest: (campaignId: string, quest: Omit<CampaignQuest, 'id'>) => Promise<void>
  updateQuest: (campaignId: string, questId: string, updates: Partial<CampaignQuest>) => Promise<void>
  deleteQuest: (campaignId: string, questId: string) => Promise<void>
  addEncounter: (campaignId: string, encounter: Omit<CampaignEncounter, 'id'>) => Promise<void>
  updateEncounter: (campaignId: string, encounterId: string, updates: Partial<CampaignEncounter>) => Promise<void>
  deleteEncounter: (campaignId: string, encounterId: string) => Promise<void>
  updateEnemy: (campaignId: string, encounterId: string, enemyId: string, updates: Partial<EncounterEnemy>) => void
  addLoot: (campaignId: string, loot: Omit<CampaignLoot, 'id'>) => Promise<void>
  updateLoot: (campaignId: string, lootId: string, updates: Partial<CampaignLoot>) => Promise<void>
  deleteLoot: (campaignId: string, lootId: string) => Promise<void>
  addCampaignCharacter: (campaignId: string, char: Omit<CampaignCharacter, 'id'>) => Promise<void>
  updateCampaignCharacter: (campaignId: string, charId: string, updates: Partial<CampaignCharacter>) => Promise<void>
  deleteCampaignCharacter: (campaignId: string, charId: string) => Promise<void>
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
      const campaigns = data.map((row) => {
        const saved = row.data as Partial<Campaign>
        return {
          sessions: [] as CampaignSession[],
          locations: [] as CampaignLocation[],
          quests: [] as CampaignQuest[],
          encounters: [] as CampaignEncounter[],
          loot: [] as CampaignLoot[],
          campaignCharacters: [] as CampaignCharacter[],
          ...saved,
          id: row.id,
        } as Campaign
      })
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
      sessions: [],
      locations: [],
      quests: [],
      encounters: [],
      loot: [],
      campaignCharacters: [],
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

  addSession: async (campaignId, session) => {
    const newSession: CampaignSession = { id: generateId(), ...session }
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, sessions: [...c.sessions, newSession], sessionCount: c.sessions.length + 1, updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  updateSession: async (campaignId, sessionId, updates) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, sessions: c.sessions.map((ses) => ses.id === sessionId ? { ...ses, ...updates } : ses), updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  deleteSession: async (campaignId, sessionId) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) => {
        if (c.id !== campaignId) return c
        const sessions = c.sessions.filter((ses) => ses.id !== sessionId)
        return { ...c, sessions, sessionCount: sessions.length, updatedAt: new Date().toISOString() }
      })
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  addLocation: async (campaignId, location) => {
    const newLocation: CampaignLocation = { id: generateId(), ...location }
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, locations: [...c.locations, newLocation], updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  updateLocation: async (campaignId, locationId, updates) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, locations: c.locations.map((l) => l.id === locationId ? { ...l, ...updates } : l), updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  deleteLocation: async (campaignId, locationId) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, locations: c.locations.filter((l) => l.id !== locationId), updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  addQuest: async (campaignId, quest) => {
    const newQuest: CampaignQuest = { id: generateId(), ...quest }
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, quests: [...c.quests, newQuest], updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  updateQuest: async (campaignId, questId, updates) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, quests: c.quests.map((q) => q.id === questId ? { ...q, ...updates } : q), updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  deleteQuest: async (campaignId, questId) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, quests: c.quests.filter((q) => q.id !== questId), updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  addEncounter: async (campaignId, encounter) => {
    const newEncounter: CampaignEncounter = { id: generateId(), ...encounter }
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, encounters: [...c.encounters, newEncounter], updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  updateEncounter: async (campaignId, encounterId, updates) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, encounters: c.encounters.map((enc) => enc.id === encounterId ? { ...enc, ...updates } : enc), updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  deleteEncounter: async (campaignId, encounterId) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, encounters: c.encounters.filter((enc) => enc.id !== encounterId), updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  updateEnemy: (campaignId, encounterId, enemyId, updates) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) => {
        if (c.id !== campaignId) return c
        const encounters = c.encounters.map((enc) =>
          enc.id !== encounterId ? enc : {
            ...enc,
            enemies: enc.enemies.map((e) => e.id === enemyId ? { ...e, ...updates } : e),
          }
        )
        const updated = { ...c, encounters, updatedAt: new Date().toISOString() }
        persistCampaign(campaignId, [updated])
        return updated
      })
      return { campaigns }
    })
  },

  addLoot: async (campaignId, loot) => {
    const newLoot: CampaignLoot = { id: generateId(), ...loot }
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, loot: [...c.loot, newLoot], updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  updateLoot: async (campaignId, lootId, updates) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, loot: c.loot.map((l) => l.id === lootId ? { ...l, ...updates } : l), updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  deleteLoot: async (campaignId, lootId) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, loot: c.loot.filter((l) => l.id !== lootId), updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  addCampaignCharacter: async (campaignId, char) => {
    const newChar: CampaignCharacter = { id: generateId(), ...char }
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, campaignCharacters: [...(c.campaignCharacters ?? []), newChar], updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  updateCampaignCharacter: async (campaignId, charId, updates) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, campaignCharacters: (c.campaignCharacters ?? []).map((ch) => ch.id === charId ? { ...ch, ...updates } : ch), updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },

  deleteCampaignCharacter: async (campaignId, charId) => {
    set((s) => {
      const campaigns = s.campaigns.map((c) =>
        c.id === campaignId
          ? { ...c, campaignCharacters: (c.campaignCharacters ?? []).filter((ch) => ch.id !== charId), updatedAt: new Date().toISOString() }
          : c
      )
      persistCampaign(campaignId, campaigns)
      return { campaigns }
    })
  },
}))
