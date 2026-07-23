import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { generateId } from './characterStore'
import type { Spell } from '../data/spells'
import type { Feat } from '../data/feats'
import type { Skill } from '../data/skills'
import type { ClassData } from '../data/classes'
import type { Race } from '../data/races'

// SQL to create the table in Supabase:
//
// create table homebrew_content (
//   id text primary key,
//   type text not null check (type in ('spell','feat','skill','class','race')),
//   data jsonb not null,
//   created_by uuid references auth.users(id),
//   created_at timestamptz default now()
// );
// alter table homebrew_content enable row level security;
// create policy "read all homebrew" on homebrew_content for select using (true);
// create policy "insert own homebrew" on homebrew_content for insert with check (auth.uid() = created_by);
// create policy "delete own homebrew" on homebrew_content for delete using (auth.uid() = created_by);

export type HomebrewType = 'spell' | 'feat' | 'skill' | 'class' | 'race'

interface HomebrewStore {
  spells: Spell[]
  feats: Feat[]
  skills: Skill[]
  classes: ClassData[]
  races: Race[]
  loading: boolean
  fetched: boolean
  fetch: () => Promise<void>
  add: (type: HomebrewType, data: object) => Promise<string | null>
  remove: (id: string, type: HomebrewType) => Promise<void>
}

export const useHomebrewStore = create<HomebrewStore>()((set, get) => ({
  spells: [],
  feats: [],
  skills: [],
  classes: [],
  races: [],
  loading: false,
  fetched: false,

  fetch: async () => {
    if (get().fetched) return
    set({ loading: true })
    const { data, error } = await supabase
      .from('homebrew_content')
      .select('id, type, data')
    if (!error && data) {
      const spells: Spell[] = []
      const feats: Feat[] = []
      const skills: Skill[] = []
      const classes: ClassData[] = []
      const races: Race[] = []
      for (const row of data) {
        const item = { ...(row.data as object), id: row.id }
        if (row.type === 'spell') spells.push(item as Spell)
        else if (row.type === 'feat') feats.push(item as Feat)
        else if (row.type === 'skill') skills.push(item as Skill)
        else if (row.type === 'class') classes.push(item as ClassData)
        else if (row.type === 'race') races.push(item as Race)
      }
      set({ spells, feats, skills, classes, races })
    }
    set({ loading: false, fetched: true })
  },

  add: async (type, data) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const id = generateId()
    const item = { ...data, id }
    const { error } = await supabase
      .from('homebrew_content')
      .insert({ id, type, data: item, created_by: user.id })
    if (error) return null
    set((s) => ({
      spells:  type === 'spell'  ? [...s.spells,  item as Spell]     : s.spells,
      feats:   type === 'feat'   ? [...s.feats,   item as Feat]      : s.feats,
      skills:  type === 'skill'  ? [...s.skills,  item as Skill]     : s.skills,
      classes: type === 'class'  ? [...s.classes, item as ClassData] : s.classes,
      races:   type === 'race'   ? [...s.races,   item as Race]      : s.races,
    }))
    return id
  },

  remove: async (id, type) => {
    const { error } = await supabase
      .from('homebrew_content')
      .delete()
      .eq('id', id)
    if (error) return
    set((s) => ({
      spells:  type === 'spell'  ? s.spells.filter(x => x.id !== id)  : s.spells,
      feats:   type === 'feat'   ? s.feats.filter(x => x.id !== id)   : s.feats,
      skills:  type === 'skill'  ? s.skills.filter(x => x.id !== id)  : s.skills,
      classes: type === 'class'  ? s.classes.filter(x => x.id !== id) : s.classes,
      races:   type === 'race'   ? s.races.filter(x => x.id !== id)   : s.races,
    }))
  },
}))

// Non-hook accessor for use outside React (engine, lookups por id)
export const homebrewStore = useHomebrewStore
