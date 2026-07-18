import { useSRDStore } from '../../store/srdStore'
import type { Archetype, ReplacementType } from '../../data/archetypes'
import { findArchetypeConflicts } from '../../data/resolveArchetype'
import styles from './ArchetypeSelector.module.css'

interface Props {
  classId: string
  value: string[]
  onChange: (ids: string[]) => void
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

function ArchetypeDetail({ archetype }: { archetype: Archetype }) {
  return (
    <div className={styles.detail}>
      <p className={styles.desc}>{archetype.description}</p>
      {archetype.replaces.length > 0 && (
        <ul className={styles.replaceList}>
          {archetype.replaces.map((r, i) => (
            <li key={i} className={styles.replaceItem}>
              <ReplacementBadge type={r.type} />
              <span className={styles.featureName}>{r.featureName}</span>
              <span className={styles.atLevel}>nv {r.atLevel}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ArchetypeSelector({ classId, value, onChange }: Props) {
  const getArchetypesByClass = useSRDStore((s) => s.getArchetypesByClass)
  const options = getArchetypesByClass(classId)

  if (options.length === 0) return null

  const selected = options.filter((a) => value.includes(a.id))
  const conflicts = findArchetypeConflicts(selected)

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  return (
    <div className={styles.root}>
      <label className={styles.label}>Arquetipos</label>
      <div className={styles.checkList}>
        {options.map((a) => (
          <label key={a.id} className={styles.checkItem}>
            <input
              type="checkbox"
              checked={value.includes(a.id)}
              onChange={() => toggle(a.id)}
            />
            {a.name}
          </label>
        ))}
      </div>

      {conflicts.length > 0 && (
        <div className={styles.conflictWarning}>
          <strong>Conflicto:</strong> más de un arquetipo seleccionado modifica la misma característica.
          <ul className={styles.conflictList}>
            {conflicts.map((c, i) => (
              <li key={i}>
                {c.featureName} (nv {c.atLevel}): {c.archetypeNames.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selected.map((a) => (
        <ArchetypeDetail key={a.id} archetype={a} />
      ))}
    </div>
  )
}
