import type { ReactNode } from 'react'
import styles from './ClassFeatureRow.module.css'

interface ClassFeatureRowProps {
  name: ReactNode
  meta: ReactNode
  active?: boolean
  activeLabel?: string
  uses?: number
  max?: number
  usesLabel?: string
  children: ReactNode
  style?: React.CSSProperties
}

export function ClassFeatureRow({
  name, meta, active = false, activeLabel = 'ACTIVA', uses, max, usesLabel, children, style,
}: ClassFeatureRowProps) {
  return (
    <div className={`${styles.featureRow} ${active ? styles.featureRowActive : ''}`} style={style}>
      <div className={styles.featureInfo}>
        <span className={styles.featureName}>
          {name} {active && <span className={styles.featureActiveTag}>{activeLabel}</span>}
        </span>
        <span className={styles.featureMeta}>{meta}</span>
      </div>
      <div className={styles.featureActions}>
        {uses !== undefined && (
          <span className={styles.featureUses}>{uses}{max !== undefined ? `/${max}` : ''}{usesLabel ? ` ${usesLabel}` : ''}</span>
        )}
        {children}
      </div>
    </div>
  )
}
