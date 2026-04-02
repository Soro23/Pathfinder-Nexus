import { useState } from 'react'
import { BLESSINGS, getBlessingById } from '../../data/blessings'
import type { BlessingData } from '../../data/blessings'
import styles from './BlessingPicker.module.css'

interface BlessingPickerProps {
  selected: string[]
  onChange: (ids: string[]) => void
  characterLevel?: number
  disabled?: boolean
}

export function BlessingPicker({ selected, onChange, characterLevel = 1, disabled = false }: BlessingPickerProps) {
  const [search, setSearch] = useState('')

  const filtered = BLESSINGS.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.description.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id))
    } else if (selected.length < 2) {
      onChange([...selected, id])
    }
  }

  if (disabled) {
    if (selected.length === 0) {
      return <p className={styles.emptyHint}>No se han seleccionado bendiciones. Activa el modo edición para elegir.</p>
    }
    return (
      <div className={styles.readonlyList}>
        {selected.map(id => {
          const b = getBlessingById(id)
          if (!b) return null
          return <BlessingCard key={id} blessing={b} characterLevel={characterLevel} readOnly />
        })}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.counter}>Bendiciones: {selected.length}/2</span>
        <input
          className={styles.search}
          placeholder="Buscar bendición…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {selected.length > 0 && (
        <div className={styles.selectedSection}>
          <span className={styles.sectionLabel}>Seleccionadas</span>
          {selected.map(id => {
            const b = getBlessingById(id)
            if (!b) return null
            return (
              <BlessingCard
                key={id}
                blessing={b}
                characterLevel={characterLevel}
                isSelected
                onToggle={() => toggle(id)}
              />
            )
          })}
        </div>
      )}

      <div className={styles.list}>
        {filtered
          .filter(b => !selected.includes(b.id))
          .map(b => (
            <BlessingCard
              key={b.id}
              blessing={b}
              characterLevel={characterLevel}
              isSelected={false}
              onToggle={selected.length < 2 ? () => toggle(b.id) : undefined}
            />
          ))}
      </div>
    </div>
  )
}

interface BlessingCardProps {
  blessing: BlessingData
  characterLevel: number
  isSelected?: boolean
  onToggle?: () => void
  readOnly?: boolean
}

function BlessingCard({ blessing, characterLevel, isSelected, onToggle, readOnly }: BlessingCardProps) {
  const [expanded, setExpanded] = useState(readOnly || isSelected || false)
  const minor = blessing.powers[0]
  const major = blessing.powers[1]
  const majorLocked = major && characterLevel < 10

  return (
    <div className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}>
      <div className={styles.cardHeader} onClick={() => setExpanded(e => !e)}>
        <div className={styles.cardTitle}>
          <span className={styles.blessingName}>{blessing.name}</span>
          <span className={styles.blessingDesc}>{blessing.description}</span>
        </div>
        <div className={styles.cardActions}>
          {!readOnly && (
            <button
              className={isSelected ? styles.removeBtn : styles.addBtn}
              onClick={e => { e.stopPropagation(); onToggle?.() }}
              disabled={!isSelected && !onToggle}
            >
              {isSelected ? '✕ Quitar' : '+ Añadir'}
            </button>
          )}
          <span className={styles.expandIcon}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.cardBody}>
          {/* Minor power */}
          <div className={styles.power}>
            <div className={styles.powerHeader}>
              <div className={styles.powerTitleRow}>
                <span className={styles.powerBadge}>Menor</span>
                <span className={styles.powerName}>{minor.name}</span>
              </div>
              <span className={styles.powerMeta}>
                {minor.actionType === 'swift' ? 'Acción veloz' : minor.actionType === 'standard' ? 'Acción estándar' : 'A voluntad'}
                {minor.costsFervor ? ' · cuesta Fervor' : ''}
              </span>
            </div>
            <p className={styles.powerDesc}>{minor.description}</p>
          </div>

          {/* Major power */}
          {major && (
            <div className={`${styles.power} ${majorLocked ? styles.powerLocked : ''}`}>
              <div className={styles.powerHeader}>
                <div className={styles.powerTitleRow}>
                  <span className={`${styles.powerBadge} ${styles.majorBadge}`}>Mayor</span>
                  <span className={styles.powerName}>{major.name}</span>
                </div>
                <span className={styles.powerMeta}>
                  {majorLocked
                    ? 'Requiere nivel 10'
                    : major.actionType === 'swift' ? 'Acción veloz' : major.actionType === 'standard' ? 'Acción estándar' : 'A voluntad'}
                  {!majorLocked && major.costsFervor ? ' · cuesta Fervor' : ''}
                </span>
              </div>
              <p className={styles.powerDesc}>{major.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
