import { getBABForLevel, getSaveForLevel } from '../../data'
import type { ClassData } from '../../data'
import type { Archetype } from '../../data/archetypes'
import { resolveClassFeatures } from '../../data/resolveArchetype'
import type { ResolvedFeature } from '../../data/resolveArchetype'
import styles from './ClassProgressionTable.module.css'

interface ClassProgressionTableProps {
  classData: ClassData
  currentLevel: number
  archetype?: Archetype
}

const STATUS_LABEL: Record<ResolvedFeature['status'], string | null> = {
  base: null,
  replaced: 'Reemplazada',
  changed: 'Modificada',
  optional: 'Opcional',
  archetype: 'Arquetipo',
}

const STATUS_CLASS: Record<ResolvedFeature['status'], string | null> = {
  base: null,
  replaced: 'featureBadgeReplaced',
  changed: 'featureBadgeChanged',
  optional: 'featureBadgeOptional',
  archetype: 'featureBadgeArchetype',
}

export function ClassProgressionTable({ classData, currentLevel, archetype }: ClassProgressionTableProps) {
  const isCaster = classData.magicType !== null

  const spellTable = archetype?.spellsPerDayOverride ?? classData.spellsPerDay

  const spellCols = spellTable
    ? Math.max(...spellTable.map((row) => row.length))
    : 0

  const allFeatures = resolveClassFeatures(classData, archetype ?? null)

  return (
    <div className={styles.wrapper}>
      {archetype && (
        <div className={styles.archetypeBanner}>
          Arquetipo activo: <strong>{archetype.name}</strong>
        </div>
      )}
      <div className={styles.scrollArea}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thNv}>Nv</th>
              <th>BAB</th>
              <th>Fort</th>
              <th>Ref</th>
              <th>Vol</th>
              <th>Hab/Nv</th>
              {isCaster && Array.from({ length: spellCols }, (_, i) => (
                <th key={i} className={styles.thSpell}>
                  {i === 0 ? 'C' : i}
                </th>
              ))}
              <th className={styles.thFeatures}>Características</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 20 }, (_, idx) => {
              const lvl = idx + 1
              const bab = getBABForLevel(lvl, classData.baseAttackBonus)
              const fort = getSaveForLevel(lvl, classData.fortitudeSave)
              const ref = getSaveForLevel(lvl, classData.reflexSave)
              const will = getSaveForLevel(lvl, classData.willSave)
              const featuresAtLevel = allFeatures.filter((f) => f.level === lvl)
              const spellRow = spellTable?.[idx]
              const isCurrent = lvl === currentLevel

              return (
                <tr key={lvl} className={`${styles.row} ${isCurrent ? styles.currentLevel : ''}`}>
                  <td className={styles.tdNv}>{lvl}</td>
                  <td className={styles.tdNum}>+{bab}</td>
                  <td className={styles.tdNum}>{fort >= 0 ? '+' : ''}{fort}</td>
                  <td className={styles.tdNum}>{ref >= 0 ? '+' : ''}{ref}</td>
                  <td className={styles.tdNum}>{will >= 0 ? '+' : ''}{will}</td>
                  <td className={styles.tdNum}>{classData.skillPointsPerLevel}</td>
                  {isCaster && Array.from({ length: spellCols }, (_, si) => (
                    <td key={si} className={styles.tdSpell}>
                      {spellRow?.[si] !== undefined ? spellRow[si] : '—'}
                    </td>
                  ))}
                  <td className={styles.tdFeatures}>
                    {featuresAtLevel.length > 0 ? (
                      <span className={styles.featureList}>
                        {featuresAtLevel.map((f, i) => {
                          const badgeClass = STATUS_CLASS[f.status]
                          const badgeLabel = STATUS_LABEL[f.status]
                          const isReplaced = f.status === 'replaced'
                          const isArchetype = f.status === 'archetype'
                          return (
                            <span
                              key={i}
                              className={`${styles.featureItem} ${isReplaced ? styles.featureReplaced : ''} ${isArchetype ? styles.featureArchetype : ''}`}
                              title={f.description}
                            >
                              {f.name}
                              {badgeClass && badgeLabel && (
                                <span className={`${styles.featureBadge} ${styles[badgeClass]}`}>
                                  {badgeLabel}
                                </span>
                              )}
                            </span>
                          )
                        })}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
