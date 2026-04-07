import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Spell } from '../data/spells'
import { mapSpellRow } from './useSpells'

const SPELL_COLUMNS =
  'id,name,school,subschool,descriptor,level,type,casting_time,range,target,area,' +
  'effect,duration,saving_throw,spell_resistance,description,material,arcane_focus,' +
  'divine_focus,costly_components'

/** Fetches a set of spells by their IDs and returns them as a id→Spell map. */
export function useSpellsByIds(ids: string[]) {
  const [spells, setSpells] = useState<Record<string, Spell>>({})
  const [loading, setLoading] = useState(false)

  const key = ids.slice().sort().join(',')

  useEffect(() => {
    if (ids.length === 0) {
      setSpells({})
      return
    }
    setLoading(true)
    supabase
      .from('spells')
      .select(SPELL_COLUMNS)
      .in('id', ids)
      .then(({ data, error }) => {
        if (!error && data) {
          const map: Record<string, Spell> = {}
          for (const row of data) {
            const spell = mapSpellRow(row as unknown as Record<string, unknown>)
            map[spell.id] = spell
          }
          setSpells(map)
        }
        setLoading(false)
      })
    // Omitting stable module-level refs (supabase, mapSpellRow) from deps — eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { spells, loading }
}
