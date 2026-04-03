import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import type { Monster } from '../types/monster'

function mapMonsterRow(r: Record<string, unknown>): Monster {
  return {
    id: r.id as string,
    name: r.name as string,
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
    description: r.description as string | undefined,
    source: r.source as string | undefined,
    specialAbilities: r.special_abilities as string | undefined,
  }
}

export function useMonsters() {
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMonsters() {
      try {
        const PAGE = 50
        const all: Monster[] = []
        let offset = 0
        while (true) {
          const { data, error } = await supabase
            .from('monsters')
            .select('*')
            .order('name')
            .range(offset, offset + PAGE - 1)
          if (error) throw error
          if (!data || data.length === 0) break
          all.push(...data.map(mapMonsterRow))
          if (data.length < PAGE) break
          offset += PAGE
        }
        setMonsters(all)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading monsters')
      } finally {
        setLoading(false)
      }
    }

    fetchMonsters()
  }, [])

  return { monsters, loading, error }
}

export function useMonstersByType(type: string) {
  const { monsters, loading, error } = useMonsters()

  const filtered = useMemo(() => {
    if (type === 'all') return monsters
    return monsters.filter(m => m.type.toLowerCase().includes(type.toLowerCase()))
  }, [monsters, type])

  return { monsters: filtered, loading, error }
}