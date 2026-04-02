import type { Character } from '../store/characterStore'
import { getFeatById } from '../data/feats'
import type { Modifier, ModifierTarget, ModifierType, ResolvedStats } from './types'

function stackModifiers(modifiers: Modifier[], target: ModifierTarget): number {
  const relevant = modifiers.filter((m) => m.target === target)
  if (relevant.length === 0) return 0

  const byType = new Map<ModifierType, Modifier[]>()
  for (const mod of relevant) {
    const list = byType.get(mod.type) ?? []
    list.push(mod)
    byType.set(mod.type, list)
  }

  let total = 0
  for (const [type, mods] of byType) {
    if (type === 'untyped' || type === 'circumstance' || type === 'dodge') {
      total += mods.reduce((s, m) => s + m.value, 0)
    } else {
      total += Math.max(...mods.map((m) => m.value))
    }
  }
  return total
}

// Resuelve el valor efectivo de un modificador según el estado del personaje
function resolveValue(mod: Modifier, skillRanks: Record<string, number>): number {
  if (mod.rankCondition) {
    const ranks = skillRanks[mod.rankCondition.skillId] ?? 0
    if (ranks >= mod.rankCondition.minRanks) {
      return mod.rankCondition.bonusValue
    }
  }
  return mod.value
}

export function resolveModifiers(character: Character): ResolvedStats {
  const rawModifiers: Modifier[] = []

  for (const cf of character.feats) {
    const feat = getFeatById(cf.id)
    if (feat?.effects) {
      rawModifiers.push(...feat.effects)
    }
  }

  for (const item of character.inventory) {
    const effects = (item as unknown as { effects?: Modifier[] }).effects
    if (effects) {
      rawModifiers.push(...effects)
    }
  }

  // Mapa de rangos actuales del personaje para resolver condiciones
  const skillRanks: Record<string, number> = {}
  for (const sr of character.skills) {
    skillRanks[sr.id] = sr.ranks
  }

  // Resolver valores condicionales → lista final con valores efectivos
  const allModifiers: Modifier[] = rawModifiers.map((mod) => ({
    ...mod,
    value: resolveValue(mod, skillRanks),
  }))

  const skillIds = new Set(
    allModifiers
      .filter((m) => m.target.startsWith('skill:'))
      .map((m) => m.target.slice(6))
  )

  const skillBonuses: Record<string, number> = {}
  for (const skillId of skillIds) {
    skillBonuses[skillId] = stackModifiers(allModifiers, `skill:${skillId}`)
  }

  return {
    skillBonuses,
    saveBonuses: {
      fort: stackModifiers(allModifiers, 'save_fort'),
      ref: stackModifiers(allModifiers, 'save_ref'),
      will: stackModifiers(allModifiers, 'save_will'),
    },
    acBonuses: {
      natural: stackModifiers(allModifiers, 'ac_natural'),
      deflection: stackModifiers(allModifiers, 'ac_deflection'),
      dodge: stackModifiers(allModifiers, 'ac_dodge'),
      armor: 0,
      total: stackModifiers(allModifiers, 'ac'),
    },
    initiativeBonus: stackModifiers(allModifiers, 'initiative'),
    attackBonus: stackModifiers(allModifiers, 'attack'),
    damageBonus: stackModifiers(allModifiers, 'damage'),
    hpBonus: stackModifiers(allModifiers, 'hp'),
    speedBonus: stackModifiers(allModifiers, 'speed'),
    cmbBonus: stackModifiers(allModifiers, 'cmb'),
    cmdBonus: stackModifiers(allModifiers, 'cmd'),
    allModifiers,
  }
}
