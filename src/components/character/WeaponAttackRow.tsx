import { Button } from '../ui'
import styles from './WeaponAttackRow.module.css'

interface WeaponAttackRowProps {
  name: string
  critical?: string
  iterativeOffsets: number[]
  attackBase: number
  damageNotation: string
  onRollAttack: (attackValue: number, index: number) => void
  onRollDamage: () => void
}

export function WeaponAttackRow({
  name, critical, iterativeOffsets, attackBase, damageNotation, onRollAttack, onRollDamage,
}: WeaponAttackRowProps) {
  return (
    <div className={styles.weaponRow}>
      <div className={styles.weaponInfo}>
        <span className={styles.weaponName}>{name}</span>
        <span className={styles.weaponCrit}>×{critical || '20/×2'}</span>
      </div>
      <div className={styles.weaponBtns}>
        {iterativeOffsets.map((offset, i) => {
          const iterAtk = attackBase - offset
          return (
            <Button key={i} variant="secondary" size="sm" onClick={() => onRollAttack(iterAtk, i)}>
              {i === 0 ? 'Atacar' : `Atq.${i + 1}`} {iterAtk >= 0 ? `+${iterAtk}` : iterAtk}
            </Button>
          )
        })}
        <Button variant="danger" size="sm" onClick={onRollDamage}>
          Daño {damageNotation}
        </Button>
      </div>
    </div>
  )
}
