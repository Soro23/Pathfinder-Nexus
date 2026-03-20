import { getBABForLevel, getSaveForLevel } from '../../data'
import type { ClassData } from '../../data'
import styles from './ClassProgressionTable.module.css'

interface ClassProgressionTableProps {
  classData: ClassData
  currentLevel: number
}

export function ClassProgressionTable({ classData, currentLevel }: ClassProgressionTableProps) {
  const isCaster = classData.magicType !== null

  // Determine how many spell columns we need
  const spellCols = classData.spellsPerDay
    ? Math.max(...classData.spellsPerDay.map((row) => row.length))
    : 0

  return (
    <div className={styles.wrapper}>
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
              const featuresAtLevel = classData.features.filter((f) => f.level === lvl)
              const spellRow = classData.spellsPerDay?.[idx]
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
                    {featuresAtLevel.length > 0
                      ? featuresAtLevel.map((f) => f.name).join(', ')
                      : '—'}
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
