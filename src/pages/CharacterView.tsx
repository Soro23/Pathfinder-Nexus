import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Play, Edit2, Trash2,
  Sword, Shield, Scroll, Package, Star,
  Heart, Eye, PlusCircle, X, PawPrint, BookOpen, Download,
  Zap, TrendingUp, Power, Pencil, Check, Bell, AlertTriangle, Menu, Layers, LayoutGrid
} from 'lucide-react'
import { useCharacterStore, calculateModifier, getModifierString, generateId, FEAT_ORIGIN_LABELS, getFeatOrigin } from '../store'
import type { StatusEffect, BonusTarget, JournalEntry } from '../store'
import { getClassById, getRaceById, hasFloatingAbilityBonus, SpellLevel, useSRDStore } from '../data'
import { resolveClassSkills, buildArchetypesByClassId } from '../data/resolveArchetype'
import { resolveModifiers, canLevelUpFromXp, computeCombatStats, computeEffectiveMaxHp, computeSkillPointsAvailable, computeSkillTotal, getExpectedFeatCount, getXpToNextLevel, isClassSkillForCharacter, getCarryingCapacity, getEncumbranceLevel, getEncumbranceSkillPenalty, computeSpeed, computeSyncedSpellSlots, validateProgressionAgainstCharacter, XP_SPEED_LABELS } from '../engine'
import { Card, Button } from '../components/ui'
import { FeatsSelector, SkillsList, InventoryManager, Spellbook, AnimalCompanion, ArsenalManager, ClassProgressionTable, LevelUpModal, DomainPicker, BlessingPicker, FeaturesTraitsPanel } from '../components/character'
import { ArchetypeSelector } from '../components/character/ArchetypeSelector'
import type { LevelUpUpdates } from '../components/character'
import styles from './CharacterView.module.css'

type Tab = 'combat' | 'features' | 'skills' | 'feats' | 'weapons' | 'inventory' | 'spells' | 'notes' | 'companion'

type CharacterNotification = {
  id: string
  title: string
  detail: string
  severity: 'warning' | 'info'
  tab: Tab
}

const ABILITY_ABBR: Record<string, string> = {
  strength: 'FUE', dexterity: 'DES', constitution: 'CON',
  intelligence: 'INT', wisdom: 'SAB', charisma: 'CAR',
}

