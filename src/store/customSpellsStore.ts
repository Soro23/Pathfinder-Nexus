import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Spell } from '../data/spells'

// NOTE: Requires a `custom_spells` table in Supabase:
//
// create table custom_spells (
//   id text primary key,
//   data jsonb not null,
//   imported_by uuid references auth.users(id),
//   imported_at timestamptz default now()
// );
// alter table custom_spells enable row level security;
// create policy "read all" on custom_spells for select using (true);
// create policy "insert own" on custom_spells for insert with check (auth.uid() = imported_by);
// create policy "delete own" on custom_spells for delete using (auth.uid() = imported_by);

interface CustomSpellsStore {
  customSpells: Spell[]
  loading: boolean
  fetchCustomSpells: () => Promise<void>
  addSpell: (spell: Spell) => Promise<{ error: string | null }>
  removeSpell: (id: string) => Promise<void>
}

export const useCustomSpellsStore = create<CustomSpellsStore>()((set) => ({
  customSpells: [],
  loading: false,

  fetchCustomSpells: async () => {
    set({ loading: true })
    const { data, error } = await supabase.from('custom_spells').select('id, data')
    if (!error && data) {
      set({ customSpells: data.map(row => ({ ...(row.data as Spell), id: row.id })) })
    }
    set({ loading: false })
  },

  addSpell: async (spell) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }
    const { error } = await supabase
      .from('custom_spells')
      .insert({ id: spell.id, data: spell, imported_by: user.id })
    if (error) return { error: error.message }
    set((s) => ({ customSpells: [...s.customSpells, spell] }))
    return { error: null }
  },

  removeSpell: async (id) => {
    const { error } = await supabase.from('custom_spells').delete().eq('id', id)
    if (!error) set((s) => ({ customSpells: s.customSpells.filter(sp => sp.id !== id) }))
  },
}))
