import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import styles from './StatPill.module.css'

interface StatPillProps {
  label: string
  value: ReactNode
  suffix?: string
  icon?: LucideIcon
  size?: 'sm' | 'md'
  actions?: ReactNode
  className?: string
}

export function StatPill({ label, value, suffix, icon: Icon, size = 'md', actions, className }: StatPillProps) {
  return (
    <div className={`${styles.pill} ${styles[size]} ${className || ''}`}>
      <div className={styles.main}>
        {Icon && <Icon size={size === 'sm' ? 14 : 16} className={styles.icon} />}
        <div className={styles.text}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>
            {value}
            {suffix && <span className={styles.suffix}>{suffix}</span>}
          </span>
        </div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}
