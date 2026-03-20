import { useState } from 'react'
import { X, Dice6 } from 'lucide-react'
import type { Character, CharacterClass } from '../../store'
import { calculateModifier } from '../../store'
import { getClassById } from '../../data'
import { Button } from '../ui'
import styles from './LevelUpModal.module.css'

export interface LevelUpUpdates {
  newLevel: number
  newClassLevels: CharacterClass[]
  hpGained: number
  hpRolled: number | null
}

interface LevelUpModalProps {
  character: Character
  onConfirm: (updates: LevelUpUpdates) => void
  onClose: () => void
}

type HpMode = 'roll' | 'manual'

export function LevelUpModal({ character, onConfirm, onClose }: LevelUpModalProps) {
  const newLevel = character.level + 1
  const primaryClass = character.classes[0]
  const classData = getClassById(primaryClass?.id || '')
  const hitDie = classData?.hitDie ?? 8
  const conMod = calculateModifier(character.abilities.constitution)
  const intMod = calculateModifier(character.abilities.intelligence)
  const skillPointsGained = Math.max(1, (classData?.skillPointsPerLevel ?? 2) + intMod)

  const [hpMode, setHpMode] = useState<HpMode>('roll')
  const [rolledValue, setRolledValue] = useState<number | null>(null)
  const [manualValue, setManualValue] = useState<number>(1)

  const handleRoll = () => {
    const result = Math.floor(Math.random() * hitDie) + 1
    setRolledValue(result)
  }

  const activeRoll = hpMode === 'roll' ? rolledValue : manualValue
  const hpGained = activeRoll !== null ? Math.max(1, activeRoll + conMod) : null

  const canConfirm = hpGained !== null

  const handleConfirm = () => {
    if (hpGained === null) return

    const newClassLevels: CharacterClass[] = character.classes.map((c, i) =>
      i === 0 ? { ...c, level: c.level + 1 } : c
    )

    onConfirm({
      newLevel,
      newClassLevels,
      hpGained,
      hpRolled: hpMode === 'roll' ? rolledValue : null,
    })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Subir al nivel {newLevel}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Hit Die Section */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Dado de golpe: d{hitDie}</p>

          {/* Mode toggle */}
          <div className={styles.modeToggle}>
            <button
              className={`${styles.modeBtn} ${hpMode === 'roll' ? styles.modeBtnActive : ''}`}
              onClick={() => setHpMode('roll')}
            >
              <Dice6 size={15} />
              Tirar dado
            </button>
            <button
              className={`${styles.modeBtn} ${hpMode === 'manual' ? styles.modeBtnActive : ''}`}
              onClick={() => setHpMode('manual')}
            >
              Manual
            </button>
          </div>

          {/* Roll mode */}
          {hpMode === 'roll' && (
            <div className={styles.rollArea}>
              <button className={styles.rollBtn} onClick={handleRoll}>
                <Dice6 size={16} />
                {rolledValue !== null ? 'Volver a tirar' : `Tirar d${hitDie}`}
              </button>
              {rolledValue !== null && (
                <span className={styles.rollResult}>{rolledValue}</span>
              )}
            </div>
          )}

          {/* Manual mode */}
          {hpMode === 'manual' && (
            <div className={styles.manualArea}>
              <input
                type="number"
                className={styles.manualInput}
                min={1}
                max={hitDie}
                value={manualValue}
                onChange={(e) => setManualValue(Math.max(1, Math.min(hitDie, parseInt(e.target.value) || 1)))}
              />
            </div>
          )}

          {/* Con modifier and total */}
          <div className={styles.hpSummary}>
            <span className={styles.hpDetail}>
              Modificador CON: <span className={styles.mono}>{conMod >= 0 ? '+' : ''}{conMod}</span>
            </span>
            {hpGained !== null && (
              <span className={styles.hpTotal}>
                Total PV ganados: <span className={styles.hpTotalVal}>+{hpGained}</span>
              </span>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Al subir de nivel</p>
          <ul className={styles.infoList}>
            <li className={styles.infoItem}>
              Puntos de habilidad: <strong>+{skillPointsGained} puntos disponibles</strong>
            </li>
            {newLevel % 2 === 1 && (
              <li className={styles.infoItem}>
                Puedes elegir una nueva dote
              </li>
            )}
            {newLevel % 4 === 0 && (
              <li className={styles.infoItem}>
                Puedes aumentar una puntuación de característica en +1
              </li>
            )}
          </ul>
        </div>

        {/* Confirm */}
        <div className={styles.modalFooter}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!canConfirm}>
            Confirmar subida de nivel
          </Button>
        </div>
      </div>
    </div>
  )
}
