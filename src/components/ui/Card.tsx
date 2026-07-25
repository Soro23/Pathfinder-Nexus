import { HTMLAttributes, ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'outlined' | 'ornate'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${styles[`padding-${padding}`]} ${hoverable ? styles.hoverable : ''} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
  centered?: boolean
  action?: ReactNode
}

export function CardHeader({ children, className, centered = false, action }: CardHeaderProps) {
  return (
    <div className={`${styles.header} ${centered ? styles.headerCentered : ''} ${className || ''}`}>
      <div className={styles.headerTitle}>{children}</div>
      {action && <div className={styles.headerAction}>{action}</div>}
    </div>
  )
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.content} ${className || ''}`}>{children}</div>
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.footer} ${className || ''}`}>{children}</div>
}
