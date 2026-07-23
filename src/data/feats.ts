import type { Modifier } from '../engine/types'
import { srdStore } from '../store/srdStore'
import { homebrewStore } from '../store/homebrewStore'

export type FeatType = 'combat' | 'general' | 'metamagic' | 'item_creation' | 'teamwork' | 'critical' | 'style' | 'race' | 'story'

export interface Feat {
  id: string
  name: string
  type: FeatType[]
  prerequisite?: string
  benefit: string
  normal?: string
  special?: string
  effects?: Modifier[]
  uses?: string[]
  notes?: string[]
  source?: string
}

export function isFeatRepeatable(feat: Feat): boolean {
  return !!feat.special?.toLowerCase().includes('veces')
}

export const FEAT_TYPES: FeatType[] = ['combat', 'general', 'metamagic', 'item_creation', 'teamwork', 'critical', 'style', 'race', 'story']

/** Lee el catálogo de dotes desde srdStore (Supabase) y, si no aparece ahí, del homebrew del usuario. */
export function getFeatById(id: string): Feat | undefined {
  return srdStore.getState().feats.find((feat) => feat.id === id)
    ?? homebrewStore.getState().feats.find((feat) => feat.id === id)
}
