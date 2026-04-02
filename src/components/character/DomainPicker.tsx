import { useState } from 'react'
import { DOMAINS, getDomainById } from '../../data/domains'
import type { DomainData } from '../../data/domains'
import styles from './DomainPicker.module.css'

interface DomainPickerProps {
  selected: string[]
  onChange: (ids: string[]) => void
  characterLevel?: number
  wisdomMod?: number
  disabled?: boolean
}

export function DomainPicker({ selected, onChange, characterLevel = 1, wisdomMod = 0, disabled = false }: DomainPickerProps) {
  const [search, setSearch] = useState('')

  const filtered = DOMAINS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id))
    } else if (selected.length < 2) {
      onChange([...selected, id])
    }
  }

  const p1UsesPerDay = Math.max(1, 3 + wisdomMod)

  if (disabled) {
    if (selected.length === 0) {
      return <p className={styles.emptyHint}>No se han seleccionado dominios. Activa el modo edición para elegir.</p>
    }
    return (
      <div className={styles.readonlyList}>
        {selected.map(id => {
          const d = getDomainById(id)
          if (!d) return null
          return <DomainCard key={id} domain={d} characterLevel={characterLevel} p1UsesPerDay={p1UsesPerDay} readOnly />
        })}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.counter}>Dominios: {selected.length}/2</span>
        <input
          className={styles.search}
          placeholder="Buscar dominio…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Selected domains shown first */}
      {selected.length > 0 && (
        <div className={styles.selectedSection}>
          <span className={styles.sectionLabel}>Seleccionados</span>
          {selected.map(id => {
            const d = getDomainById(id)
            if (!d) return null
            return (
              <DomainCard
                key={id}
                domain={d}
                characterLevel={characterLevel}
                p1UsesPerDay={p1UsesPerDay}
                isSelected
                onToggle={() => toggle(id)}
              />
            )
          })}
        </div>
      )}

      {/* Available list */}
      <div className={styles.list}>
        {filtered
          .filter(d => !selected.includes(d.id))
          .map(d => (
            <DomainCard
              key={d.id}
              domain={d}
              characterLevel={characterLevel}
              p1UsesPerDay={p1UsesPerDay}
              isSelected={false}
              onToggle={selected.length < 2 ? () => toggle(d.id) : undefined}
            />
          ))}
      </div>
    </div>
  )
}

interface DomainCardProps {
  domain: DomainData
  characterLevel: number
  p1UsesPerDay: number
  isSelected?: boolean
  onToggle?: () => void
  readOnly?: boolean
}

function DomainCard({ domain, characterLevel, p1UsesPerDay, isSelected, onToggle, readOnly }: DomainCardProps) {
  const [expanded, setExpanded] = useState(readOnly || isSelected || false)
  const p2 = domain.powers[1]
  const p2Locked = p2 && characterLevel < p2.unlocksAtLevel

  return (
    <div className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}>
      <div className={styles.cardHeader} onClick={() => setExpanded(e => !e)}>
        <div className={styles.cardTitle}>
          <span className={styles.domainName}>{domain.name}</span>
          <span className={styles.domainDesc}>{domain.description}</span>
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
          {/* Power 1 */}
          <div className={styles.power}>
            <div className={styles.powerHeader}>
              <span className={styles.powerName}>{domain.powers[0].name}</span>
              <span className={styles.powerMeta}>
                {domain.powers[0].usesFormula === 'unlimited'
                  ? 'A voluntad'
                  : domain.powers[0].usesFormula === 'fixed'
                  ? `${domain.powers[0].fixedUses ?? 1}/día`
                  : `${p1UsesPerDay}/día (3 + mod SAB)`}
              </span>
            </div>
            <p className={styles.powerDesc}>{domain.powers[0].description}</p>
          </div>

          {/* Power 2 */}
          {p2 && (
            <div className={`${styles.power} ${p2Locked ? styles.powerLocked : ''}`}>
              <div className={styles.powerHeader}>
                <span className={styles.powerName}>{p2.name}</span>
                <span className={styles.powerMeta}>
                  {p2Locked
                    ? `Nivel ${p2.unlocksAtLevel} requerido`
                    : p2.usesFormula === 'unlimited'
                    ? 'A voluntad'
                    : p2.usesFormula === 'fixed'
                    ? `${p2.fixedUses ?? 1}/día`
                    : `${p1UsesPerDay}/día`}
                </span>
              </div>
              <p className={styles.powerDesc}>{p2.description}</p>
            </div>
          )}

          {/* Spell list */}
          <div className={styles.spellList}>
            <span className={styles.spellListTitle}>Hechizos de Dominio</span>
            <div className={styles.spellGrid}>
              {domain.spells.map(s => (
                <div key={s.level} className={styles.spellRow}>
                  <span className={styles.spellLevel}>{s.level}º</span>
                  <span className={styles.spellName}>{s.spellName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
