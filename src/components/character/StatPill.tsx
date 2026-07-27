import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import styles from './StatPill.module.css'

interface StatPillProps {
  label: string
  value: string
  bonus?: number
  altered?: boolean
  onExplain?: () => void
  /** Icono opcional para marcar visualmente el tipo de acción (p. ej. "info" en la cabecera). */
  icon?: ReactNode
}

export function StatPill({ label, value, bonus = 0, altered = false, onExplain, icon }: StatPillProps) {
  const content = (
    <>
      <span className={styles.statPillLabel}>
        {altered ? <AlertTriangle size={10} className={styles.alteredIcon} /> : icon}
        {label}
      </span>
      <span className={styles.statPillValue}>{value}</span>
      {bonus !== 0 && (
        <span className={bonus > 0 ? styles.effectBadgePos : styles.effectBadgeNeg}>
          {bonus > 0 ? `+${bonus}` : bonus}
        </span>
      )}
    </>
  )

  const className = `${styles.statPill} ${altered ? styles.altered : ''}`

  if (!onExplain) {
    return <div className={className}>{content}</div>
  }

  return (
    <button type="button" className={className} onClick={onExplain}>
      {content}
    </button>
  )
}
