import { Flame, Swords, Dices } from 'lucide-react'
import type { RollBreakdown } from '../../engine'
import { Button } from '../ui'
import { ModifierBreakdownList } from './ModifierBreakdownList'
import styles from './RollExplainDrawer.module.css'

interface RollExplainDrawerProps {
  breakdown: RollBreakdown
  onConfirmCrit: () => void
}

export function RollExplainDrawer({ breakdown, onConfirmCrit }: RollExplainDrawerProps) {
  return (
    <>
      {breakdown.isCrit && (
        <>
          <div className={`${styles.critIcon} ${styles.critIconCrit}`}><Flame size={44} /></div>
          <p className={styles.critSub}>{breakdown.label}</p>
          <p className={styles.critDesc}>
            20 natural. Confirma el crítico tirando de nuevo con el mismo bonificador.
            Si superas la CA del objetivo, el daño se <strong>duplica</strong>.
          </p>
          <div className={styles.critActions}>
            <Button variant="primary" onClick={onConfirmCrit}><Dices size={14} />Confirmar Crítico</Button>
          </div>
        </>
      )}
      {breakdown.isFumble && (
        <>
          <div className={`${styles.critIcon} ${styles.critIconFumble}`}><Swords size={44} /></div>
          <p className={styles.critSub}>{breakdown.label}</p>
          <p className={styles.critDesc}>
            1 natural — fallo automático. El DM puede aplicar una consecuencia dramática.
          </p>
        </>
      )}
      {!breakdown.isCrit && !breakdown.isFumble && (
        <p className={styles.critSub}>{breakdown.label}</p>
      )}
      <div className={styles.dieResult}>
        <span className={styles.dieResultNumber}>{breakdown.dieResult}</span>
        {breakdown.rolls.length > 1 && (
          <span className={styles.rollsDetail}>[{breakdown.rolls.join(' + ')}]</span>
        )}
      </div>
      <ModifierBreakdownList modifiers={breakdown.modifiers} total={breakdown.total} />
    </>
  )
}
