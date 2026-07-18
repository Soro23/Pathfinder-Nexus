import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { pickLocalized } from '../lib/localization'
import { fetchWithCache } from '../lib/queryCache'
import type {
  CompanionListItem,
  CompanionDetail,
  CompanionType,
  CompanionSpecialAbility,
  CompanionMastery,
  CompanionStatblock,
} from '../types/animalCompanion'

const LIST_COLUMNS = 'id,name,name_es,companion_type,size_start,size_advanced,source'
const DETAIL_COLUMNS =
  'id,name,name_es,companion_type,description,description_es,prerequisites,source,' +
  'size_start,size_advanced,advancement_level,starting,advancement,mastery,special_abilities,data'

function mapListRow(r: Record<string, unknown>): CompanionListItem {
  return {
    id: r.id as string,
    name: pickLocalized(r.name_es as string | null, r.name as string),
    companionType: r.companion_type as CompanionType,
    sizeStart: (r.size_start as string) ?? undefined,
    sizeAdvanced: (r.size_advanced as string) ?? undefined,
    source: (r.source as string) ?? undefined,
  }
}

function mapDetailRow(r: Record<string, unknown>): CompanionDetail {
  const data = (r.data as Record<string, unknown>) ?? {}
  const dataEs = (data.es as { starting?: CompanionStatblock; advancement?: CompanionStatblock }) ?? undefined
  const drakePowersRaw = data.drake_powers as { name: string; text: string }[] | undefined

  return {
    ...mapListRow(r),
    description: pickLocalized(r.description_es as string | null, (r.description as string) ?? ''),
    prerequisites: (r.prerequisites as string) ?? undefined,
    advancementLevel: (r.advancement_level as number) ?? undefined,
    starting: (r.starting as CompanionStatblock) ?? {},
    advancement: (r.advancement as CompanionStatblock) ?? undefined,
    mastery: (r.mastery as CompanionMastery) ?? undefined,
    specialAbilities: (r.special_abilities as CompanionSpecialAbility[]) ?? undefined,
    startingEs: dataEs?.starting,
    advancementEs: dataEs?.advancement,
    drakePowers: drakePowersRaw,
  }
}

/** Catálogo completo (291 filas, columnas ligeras) — se carga una vez y se filtra en cliente. */
export function useAnimalCompanionCatalog() {
  const [catalog, setCatalog] = useState<CompanionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    fetchWithCache('companion-catalog', controller.signal, async (signal) => {
      const { data, error: dbError } = await supabase
        .from('animal_companions')
        .select(LIST_COLUMNS)
        .order('name')
        .abortSignal(signal)
      if (dbError) throw dbError
      return (data ?? []).map((row) => mapListRow(row as unknown as Record<string, unknown>))
    })
      .then((result) => {
        if (cancelled || !result) return
        setCatalog(result)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Error cargando catálogo de compañeros')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  return { catalog, loading, error }
}

/** Ficha completa de un compañero (statblocks, mastery, habilidades especiales) bajo demanda. */
export async function fetchCompanionDetail(id: string): Promise<CompanionDetail | undefined> {
  const cacheKey = `companion-detail:${id}`
  const controller = new AbortController()
  return fetchWithCache(cacheKey, controller.signal, async (signal) => {
    const { data, error } = await supabase
      .from('animal_companions')
      .select(DETAIL_COLUMNS)
      .eq('id', id)
      .abortSignal(signal)
      .maybeSingle()
    if (error) throw error
    if (!data) return undefined
    return mapDetailRow(data as unknown as Record<string, unknown>)
  })
}
