import { useState, useMemo } from 'react'
import { X, Dice6, Shield, Swords, Zap, Award, Sparkles } from 'lucide-react'
import type {
  Character, CharacterClass, CharacterFeat, SkillRank,
  AbilityKey, HpGainMode, FavoredClassChoice, LevelChoice,
} from '../../store'
import { calculateModifier } from '../../store'
import { getClassById, CLASSES, getMulticlassStats } from '../../data'
import { useSRDStore } from '../../store/srdStore'
import {
  archetypeAffectsAttainedLevel, findConflictingArchetype, resolveClassFeatures, buildArchetypesByClassId,
} from '../../data/resolveArchetype'
import type { Archetype } from '../../data/archetypes'
import {
  computeSkillPointsAvailable, isAbilityIncreaseLevel, isGenericFeatLevel, computeHpGain,
  isAlignmentAllowedForClass, checkFeatPrerequisites, FAVORED_CLASS_LABELS,
  getBonusFeatSlotsForClassLevel, getFavoredClassHpBonus, getFavoredClassSkillBonus, resolveModifiers,
} from '../../engine'
import type { BonusFeatSlot } from '../../engine'
import { Button } from '../ui'
import { SkillsList } from './SkillsList'
import { FeatsSelector } from './FeatsSelector'
import { useSpells } from '../../hooks/useSpells'
import styles from './LevelUpModal.module.css'

// Reglas de conjuros ganados por nivel: los lanzadores espontáneos (con `spellsKnown`) eligen
// tantos conjuros nuevos como indique la tabla; el mago no tiene `spellsKnown` (prepara de su
// grimorio) pero la regla base le da 2 conjuros nuevos gratis de grimorio en cada nivel de mago.
const WIZARD_CLASS_ID = 'wizard'
const WIZARD_FREE_SPELLS_PER_LEVEL = 2

function SpellLearnPicker({
  classId, maxLevel, alreadyKnown, selected, maxCount, onToggle,
}: {
  classId: string
  maxLevel: number
  alreadyKnown: string[]
  selected: string[]
  maxCount: number
  onToggle: (spellId: string) => void
}) {
  const [search, setSearch] = useState('')
  const { spells, loading } = useSpells({
    search,
    type: 'all',
    school: 'all',
    level: 'all',
    classIds: [classId],
    showKnownOnly: false,
    knownSpellIds: alreadyKnown,
  })
  const candidates = spells.filter((s) => s.level <= maxLevel && !alreadyKnown.includes(s.id))

  return (
    <>
      <input
        className={styles.searchInput}
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar conjuro..."
      />
      <div className={styles.archetypeOptionList}>
        {loading && <p className={styles.archetypeHint}>Buscando conjuros...</p>}
        {!loading && candidates.map((spell) => {
          const isSelected = selected.includes(spell.id)
          const disabled = !isSelected && selected.length >= maxCount
          return (
            <button
              key={spell.id}
              type="button"
              disabled={disabled}
              className={`${styles.archetypeOption} ${isSelected ? styles.spellOptionSelected : ''}`}
              onClick={() => onToggle(spell.id)}
            >
              <span>{spell.name} <span className={styles.mono}>(nivel {spell.level})</span></span>
              <small>{spell.school}</small>
            </button>
          )
        })}
        {!loading && candidates.length === 0 && (
          <p className={styles.archetypeHint}>No hay conjuros que coincidan con la búsqueda.</p>
        )}
      </div>
    </>
  )
}

export interface LevelUpUpdates {
  newLevel: number
  newClassLevels: CharacterClass[]
  hpGained: number
  hpRolled: number | null
  hpMode: HpGainMode
  newAbilities: Character['abilities']
  newSkills: SkillRank[]
  newFeats: CharacterFeat[]
  newSpells: string[]
  levelChoice: LevelChoice
}

interface LevelUpModalProps {
  character: Character
  onConfirm: (updates: LevelUpUpdates) => void
  onClose: () => void
}

type ClassChoice = { type: 'existing'; classId: string } | { type: 'new'; classId: string }
type TabId = 'class' | 'combat' | 'skills' | 'feats' | 'spells'

