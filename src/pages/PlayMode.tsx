import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Plus, Minus, Dices, History, Shield, Heart, Brain,
  Swords, Flame, X, Zap, BookOpen, Activity, Power, Pencil, Check
} from 'lucide-react'
import { useCharacterStore, calculateModifier, getModifierString, StatusEffect, BonusTarget } from '../store'
import { getClassById, getMulticlassStats, useSRDStore } from '../data'
import { useSpellsByIds } from '../hooks/useSpellsByIds'
import { Button, Card } from '../components/ui'
import styles from './PlayMode.module.css'

function getEffectBonus(effects: StatusEffect[], target: BonusTarget): number {
  return effects
    .filter(e => e.active !== false && e.bonusTarget === target && e.bonusValue !== undefined)
    .reduce((sum, e) => sum + (e.bonusValue ?? 0), 0)
}

function addModifierToNotation(notation: string, extra: number): string {
  if (extra === 0) return notation
  const match = notation.match(/^(\d+d\d+)([+-]\d+)?$/)
  if (!match) return notation
  const base = match[1]
  const existing = match[2] ? parseInt(match[2]) : 0
  const total = existing + extra
  if (total === 0) return base
  return `${base}${total > 0 ? '+' : ''}${total}`
}

const BONUS_TARGET_LABELS: Record<string, string> = {
  attack: 'Ataque',
  damage: 'Daño',
  ac: 'CA',
  fort: 'Fortaleza',
  ref: 'Reflejos',
  will: 'Voluntad',
  initiative: 'Iniciativa',
  cmb: 'CMB',
  cmd: 'CMD',
}

function rollDice(notation: string): { total: number; rolls: number[] } {
  const match = notation.match(/(\d+)d(\d+)([+-]\d+)?/)
  if (!match) return { total: 0, rolls: [0] }

  const [, countStr, sidesStr, modifierStr] = match
  const count = parseInt(countStr)
  const sides = parseInt(sidesStr)
  const modifier = modifierStr ? parseInt(modifierStr) : 0

  const rolls: number[] = []
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1)
  }
  const subtotal = rolls.reduce((sum, r) => sum + r, 0)
  return { total: subtotal + modifier, rolls }
}

type CritEvent = { type: 'crit' | 'fumble'; name: string; roll: number }
type TabId = 'combat' | 'skills' | 'spells' | 'dice' | 'encounter'

interface Combatant {
  id: string
  name: string
  initiative: number
  hp: { current: number; max: number }
  ac: number
  isPlayer: boolean
}

const PREPARED_CASTERS = ['wizard', 'cleric', 'druid', 'paladin', 'ranger']

// Names of features that already have interactive UI (buttons/toggles) — excluded from passive list
const INTERACTIVE_FEATURE_NAMES = new Set([
  'Rabia', 'Despertar de Furia',
  'Canalizar Energía', 'Canal de Energía (Oráculo)',
  'Imponer Manos', 'Manos Puestas',
  'Golpe Aturdidor',
  'Actuación Bárdica', 'Inspiración de Canción',
  'Forma Salvaje',
  'Bombas',
  'Mutágeno',
  'Juicio',
  'Desafío',
  'Reserva Mágica',
  'Grit', 'Determinación',
  'Aspecto', 'Aspecto Mayor',
  'Hexos',
  'Eídolón',
])

