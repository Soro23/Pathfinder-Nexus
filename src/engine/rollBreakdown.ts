import type { Modifier, ModifierTarget, ModifierType } from './types'
import { CONDITION_MODIFIERS } from './modifiers'
import type { Condition } from '../store/characterStore'

export interface RollBreakdownModifier {
  label: string
  value: number
  type: ModifierType | 'base'
  applied: boolean
  discardReason?: string
  isSession: boolean
}

export interface StatExplain {
  label: string
  total: number
  modifiers: RollBreakdownModifier[]
}

export interface RollBreakdown {
  label: string
  dieResult: number
  rolls: number[]
  modifiers: RollBreakdownModifier[]
  total: number
  isCrit?: boolean
  isFumble?: boolean
}

// Un modificador se considera "de sesión" (frente a "de build") si su id lleva uno de
// los tres prefijos deterministas que ya usa el motor para condiciones, efectos de
// estado y efectos temporales de poder de clase — es la base de la marca AlteredValue.
export function isSessionModifier(m: Modifier): boolean {
  return m.id.startsWith('cond-') || m.id.startsWith('status-') || m.id.startsWith('temp-')
}

function baseComponentsToRows(baseComponents: { label: string; value: number }[]): RollBreakdownModifier[] {
  return baseComponents.map((b) => ({ label: b.label, value: b.value, type: 'base', applied: true, isSession: false }))
}

// Reconstruye, para un conjunto de targets, qué modificadores se aplican y cuáles se
// descartan por la regla de acumulación de stackModifiers (mismo criterio, sin duplicar
// su lógica): untyped/circumstance/dodge siempre se suman; el resto solo aplica el mayor
// de su tipo, y el resto de ese tipo se marca applied:false con el motivo.
export function applyStackingFlags(modifiers: Modifier[], targets: ModifierTarget[]): RollBreakdownModifier[] {
  const relevant = modifiers.filter((m) => targets.includes(m.target))
  const byType = new Map<ModifierType, Modifier[]>()
  for (const m of relevant) {
    byType.set(m.type, [...(byType.get(m.type) ?? []), m])
  }

  return relevant.map((m) => {
    const isSession = isSessionModifier(m)
    if (m.type === 'untyped' || m.type === 'circumstance' || m.type === 'dodge') {
      return { label: m.source, value: m.value, type: m.type, applied: true, isSession }
    }
    const group = byType.get(m.type)!
    const winner = group.reduce((a, b) => (b.value > a.value ? b : a))
    const applied = m.id === winner.id
    return {
      label: m.source,
      value: m.value,
      type: m.type,
      applied,
      discardReason: applied ? undefined : `No acumula con ${m.type}: ${winner.source} (${winner.value >= 0 ? '+' : ''}${winner.value})`,
      isSession,
    }
  })
}

export function buildStatExplain(
  label: string,
  total: number,
  baseComponents: { label: string; value: number }[],
  allModifiers: Modifier[],
  targets: ModifierTarget[],
): StatExplain {
  return {
    label,
    total,
    modifiers: [...baseComponentsToRows(baseComponents), ...applyStackingFlags(allModifiers, targets)],
  }
}

export function buildRollBreakdown(
  label: string,
  dieResult: number,
  rolls: number[],
  total: number,
  baseComponents: { label: string; value: number }[],
  allModifiers: Modifier[],
  targets: ModifierTarget[],
  crit?: { isCrit?: boolean; isFumble?: boolean },
): RollBreakdown {
  return {
    label,
    dieResult,
    rolls,
    total,
    modifiers: [...baseComponentsToRows(baseComponents), ...applyStackingFlags(allModifiers, targets)],
    ...crit,
  }
}

// Filas sintéticas para el centinela 'skill:all': resolveModifiers lo consume para el
// total pero lo excluye de allModifiers, así que el desglose de habilidad tiene que
// reconstruirlo a partir de las condiciones activas directamente.
export function buildSkillAllRows(conditions: Condition[]): RollBreakdownModifier[] {
  const rows: RollBreakdownModifier[] = []
  for (const cond of conditions) {
    if (!cond.active) continue
    const skillAllMod = (CONDITION_MODIFIERS[cond.id] ?? []).find((m) => m.target === 'skill:all')
    if (skillAllMod) {
      rows.push({ label: skillAllMod.source, value: skillAllMod.value, type: skillAllMod.type, applied: true, isSession: true })
    }
  }
  return rows
}

// Suma neta de los modificadores "de sesión" (condiciones/efectos activos) sobre un
// conjunto de targets — usado para el badge de AlteredValue y para el `eff` real de
// los tiros de salvación (sustituye el 0 fijo que había antes).
export function sumSessionModifiers(allModifiers: Modifier[], targets: ModifierTarget[]): number {
  return applyStackingFlags(allModifiers, targets)
    .filter((m) => m.isSession && m.applied)
    .reduce((sum, m) => sum + m.value, 0)
}
