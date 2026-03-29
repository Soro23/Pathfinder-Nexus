/**
 * Pathfinder bonus spells per day based on caster ability score.
 * Formula for spell level sl (1-9): bonus = mod >= sl ? floor((mod - sl) / 4) + 1 : 0
 * Cantrips (level 0) never receive bonus slots.
 * Scores below 10 (modifier ≤ 0) cannot access bonus spells.
 */

import { calculateModifier } from '../store'

/**
 * Returns an array of 10 values (indices 0–9) representing bonus spell slots
 * per spell level for the given ability score.
 * Index 0 is always 0 (no bonus cantrips).
 * Returns all-zeros if the score grants no bonus spells (< 12).
 */
export function getBonusSpells(abilityScore: number): number[] {
  const mod = calculateModifier(abilityScore)
  return Array.from({ length: 10 }, (_, sl) => {
    if (sl === 0) return 0                           // no bonus cantrips
    if (mod < sl) return 0                           // modifier too low for this level
    return Math.floor((mod - sl) / 4) + 1
  })
}

export interface BonusSpellRow {
  scoreRange: string
  modifier: number
  canCast: boolean
  bonus: (number | null)[]   // length 10, index = spell level
}

/** Full reference table matching the Pathfinder SRD (scores 1–45). */
export const BONUS_SPELL_TABLE: BonusSpellRow[] = (() => {
  const ranges: { range: string; score: number }[] = [
    { range: '1',    score: 1  },
    { range: '2–3',  score: 2  },
    { range: '4–5',  score: 4  },
    { range: '6–7',  score: 6  },
    { range: '8–9',  score: 8  },
    { range: '10–11',score: 10 },
    { range: '12–13',score: 12 },
    { range: '14–15',score: 14 },
    { range: '16–17',score: 16 },
    { range: '18–19',score: 18 },
    { range: '20–21',score: 20 },
    { range: '22–23',score: 22 },
    { range: '24–25',score: 24 },
    { range: '26–27',score: 26 },
    { range: '28–29',score: 28 },
    { range: '30–31',score: 30 },
    { range: '32–33',score: 32 },
    { range: '34–35',score: 34 },
    { range: '36–37',score: 36 },
    { range: '38–39',score: 38 },
    { range: '40–41',score: 40 },
    { range: '42–43',score: 42 },
    { range: '44–45',score: 44 },
  ]

  return ranges.map(({ range, score }) => {
    const mod = calculateModifier(score)
    const canCast = mod >= 0   // score >= 10 needed to cast at all (mod ≥ 0 grants base spells)
    const bonus: (number | null)[] = Array.from({ length: 10 }, (_, sl) => {
      if (!canCast) return null        // can't cast
      if (sl === 0) return null        // no bonus cantrips
      if (mod < sl) return null        // modifier too low
      return Math.floor((mod - sl) / 4) + 1
    })
    return { scoreRange: range, modifier: mod, canCast, bonus }
  })
})()
