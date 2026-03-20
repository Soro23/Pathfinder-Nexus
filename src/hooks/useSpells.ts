import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Spell, SpellLevel } from '../data/spells'
import { useCustomSpellsStore } from '../store/customSpellsStore'

export interface SpellFilters {
  search: string
  type: string   // 'all' | 'arcane' | 'divine'
  school: string // 'all' | school name
  level: string  // 'all' | '0'..'9'
  classIds: string[]
  showKnownOnly: boolean
  knownSpellIds: string[]
}

const CLASS_ALLOWED_TYPES: Record<string, 'arcane' | 'divine'> = {
  wizard: 'arcane', sorcerer: 'arcane', bard: 'arcane', magus: 'arcane',
  alchemist: 'arcane', witch: 'arcane', psychic: 'arcane', bloodrager: 'arcane',
  cleric: 'divine', druid: 'divine', paladin: 'divine', ranger: 'divine',
  inquisitor: 'divine', oracle: 'divine', shaman: 'divine', warpriest: 'divine',
}

export function mapSpellRow(row: Record<string, unknown>): Spell {
  return {
    id: row.id as string,
    name: row.name as string,
    school: (row.school as string) || '',
    subschool: (row.subschool as string) ?? undefined,
    descriptor: (row.descriptor as string) ?? undefined,
    level: ((row.level as number) ?? 0) as SpellLevel,
    type: (row.type as 'arcane' | 'divine') || 'arcane',
    castingTime: (row.casting_time as string) || '',
    range: (row.range as string) || '',
    target: (row.target as string) ?? undefined,
    area: (row.area as string) ?? undefined,
    effect: (row.effect as string) ?? undefined,
    duration: (row.duration as string) || '',
    savingThrow: (row.saving_throw as string) ?? undefined,
    spellResistance: (row.spell_resistance as string) ?? undefined,
    description: (row.description as string) || '',
    material: (row.material as string) ?? undefined,
    arcaneFocus: (row.arcane_focus as string) ?? undefined,
    divineFocus: row.divine_focus ? 'DF' : undefined,
    costlyComponents: row.costly_components ? 'yes' : undefined,
  }
}

const SPELL_COLUMNS =
  'id,name,school,subschool,descriptor,level,type,casting_time,range,target,area,' +
  'effect,duration,saving_throw,spell_resistance,description,material,arcane_focus,' +
  'divine_focus,costly_components'

const LIMIT = 150

export function useSpells(filters: SpellFilters) {
  const [spells, setSpells] = useState<Spell[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const customSpells = useCustomSpellsStore((s) => s.customSpells)

  // Derive unique allowed types from classIds (e.g. ['arcane'] or ['divine'] or both)
  const allowedTypes = [
    ...new Set(
      filters.classIds.map((id) => CLASS_ALLOWED_TYPES[id]).filter(Boolean)
    ),
  ] as ('arcane' | 'divine')[]
  const allowedTypesKey = allowedTypes.join(',')

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)

      // Short-circuit: no known spells but "known only" is on
      if (filters.showKnownOnly && filters.knownSpellIds.length === 0) {
        setSpells([])
        setTotal(0)
        setLoading(false)
        return
      }

      try {
        let query = supabase
          .from('spells')
          .select(SPELL_COLUMNS, { count: 'exact' })
          .order('name')
          .limit(LIMIT)

        if (filters.search) {
          query = query.ilike('name', `%${filters.search}%`)
        }

        if (filters.type !== 'all') {
          query = query.eq('type', filters.type)
        } else if (allowedTypes.length === 1) {
          // Only one spell type available to this character's classes
          query = query.eq('type', allowedTypes[0])
        }

        if (filters.school !== 'all') {
          query = query.ilike('school', `%${filters.school}%`)
        }

        if (filters.level !== 'all') {
          query = query.eq('level', parseInt(filters.level))
        }

        if (filters.showKnownOnly) {
          query = query.in('id', filters.knownSpellIds)
        }

        const { data, error: dbError, count } = await query
        if (dbError) throw dbError

        const dbSpells = (data ?? []).map((row) =>
          mapSpellRow(row as unknown as Record<string, unknown>)
        )

        // Custom spells: filter client-side (usually few)
        const filteredCustom = customSpells.filter((cs) => {
          if (filters.search && !cs.name.toLowerCase().includes(filters.search.toLowerCase())) return false
          if (filters.type !== 'all' && cs.type !== filters.type) return false
          if (filters.school !== 'all' && cs.school !== filters.school) return false
          if (filters.level !== 'all' && cs.level !== parseInt(filters.level)) return false
          if (filters.showKnownOnly && !filters.knownSpellIds.includes(cs.id)) return false
          if (allowedTypes.length === 1 && cs.type !== allowedTypes[0]) return false
          return true
        })

        setSpells([...filteredCustom, ...dbSpells])
        setTotal((count ?? 0) + filteredCustom.length)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search,
    filters.type,
    filters.school,
    filters.level,
    filters.showKnownOnly,
    filters.knownSpellIds.join(','),
    allowedTypesKey,
    customSpells,
  ])

  return { spells, loading, error, total }
}
