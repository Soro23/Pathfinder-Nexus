import { Heart, Shield } from 'lucide-react'
import { calculateModifier } from '../../store'
import { getClassById, getSaveForLevel, getBABForLevel } from '../../data'
import { SKILLS } from '../../data/skills'
import type { Character } from '../../store'
import styles from './PartyCard.module.css'

const KEY_SKILL_IDS = ['perception', 'stealth']

interface PartyCardProps {
  character: Character
}

export function PartyCard({ character }: PartyCardProps) {
  const { abilities } = character
  const primaryClass = character.classes[0]
  const classData = getClassById(primaryClass?.id || '')

  const strMod = calculateModifier(abilities.strength)
  const dexMod = calculateModifier(abilities.dexterity)
  const bab = getBABForLevel(character.level, classData?.baseAttackBonus || 'poor')

  const equippedBody   = (character.armor ?? []).find((a) => a.equipped && a.type !== 'shield')
  const equippedShield = (character.armor ?? []).find((a) => a.equipped && a.type === 'shield')
  const effectiveDex   = equippedBody ? Math.min(dexMod, equippedBody.maxDex ?? 99) : dexMod
  const ac = 10 + effectiveDex + (equippedBody?.acBonus ?? 0) + (equippedShield?.acBonus ?? 0)

  const fortitude = getSaveForLevel(character.level, classData?.fortitudeSave || 'poor') + calculateModifier(abilities.constitution)
  const reflex    = getSaveForLevel(character.level, classData?.reflexSave || 'poor') + dexMod
  const will      = getSaveForLevel(character.level, classData?.willSave || 'poor') + calculateModifier(abilities.wisdom)

  const hpPercent = Math.max(0, Math.min(100, (character.hp.current / character.hp.max) * 100))
  const hpClass = hpPercent > 50 ? styles.hpGood : hpPercent > 25 ? styles.hpWarn : styles.hpDanger

  const classStr = character.classes.map((c) => `${c.id} ${c.level}`).join('/')

  const classSkills = classData?.classSkills ?? []
  const keySkills = KEY_SKILL_IDS.map((skillId) => {
    const skill = SKILLS.find((s) => s.id === skillId)
    if (!skill) return null
    const rankEntry = character.skills.find((s) => s.id === skillId)
    const ranks = rankEntry?.ranks ?? 0
    const abilityMod = calculateModifier(abilities[skill.ability])
    const classBonus = ranks > 0 && classSkills.includes(skillId) ? 3 : 0
    return { name: skill.name, total: ranks + abilityMod + classBonus }
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
