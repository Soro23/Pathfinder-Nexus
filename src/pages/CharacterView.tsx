import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Play, Edit2, Trash2,
  Sword, Shield, Scroll, Package, Star,
  Heart, Eye, PlusCircle, X, PawPrint, BookOpen, Download,
  Zap, TrendingUp
} from 'lucide-react'
import { useCharacterStore, calculateModifier, getModifierString, generateId } from '../store'
import type { StatusEffect, JournalEntry } from '../store'
import { getClassById, getBABForLevel, getSaveForLevel, SpellLevel, FEATS } from '../data'
import { resolveModifiers } from '../engine'
import { Card, Button } from '../components/ui'
import { FeatsSelector, SkillsList, InventoryManager, Spellbook, AnimalCompanion, ArsenalManager, ClassProgressionTable, LevelUpModal } from '../components/character'
import type { LevelUpUpdates } from '../components/character'
import { SKILLS } from '../data/skills'
import styles from './CharacterView.module.css'

type Tab = 'combat' | 'skills' | 'feats' | 'weapons' | 'inventory' | 'spells' | 'notes' | 'companion'

const ABILITY_ABBR: Record<string, string> = {
  strength: 'FUE', dexterity: 'DES', constitution: 'CON',
  intelligence: 'INT', wisdom: 'SAB', charisma: 'CAR',
}

export function CharacterView() {
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
  const [showEffectForm, setShowEffectForm] = useState(false)
  const [expandedJournalEntry, setExpandedJournalEntry] = useState<string | null>(null)
  const [showJournalModal, setShowJournalModal] = useState(false)
  const [newJournalContent, setNewJournalContent] = useState('')

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

  const resolvedStats = useMemo(() => resolveModifiers(character), [character])

  const equippedBody   = (character.armor ?? []).find((a) => a.equipped && a.type !== 'shield')
  const equippedShield = (character.armor ?? []).find((a) => a.equipped && a.type === 'shield')
  const effectiveDex   = equippedBody
    ? Math.min(calculateModifier(abilities.dexterity), equippedBody.maxDex ?? 99)
    : calculateModifier(abilities.dexterity)
  const ac      = 10 + effectiveDex + (equippedBody?.acBonus ?? 0) + (equippedShield?.acBonus ?? 0) + resolvedStats.acBonuses.natural + resolvedStats.acBonuses.deflection + resolvedStats.acBonuses.dodge
  const acTouch = 10 + effectiveDex + resolvedStats.acBonuses.deflection + resolvedStats.acBonuses.dodge
  const acFlat  = 10 + (equippedBody?.acBonus ?? 0) + (equippedShield?.acBonus ?? 0) + resolvedStats.acBonuses.natural + resolvedStats.acBonuses.deflection
  const fortitude = getSaveForLevel(character.level, classData?.fortitudeSave || 'poor') + calculateModifier(abilities.constitution) + resolvedStats.saveBonuses.fort
  const reflex = getSaveForLevel(character.level, classData?.reflexSave || 'poor') + calculateModifier(abilities.dexterity) + resolvedStats.saveBonuses.ref
  const will = getSaveForLevel(character.level, classData?.willSave || 'poor') + calculateModifier(abilities.wisdom) + resolvedStats.saveBonuses.will
  const bab = getBABForLevel(character.level, classData?.baseAttackBonus || 'poor')
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
    const effect: StatusEffect = {
      id: generateId(),
      name: newEffectName.trim(),
      description: newEffectDesc.trim(),
    }
    updateCharacter(character.id, { statusEffects: [...(character.statusEffects ?? []), effect] })
    setNewEffectName('')
    setNewEffectDesc('')
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
                <span className={styles.hpCurrent}>{character.hp.current}</span>
                <span className={styles.hpSeparator}>/</span>
                <span className={styles.hpMax}>{character.hp.max}</span>
              </div>
              {/* HP Bar */}
              <div className={styles.hpBar}>
                <div className={styles.hpBarFill} style={{ width: `${hpPercent}%` }} />
              </div>
            </div>
            <div className={styles.hpControls}>
              <button className={styles.hpBtn} onClick={() => updateCharacter(character.id, { hp: { ...character.hp, current: Math.max(0, character.hp.current - 1) } })}>−1</button>
              <button className={styles.hpBtn} onClick={() => updateCharacter(character.id, { hp: { ...character.hp, current: Math.max(0, character.hp.current - 5) } })}>−5</button>
              <button className={styles.hpBtn} onClick={() => updateCharacter(character.id, { hp: { ...character.hp, current: Math.min(character.hp.max, character.hp.current + 1) } })}>+1</button>
              <button className={styles.hpBtn} onClick={() => updateCharacter(character.id, { hp: { ...character.hp, current: Math.min(character.hp.max, character.hp.current + 5) } })}>+5</button>
            </div>
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
            updateCharacter(character.id, {
              level: updates.newLevel,
              classes: updates.newClassLevels,
              hp: {
                ...character.hp,
                max: character.hp.max + updates.hpGained,
                current: character.hp.current + updates.hpGained,
              },
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
                      <span className={styles.abilityScore}>{value}</span>
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
            {classData && (
              <Card padding="md" className={styles.colSpan2}>
                <h3 className={styles.sectionTitle}>Progresión de Clase — {classData.name}</h3>
                <ClassProgressionTable classData={classData} currentLevel={character.level} />
              </Card>
            )}

            {/* Status Effects */}
            <Card padding="md" className={styles.alignStart}>
              <div className={styles.sectionHeaderRow}>
                <h3 className={styles.sectionTitle}>Efectos Activos</h3>
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
                    placeholder="Descripción (ej: +1 a ataques)"
                    value={newEffectDesc}
                    onChange={(e) => setNewEffectDesc(e.target.value)}
                  />
                  <div className={styles.effectFormActions}>
                    <Button variant="primary" size="sm" onClick={addStatusEffect}>Añadir</Button>
                    <Button variant="secondary" size="sm" onClick={() => setShowEffectForm(false)}>Cancelar</Button>
                  </div>
                </div>
              )}
              <div className={styles.effectsChips}>
                {(character.statusEffects ?? []).length === 0 && !showEffectForm && (
                  <p className={styles.emptyEffects}>Sin efectos activos</p>
                )}
                {(character.statusEffects ?? []).map((effect) => (
                  <span key={effect.id} className={styles.effectChip}>
                    <span className={styles.effectName}>{effect.name}</span>
                    {effect.description && (
                      <span className={styles.effectDesc}>{effect.description}</span>
                    )}
                    <button className={styles.effectRemove} onClick={() => removeStatusEffect(effect.id)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
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
              spellSlots={character.spellSlots || {}}
              abilityModifier={calculateModifier(abilities[casterAbility])}
              classIds={character.classes.map((c) => c.id)}
              onToggleKnown={(spellId) => {
                const newSpells = character.spells.includes(spellId)
                  ? character.spells.filter((s) => s !== spellId)
                  : [...character.spells, spellId]
                updateCharacter(character.id, { spells: newSpells })
              }}
              onUseSlot={(level: SpellLevel) => {
                const slots = { ...character.spellSlots }
                if (slots[level] && slots[level].used < slots[level].max) {
                  slots[level] = { ...slots[level], used: slots[level].used + 1 }
                  updateCharacter(character.id, { spellSlots: slots })
                }
              }}
              onRestoreSlot={(level: SpellLevel) => {
                const slots = { ...character.spellSlots }
                if (slots[level] && slots[level].used > 0) {
                  slots[level] = { ...slots[level], used: slots[level].used - 1 }
                  updateCharacter(character.id, { spellSlots: slots })
                }
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