const ABILITY_LABELS: Record<AbilityKey, string> = {
  strength: 'FUE', dexterity: 'DES', constitution: 'CON',
  intelligence: 'INT', wisdom: 'SAB', charisma: 'CAR',
}

export function LevelUpModal({ character, onConfirm, onClose }: LevelUpModalProps) {
  const newLevel = character.level + 1
  const conMod = calculateModifier(character.abilities.constitution)

  const { getArchetypesByClass, getArchetypeById, feats: allFeats } = useSRDStore()

  const [activeTab, setActiveTab] = useState<TabId>('class')

  // ── 1. Clase ────────────────────────────────────────────────────────────────────────
  const [classChoice, setClassChoice] = useState<ClassChoice>({
    type: 'existing',
    classId: character.classes[0].id,
  })
  const [showNewClassPicker, setShowNewClassPicker] = useState(false)
  const [newArchetypeIds, setNewArchetypeIds] = useState<string[]>([])
  const [archetypeSearch, setArchetypeSearch] = useState('')

  // ── 2. Puntos de golpe ──────────────────────────────────────────────────────────────
  const [hpMode, setHpMode] = useState<HpGainMode>('average')
  const [rolledValue, setRolledValue] = useState<number | null>(null)
  const [manualValue, setManualValue] = useState<number>(1)

  // ── 4. Aumento de característica (niveles 4/8/12/16/20) ─────────────────────────────
  const [abilityIncrease, setAbilityIncrease] = useState<AbilityKey | null>(null)
  const abilityIncreaseRequired = isAbilityIncreaseLevel(newLevel)

  // ── 5. Puntos de habilidad ───────────────────────────────────────────────────────────
  const [pendingSkills, setPendingSkills] = useState<SkillRank[]>(character.skills)

  // ── 6. Dote ───────────────────────────────────────────────────────────────────────────
  const [pendingFeats, setPendingFeats] = useState<CharacterFeat[]>([])

  // ── 7. Clase predilecta ──────────────────────────────────────────────────────────────
  const [favoredClassChoice, setFavoredClassChoice] = useState<FavoredClassChoice | undefined>(undefined)

  // ── 8. Conjuros nuevos ───────────────────────────────────────────────────────────────
  const [pendingSpellsLearned, setPendingSpellsLearned] = useState<string[]>([])

  const resolvedStats = useMemo(() => resolveModifiers(character), [character])

  const resolvedClassData = getClassById(classChoice.classId)
  const hitDie = resolvedClassData?.hitDie ?? 8

  const existingClassEntry = classChoice.type === 'existing'
    ? character.classes.find((c) => c.id === classChoice.classId)
    : undefined
  const attainedLevel = existingClassEntry?.level ?? 0
  const newClassLevel = attainedLevel + 1
  const genericFeatSlots: BonusFeatSlot[] = isGenericFeatLevel(newLevel) ? [{ id: `character-${newLevel}`, label: 'Dote de personaje' }] : []
  const bonusFeatSlots = getBonusFeatSlotsForClassLevel(classChoice.classId, newClassLevel)
  const featSlots = [...genericFeatSlots, ...bonusFeatSlots]
  const featSlotsRequired = featSlots.length

  const isFavoredClassLevel = character.favoredClassId !== undefined && character.favoredClassId === classChoice.classId

  const resetPerClassState = () => {
    setRolledValue(null)
    setNewArchetypeIds([])
    setArchetypeSearch('')
    setPendingSkills(character.skills)
    setPendingFeats([])
    setFavoredClassChoice(undefined)
    setPendingSpellsLearned([])
  }

  const changeClassChoice = (choice: ClassChoice) => {
    setClassChoice(choice)
    resetPerClassState()
  }

  // ── Validación de alineamiento (V-01/V-02) ──────────────────────────────────────────
  // Clases nuevas incompatibles con el alineamiento actual se filtran del selector; una
  // clase ya en progreso que deja de cumplir su restricción (p.ej. el alineamiento cambió
  // en otro momento) no bloquea la subida — pasa a "ex-clase" (no se pierden niveles).
  const eligibleNewClasses = CLASSES.filter(
    (cd) => !character.classes.some((c) => c.id === cd.id) && isAlignmentAllowedForClass(character.alignment, cd)
  )
  const existingClassAlignmentWarning = classChoice.type === 'existing' && resolvedClassData
    && !isAlignmentAllowedForClass(character.alignment, resolvedClassData)

  // ── Arquetipos ───────────────────────────────────────────────────────────────────────
  const existingArchetypeIds = existingClassEntry?.archetypeIds ?? []
  const classArchetypeOptions = resolvedClassData ? getArchetypesByClass(resolvedClassData.id) : []
  const selectedArchetypes = classArchetypeOptions.filter(
    (a) => existingArchetypeIds.includes(a.id) || newArchetypeIds.includes(a.id)
  )

  const archetypeBlockReason = (option: Archetype): string | null => {
    const clashing = findConflictingArchetype(option, selectedArchetypes)
    if (clashing) return `Incompatible con "${clashing.name}": ambos modifican la misma característica`
    if (attainedLevel > 0 && archetypeAffectsAttainedLevel(option, attainedLevel)) {
      return `Modifica una característica de nivel ${attainedLevel} o anterior, ya obtenida: requiere reconstrucción retroactiva aprobada por el DJ`
    }
    return null
  }

  const toggleArchetype = (id: string) => {
    if (existingArchetypeIds.includes(id)) return
    if (newArchetypeIds.includes(id)) {
      setNewArchetypeIds(newArchetypeIds.filter((v) => v !== id))
      return
    }
    const option = classArchetypeOptions.find((a) => a.id === id)
    if (option && archetypeBlockReason(option)) return
    setNewArchetypeIds([...newArchetypeIds, id])
  }

  const featuresAtNewLevel = resolvedClassData
    ? resolveClassFeatures(resolvedClassData, selectedArchetypes).filter((f) => f.level === newClassLevel)
    : []

  // ── PG ───────────────────────────────────────────────────────────────────────────────
  const handleRoll = () => {
    setRolledValue(Math.floor(Math.random() * hitDie) + 1)
  }

  const favoredHpBonus = getFavoredClassHpBonus(isFavoredClassLevel ? favoredClassChoice : undefined)
  const baseHpGained = computeHpGain(hpMode, hitDie, conMod, hpMode === 'roll' ? rolledValue : manualValue)
  const hpGained = baseHpGained !== null ? baseHpGained + favoredHpBonus : null

  // ── BAB / salvaciones (recálculo informativo, §5) ───────────────────────────────────
  const prospectiveClasses: CharacterClass[] = classChoice.type === 'existing'
    ? character.classes.map((c) => c.id === classChoice.classId ? { ...c, level: c.level + 1 } : c)
    : [...character.classes, { id: classChoice.classId, level: 1 }]
  const currentStats = getMulticlassStats(character.classes)
  const nextStats = getMulticlassStats(prospectiveClasses)

  // ── Característica efectiva y puntos de habilidad ───────────────────────────────────
  const effectiveAbilities = abilityIncrease
    ? { ...character.abilities, [abilityIncrease]: character.abilities[abilityIncrease] + 1 }
    : character.abilities

  const prospectiveClassesWithArchetypes = classChoice.type === 'existing'
    ? character.classes.map((c) => c.id === classChoice.classId
      ? { ...c, archetypeIds: [...(c.archetypeIds ?? []), ...newArchetypeIds] }
      : c)
    : [...character.classes, { id: classChoice.classId, archetypeIds: newArchetypeIds }]
  const archetypesByClassId = buildArchetypesByClassId(prospectiveClassesWithArchetypes, getArchetypeById)

  const spentRanksTotal = pendingSkills.reduce((sum, r) => sum + r.ranks, 0)
  const favoredSkillBonus = getFavoredClassSkillBonus(isFavoredClassLevel ? favoredClassChoice : undefined)
  const skillPointBudget = computeSkillPointsAvailable(
    { abilities: effectiveAbilities, classes: prospectiveClasses, skills: pendingSkills, race: character.race, archetypesByClassId },
    0,
  ) + favoredSkillBonus
  const skillPointsAvailable = skillPointBudget - spentRanksTotal

  // ── Dote: prerrequisitos de mejor esfuerzo (V-05) ───────────────────────────────────
  const pendingFeatChecks = pendingFeats
    .map((selected) => {
      const feat = allFeats.find((f) => f.id === selected.id)
      return feat
        ? { feat, check: checkFeatPrerequisites(feat, { bab: nextStats.bab, abilities: effectiveAbilities, featIds: character.feats.map((f) => f.id) }, allFeats) }
        : null
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

  const combinedSelectedFeats: CharacterFeat[] = [...character.feats, ...pendingFeats]

  // ── Conjuros ganados este nivel (V-10) ──────────────────────────────────────────────
  const spellsPerDayRow = resolvedClassData?.spellsPerDay
  const currentSpellsPerDayRow = attainedLevel > 0 ? spellsPerDayRow?.[attainedLevel - 1] : undefined
  const nextSpellsPerDayRow = spellsPerDayRow?.[newClassLevel - 1]
  const spellSlotsGained = (nextSpellsPerDayRow ?? [])
    .map((count, spellLevel) => ({ spellLevel, from: currentSpellsPerDayRow?.[spellLevel] ?? 0, to: count ?? 0 }))
    .filter(({ from, to }) => to > from)

  const spellsKnownRow = resolvedClassData?.spellsKnown
  const currentKnownRow = attainedLevel > 0 ? spellsKnownRow?.[attainedLevel - 1] : undefined
  const nextKnownRow = spellsKnownRow?.[newClassLevel - 1]
  const knownSpellsGained = nextKnownRow
    ? nextKnownRow.reduce((sum: number, count, spellLevel) => sum + Math.max(0, (count ?? 0) - (currentKnownRow?.[spellLevel] ?? 0)), 0)
    : 0

  const isWizardLevel = classChoice.classId === WIZARD_CLASS_ID
  const spellsToLearnCount: number = spellsKnownRow ? knownSpellsGained : (isWizardLevel ? WIZARD_FREE_SPELLS_PER_LEVEL : 0)
  const maxLearnableSpellLevel = (nextSpellsPerDayRow ?? nextKnownRow ?? [])
    .reduce((max: number, count, spellLevel) => ((count ?? 0) > 0 ? spellLevel : max), 0)

  // ── Estado por pestaña — para marcar en la barra de pestañas qué grupo tiene pendientes ──
  const classTabIncomplete = isFavoredClassLevel && favoredClassChoice === undefined
  const combatTabIncomplete = hpGained === null || (abilityIncreaseRequired && abilityIncrease === null)
  const skillsTabIncomplete = skillPointsAvailable < 0
  const featsTabIncomplete = pendingFeats.length < featSlotsRequired || pendingFeatChecks.some(({ check }) => !check.met)
  const spellsTabIncomplete = pendingSpellsLearned.length < spellsToLearnCount

  const tabs: { id: TabId; label: string; icon: typeof Shield; incomplete: boolean }[] = [
    { id: 'class', label: 'Clase', icon: Shield, incomplete: classTabIncomplete },
    { id: 'combat', label: 'Combate', icon: Swords, incomplete: combatTabIncomplete },
    { id: 'skills', label: 'Habilidades', icon: Zap, incomplete: skillsTabIncomplete },
    ...(featSlotsRequired > 0 ? [{ id: 'feats' as const, label: 'Dotes', icon: Award, incomplete: featsTabIncomplete }] : []),
    ...(resolvedClassData?.spellsPerDay ? [{ id: 'spells' as const, label: 'Conjuros', icon: Sparkles, incomplete: spellsTabIncomplete }] : []),
  ]

  const validationMessages = [
    hpGained === null ? 'Resuelve los puntos de golpe.' : null,
    abilityIncreaseRequired && abilityIncrease === null ? 'Elige el aumento de caracteristica.' : null,
    skillPointsAvailable < 0 ? `Has gastado ${Math.abs(skillPointsAvailable)} punto(s) de habilidad de mas.` : null,
    pendingFeats.length < featSlotsRequired ? `Elige ${featSlotsRequired - pendingFeats.length} dote(s) pendiente(s) de este nivel.` : null,
    pendingFeatChecks.some(({ check }) => !check.met) ? 'Una dote elegida no cumple sus prerrequisitos reconocidos.' : null,
    isFavoredClassLevel && favoredClassChoice === undefined ? 'Elige el beneficio de clase predilecta.' : null,
    spellsTabIncomplete ? `Elige ${spellsToLearnCount - pendingSpellsLearned.length} conjuro(s) nuevo(s).` : null,
  ].filter((message): message is string => Boolean(message))

  const canConfirm = validationMessages.length === 0

  const handleConfirm = () => {
    if (!canConfirm || hpGained === null) return

    const newClassLevels: CharacterClass[] = classChoice.type === 'existing'
      ? character.classes.map((c) =>
        c.id === classChoice.classId
          ? { ...c, level: c.level + 1, archetypeIds: [...(c.archetypeIds ?? []), ...newArchetypeIds] }
          : c
      )
      : [...character.classes, { id: classChoice.classId, level: 1, archetypeIds: newArchetypeIds }]

    const newAbilities = abilityIncrease
      ? { ...character.abilities, [abilityIncrease]: character.abilities[abilityIncrease] + 1 }
      : character.abilities

    const newFeats: CharacterFeat[] = [...character.feats, ...pendingFeats]

    const skillRanksSpent: Record<string, number> = {}
    for (const rank of pendingSkills) {
      const before = character.skills.find((s) => s.id === rank.id)?.ranks ?? 0
      const delta = rank.ranks - before
      if (delta > 0) skillRanksSpent[rank.id] = delta
    }

    const levelChoice: LevelChoice = {
      characterLevel: newLevel,
      classId: classChoice.classId,
      classLevel: newClassLevel,
      archetypeIds: newArchetypeIds,
      hpMode,
      hpRolled: hpMode === 'roll' ? rolledValue : null,
      hpGained,
      abilityIncrease: abilityIncrease ?? undefined,
      featIds: pendingFeats.map((feat) => feat.id),
      favoredClassChoice: isFavoredClassLevel ? favoredClassChoice : undefined,
      skillRanksSpent,
      spellsLearned: pendingSpellsLearned.length > 0 ? pendingSpellsLearned : undefined,
      source: 'level-up',
      createdAt: new Date().toISOString(),
    }

    onConfirm({
      newLevel,
      newClassLevels,
      hpGained,
      hpRolled: hpMode === 'roll' ? rolledValue : null,
      hpMode,
      newAbilities,
      newSkills: pendingSkills,
      newFeats,
      newSpells: [...character.spells, ...pendingSpellsLearned],
      levelChoice,
    })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Subir al nivel {newLevel}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Barra de pestañas */}
        <div className={styles.tabBar} role="tablist">
          {tabs.map(({ id, label, icon: Icon, incomplete }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              className={`${styles.tabBtn} ${activeTab === id ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={15} />
              {label}
              {incomplete && <span className={styles.tabDot} aria-label="Pendiente" />}
            </button>
          ))}
        </div>

        {/* ── Pestaña: Clase ── */}
        {activeTab === 'class' && (
          <div className={styles.sectionsGrid}>
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Clase a subir</p>
              <div className={styles.classChoiceList}>
                {character.classes.map((cc) => {
                  const cd = getClassById(cc.id)
                  const isSelected = classChoice.type === 'existing' && classChoice.classId === cc.id
                  return (
                    <button
                      key={cc.id}
                      className={`${styles.modeBtn} ${isSelected ? styles.modeBtnActive : ''}`}
                      onClick={() => changeClassChoice({ type: 'existing', classId: cc.id })}
                    >
                      {cd?.name ?? cc.id}
                      <span className={styles.mono}> Nv {cc.level}</span>
                    </button>
                  )
                })}
                {!showNewClassPicker && (
                  <button
                    className={styles.modeBtn}
                    onClick={() => setShowNewClassPicker(true)}
                  >
                    + Nueva clase
                  </button>
                )}
              </div>
              {showNewClassPicker && (
                <select
                  className={styles.newClassSelect}
                  value={classChoice.type === 'new' ? classChoice.classId : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      changeClassChoice({ type: 'new', classId: e.target.value })
                    }
                  }}
                >
                  <option value="">Elige clase…</option>
                  {eligibleNewClasses.map((cd) => (
                    <option key={cd.id} value={cd.id}>{cd.name}</option>
                  ))}
                </select>
              )}
              {existingClassAlignmentWarning && (
                <p className={styles.warningText}>
                  Tu alineamiento actual ya no encaja con las restricciones de {resolvedClassData?.name}. No pierdes niveles, pero tu DJ puede tratarla como «ex-clase» y restringir el uso de ciertos rasgos.
                </p>
              )}
            </div>

            {classArchetypeOptions.length > 0 && (() => {
              const addableArchetypes = classArchetypeOptions.filter(
                (a) => !existingArchetypeIds.includes(a.id) && !newArchetypeIds.includes(a.id) && !archetypeBlockReason(a)
              )
              const normalizedArchetypeSearch = archetypeSearch.trim().toLowerCase()
              const filteredAddableArchetypes = normalizedArchetypeSearch
                ? addableArchetypes.filter((a) => (
                  a.name.toLowerCase().includes(normalizedArchetypeSearch) ||
                  a.id.toLowerCase().includes(normalizedArchetypeSearch) ||
                  a.description.toLowerCase().includes(normalizedArchetypeSearch)
                ))
                : addableArchetypes
              const hasBlockedArchetypes = addableArchetypes.length + selectedArchetypes.length < classArchetypeOptions.length
              return (
                <div className={styles.section}>
                  <p className={styles.sectionLabel}>Arquetipos</p>

                  {selectedArchetypes.length > 0 && (
                    <div className={styles.archetypeChips}>
                      {selectedArchetypes.map((a) => {
                        const isLocked = existingArchetypeIds.includes(a.id)
                        return (
                          <span
                            key={a.id}
                            className={`${styles.archetypeChip} ${isLocked ? styles.archetypeChipLocked : ''}`}
                            title={isLocked ? 'Ya elegido en niveles anteriores' : undefined}
                          >
                            {a.name}
                            {!isLocked && (
                              <button
                                type="button"
                                className={styles.archetypeChipRemove}
                                onClick={() => toggleArchetype(a.id)}
                                aria-label={`Quitar ${a.name}`}
                              >
                                <X size={12} />
                              </button>
                            )}
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {addableArchetypes.length > 0 ? (
                    <>
                      <input
                        className={styles.searchInput}
                        type="search"
                        value={archetypeSearch}
                        onChange={(e) => setArchetypeSearch(e.target.value)}
                        placeholder="Buscar arquetipo..."
                      />
                      <div className={styles.archetypeOptionList}>
                        {filteredAddableArchetypes.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            className={styles.archetypeOption}
                            onClick={() => toggleArchetype(a.id)}
                          >
                            <span>{a.name}</span>
                            <small>{a.description}</small>
                          </button>
                        ))}
                        {filteredAddableArchetypes.length === 0 && (
                          <p className={styles.archetypeHint}>No hay arquetipos con ese filtro.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    selectedArchetypes.length === 0 && (
                      <p className={styles.archetypeHint}>No hay arquetipos disponibles para añadir.</p>
                    )
                  )}

                  {hasBlockedArchetypes && (
                    <p className={styles.archetypeHint}>
                      {attainedLevel > 0
                        ? `Algunos arquetipos no aparecen: modifican características de nivel ${attainedLevel} o anterior, ya obtenidas, o entran en conflicto con los ya elegidos.`
                        : 'Algunos arquetipos no aparecen: entran en conflicto con los ya elegidos.'}
                    </p>
                  )}
                </div>
              )
            })()}

            {isFavoredClassLevel && (
              <div className={styles.section}>
                <p className={styles.sectionLabel}>Clase predilecta — {resolvedClassData?.name}</p>
                <div className={styles.modeToggle}>
                  {(['hp', 'skill', 'racial'] as const).map((opt) => (
                    <button
                      key={opt}
                      className={`${styles.modeBtn} ${favoredClassChoice === opt ? styles.modeBtnActive : ''}`}
                      onClick={() => setFavoredClassChoice(opt)}
                    >
                      {FAVORED_CLASS_LABELS[opt]}
                    </button>
                  ))}
                </div>
                {favoredClassChoice === 'racial' && (
                  <p className={styles.archetypeHint}>
                    Sin catálogo de opciones raciales alternativas todavía: anota el efecto elegido en las notas del personaje.
                  </p>
                )}
              </div>
            )}

            {featuresAtNewLevel.length > 0 && (
              <div className={styles.section}>
                <p className={styles.sectionLabel}>
                  {resolvedClassData?.name} — características de nivel {newClassLevel}
                </p>
                <ul className={styles.infoList}>
                  {featuresAtNewLevel
                    .filter((f) => f.status !== 'replaced')
                    .map((f, i) => (
                      <li key={i} className={styles.infoItem}>
                        <strong>{f.name}</strong>
                        {f.status === 'changed' && <span className={styles.mono}> (modificada por arquetipo)</span>}
                        {f.status === 'optional' && <span className={styles.mono}> (opcional por arquetipo)</span>}
                        {f.status === 'archetype' && <span className={styles.mono}> (arquetipo)</span>}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── Pestaña: Combate ── */}
        {activeTab === 'combat' && (
          <div className={styles.sectionsGrid}>
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Dado de golpe: d{hitDie}</p>

              <div className={styles.modeToggle}>
                <button
                  className={`${styles.modeBtn} ${hpMode === 'average' ? styles.modeBtnActive : ''}`}
                  onClick={() => setHpMode('average')}
                >
                  Media (+{Math.floor(hitDie / 2) + 1})
                </button>
                <button
                  className={`${styles.modeBtn} ${hpMode === 'roll' ? styles.modeBtnActive : ''}`}
                  onClick={() => setHpMode('roll')}
                >
                  <Dice6 size={15} />
                  Tirar dado
                </button>
                <button
                  className={`${styles.modeBtn} ${hpMode === 'manual' ? styles.modeBtnActive : ''}`}
                  onClick={() => setHpMode('manual')}
                >
                  Manual
                </button>
              </div>

              {hpMode === 'roll' && (
                <div className={styles.rollArea}>
                  <button className={styles.rollBtn} onClick={handleRoll}>
                    <Dice6 size={16} />
                    {rolledValue !== null ? 'Volver a tirar' : `Tirar d${hitDie}`}
                  </button>
                  {rolledValue !== null && (
                    <span className={styles.rollResult}>{rolledValue}</span>
                  )}
                </div>
              )}

              {hpMode === 'manual' && (
                <div className={styles.manualArea}>
                  <input
                    type="number"
                    className={styles.manualInput}
                    min={1}
                    max={hitDie}
                    value={manualValue}
                    onChange={(e) => setManualValue(Math.max(1, Math.min(hitDie, parseInt(e.target.value) || 1)))}
                  />
                </div>
              )}

              <div className={styles.hpSummary}>
                <span className={styles.hpDetail}>
                  Modificador CON: <span className={styles.mono}>{conMod >= 0 ? '+' : ''}{conMod}</span>
                  {favoredHpBonus > 0 && <span className={styles.mono}> · Clase predilecta: +{favoredHpBonus}</span>}
                </span>
                {hpGained !== null && (
                  <span className={styles.hpTotal}>
                    Total PV ganados: <span className={styles.hpTotalVal}>+{hpGained}</span>
                  </span>
                )}
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.sectionLabel}>Ataque base y salvaciones</p>
              <ul className={styles.infoList}>
                <li className={styles.infoItem}>
                  BAB: <span className={styles.mono}>+{currentStats.bab} → +{nextStats.bab}</span>
                </li>
                <li className={styles.infoItem}>
                  Fort/Ref/Vol: <span className={styles.mono}>
                    {currentStats.fortitude}/{currentStats.reflex}/{currentStats.will} → {nextStats.fortitude}/{nextStats.reflex}/{nextStats.will}
                  </span>
                </li>
              </ul>
            </div>

            {abilityIncreaseRequired && (
              <div className={styles.section}>
                <p className={styles.sectionLabel}>Aumento de característica (+1)</p>
                <div className={styles.modeToggle}>
                  {(Object.keys(ABILITY_LABELS) as AbilityKey[]).map((key) => (
                    <button
                      key={key}
                      className={`${styles.modeBtn} ${abilityIncrease === key ? styles.modeBtnActive : ''}`}
                      onClick={() => setAbilityIncrease(key)}
                    >
                      {ABILITY_LABELS[key]} <span className={styles.mono}>{character.abilities[key]}{abilityIncrease === key ? ` → ${character.abilities[key] + 1}` : ''}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Pestaña: Habilidades ── */}
        {activeTab === 'skills' && (
          <div className={styles.sectionsGrid}>
            <div className={styles.section}>
              <p className={styles.sectionLabel}>
                Puntos de habilidad <span className={styles.mono}>({skillPointsAvailable} disponibles)</span>
              </p>
              <SkillsList
                ranks={pendingSkills}
                onChange={setPendingSkills}
                abilities={effectiveAbilities}
                classes={prospectiveClasses}
                race={character.race}
                level={newLevel}
                skillPointsAvailable={skillPointsAvailable}
                archetypesByClassId={archetypesByClassId}
                resolvedStats={resolvedStats}
              />
            </div>
          </div>
        )}

        {/* ── Pestaña: Dotes ── */}
        {activeTab === 'feats' && featSlotsRequired > 0 && (
          <div className={styles.sectionsGrid}>
            <div className={styles.section}>
              <p className={styles.sectionLabel}>
                Dotes de este nivel <span className={styles.mono}>({pendingFeats.length}/{featSlotsRequired})</span>
              </p>
              <ul className={styles.infoList}>
                {featSlots.map((slot) => (
                  <li key={slot.id} className={styles.infoItem}>
                    {slot.label}{slot.allowedTypes ? <span className={styles.mono}> ({slot.allowedTypes.join(', ')})</span> : null}
                  </li>
                ))}
              </ul>
              {pendingFeatChecks.filter(({ check }) => !check.met).map(({ feat, check }) => (
                <p key={feat.id} className={styles.warningText}>
                  {feat.name}: {check.unmetReasons.join('; ')}
                </p>
              ))}
              <FeatsSelector
                selectedFeats={combinedSelectedFeats}
                maxFeats={character.feats.length + featSlotsRequired}
                onAdd={(featId, specification) => {
                  if (pendingFeats.length >= featSlotsRequired) return
                  setPendingFeats([...pendingFeats, { id: featId, specification }])
                }}
                onRemove={(index) => {
                  if (index >= character.feats.length) {
                    setPendingFeats(pendingFeats.filter((_, i) => i !== index - character.feats.length))
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* ── Pestaña: Conjuros ── */}
        {activeTab === 'spells' && resolvedClassData?.spellsPerDay && (
          <div className={styles.sectionsGrid}>
            {spellSlotsGained.length > 0 && (
              <div className={styles.section}>
                <p className={styles.sectionLabel}>Espacios de conjuro ganados</p>
                <ul className={styles.infoList}>
                  {spellSlotsGained.map(({ spellLevel, from, to }) => (
                    <li key={spellLevel} className={styles.infoItem}>
                      Nivel {spellLevel}: <span className={styles.mono}>{from} → {to}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {spellsToLearnCount > 0 ? (
              <div className={styles.section}>
                <p className={styles.sectionLabel}>
                  Conjuros nuevos <span className={styles.mono}>({pendingSpellsLearned.length}/{spellsToLearnCount})</span>
                </p>
                <SpellLearnPicker
                  classId={classChoice.classId}
                  maxLevel={maxLearnableSpellLevel}
                  alreadyKnown={character.spells}
                  selected={pendingSpellsLearned}
                  maxCount={spellsToLearnCount}
                  onToggle={(spellId) => {
                    setPendingSpellsLearned((prev) =>
                      prev.includes(spellId) ? prev.filter((id) => id !== spellId) : [...prev, spellId]
                    )
                  }}
                />
              </div>
            ) : (
              <div className={styles.section}>
                <p className={styles.sectionLabel}>Conjuros</p>
                <p className={styles.archetypeHint}>
                  {resolvedClassData.spellsKnown
                    ? 'No ganas conjuros conocidos nuevos en este nivel.'
                    : `${resolvedClassData.name} prepara sus conjuros de la lista completa cada día — no hace falta elegir conjuros nuevos aquí.`}
                </p>
              </div>
            )}

            <div className={styles.section}>
              <p className={styles.archetypeHint}>Los espacios de conjuro se sincronizan automáticamente con la tabla de {resolvedClassData.name} al confirmar.</p>
            </div>
          </div>
        )}

        {/* Confirm */}
        {validationMessages.length > 0 && (
          <div className={styles.validationBox}>
            {validationMessages.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}
        <div className={styles.modalFooter}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!canConfirm}>
            Confirmar subida de nivel
          </Button>
        </div>
      </div>
    </div>
  )
}
