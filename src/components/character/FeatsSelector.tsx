import { useState } from 'react'
import { Card, Select } from '../ui'
import { FEAT_TYPES, useSRDStore, type FeatType } from '../../data'
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
  selectedFeats: string[]
  onToggle: (featId: string) => void
  maxFeats?: number
}

export function FeatsSelector({ selectedFeats, onToggle, maxFeats }: FeatsSelectorProps) {
  const { feats: FEATS } = useSRDStore()
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filteredFeats = FEATS.filter((feat) => {
    const matchesType = filter === 'all' || feat.type.includes(filter as FeatType)
    const matchesSearch = feat.name.toLowerCase().includes(search.toLowerCase())
    return matchesType && matchesSearch
  })

  const canAddMore = !maxFeats || selectedFeats.length < maxFeats

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.stats}>
          <span>Feats: {selectedFeats.length}{maxFeats ? `/${maxFeats}` : ''}</span>
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
              ...FEAT_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))
            ]}
          />
        </div>
      </div>

      <div className={styles.list}>
        {filteredFeats.map((feat) => {
          const isSelected = selectedFeats.includes(feat.id)
          return (
            <Card
              key={feat.id}
              padding="sm"
              hoverable={!isSelected && canAddMore}
              className={`${styles.featCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => {
                if (!isSelected && canAddMore) {
                  onToggle(feat.id)
                } else if (isSelected) {
                  onToggle(feat.id)
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
              {isSelected && (
                <div className={styles.selectedBadge}>
                  <span>Seleccionado</span>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
