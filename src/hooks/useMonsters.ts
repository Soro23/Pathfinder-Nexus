import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Monster } from '../types/monster'
import { pickLocalized } from '../lib/localization'
import { fetchWithCache } from '../lib/queryCache'
import { escapeForOrFilter } from '../lib/postgrest'
import { useDebouncedValue } from './useDebouncedValue'

export interface MonsterFilters {
  search: string
  category: string // 'all' | id de CATEGORIES (puede llevar guiones, ej. 'magical-beast')
  crRange: string // 'all' | '0' | '1/8' | '1/4' | '1/2' | '1-3' | '4-6' | '7-10' | '11-15' | '16-20' | '21+'
}

const PAGE_SIZE = 50

// Columnas ligeras: se excluye `description`/`description_es`, que se pide aparte al abrir la ficha.
const LIST_COLUMNS =
  'id,name,name_es,cr,xp,alignment,size,type,subtype,init,senses,aura,ac,ac_notes,hp,hp_notes,' +
  'fort,ref,will,defensive_abilities,dr,immune,resist,speed,melee,ranged,space,reach,' +
  'special_attacks,spell_like_abilities,str,dex,con,int,wis,cha,base_atk,cmb,cmd,feats,skills,' +
  'languages,sq,environment,organization,treasure,source,special_abilities'

function mapMonsterRow(r: Record<string, unknown>): Monster {
  return {
    id: r.id as string,
    name: pickLocalized(r.name_es as string | null, r.name as string),
    cr: r.cr as number,
    xp: r.xp as number,
    alignment: r.alignment as string,
    size: r.size as Monster['size'],
    type: r.type as string,
    subtype: r.subtype as string | undefined,
    init: r.init as number,
    senses: r.senses as string | undefined,
    aura: r.aura as string | undefined,
    ac: r.ac as number,
    acNotes: r.ac_notes as string | undefined,
    hp: r.hp as number,
    hpNotes: r.hp_notes as string | undefined,
    fort: r.fort as number,
    ref: r.ref as number,
    will: r.will as number,
    defensiveAbilities: r.defensive_abilities as string | undefined,
    dr: r.dr as string | undefined,
    immune: r.immune as string | undefined,
    resist: r.resist as string | undefined,
    speed: r.speed as string | undefined,
    melee: r.melee as string | undefined,
    ranged: r.ranged as string | undefined,
    space: r.space as string | undefined,
    reach: r.reach as string | undefined,
    specialAttacks: r.special_attacks as string | undefined,
    spellLikeAbilities: r.spell_like_abilities as string | undefined,
    str: r.str as number,
    dex: r.dex as number,
    con: r.con as number,
    int: r.int as number,
    wis: r.wis as number,
    cha: r.cha as number,
    baseAtk: r.base_atk as number,
    cmb: r.cmb as number,
    cmd: r.cmd as number,
    feats: r.feats as string[] | undefined,
    skills: r.skills as string | undefined,
    languages: r.languages as string | undefined,
    sq: r.sq as string | undefined,
    environment: r.environment as string | undefined,
    organization: r.organization as string | undefined,
    treasure: r.treasure as string | undefined,
    source: r.source as string | undefined,
    specialAbilities: r.special_abilities as string | undefined,
    // La descripción completa no viaja en el listado — se pide bajo demanda con fetchMonsterDescription.
  }
}

/** Devuelve [min, max] (max undefined = sin límite superior) para un rango de CR, o undefined si es un valor exacto/'all'. */
const CR_EXACT: Record<string, number> = { '0': 0, '1/8': 0.125, '1/4': 0.25, '1/2': 0.5 }
const CR_RANGE: Record<string, [number, number | undefined]> = {
  '1-3': [1, 3], '4-6': [4, 6], '7-10': [7, 10], '11-15': [11, 15], '16-20': [16, 20], '21+': [21, undefined],
}

export function useMonsters(filters: MonsterFilters, page: number) {
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const debouncedSearch = useDebouncedValue(filters.search, 300)

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const cacheKey = JSON.stringify({ s: debouncedSearch, c: filters.category, cr: filters.crRange, p: page })

    setLoading(true)
    setError(null)

    fetchWithCache(cacheKey, controller.signal, async (signal) => {
      let query = supabase
        .from('monsters')
        .select(LIST_COLUMNS, { count: 'exact' })
        .order('name')
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
        .abortSignal(signal)

      if (debouncedSearch) {
        const term = escapeForOrFilter(debouncedSearch)
        query = query.or(`name.ilike.%${term}%,name_es.ilike.%${term}%`)
      }

      if (filters.category !== 'all') {
        query = query.ilike('type', `%${filters.category.replace(/-/g, ' ')}%`)
      }

      if (filters.crRange in CR_EXACT) {
        query = query.eq('cr', CR_EXACT[filters.crRange])
      } else if (filters.crRange in CR_RANGE) {
        const [min, max] = CR_RANGE[filters.crRange]
        query = query.gte('cr', min)
        if (max !== undefined) query = query.lte('cr', max)
      }

      const { data, error: dbError, count } = await query
      if (dbError) throw dbError

      const monsters = (data ?? []).map((row) =>
        mapMonsterRow(row as unknown as Record<string, unknown>)
      )
      return { monsters, total: count ?? 0 }
    })
      .then((result) => {
        if (!result || controller.signal.aborted) return
        setMonsters(result.monsters)
        setTotal(result.total)
      })
      .catch((e) => {
        if (controller.signal.aborted) return
        setError(e instanceof Error ? e.message : 'Error cargando criaturas')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [debouncedSearch, filters.category, filters.crRange, page])

  return { monsters, loading, error, total }
}

/** Ficha de detalle: se pide solo la descripción (potencialmente larga) al abrir un monstruo. */
export async function fetchMonsterDescription(id: string): Promise<string | undefined> {
  const cacheKey = `monster-desc:${id}`
  const controller = new AbortController()
  const result = await fetchWithCache(cacheKey, controller.signal, async (signal) => {
    const { data, error } = await supabase
      .from('monsters')
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
