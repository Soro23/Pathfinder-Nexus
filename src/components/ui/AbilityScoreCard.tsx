import styles from './AbilityScoreCard.module.css'

interface AbilityScoreCardProps {
  label: string
  score: number
  modifier: number
  editable?: boolean
  onScoreChange?: (value: number) => void
  className?: string
}

export function AbilityScoreCard({
  label,
  score,
  modifier,
  editable = false,
  onScoreChange,
  className,
}: AbilityScoreCardProps) {
  const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`
  const modifierClass = modifier > 0 ? styles.positive : modifier < 0 ? styles.negative : styles.neutral

  return (
    <div className={`${styles.card} ${className || ''}`}>
      <div className={styles.shield}>
        <span className={`${styles.modifier} ${modifierClass}`}>{modifierText}</span>
        {editable ? (
          <input
            type="number"
            className={styles.scoreInput}
            value={score}
            onChange={(e) => onScoreChange?.(Number(e.target.value))}
            aria-label={`Puntuación de ${label}`}
          />
        ) : (
          <span className={styles.score}>{score}</span>
        )}
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
