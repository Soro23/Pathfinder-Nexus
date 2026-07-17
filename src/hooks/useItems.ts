import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CatalogItem, ItemData } from '../lib/itemsService'
import { pickLocalized } from '../lib/localization'
import { fetchWithCache } from '../lib/queryCache'
import { escapeForOrFilter } from '../lib/postgrest'
import { useDebouncedValue } from './useDebouncedValue'

export interface ItemFilters {
  search: string
  itemType: string // 'all' | uno de ITEM_TYPES
}

const PAGE_SIZE = 60

// Columnas ligeras: se excluye `description`/`description_es`, que se pide aparte al abrir la ficha.
const LIST_COLUMNS = 'id,name,name_es,item_type,subtype,slot,price_gp,weight,magical,consumable,data'

function mapItemListRow(r: Record<string, unknown>): CatalogItem {
  return {
    id: r.id as string,
    name: pickLocalized(r.name_es as string | null, r.name as string),
    item_type: r.item_type as string,
    subtype: (r.subtype as string) ?? undefined,
    slot: (r.slot as string) ?? undefined,
    price_gp: (r.price_gp as number) ?? undefined,
    weight: (r.weight as number) ?? undefined,
    magical: (r.magical as boolean) ?? false,
    consumable: (r.consumable as boolean) ?? false,
    data: (r.data as ItemData) ?? undefined,
  }
}

export function useItems(filters: ItemFilters, page: number) {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const debouncedSearch = useDebouncedValue(filters.search, 300)

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const cacheKey = JSON.stringify({ s: debouncedSearch, t: filters.itemType, p: page })

    setLoading(true)
    setError(null)

    fetchWithCache(cacheKey, controller.signal, async (signal) => {
      let query = supabase
        .from('items')
        .select(LIST_COLUMNS, { count: 'exact' })
        .order('name')
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
        .abortSignal(signal)

      if (debouncedSearch) {
        const term = escapeForOrFilter(debouncedSearch)
        query = query.or(`name.ilike.%${term}%,name_es.ilike.%${term}%`)
      }

      if (filters.itemType !== 'all') {
        query = query.eq('item_type', filters.itemType)
      }

      const { data, error: dbError, count } = await query
      if (dbError) throw dbError

      const items = (data ?? []).map((row) =>
        mapItemListRow(row as unknown as Record<string, unknown>)
      )
      return { items, total: count ?? 0 }
    })
      .then((result) => {
        if (!result || controller.signal.aborted) return
        setItems(result.items)
        setTotal(result.total)
      })
      .catch((e) => {
        if (controller.signal.aborted) return
        setError(e instanceof Error ? e.message : 'Error cargando objetos')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [debouncedSearch, filters.itemType, page])

  return { items, loading, error, total }
}

/** Ficha de detalle: se pide solo la descripción (potencialmente larga) al abrir un objeto. */
export async function fetchItemDescription(id: string): Promise<string | undefined> {
  const cacheKey = `item-desc:${id}`
  const controller = new AbortController()
  const result = await fetchWithCache(cacheKey, controller.signal, async (signal) => {
    const { data, error } = await supabase
      .from('items')
      .select('description,description_es')
      .eq('id', id)
      .abortSignal(signal)
      .single()
    if (error) throw error
    const row = data as unknown as Record<string, unknown> | null
    return pickLocalized(row?.description_es as string | null, (row?.description as string) ?? '')
  })
  return result
}
