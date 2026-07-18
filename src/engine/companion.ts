import type { CompanionDetail } from '../types/animalCompanion'
import { COMPANION_PROGRESSION, mod } from '../data/animalCompanions'
import { getSizeACModifier, normalizeSizeString } from './size'

export interface ComputedCompanionAttack {
  name: string
  damage: string
}

export interface ComputedCompanionStats {
  hd: number
  bab: number
  fort: number
  ref: number
  will: number
  str?: number
  dex?: number
  con?: number
  int?: number
  wis?: number
  cha?: number
  naturalArmor: number
  ac: number
  maxFeats: number
  maxTricks: number
  skillPoints: number
  special: string[]
  attacks: ComputedCompanionAttack[]
}

// "starting" es null/undefined cuando la especie carece de esa puntuación (ej. Int en
// alimañas sin mente) — se propaga como "sin modificador" en vez de forzar un valor.
function abilityScore(starting: number | null | undefined, delta: number | null | undefined): number | undefined {
  if (starting === null || starting === undefined) return undefined
  return starting + (delta ?? 0)
}

// Ataques en texto libre del statblock, ej. "2 claws (1d4)" → { name: "2 claws", damage: "1d4" }.
const ATTACK_RE = /^(.*?)\s*\(([^)]+)\)\s*$/

function parseAttacks(raw: string[] | undefined): ComputedCompanionAttack[] {
  if (!raw) return []
  return raw.map((s) => {
    const trimmed = s.trim()
    const match = ATTACK_RE.exec(trimmed)
    return match ? { name: match[1].trim(), damage: match[2].trim() } : { name: trimmed, damage: '' }
  })
}

function splitList(text: string | undefined): string[] {
  if (!text) return []
  return text.split(',').map((s) => s.trim()).filter(Boolean)
}

/**
 * Stats de un compañero animal a un nivel de clase dado, combinando el statblock del
 * catálogo (starting/advancement) con la curva de progresión estándar del rasgo de clase
 * (COMPANION_PROGRESSION). El "advancement" del catálogo se activa cuando el nivel alcanza
 * companion.advancementLevel: sus deltas de característica/armadura natural se SUMAN a los
 * de starting, pero sus ataques REEMPLAZAN a los de starting (los dados de daño cambian).
 */
export function computeCompanionStats(detail: CompanionDetail, companionLevel: number): ComputedCompanionStats {
  const lvl = Math.max(1, Math.min(20, companionLevel))
  const prog = COMPANION_PROGRESSION[lvl - 1]

  const useAdvancement = detail.advancementLevel !== undefined && lvl >= detail.advancementLevel && !!detail.advancement

  const baseAbilities = detail.starting.ability_scores ?? {}
  const deltaAbilities = useAdvancement ? (detail.advancement?.ability_scores ?? {}) : {}

  const str = abilityScore(baseAbilities.str, deltaAbilities.str)
  const dex = abilityScore(baseAbilities.dex, deltaAbilities.dex)
  const con = abilityScore(baseAbilities.con, deltaAbilities.con)
  const int = abilityScore(baseAbilities.int, deltaAbilities.int)
  const wis = abilityScore(baseAbilities.wis, deltaAbilities.wis)
  const cha = abilityScore(baseAbilities.cha, deltaAbilities.cha)

  // Solo Fuerza y Destreza reciben el bono de progresión por nivel del compañero.
  const strFinal = str !== undefined ? str + prog.strDexBonus : undefined
  const dexFinal = dex !== undefined ? dex + prog.strDexBonus : undefined

  const baseNaturalArmor = detail.starting.natural_armor ?? 0
  const deltaNaturalArmor = useAdvancement ? (detail.advancement?.natural_armor ?? 0) : 0
  const naturalArmor = baseNaturalArmor + deltaNaturalArmor + prog.naBonus

  const sizeText = useAdvancement ? (detail.sizeAdvanced ?? detail.sizeStart) : detail.sizeStart
  const sizeMod = getSizeACModifier(normalizeSizeString(sizeText))

  const dexMod = dexFinal !== undefined ? mod(dexFinal) : 0
  const conMod = con !== undefined ? mod(con) : 0
  const wisMod = wis !== undefined ? mod(wis) : 0

  // Texto a mostrar: preferir el statblock traducido cuando exista (solo 41/291 filas lo
  // tienen), con fallback al bloque en inglés. Los valores numéricos usados arriba siempre
  // vienen del bloque en inglés, que es el que garantiza todos los campos.
  const displayStarting = detail.startingEs ?? detail.starting
  const displayAdvancement = useAdvancement ? (detail.advancementEs ?? detail.advancement) : undefined

  const attacks = parseAttacks(displayAdvancement?.attacks ?? displayStarting.attacks)

  const specialText = [
    ...splitList(displayStarting.special_qualities),
    ...splitList(displayStarting.special_attacks),
    ...splitList(displayAdvancement?.special_qualities),
    ...splitList(displayAdvancement?.special_attacks),
  ]
  const specialAbilityNames = (detail.specialAbilities ?? []).map((a) => `${a.name} (${a.type})`)

  return {
    hd: prog.hd,
    bab: prog.bab,
    fort: prog.fort + conMod,
    ref: prog.ref + dexMod,
    will: prog.will + wisMod,
    str: strFinal, dex: dexFinal, con, int, wis, cha,
    naturalArmor,
    ac: 10 + dexMod + naturalArmor + sizeMod,
    maxFeats: prog.feats,
    maxTricks: 3 + prog.bonusTricks,
    skillPoints: prog.skills,
    special: [...prog.special, ...specialText, ...specialAbilityNames],
    attacks,
  }
}
