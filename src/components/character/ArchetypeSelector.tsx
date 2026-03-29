import { useSRDStore } from '../../store/srdStore'
import type { Archetype, ReplacementType } from '../../data/archetypes'
import styles from './ArchetypeSelector.module.css'

interface Props {
  classId: string
  value: string | undefined
  onChange: (id: string | undefined) => void
}

const TYPE_LABEL: Record<ReplacementType, string> = {
  replaces: 'Reemplaza',
  changes: 'Modifica',
  optional: 'Opcional',
}

const TYPE_CLASS: Record<ReplacementType, string> = {
  replaces: 'badgeReplaces',
  changes: 'badgeChanges',
  optional: 'badgeOptional',
}

function ReplacementBadge({ type }: { type: ReplacementType }) {
  return (
    <span className={`${styles.badge} ${styles[TYPE_CLASS[type]]}`}>
      {TYPE_LABEL[type]}
    </span>
  )
}

export function ArchetypeSelector({ classId, value, onChange }: Props) {
  const getArchetypesByClass = useSRDStore((s) => s.getArchetypesByClass)
  const options = getArchetypesByClass(classId)

  if (options.length === 0) return null

  const selected: Archetype | undefined = options.find((a) => a.id === value)

  return (
    <div className={styles.root}>
      <label className={styles.label}>Arquetipo</label>
      <select
        className={styles.select}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
      >
        <option value="">Sin arquetipo</option>
        {options.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>

      {selected && (
        <div className={styles.detail}>
          <p className={styles.desc}>{selected.description}</p>
          {selected.replaces.length > 0 && (
            <ul className={styles.replaceList}>
              {selected.replaces.map((r, i) => (
                <li key={i} className={styles.replaceItem}>
                  <ReplacementBadge type={r.type} />
                  <span className={styles.featureName}>{r.featureName}</span>
                  <span className={styles.atLevel}>nv {r.atLevel}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