export function CharacterView() {
  const { skills: SKILLS, feats: FEATS, getArchetypeById } = useSRDStore()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const character = useCharacterStore((state) => state.getCharacter(id || ''))
  const updateCharacter = useCharacterStore((state) => state.updateCharacter)
  const deleteCharacter = useCharacterStore((state) => state.deleteCharacter)

  const [activeTab, setActiveTab] = useState<Tab>('combat')
  const [tabMenuOpen, setTabMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  // En móvil, Modo Juego/Subir de nivel/Editar/Eliminar y el panel de notificaciones
  // se ocultan detrás de un menú hamburguesa y una campanita respectivamente, en vez de
  // ocupar espacio fijo en la cabecera todo el tiempo (en desktop siguen siempre visibles).
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false)
  const [mobileNotifOpen, setMobileNotifOpen] = useState(false)
  // Fuera del flujo normal: cambia el nivel de una clase sin otorgar PG, puntos de
  // habilidad, dotes ni aumentos de característica. Solo para corregir errores de ficha,
  // por eso queda oculto tras un toggle explícito en vez de estar siempre a mano.
  const [manualCorrectionMode, setManualCorrectionMode] = useState(false)
  const [newEffectName, setNewEffectName] = useState('')
  const [newEffectDesc, setNewEffectDesc] = useState('')
  const [newEffectDuration, setNewEffectDuration] = useState('')
  const [newEffectTarget, setNewEffectTarget] = useState<BonusTarget | 'skill' | ''>('')
  const [newEffectSkillId, setNewEffectSkillId] = useState('')
  const [newEffectValue, setNewEffectValue] = useState<number>(0)
  const [showEffectForm, setShowEffectForm] = useState(false)
  const [editingEffectId, setEditingEffectId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editTarget, setEditTarget] = useState<BonusTarget | 'skill' | ''>('')
  const [editSkillId, setEditSkillId] = useState('')
  const [editValue, setEditValue] = useState<number>(0)
  const [expandedJournalEntry, setExpandedJournalEntry] = useState<string | null>(null)
  const [showJournalModal, setShowJournalModal] = useState(false)
  const [newJournalContent, setNewJournalContent] = useState('')
  const [progressionTab, setProgressionTab] = useState<string>(() => character?.classes[0]?.id ?? '')

  const resolvedStats = useMemo(
    () => character ? resolveModifiers(character) : {
      skillBonuses: {}, saveBonuses: { fort: 0, ref: 0, will: 0 },
      acBonuses: { natural: 0, deflection: 0, dodge: 0, armor: 0, shield: 0, total: 0 },
      abilityBonuses: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
      initiativeBonus: 0, attackBonus: 0, damageBonus: 0,
      hpBonus: 0, speedBonus: 0, cmbBonus: 0, cmdBonus: 0, allModifiers: [],
    },
    [character]
  )

  const archetypesByClassId = useMemo(
    () => character ? buildArchetypesByClassId(character.classes, getArchetypeById) : {},
    [character, getArchetypeById]
  )

  if (!character) {
    return (
      <div className={styles.notFound}>
        <h2>Personaje no encontrado</h2>
        <Link to="/">
          <Button variant="secondary">
            <ArrowLeft size={18} />
            Volver al Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  const { abilities } = character

  const totalWeight = (character.inventory ?? []).reduce((sum, item) => sum + item.weight * item.quantity, 0)
  const combat = computeCombatStats(character, resolvedStats, totalWeight)
  const { bab, ac, cmb, cmd, initiative, fortitude, reflex, will } = combat
  const acTouch = combat.acTouch
  const acFlat = combat.acFlatFooted

  const speed = computeSpeed(character, totalWeight)
  const encumbrancePenalty = getEncumbranceSkillPenalty(getEncumbranceLevel(totalWeight, abilities.strength))

  const raceData = getRaceById(character.race?.toLowerCase())
  const hasFloatingRaceBonus = hasFloatingAbilityBonus(character.race)

  // PV máximos efectivos: PV base + bonos del motor (dotes/objetos como Toughness).
  const effectiveMaxHp = computeEffectiveMaxHp(character, resolvedStats)
  const hpPercent = Math.max(0, Math.min(100, (character.hp.current / effectiveMaxHp) * 100))

  const xpSpeed = character.xpProgression ?? 'medium'

  const isCaster = character.classes.some((c) => {
    const cls = getClassById(c.id)
    return cls?.magicType !== null && cls?.magicType !== undefined
  })

  const casterAbility = (() => {
    for (const c of character.classes) {
      const cls = getClassById(c.id)
      if (cls?.casterAbility) return cls.casterAbility
    }
    return 'intelligence' as const
  })()

  const equippedArmorAcp = (character.armor ?? [])
    .filter((a) => a.equipped && a.type !== 'shield')
    .reduce((sum, a) => sum + (a.armorCheckPenalty ?? 0), 0)

  const spentSkillRanks = character.skills.reduce((sum, s) => sum + s.ranks, 0)
  const skillPointsAvailable = computeSkillPointsAvailable(character, spentSkillRanks)
  const expectedFeats = getExpectedFeatCount(character.level, character.classes, character.race)
  const xpToNextLevel = getXpToNextLevel(character.level, character.xp, xpSpeed)
  const inferredHistoryCount = (character.levelHistory ?? []).filter((choice) => choice.inferred).length
  const progressionMismatches = validateProgressionAgainstCharacter(character)

  const notifications: CharacterNotification[] = []
  const totalClassLevels = character.classes.reduce((sum, c) => sum + c.level, 0)
  const selectedDomains = character.selectedDomains ?? []
  const selectedBlessings = character.selectedBlessings ?? []

  if (!character.name.trim()) {
    notifications.push({
      id: 'missing-name',
      title: 'Falta el nombre',
      detail: 'Completa el nombre del personaje.',
      severity: 'warning',
      tab: 'combat',
    })
  }

  if (!character.race.trim()) {
    notifications.push({
      id: 'missing-race',
      title: 'Falta la raza',
      detail: 'Indica la raza para cerrar los datos basicos.',
      severity: 'warning',
      tab: 'combat',
    })
  }

  if (hasFloatingRaceBonus && !character.raceAbilityChoice) {
    notifications.push({
      id: 'missing-race-ability-choice',
      title: 'Falta elegir el +2 racial',
      detail: `${character.race} recibe +2 a una característica a elección — elígela en Atributos.`,
      severity: 'warning',
      tab: 'combat',
    })
  }

  if (character.classes.length === 0 || totalClassLevels !== character.level) {
    notifications.push({
      id: 'class-levels',
      title: 'Niveles de clase desajustados',
      detail: `La suma de clases es ${totalClassLevels} y el nivel del personaje es ${character.level}.`,
      severity: 'warning',
      tab: 'combat',
    })
  }

  if (progressionMismatches.length > 0) {
    notifications.push({
      id: 'level-history-mismatch',
      title: 'Historial de niveles desajustado',
      detail: 'La progresion nivel a nivel no coincide con los totales actuales de la ficha.',
      severity: 'warning',
      tab: 'combat',
    })
  } else if (inferredHistoryCount > 0) {
    notifications.push({
      id: 'level-history-inferred',
      title: 'Historial retroactivo inferido',
      detail: `${inferredHistoryCount} nivel(es) fueron reconstruidos desde los totales guardados.`,
      severity: 'info',
      tab: 'combat',
    })
  }

  if (canLevelUpFromXp(character.level, character.xp)) {
    notifications.push({
      id: 'xp-level-up',
      title: 'XP suficiente para subir',
      detail: `Tienes ${character.xp} XP. Usa el flujo guiado de subida de nivel.`,
      severity: 'info',
      tab: 'combat',
    })
  }

  if (character.feats.length < expectedFeats) {
    const missing = expectedFeats - character.feats.length
    notifications.push({
      id: 'missing-feats',
      title: missing === 1 ? 'Falta elegir 1 dote' : `Faltan elegir ${missing} dotes`,
      detail: `${character.feats.length}/${expectedFeats} dotes seleccionadas.`,
      severity: 'warning',
      tab: 'feats',
    })
  }

  if (skillPointsAvailable > 0) {
    notifications.push({
      id: 'skill-points',
      title: skillPointsAvailable === 1 ? 'Queda 1 punto de habilidad' : `Quedan ${skillPointsAvailable} puntos de habilidad`,
      detail: 'Asigna los rangos pendientes en la lista de habilidades.',
      severity: 'info',
      tab: 'skills',
    })
  }

  if (skillPointsAvailable < 0) {
    notifications.push({
      id: 'skill-points-overspent',
      title: `Gastaste ${Math.abs(skillPointsAvailable)} punto(s) de habilidad de más`,
      detail: 'Ajusta los rangos asignados en la pestaña Habilidades.',
      severity: 'warning',
      tab: 'skills',
    })
  }

  const skillsOverCap = character.skills
    .filter((s) => s.ranks > character.level)
    .map((s) => SKILLS.find((skill) => skill.id === s.id)?.name ?? s.id)

  if (skillsOverCap.length > 0) {
    notifications.push({
      id: 'skills-over-cap',
      title: 'Hay rangos por encima del limite',
      detail: skillsOverCap.slice(0, 3).join(', '),
      severity: 'warning',
      tab: 'skills',
    })
  }

  if (character.classes.some((c) => c.id === 'cleric')) {
    if (selectedDomains.length < 2) {
      notifications.push({
        id: 'cleric-domains',
        title: 'Faltan dominios de clerigo',
        detail: `${selectedDomains.length}/2 dominios seleccionados.`,
        severity: 'warning',
        tab: 'combat',
      })
    }

    if (!character.channelType) {
      notifications.push({
        id: 'channel-type',
        title: 'Falta canal de energia',
        detail: 'Elige si canaliza energia positiva o negativa.',
        severity: 'info',
        tab: 'combat',
      })
    }
  }

  if (character.classes.some((c) => c.id === 'warpriest') && selectedBlessings.length < 2) {
    notifications.push({
      id: 'warpriest-blessings',
      title: 'Faltan bendiciones',
      detail: `${selectedBlessings.length}/2 bendiciones seleccionadas.`,
      severity: 'warning',
      tab: 'combat',
    })
  }

  for (const choice of character.levelHistory ?? []) {
    const pending = choice.pendingChoices
    if (!pending) continue

    if (pending.hp) {
      notifications.push({
        id: `level-${choice.characterLevel}-hp`,
        title: `Nivel ${choice.characterLevel}: PG sin resolver`,
        detail: 'Resuelve los puntos de golpe ganados en ese nivel.',
        severity: 'warning',
        tab: 'combat',
      })
    }

    if (pending.abilityIncrease) {
      notifications.push({
        id: `level-${choice.characterLevel}-ability`,
        title: `Nivel ${choice.characterLevel}: aumento de característica pendiente`,
        detail: 'Elige la característica a subir en Atributos.',
        severity: 'warning',
        tab: 'combat',
      })
    }

    if (pending.favoredClass) {
      notifications.push({
        id: `level-${choice.characterLevel}-favored`,
        title: `Nivel ${choice.characterLevel}: clase predilecta pendiente`,
        detail: 'Elige el beneficio de clase predilecta para ese nivel.',
        severity: 'warning',
        tab: 'combat',
      })
    }

    if (pending.missingSpells) {
      notifications.push({
        id: `level-${choice.characterLevel}-spells`,
        title: `Nivel ${choice.characterLevel}: ${pending.missingSpells} conjuro(s) nuevo(s) pendiente(s)`,
        detail: 'Añádelos en la pestaña Hechizos.',
        severity: 'warning',
        tab: 'spells',
      })
    }
  }

  const warningCount = notifications.filter((n) => n.severity === 'warning').length

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar a ${character.name}?`)) {
      deleteCharacter(character.id)
      navigate('/')
    }
  }

  const handleExport = () => {
    const json = JSON.stringify(character, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${character.name.replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const addStatusEffect = () => {
    if (!newEffectName.trim()) return
    const resolvedTarget: BonusTarget | undefined =
      newEffectTarget === 'skill'
        ? newEffectSkillId ? (`skill:${newEffectSkillId}` as BonusTarget) : undefined
        : newEffectTarget || undefined
    const effect: StatusEffect = {
      id: generateId(),
      name: newEffectName.trim(),
      description: newEffectDesc.trim(),
      duration: newEffectDuration.trim() || undefined,
      bonusTarget: resolvedTarget,
      bonusValue: resolvedTarget !== undefined ? newEffectValue : undefined,
    }
    updateCharacter(character.id, { statusEffects: [...(character.statusEffects ?? []), effect] })
    setNewEffectName('')
    setNewEffectDesc('')
    setNewEffectDuration('')
    setNewEffectTarget('')
    setNewEffectSkillId('')
    setNewEffectValue(0)
    setShowEffectForm(false)
  }

  const removeStatusEffect = (effectId: string) => {
    updateCharacter(character.id, {
      statusEffects: (character.statusEffects ?? []).filter((e) => e.id !== effectId),
    })
  }

  const updateJournalEntry = (entryId: string, updates: Partial<JournalEntry>) => {
    updateCharacter(character.id, {
      journalEntries: (character.journalEntries ?? []).map((e) =>
        e.id === entryId ? { ...e, ...updates } : e
      ),
    })
  }

  const removeJournalEntry = (entryId: string) => {
    updateCharacter(character.id, {
      journalEntries: (character.journalEntries ?? []).filter((e) => e.id !== entryId),
    })
  }

  const tabs = [
    { id: 'combat' as Tab, label: 'Personaje', icon: Sword },
    { id: 'features' as Tab, label: 'Rasgos', icon: Layers },
    ...(isCaster ? [{ id: 'spells' as Tab, label: 'Hechizos', icon: Scroll }] : []),
    { id: 'inventory' as Tab, label: 'Inventario', icon: Package },
    { id: 'skills' as Tab, label: 'Habilidades', icon: Star },
    { id: 'feats' as Tab, label: 'Dotes', icon: BookOpen },
    { id: 'weapons' as Tab, label: 'Equipo', icon: Sword },
    { id: 'companion' as Tab, label: 'Compañero', icon: PawPrint },
    { id: 'notes' as Tab, label: 'Diario', icon: Eye },
  ]

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <Link to="/" className={styles.backLink}>
        <ArrowLeft size={20} />
        Volver
      </Link>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.titleText}>
            <h1>{character.name}</h1>
            <p className={styles.subtitle}>
              {character.race} · {character.classes.map(c => `${c.id} ${c.level}`).join('/')} · Nivel {character.level}
            </p>
          </div>
          <div className={styles.mobileHeaderControls}>
            <button
              type="button"
              className={styles.mobileIconBtn}
              onClick={() => { setMobileNotifOpen((v) => !v); setMobileActionsOpen(false) }}
              aria-label="Notificaciones del personaje"
              aria-expanded={mobileNotifOpen}
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className={`${styles.mobileBadge} ${warningCount > 0 ? styles.mobileBadgeWarn : ''}`}>
                  {notifications.length}
                </span>
              )}
            </button>
            <button
              type="button"
              className={styles.mobileIconBtn}
              onClick={() => { setMobileActionsOpen((v) => !v); setMobileNotifOpen(false) }}
              aria-label="Acciones del personaje"
              aria-expanded={mobileActionsOpen}
            >
              <Menu size={20} />
            </button>
          </div>
          <div
            className={`${styles.actions} ${mobileActionsOpen ? styles.actionsMobileOpen : ''}`}
            onClick={() => setMobileActionsOpen(false)}
          >
            <Link to={`/characters/${id}/play`}>
              <Button variant="primary">
                <Play size={18} />
                Modo Juego
              </Button>
            </Link>
            {!isEditing && (
              <Button
                variant={canLevelUpFromXp(character.level, character.xp, xpSpeed) ? 'primary' : 'secondary'}
                onClick={() => setShowLevelUp(true)}
                title={xpToNextLevel !== null
                  ? `Faltan ${xpToNextLevel.toLocaleString('es-ES')} XP para el siguiente nivel — Progresión ${XP_SPEED_LABELS[xpSpeed]}`
                  : 'Nivel máximo alcanzado'}
              >
                <TrendingUp size={18} />
                Subir de nivel
              </Button>
            )}
            <Button variant="secondary" onClick={handleExport} title="Exportar personaje como JSON">
              <Download size={18} />
            </Button>
            <Button
              variant={isEditing ? 'primary' : 'secondary'}
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 size={18} />
              {isEditing ? 'Guardar' : 'Editar'}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
      </header>

      <section
        className={`${styles.notificationPanel} ${notifications.length === 0 ? styles.notificationPanelClear : ''} ${mobileNotifOpen ? styles.notificationPanelMobileOpen : ''}`}
        onClick={() => setMobileNotifOpen(false)}
      >
        <div className={styles.notificationSummary}>
          <div className={styles.notificationIcon}>
            {notifications.length === 0 ? <Check size={18} /> : <Bell size={18} />}
          </div>
          <div>
            <h2 className={styles.notificationTitle}>
              {notifications.length === 0
                ? 'Ficha completa'
                : `${notifications.length} ${notifications.length === 1 ? 'pendiente' : 'pendientes'} por revisar`}
            </h2>
            <p className={styles.notificationSubtitle}>
              {notifications.length === 0
                ? 'No hay dotes, habilidades ni rasgos de clase pendientes.'
                : warningCount > 0
                ? `${warningCount} requieren atencion antes de dar la ficha por cerrada.`
                : 'Solo quedan ajustes informativos de la ficha.'}
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className={styles.notificationList}>
            {notifications.map((notice) => (
              <button
                key={notice.id}
                type="button"
                className={`${styles.notificationItem} ${notice.severity === 'warning' ? styles.notificationWarning : styles.notificationInfo}`}
                onClick={() => {
                  setActiveTab(notice.tab)
                  setIsEditing(true)
                }}
              >
                <AlertTriangle size={16} />
                <span className={styles.notificationText}>
                  <strong>{notice.title}</strong>
                  <span>{notice.detail}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── HP Banner ── */}
      <div className={styles.hpBanner}>
        <Card padding="md" className={styles.hpCardLarge}>
          <div className={styles.hpContent}>
            <Heart size={28} className={styles.hpIcon} />
            <div>
              <div className={styles.hpValues}>
                {isEditing ? (
                  <>
                    <input
                      className={styles.hpEditInput}
                      type="number"
                      min={0}
                      max={character.hp.max}
                      defaultValue={character.hp.current}
                      onBlur={(e) => updateCharacter(character.id, { hp: { ...character.hp, current: Math.max(0, Math.min(character.hp.max, parseInt(e.target.value) || 0)) } })}
                    />
                    <span className={styles.hpSeparator}>/</span>
                    <input
                      className={styles.hpEditInput}
                      type="number"
                      min={1}
                      defaultValue={character.hp.max}
                      onBlur={(e) => {
                        const newMax = Math.max(1, parseInt(e.target.value) || 1)
                        updateCharacter(character.id, { hp: { ...character.hp, max: newMax, current: Math.min(character.hp.current, newMax) } })
                      }}
                    />
                    <span className={styles.hpEditHint}>PV actual / máximo</span>
                  </>
                ) : (
                  <>
                    <span className={styles.hpCurrent}>{character.hp.current}</span>
                    <span className={styles.hpSeparator}>/</span>
                    <span className={styles.hpMax}>{effectiveMaxHp}</span>
                  </>
                )}
              </div>
              {/* HP Bar */}
              <div className={styles.hpBar}>
                <div className={styles.hpBarFill} style={{ width: `${hpPercent}%` }} />
              </div>
            </div>
            {!isEditing && (
              <div className={styles.hpControls}>
                <button className={styles.hpBtn} onClick={() => updateCharacter(character.id, { hp: { ...character.hp, current: Math.max(0, character.hp.current - 1) } })}>−1</button>
                <button className={styles.hpBtn} onClick={() => updateCharacter(character.id, { hp: { ...character.hp, current: Math.max(0, character.hp.current - 5) } })}>−5</button>
                <button className={styles.hpBtn} onClick={() => updateCharacter(character.id, { hp: { ...character.hp, current: Math.min(effectiveMaxHp, character.hp.current + 1) } })}>+1</button>
                <button className={styles.hpBtn} onClick={() => updateCharacter(character.id, { hp: { ...character.hp, current: Math.min(effectiveMaxHp, character.hp.current + 5) } })}>+5</button>
              </div>
            )}
          </div>
        </Card>

        <div className={styles.quickStats}>
          <div className={styles.quickStat}>
            <Shield size={18} />
            <span className={styles.quickStatValue}>{ac}</span>
            <span className={styles.quickStatLabel}>CA</span>
          </div>
          <div className={styles.quickStat}>
            <Zap size={18} />
            <span className={styles.quickStatValue}>{initiative >= 0 ? '+' : ''}{initiative}</span>
            <span className={styles.quickStatLabel}>Inic.</span>
          </div>
          <div className={styles.quickStat}>
            <Sword size={18} />
            <span className={styles.quickStatValue}>+{bab}</span>
            <span className={styles.quickStatLabel}>BAB</span>
          </div>
          <div className={styles.quickStat}>
            <Star size={18} />
            <span className={styles.quickStatValue}>{speed}ft</span>
            <span className={styles.quickStatLabel}>Vel.</span>
          </div>
          <div
            className={styles.quickStat}
            title={xpToNextLevel !== null
              ? `Faltan ${xpToNextLevel.toLocaleString('es-ES')} XP para el siguiente nivel — Progresión ${XP_SPEED_LABELS[xpSpeed]}`
              : `Nivel máximo — Progresión ${XP_SPEED_LABELS[xpSpeed]}`}
          >
            <TrendingUp size={18} />
            {isEditing ? (
              <input
                className={styles.quickStatInput}
                type="number"
                min={0}
                value={character.xp}
                onChange={(e) => updateCharacter(character.id, { xp: Math.max(0, parseInt(e.target.value) || 0) })}
              />
            ) : (
              <span className={styles.quickStatValue}>{character.xp.toLocaleString('es-ES')}</span>
            )}
            <span className={styles.quickStatLabel}>XP</span>
            {xpToNextLevel !== null && <span className={styles.quickStatSub}>faltan {xpToNextLevel.toLocaleString('es-ES')}</span>}
          </div>
        </div>
      </div>

      {/* ── Menú flotante de secciones ── */}
      {tabMenuOpen && (
        <>
          <div className={styles.tabMenuOverlay} onClick={() => setTabMenuOpen(false)} />
          <div className={styles.tabMenuFloating}>
            <div className={styles.tabMenuGrid}>
              {tabs.map(({ id: tabId, label, icon: Icon }, idx) => (
                <button
                  key={tabId}
                  className={`${styles.tabMenuItem} ${activeTab === tabId ? styles.tabMenuItemActive : ''} ${idx === 0 && tabs.length % 2 !== 0 ? styles.tabMenuItemWide : ''}`}
                  onClick={() => { setActiveTab(tabId); setTabMenuOpen(false) }}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Control fijo inferior-derecha: acceso al menú de secciones (solo tablet/móvil) ── */}
      <div className={styles.fabCluster}>
        <button
          className={`${styles.fabBtn} ${tabMenuOpen ? styles.fabBtnActive : ''}`}
          onClick={() => setTabMenuOpen(!tabMenuOpen)}
          title="Secciones"
        >
          <LayoutGrid size={18} />
        </button>
      </div>

      {/* ── Columna fija al lado derecho con las secciones y las notificaciones (solo PC) ──
          Ocupa toda la altura disponible; las notificaciones viven aquí en vez de en la
          ficha, así que en desktop `.notificationPanel` queda oculto por CSS. ── */}
      <nav className={styles.sideNav} aria-label="Secciones del personaje">
        <div className={styles.sideNavTabs}>
          {tabs.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              className={`${styles.sideNavItem} ${activeTab === tabId ? styles.sideNavItemActive : ''}`}
              onClick={() => setActiveTab(tabId)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className={styles.sideNavDivider} />

        <div className={styles.sideNavNotifications}>
          <div className={styles.sideNavNotifSummary}>
            <div className={styles.sideNavNotifIcon}>
              {notifications.length === 0 ? <Check size={16} /> : <Bell size={16} />}
            </div>
            <div>
              <h2 className={styles.sideNavNotifTitle}>
                {notifications.length === 0
                  ? 'Ficha completa'
                  : `${notifications.length} ${notifications.length === 1 ? 'pendiente' : 'pendientes'}`}
              </h2>
              <p className={styles.sideNavNotifSubtitle}>
                {notifications.length === 0
                  ? 'Sin dotes, habilidades ni rasgos pendientes.'
                  : warningCount > 0
                  ? `${warningCount} requieren atención.`
                  : 'Solo ajustes informativos.'}
              </p>
            </div>
          </div>

          {notifications.length > 0 && (
            <div className={styles.sideNavNotifList}>
              {notifications.map((notice) => (
                <button
                  key={notice.id}
                  type="button"
                  className={`${styles.sideNavNotifItem} ${notice.severity === 'warning' ? styles.notificationWarning : styles.notificationInfo}`}
                  onClick={() => {
                    setActiveTab(notice.tab)
                    setIsEditing(true)
                  }}
                >
                  <AlertTriangle size={14} />
                  <span className={styles.sideNavNotifText}>
                    <strong>{notice.title}</strong>
                    <span>{notice.detail}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── Level Up Modal ── */}
      {showLevelUp && (
        <LevelUpModal
          character={character}
          onClose={() => setShowLevelUp(false)}
          onConfirm={(updates: LevelUpUpdates) => {
            const syncedSlots = computeSyncedSpellSlots(
              updates.newClassLevels,
              updates.newAbilities,
              character.spellSlots ?? {}
            )
            updateCharacter(character.id, {
              level: updates.newLevel,
              classes: updates.newClassLevels,
              abilities: updates.newAbilities,
              skills: updates.newSkills,
              feats: updates.newFeats,
              spells: updates.newSpells,
              hp: {
                ...character.hp,
                max: character.hp.max + updates.hpGained,
                current: character.hp.current + updates.hpGained,
              },
              levelHistory: [...(character.levelHistory ?? []), updates.levelChoice],
              ...(syncedSlots && { spellSlots: syncedSlots }),
            })
            setShowLevelUp(false)
          }}
        />
      )}

      {/* ── Tab Content ── */}
      <div className={styles.tabContent}>

        {/* ══ PERSONAJE (combat) ══ */}
        {activeTab === 'combat' && (
          <div className={styles.combatTab}>
            {/* Abilities */}
            <Card padding="md">
              <h3 className={styles.sectionTitle}>Atributos</h3>
              <div className={styles.abilityGrid}>
                {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map((attr) => {
                  const value = abilities[attr]
                  const mod = calculateModifier(value)
                  return (
                    <div key={attr} className={styles.abilityBlock}>
                      <span className={styles.abilityAbbr}>{ABILITY_ABBR[attr]}</span>
                      {isEditing ? (
                        <input
                          className={styles.abilityEditInput}
                          type="number"
                          min={1}
                          max={30}
                          defaultValue={value}
                          onBlur={(e) => {
                            const v = Math.max(1, Math.min(30, parseInt(e.target.value) || 1))
                            updateCharacter(character.id, { abilities: { ...character.abilities, [attr]: v } })
                          }}
                        />
                      ) : (
                        <span className={styles.abilityScore}>{value}</span>
                      )}
                      <span className={`${styles.abilityMod} ${mod >= 0 ? styles.positive : styles.negative}`}>
                        {getModifierString(value)}
                      </span>
                    </div>
                  )
                })}
              </div>
              {hasFloatingRaceBonus && (
                <div className={styles.manualCorrectionBar}>
                  <label className={styles.manualCorrectionToggle}>
                    +2 racial ({raceData?.label}) a:
                    {isEditing ? (
                      <select
                        value={character.raceAbilityChoice ?? ''}
                        onChange={(e) => updateCharacter(character.id, {
                          raceAbilityChoice: (e.target.value || undefined) as typeof character.raceAbilityChoice,
                        })}
                      >
                        <option value="">Sin elegir</option>
                        {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map((attr) => (
                          <option key={attr} value={attr}>{ABILITY_ABBR[attr]}</option>
                        ))}
                      </select>
                    ) : (
                      <span>{character.raceAbilityChoice ? ABILITY_ABBR[character.raceAbilityChoice] : 'Sin elegir'}</span>
                    )}
                  </label>
                </div>
              )}
            </Card>

            {/* Saves */}
            <Card padding="md">
              <h3 className={styles.sectionTitle}>Tiros de Salvación</h3>
              <div className={styles.savesGrid}>
                {[
                  { label: 'Fort', full: 'Fortaleza', val: fortitude, abbr: 'CON' },
                  { label: 'Ref', full: 'Reflejos', val: reflex, abbr: 'DES' },
                  { label: 'Vol', full: 'Voluntad', val: will, abbr: 'SAB' },
                ].map(({ label, full, val, abbr }) => (
                  <div key={label} className={styles.saveBlock} title={full}>
                    <span className={styles.abilityAbbr}>{label}</span>
                    <span className={`${styles.abilityScore} ${val >= 0 ? styles.positive : styles.negative}`}>
                      {val >= 0 ? '+' : ''}{val}
                    </span>
                    <span className={styles.abilityAbbr}>{abbr}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Combat Stats */}
            <Card padding="md" className={styles.sectionCombatStats}>
              <h3 className={styles.sectionTitle}>Estadísticas de Combate</h3>
              <div className={styles.combatStats}>
                {[
                  { label: 'CA', val: ac },
                  { label: 'Toque', val: acTouch },
                  { label: 'Desprevenido', val: acFlat },
                  { label: 'Iniciativa', val: `${initiative >= 0 ? '+' : ''}${initiative}` },
                  { label: 'BAB', val: `+${bab}` },
                  { label: 'CMB', val: `${cmb >= 0 ? '+' : ''}${cmb}` },
                  { label: 'CMD', val: cmd },
                  { label: 'Velocidad', val: `${speed} ft` },
                ].map(({ label, val }) => (
                  <div key={label} className={styles.combatStat}>
                    <span className={styles.combatLabel}>{label}</span>
                    <span className={styles.combatValue}>{val}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Class Progression */}
            {character.classes.length > 0 && (() => {
              const activeClassEntry = character.classes.find((c) => c.id === progressionTab) ?? character.classes[0]
              const activeClassData = getClassById(activeClassEntry.id)
              return (
                <Card padding="md" className={styles.colSpan2}>
                  <h3 className={styles.sectionTitle}>Progresión de Clase</h3>
                  {isEditing ? (
                    <div className={styles.classLevelEditor}>
                      <div className={styles.manualCorrectionBar}>
                        <label className={styles.manualCorrectionToggle}>
                          Clase predilecta:
                          <select
                            value={character.favoredClassId ?? ''}
                            onChange={(e) => updateCharacter(character.id, { favoredClassId: e.target.value || undefined })}
                          >
                            <option value="">Ninguna</option>
                            {character.classes.map((cc) => (
                              <option key={cc.id} value={cc.id}>{getClassById(cc.id)?.name ?? cc.id}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className={styles.manualCorrectionBar}>
                        <label className={styles.manualCorrectionToggle}>
                          <input
                            type="checkbox"
                            checked={manualCorrectionMode}
                            onChange={(e) => setManualCorrectionMode(e.target.checked)}
                          />
                          Corrección manual de nivel
                        </label>
                        {manualCorrectionMode && (
                          <span className={styles.manualCorrectionWarning}>
                            No otorga PG, puntos de habilidad, dotes ni aumentos de característica. Usa «Subir de nivel» para el flujo normal.
                          </span>
                        )}
                      </div>
                      {character.classes.map((cc) => {
                        const cd = getClassById(cc.id)
                        const currentArchetypes = archetypesByClassId[cc.id] ?? []
                        return (
                          <div key={cc.id} className={styles.classLevelRow}>
                            <span className={styles.classLevelName}>{cd?.name ?? cc.id}</span>
                            <div className={styles.classLevelControls}>
                              <button
                                className={styles.classLevelBtn}
                                onClick={() => {
                                  if (cc.level <= 1 && character.classes.length === 1) return
                                  const newClasses = cc.level <= 1
                                    ? character.classes.filter((c) => c.id !== cc.id)
                                    : character.classes.map((c) => c.id === cc.id ? { ...c, level: c.level - 1 } : c)
                                  const newTotal = newClasses.reduce((s, c) => s + c.level, 0)
                                  updateCharacter(character.id, { classes: newClasses, level: newTotal })
                                }}
                                disabled={!manualCorrectionMode || (cc.level <= 1 && character.classes.length === 1)}
                              >−</button>
                              <span className={styles.classLevelValue}>{cc.level}</span>
                              <button
                                className={styles.classLevelBtn}
                                onClick={() => {
                                  const newClasses = character.classes.map((c) => c.id === cc.id ? { ...c, level: c.level + 1 } : c)
                                  const newTotal = newClasses.reduce((s, c) => s + c.level, 0)
                                  updateCharacter(character.id, { classes: newClasses, level: newTotal })
                                }}
                                disabled={!manualCorrectionMode}
                              >+</button>
                            </div>
                            <div className={styles.archetypeEditRow}>
                              <ArchetypeSelector
                                classId={cc.id}
                                value={cc.archetypeIds ?? []}
                                onChange={(newArchIds) => {
                                  const newClasses = character.classes.map((c) =>
                                    c.id === cc.id ? { ...c, archetypeIds: newArchIds } : c
                                  )
                                  updateCharacter(character.id, { classes: newClasses })
                                }}
                              />
                              {currentArchetypes.length > 0 && cd && (
                                <button
                                  className={styles.recalcBtn}
                                  onClick={() => {
                                    const resolvedSkills = resolveClassSkills(cd, currentArchetypes)
                                    const updatedSkills = character.skills.filter((sk) =>
                                      resolvedSkills.includes(sk.id) || (sk.ranks ?? 0) > 0
                                    )
                                    updateCharacter(character.id, { skills: updatedSkills })
                                  }}
                                  title="Actualiza habilidades de clase según los arquetipos"
                                >
                                  Recalcular
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    character.classes.length > 1 && (
                      <div className={styles.tabs}>
                        {character.classes.map((cc) => {
                          const cd = getClassById(cc.id)
                          return (
                            <button
                              key={cc.id}
                              className={`${styles.tab} ${progressionTab === cc.id ? styles.activeTab : ''}`}
                              onClick={() => setProgressionTab(cc.id)}
                            >
                              {cd?.name ?? cc.id}
                              <span style={{ opacity: 0.6, fontSize: '0.85em' }}> Nv {cc.level}</span>
                            </button>
                          )
                        })}
                      </div>
                    )
                  )}
                  {!isEditing && activeClassData && (
                    <ClassProgressionTable
                      classData={activeClassData}
                      currentLevel={activeClassEntry.level}
                      archetypes={archetypesByClassId[activeClassEntry.id] ?? []}
                    />
                  )}
                </Card>
              )
            })()}

            {/* Cleric Domains */}
            {character.classes.some(c => c.id === 'cleric') && (
              <Card padding="md" className={styles.colSpan2}>
                <h3 className={styles.sectionTitle}>Dominios</h3>
                {isEditing && (
                  <div className={styles.channelTypeRow}>
                    <span className={styles.channelTypeLabel}>Canal de Energía:</span>
                    <button
                      className={`${styles.channelTypeBtn} ${(!character.channelType || character.channelType === 'positive') ? styles.channelTypeActive : ''}`}
                      onClick={() => updateCharacter(character.id, { channelType: 'positive' })}
                    >
                      Positivo (cura vivos)
                    </button>
                    <button
                      className={`${styles.channelTypeBtn} ${character.channelType === 'negative' ? styles.channelTypeActive : ''}`}
                      onClick={() => updateCharacter(character.id, { channelType: 'negative' })}
                    >
                      Negativo (daña vivos)
                    </button>
                  </div>
                )}
                <DomainPicker
                  selected={character.selectedDomains ?? []}
                  onChange={(ids) => updateCharacter(character.id, { selectedDomains: ids })}
                  characterLevel={character.classes.find(c => c.id === 'cleric')?.level ?? 1}
                  wisdomMod={Math.floor((character.abilities.wisdom - 10) / 2)}
                  disabled={!isEditing}
                />
              </Card>
            )}

            {/* Warpriest Blessings */}
            {character.classes.some(c => c.id === 'warpriest') && (
              <Card padding="md" className={styles.colSpan2}>
                <h3 className={styles.sectionTitle}>Bendiciones</h3>
                <BlessingPicker
                  selected={character.selectedBlessings ?? []}
                  onChange={(ids) => updateCharacter(character.id, { selectedBlessings: ids })}
                  characterLevel={character.classes.find(c => c.id === 'warpriest')?.level ?? 1}
                  disabled={!isEditing}
                />
              </Card>
            )}

            {/* Status Effects */}
            <Card padding="md" className={styles.alignStart}>
              <div className={styles.sectionHeaderRow}>
                <h3 className={styles.sectionTitle}>Efectos</h3>
                <button
                  className={styles.addEffectBtn}
                  onClick={() => setShowEffectForm(!showEffectForm)}
                >
                  <PlusCircle size={15} />
                  Añadir
                </button>
              </div>
              <div className={styles.negativeLevelsRow}>
                <div>
                  <span className={styles.effectName}>Niveles negativos</span>
                  <span className={styles.effectDesc}>-1 a ataques, salvaciones, habilidades, CMB/CMD e iniciativa; -5 PV max. por nivel.</span>
                </div>
                {isEditing ? (
                  <input
                    className={styles.effectValueInput}
                    type="number"
                    min={0}
                    max={20}
                    value={character.negativeLevels ?? 0}
                    onChange={(e) => updateCharacter(character.id, { negativeLevels: Math.max(0, Math.min(20, parseInt(e.target.value) || 0)) })}
                  />
                ) : (
                  <span className={styles.effectBonusNeg}>{character.negativeLevels ?? 0}</span>
                )}
              </div>
              {showEffectForm && (
                <div className={styles.effectForm}>
                  <input
                    className={styles.effectInput}
                    placeholder="Nombre del efecto (ej: Bendición)"
                    value={newEffectName}
                    onChange={(e) => setNewEffectName(e.target.value)}
                  />
                  <input
                    className={styles.effectInput}
                    placeholder="Descripción (opcional)"
                    value={newEffectDesc}
                    onChange={(e) => setNewEffectDesc(e.target.value)}
                  />
                  <input
                    className={styles.effectInput}
                    placeholder="Duración (ej: 3 rondas)"
                    value={newEffectDuration}
                    onChange={(e) => setNewEffectDuration(e.target.value)}
                  />
                  <div className={styles.effectBonusRow}>
                    <select
                      className={styles.effectSelect}
                      value={newEffectTarget}
                      onChange={(e) => { setNewEffectTarget(e.target.value as BonusTarget | 'skill' | ''); setNewEffectSkillId('') }}
                    >
                      <option value="">Sin bonificador</option>
                      <option value="attack">Ataque</option>
                      <option value="damage">Daño</option>
                      <option value="ac">CA</option>
                      <option value="fort">Fortaleza</option>
                      <option value="ref">Reflejos</option>
                      <option value="will">Voluntad</option>
                      <option value="initiative">Iniciativa</option>
                      <option value="cmb">CMB</option>
                      <option value="cmd">CMD</option>
                      <option value="skill">Habilidad específica…</option>
                    </select>
                    {newEffectTarget === 'skill' && (
                      <select
                        className={styles.effectSelect}
                        value={newEffectSkillId}
                        onChange={(e) => setNewEffectSkillId(e.target.value)}
                      >
                        <option value="">Selecciona habilidad</option>
                        {[...SKILLS].sort((a, b) => a.name.localeCompare(b.name)).map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                    {newEffectTarget && (
                      <input
                        className={styles.effectValueInput}
                        type="number"
                        placeholder="+2"
                        value={newEffectValue === 0 ? '' : newEffectValue}
                        onChange={(e) => setNewEffectValue(parseInt(e.target.value) || 0)}
                      />
                    )}
                  </div>
                  <div className={styles.effectFormActions}>
                    <Button variant="primary" size="sm" onClick={addStatusEffect}>Añadir</Button>
                    <Button variant="secondary" size="sm" onClick={() => setShowEffectForm(false)}>Cancelar</Button>
                  </div>
                </div>
              )}
              {(character.statusEffects ?? []).length === 0 && !showEffectForm && (
                <p className={styles.emptyEffects}>Sin efectos</p>
              )}
              {(character.statusEffects ?? []).length > 0 && (
                <ul className={styles.effectsList}>
                  {(character.statusEffects ?? []).map((effect) => {
                    const BONUS_LABELS: Record<string, string> = {
                      attack: 'Ataque', damage: 'Daño', ac: 'CA',
                      fort: 'Fortaleza', ref: 'Reflejos', will: 'Voluntad',
                      initiative: 'Iniciativa', cmb: 'CMB', cmd: 'CMD',
                    }
                    const targetLabel = effect.bonusTarget
                      ? effect.bonusTarget.startsWith('skill:')
                        ? SKILLS.find((s) => s.id === effect.bonusTarget!.replace('skill:', ''))?.name ?? effect.bonusTarget.replace('skill:', '')
                        : BONUS_LABELS[effect.bonusTarget] ?? effect.bonusTarget
                      : null
                    const isActive = effect.active !== false
                    const isEditing = editingEffectId === effect.id

                    const startEdit = () => {
                      setEditingEffectId(effect.id)
                      setEditName(effect.name)
                      setEditDesc(effect.description ?? '')
                      setEditDuration(effect.duration ?? '')
                      if (effect.bonusTarget?.startsWith('skill:')) {
                        setEditTarget('skill')
                        setEditSkillId(effect.bonusTarget.replace('skill:', ''))
                      } else {
                        setEditTarget(effect.bonusTarget ?? '')
                        setEditSkillId('')
                      }
                      setEditValue(effect.bonusValue ?? 0)
                    }

                    const saveEdit = () => {
                      const resolvedTarget: BonusTarget | undefined =
                        editTarget === 'skill'
                          ? editSkillId ? (`skill:${editSkillId}` as BonusTarget) : undefined
                          : editTarget || undefined
                      updateCharacter(character.id, {
                        statusEffects: (character.statusEffects ?? []).map((e) =>
                          e.id !== effect.id ? e : {
                            ...e,
                            name: editName.trim() || e.name,
                            description: editDesc.trim(),
                            duration: editDuration.trim() || undefined,
                            bonusTarget: resolvedTarget,
                            bonusValue: resolvedTarget !== undefined ? editValue : undefined,
                          }
                        )
                      })
                      setEditingEffectId(null)
                    }

                    return (
                      <li key={effect.id} className={`${styles.effectItem} ${!isActive ? styles.effectItemDisabled : ''}`}>
                        {isEditing ? (
                          <div className={styles.effectEditInline}>
                            <input className={styles.effectInput} value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nombre" />
                            <input className={styles.effectInput} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Descripción" />
                            <input className={styles.effectInput} value={editDuration} onChange={(e) => setEditDuration(e.target.value)} placeholder="Duración" />
                            <div className={styles.effectBonusRow}>
                              <select className={styles.effectSelect} value={editTarget} onChange={(e) => { setEditTarget(e.target.value as BonusTarget | 'skill' | ''); setEditSkillId('') }}>
                                <option value="">Sin bonificador</option>
                                <option value="attack">Ataque</option>
                                <option value="damage">Daño</option>
                                <option value="ac">CA</option>
                                <option value="fort">Fortaleza</option>
                                <option value="ref">Reflejos</option>
                                <option value="will">Voluntad</option>
                                <option value="initiative">Iniciativa</option>
                                <option value="cmb">CMB</option>
                                <option value="cmd">CMD</option>
                                <option value="skill">Habilidad específica…</option>
                              </select>
                              {editTarget === 'skill' && (
                                <select className={styles.effectSelect} value={editSkillId} onChange={(e) => setEditSkillId(e.target.value)}>
                                  <option value="">Selecciona habilidad</option>
                                  {[...SKILLS].sort((a, b) => a.name.localeCompare(b.name)).map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
                              )}
                              {editTarget && (
                                <input className={styles.effectValueInput} type="number" value={editValue === 0 ? '' : editValue} onChange={(e) => setEditValue(parseInt(e.target.value) || 0)} placeholder="+2" />
                              )}
                            </div>
                            <div className={styles.effectEditActions}>
                              <Button variant="primary" size="sm" onClick={saveEdit}><Check size={13} /> Guardar</Button>
                              <Button variant="secondary" size="sm" onClick={() => setEditingEffectId(null)}>Cancelar</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={styles.effectItemRow}>
                              <button
                                className={`${styles.effectToggleBtn} ${isActive ? styles.effectToggleOn : styles.effectToggleOff}`}
                                onClick={() => updateCharacter(character.id, {
                                  statusEffects: (character.statusEffects ?? []).map((e) =>
                                    e.id === effect.id ? { ...e, active: !isActive } : e
                                  )
                                })}
                                title={isActive ? 'Desactivar' : 'Activar'}
                              >
                                <Power size={13} />
                              </button>
                              <div className={styles.effectItemBody}>
                                <span className={styles.effectName}>{effect.name}</span>
                                {targetLabel && effect.bonusValue !== undefined && (
                                  <span className={effect.bonusValue >= 0 ? styles.effectBonusPos : styles.effectBonusNeg}>
                                    {effect.bonusValue >= 0 ? `+${effect.bonusValue}` : effect.bonusValue} {targetLabel}
                                  </span>
                                )}
                                {effect.duration && <span className={styles.effectDuration}>{effect.duration}</span>}
                                {effect.description && <span className={styles.effectDesc}>{effect.description}</span>}
                              </div>
                              <div className={styles.effectItemActions}>
                                <button className={styles.effectEditBtn} onClick={startEdit} title="Editar"><Pencil size={13} /></button>
                                <button className={styles.effectRemove} onClick={() => removeStatusEffect(effect.id)} title="Eliminar"><X size={13} /></button>
                              </div>
                            </div>
                          </>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </Card>
          </div>
        )}

        {/* ══ RASGOS Y CARACTERÍSTICAS ══ */}
        {activeTab === 'features' && (
          <Card padding="md">
            <h3 className={styles.sectionTitle}>Características y Rasgos</h3>
            <FeaturesTraitsPanel
              classes={character.classes}
              race={character.race}
              feats={character.feats}
              archetypesByClassId={archetypesByClassId}
              allFeats={FEATS}
            />
          </Card>
        )}

        {/* ══ HABILIDADES ══ */}
        {activeTab === 'skills' && (
          <Card padding="md">
            <div className={styles.sectionHeaderRow}>
              <h3 className={styles.sectionTitle}>Habilidades</h3>
            </div>
            {isEditing ? (
              <SkillsList
                ranks={character.skills}
                onChange={(skills) => updateCharacter(character.id, { skills })}
                abilities={abilities}
                classes={character.classes}
                race={character.race}
                level={character.level}
                skillPointsAvailable={computeSkillPointsAvailable(character, character.skills.reduce((sum, s) => sum + s.ranks, 0))}
                equippedArmorAcp={equippedArmorAcp}
                encumbrancePenalty={encumbrancePenalty}
                resolvedStats={resolvedStats}
                archetypesByClassId={archetypesByClassId}
              />
            ) : (
              <div className={styles.skillsTable}>
                <div className={styles.skillsTableHeader}>
                  <span>Habilidad</span>
                  <span>Atr.</span>
                  <span>Rango</span>
                  <span>Total</span>
                </div>
                {SKILLS.map((skill) => {
                  const rankEntry = character.skills.find((s) => s.id === skill.id)
                  const ranks = rankEntry?.ranks ?? 0
                  const isClass = isClassSkillForCharacter({ ...character, archetypesByClassId }, skill.id)
                  const total = computeSkillTotal({ ...character, archetypesByClassId }, skill, resolvedStats, equippedArmorAcp, encumbrancePenalty)
                  return (
                    <div
                      key={skill.id}
                      className={`${styles.skillRow} ${ranks > 0 ? styles.skillRowActive : ''}`}
                    >
                      <span className={styles.skillName}>
                        {skill.name}
                        {isClass && <span className={styles.classSkillDot} title="Habilidad de clase" />}
                      </span>
                      <span className={styles.skillAbility}>{ABILITY_ABBR[skill.ability]}</span>
                      <span className={styles.skillRanks}>{ranks}</span>
                      <span className={`${styles.skillTotal} ${total > 0 ? styles.positive : ''}`}>
                        {total >= 0 ? '+' : ''}{total}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        )}

        {/* ══ DOTES ══ */}
        {activeTab === 'feats' && (
          <Card padding="md">
            <div className={styles.sectionHeaderRow}>
              <h3 className={styles.sectionTitle}>Dotes ({character.feats.filter((f) => getFeatOrigin(f) === 'level').length}/{expectedFeats})</h3>
            </div>
            {isEditing ? (
              <FeatsSelector
                selectedFeats={character.feats}
                countOrigin="level"
                onAdd={(featId, specification) => {
                  updateCharacter(character.id, { feats: [...character.feats, { id: featId, specification }] })
                }}
                onRemove={(index) => {
                  updateCharacter(character.id, { feats: character.feats.filter((_, i) => i !== index) })
                }}
                onSetOrigin={(index, origin) => {
                  updateCharacter(character.id, {
                    feats: character.feats.map((f, i) => i === index ? { ...f, origin } : f),
                  })
                }}
              />
            ) : (
              character.feats.length === 0 ? (
                <p className={styles.editHint}>Sin dotes seleccionadas. Pulsa Editar para añadir.</p>
              ) : (
                <div className={styles.featsReadGrid}>
                  {character.feats.map((cf, idx) => {
                    const feat = FEATS.find((f) => f.id === cf.id)
                    if (!feat) return null
                    return (
                      <div key={idx} className={styles.featReadCard}>
                        <div className={styles.featReadHeader}>
                          <span className={styles.featReadName}>
                            {feat.name}{cf.specification ? ` (${cf.specification})` : ''}
                          </span>
                          <span className={styles.featReadType}>{feat.type}</span>
                          <span className={styles.featReadOrigin}>{FEAT_ORIGIN_LABELS[getFeatOrigin(cf)]}</span>
                        </div>
                        <p className={styles.featReadBenefit}>{feat.benefit}</p>
                      </div>
                    )
                  })}
                </div>
              )
            )}
          </Card>
        )}

        {/* ══ EQUIPO ══ */}
        {activeTab === 'weapons' && (
          <Card padding="md">
            <h3 className={styles.sectionTitle}>Equipo</h3>
            <ArsenalManager
              weapons={character.weapons || []}
              armor={character.armor ?? []}
              bab={bab}
              strMod={combat.strMod}
              dexMod={combat.dexMod}
              sizeMod={combat.sizeMod}
              ac={ac}
              resolvedStats={resolvedStats}
              negativeLevelPenalty={combat.negativeLevelPenalty}
              onWeaponsChange={(weapons) => updateCharacter(character.id, { weapons })}
              onArmorChange={(armor) => updateCharacter(character.id, { armor })}
              inventory={character.inventory ?? []}
              equippedSlots={character.equippedSlots ?? []}
              customSlots={character.customSlots ?? []}
              onEquippedSlotsChange={(equippedSlots) => updateCharacter(character.id, { equippedSlots })}
              onCustomSlotsChange={(customSlots) => updateCharacter(character.id, { customSlots })}
            />
          </Card>
        )}

        {/* ══ INVENTARIO ══ */}
        {activeTab === 'inventory' && (
          <Card padding="md">
            <h3 className={styles.sectionTitle}>Inventario</h3>
            <InventoryManager
              items={character.inventory}
              gold={character.coins.gp}
              silver={character.coins.sp}
              copper={character.coins.cp}
              platinum={character.coins.pp}
              onChangeItems={(inventory) => updateCharacter(character.id, { inventory })}
              onChangeCoins={(coins) => updateCharacter(character.id, { coins })}
              carryCapacity={getCarryingCapacity(abilities.strength)}
              encumbrance={getEncumbranceLevel(totalWeight, abilities.strength)}
            />
          </Card>
        )}

        {/* ══ HECHIZOS ══ */}
        {activeTab === 'spells' && (
          <Card padding="md">
            <h3 className={styles.sectionTitle}>Libro de Hechizos</h3>
            <Spellbook
              knownSpells={character.spells}
              preparedSpells={character.preparedSpells ?? []}
              spellSlots={character.spellSlots || {}}
              abilityModifier={calculateModifier(abilities[casterAbility])}
              classIds={character.classes.map((c) => c.id)}
              classes={character.classes}
              onToggleKnown={(spellId) => {
                const newSpells = character.spells.includes(spellId)
                  ? character.spells.filter((s) => s !== spellId)
                  : [...character.spells, spellId]
                updateCharacter(character.id, { spells: newSpells })
              }}
              onTogglePrepared={(spellId) => {
                const prepared = character.preparedSpells ?? []
                const idx = prepared.indexOf(spellId)
                const newPrepared = idx >= 0
                  ? [...prepared.slice(0, idx), ...prepared.slice(idx + 1)]
                  : [...prepared, spellId]
                updateCharacter(character.id, { preparedSpells: newPrepared })
              }}
              isEditing={isEditing}
              onToggleSlotPip={(level: SpellLevel, pipIndex: number) => {
                const slots = { ...(character.spellSlots ?? {}) }
                const slot = slots[level] ?? { max: 0, used: 0 }
                const newUsed = pipIndex < slot.used
                  ? slot.used - 1
                  : Math.min(slot.used + 1, slot.max)
                updateCharacter(character.id, { spellSlots: { ...slots, [level]: { ...slot, used: newUsed } } })
              }}
              onLongRest={() => {
                const slots = { ...(character.spellSlots ?? {}) }
                Object.keys(slots).forEach((k) => {
                  slots[Number(k)] = { ...slots[Number(k)], used: 0 }
                })
                updateCharacter(character.id, {
                  spellSlots: slots,
                  preparedSpells: [],
                  classFeatureUses: {},
                })
              }}
              onSyncSlots={() => {
                const syncedSlots = computeSyncedSpellSlots(
                  character.classes,
                  character.abilities,
                  character.spellSlots ?? {}
                )
                if (syncedSlots) updateCharacter(character.id, { spellSlots: syncedSlots })
              }}
              onSetSlotMax={(level: SpellLevel, max: number) => {
                const slots = { ...(character.spellSlots ?? {}) }
                slots[level] = { max, used: Math.min(slots[level]?.used ?? 0, max) }
                updateCharacter(character.id, { spellSlots: slots })
              }}
            />
          </Card>
        )}

        {/* ══ COMPAÑERO ══ */}
        {activeTab === 'companion' && (
          <Card padding="md">
            <h3 className={styles.sectionTitle}>Compañero Animal</h3>
            <AnimalCompanion
              companion={character.companion}
              isEditing={isEditing}
              onChange={(companion) => updateCharacter(character.id, { companion })}
            />
          </Card>
        )}

        {/* ══ DIARIO ══ */}
        {activeTab === 'notes' && (
          <div className={styles.journalTab}>
            <div className={styles.journalHeader}>
              <div>
                <h3 className={styles.journalTitle}>Diario de Campaña</h3>
                <p className={styles.journalSubtitle}>Registra tus aventuras, aliados y lugares descubiertos.</p>
              </div>
              {isEditing && (
                <Button variant="primary" size="sm" onClick={() => { setNewJournalContent(''); setShowJournalModal(true) }}>
                  <PlusCircle size={16} />
                  Nueva Entrada
                </Button>
              )}
            </div>

            {/* Journal creation modal */}
            {showJournalModal && (
              <div className={styles.modalOverlay} onClick={() => setShowJournalModal(false)}>
                <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Nueva Entrada de Diario</h3>
                    <button className={styles.modalClose} onClick={() => setShowJournalModal(false)}><X size={18} /></button>
                  </div>
                  <div className={styles.modalBody}>
                    <textarea
                      className={styles.journalTextarea}
                      value={newJournalContent}
                      onChange={(e) => setNewJournalContent(e.target.value)}
                      placeholder="Narra los eventos de esta sesión..."
                      rows={8}
                      autoFocus
                    />
                  </div>
                  <div className={styles.modalFooter}>
                    <Button variant="ghost" onClick={() => setShowJournalModal(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={() => {
                      const now = new Date()
                      const months = ['Abadius', 'Calistril', 'Pharast', 'Gozran', 'Desnus', 'Sarenith',
                        'Erastus', 'Arodus', 'Rova', 'Lamashan', 'Neth', 'Kuthona']
                      const fantasyDate = `${now.getDate()} de ${months[now.getMonth()]}, ${4700 + now.getFullYear() - 2024} RA`
                      const realDate = now.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      const entry = {
                        id: generateId(),
                        date: `${fantasyDate} (${realDate})`,
                        content: newJournalContent.trim(),
                        importantCharacters: [],
                        discoveredPlaces: [],
                      }
                      updateCharacter(character.id, { journalEntries: [...(character.journalEntries ?? []), entry] })
                      setExpandedJournalEntry(entry.id)
                      setShowJournalModal(false)
                      setNewJournalContent('')
                    }}>
                      Crear Entrada
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Legacy notes */}
            {character.notes && (character.journalEntries ?? []).length === 0 && (
              <Card padding="md">
                <h4 className={styles.legacyNotesTitle}>Notas anteriores</h4>
                {isEditing ? (
                  <textarea
                    className={styles.notesTextarea}
                    value={character.notes}
                    onChange={(e) => updateCharacter(character.id, { notes: e.target.value })}
                    rows={8}
                  />
                ) : (
                  <p className={styles.notesDisplay}>{character.notes}</p>
                )}
              </Card>
            )}

            {/* Journal entries */}
            {(character.journalEntries ?? []).length === 0 && !character.notes && (
              <div className={styles.journalEmpty}>
                <Eye size={40} className={styles.journalEmptyIcon} />
                <p>El diario de {character.name} está en blanco.</p>
                <p className={styles.journalEmptyHint}>Crea una entrada para registrar tus aventuras.</p>
              </div>
            )}

            {(character.journalEntries ?? []).map((entry) => {
              const isOpen = expandedJournalEntry === entry.id
              return (
                <Card key={entry.id} padding="md" className={styles.journalEntryCard}>
                  <div className={styles.journalEntryHeader} onClick={() => setExpandedJournalEntry(isOpen ? null : entry.id)}>
                    <div>
                      {isEditing ? (
                        <input
                          className={styles.journalDateInput}
                          value={entry.date}
                          onChange={(e) => updateJournalEntry(entry.id, { date: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className={styles.journalDate}>{entry.date}</span>
                      )}
                      {!isOpen && entry.content && (
                        <p className={styles.journalPreview}>{entry.content.substring(0, 80)}{entry.content.length > 80 ? '…' : ''}</p>
                      )}
                    </div>
                    <div className={styles.journalEntryActions}>
                      {isEditing && (
                        <button className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); removeJournalEntry(entry.id) }}>
                          <Trash2 size={14} />
                        </button>
                      )}
                      <span className={styles.expandIcon}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className={styles.journalEntryBody}>
                      {isEditing ? (
                        <textarea
                          className={styles.journalTextarea}
                          value={entry.content}
                          onChange={(e) => updateJournalEntry(entry.id, { content: e.target.value })}
                          placeholder="Narra los eventos de esta sesión..."
                          rows={6}
                        />
                      ) : (
                        <p className={styles.journalContent}>{entry.content || <em className={styles.emptyText}>Sin contenido</em>}</p>
                      )}

                      {/* Characters */}
                      <div className={styles.journalSection}>
                        <div className={styles.journalSectionHeader}>
                          <span className={styles.journalSectionLabel}>Personajes importantes</span>
                          {isEditing && (
                            <button
                              className={styles.addSmBtn}
                              onClick={() => updateJournalEntry(entry.id, {
                                importantCharacters: [...entry.importantCharacters, { name: '', role: 'neutral', notes: '' }]
                              })}
                            >
                              + Añadir
                            </button>
                          )}
                        </div>
                        {entry.importantCharacters.map((char, ci) => (
                          <div key={ci} className={styles.journalCharRow}>
                            {isEditing ? (
                              <>
                                <input
                                  className={styles.journalInlineInput}
                                  value={char.name}
                                  placeholder="Nombre"
                                  onChange={(e) => {
                                    const updated = [...entry.importantCharacters]
                                    updated[ci] = { ...char, name: e.target.value }
                                    updateJournalEntry(entry.id, { importantCharacters: updated })
                                  }}
                                />
                                <select
                                  className={styles.journalSelect}
                                  value={char.role}
                                  onChange={(e) => {
                                    const updated = [...entry.importantCharacters]
                                    updated[ci] = { ...char, role: e.target.value as 'ally' | 'enemy' | 'neutral' }
                                    updateJournalEntry(entry.id, { importantCharacters: updated })
                                  }}
                                >
                                  <option value="ally">Aliado</option>
                                  <option value="enemy">Enemigo</option>
                                  <option value="neutral">Neutral</option>
                                </select>
                                <input
                                  className={styles.journalInlineInput}
                                  value={char.notes}
                                  placeholder="Notas"
                                  onChange={(e) => {
                                    const updated = [...entry.importantCharacters]
                                    updated[ci] = { ...char, notes: e.target.value }
                                    updateJournalEntry(entry.id, { importantCharacters: updated })
                                  }}
                                />
                                <button
                                  className={styles.removeBtn}
                                  onClick={() => updateJournalEntry(entry.id, {
                                    importantCharacters: entry.importantCharacters.filter((_, j) => j !== ci)
                                  })}
                                >
                                  <X size={12} />
                                </button>
                              </>
                            ) : (
                              <>
                                <span className={`${styles.roleBadge} ${styles[char.role]}`}>{char.role === 'ally' ? 'Aliado' : char.role === 'enemy' ? 'Enemigo' : 'Neutral'}</span>
                                <span className={styles.journalCharName}>{char.name}</span>
                                {char.notes && <span className={styles.journalCharNotes}>— {char.notes}</span>}
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Places */}
                      <div className={styles.journalSection}>
                        <div className={styles.journalSectionHeader}>
                          <span className={styles.journalSectionLabel}>Lugares descubiertos</span>
                          {isEditing && (
                            <button
                              className={styles.addSmBtn}
                              onClick={() => updateJournalEntry(entry.id, {
                                discoveredPlaces: [...entry.discoveredPlaces, { name: '', description: '' }]
                              })}
                            >
                              + Añadir
                            </button>
                          )}
                        </div>
                        {entry.discoveredPlaces.map((place, pi) => (
                          <div key={pi} className={styles.journalPlaceRow}>
                            {isEditing ? (
                              <>
                                <input
                                  className={styles.journalInlineInput}
                                  value={place.name}
                                  placeholder="Nombre del lugar"
                                  onChange={(e) => {
                                    const updated = [...entry.discoveredPlaces]
                                    updated[pi] = { ...place, name: e.target.value }
                                    updateJournalEntry(entry.id, { discoveredPlaces: updated })
                                  }}
                                />
                                <input
                                  className={styles.journalInlineInput}
                                  value={place.description}
                                  placeholder="Descripción"
                                  onChange={(e) => {
                                    const updated = [...entry.discoveredPlaces]
                                    updated[pi] = { ...place, description: e.target.value }
                                    updateJournalEntry(entry.id, { discoveredPlaces: updated })
                                  }}
                                />
                                <button
                                  className={styles.removeBtn}
                                  onClick={() => updateJournalEntry(entry.id, {
                                    discoveredPlaces: entry.discoveredPlaces.filter((_, j) => j !== pi)
                                  })}
                                >
                                  <X size={12} />
                                </button>
                              </>
                            ) : (
                              <>
                                <span className={styles.placeName}>{place.name}</span>
                                {place.description && <span className={styles.placeDesc}>— {place.description}</span>}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
