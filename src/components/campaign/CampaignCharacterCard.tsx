import { useState } from 'react'
import { Heart, Shield, Trash2, ChevronDown, ChevronUp, UserCheck, UserMinus } from 'lucide-react'
import type { CampaignCharacter } from '../../store'
import styles from './CampaignCharacterCard.module.css'

interface Props {
  char: CampaignCharacter
  onUpdate: (updates: Partial<CampaignCharacter>) => void
  onDelete: () => void
}

export function CampaignCharacterCard({ char, onUpdate, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)

  const hpPct = char.hpMax > 0 ? Math.max(0, Math.min(100, (char.hpCurrent / char.hpMax) * 100)) : 0
  const hpClass = hpPct > 50 ? styles.hpGood : hpPct > 25 ? styles.hpWarn : styles.hpDanger

  const sign = (n: number) => (n >= 0 ? `+${n}` : `${n}`)

  const adjustHp = (delta: number) => {
    onUpdate({ hpCurrent: Math.min(char.hpMax, Math.max(0, char.hpCurrent + delta)) })
  }

  const inParty = char.inParty !== false

  return (
    <div className={`${styles.card} ${!inParty ? styles.cardInactive : ''}`}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.avatar}>{char.name.charAt(0).toUpperCase()}</div>
        <div className={styles.identity}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{char.name}</span>
            <span className={styles.localBadge}>Local</span>
          </div>
          <span className={styles.meta}>{char.race} · {char.className} · Nv.{char.level}</span>
        </div>
        <div className={styles.acBadge}>
          <Shield size={12} />
          <span>{char.ac}</span>
        </div>
        <button
          className={`${styles.partyToggleBtn} ${inParty ? styles.partyToggleActive : styles.partyToggleInactive}`}
          onClick={() => onUpdate({ inParty: !inParty })}
          title={inParty ? 'Quitar de la party' : 'Añadir a la party'}
        >
          {inParty ? <UserCheck size={14} /> : <UserMinus size={14} />}
        </button>
        <button className={styles.expandBtn} onClick={() => setExpanded((v) => !v)}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <button className={styles.deleteBtn} onClick={onDelete}>
          <Trash2 size={13} />
        </button>
      </div>

      {/* HP */}
      <div className={styles.hpSection}>
        <div className={styles.hpRow}>
          <Heart size={14} className={hpClass} />
          <div className={styles.hpControls}>
            <button className={styles.hpBtn} onClick={() => adjustHp(-1)}>−</button>
            <span className={`${styles.hpValues} ${hpClass}`}>{char.hpCurrent}</span>
            <span className={styles.hpSep}>/</span>
            <span className={styles.hpMax}>{char.hpMax}</span>
            <button className={styles.hpBtn} onClick={() => adjustHp(+1)}>+</button>
          </div>
          <span className={styles.hpLabel}>PG</span>
        </div>
        <div className={styles.hpBar}>
          <div className={`${styles.hpFill} ${hpClass}`} style={{ width: `${hpPct}%` }} />
        </div>
      </div>

      {/* Combat stats */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statVal}>{sign(char.bab)}</span>
          <span className={styles.statLbl}>BAB</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{char.ac}</span>
          <span className={styles.statLbl}>CA</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{sign(char.stealth)}</span>
          <span className={styles.statLbl}>Sigilo</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{sign(char.perception)}</span>
          <span className={styles.statLbl}>Percep.</span>
        </div>
      </div>

      {/* Expanded: editable fields + notes */}
      {expanded && (
        <div className={styles.expanded}>
          <div className={styles.editGrid}>
            {([
              { label: 'BAB', field: 'bab' as const, val: char.bab },
              { label: 'CA', field: 'ac' as const, val: char.ac },
              { label: 'PG máx', field: 'hpMax' as const, val: char.hpMax },
              { label: 'PG act.', field: 'hpCurrent' as const, val: char.hpCurrent },
              { label: 'Sigilo', field: 'stealth' as const, val: char.stealth },
              { label: 'Percepción', field: 'perception' as const, val: char.perception },
            ]).map(({ label, field, val }) => (
              <div key={field} className={styles.editField}>
                <label className={styles.editLabel}>{label}</label>
                <input
                  type="number"
                  className={styles.editInput}
                  value={val}
                  onChange={(e) => {
                    const num = Number(e.target.value)
                    if (field === 'hpMax') onUpdate({ hpMax: num, hpCurrent: Math.min(char.hpCurrent, num) })
                    else onUpdate({ [field]: num })
                  }}
                />
              </div>
            ))}
          </div>
          <div className={styles.notesField}>
            <label className={styles.editLabel}>Notas</label>
            <textarea
              className={styles.notesTextarea}
              rows={3}
              value={char.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Notas del personaje..."
            />
          </div>
        </div>
      )}
    </div>
  )
}
