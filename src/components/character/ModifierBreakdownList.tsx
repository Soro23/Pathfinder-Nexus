import type { RollBreakdownModifier } from '../../engine'
import styles from './ModifierBreakdownList.module.css'

interface ModifierBreakdownListProps {
  modifiers: RollBreakdownModifier[]
  total: number
  totalLabel?: string
}

export function ModifierBreakdownList({ modifiers, total, totalLabel = 'Total' }: ModifierBreakdownListProps) {
  return (
    <div className={styles.list}>
      {modifiers.map((m, i) => (
        <div key={i}>
          <div className={`${styles.row} ${!m.applied ? styles.rowDiscarded : ''}`}>
            <span className={styles.label}>
              {m.label}
              {m.isSession && <span className={styles.sessionTag}>sesión</span>}
            </span>
            <span className={styles.value}>{m.value >= 0 ? `+${m.value}` : m.value}</span>
          </div>
          {m.discardReason && <div className={styles.discardReason}>{m.discardReason}</div>}
        </div>
      ))}
      <div className={styles.total}>
        <span>{totalLabel}</span>
        <span className={styles.totalValue}>{total >= 0 ? `+${total}` : total}</span>
      </div>
    </div>
  )
}
