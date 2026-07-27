import type { Condition } from '../../store'
import { CONDITION_MODIFIERS } from '../../engine'
import styles from './ConditionPanel.module.css'

const TARGET_LABELS: Record<string, string> = {
  attack: 'ataque',
  damage: 'daño',
  ac: 'CA',
  save_fort: 'Fortaleza',
  save_ref: 'Reflejos',
  save_will: 'Voluntad',
  str: 'Fuerza',
  dex: 'Destreza',
  con: 'Constitución',
  int: 'Inteligencia',
  wis: 'Sabiduría',
  cha: 'Carisma',
  'skill:all': 'todas las habilidades',
}

function formatConditionEffect(id: string): string {
  const mods = CONDITION_MODIFIERS[id] ?? []
  const byValue = new Map<number, string[]>()
  for (const m of mods) {
    const label = TARGET_LABELS[m.target] ?? m.target
    byValue.set(m.value, [...(byValue.get(m.value) ?? []), label])
  }
  return [...byValue.entries()]
    .map(([value, labels]) => `${value >= 0 ? '+' : ''}${value} ${labels.join(', ')}`)
    .join(' · ')
}

const NUMERIC_CONDITIONS = [
  { id: 'sickened', label: 'Nauseabundo' },
  { id: 'fatigued', label: 'Fatigado' },
  { id: 'exhausted', label: 'Exhausto' },
  { id: 'shaken', label: 'Sacudido' },
  { id: 'frightened', label: 'Asustado' },
  { id: 'blinded', label: 'Cegado' },
  { id: 'prone', label: 'Postrado' },
] as const

const INFO_ONLY_CONDITIONS = [
  { id: 'staggered', label: 'Aturdido' },
  { id: 'stunned', label: 'Paralizado/Atontado' },
] as const

interface ConditionPanelProps {
  conditions: Condition[]
  onToggle: (id: string, label: string) => void
}

export function ConditionPanel({ conditions, onToggle }: ConditionPanelProps) {
  const isActive = (id: string) => conditions.find((c) => c.id === id)?.active ?? false

  return (
    <div className={styles.list}>
      <span className={styles.groupLabel}>Con efecto mecánico</span>
      {NUMERIC_CONDITIONS.map(({ id, label }) => {
        const active = isActive(id)
        return (
          <div key={id} className={`${styles.row} ${active ? styles.rowActive : ''}`}>
            <div className={styles.rowHeader}>
              <span className={styles.name}>{label}</span>
              <button
                className={`${styles.toggleBtn} ${active ? styles.toggleBtnActive : ''}`}
                onClick={() => onToggle(id, label)}
              >
                {active ? 'ACTIVA' : 'Activar'}
              </button>
            </div>
            {active && <span className={styles.effectText}>{formatConditionEffect(id)}</span>}
          </div>
        )
      })}

      <span className={styles.groupLabel}>Sin efecto numérico</span>
      {INFO_ONLY_CONDITIONS.map(({ id, label }) => {
        const active = isActive(id)
        return (
          <div key={id} className={`${styles.row} ${active ? styles.rowActive : ''}`}>
            <div className={styles.rowHeader}>
              <span className={styles.name}>{label}</span>
              <button
                className={`${styles.toggleBtn} ${active ? styles.toggleBtnActive : ''}`}
                onClick={() => onToggle(id, label)}
              >
                {active ? 'ACTIVA' : 'Activar'}
              </button>
            </div>
            {active && <span className={styles.infoText}>Sin penalizador — restringe acciones disponibles.</span>}
          </div>
        )
      })}
    </div>
  )
}
