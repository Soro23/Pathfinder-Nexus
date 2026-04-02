import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Play, Edit2, Trash2,
  Sword, Shield, Scroll, Package, Star,
  Heart, Eye, PlusCircle, X, PawPrint, BookOpen, Download,
  Zap, TrendingUp, Power, Pencil, Check
} from 'lucide-react'
import { useCharacterStore, calculateModifier, getModifierString, generateId } from '../store'
import type { StatusEffect, BonusTarget, JournalEntry } from '../store'
import { getClassById, getMulticlassStats, SpellLevel, useSRDStore } from '../data'
import { getBonusSpells } from '../data/bonusSpells'
import { resolveClassSkills } from '../data/resolveArchetype'
import { resolveModifiers } from '../engine'
import { Card, Button } from '../components/ui'
import { FeatsSelector, SkillsList, InventoryManager, Spellbook, AnimalCompanion, ArsenalManager, ClassProgressionTable, LevelUpModal } from '../components/character'
import { ArchetypeSelector } from '../components/character/ArchetypeSelector'
import type { LevelUpUpdates } from '../components/character'
import styles from './CharacterView.module.css'

type Tab = 'combat' | 'skills' | 'feats' | 'weapons' | 'inventory' | 'spells' | 'notes' | 'companion'

function computeSyncedSlots(
  classes: Array<{ id: string; level: number }>,
  abilities: Record<string, number>,
  currentSlots: Record<number, { max: number; used: number }>
): Record<number, { max: number; used: number }> | null {
  const casterClass = classes.find((c) => getClassById(c.id)?.spellsPerDay !== undefined)
  if (!casterClass) return null
  const cd = getClassById(casterClass.id)
  if (!cd?.spellsPerDay || !cd.casterAbility) return null
  const row = cd.spellsPerDay[casterClass.level - 1] ?? []
  const bonusPerLevel = getBonusSpells(abilities[cd.casterAbility])
  const newSlots: Record<number, { max: number; used: number }> = {}
  row.forEach((base, spellLevel) => {
    if (base !== undefined && base > 0) {
      const total = base + (bonusPerLevel[spellLevel] ?? 0)
      const prev = currentSlots[spellLevel]
      newSlots[spellLevel] = { max: total, used: prev ? Math.min(prev.used, total) : 0 }
    }
  })
  return Object.keys(newSlots).length > 0 ? newSlots : null
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
  const [isEditing, setIsEditing] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
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
      acBonuses: { natural: 0, deflection: 0, dodge: 0, armor: 0, total: 0 },
      initiativeBonus: 0, attackBonus: 0, damageBonus: 0,
      hpBonus: 0, speedBonus: 0, cmbBonus: 0, cmdBonus: 0, allModifiers: [],
    },
    [character]
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
  const primaryClass = character.classes[0]
  const classData = getClassById(primaryClass?.id || '')

  const equippedBody   = (character.armor ?? []).find((a) => a.equipped && a.type !== 'shield')
  const equippedShield = (character.armor ?? []).find((a) => a.equipped && a.type === 'shield')
  const effectiveDex   = equippedBody
    ? Math.min(calculateModifier(abilities.dexterity), equippedBody.maxDex ?? 99)
    : calculateModifier(abilities.dexterity)
  const ac      = 10 + effectiveDex + (equippedBody?.acBonus ?? 0) + (equippedShield?.acBonus ?? 0) + resolvedStats.acBonuses.natural + resolvedStats.acBonuses.deflection + resolvedStats.acBonuses.dodge
  const acTouch = 10 + effectiveDex + resolvedStats.acBonuses.deflection + resolvedStats.acBonuses.dodge
  const acFlat  = 10 + (equippedBody?.acBonus ?? 0) + (equippedShield?.acBonus ?? 0) + resolvedStats.acBonuses.natural + resolvedStats.acBonuses.deflection
  const mcStats   = getMulticlassStats(character.classes)
  const fortitude = mcStats.fortitude + calculateModifier(abilities.constitution) + resolvedStats.saveBonuses.fort
  const reflex    = mcStats.reflex    + calculateModifier(abilities.dexterity)    + resolvedStats.saveBonuses.ref
  const will      = mcStats.will      + calculateModifier(abilities.wisdom)       + resolvedStats.saveBonuses.will
  const bab       = mcStats.bab
  const initiative = calculateModifier(abilities.dexterity) + resolvedStats.initiativeBonus
  const strMod = calculateModifier(abilities.strength)
  const cmb = bab + strMod
  const cmd = 10 + bab + strMod + calculateModifier(abilities.dexterity)

  const hpPercent = Math.max(0, Math.min(100, (character.hp.current / character.hp.max) * 100))

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
    { id: 'combat' as Tab,    label: 'Personaje',   icon: Sword },
    ...(isCaster ? [{ id: 'spells' as Tab, label: 'Hechizos', icon: Scroll }] : []),
    { id: 'inventory' as Tab, label: 'Inventario',  icon: Package },
    { id: 'skills' as Tab,    label: 'Habilidades', icon: Star },
    { id: 'feats' as Tab,     label: 'Dotes',       icon: BookOpen },
    { id: 'weapons' as Tab,   label: 'Arsenal',     icon: Sword },
    { id: 'companion' as Tab, label: 'Compañero',   icon: PawPrint },
    { id: 'notes' as Tab,     label: 'Diario',      icon: Eye },
  ]

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={20} />
          Volver
        </Link>
        <div className={styles.titleRow}>
          <div>
            <h1>{character.name}</h1>
            <p className={styles.subtitle}>
              {character.race} · {character.classes.map(c => `${c.id} ${c.level}`).join('/')} · Nivel {character.level}
            </p>
          </div>
          <div className={styles.actions}>
            <Link to={`/characters/${id}/play`}>
              <Button variant="primary">
                <Play size={18} />
                Modo Juego
              </Button>
            </Link>
            {!isEditing && (
              <Button variant="secondary" onClick={() => setShowLevelUp(true)}>
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
                    <span className={styles.hpMax}>{character.hp.max}</span>
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
                <button className={styles.hpBtn} onClick={() => updateCharacter(character.id, { hp: { ...character.hp, current: Math.min(character.hp.max, character.hp.current + 1) } })}>+1</button>
                <button className={styles.hpBtn} onClick={() => updateCharacter(character.id, { hp: { ...character.hp, current: Math.min(character.hp.max, character.hp.current + 5) } })}>+5</button>
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
            <span className={styles.quickStatValue}>30ft</span>
            <span className={styles.quickStatLabel}>Vel.</span>
          </div>
          <div className={styles.quickStat}>
            <TrendingUp size={18} />
            <span className={styles.quickStatValue}>{character.xp}</span>
            <span className={styles.quickStatLabel}>XP</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {tabs.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            className={`${styles.tab} ${activeTab === tabId ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tabId)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Level Up Modal ── */}
      {showLevelUp && (
        <LevelUpModal
          character={character}
          onClose={() => setShowLevelUp(false)}
          onConfirm={(updates: LevelUpUpdates) => {
            const syncedSlots = computeSyncedSlots(
              updates.newClassLevels,
              character.abilities,
              character.spellSlots ?? {}
            )
            updateCharacter(character.id, {
              level: updates.newLevel,
              classes: updates.newClassLevels,
              hp: {
                ...character.hp,
                max: character.hp.max + updates.hpGained,
                current: character.hp.current + updates.hpGained,
              },
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
            </Card>

            {/* Saves */}
            <Card padding="md">
              <h3 className={styles.sectionTitle}>Tiros de Salvación</h3>
              <div className={styles.savesGrid}>
                {[
                  { label: 'Fort', full: 'Fortaleza', val: fortitude, abbr: 'CON' },
                  { label: 'Ref',  full: 'Reflejos',  val: reflex,    abbr: 'DES' },
                  { label: 'Vol',  full: 'Voluntad',  val: will,      abbr: 'SAB' },
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
            <Card padding="md">
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
                  { label: 'Velocidad', val: '30 ft' },
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
                      {character.classes.map((cc) => {
                        const cd = getClassById(cc.id)
                        const currentArchetype = cc.archetypeId ? getArchetypeById(cc.archetypeId) : undefined
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
                                disabled={cc.level <= 1 && character.classes.length === 1}
                              >−</button>
                              <span className={styles.classLevelValue}>{cc.level}</span>
                              <button
                                className={styles.classLevelBtn}
                                onClick={() => {
                                  const newClasses = character.classes.map((c) => c.id === cc.id ? { ...c, level: c.level + 1 } : c)
                                  const newTotal = newClasses.reduce((s, c) => s + c.level, 0)
                                  updateCharacter(character.id, { classes: newClasses, level: newTotal })
                                }}
                              >+</button>
                            </div>
                            <div className={styles.archetypeEditRow}>
                              <ArchetypeSelector
                                classId={cc.id}
                                value={cc.archetypeId}
                                onChange={(newArchId) => {
                                  const newClasses = character.classes.map((c) =>
                                    c.id === cc.id ? { ...c, archetypeId: newArchId } : c
                                  )
                                  updateCharacter(character.id, { classes: newClasses })
                                }}
                              />
                              {cc.archetypeId && cd && currentArchetype && (
                                <button
                                  className={styles.recalcBtn}
                                  onClick={() => {
                                    const resolvedSkills = resolveClassSkills(cd, currentArchetype)
                                    const updatedSkills = character.skills.filter((sk) =>
                                      resolvedSkills.includes(sk.id) || (sk.ranks ?? 0) > 0
                                    )
                                    updateCharacter(character.id, { skills: updatedSkills })
                                  }}
                                  title="Actualiza habilidades de clase según el arquetipo"
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
                      archetype={activeClassEntry.archetypeId ? getArchetypeById(activeClassEntry.archetypeId) : undefined}
                    />
                  )}
                </Card>
              )
            })()}

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
                level={character.level}
                skillPointsAvailable={Math.max(0, (character.level * (classData?.skillPointsPerLevel || 2)) - character.skills.reduce((sum, s) => sum + s.ranks, 0))}
                equippedArmorAcp={equippedArmorAcp}
                featSkillBonuses={resolvedStats.skillBonuses}
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
                  const abilityMod = calculateModifier(abilities[skill.ability])
                  const isClass = classData?.classSkills?.includes(skill.id)
                  const classBonus = ranks > 0 && isClass ? 3 : 0
                  const acp = skill.hasArmorCheckPenalty ? equippedArmorAcp : 0
                  const misc = rankEntry?.miscBonuses?.reduce((s, b) => s + b.value, 0) ?? 0
                  const featBonus = resolvedStats.skillBonuses?.[skill.id] ?? 0
                  const total = ranks + abilityMod + classBonus + acp + misc + featBonus
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
              <h3 className={styles.sectionTitle}>Dotes ({character.feats.length})</h3>
            </div>
            {isEditing ? (
              <FeatsSelector
                selectedFeats={character.feats}
                onToggle={(featId) => {
                  const newFeats = character.feats.includes(featId)
                    ? character.feats.filter((f) => f !== featId)
                    : [...character.feats, featId]
                  updateCharacter(character.id, { feats: newFeats })
                }}
              />
            ) : (
              character.feats.length === 0 ? (
                <p className={styles.editHint}>Sin dotes seleccionadas. Pulsa Editar para añadir.</p>
              ) : (
                <div className={styles.featsReadGrid}>
                  {character.feats.map((featId) => {
                    const feat = FEATS.find((f) => f.id === featId)
                    if (!feat) return null
                    return (
                      <div key={featId} className={styles.featReadCard}>
                        <div className={styles.featReadHeader}>
                          <span className={styles.featReadName}>{feat.name}</span>
                          <span className={styles.featReadType}>{feat.type}</span>
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

        {/* ══ ARSENAL ══ */}
        {activeTab === 'weapons' && (
          <Card padding="md">
            <h3 className={styles.sectionTitle}>Arsenal</h3>
            <ArsenalManager
              weapons={character.weapons || []}
              armor={character.armor ?? []}
              bab={bab}
              strMod={calculateModifier(abilities.strength)}
              dexMod={calculateModifier(abilities.dexterity)}
              onWeaponsChange={(weapons) => updateCharacter(character.id, { weapons })}
              onArmorChange={(armor) => updateCharacter(character.id, { armor })}
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
              carryCapacity={(abilities.strength * 10) + (calculateModifier(abilities.strength) * 10)}
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
                const syncedSlots = computeSyncedSlots(
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
