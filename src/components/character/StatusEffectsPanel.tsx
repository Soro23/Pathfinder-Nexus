import { useState } from 'react'
import { Plus, Power, Pencil, Check, X } from 'lucide-react'
import type { StatusEffect, BonusTarget } from '../../store'
import type { Skill } from '../../data/skills'
import { Button } from '../ui'
import styles from './StatusEffectsPanel.module.css'

const BONUS_TARGET_LABELS: Record<string, string> = {
  attack: 'Ataque',
  damage: 'Daño',
  ac: 'CA',
  fort: 'Fortaleza',
  ref: 'Reflejos',
  will: 'Voluntad',
  initiative: 'Iniciativa',
  cmb: 'CMB',
  cmd: 'CMD',
}

interface StatusEffectsPanelProps {
  statusEffects: StatusEffect[]
  skills: Skill[]
  onAdd: (effect: StatusEffect) => void
  onUpdate: (id: string, updates: Partial<StatusEffect>) => void
  onRemove: (id: string) => void
}

interface TargetFormState {
  target: BonusTarget | 'skill' | ''
  skillId: string
  value: number
}

function TargetSelect({
  state, onChange, skills,
}: {
  state: TargetFormState
  onChange: (next: TargetFormState) => void
  skills: Skill[]
}) {
  return (
    <div className={styles.effectBonusRow}>
      <select
        className={styles.effectSelect}
        value={state.target}
        onChange={(e) => onChange({ ...state, target: e.target.value as BonusTarget | 'skill' | '', skillId: '' })}
      >
        <option value="">Sin bonificador</option>
        <option value="attack">Ataque</option>
        <option value="damage">Daño</option>
        <option value="ac">CA</option>
        <option value="fort">Fortaleza</option>
        <option value="ref">Reflejos</option>
        <option value="will">Voluntad</option>
        <option value="initiative">Iniciativa</option>
        <option value="cmb">CMB</option>
        <option value="cmd">CMD</option>
        <option value="skill">Habilidad específica…</option>
      </select>
      {state.target === 'skill' && (
        <select
          className={styles.effectSelect}
          value={state.skillId}
          onChange={(e) => onChange({ ...state, skillId: e.target.value })}
        >
          <option value="">Selecciona habilidad</option>
          {[...skills].sort((a, b) => a.name.localeCompare(b.name)).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}
      {state.target && (
        <input
          className={styles.effectValueInput}
          type="number"
          placeholder="+2"
          value={state.value === 0 ? '' : state.value}
          onChange={(e) => onChange({ ...state, value: parseInt(e.target.value) || 0 })}
        />
      )}
    </div>
  )
}

function resolveTarget(state: TargetFormState): BonusTarget | undefined {
  if (state.target === 'skill') {
    return state.skillId ? (`skill:${state.skillId}` as BonusTarget) : undefined
  }
  return state.target || undefined
}

export function StatusEffectsPanel({ statusEffects, skills, onAdd, onUpdate, onRemove }: StatusEffectsPanelProps) {
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newDuration, setNewDuration] = useState('')
  const [newTargetState, setNewTargetState] = useState<TargetFormState>({ target: '', skillId: '', value: 0 })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editTargetState, setEditTargetState] = useState<TargetFormState>({ target: '', skillId: '', value: 0 })

  const handleAdd = () => {
    if (!newName.trim()) return
    const resolvedTarget = resolveTarget(newTargetState)
    onAdd({
      id: Date.now().toString(),
      name: newName.trim(),
      description: newDesc.trim(),
      duration: newDuration.trim() || undefined,
      bonusTarget: resolvedTarget,
      bonusValue: resolvedTarget !== undefined ? newTargetState.value : undefined,
    })
    setNewName('')
    setNewDesc('')
    setNewDuration('')
    setNewTargetState({ target: '', skillId: '', value: 0 })
  }

  const startEdit = (eff: StatusEffect) => {
    setEditingId(eff.id)
    setEditName(eff.name)
    setEditDesc(eff.description ?? '')
    setEditDuration(eff.duration ?? '')
    if (eff.bonusTarget?.startsWith('skill:')) {
      setEditTargetState({ target: 'skill', skillId: eff.bonusTarget.replace('skill:', ''), value: eff.bonusValue ?? 0 })
    } else {
      setEditTargetState({ target: eff.bonusTarget ?? '', skillId: '', value: eff.bonusValue ?? 0 })
    }
  }

  const saveEdit = (id: string) => {
    const resolvedTarget = resolveTarget(editTargetState)
    const updates: Partial<StatusEffect> = {
      description: editDesc.trim(),
      duration: editDuration.trim() || undefined,
      bonusTarget: resolvedTarget,
      bonusValue: resolvedTarget !== undefined ? editTargetState.value : undefined,
    }
    if (editName.trim()) updates.name = editName.trim()
    onUpdate(id, updates)
    setEditingId(null)
  }

  return (
    <div>
      <div className={styles.effectForm}>
        <input
          className={styles.effectInput}
          placeholder="Nombre del efecto"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          className={styles.effectInput}
          placeholder="Descripción (opcional)"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
        />
        <input
          className={styles.effectInput}
          placeholder="Duración (ej: 3 rondas)"
          value={newDuration}
          onChange={(e) => setNewDuration(e.target.value)}
        />
        <TargetSelect state={newTargetState} onChange={setNewTargetState} skills={skills} />
        <Button variant="primary" size="sm" onClick={handleAdd}>
          <Plus size={14} /> Añadir efecto
        </Button>
      </div>

      {statusEffects.length === 0 ? (
        <p className={styles.emptyState}>Sin efectos</p>
      ) : (
        <ul className={styles.effectsList}>
          {statusEffects.map((eff) => {
            const isActive = eff.active !== false
            const targetLabel = eff.bonusTarget
              ? eff.bonusTarget.startsWith('skill:')
                ? `Habilidad: ${skills.find((s) => s.id === eff.bonusTarget!.replace('skill:', ''))?.name ?? eff.bonusTarget.replace('skill:', '')}`
                : BONUS_TARGET_LABELS[eff.bonusTarget] ?? eff.bonusTarget
              : null
            const isEditing = editingId === eff.id

            return (
              <li key={eff.id} className={`${styles.effectItem} ${!isActive ? styles.effectItemDisabled : ''}`}>
                {isEditing ? (
                  <div className={styles.effectEditForm}>
                    <input className={styles.effectInput} value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nombre" />
                    <input className={styles.effectInput} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Descripción" />
                    <input className={styles.effectInput} value={editDuration} onChange={(e) => setEditDuration(e.target.value)} placeholder="Duración" />
                    <TargetSelect state={editTargetState} onChange={setEditTargetState} skills={skills} />
                    <div className={styles.effectEditActions}>
                      <button className={styles.effectSaveBtn} onClick={() => saveEdit(eff.id)} title="Guardar"><Check size={14} /> Guardar</button>
                      <button className={styles.effectRemoveBtn} onClick={() => setEditingId(null)} title="Cancelar"><X size={14} /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.effectItemHeader}>
                      <button
                        className={`${styles.effectToggleBtn} ${isActive ? styles.effectToggleOn : styles.effectToggleOff}`}
                        onClick={() => onUpdate(eff.id, { active: !isActive })}
                        title={isActive ? 'Desactivar' : 'Activar'}
                      >
                        <Power size={13} />
                      </button>
                      <span className={styles.effectName}>{eff.name}</span>
                      <div className={styles.effectItemActions}>
                        <button className={styles.effectEditBtn} onClick={() => startEdit(eff)} title="Editar"><Pencil size={13} /></button>
                        <button className={styles.effectRemoveBtn} onClick={() => onRemove(eff.id)} title="Eliminar"><X size={14} /></button>
                      </div>
                    </div>
                    {targetLabel && eff.bonusValue !== undefined && (
                      <div className={`${styles.effectBonus} ${eff.bonusValue >= 0 ? styles.effectBonusPos : styles.effectBonusNeg}`}>
                        {eff.bonusValue >= 0 ? `+${eff.bonusValue}` : eff.bonusValue} a {targetLabel}
                      </div>
                    )}
                    {eff.duration && <div className={styles.effectDuration}>Duración: {eff.duration}</div>}
                    {eff.description && <div className={styles.effectDesc}>{eff.description}</div>}
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
