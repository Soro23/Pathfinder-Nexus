import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Lock, Unlock, Plus, Trash2 } from 'lucide-react'
import { Button } from '../ui'
import { calculateModifier, CharacterClass, useSRDStore } from '../../data'
import type { Archetype } from '../../data/archetypes'
import type { MiscBonus, SkillRank } from '../../store'
import { computeSkillTotal, isClassSkillForCharacter } from '../../engine'
import type { ResolvedStats } from '../../engine'
import styles from './SkillsList.module.css'

interface SkillsListProps {
  ranks: SkillRank[]
  onChange: (ranks: SkillRank[]) => void
  abilities: Record<string, number>
  classes: CharacterClass[]
  race: string
  level: number
  skillPointsAvailable: number
  equippedArmorAcp?: number
  resolvedStats: ResolvedStats
  archetypesByClassId?: Record<string, Archetype[]>
}

export function SkillsList({
  ranks,
  onChange,
  abilities,
  classes,
  race,
  level,
  skillPointsAvailable,
  equippedArmorAcp = 0,
  resolvedStats,
  archetypesByClassId,
}: SkillsListProps) {
  const { skills: SKILLS } = useSRDStore()
  const [showAll, setShowAll] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'total'>('name')
  const [openMiscPanel, setOpenMiscPanel] = useState<string | null>(null)
  const [newMiscValue, setNewMiscValue] = useState<number>(0)
  const [newMiscDesc, setNewMiscDesc] = useState('')

  // Contexto mínimo para las funciones de cálculo del engine — `ranks` (controlado, en
  // edición) hace de `skills` en vez de character.skills, que puede estar desactualizado.
  const calcContext = { abilities, classes, skills: ranks, race, archetypesByClassId }

  const skillPointsSpent = ranks.reduce((sum, r) => sum + r.ranks, 0)

  const getTotalForSkill = (skillId: string) => {
    const skill = SKILLS.find((s) => s.id === skillId)
    if (!skill) return 0
    return computeSkillTotal(calcContext, skill, resolvedStats, equippedArmorAcp)
  }

  const getRanksForSkill = (skillId: string) => {
    return ranks.find((r) => r.id === skillId)?.ranks || 0
  }

  const updateRank = (skillId: string, delta: number) => {
    const currentRank = getRanksForSkill(skillId)
    const maxRanks = level
    const newRank = Math.max(0, Math.min(maxRanks, currentRank + delta))
    const cost = newRank - currentRank

    if (skillPointsSpent + cost > skillPointsAvailable + skillPointsSpent) {
      return
    }

    if (newRank === 0) {
      const existing = ranks.find((r) => r.id === skillId)
      if (existing?.miscBonuses?.length) {
        onChange(ranks.map((r) => r.id === skillId ? { ...r, ranks: 0 } : r))
      } else {
        onChange(ranks.filter((r) => r.id !== skillId))
      }
    } else {
      const existing = ranks.find((r) => r.id === skillId)
      if (existing) {
        onChange(ranks.map((r) => (r.id === skillId ? { ...r, ranks: newRank } : r)))
      } else {
        onChange([...ranks, { id: skillId, ranks: newRank }])
      }
    }
  }

  const addMiscBonus = (skillId: string) => {
    if (!newMiscDesc.trim()) return
    const bonus: MiscBonus = { value: newMiscValue, description: newMiscDesc.trim() }
    const existing = ranks.find((r) => r.id === skillId)
    if (existing) {
      onChange(ranks.map((r) => r.id === skillId
        ? { ...r, miscBonuses: [...(r.miscBonuses ?? []), bonus] }
        : r
      ))
    } else {
      onChange([...ranks, { id: skillId, ranks: 0, miscBonuses: [bonus] }])
    }
    setNewMiscValue(0)
    setNewMiscDesc('')
  }

  const removeMiscBonus = (skillId: string, idx: number) => {
    onChange(ranks.map((r) => r.id === skillId
      ? { ...r, miscBonuses: (r.miscBonuses ?? []).filter((_, i) => i !== idx) }
      : r
    ))
  }

  const sortedSkills = useMemo(() => {
    const skillsWithRanks = SKILLS.map((skill) => ({
      ...skill,
      total: getTotalForSkill(skill.id),
      ranks: getRanksForSkill(skill.id),
      isClassSkill: isClassSkillForCharacter(calcContext, skill.id),
    }))

    return skillsWithRanks.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      return b.total - a.total
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ranks, abilities, classes, level, sortBy])

  const displaySkills = showAll ? sortedSkills : sortedSkills.filter((s) => s.ranks > 0 || s.isClassSkill)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.stats}>
          <span>Puntos gastados: {skillPointsSpent}</span>
          <span className={styles.separator}>|</span>
          <span>Disponibles: {skillPointsAvailable}</span>
        </div>
        <div className={styles.controls}>
          <button
            className={`${styles.sortBtn} ${sortBy === 'name' ? styles.active : ''}`}
            onClick={() => setSortBy('name')}
          >
            A-Z
          </button>
          <button
            className={`${styles.sortBtn} ${sortBy === 'total' ? styles.active : ''}`}
            onClick={() => setSortBy('total')}
          >
            Por Total
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showAll ? 'Menos' : 'Todos'}
          </Button>
        </div>
      </div>

      <div className={styles.legend}>
        <span><span className={styles.classSkillDot}></span> Skill de clase (+3 si tiene rango)</span>
      </div>

      <div className={styles.listHeader}>
        <span>Habilidad</span>
        <span>Rangos</span>
        <span>Total</span>
        <span>Misc</span>
      </div>

      <div className={styles.list}>
        {displaySkills.map((skill) => {
          const miscBonuses = ranks.find((r) => r.id === skill.id)?.miscBonuses ?? []
          const miscTotal = miscBonuses.reduce((s, b) => s + b.value, 0)
          const isPanelOpen = openMiscPanel === skill.id

          return (
            <div key={skill.id}>
              <div
                className={`${styles.skillRow} ${skill.ranks > 0 ? styles.hasRanks : ''}`}
              >
                <div className={styles.skillInfo}>
                  {skill.isClassSkill ? (
                    <Lock size={12} className={styles.lockIcon} />
                  ) : (
                    <Unlock size={12} className={styles.unlockIcon} />
                  )}
                  <span className={styles.skillName}>{skill.name}</span>
                  <span className={styles.abilityMod}>
                    {calculateModifier(abilities[skill.ability]) >= 0 ? '+' : ''}
                    {calculateModifier(abilities[skill.ability])}
                  </span>
                </div>
                <div className={styles.rankControls}>
                  <button
                    className={styles.rankBtn}
                    onClick={() => updateRank(skill.id, -1)}
                    disabled={skill.ranks <= 0}
                  >
                    -
                  </button>
                  <span className={styles.rankValue}>{skill.ranks}</span>
                  <button
                    className={styles.rankBtn}
                    onClick={() => updateRank(skill.id, 1)}
                    disabled={skillPointsAvailable <= 0 || skill.ranks >= level}
                  >
                    +
                  </button>
                </div>
                <div className={styles.total}>
                  <span className={skill.total >= 0 ? styles.positive : styles.negative}>
                    {skill.total >= 0 ? '+' : ''}{skill.total}
                  </span>
                </div>
                <button
                  className={`${styles.miscBtn} ${isPanelOpen ? styles.miscBtnActive : ''} ${miscBonuses.length > 0 ? styles.miscBtnHasBonuses : ''}`}
                  onClick={() => {
                    setOpenMiscPanel(isPanelOpen ? null : skill.id)
                    setNewMiscValue(0)
                    setNewMiscDesc('')
                  }}
                  title={miscTotal !== 0 ? `Misc: ${miscTotal >= 0 ? '+' : ''}${miscTotal}` : 'Bonus misceláneos'}
                >
                  {miscBonuses.length > 0
                    ? <span className={styles.miscBadge}>{miscTotal >= 0 ? '+' : ''}{miscTotal}</span>
                    : <Plus size={12} />
                  }
                </button>
              </div>

              {/* Misc bonus panel */}
              {isPanelOpen && (
                <div className={styles.miscPanel}>
                  {miscBonuses.length > 0 && (
                    <div className={styles.miscList}>
                      {miscBonuses.map((b, i) => (
                        <div key={i} className={styles.miscRow}>
                          <span className={`${styles.miscVal} ${b.value >= 0 ? styles.positive : styles.negative}`}>
                            {b.value >= 0 ? '+' : ''}{b.value}
                          </span>
                          <span className={styles.miscDesc}>{b.description}</span>
                          <button
                            className={styles.miscRemove}
                            onClick={() => removeMiscBonus(skill.id, i)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={styles.miscAddForm}>
                    <input
                      type="number"
                      className={styles.miscValueInput}
                      value={newMiscValue}
                      min={-20}
                      max={20}
                      onChange={(e) => setNewMiscValue(+e.target.value)}
                    />
                    <input
                      type="text"
                      className={styles.miscDescInput}
                      placeholder="Ej: Herramientas de ladrón"
                      value={newMiscDesc}
                      onChange={(e) => setNewMiscDesc(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addMiscBonus(skill.id)}
                    />
                    <button
                      className={styles.miscAddBtn}
                      onClick={() => addMiscBonus(skill.id)}
                      disabled={!newMiscDesc.trim()}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
