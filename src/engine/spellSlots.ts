import { getBonusSpells } from '../data/bonusSpells'
import { getClassById } from '../data/classes'

export interface SyncedSpellSlot {
  max: number
  used: number
}

export type SyncedSpellSlots = Record<number, SyncedSpellSlot>

export function computeSyncedSpellSlots(
  classes: Array<{ id: string; level: number }>,
  abilities: Record<string, number>,
  currentSlots: SyncedSpellSlots,
): SyncedSpellSlots | null {
  const totals: Record<number, number> = {}

  for (const classEntry of classes) {
    const classData = getClassById(classEntry.id)
    if (!classData?.spellsPerDay || !classData.casterAbility) continue

    const row = classData.spellsPerDay[classEntry.level - 1] ?? []
    const abilityScore = abilities[classData.casterAbility] ?? 10
    const bonusPerLevel = getBonusSpells(abilityScore)

    row.forEach((base, spellLevel) => {
      if (base === undefined || base <= 0) return
      totals[spellLevel] = (totals[spellLevel] ?? 0) + base + (bonusPerLevel[spellLevel] ?? 0)
    })
  }

  const nextSlots: SyncedSpellSlots = {}
  for (const [spellLevel, max] of Object.entries(totals)) {
    const level = Number(spellLevel)
    const previous = currentSlots[level]
    nextSlots[level] = { max, used: previous ? Math.min(previous.used, max) : 0 }
  }

  return Object.keys(nextSlots).length > 0 ? nextSlots : null
}