export function PlayMode() {
  const { skills: SKILLS, classes: CLASSES_DATA } = useSRDStore()
  const { id } = useParams<{ id: string }>()
  const character = useCharacterStore((state) => state.getCharacter(id || ''))
  const updateCharacter = useCharacterStore((state) => state.updateCharacter)

  const [activeTab, setActiveTab] = useState<TabId>('combat')
  const [diceNotation, setDiceNotation] = useState('1d20')
  const [rollResult, setRollResult] = useState<{ total: number; rolls: number[]; key: number } | null>(null)
  const [lastRollType, setLastRollType] = useState('')
  const [history, setHistory] = useState<{ notation: string; result: number; isCrit?: boolean; isFumble?: boolean }[]>([])
  const [critEvent, setCritEvent] = useState<CritEvent | null>(null)
  const [rolling, setRolling] = useState(false)
  const [dicePanelOpen, setDicePanelOpen] = useState(false)
  const [showStatusEffects, setShowStatusEffects] = useState(false)
  const [newEffectName, setNewEffectName] = useState('')
  const [newEffectDesc, setNewEffectDesc] = useState('')
  const [newEffectDuration, setNewEffectDuration] = useState('')
  const [newEffectTarget, setNewEffectTarget] = useState<BonusTarget | 'skill' | ''>('')
  const [newEffectSkillId, setNewEffectSkillId] = useState('')
  const [newEffectValue, setNewEffectValue] = useState<number>(0)
  const [editingEffectId, setEditingEffectId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editTarget, setEditTarget] = useState<BonusTarget | 'skill' | ''>('')
  const [editSkillId, setEditSkillId] = useState('')
  const [editValue, setEditValue] = useState<number>(0)

  // ── Encounter tracker state ──
  const [combatants, setCombatants] = useState<Combatant[]>([])
  const [activeTurn, setActiveTurn] = useState(0)
  const [round, setRound] = useState(1)
  const [encounterStarted, setEncounterStarted] = useState(false)
  const [newEnemyName, setNewEnemyName] = useState('')
  const [newEnemyInit, setNewEnemyInit] = useState(0)
  const [newEnemyHp, setNewEnemyHp] = useState(10)
  const [newEnemyAc, setNewEnemyAc] = useState(10)

  // ── Rage state ──
  const [raging, setRaging] = useState(false)

  const { spells: spellMap } = useSpellsByIds(character?.spells ?? [])
  const { spells: preparedSpellMap } = useSpellsByIds(character?.preparedSpells ?? [])

  if (!character) {
    return (
      <div className={styles.notFound}>
        <h2>Personaje no encontrado</h2>
        <Link to="/">
          <Button variant="secondary">
            <ArrowLeft size={18} />
            Volver
          </Button>
        </Link>
      </div>
    )
  }

  const { abilities } = character
  const classData = getClassById(character.classes[0]?.id || '')   // mantener — se usa en hasSpells, concentrationBonus, classSkillIds
  const mcStats  = getMulticlassStats(character.classes)
  const bab      = mcStats.bab

  // Correct AC calculation using equipped armor
  const equippedArmor = (character.armor ?? []).filter((a) => a.equipped)
  const totalArmorBonus = equippedArmor.reduce((sum, a) => sum + a.acBonus, 0)
  const armorMaxDex = equippedArmor.reduce((min, a) =>
    a.maxDex === null ? min : Math.min(min, a.maxDex), Infinity)
  const dexForAC = Math.min(
    calculateModifier(abilities.dexterity),
    armorMaxDex === Infinity ? 99 : armorMaxDex
  )

  const strMod = calculateModifier(abilities.strength)
  const dexMod = calculateModifier(abilities.dexterity)

  const ac         = 10 + totalArmorBonus + dexForAC
  const fortSave   = mcStats.fortitude + calculateModifier(abilities.constitution)
  const refSave    = mcStats.reflex    + calculateModifier(abilities.dexterity)
  const willSave   = mcStats.will      + calculateModifier(abilities.wisdom)
  const cmb        = bab + strMod
  const cmd        = 10 + bab + strMod + dexMod
  const initiative = dexMod

  const statusEffects = character.statusEffects ?? []

  const effectAC         = getEffectBonus(statusEffects, 'ac')
  const effectFort       = getEffectBonus(statusEffects, 'fort')
  const effectRef        = getEffectBonus(statusEffects, 'ref')
  const effectWill       = getEffectBonus(statusEffects, 'will')
  const effectInitiative = getEffectBonus(statusEffects, 'initiative')
  const effectCMB        = getEffectBonus(statusEffects, 'cmb')
  const effectCMD        = getEffectBonus(statusEffects, 'cmd')
  const effectAttack     = getEffectBonus(statusEffects, 'attack')
  const effectDamage     = getEffectBonus(statusEffects, 'damage')

  function triggerRollAnimation(cb: () => void) {
    setRolling(true)
    setTimeout(() => {
      cb()
      setRolling(false)
    }, 280)
  }

  const handleRoll = () => {
    triggerRollAnimation(() => {
      const result = rollDice(diceNotation)
      setRollResult({ ...result, key: Date.now() })
      setLastRollType(diceNotation)
      setHistory((prev) => [{ notation: diceNotation, result: result.total }, ...prev.slice(0, 19)])
    })
  }

  const handleQuickRoll = (notation: string, name: string, isAttack = false) => {
    triggerRollAnimation(() => {
      const result = rollDice(notation)
      const d20 = result.rolls[0]
      const isCrit = isAttack && d20 === 20
      const isFumble = isAttack && d20 === 1

      setRollResult({ ...result, key: Date.now() })
      setLastRollType(name)
      setHistory((prev) => [{ notation: name, result: result.total, isCrit, isFumble }, ...prev.slice(0, 19)])

      if (isCrit) setCritEvent({ type: 'crit', name, roll: result.total })
      else if (isFumble) setCritEvent({ type: 'fumble', name, roll: result.total })
    })
  }

  const adjustHP = (amount: number) => {
    const newHP = Math.max(0, Math.min(character.hp.max, character.hp.current + amount))
    updateCharacter(character.id, { hp: { ...character.hp, current: newHP } })
  }

  const toggleSlot = (level: number, slotIndex: number) => {
    const currentSlots = character.spellSlots ?? {}
    const slot = currentSlots[level] ?? { max: 0, used: 0 }
    const newUsed = slotIndex < slot.used ? slot.used - 1 : Math.min(slot.used + 1, slot.max)
    updateCharacter(character.id, {
      spellSlots: { ...currentSlots, [level]: { ...slot, used: newUsed } }
    })
  }

  const hasSpells = classData?.magicType !== null && classData?.magicType !== undefined

  // Concentration bonus
  const casterAbility = classData?.casterAbility
  const casterAbilityMod = casterAbility ? calculateModifier(abilities[casterAbility]) : 0
  const concentrationBonus = character.level + casterAbilityMod

  // Ability abbreviations
  const abilityAbbr: Record<string, string> = {
    strength: 'FUE', dexterity: 'DES', constitution: 'CON',
    intelligence: 'INT', wisdom: 'SAB', charisma: 'CAR'
  }

  const classSkillIds = classData?.classSkills ?? CLASSES_DATA.find(c => c.id === character.classes[0]?.id)?.classSkills ?? []

  // ── Class feature helpers ──
  const conMod = calculateModifier(abilities.constitution)
  const wisMod = calculateModifier(abilities.wisdom)
  const chaMod = calculateModifier(abilities.charisma)
  const classByType = (id: string) => character.classes.find(c => c.id === id)

  const intMod = calculateModifier(abilities.intelligence)
  const barbarianClass = classByType('barbarian')
  const clericClass    = classByType('cleric')
  const rogueClass     = classByType('rogue')
  const paladinClass   = classByType('paladin')
  const monkClass      = classByType('monk')
  const bardClass      = classByType('bard')
  const druidClass     = classByType('druid')
  const fighterClass   = classByType('fighter')
  const rangerClass    = classByType('ranger')
  const alchemistClass = classByType('alchemist')
  const inquisitorClass= classByType('inquisitor')
  const cavalierClass  = classByType('cavalier')
  const maguClass      = classByType('magus')
  const gunslingerClass= classByType('gunslinger')
  const shifterClass   = classByType('shifter')
  const oracleClass    = classByType('oracle')
  const witchClass     = classByType('witch')
  const summonerClass  = classByType('summoner')

  // Max uses per day per class
  const rageMaxUses        = barbarianClass ? 4 + conMod + 2 * (barbarianClass.level - 1) : 0
  const channelMaxUses     = clericClass   ? Math.max(1, 3 + chaMod) : 0
  const layMaxUses         = paladinClass  ? Math.max(1, Math.floor(paladinClass.level / 2) + chaMod) : 0
  const stunMaxUses        = monkClass     ? monkClass.level + wisMod : 0
  const sneakDice          = rogueClass    ? Math.ceil(rogueClass.level / 2) : 0
  const bardPerfMaxRounds  = bardClass     ? 4 + chaMod + 2 * (bardClass.level - 1) : 0
  const wildShapeMaxUses   = druidClass && druidClass.level >= 4 ? Math.floor((druidClass.level - 2) / 2) : 0
  const bombMaxUses        = alchemistClass ? intMod + alchemistClass.level : 0
  const judgementMaxUses   = inquisitorClass ? 1 + Math.floor(inquisitorClass.level / 3) : 0
  const challengeMaxUses   = cavalierClass  ? 1 + Math.floor((cavalierClass.level - 1) / 4) : 0
  const arcanePoolMax      = maguClass      ? Math.max(1, Math.floor(maguClass.level / 2) + intMod) : 0
  const gritMax            = gunslingerClass ? Math.max(1, wisMod) : 0
  const aspectRoundsMax    = shifterClass   ? shifterClass.level + wisMod : 0
  const oracleChannelMax   = oracleClass    ? Math.max(1, 3 + chaMod) : 0

  const featureUses = character.classFeatureUses ?? {}
  const rageUses         = featureUses['rage']        ?? rageMaxUses
  const channelUses      = featureUses['channel']     ?? channelMaxUses
  const layUses          = featureUses['lay']         ?? layMaxUses
  const stunUses         = featureUses['stun']        ?? stunMaxUses
  const bardPerfUses     = featureUses['bardperf']    ?? bardPerfMaxRounds
  const wildShapeUses    = featureUses['wildshape']   ?? wildShapeMaxUses
  const bombUses         = featureUses['bomb']        ?? bombMaxUses
  const mutaUses         = featureUses['mutagen']     ?? (alchemistClass ? 1 : 0)
  const judgementUses    = featureUses['judgement']   ?? judgementMaxUses
  const challengeUses    = featureUses['challenge']   ?? challengeMaxUses
  const tacticianUses    = featureUses['tactician']   ?? (cavalierClass ? 1 : 0)
  const arcanePoolUses   = featureUses['arcanepool']  ?? arcanePoolMax
  const gritUses         = featureUses['grit']        ?? gritMax
  const aspectUses       = featureUses['aspect']      ?? aspectRoundsMax
  const oracleChannelUses= featureUses['ochannel']    ?? oracleChannelMax

  const hasAnyFeature = barbarianClass || clericClass || rogueClass || paladinClass || monkClass ||
    bardClass || druidClass || fighterClass || rangerClass || alchemistClass ||
    inquisitorClass || cavalierClass || maguClass || gunslingerClass || shifterClass ||
    oracleClass || witchClass || summonerClass

  const useFeature = (key: string, max: number) => {
    const current = featureUses[key] ?? max
    if (current <= 0) return
    updateCharacter(character.id, { classFeatureUses: { ...featureUses, [key]: current - 1 } })
  }

  // ── Encounter helpers ──
  const startEncounter = () => {
    const playerCombatant: Combatant = {
      id: character.id,
      name: character.name,
      initiative: initiative + effectInitiative + Math.floor(Math.random() * 20) + 1,
      hp: { current: character.hp.current, max: character.hp.max },
      ac: ac + effectAC,
      isPlayer: true,
    }
    setCombatants([playerCombatant])
    setActiveTurn(0)
    setRound(1)
    setEncounterStarted(true)
  }

  const addEnemy = () => {
    if (!newEnemyName.trim()) return
    const enemy: Combatant = {
      id: `enemy-${Date.now()}`,
      name: newEnemyName.trim(),
      initiative: newEnemyInit,
      hp: { current: newEnemyHp, max: newEnemyHp },
      ac: newEnemyAc,
      isPlayer: false,
    }
    setCombatants(prev => [...prev, enemy].sort((a, b) => b.initiative - a.initiative))
    setNewEnemyName('')
    setNewEnemyInit(0)
    setNewEnemyHp(10)
    setNewEnemyAc(10)
  }

  const sortedCombatants = [...combatants].sort((a, b) => b.initiative - a.initiative)

  const nextTurn = () => {
    const next = activeTurn + 1
    if (next >= sortedCombatants.length) {
      setActiveTurn(0)
      setRound(r => r + 1)
    } else {
      setActiveTurn(next)
    }
  }

  const adjustCombatantHp = (id: string, delta: number) => {
    setCombatants(prev => prev.map(c =>
      c.id === id
        ? { ...c, hp: { ...c.hp, current: Math.max(0, Math.min(c.hp.max, c.hp.current + delta)) } }
        : c
    ))
  }

  const endEncounter = () => {
    setCombatants([])
    setActiveTurn(0)
    setRound(1)
    setEncounterStarted(false)
  }

  const isPreparedCaster = character.classes.some(c => PREPARED_CASTERS.includes(c.id))
  const activeSpellMap = isPreparedCaster ? preparedSpellMap : spellMap
  const activeSpellIds = isPreparedCaster ? (character.preparedSpells ?? []) : (character.spells ?? [])

  return (
    <div className={styles.container}>
      {/* ── Critical / Fumble Modal ── */}
      {critEvent && (
        <div className={styles.critOverlay} onClick={() => setCritEvent(null)}>
          <div
            className={`${styles.critModal} ${critEvent.type === 'crit' ? styles.critModalCrit : styles.critModalFumble}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.critClose} onClick={() => setCritEvent(null)}>
              <X size={18} />
            </button>
            {critEvent.type === 'crit' ? (
              <>
                <div className={styles.critIcon}><Flame size={44} /></div>
                <h2 className={styles.critTitle}>¡GOLPE CRÍTICO!</h2>
                <p className={styles.critSub}>{critEvent.name}</p>
                <p className={styles.critDesc}>
                  20 natural. Confirma el crítico tirando de nuevo con el mismo bonificador.
                  Si superas la CA del objetivo, el daño se <strong>duplica</strong>.
                </p>
                <div className={styles.critActions}>
                  <Button variant="primary" onClick={() => {
                    handleQuickRoll('1d20', 'Confirmar Crítico')
                    setCritEvent(null)
                  }}>
                    Confirmar Crítico
                  </Button>
                  <Button variant="secondary" onClick={() => setCritEvent(null)}>Cerrar</Button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.critIcon}><Swords size={44} /></div>
                <h2 className={styles.critTitle}>¡PIFIA!</h2>
                <p className={styles.critSub}>{critEvent.name}</p>
                <p className={styles.critDesc}>
                  1 natural — fallo automático. El DM puede aplicar una consecuencia dramática.
                </p>
                <div className={styles.critActions}>
                  <Button variant="danger" onClick={() => setCritEvent(null)}>Aceptar mi destino</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Status Effects Drawer ── */}
      {showStatusEffects && (
        <div className={styles.effectsOverlay} onClick={() => setShowStatusEffects(false)}>
          <div className={styles.effectsDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.effectsHeader}>
              <h3>Efectos</h3>
              <button className={styles.critClose} onClick={() => setShowStatusEffects(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Add effect form */}
            <div className={styles.effectForm}>
              <input
                className={styles.effectInput}
                placeholder="Nombre del efecto"
                value={newEffectName}
                onChange={e => setNewEffectName(e.target.value)}
              />
              <input
                className={styles.effectInput}
                placeholder="Descripción (opcional)"
                value={newEffectDesc}
                onChange={e => setNewEffectDesc(e.target.value)}
              />
              <input
                className={styles.effectInput}
                placeholder="Duración (ej: 3 rondas)"
                value={newEffectDuration}
                onChange={e => setNewEffectDuration(e.target.value)}
              />
              <div className={styles.effectBonusRow}>
                <select
                  className={styles.effectSelect}
                  value={newEffectTarget}
                  onChange={e => { setNewEffectTarget(e.target.value as BonusTarget | 'skill' | ''); setNewEffectSkillId('') }}
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
                    onChange={e => setNewEffectSkillId(e.target.value)}
                  >
                    <option value="">Selecciona habilidad</option>
                    {SKILLS.sort((a, b) => a.name.localeCompare(b.name)).map(s => (
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
                    onChange={e => setNewEffectValue(parseInt(e.target.value) || 0)}
                  />
                )}
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!newEffectName.trim()) return
                  const resolvedTarget: BonusTarget | undefined =
                    newEffectTarget === 'skill'
                      ? newEffectSkillId ? (`skill:${newEffectSkillId}` as BonusTarget) : undefined
                      : newEffectTarget || undefined
                  const effect: StatusEffect = {
                    id: Date.now().toString(),
                    name: newEffectName.trim(),
                    description: newEffectDesc.trim(),
                    duration: newEffectDuration.trim() || undefined,
                    bonusTarget: resolvedTarget,
                    bonusValue: resolvedTarget !== undefined ? newEffectValue : undefined,
                  }
                  updateCharacter(character.id, { statusEffects: [...statusEffects, effect] })
                  setNewEffectName('')
                  setNewEffectDesc('')
                  setNewEffectDuration('')
                  setNewEffectTarget('')
                  setNewEffectSkillId('')
                  setNewEffectValue(0)
                }}
              >
                <Plus size={14} /> Añadir efecto
              </Button>
            </div>

            {statusEffects.length === 0 ? (
              <p className={styles.emptyHistory}>Sin efectos</p>
            ) : (
              <ul className={styles.effectsList}>
                {statusEffects.map((eff) => {
                  const isActive = eff.active !== false
                  const targetLabel = eff.bonusTarget
                    ? eff.bonusTarget.startsWith('skill:')
                      ? `Habilidad: ${SKILLS.find(s => s.id === eff.bonusTarget!.replace('skill:', ''))?.name ?? eff.bonusTarget.replace('skill:', '')}`
                      : BONUS_TARGET_LABELS[eff.bonusTarget] ?? eff.bonusTarget
                    : null
                  const isEditing = editingEffectId === eff.id

                  const startEdit = () => {
                    setEditingEffectId(eff.id)
                    setEditName(eff.name)
                    setEditDesc(eff.description ?? '')
                    setEditDuration(eff.duration ?? '')
                    if (eff.bonusTarget?.startsWith('skill:')) {
                      setEditTarget('skill')
                      setEditSkillId(eff.bonusTarget.replace('skill:', ''))
                    } else {
                      setEditTarget(eff.bonusTarget ?? '')
                      setEditSkillId('')
                    }
                    setEditValue(eff.bonusValue ?? 0)
                  }

                  const saveEdit = () => {
                    const resolvedTarget: BonusTarget | undefined =
                      editTarget === 'skill'
                        ? editSkillId ? (`skill:${editSkillId}` as BonusTarget) : undefined
                        : editTarget || undefined
                    updateCharacter(character.id, {
                      statusEffects: statusEffects.map(e => e.id !== eff.id ? e : {
                        ...e,
                        name: editName.trim() || e.name,
                        description: editDesc.trim(),
                        duration: editDuration.trim() || undefined,
                        bonusTarget: resolvedTarget,
                        bonusValue: resolvedTarget !== undefined ? editValue : undefined,
                      })
                    })
                    setEditingEffectId(null)
                  }

                  return (
                    <li key={eff.id} className={`${styles.effectItem} ${!isActive ? styles.effectItemDisabled : ''}`}>
                      {isEditing ? (
                        <div className={styles.effectEditForm}>
                          <input className={styles.effectInput} value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nombre" />
                          <input className={styles.effectInput} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Descripción" />
                          <input className={styles.effectInput} value={editDuration} onChange={e => setEditDuration(e.target.value)} placeholder="Duración" />
                          <div className={styles.effectBonusRow}>
                            <select className={styles.effectSelect} value={editTarget} onChange={e => { setEditTarget(e.target.value as BonusTarget | 'skill' | ''); setEditSkillId('') }}>
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
                              <select className={styles.effectSelect} value={editSkillId} onChange={e => setEditSkillId(e.target.value)}>
                                <option value="">Selecciona habilidad</option>
                                {SKILLS.sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                              </select>
                            )}
                            {editTarget && (
                              <input className={styles.effectValueInput} type="number" value={editValue === 0 ? '' : editValue} onChange={e => setEditValue(parseInt(e.target.value) || 0)} placeholder="+2" />
                            )}
                          </div>
                          <div className={styles.effectEditActions}>
                            <button className={styles.effectSaveBtn} onClick={saveEdit} title="Guardar"><Check size={14} /> Guardar</button>
                            <button className={styles.effectRemoveBtn} onClick={() => setEditingEffectId(null)} title="Cancelar"><X size={14} /></button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={styles.effectItemHeader}>
                            <button
                              className={`${styles.effectToggleBtn} ${isActive ? styles.effectToggleOn : styles.effectToggleOff}`}
                              onClick={() => updateCharacter(character.id, {
                                statusEffects: statusEffects.map(e => e.id === eff.id ? { ...e, active: !isActive } : e)
                              })}
                              title={isActive ? 'Desactivar' : 'Activar'}
                            >
                              <Power size={13} />
                            </button>
                            <span className={styles.effectName}>{eff.name}</span>
                            <div className={styles.effectItemActions}>
                              <button className={styles.effectEditBtn} onClick={startEdit} title="Editar"><Pencil size={13} /></button>
                              <button className={styles.effectRemoveBtn} onClick={() => updateCharacter(character.id, { statusEffects: statusEffects.filter(e => e.id !== eff.id) })} title="Eliminar"><X size={14} /></button>
                            </div>
                          </div>
                          {targetLabel && eff.bonusValue !== undefined && (
                            <div className={`${styles.effectBonus} ${eff.bonusValue >= 0 ? styles.effectBonusPos : styles.effectBonusNeg}`}>
                              {eff.bonusValue >= 0 ? `+${eff.bonusValue}` : eff.bonusValue} a {targetLabel}
                            </div>
                          )}
                          {eff.duration && <div className={styles.effectDuration}>Duración: {eff.duration}</div>}
                          {eff.description && <div className={styles.effectDesc}>{eff.description}</div>}
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className={styles.header}>
        <Link to={`/characters/${id}`} className={styles.backLink}>
          <ArrowLeft size={20} />
          Volver
        </Link>
        <div className={styles.headerRight}>
          <h1>Modo Juego — {character.name}</h1>
          <button
            className={`${styles.statusBtn} ${statusEffects.length > 0 ? styles.statusBtnActive : ''}`}
            onClick={() => setShowStatusEffects(true)}
          >
            <Activity size={16} />
            {statusEffects.length > 0 && (
              <span className={styles.statusBadge}>{statusEffects.length}</span>
            )}
          </button>
          <button
            className={`${styles.statusBtn} ${dicePanelOpen ? styles.statusBtnActive : ''}`}
            onClick={() => setDicePanelOpen(!dicePanelOpen)}
          >
            <Dices size={16} />
          </button>
        </div>
      </header>

      <div className={styles.pageLayout}>
        {/* ── Tab Shell ── */}
        <div className={styles.tabShell}>
          {/* HP Tracker — always visible */}
          <Card padding="lg" className={styles.hpPanel}>
            <div className={styles.hpDisplay}>
              <Button variant="danger" size="lg" onClick={() => adjustHP(-1)}>
                <Minus size={20} />
              </Button>
              <div className={styles.hpValue}>
                <span className={character.hp.current <= character.hp.max * 0.25 ? styles.critical : ''}>
                  {character.hp.current}
                </span>
                <span className={styles.hpMax}>/ {character.hp.max}</span>
              </div>
              <Button variant="primary" size="lg" onClick={() => adjustHP(1)}>
                <Plus size={20} />
              </Button>
            </div>
            <div className={styles.hpControls}>
              <Button variant="danger" size="sm" onClick={() => adjustHP(-Math.ceil(character.hp.max / 4))}>-1/4</Button>
              <Button variant="secondary" size="sm" onClick={() => adjustHP(-5)}>-5</Button>
              <Button variant="secondary" size="sm" onClick={() => adjustHP(5)}>+5</Button>
              <Button variant="primary" size="sm" onClick={() => adjustHP(Math.ceil(character.hp.max / 4))}>+1/4</Button>
            </div>
          </Card>

          {/* Tab Navigation */}
          <nav className={styles.tabNav}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'combat' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('combat')}
            >
              <Swords size={16} /> COMBATE
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'skills' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              <Brain size={16} /> HABILIDADES
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'spells' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('spells')}
            >
              <BookOpen size={16} /> CONJUROS
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'dice' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('dice')}
            >
              <Dices size={16} /> DADOS
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'encounter' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('encounter')}
            >
              <Swords size={16} /> ENCUENTRO
            </button>
          </nav>

          {/* ─── TAB: COMBATE ─── */}
          {activeTab === 'combat' && (
            <div className={styles.tabContent}>
              {/* Combat Stats Bar */}
              <div className={styles.combatStats}>
                {([
                  { label: 'CA',  value: ac + effectAC,           bonus: effectAC,         fmt: (v: number) => `${v}` },
                  { label: 'INI', value: initiative + effectInitiative, bonus: effectInitiative, fmt: (v: number) => v >= 0 ? `+${v}` : `${v}` },
                  { label: 'CMB', value: cmb + effectCMB,         bonus: effectCMB,         fmt: (v: number) => v >= 0 ? `+${v}` : `${v}` },
                  { label: 'CMD', value: cmd + effectCMD,         bonus: effectCMD,         fmt: (v: number) => `${v}` },
                  { label: 'BAB', value: bab,                     bonus: 0,                 fmt: (v: number) => `+${v}` },
                ] as { label: string; value: number; bonus: number; fmt: (v: number) => string }[]).map(({ label, value, bonus, fmt }) => (
                  <div key={label} className={styles.statPill}>
                    <span className={styles.statPillLabel}>{label}</span>
                    <span className={styles.statPillValue}>{fmt(value)}</span>
                    {bonus !== 0 && (
                      <span className={bonus > 0 ? styles.effectBadgePos : styles.effectBadgeNeg}>
                        {bonus > 0 ? `+${bonus}` : bonus}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Weapons */}
              <Card padding="md">
                <h3 className={styles.sectionTitle}><Shield size={18} />Ataques</h3>
                <div className={styles.weaponList}>
                  {character.weapons && character.weapons.length > 0 ? (
                    character.weapons.map((weapon) => {
                      const atkTotal = bab + weapon.attackBonus + effectAttack
                      const dmgNotation = addModifierToNotation(weapon.damage, effectDamage)
                      return (
                        <div key={weapon.id} className={styles.weaponRow}>
                          <div className={styles.weaponInfo}>
                            <span className={styles.weaponName}>{weapon.name}</span>
                            <span className={styles.weaponCrit}>×{weapon.critical || '20/×2'}</span>
                          </div>
                          <div className={styles.weaponBtns}>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleQuickRoll(
                                `1d20+${atkTotal}`,
                                `${weapon.name} (Ataque)`,
                                true
                              )}
                            >
                              Atacar {atkTotal >= 0 ? `+${atkTotal}` : atkTotal}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleQuickRoll(dmgNotation, `${weapon.name} (Daño)`)}
                            >
                              Daño {dmgNotation}
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className={styles.quickRolls}>
                      <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${bab + strMod + effectAttack}`, `Melee (+${bab + strMod + effectAttack})`, true)}>
                        Melee +{bab + strMod + effectAttack}
                      </Button>
                      <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${bab + dexMod + effectAttack}`, `Ranged (+${bab + dexMod + effectAttack})`, true)}>
                        Ranged +{bab + dexMod + effectAttack}
                      </Button>
                      <Button variant="danger" onClick={() => handleQuickRoll(addModifierToNotation(`1d6+${strMod}`, effectDamage), 'Daño Melee')}>
                        Daño Melee {addModifierToNotation(`1d6+${strMod}`, effectDamage)}
                      </Button>
                      <Button variant="danger" onClick={() => handleQuickRoll(addModifierToNotation(`1d8+${dexMod}`, effectDamage), 'Daño Ranged')}>
                        Daño Ranged {addModifierToNotation(`1d8+${dexMod}`, effectDamage)}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Saving Throws */}
              <Card padding="md">
                <h3 className={styles.sectionTitle}><Heart size={18} />Tiros de Salvación</h3>
                <div className={styles.savesRow}>
                  {([
                    { label: 'Fortaleza', base: fortSave, eff: effectFort },
                    { label: 'Reflejos',  base: refSave,  eff: effectRef  },
                    { label: 'Voluntad',  base: willSave, eff: effectWill },
                  ] as { label: string; base: number; eff: number }[]).map(({ label, base, eff }) => {
                    const total = base + eff
                    return (
                      <Button key={label} variant="secondary" onClick={() => handleQuickRoll(`1d20+${total}`, `${label} (+${total})`)}>
                        {label} {total >= 0 ? `+${total}` : total}
                        {eff !== 0 && (
                          <span className={eff > 0 ? styles.effectBadgePos : styles.effectBadgeNeg}>
                            {eff > 0 ? `+${eff}` : eff}
                          </span>
                        )}
                      </Button>
                    )
                  })}
                </div>
              </Card>

              {/* Class Features */}
              {hasAnyFeature && (
                <Card padding="md">
                  <h3 className={styles.sectionTitle}><Zap size={18} />Poderes de Clase</h3>
                  <div className={styles.featureList}>

                    {/* Barbarian Rage */}
                    {barbarianClass && (
                      <div className={`${styles.featureRow} ${raging ? styles.featureRowActive : ''}`}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Rabia {raging && <span className={styles.featureActiveTag}>ACTIVA</span>}</span>
                          <span className={styles.featureMeta}>+4 FUE/CON, +2 Voluntad, −2 CA</span>
                        </div>
                        <div className={styles.featureActions}>
                          <span className={styles.featureUses}>{rageUses}/{rageMaxUses}</span>
                          <Button
                            variant={raging ? 'danger' : 'secondary'}
                            size="sm"
                            onClick={() => {
                              if (!raging && rageUses > 0) { useFeature('rage', rageMaxUses); setRaging(true) }
                              else { setRaging(false) }
                            }}
                            disabled={!raging && rageUses <= 0}
                          >
                            {raging ? 'Fin Rabia' : 'Rabia'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Cleric Channel Energy */}
                    {clericClass && (
                      <div className={styles.featureRow}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Canalizar Energía</span>
                          <span className={styles.featureMeta}>{Math.ceil(clericClass.level / 2)}d6 — CD {10 + Math.floor(clericClass.level / 2) + chaMod}</span>
                        </div>
                        <div className={styles.featureActions}>
                          <span className={styles.featureUses}>{channelUses}/{channelMaxUses}</span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => { useFeature('channel', channelMaxUses); handleQuickRoll(`${Math.ceil(clericClass.level / 2)}d6`, 'Canalizar Energía') }}
                            disabled={channelUses <= 0}
                          >
                            Canalizar
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Rogue Sneak Attack (passive) */}
                    {rogueClass && (
                      <div className={styles.featureRow}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Ataque Furtivo</span>
                          <span className={styles.featureMeta}>+{sneakDice}d6 daño (flanqueo / negado DES)</span>
                        </div>
                        <div className={styles.featureActions}>
                          <Button variant="danger" size="sm" onClick={() => handleQuickRoll(`${sneakDice}d6`, 'Ataque Furtivo (daño extra)')}>
                            Tirar {sneakDice}d6
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Paladin Lay on Hands */}
                    {paladinClass && (
                      <div className={styles.featureRow}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Imponer Manos</span>
                          <span className={styles.featureMeta}>{Math.floor(paladinClass.level / 2)}d6 curación</span>
                        </div>
                        <div className={styles.featureActions}>
                          <span className={styles.featureUses}>{layUses}/{layMaxUses}</span>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => { useFeature('lay', layMaxUses); handleQuickRoll(`${Math.max(1, Math.floor(paladinClass.level / 2))}d6`, 'Imponer Manos') }}
                            disabled={layUses <= 0}
                          >
                            Curar
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Monk Stunning Fist */}
                    {monkClass && (
                      <div className={styles.featureRow}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Puño Aturdidor</span>
                          <span className={styles.featureMeta}>CD {10 + Math.floor(monkClass.level / 2) + wisMod} Fortaleza</span>
                        </div>
                        <div className={styles.featureActions}>
                          <span className={styles.featureUses}>{stunUses}/{stunMaxUses}</span>
                          <Button variant="secondary" size="sm" onClick={() => useFeature('stun', stunMaxUses)} disabled={stunUses <= 0}>Usar</Button>
                        </div>
                      </div>
                    )}

                    {/* Bard — Actuación Bárdica */}
                    {bardClass && (
                      <div className={styles.featureRow}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Actuación Bárdica</span>
                          <span className={styles.featureMeta}>+{1 + Math.floor(bardClass.level / 6)} ataque/daño aliados (Inspirar Valor)</span>
                        </div>
                        <div className={styles.featureActions}>
                          <span className={styles.featureUses}>{bardPerfUses}/{bardPerfMaxRounds} rondas</span>
                          <Button variant="secondary" size="sm" onClick={() => useFeature('bardperf', bardPerfMaxRounds)} disabled={bardPerfUses <= 0}>−1 ronda</Button>
                        </div>
                      </div>
                    )}

                    {/* Druid — Forma Salvaje */}
                    {druidClass && druidClass.level >= 4 && (
                      <div className={styles.featureRow}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Forma Salvaje</span>
                          <span className={styles.featureMeta}>{druidClass.level}h duración · Pequeño-{druidClass.level >= 6 ? 'Grande' : 'Mediano'}</span>
                        </div>
                        <div className={styles.featureActions}>
                          <span className={styles.featureUses}>{wildShapeUses}/{wildShapeMaxUses}</span>
                          <Button variant="secondary" size="sm" onClick={() => useFeature('wildshape', wildShapeMaxUses)} disabled={wildShapeUses <= 0}>Usar</Button>
                        </div>
                      </div>
                    )}

                    {/* Fighter — passive info */}
                    {fighterClass && (
                      <div className={styles.featureRow}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Entrenamiento con Armas</span>
                          <span className={styles.featureMeta}>+{Math.floor((fighterClass.level - 1) / 4) + 1} ataque/daño (grupo principal)</span>
                        </div>
                        <div className={styles.featureActions}>
                          <span className={styles.featureMeta}>Pasivo</span>
                        </div>
                      </div>
                    )}

                    {/* Ranger — Favored Enemy */}
                    {rangerClass && (
                      <div className={styles.featureRow}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Enemigo Predilecto</span>
                          <span className={styles.featureMeta}>+{2 + 2 * Math.floor((rangerClass.level - 1) / 5)} ataque/daño/habilidades</span>
                        </div>
                        <div className={styles.featureActions}>
                          <span className={styles.featureMeta}>Pasivo</span>
                        </div>
                      </div>
                    )}

                    {/* Alchemist — Bombs */}
                    {alchemistClass && (
                      <>
                        <div className={styles.featureRow}>
                          <div className={styles.featureInfo}>
                            <span className={styles.featureName}>Bomba</span>
                            <span className={styles.featureMeta}>{Math.ceil(alchemistClass.level / 2)}d6+{intMod} fuego · salpicadura {Math.ceil(alchemistClass.level / 2)} daño</span>
                          </div>
                          <div className={styles.featureActions}>
                            <span className={styles.featureUses}>{bombUses}/{bombMaxUses}</span>
                            <Button variant="danger" size="sm" onClick={() => { useFeature('bomb', bombMaxUses); handleQuickRoll(`${Math.ceil(alchemistClass.level / 2)}d6+${intMod}`, 'Bomba') }} disabled={bombUses <= 0}>Lanzar</Button>
                          </div>
                        </div>
                        <div className={styles.featureRow}>
                          <div className={styles.featureInfo}>
                            <span className={styles.featureName}>Mutágeno</span>
                            <span className={styles.featureMeta}>+{2 + Math.floor(alchemistClass.level / 4)} armadura natural, +4 atributo físico, −2 mental · {alchemistClass.level} min</span>
                          </div>
                          <div className={styles.featureActions}>
                            <span className={styles.featureUses}>{mutaUses}/1</span>
                            <Button variant="secondary" size="sm" onClick={() => useFeature('mutagen', 1)} disabled={mutaUses <= 0}>Usar</Button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Inquisitor — Sentencia */}
                    {inquisitorClass && (
                      <div className={styles.featureRow}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Sentencia</span>
                          <span className={styles.featureMeta}>+{1 + Math.floor((inquisitorClass.level - 1) / 5)} ataque/daño/salvaciones en combate</span>
                        </div>
                        <div className={styles.featureActions}>
                          <span className={styles.featureUses}>{judgementUses}/{judgementMaxUses}</span>
                          <Button variant="secondary" size="sm" onClick={() => useFeature('judgement', judgementMaxUses)} disabled={judgementUses <= 0}>Iniciar</Button>
                        </div>
                      </div>
                    )}

                    {/* Cavalier — Desafío + Táctico */}
                    {cavalierClass && (
                      <>
                        <div className={styles.featureRow}>
                          <div className={styles.featureInfo}>
                            <span className={styles.featureName}>Desafío</span>
                            <span className={styles.featureMeta}>+{cavalierClass.level} daño al objetivo desafiado</span>
                          </div>
                          <div className={styles.featureActions}>
                            <span className={styles.featureUses}>{challengeUses}/{challengeMaxUses}</span>
                            <Button variant="secondary" size="sm" onClick={() => useFeature('challenge', challengeMaxUses)} disabled={challengeUses <= 0}>Desafiar</Button>
                          </div>
                        </div>
                        {cavalierClass.level >= 5 && (
                          <div className={styles.featureRow}>
                            <div className={styles.featureInfo}>
                              <span className={styles.featureName}>Táctico</span>
                              <span className={styles.featureMeta}>Aliados usan tu dote de trabajo en equipo · {Math.floor(cavalierClass.level / 5) + 1} min</span>
                            </div>
                            <div className={styles.featureActions}>
                              <span className={styles.featureUses}>{tacticianUses}/1</span>
                              <Button variant="secondary" size="sm" onClick={() => useFeature('tactician', 1)} disabled={tacticianUses <= 0}>Activar</Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Magus — Reserva Arcana */}
                    {maguClass && (
                      <div className={styles.featureRow}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Reserva Arcana</span>
                          <span className={styles.featureMeta}>Potenciar arma (+{1 + Math.floor(maguClass.level / 4)}) o recuperar hechizo</span>
                        </div>
                        <div className={styles.featureActions}>
                          <span className={styles.featureUses}>{arcanePoolUses}/{arcanePoolMax}</span>
                          <Button variant="secondary" size="sm" onClick={() => useFeature('arcanepool', arcanePoolMax)} disabled={arcanePoolUses <= 0}>Gastar</Button>
                        </div>
                      </div>
                    )}

                    {/* Gunslinger — Valor */}
                    {gunslingerClass && (
                      <div className={styles.featureRow}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Valor (Grit)</span>
                          <span className={styles.featureMeta}>Se recupera: matar con arma de fuego / crítico con arma de fuego</span>
                        </div>
                        <div className={styles.featureActions}>
                          <span className={styles.featureUses}>{gritUses}/{gritMax}</span>
                          <Button variant="secondary" size="sm" onClick={() => useFeature('grit', gritMax)} disabled={gritUses <= 0}>Gastar</Button>
                          <Button variant="primary" size="sm" onClick={() => updateCharacter(character.id, { classFeatureUses: { ...featureUses, grit: Math.min((featureUses['grit'] ?? gritMax) + 1, gritMax) } })} disabled={gritUses >= gritMax}>+1</Button>
                        </div>
                      </div>
                    )}

                    {/* Shifter — Aspecto */}
                    {shifterClass && (
                      <div className={styles.featureRow}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Aspecto</span>
                          <span className={styles.featureMeta}>Garras {Math.ceil(shifterClass.level / 4)}d6 + bonos de aspecto animal</span>
                        </div>
                        <div className={styles.featureActions}>
                          <span className={styles.featureUses}>{aspectUses}/{aspectRoundsMax} rondas</span>
                          <Button variant="secondary" size="sm" onClick={() => useFeature('aspect', aspectRoundsMax)} disabled={aspectUses <= 0}>−1 ronda</Button>
                        </div>
                      </div>
                    )}

                    {/* Oracle — Canal de Energía */}
                    {oracleClass && (
                      <div className={styles.featureRow}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Canal de Energía (Oráculo)</span>
                          <span className={styles.featureMeta}>{Math.ceil(oracleClass.level / 2)}d6 — CD {10 + Math.floor(oracleClass.level / 2) + chaMod}</span>
                        </div>
                        <div className={styles.featureActions}>
                          <span className={styles.featureUses}>{oracleChannelUses}/{oracleChannelMax}</span>
                          <Button variant="secondary" size="sm" onClick={() => { useFeature('ochannel', oracleChannelMax); handleQuickRoll(`${Math.ceil(oracleClass.level / 2)}d6`, 'Canal de Energía') }} disabled={oracleChannelUses <= 0}>Canalizar</Button>
                        </div>
                      </div>
                    )}

                    {/* Witch — Hexo (genérico) */}
                    {witchClass && (
                      <div className={styles.featureRow}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Hexos</span>
                          <span className={styles.featureMeta}>1 vez/objetivo/día · CD {10 + Math.floor(witchClass.level / 2) + intMod}</span>
                        </div>
                        <div className={styles.featureActions}>
                          <span className={styles.featureMeta}>Ver lista</span>
                        </div>
                      </div>
                    )}

                    {/* Summoner — Eidolón passive info */}
                    {summonerClass && (
                      <div className={styles.featureRow}>
                        <div className={styles.featureInfo}>
                          <span className={styles.featureName}>Eídolón</span>
                          <span className={styles.featureMeta}>PV: {summonerClass.level * 10 + chaMod} · BBA: {summonerClass.level} · {Math.floor(summonerClass.level / 2) + 4} puntos de evolución</span>
                        </div>
                        <div className={styles.featureActions}>
                          <span className={styles.featureMeta}>Compañero</span>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Passive class features from data */}
                  {character.classes.map((cls) => {
                    const cd = getClassById(cls.id)
                    if (!cd) return null
                    const passive = cd.features.filter(
                      (f) => f.level <= cls.level && !INTERACTIVE_FEATURE_NAMES.has(f.name)
                    )
                    if (passive.length === 0) return null
                    return (
                      <div key={cls.id} className={styles.passiveFeaturesGroup}>
                        <span className={styles.passiveGroupLabel}>{cd.name}</span>
                        <div className={styles.passiveFeaturesList}>
                          {passive.map((f) => (
                            <span key={`${f.name}-${f.level}`} className={styles.passiveFeaturePill} title={f.description}>
                              {f.name}
                              <span className={styles.passiveFeatureLevel}>Nv{f.level}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </Card>
              )}
            </div>
          )}

          {/* ─── TAB: HABILIDADES ─── */}
          {activeTab === 'skills' && (
            <div className={styles.tabContent}>
              <Card padding="md">
                <h3 className={styles.sectionTitle}><Brain size={18} />Habilidades con Rangos</h3>
                {character.skills && character.skills.length > 0 ? (
                  <div className={styles.skillsGrid}>
                    {character.skills
                      .filter((sr) => sr.ranks > 0)
                      .map((skillRank) => {
                        const skillDef = SKILLS.find((s) => s.id === skillRank.id)
                        if (!skillDef) return null
                        const abilityMod = calculateModifier(abilities[skillDef.ability])
                        const miscTotal = (skillRank.miscBonuses ?? []).reduce((s, b) => s + b.value, 0)
                        const isClassSkill = classSkillIds.includes(skillRank.id)
                        const classBonus = isClassSkill && skillRank.ranks > 0 ? 3 : 0
                        const skillEffectBonus = getEffectBonus(statusEffects, `skill:${skillRank.id}` as BonusTarget)
                        const total = skillRank.ranks + abilityMod + miscTotal + classBonus + skillEffectBonus
                        return (
                          <button
                            key={skillRank.id}
                            className={styles.skillBtn}
                            onClick={() => handleQuickRoll(`1d20+${total}`, skillDef.name)}
                          >
                            <span className={styles.skillName}>
                              {skillDef.name}
                              {isClassSkill && <span className={styles.classSkillDot}>●</span>}
                            </span>
                            <span className={styles.skillAbility}>{abilityAbbr[skillDef.ability]}</span>
                            <span className={styles.skillBonus}>
                              {total >= 0 ? `+${total}` : total}
                              {skillEffectBonus !== 0 && (
                                <span className={skillEffectBonus > 0 ? styles.effectBadgePos : styles.effectBadgeNeg}>
                                  {skillEffectBonus > 0 ? `+${skillEffectBonus}` : skillEffectBonus}
                                </span>
                              )}
                            </span>
                          </button>
                        )
                      })}
                  </div>
                ) : (
                  <p className={styles.emptyHistory}>Sin habilidades con rangos</p>
                )}
              </Card>

              <Card padding="md">
                <h3 className={styles.sectionTitle}><Brain size={18} />Pruebas de Característica</h3>
                <div className={styles.quickRolls}>
                  <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.strength)}`, 'Prueba FUE')}>Fuerza {getModifierString(abilities.strength)}</Button>
                  <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.dexterity)}`, 'Prueba DES')}>Destreza {getModifierString(abilities.dexterity)}</Button>
                  <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.constitution)}`, 'Prueba CON')}>Constitución {getModifierString(abilities.constitution)}</Button>
                  <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.intelligence)}`, 'Prueba INT')}>Inteligencia {getModifierString(abilities.intelligence)}</Button>
                  <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.wisdom)}`, 'Prueba SAB')}>Sabiduría {getModifierString(abilities.wisdom)}</Button>
                  <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.charisma)}`, 'Prueba CAR')}>Carisma {getModifierString(abilities.charisma)}</Button>
                </div>
              </Card>
            </div>
          )}

          {/* ─── TAB: CONJUROS ─── */}
          {activeTab === 'spells' && (
            <div className={styles.tabContent}>
              {!hasSpells ? (
                <Card padding="md">
                  <p className={styles.emptyHistory}>Sin conjuros configurados para esta clase.</p>
                </Card>
              ) : (
                <>
                  {/* Spell Slots */}
                  {Object.keys(character.spellSlots ?? {}).length > 0 && (
                    <Card padding="md">
                      <h3 className={styles.sectionTitle}><Zap size={18} />Espacios de Conjuro</h3>
                      <div className={styles.slotContainer}>
                        {Object.entries(character.spellSlots ?? {})
                          .sort(([a], [b]) => Number(a) - Number(b))
                          .map(([levelStr, slot]) => {
                            const level = Number(levelStr)
                            return (
                              <div key={level} className={styles.slotRow}>
                                <span className={styles.slotLevel}>Nv {level}</span>
                                <div className={styles.slotPips}>
                                  {Array.from({ length: slot.max }).map((_, i) => (
                                    <button
                                      key={i}
                                      className={`${styles.slotPip} ${i < slot.used ? styles.slotPipUsed : styles.slotPipAvail}`}
                                      onClick={() => toggleSlot(level, i)}
                                      title={i < slot.used ? 'Clic para recuperar' : 'Clic para gastar'}
                                    />
                                  ))}
                                </div>
                                <span className={styles.slotCount}>{slot.max - slot.used}/{slot.max}</span>
                              </div>
                            )
                          })}
                      </div>
                    </Card>
                  )}

                  {/* Spell List */}
                  <Card padding="md">
                    <h3 className={styles.sectionTitle}>
                      <BookOpen size={18} />{isPreparedCaster ? 'Conjuros Preparados Hoy' : 'Conjuros Conocidos'}
                    </h3>
                    {activeSpellIds.length > 0 ? (
                      <div className={styles.spellList}>
                        {activeSpellIds.map((spellId, idx) => {
                          const spell = activeSpellMap[spellId]
                          if (!spell) return null
                          return (
                            <div key={`${spellId}-${idx}`} className={styles.spellRow}>
                              <div className={styles.spellInfo}>
                                <span className={styles.spellName}>{spell.name}</span>
                                <span className={styles.spellMeta}>Nv {spell.level} · {spell.school}{spell.level > 0 ? ` · DC ${10 + spell.level + casterAbilityMod}` : ''}</span>
                              </div>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleQuickRoll(
                                  `1d20+${concentrationBonus}`,
                                  `Concentración — ${spell.name}`
                                )}
                              >
                                Conc. +{concentrationBonus}
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className={styles.emptyHistory}>{isPreparedCaster ? 'Sin conjuros preparados hoy. Prepáralos en la ficha de personaje.' : 'Sin conjuros asignados'}</p>
                    )}
                  </Card>
                </>
              )}
            </div>
          )}

          {/* ─── TAB: DADOS ─── */}
          {activeTab === 'dice' && (
            <div className={styles.tabContent}>
              <Card padding="md">
                <h3 className={styles.sectionTitle}><Dices size={18} />Tirador de Dados</h3>
                <div className={styles.diceRoller}>
                  <div className={styles.diceInput}>
                    <input
                      type="text"
                      value={diceNotation}
                      onChange={(e) => setDiceNotation(e.target.value)}
                      placeholder="1d20+5"
                      className={styles.diceInputField}
                    />
                    <Button variant="primary" onClick={handleRoll} className={rolling ? styles.btnShaking : ''}>
                      Tirar
                    </Button>
                  </div>
                  <div className={styles.presets}>
                    {['1d4', '1d6', '1d8', '1d10', '1d12', '1d20', '2d6', '2d10', '1d100'].map((d) => (
                      <button
                        key={d}
                        className={`${styles.presetBtn} ${rolling ? styles.presetShaking : ''}`}
                        onClick={() => { setDiceNotation(d); handleQuickRoll(d, d) }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Inline result for mobile (hidden on desktop) */}
              {rollResult !== null && (
                <div className={styles.inlineResult}>
                  <span key={rollResult.key} className={styles.resultNumber}>{rollResult.total}</span>
                  {rollResult.rolls.length > 1 && (
                    <span className={styles.rollsDetail}>[{rollResult.rolls.join(' + ')}]</span>
                  )}
                  {lastRollType && <span className={styles.rollType}>{lastRollType}</span>}
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: ENCUENTRO ─── */}
          {activeTab === 'encounter' && (
            <div className={styles.tabContent}>
              {!encounterStarted ? (
                <Card padding="md">
                  <h3 className={styles.sectionTitle}><Swords size={18} />Nuevo Encuentro</h3>
                  <p className={styles.emptyHistory}>Inicia el rastreador para este combate. El personaje se añade automáticamente.</p>
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <Button variant="primary" onClick={startEncounter}>Iniciar Encuentro</Button>
                  </div>
                </Card>
              ) : (
                <>
                  {/* Round counter */}
                  <Card padding="sm">
                    <div className={styles.roundBar}>
                      <span className={styles.roundLabel}>Ronda <strong>{round}</strong></span>
                      <Button variant="primary" size="sm" onClick={nextTurn}>Siguiente Turno →</Button>
                      <Button variant="ghost" size="sm" onClick={endEncounter}>Fin Encuentro</Button>
                    </div>
                  </Card>

                  {/* Combatants list */}
                  <Card padding="md">
                    <h3 className={styles.sectionTitle}>Orden de Combate</h3>
                    <div className={styles.combatantList}>
                      {sortedCombatants.map((c, idx) => (
                        <div
                          key={c.id}
                          className={`${styles.combatantRow} ${idx === activeTurn ? styles.combatantActive : ''} ${c.hp.current === 0 ? styles.combatantDead : ''}`}
                        >
                          <div className={styles.combatantTurnIndicator}>{idx === activeTurn ? '▶' : ''}</div>
                          <div className={styles.combatantInfo}>
                            <span className={styles.combatantName}>{c.name}{c.isPlayer ? ' ★' : ''}</span>
                            <span className={styles.combatantMeta}>INI {c.initiative} · CA {c.ac}</span>
                          </div>
                          <div className={styles.combatantHp}>
                            <Button variant="danger" size="sm" onClick={() => adjustCombatantHp(c.id, -1)}>−</Button>
                            <span className={`${styles.combatantHpValue} ${c.hp.current <= c.hp.max * 0.25 ? styles.critical : ''}`}>
                              {c.hp.current}/{c.hp.max}
                            </span>
                            <Button variant="primary" size="sm" onClick={() => adjustCombatantHp(c.id, 1)}>+</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Add enemy form */}
                  <Card padding="md">
                    <h3 className={styles.sectionTitle}>Añadir Enemigo</h3>
                    <div className={styles.addEnemyForm}>
                      <input
                        className={styles.enemyInput}
                        placeholder="Nombre"
                        value={newEnemyName}
                        onChange={e => setNewEnemyName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addEnemy()}
                      />
                      <label className={styles.enemyLabel}>INI
                        <input className={styles.enemyInputSmall} type="number" value={newEnemyInit} onChange={e => setNewEnemyInit(parseInt(e.target.value) || 0)} />
                      </label>
                      <label className={styles.enemyLabel}>PV
                        <input className={styles.enemyInputSmall} type="number" min={1} value={newEnemyHp} onChange={e => setNewEnemyHp(Math.max(1, parseInt(e.target.value) || 1))} />
                      </label>
                      <label className={styles.enemyLabel}>CA
                        <input className={styles.enemyInputSmall} type="number" min={0} value={newEnemyAc} onChange={e => setNewEnemyAc(parseInt(e.target.value) || 0)} />
                      </label>
                      <Button variant="secondary" size="sm" onClick={addEnemy}>Añadir</Button>
                    </div>
                  </Card>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Side Panel (desktop only) ── */}
        <aside className={styles.sidePanel}>
          <Card padding="md" className={styles.resultCard}>
            <h3 className={styles.sectionTitle}>Resultado</h3>
            <div className={styles.result}>
              {rollResult !== null ? (
                <span key={rollResult.key} className={styles.resultNumber}>{rollResult.total}</span>
              ) : (
                <span className={styles.resultPlaceholder}>-</span>
              )}
              {rollResult !== null && rollResult.rolls.length > 1 && (
                <span className={styles.rollsDetail}>[{rollResult.rolls.join(' + ')}]</span>
              )}
            </div>
            {lastRollType && <span className={styles.rollType}>{lastRollType}</span>}
          </Card>

          <Card padding="md" className={styles.historyCard}>
            <h3 className={styles.sectionTitle}><History size={18} />Historial</h3>
            {history.length === 0 ? (
              <p className={styles.emptyHistory}>Sin tiradas aún</p>
            ) : (
              <ul className={styles.historyList}>
                {history.map((h, i) => (
                  <li key={i} className={`${styles.historyItem} ${h.isCrit ? styles.historyItemCrit : ''} ${h.isFumble ? styles.historyItemFumble : ''}`}>
                    <span className={styles.historyNotation}>
                      {h.isCrit && '⚡ '}{h.isFumble && '💀 '}{h.notation}
                    </span>
                    <span className={styles.historyResult}>{h.result}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card padding="sm" className={styles.statsCard}>
            <div className={styles.miniStats}>
              <div><span>CA</span><strong>{ac}</strong></div>
              <div><span>INI</span><strong>{initiative >= 0 ? `+${initiative}` : initiative}</strong></div>
              <div><span>CMB</span><strong>{cmb >= 0 ? `+${cmb}` : cmb}</strong></div>
              <div><span>CMD</span><strong>{cmd}</strong></div>
              <div><span>BAB</span><strong>+{bab}</strong></div>
            </div>
          </Card>
        </aside>

        {/* ── Dice Panel Floating ── */}
        {dicePanelOpen && (
          <div className={styles.dicePanelFloating}>
            <div className={styles.dicePanelHeader}>
              <span className={styles.dicePanelTitle}><Dices size={16} /> Dados</span>
              <button className={styles.dicePanelClose} onClick={() => setDicePanelOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.dicePanelContent}>
              <div className={styles.dicePanelInput}>
                <input
                  type="text"
                  value={diceNotation}
                  onChange={(e) => setDiceNotation(e.target.value)}
                  placeholder="1d20+5"
                  className={styles.diceInputField}
                  onKeyDown={(e) => e.key === 'Enter' && handleRoll()}
                />
                <Button variant="primary" size="sm" onClick={handleRoll} className={rolling ? styles.btnShaking : ''}>
                  Tirar
                </Button>
              </div>
              <div className={styles.dicePanelPresets}>
                {['1d4', '1d6', '1d8', '1d10', '1d12', '1d20', '2d6', '2d10', '1d100'].map((d) => (
                  <button
                    key={d}
                    className={styles.dicePanelPresetBtn}
                    onClick={() => { setDiceNotation(d); handleQuickRoll(d, d) }}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {rollResult !== null && (
                <div className={styles.dicePanelResult}>
                  <span className={styles.dicePanelResultNumber}>{rollResult.total}</span>
                  {rollResult.rolls.length > 1 && (
                    <span className={styles.dicePanelRollsDetail}>[{rollResult.rolls.join(' + ')}]</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
