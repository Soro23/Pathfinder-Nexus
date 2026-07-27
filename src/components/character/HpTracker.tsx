import { Plus, Minus } from 'lucide-react'
import { Button, Card } from '../ui'
import styles from './HpTracker.module.css'

interface HpTrackerProps {
  current: number
  max: number
  temp: number
  onAdjust: (amount: number) => void
  onTempChange: (value: number) => void
  className?: string
}

export function HpTracker({ current, max, temp, onAdjust, onTempChange, className }: HpTrackerProps) {
  const isDead = current === 0
  const isCritical = !isDead && current <= max * 0.25

  return (
    <Card padding="lg" className={`${styles.hpPanel} ${className ?? ''}`}>
      <div className={styles.hpDisplay}>
        <Button variant="danger" size="lg" onClick={() => onAdjust(-1)}>
          <Minus size={20} />
        </Button>
        <div className={styles.hpValue}>
          <span className={isDead ? styles.zeroHp : isCritical ? styles.critical : ''}>
            {current}
          </span>
          <span className={styles.hpMax}>/ {max}</span>
          {temp > 0 && <span className={styles.tempSuffix}>(+{temp} temp)</span>}
        </div>
        <Button variant="primary" size="lg" onClick={() => onAdjust(1)}>
          <Plus size={20} />
        </Button>
      </div>
      <div className={styles.hpControls}>
        <Button variant="danger" size="sm" onClick={() => onAdjust(-Math.ceil(max / 4))}>-1/4</Button>
        <Button variant="secondary" size="sm" onClick={() => onAdjust(-5)}>-5</Button>
        <Button variant="secondary" size="sm" onClick={() => onAdjust(5)}>+5</Button>
        <Button variant="primary" size="sm" onClick={() => onAdjust(Math.ceil(max / 4))}>+1/4</Button>
      </div>
      <div className={styles.tempRow}>
        <span className={styles.tempLabel}>PV temporales</span>
        <input
          className={styles.tempInput}
          type="number"
          min={0}
          value={temp === 0 ? '' : temp}
          placeholder="0"
          onChange={(e) => onTempChange(Math.max(0, parseInt(e.target.value) || 0))}
        />
      </div>
    </Card>
  )
}
