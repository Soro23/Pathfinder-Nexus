import { Heart, Shield } from 'lucide-react'
import { useSRDStore } from '../../data'
import { resolveModifiers, computeCombatStats, computeSkillTotal, getEncumbranceLevel, getEncumbranceSkillPenalty } from '../../engine'
import { buildArchetypesByClassId } from '../../data/resolveArchetype'
import type { Character } from '../../store'
import styles from './PartyCard.module.css'

const KEY_SKILL_IDS = ['perception', 'stealth']

interface PartyCardProps {
  character: Character
}

export function PartyCard({ character }: PartyCardProps) {
  const { skills: SKILLS, getArchetypeById } = useSRDStore()

  const resolvedStats = resolveModifiers(character)
  const archetypesByClassId = buildArchetypesByClassId(character.classes, getArchetypeById)
  const totalWeight = (character.inventory ?? []).reduce((sum, item) => sum + item.weight * item.quantity, 0)
  const combat = computeCombatStats(character, resolvedStats, totalWeight)
  const { bab, strMod, dexMod, ac, fortitude, reflex, will } = combat

  const hpPercent = Math.max(0, Math.min(100, (character.hp.current / character.hp.max) * 100))
  const hpClass = hpPercent > 50 ? styles.hpGood : hpPercent > 25 ? styles.hpWarn : styles.hpDanger

  const classStr = character.classes.map((c) => `${c.id} ${c.level}`).join('/')

  const equippedArmorAcp = (character.armor ?? [])
    .filter((a) => a.equipped && a.type !== 'shield')
    .reduce((sum, a) => sum + (a.armorCheckPenalty ?? 0), 0)
  const encumbrancePenalty = getEncumbranceSkillPenalty(getEncumbranceLevel(totalWeight, character.abilities.strength))

  const keySkills = KEY_SKILL_IDS.map((skillId) => {
    const skill = SKILLS.find((s) => s.id === skillId)
    if (!skill) return null
    return { name: skill.name, total: computeSkillTotal({ ...character, archetypesByClassId }, skill, resolvedStats, equippedArmorAcp, encumbrancePenalty) }
  }).filter(Boolean) as { name: string; total: number }[]

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.avatar}>{character.name.charAt(0).toUpperCase()}</div>
        <div className={styles.identity}>
          <span className={styles.name}>{character.name}</span>
          <span className={styles.meta}>{character.race} · {classStr} · Nv.{character.level}</span>
        </div>
        <div className={styles.acBadge}>
          <Shield size={12} />
          <span>{ac}</span>
        </div>
      </div>

      {/* HP */}
      <div className={styles.hpSection}>
        <div className={styles.hpRow}>
          <Heart size={14} className={hpClass} />
          <span className={`${styles.hpValues} ${hpClass}`}>
            {character.hp.current} / {character.hp.max}
          </span>
          <span className={styles.hpLabel}>PG</span>
        </div>
        <div className={styles.hpBar}>
          <div className={`${styles.hpFill} ${hpClass}`} style={{ width: `${hpPercent}%` }} />
        </div>
      </div>

      {/* Combat stats */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statVal}>+{bab}</span>
          <span className={styles.statLbl}>BAB</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{strMod >= 0 ? '+' : ''}{strMod}</span>
          <span className={styles.statLbl}>FUE</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{dexMod >= 0 ? '+' : ''}{dexMod}</span>
          <span className={styles.statLbl}>DES</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{fortitude >= 0 ? '+' : ''}{fortitude}</span>
          <span className={styles.statLbl}>FOR</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{reflex >= 0 ? '+' : ''}{reflex}</span>
          <span className={styles.statLbl}>REF</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statVal}>{will >= 0 ? '+' : ''}{will}</span>
          <span className={styles.statLbl}>VOL</span>
        </div>
      </div>

      {/* Key skills */}
      <div className={styles.skillsRow}>
        {keySkills.map((s) => (
          <div key={s.name} className={styles.skillPill}>
            <span className={styles.skillName}>{s.name}</span>
            <span className={styles.skillVal}>{s.total >= 0 ? '+' : ''}{s.total}</span>
          </div>
        ))}
      </div>

      {/* Status effects */}
      {(character.statusEffects ?? []).length > 0 && (
        <div className={styles.effects}>
          {(character.statusEffects ?? []).map((e) => (
            <span key={e.id} className={styles.effectChip}>{e.name}</span>
          ))}
        </div>
      )}
    </div>
  )
}
