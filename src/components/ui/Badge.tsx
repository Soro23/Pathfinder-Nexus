import { HTMLAttributes, ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import styles from './Badge.module.css'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'warning' | 'error'
  size?: 'sm' | 'md'
  icon?: LucideIcon
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`${styles.badge} ${styles[variant]} ${styles[size]} ${className || ''}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 10 : 12} />}
      {children}
    </span>
  )
}
