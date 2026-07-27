import type { Character, StatusEffect } from '../store/characterStore'
import { getFeatById } from '../data/feats'
import { RACES, hasFloatingAbilityBonus } from '../data/races'
import { homebrewStore } from '../store/homebrewStore'
import type { Modifier, ModifierTarget, ModifierType, ResolvedStats } from './types'

export function stackModifiers(modifiers: Modifier[], target: ModifierTarget): number {
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

// BonusTarget ('fort','ref','will') → ModifierTarget ('save_fort','save_ref','save_will')
const BONUS_TARGET_MAP: Partial<Record<string, ModifierTarget>> = {
  fort: 'save_fort',
  ref: 'save_ref',
  will: 'save_will',
}

function statusEffectToModifiers(effect: StatusEffect): Modifier[] {
  if (effect.active === false) return []
  if (!effect.bonusTarget || effect.bonusValue === undefined) return []

  const rawTarget = effect.bonusTarget as string
  const target = (BONUS_TARGET_MAP[rawTarget] ?? rawTarget) as ModifierTarget

  return [{
    id: `status-${effect.id}`,
    source: effect.name,
    type: 'untyped',
    target,
    value: effect.bonusValue,
  }]
}

// Penalizaciones fijas por condición Pathfinder 1e
// 'skill:all' es un centinela: se expande a todos los skill IDs del personaje en resolveModifiers
export const CONDITION_MODIFIERS: Record<string, Modifier[]> = {
  sickened: [
    { id: 'cond-sickened-atk',   source: 'Sickened',  type: 'untyped', target: 'attack',     value: -2 },
    { id: 'cond-sickened-dmg',   source: 'Sickened',  type: 'untyped', target: 'damage',     value: -2 },
    { id: 'cond-sickened-fort',  source: 'Sickened',  type: 'untyped', target: 'save_fort',  value: -2 },
    { id: 'cond-sickened-ref',   source: 'Sickened',  type: 'untyped', target: 'save_ref',   value: -2 },
    { id: 'cond-sickened-will',  source: 'Sickened',  type: 'untyped', target: 'save_will',  value: -2 },
    { id: 'cond-sickened-skill', source: 'Sickened',  type: 'untyped', target: 'skill:all',  value: -2 },
  ],
  fatigued: [
    { id: 'cond-fatigued-str',   source: 'Fatigued',  type: 'untyped', target: 'str',        value: -2 },
    { id: 'cond-fatigued-dex',   source: 'Fatigued',  type: 'untyped', target: 'dex',        value: -2 },
  ],
  exhausted: [
    { id: 'cond-exhausted-str',   source: 'Exhausted', type: 'untyped', target: 'str',       value: -6 },
    { id: 'cond-exhausted-dex',   source: 'Exhausted', type: 'untyped', target: 'dex',       value: -6 },
  ],
  shaken: [
    { id: 'cond-shaken-atk',     source: 'Shaken',    type: 'untyped', target: 'attack',     value: -2 },
    { id: 'cond-shaken-fort',    source: 'Shaken',    type: 'untyped', target: 'save_fort',  value: -2 },
    { id: 'cond-shaken-ref',     source: 'Shaken',    type: 'untyped', target: 'save_ref',   value: -2 },
    { id: 'cond-shaken-will',    source: 'Shaken',    type: 'untyped', target: 'save_will',  value: -2 },
    { id: 'cond-shaken-skill',   source: 'Shaken',    type: 'untyped', target: 'skill:all',  value: -2 },
  ],
  frightened: [
    { id: 'cond-frightened-atk',  source: 'Frightened', type: 'untyped', target: 'attack',    value: -2 },
    { id: 'cond-frightened-fort', source: 'Frightened', type: 'untyped', target: 'save_fort', value: -2 },
    { id: 'cond-frightened-ref',  source: 'Frightened', type: 'untyped', target: 'save_ref',  value: -2 },
    { id: 'cond-frightened-will', source: 'Frightened', type: 'untyped', target: 'save_will', value: -2 },
    { id: 'cond-frightened-skill',source: 'Frightened', type: 'untyped', target: 'skill:all', value: -2 },
  ],
  blinded: [
    { id: 'cond-blinded-ac',     source: 'Blinded',   type: 'untyped', target: 'ac',         value: -2 },
    { id: 'cond-blinded-atk',    source: 'Blinded',   type: 'untyped', target: 'attack',     value: -4 },
  ],
  prone: [
    { id: 'cond-prone-atk',      source: 'Prone',     type: 'untyped', target: 'attack',     value: -4 },
  ],
  // staggered y stunned no tienen penalizaciones numéricas — son restricciones de acción (solo UI)
}

const ABILITY_KEY_TO_TARGET: Record<string, ModifierTarget> = {
  strength: 'str',
  dexterity: 'dex',
  constitution: 'con',
  intelligence: 'int',
  wisdom: 'wis',
  charisma: 'cha',
}

export function resolveModifiers(character: Character): ResolvedStats {
  const rawModifiers: Modifier[] = []

  // 1. Feats
  for (const cf of character.feats) {
    const feat = getFeatById(cf.id)
    if (feat?.effects) {
      rawModifiers.push(...feat.effects)
    }
  }

  // 2. Items del inventario
  for (const item of character.inventory) {
    const effects = (item as unknown as { effects?: Modifier[] }).effects
    if (effects) {
      rawModifiers.push(...effects)
    }
  }

  // 3. Armaduras y escudos equipados → ac_armor / ac_shield tipados
  for (const a of character.armor ?? []) {
    if (!a.equipped) continue
    if (a.type === 'shield') {
      rawModifiers.push({
        id: `shield-${a.id}`,
        source: a.name,
        type: 'shield',
        target: 'ac_shield',
        value: a.acBonus,
      })
    } else {
      rawModifiers.push({
        id: `armor-${a.id}`,
        source: a.name,
        type: 'armor',
        target: 'ac_armor',
        value: a.acBonus,
      })
    }
  }

  // 4. Bonificadores raciales
  const raceData = RACES.find((r) => r.id === character.race?.toLowerCase())
    ?? homebrewStore.getState().races.find((r) => r.id === character.race?.toLowerCase())
  if (raceData?.bonuses) {
    for (const [ability, bonus] of Object.entries(raceData.bonuses)) {
      if (bonus && bonus !== 0) {
        const target = ABILITY_KEY_TO_TARGET[ability]
        if (target) {
          rawModifiers.push({
            id: `race-${ability}`,
            source: raceData.label,
            type: 'racial',
            target,
            value: bonus,
          })
        }
      }
    }
  }

  // 4b. Bonificador racial flotante de +2 (Humano, Medio Elfo, Medio Orco): el jugador
  // elige a qué característica se aplica.
  if (raceData && hasFloatingAbilityBonus(character.race) && character.raceAbilityChoice) {
    const target = ABILITY_KEY_TO_TARGET[character.raceAbilityChoice]
    if (target) {
      rawModifiers.push({
        id: 'race-floating',
        source: raceData.label,
        type: 'racial',
        target,
        value: 2,
      })
    }
  }

  // 5. StatusEffects → Modifiers (conversión al vuelo)
  for (const effect of character.statusEffects ?? []) {
    rawModifiers.push(...statusEffectToModifiers(effect))
  }

  // 5. Condiciones Pathfinder
  for (const cond of character.conditions ?? []) {
    if (!cond.active) continue
    const mods = CONDITION_MODIFIERS[cond.id] ?? []
    rawModifiers.push(...mods)
  }

  // 6. Efectos temporales (conjuros, habilidades, pociones…)
  for (const te of character.temporaryEffects ?? []) {
    if (te.active === false) continue
    rawModifiers.push(...te.modifiers)
  }

  // Mapa de rangos para resolver condiciones de rango (Skill Focus, etc.)
  const skillRanks: Record<string, number> = {}
  for (const sr of character.skills) {
    skillRanks[sr.id] = sr.ranks
  }

  // Resolver valores condicionales → lista final con valores efectivos
  const allModifiers: Modifier[] = rawModifiers.map((mod) => ({
    ...mod,
    value: resolveValue(mod, skillRanks),
  }))

  // Recopilar skill IDs afectados (incluyendo los del personaje para el centinela 'skill:all')
  const characterSkillIds = character.skills.map((s) => s.id)
  const explicitSkillIds = allModifiers
    .filter((m) => m.target.startsWith('skill:') && m.target !== 'skill:all')
    .map((m) => m.target.slice(6))

  const allSkillIds = new Set([...characterSkillIds, ...explicitSkillIds])

  // Bonus acumulado del centinela 'skill:all' (condiciones que penalizan todas las skills)
  const skillAllBonus = allModifiers
    .filter((m) => m.target === 'skill:all')
    .reduce((sum, m) => sum + m.value, 0)

  // Filtrar el centinela antes de pasar al stacker
  const stackableModifiers = allModifiers.filter((m) => m.target !== 'skill:all')

  const skillBonuses: Record<string, number> = {}
  for (const skillId of allSkillIds) {
    skillBonuses[skillId] = stackModifiers(stackableModifiers, `skill:${skillId}`) + skillAllBonus
  }

  return {
    skillBonuses,
    saveBonuses: {
      fort: stackModifiers(stackableModifiers, 'save_fort'),
      ref: stackModifiers(stackableModifiers, 'save_ref'),
      will: stackModifiers(stackableModifiers, 'save_will'),
    },
    acBonuses: {
      natural:    stackModifiers(stackableModifiers, 'ac_natural'),
      deflection: stackModifiers(stackableModifiers, 'ac_deflection'),
      dodge:      stackModifiers(stackableModifiers, 'ac_dodge'),
      armor:      stackModifiers(stackableModifiers, 'ac_armor'),
      shield:     stackModifiers(stackableModifiers, 'ac_shield'),
      total:      stackModifiers(stackableModifiers, 'ac'),
    },
    abilityBonuses: {
      str: stackModifiers(stackableModifiers, 'str'),
      dex: stackModifiers(stackableModifiers, 'dex'),
      con: stackModifiers(stackableModifiers, 'con'),
      int: stackModifiers(stackableModifiers, 'int'),
      wis: stackModifiers(stackableModifiers, 'wis'),
      cha: stackModifiers(stackableModifiers, 'cha'),
    },
    initiativeBonus: stackModifiers(stackableModifiers, 'initiative'),
    attackBonus:     stackModifiers(stackableModifiers, 'attack'),
    damageBonus:     stackModifiers(stackableModifiers, 'damage'),
    hpBonus:         stackModifiers(stackableModifiers, 'hp'),
    speedBonus:      stackModifiers(stackableModifiers, 'speed'),
    cmbBonus:        stackModifiers(stackableModifiers, 'cmb'),
    cmdBonus:        stackModifiers(stackableModifiers, 'cmd'),
    allModifiers: stackableModifiers,
  }
}
