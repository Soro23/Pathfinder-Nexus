import { useState } from 'react'
import { Card, Select } from '../ui'
import { FEAT_TYPES, useSRDStore, type FeatType } from '../../data'
import { isFeatRepeatable } from '../../data/feats'
import type { CharacterFeat } from '../../store/characterStore'
import styles from './FeatsSelector.module.css'

const TYPE_LABELS: Record<FeatType, string> = {
  combat: 'Combate',
  general: 'General',
  metamagic: 'Metamagia',
  item_creation: 'Creación',
  teamwork: 'Cooperación',
  critical: 'Crítico',
  style: 'Estilo',
  race: 'Raza',
  story: 'Historia',
}

interface FeatsSelectorProps {
  selectedFeats: CharacterFeat[]
  onAdd: (featId: string, specification?: string) => void
  onRemove: (index: number) => void
  maxFeats?: number
}

export function FeatsSelector({ selectedFeats, onAdd, onRemove, maxFeats }: FeatsSelectorProps) {
  const { feats: FEATS } = useSRDStore()
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  // featId → pending specification text for repeatable feats
  const [pendingSpec, setPendingSpec] = useState<Record<string, string>>({})

  const filteredFeats = FEATS.filter((feat) => {
    const matchesType = filter === 'all' || feat.type.includes(filter as FeatType)
    const matchesSearch = feat.name.toLowerCase().includes(search.toLowerCase()) || feat.id.toLowerCase().includes(search.toLowerCase())
    return matchesType && matchesSearch
  })

  const canAddMore = maxFeats === undefined || selectedFeats.length < maxFeats
  const availableFeats = maxFeats ? maxFeats - selectedFeats.length : null

  const instancesOf = (featId: string) =>
    selectedFeats.reduce<number[]>((acc, f, i) => { if (f.id === featId) acc.push(i); return acc }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.stats}>
          <span>Dotes: {selectedFeats.length}{maxFeats ? `/${maxFeats}` : ''}{availableFeats !== null ? ` (${availableFeats} disponibles)` : ''}</span>
        </div>
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Buscar feat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Todas' },
              ...FEAT_TYPES.map((t: FeatType) => ({ value: t, label: TYPE_LABELS[t] }))
            ]}
          />
        </div>
      </div>

      <div className={styles.list}>
        {filteredFeats.map((feat) => {
          const repeatable = isFeatRepeatable(feat)
          const indices = instancesOf(feat.id)
          const isSelected = indices.length > 0

          return (
            <Card
              key={feat.id}
              padding="sm"
              hoverable={!isSelected && canAddMore}
              className={`${styles.featCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => {
                if (repeatable) return  // clicks handled by buttons for repeatable
                if (!isSelected && canAddMore) {
                  onAdd(feat.id)
                } else if (isSelected) {
                  onRemove(indices[0])
                }
              }}
            >
              <div className={styles.featHeader}>
                <h4>{feat.name}</h4>
                <span className={styles.type}>{feat.type.map(t => TYPE_LABELS[t]).join(', ')}</span>
              </div>
              {feat.prerequisite && (
                <p className={styles.prereq}>Prerrequisito: {feat.prerequisite}</p>
              )}
              <p className={styles.benefit}>{feat.benefit}</p>

              {/* Instances list for repeatable feats */}
              {isSelected && indices.map((idx) => (
                <div key={idx} className={styles.instanceRow}>
                  <span className={styles.instanceSpec}>
                    {selectedFeats[idx].specification || '—'}
                  </span>
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => { e.stopPropagation(); onRemove(idx) }}
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Non-repeatable selected badge */}
              {!repeatable && isSelected && (
                <div className={styles.selectedBadge}>
                  <span>Seleccionado</span>
                </div>
              )}

              {/* Add controls for repeatable feats */}
              {repeatable && canAddMore && (
                <div className={styles.repeatableAdd} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    className={styles.specInput}
                    placeholder="Especificación (ej: Espada larga)"
                    value={pendingSpec[feat.id] ?? ''}
                    onChange={(e) => setPendingSpec(prev => ({ ...prev, [feat.id]: e.target.value }))}
                  />
                  <button
                    className={styles.addBtn}
                    disabled={!pendingSpec[feat.id]?.trim()}
                    onClick={() => {
                      onAdd(feat.id, pendingSpec[feat.id]?.trim())
                      setPendingSpec(prev => ({ ...prev, [feat.id]: '' }))
                    }}
                  >
                    + Añadir
                  </button>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
