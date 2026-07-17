import { supabase } from './supabase'

// Unión de los valores de item_type_enum realmente usados en la BD ampliada
// más los que ya manejaba el editor de Admin (por si quedan filas legacy).
export const ITEM_TYPES = [
  'weapon', 'armor', 'shield', 'potion', 'scroll', 'wand', 'staff',
  'ring', 'rod', 'wondrous', 'mundane', 'ammunition', 'tool', 'other',
  'alchemical', 'container', 'cursed', 'gear',
] as const

export interface WeaponStats {
  handed?: 'light' | 'one_handed' | 'two_handed'
  category?: 'simple' | 'martial' | 'exotic'
  combat_type?: 'melee' | 'ranged'
  damage_type?: string
  damage_medium?: string
  critical?: string
  range_increment?: number
}

export interface ArmorStats {
  category?: 'light' | 'medium' | 'heavy'
  armor_bonus?: number | string
  max_dex_bonus?: number | string | null
  armor_check_penalty?: number | string
  arcane_spell_failure?: number | string
  speed_20?: number
  speed_30?: number
}

export interface ShieldStats {
  shield_bonus?: number | string
  max_dex_bonus?: number | string | null
  armor_check_penalty?: number | string
  arcane_spell_failure?: number | string
}

export interface ItemData {
  weapon?: WeaponStats
  armor?: ArmorStats
  shield?: ShieldStats
}

export interface CatalogItem {
  id: string
  name: string
  item_type: string
  subtype?: string
  slot?: string
  price_gp?: number
  weight?: number
  magical: boolean
  consumable: boolean
  description?: string
  data?: ItemData
}

export async function searchCatalogItems(query: string): Promise<CatalogItem[]> {
  if (!query.trim()) return []
  const { data, error } = await supabase
    .from('items')
    .select('id, name, item_type, subtype, slot, price_gp, weight, magical, consumable, description')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(20)
  if (error) {
    console.warn('[itemsService] searchCatalogItems:', error.message)
    return []
  }
  return data ?? []
}
