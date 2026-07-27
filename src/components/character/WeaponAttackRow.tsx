import styles from './WeaponAttackRow.module.css'

interface WeaponAttackRowProps {
  name: string
  critical?: string
  range: string
  iterativeOffsets: number[]
  attackBase: number
  damageNotation: string
  onRollAttack: (attackValue: number, index: number) => void
  onRollDamage: () => void
}

export function WeaponAttackRow({
  name, critical, range, iterativeOffsets, attackBase, damageNotation, onRollAttack, onRollDamage,
}: WeaponAttackRowProps) {
  return (
    <div className={styles.weaponRow}>
      <div className={styles.weaponInfo}>
        <span className={styles.weaponName}>{name}</span>
        <span className={styles.weaponCrit}>×{critical || '20/×2'}</span>
      </div>
      <span className={styles.weaponRange}>{range}</span>
      <div className={styles.hitCell}>
        {iterativeOffsets.map((offset, i) => {
          const iterAtk = attackBase - offset
          return (
            <button key={i} className={styles.hitBtn} onClick={() => onRollAttack(iterAtk, i)}>
              {iterAtk >= 0 ? `+${iterAtk}` : iterAtk}
            </button>
          )
        })}
      </div>
      <button className={styles.damageBtn} onClick={onRollDamage}>
        {damageNotation}
      </button>
    </div>
  )
}
