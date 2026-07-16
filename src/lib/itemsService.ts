import { supabase } from './supabase'

// Unión de los valores de item_type_enum realmente usados en la BD ampliada
// más los que ya manejaba el editor de Admin (por si quedan filas legacy).
export const ITEM_TYPES = [
  'weapon', 'armor', 'shield', 'potion', 'scroll', 'wand', 'staff',
  'ring', 'rod', 'wondrous', 'mundane', 'ammunition', 'tool', 'other',
  'alchemical', 'container', 'cursed', 'gear',
] as const

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
