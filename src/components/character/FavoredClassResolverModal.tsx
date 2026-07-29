import { useState } from 'react'
import { X } from 'lucide-react'
import type { LevelChoice, FavoredClassChoice } from '../../store'
import { getClassById } from '../../data'
import { useSRDStore } from '../../store/srdStore'
import { FAVORED_CLASS_LABELS } from '../../engine'
import { Button, Select } from '../ui'
import styles from './FavoredClassResolverModal.module.css'

interface FavoredClassResolverModalProps {
  levelChoice: LevelChoice
  onConfirm: (result: { choice: FavoredClassChoice; skillId?: string }) => void
  onClose: () => void
}

export function FavoredClassResolverModal({ levelChoice, onConfirm, onClose }: FavoredClassResolverModalProps) {
  const { skills } = useSRDStore()
  const [choice, setChoice] = useState<FavoredClassChoice | null>(null)
  const [skillId, setSkillId] = useState('')

  const classData = getClassById(levelChoice.classId)
  const canConfirm = choice === 'hp' || choice === 'racial' || (choice === 'skill' && skillId !== '')

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Clase predilecta — nivel {levelChoice.characterLevel}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <p className={styles.hint}>
          Elige el beneficio de clase predilecta que ganaste en {classData?.name ?? levelChoice.classId} al subir a este nivel.
        </p>

        <div className={styles.modeToggle}>
          {(['hp', 'skill', 'racial'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              className={`${styles.modeBtn} ${choice === opt ? styles.modeBtnActive : ''}`}
              onClick={() => setChoice(opt)}
            >
              {FAVORED_CLASS_LABELS[opt]}
            </button>
          ))}
        </div>

        {choice === 'skill' && (
          <Select
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
            options={[
              { value: '', label: 'Elige una habilidad…' },
              ...skills.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        )}

        {choice === 'racial' && (
          <p className={styles.hint}>
            Sin catálogo de opciones raciales alternativas todavía: anota el efecto elegido en las notas del personaje.
          </p>
        )}

        <div className={styles.modalFooter}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            variant="primary"
            disabled={!canConfirm}
            onClick={() => choice && onConfirm({ choice, skillId: choice === 'skill' ? skillId : undefined })}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  )
}
