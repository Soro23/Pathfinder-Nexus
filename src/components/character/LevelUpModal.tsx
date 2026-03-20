import { useState } from 'react'
import { X, Dice6 } from 'lucide-react'
import type { Character, CharacterClass } from '../../store'
import { calculateModifier } from '../../store'
import { getClassById, CLASSES } from '../../data'
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
type ClassChoice = { type: 'existing'; classId: string } | { type: 'new'; classId: string }

export function LevelUpModal({ character, onConfirm, onClose }: LevelUpModalProps) {
  const newLevel = character.level + 1
  const conMod = calculateModifier(character.abilities.constitution)
  const intMod = calculateModifier(character.abilities.intelligence)

  const [classChoice, setClassChoice] = useState<ClassChoice>({
    type: 'existing',
    classId: character.classes[0].id,
  })
  const [showNewClassPicker, setShowNewClassPicker] = useState(false)
  const [hpMode, setHpMode] = useState<HpMode>('roll')
  const [rolledValue, setRolledValue] = useState<number | null>(null)
  const [manualValue, setManualValue] = useState<number>(1)

  const resolvedClassData = getClassById(classChoice.classId)
  const hitDie            = resolvedClassData?.hitDie ?? 8
  const skillPointsGained = resolvedClassData
    ? Math.max(1, resolvedClassData.skillPointsPerLevel + intMod)
    : null

  const handleRoll = () => {
    const result = Math.floor(Math.random() * hitDie) + 1
    setRolledValue(result)
  }

  const activeRoll = hpMode === 'roll' ? rolledValue : manualValue
  const hpGained = activeRoll !== null ? Math.max(1, activeRoll + conMod) : null

  const canConfirm = hpGained !== null

  const handleConfirm = () => {
    if (hpGained === null) return
    let newClassLevels: CharacterClass[]
    if (classChoice.type === 'existing') {
      newClassLevels = character.classes.map((c) =>
        c.id === classChoice.classId ? { ...c, level: c.level + 1 } : c
      )
    } else {
      newClassLevels = [...character.classes, { id: classChoice.classId, level: 1 }]
    }
    onConfirm({ newLevel, newClassLevels, hpGained, hpRolled: hpMode === 'roll' ? rolledValue : null })
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

        {/* Class Choice Section */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Clase a subir</p>
          <div className={styles.classChoiceList}>
            {character.classes.map((cc) => {
              const cd = getClassById(cc.id)
              const isSelected = classChoice.type === 'existing' && classChoice.classId === cc.id
              return (
                <button
                  key={cc.id}
                  className={`${styles.modeBtn} ${isSelected ? styles.modeBtnActive : ''}`}
                  onClick={() => { setClassChoice({ type: 'existing', classId: cc.id }); setRolledValue(null) }}
                >
                  {cd?.name ?? cc.id}
                  <span className={styles.mono}> Nv {cc.level}</span>
                </button>
              )
            })}
            {!showNewClassPicker && (
              <button
                className={styles.modeBtn}
                onClick={() => setShowNewClassPicker(true)}
              >
                + Nueva clase
              </button>
            )}
          </div>
          {showNewClassPicker && (
            <select
              className={styles.newClassSelect}
              value={classChoice.type === 'new' ? classChoice.classId : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setClassChoice({ type: 'new', classId: e.target.value })
                  setRolledValue(null)
                }
              }}
            >
              <option value="">Elige clase…</option>
              {CLASSES
                .filter((cd) => !character.classes.some((c) => c.id === cd.id))
                .map((cd) => (
                  <option key={cd.id} value={cd.id}>{cd.name}</option>
                ))}
            </select>
          )}
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
            {skillPointsGained !== null && (
              <li className={styles.infoItem}>
                Puntos de habilidad: <strong>+{skillPointsGained} puntos disponibles</strong>
              </li>
            )}
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
