import { useState } from 'react'
import { ArrowUpDown, Check } from 'lucide-react'
import type { CampaignEncounter, EncounterEnemy } from '../../store'
import { Button } from '../ui'
import styles from './EncounterTracker.module.css'

interface Props {
  encounter: CampaignEncounter
  onUpdateEnemy: (enemyId: string, updates: Partial<EncounterEnemy>) => void
  onComplete: () => void
}

export function EncounterTracker({ encounter, onUpdateEnemy, onComplete }: Props) {
  const [sorted, setSorted] = useState(false)

  const enemies = sorted
    ? [...encounter.enemies].sort((a, b) => (b.initiative ?? -999) - (a.initiative ?? -999))
    : encounter.enemies

  const hpBarClass = (current: number, max: number) => {
    const pct = max > 0 ? current / max : 0
    if (pct > 0.5) return styles.hpBarGood
    if (pct > 0.25) return styles.hpBarWarn
    return styles.hpBarDanger
  }

  const adjustHp = (enemy: EncounterEnemy, delta: number) => {
    const next = Math.min(enemy.hpMax, Math.max(0, enemy.hpCurrent + delta))
    onUpdateEnemy(enemy.id, { hpCurrent: next })
  }

  return (
    <div className={styles.tracker}>
      <div className={styles.trackerHeader}>
        <span className={styles.trackerTitle}>{encounter.name}</span>
        <div className={styles.trackerActions}>
          <Button variant="secondary" size="sm" onClick={() => setSorted((s) => !s)}>
            <ArrowUpDown size={13} />
            {sorted ? 'Orden original' : 'Por iniciativa'}
          </Button>
          {encounter.status !== 'completed' && (
            <Button variant="primary" size="sm" onClick={onComplete}>
              <Check size={13} />
              Completar
            </Button>
          )}
        </div>
      </div>

      {encounter.enemies.length === 0 ? (
        <p className={styles.noEnemies}>Sin enemigos en este encuentro.</p>
      ) : (
        <div className={styles.enemyList}>
          {enemies.map((enemy) => {
            const pct = enemy.hpMax > 0 ? (enemy.hpCurrent / enemy.hpMax) * 100 : 0
            return (
              <div key={enemy.id} className={styles.enemyRow}>
                <div className={styles.enemyInfo}>
                  <span className={styles.enemyName}>{enemy.name}</span>
                  <span className={styles.enemyAc}>CA {enemy.ac}</span>
                </div>
                <div className={styles.hpSection}>
                  <div className={styles.hpNumbers}>
                    <span className={styles.hpCurrent}>{enemy.hpCurrent}</span>
                    <span className={styles.hpSep}>/</span>
                    <span className={styles.hpMax}>{enemy.hpMax}</span>
                  </div>
                  <div className={styles.hpBar}>
                    <div
                      className={`${styles.hpBarFill} ${hpBarClass(enemy.hpCurrent, enemy.hpMax)}`}
                      style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                    />
                  </div>
                  <div className={styles.hpControls}>
                    <button className={styles.hpBtn} onClick={() => adjustHp(enemy, -5)}>−5</button>
                    <button className={styles.hpBtn} onClick={() => adjustHp(enemy, -1)}>−1</button>
                    <button className={styles.hpBtn} onClick={() => adjustHp(enemy, +1)}>+1</button>
                    <button className={styles.hpBtn} onClick={() => adjustHp(enemy, +5)}>+5</button>
                  </div>
                </div>
                <div className={styles.initiativeSection}>
                  <label className={styles.initiativeLabel}>Init</label>
                  <input
                    type="number"
                    className={styles.initiativeInput}
                    value={enemy.initiative ?? ''}
                    placeholder="—"
                    onChange={(e) => onUpdateEnemy(enemy.id, { initiative: e.target.value === '' ? null : Number(e.target.value) })}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {(encounter.treasure || encounter.notes) && (
        <div className={styles.trackerFooter}>
          {encounter.treasure && <span className={styles.trackerFooterItem}><strong>Tesoro:</strong> {encounter.treasure}</span>}
          {encounter.xpReward > 0 && <span className={styles.trackerFooterItem}><strong>XP:</strong> {encounter.xpReward}</span>}
          {encounter.notes && <span className={styles.trackerFooterItem}>{encounter.notes}</span>}
        </div>
      )}
    </div>
  )
}
