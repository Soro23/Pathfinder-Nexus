import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { Card } from '../ui'
import styles from './HpTracker.module.css'

interface HpTrackerProps {
  current: number
  max: number
  temp: number
  maxModifier: number
  maxOverride: number | null
  onAdjust: (amount: number) => void
  onSetCurrent: (value: number) => void
  onTempChange: (value: number) => void
  onMaxModifierChange: (value: number) => void
  onMaxOverrideChange: (value: number | null) => void
  className?: string
}

export function HpTracker({
  current, max, temp, maxModifier, maxOverride,
  onAdjust, onSetCurrent, onTempChange, onMaxModifierChange, onMaxOverrideChange, className,
}: HpTrackerProps) {
  const [healing, setHealing] = useState(0)
  const [damage, setDamage] = useState(0)

  const isDead = current === 0
  const isCritical = !isDead && current <= max * 0.25
  const previewHp = Math.max(0, Math.min(max, current + healing - damage))

  const applyHealing = () => {
    if (healing <= 0) return
    onAdjust(healing)
    setHealing(0)
  }

  const applyDamage = () => {
    if (damage <= 0) return
    onAdjust(-damage)
    setDamage(0)
  }

  return (
    <Card padding="lg" className={`${styles.hpPanel} ${className ?? ''}`}>
      <div className={styles.topRow}>
        <div className={styles.currentMaxGroup}>
          <div className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>Actual</span>
            <input
              className={`${styles.numberInput} ${isDead ? styles.zeroHp : isCritical ? styles.critical : ''}`}
              type="number"
              value={current}
              onChange={(e) => onSetCurrent(parseInt(e.target.value) || 0)}
            />
          </div>
          <span className={styles.slash}>/</span>
          <div className={styles.fieldBlock}>
            <span className={styles.fieldLabel}>Máximo</span>
            <input className={styles.numberInput} type="number" value={max} disabled readOnly />
          </div>
        </div>
        <div className={styles.fieldBlock}>
          <span className={styles.fieldLabel}>Temp</span>
          <input
            className={styles.numberInput}
            type="number"
            min={0}
            value={temp === 0 ? '' : temp}
            placeholder="0"
            onChange={(e) => onTempChange(Math.max(0, parseInt(e.target.value) || 0))}
          />
        </div>
      </div>

      <div className={styles.actionRow}>
        <div className={`${styles.actionBlock} ${styles.healingBlock}`}>
          <span className={styles.actionLabel}>Curación</span>
          <input
            className={styles.actionInput}
            type="number"
            min={0}
            value={healing === 0 ? '' : healing}
            placeholder="0"
            onChange={(e) => setHealing(Math.max(0, parseInt(e.target.value) || 0))}
          />
        </div>
        <button className={styles.healBtn} onClick={applyHealing} disabled={healing <= 0} title="Aplicar curación">
          <Plus size={20} />
        </button>
      </div>

      <div className={styles.newHpPreview}>
        <span className={styles.newHpLabel}>Nuevos PV</span>
        <span className={styles.newHpValue}>{previewHp}</span>
      </div>

      <div className={styles.actionRow}>
        <div className={`${styles.actionBlock} ${styles.damageBlock}`}>
          <span className={styles.actionLabel}>Daño</span>
          <input
            className={styles.actionInput}
            type="number"
            min={0}
            value={damage === 0 ? '' : damage}
            placeholder="0"
            onChange={(e) => setDamage(Math.max(0, parseInt(e.target.value) || 0))}
          />
        </div>
        <button className={styles.damageBtn} onClick={applyDamage} disabled={damage <= 0} title="Aplicar daño">
          <Minus size={20} />
        </button>
      </div>

      <div className={styles.overrideRow}>
        <div className={styles.fieldBlock}>
          <span className={styles.fieldLabel}>Modificador PV Máx.</span>
          <input
            className={styles.numberInput}
            type="number"
            value={maxModifier === 0 ? '' : maxModifier}
            placeholder="—"
            onChange={(e) => onMaxModifierChange(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className={styles.fieldBlock}>
          <span className={styles.fieldLabel}>Anular PV Máx.</span>
          <input
            className={styles.numberInput}
            type="number"
            value={maxOverride ?? ''}
            placeholder="—"
            onChange={(e) => {
              const raw = e.target.value
              onMaxOverrideChange(raw === '' ? null : (parseInt(raw) || 0))
            }}
          />
        </div>
      </div>
    </Card>
  )
}
