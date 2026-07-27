import { useState, useMemo } from 'react'
import { getClassById, getRaceById } from '../../data'
import type { Feat, FeatType } from '../../data'
import { resolveClassFeatures } from '../../data/resolveArchetype'
import type { Archetype } from '../../data/archetypes'
import type { CharacterClass, CharacterFeat } from '../../store'
import styles from './FeaturesTraitsPanel.module.css'

type CategoryFilter = 'all' | 'class' | 'species' | 'feats'

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'class', label: 'Rasgos de Clase' },
  { id: 'species', label: 'Rasgos Raciales' },
  { id: 'feats', label: 'Dotes' },
]

const FEAT_TYPE_LABELS: Record<FeatType, string> = {
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

interface FeaturesTraitsPanelProps {
  classes: CharacterClass[]
  race: string
  feats: CharacterFeat[]
  archetypesByClassId: Record<string, Archetype[]>
  allFeats: Feat[]
}

export function FeaturesTraitsPanel({ classes, race, feats, archetypesByClassId, allFeats }: FeaturesTraitsPanelProps) {
  const [filter, setFilter] = useState<CategoryFilter>('all')

  const classGroups = useMemo(() => {
    return classes
      .map((c) => {
        const classData = getClassById(c.id)
        if (!classData) return null
        const attainedFeatures = resolveClassFeatures(classData, archetypesByClassId[c.id] ?? [])
          .filter((f) => f.level <= c.level)
        return { className: classData.name, features: attainedFeatures }
      })
      .filter((group): group is { className: string; features: ReturnType<typeof resolveClassFeatures> } =>
        group !== null && group.features.length > 0
      )
  }, [classes, archetypesByClassId])

  const raceData = getRaceById(race?.toLowerCase())
  const speciesTraits = raceData?.traits ?? []

  const featEntries = feats
    .map((cf) => ({ cf, feat: allFeats.find((f) => f.id === cf.id) }))
    .filter((entry): entry is { cf: CharacterFeat; feat: Feat } => !!entry.feat)

  const showClass = filter === 'all' || filter === 'class'
  const showSpecies = filter === 'all' || filter === 'species'
  const showFeats = filter === 'all' || filter === 'feats'

  const isEmpty = classGroups.length === 0 && speciesTraits.length === 0 && featEntries.length === 0

  return (
    <div className={styles.container}>
      <div className={styles.filterTabs}>
        {CATEGORY_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`${styles.filterTab} ${filter === id ? styles.filterTabActive : ''}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {isEmpty && <p className={styles.empty}>Sin rasgos, características o dotes que mostrar todavía.</p>}

      {showClass && classGroups.length > 0 && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Rasgos de Clase</h4>
          {classGroups.map((group) => (
            <div key={group.className} className={styles.subgroup}>
              <h5 className={styles.subgroupTitle}>{group.className}</h5>
              <div className={styles.entryList}>
                {group.features.map((f, i) => (
                  <div key={`${f.name}-${f.level}-${i}`} className={styles.entry}>
                    <div className={styles.entryHeader}>
                      <span className={styles.entryName}>{f.name}</span>
                      <span className={styles.entryMeta}>Nv. {f.level}</span>
                    </div>
                    <p className={styles.entryDesc}>{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {showSpecies && speciesTraits.length > 0 && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Rasgos Raciales</h4>
          <div className={styles.entryList}>
            {speciesTraits.map((trait, i) => (
              <div key={`${trait.name}-${i}`} className={styles.entry}>
                <span className={styles.entryName}>{trait.name}</span>
                <p className={styles.entryDesc}>{trait.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {showFeats && featEntries.length > 0 && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Dotes</h4>
          <div className={styles.entryList}>
            {featEntries.map(({ cf, feat }, i) => (
              <div key={`${feat.id}-${i}`} className={styles.entry}>
                <div className={styles.entryHeader}>
                  <span className={styles.entryName}>
                    {feat.name}{cf.specification ? ` (${cf.specification})` : ''}
                  </span>
                  <span className={styles.entryMeta}>{feat.type.map((t) => FEAT_TYPE_LABELS[t]).join(', ')}</span>
                </div>
                <p className={styles.entryDesc}>{feat.benefit}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
