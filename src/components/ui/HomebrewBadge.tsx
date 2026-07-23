import { Wand2 } from 'lucide-react'
import styles from './HomebrewBadge.module.css'

export function HomebrewBadge({ className }: { className?: string }) {
  return (
    <span className={`${styles.badge} ${className || ''}`} title="Contenido homebrew">
      <Wand2 size={11} />
      Homebrew
    </span>
  )
}
