import { Loader2 } from 'lucide-react'
import styles from './PageLoader.module.css'

export function PageLoader() {
  return (
    <div className={styles.wrapper}>
      <Loader2 size={28} className={styles.spin} />
    </div>
  )
}
