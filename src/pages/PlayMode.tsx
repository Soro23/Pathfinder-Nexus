import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Dices, Shield, Brain,
  Swords, X, Zap, BookOpen, Activity, Menu, Backpack, ScrollText, NotebookPen
} from 'lucide-react'
import { useCharacterStore, calculateModifier, getModifierString, generateId } from '../store'
import type { JournalEntry } from '../store'
import { getClassById, getRaceById, useSRDStore, calculateSpellDC } from '../data'
import { resolveModifiers, computeCombatStats, computeEffectiveMaxHp, computeWeaponAttackBonus, computeSkillTotal, isClassSkillForCharacter, getStrDamageBonus, getPowerAttackDamageBonus, getIterativeAttackOffsets, getEncumbranceLevel, getEncumbranceSkillPenalty, getCarryingCapacity, buildRollBreakdown, buildStatExplain, sumSessionModifiers } from '../engine'
import type { ModifierTarget, RollBreakdown, StatExplain } from '../engine'
import { buildArchetypesByClassId } from '../data/resolveArchetype'
import { RAGE_EFFECT_ID, RAGE_EFFECT_MODIFIERS, MUTAGEN_EFFECT_ID, buildMutagenModifiers, MUTAGEN_ABILITY_LABELS } from '../data/classFeatureEffects'
import type { PhysicalAbility } from '../data/classFeatureEffects'
import { useSpellsByIds } from '../hooks/useSpellsByIds'
import { Button, Card, Drawer } from '../components/ui'
import { HpTracker, StatPill, WeaponAttackRow, StatusEffectsPanel, ConditionPanel, ClassFeatureRow, RollExplainDrawer, StatExplainPanel, InventoryManager } from '../components/character'
import styles from './PlayMode.module.css'

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

type TabId = 'combat' | 'skills' | 'spells' | 'dice' | 'encounter' | 'inventory' | 'background' | 'notes'

interface RollBreakdownInput {
  baseComponents: { label: string; value: number }[]
  targets: ModifierTarget[]
}

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
  'Blessings Menores',
  'Blessings Mayores',
  'Fervor',
])

export function PlayMode() {
  const { skills: SKILLS, getDomainById, getBlessingById, getArchetypeById } = useSRDStore()
  const { id } = useParams<{ id: string }>()
  const character = useCharacterStore((state) => state.getCharacter(id || ''))
  const updateCharacter = useCharacterStore((state) => state.updateCharacter)

  const [activeTab, setActiveTab] = useState<TabId>('combat')
  const [diceNotation, setDiceNotation] = useState('1d20')
  const [dicePool, setDicePool] = useState<Record<number, number>>({})
  const [rollResult, setRollResult] = useState<{ total: number; rolls: number[]; key: number } | null>(null)
  const [lastRollType, setLastRollType] = useState('')
  const [history, setHistory] = useState<{ notation: string; result: number; isCrit?: boolean; isFumble?: boolean }[]>([])
  const [rollBreakdown, setRollBreakdown] = useState<RollBreakdown | null>(null)
  const [statExplain, setStatExplain] = useState<StatExplain | null>(null)
  const [rolling, setRolling] = useState(false)
  const [dicePanelOpen, setDicePanelOpen] = useState(false)
  const [tabMenuOpen, setTabMenuOpen] = useState(false)
  const [showStatusEffects, setShowStatusEffects] = useState(false)
  const [hpDrawerOpen, setHpDrawerOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')

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

  // ── Mutagen state ──
  const [mutagenActive, setMutagenActive] = useState(false)

  // ── Power Attack toggle ──
  const [powerAttackActive, setPowerAttackActive] = useState(false)

  const { spells: spellMap } = useSpellsByIds(character?.spells ?? [])
  const { spells: preparedSpellMap } = useSpellsByIds(character?.preparedSpells ?? [])

  // Hook llamado siempre (con valores por defecto si aún no hay personaje) para no violar
  // las reglas de hooks: en una carga directa de la URL, el store está vacío en el primer
  // render y `character` pasa de undefined a definido entre renders — si este cálculo se
  // hiciera después del `return` de "no encontrado", React vería un número de hooks distinto
  // entre renders y lanzaría el error #310 (pantalla en blanco).
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
  const classData = getClassById(character.classes[0]?.id || '')   // mantener — se usa en hasSpells, concentrationBonus
  const raceLabel = getRaceById(character.race?.toLowerCase() ?? '')?.label ?? character.race
  const classSummary = character.classes
    .map((cc) => `${getClassById(cc.id)?.name ?? cc.id} ${cc.level}`)
    .join(' / ')
  const archetypesByClassId = buildArchetypesByClassId(character.classes, getArchetypeById)
  const totalWeight = (character.inventory ?? []).reduce((sum, item) => sum + item.weight * item.quantity, 0)
  const combat = computeCombatStats(character, resolvedStats, totalWeight)
  const { bab, strMod, dexMod, ac, cmb, cmd, initiative } = combat
  const touchAC = combat.acTouch
  const flatFootedAC = combat.acFlatFooted
  const fortSave = combat.fortitude
  const refSave = combat.reflex
  const willSave = combat.will

  // Desglose de StaticValue (drawer tipo B) — nota: la Destreza mostrada aquí es la
  // bruta, sin el tope de armadura/carga que sí aplica `combatStats.ts` al total real;
  // el total del pill siempre es el correcto, este desglose es solo orientativo.
  const explainStat = (label: string, total: number, baseComponents: { label: string; value: number }[], targets: ModifierTarget[]) => {
    setStatExplain(buildStatExplain(label, total, baseComponents, resolvedStats.allModifiers, targets))
  }
  const isAltered = (targets: ModifierTarget[]) => sumSessionModifiers(resolvedStats.allModifiers, targets) !== 0
  const cmbEffect = sumSessionModifiers(resolvedStats.allModifiers, ['cmb'])
  const cmdEffect = sumSessionModifiers(resolvedStats.allModifiers, ['cmd'])

  const equippedArmorAcp = (character.armor ?? [])
    .filter((a) => a.equipped && a.type !== 'shield')
    .reduce((sum, a) => sum + (a.armorCheckPenalty ?? 0), 0)
  const encumbrancePenalty = getEncumbranceSkillPenalty(getEncumbranceLevel(totalWeight, character.abilities.strength))

  // PV máximos efectivos: PV base + bonos del motor (dotes/objetos como Toughness), con
  // el suelo de 1 PV y la penalización de nivel negativo ya resueltos por el motor.
  const effectiveMaxHp = computeEffectiveMaxHp(character, resolvedStats)

  // Power Attack
  const hasPowerAttack = character.feats.some(f => f.id === 'power-attack')
  const powerAttackPenalty = Math.floor(bab / 4) + 1
  const powerAttackDmgBonus = powerAttackPenalty * 2

  const statusEffects = character.statusEffects ?? []
  const conditions = character.conditions ?? []
  const activeConditionsCount = conditions.filter((c) => c.active).length

  const toggleCondition = (id: string, label: string) => {
    const found = conditions.find((c) => c.id === id)
    const next = found
      ? conditions.map((c) => c.id === id ? { ...c, active: !c.active } : c)
      : [...conditions, { id, label, active: true }]
    updateCharacter(character.id, { conditions: next })
  }

  const addJournalEntry = () => {
    if (!noteDraft.trim()) return
    const entry: JournalEntry = {
      id: generateId(),
      date: new Date().toISOString().slice(0, 10),
      content: noteDraft.trim(),
      importantCharacters: [],
      discoveredPlaces: [],
    }
    updateCharacter(character.id, { journalEntries: [...(character.journalEntries ?? []), entry] })
    setNoteDraft('')
  }

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
    setDicePool({})
  }

  // Cada clic en un preset del panel flotante suma un dado más de ese tipo al cajón
  // (2d4 al primer clic, 3d4 al segundo...); solo se lanzan al pulsar "Tirar".
  const bumpDicePreset = (sides: number) => {
    const nextPool = { ...dicePool, [sides]: (dicePool[sides] ?? 1) + 1 }
    setDicePool(nextPool)
    setDiceNotation(
      Object.entries(nextPool)
        .filter(([, count]) => count > 0)
        .map(([s, count]) => `${count}d${s}`)
        .join('+')
    )
  }

  const handleQuickRoll = (notation: string, name: string, isAttack = false, breakdownInput?: RollBreakdownInput) => {
    triggerRollAnimation(() => {
      const result = rollDice(notation)
      const d20 = result.rolls[0]
      const isCrit = isAttack && d20 === 20
      const isFumble = isAttack && d20 === 1

      setRollResult({ ...result, key: Date.now() })
      setLastRollType(name)
      setHistory((prev) => [{ notation: name, result: result.total, isCrit, isFumble }, ...prev.slice(0, 19)])

      if (breakdownInput) {
        setRollBreakdown(buildRollBreakdown(
          name, d20, result.rolls, result.total,
          breakdownInput.baseComponents, resolvedStats.allModifiers, breakdownInput.targets,
          { isCrit, isFumble },
        ))
      }
    })
  }

  const adjustHP = (amount: number) => {
    if (amount >= 0) {
      const newCurrent = Math.min(effectiveMaxHp, character.hp.current + amount)
      updateCharacter(character.id, { hp: { ...character.hp, current: newCurrent } })
      return
    }
    // Daño: se resta primero de los PV temporales, y solo el resto de los PV actuales.
    const damage = -amount
    const temp = character.hp.temp ?? 0
    const absorbedByTemp = Math.min(temp, damage)
    const remainingDamage = damage - absorbedByTemp
    const newTemp = temp - absorbedByTemp
    const newCurrent = Math.max(0, character.hp.current - remainingDamage)
    updateCharacter(character.id, { hp: { ...character.hp, current: newCurrent, temp: newTemp } })
  }

  const setTempHP = (value: number) => {
    updateCharacter(character.id, { hp: { ...character.hp, temp: value } })
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

  // ── Class feature helpers ──
  const { conMod, intMod, wisMod, chaMod } = combat
  const classByType = (id: string) => character.classes.find(c => c.id === id)

  const barbarianClass = classByType('barbarian')
  const clericClass = classByType('cleric')
  const rogueClass = classByType('rogue')
  const paladinClass = classByType('paladin')
  const monkClass = classByType('monk')
  const bardClass = classByType('bard')
  const druidClass = classByType('druid')
  const fighterClass = classByType('fighter')
  const rangerClass = classByType('ranger')
  const alchemistClass = classByType('alchemist')
  const inquisitorClass = classByType('inquisitor')
  const cavalierClass = classByType('cavalier')
  const maguClass = classByType('magus')
  const gunslingerClass = classByType('gunslinger')
  const shifterClass = classByType('shifter')
  const oracleClass = classByType('oracle')
  const warpriestClass = classByType('warpriest')
  const witchClass = classByType('witch')
  const summonerClass = classByType('summoner')

  // Max uses per day per class
  const rageMaxUses = barbarianClass ? 4 + conMod + 2 * (barbarianClass.level - 1) : 0
  const channelMaxUses = clericClass ? Math.max(1, 3 + chaMod) : 0
  const layMaxUses = paladinClass ? Math.max(1, Math.floor(paladinClass.level / 2) + chaMod) : 0
  const stunMaxUses = monkClass ? monkClass.level + wisMod : 0
  const sneakDice = rogueClass ? Math.ceil(rogueClass.level / 2) : 0
  const bardPerfMaxRounds = bardClass ? 4 + chaMod + 2 * (bardClass.level - 1) : 0
  const wildShapeMaxUses = druidClass && druidClass.level >= 4 ? Math.floor((druidClass.level - 2) / 2) : 0
  const bombMaxUses = alchemistClass ? intMod + alchemistClass.level : 0
  const judgementMaxUses = inquisitorClass ? 1 + Math.floor(inquisitorClass.level / 3) : 0
  const challengeMaxUses = cavalierClass ? 1 + Math.floor((cavalierClass.level - 1) / 4) : 0
  const arcanePoolMax = maguClass ? Math.max(1, Math.floor(maguClass.level / 2) + intMod) : 0
  const gritMax = gunslingerClass ? Math.max(1, wisMod) : 0
  const aspectRoundsMax = shifterClass ? shifterClass.level + wisMod : 0
  const oracleChannelMax = oracleClass ? Math.max(1, 3 + chaMod) : 0
  const fervorDice = warpriestClass && warpriestClass.level >= 2
    ? Math.max(1, Math.floor((warpriestClass.level - 2) / 3) + 1)
    : 0
  const fervorMax = warpriestClass ? Math.max(1, Math.floor(warpriestClass.level / 2) + wisMod) : 0

  const featureUses = character.classFeatureUses ?? {}
  const rageUses = featureUses['rage'] ?? rageMaxUses
  const channelUses = featureUses['channel'] ?? channelMaxUses
  const layUses = featureUses['lay'] ?? layMaxUses
  const stunUses = featureUses['stun'] ?? stunMaxUses
  const bardPerfUses = featureUses['bardperf'] ?? bardPerfMaxRounds
  const wildShapeUses = featureUses['wildshape'] ?? wildShapeMaxUses
  const bombUses = featureUses['bomb'] ?? bombMaxUses
  const mutaUses = featureUses['mutagen'] ?? (alchemistClass ? 1 : 0)
  const judgementUses = featureUses['judgement'] ?? judgementMaxUses
  const challengeUses = featureUses['challenge'] ?? challengeMaxUses
  const tacticianUses = featureUses['tactician'] ?? (cavalierClass ? 1 : 0)
  const arcanePoolUses = featureUses['arcanepool'] ?? arcanePoolMax
  const gritUses = featureUses['grit'] ?? gritMax
  const aspectUses = featureUses['aspect'] ?? aspectRoundsMax
  const oracleChannelUses = featureUses['ochannel'] ?? oracleChannelMax
  const fervorUses = featureUses['fervor'] ?? fervorMax

  const hasAnyFeature = barbarianClass || clericClass || rogueClass || paladinClass || monkClass ||
    bardClass || druidClass || fighterClass || rangerClass || alchemistClass ||
    inquisitorClass || cavalierClass || maguClass || gunslingerClass || shifterClass ||
    oracleClass || witchClass || summonerClass || warpriestClass

  const useFeature = (key: string, max: number) => {
    const current = featureUses[key] ?? max
    if (current <= 0) return
    updateCharacter(character.id, { classFeatureUses: { ...featureUses, [key]: current - 1 } })
  }

  // CF-01: todo poder con usos limitados permite también devolver un uso manualmente
  // (para corregir errores en mesa), no solo gastarlo.
  const restoreFeature = (key: string, max: number) => {
    const current = featureUses[key] ?? max
    if (current >= max) return
    updateCharacter(character.id, { classFeatureUses: { ...featureUses, [key]: current + 1 } })
  }

  // ── Efectos temporales de poderes de clase (CF-02: Rabia, Mutágeno) ──
  const temporaryEffects = character.temporaryEffects ?? []

  const applyTemporaryEffect = (effectId: string, name: string, modifiers: typeof RAGE_EFFECT_MODIFIERS) => {
    const withoutExisting = temporaryEffects.filter((te) => te.id !== effectId)
    updateCharacter(character.id, {
      temporaryEffects: [...withoutExisting, { id: effectId, name, modifiers, active: true }],
    })
  }

  const removeTemporaryEffect = (effectId: string) => {
    updateCharacter(character.id, { temporaryEffects: temporaryEffects.filter((te) => te.id !== effectId) })
  }

  const toggleRage = () => {
    if (!raging && rageUses > 0) {
      useFeature('rage', rageMaxUses)
      applyTemporaryEffect(RAGE_EFFECT_ID, 'Rabia', RAGE_EFFECT_MODIFIERS)
      setRaging(true)
    } else {
      removeTemporaryEffect(RAGE_EFFECT_ID)
      setRaging(false)
    }
  }

  const activateMutagen = (physical: PhysicalAbility) => {
    if (mutaUses <= 0) return
    useFeature('mutagen', 1)
    applyTemporaryEffect(MUTAGEN_EFFECT_ID, 'Mutágeno', buildMutagenModifiers(physical, alchemistClass?.level ?? 1))
    setMutagenActive(true)
  }

  const endMutagen = () => {
    removeTemporaryEffect(MUTAGEN_EFFECT_ID)
    setMutagenActive(false)
  }

  // ── Encounter helpers ──
  const startEncounter = () => {
    const playerCombatant: Combatant = {
      id: character.id,
      name: character.name,
      initiative: initiative + Math.floor(Math.random() * 20) + 1,
      hp: { current: character.hp.current, max: effectiveMaxHp },
      ac: ac,
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
      {/* ── Drawer tipo A: resultado de tirada (incluye crítico/pifia como caso especial) ── */}
      <Drawer open={rollBreakdown !== null} onClose={() => setRollBreakdown(null)} title="Resultado">
        {rollBreakdown && (
          <RollExplainDrawer
            breakdown={rollBreakdown}
            onConfirmCrit={() => {
              handleQuickRoll('1d20', 'Confirmar Crítico')
              setRollBreakdown(null)
            }}
          />
        )}
      </Drawer>

      {/* ── Drawer tipo B: explicación de StaticValue (CA, Toque, CMB, CMD, BAB, INI...) ── */}
      <Drawer open={statExplain !== null} onClose={() => setStatExplain(null)} title={statExplain?.label ?? ''}>
        {statExplain && <StatExplainPanel explain={statExplain} />}
      </Drawer>

      {/* ── Drawer de PV: se abre desde el recuadro de vida en la cabecera ── */}
      <Drawer open={hpDrawerOpen} onClose={() => setHpDrawerOpen(false)} title="Gestión de PV">
        <HpTracker
          current={character.hp.current}
          max={effectiveMaxHp}
          temp={character.hp.temp ?? 0}
          onAdjust={adjustHP}
          onTempChange={setTempHP}
        />
      </Drawer>

      {/* ── Efectos y Condiciones Drawer ── */}
      <Drawer open={showStatusEffects} onClose={() => setShowStatusEffects(false)} title="Efectos y Condiciones">
        <div>
          <h4 className={styles.drawerSectionTitle}>Condiciones</h4>
          <ConditionPanel conditions={conditions} onToggle={toggleCondition} />
        </div>
        <div>
          <h4 className={styles.drawerSectionTitle}>Efectos de estado</h4>
          <StatusEffectsPanel
            statusEffects={statusEffects}
            skills={SKILLS}
            onAdd={(effect) => updateCharacter(character.id, { statusEffects: [...statusEffects, effect] })}
            onUpdate={(id, updates) => updateCharacter(character.id, {
              statusEffects: statusEffects.map((e) => e.id === id ? { ...e, ...updates } : e)
            })}
            onRemove={(id) => updateCharacter(character.id, { statusEffects: statusEffects.filter((e) => e.id !== id) })}
          />
        </div>
      </Drawer>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link to={`/characters/${id}`} className={styles.backLink}>
            <ArrowLeft size={16} />
            Volver
          </Link>
          <div className={styles.headerActions}>
            <button
              className={`${styles.statusBtn} ${(statusEffects.length + activeConditionsCount) > 0 ? styles.statusBtnActive : ''}`}
              onClick={() => setShowStatusEffects(true)}
              title="Efectos y Condiciones"
            >
              <Activity size={16} />
              {(statusEffects.length + activeConditionsCount) > 0 && (
                <span className={styles.statusBadge}>{statusEffects.length + activeConditionsCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Banda de identidad: retrato + nombre + raza/clase/nivel + recuadro de PV */}
        <div className={styles.identityBand}>
          <div className={styles.identityMain}>
            <div className={styles.avatar}>
              {character.imageUrl ? (
                <img src={character.imageUrl} alt={character.name} className={styles.avatarImage} />
              ) : (
                character.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className={styles.identityText}>
              <h1>{character.name}</h1>
              <p className={styles.identitySubtitle}>{raceLabel} · {classSummary}</p>
            </div>
          </div>
          <button
            className={`${styles.hpBadge} ${character.hp.current === 0 ? styles.hpBadgeZero : character.hp.current <= effectiveMaxHp * 0.25 ? styles.hpBadgeCritical : ''}`}
            onClick={() => setHpDrawerOpen(true)}
            title="Gestionar PV"
          >
            <span className={styles.hpBadgeCurrent}>{character.hp.current}</span>
            <span className={styles.hpBadgeSep}>/</span>
            <span className={styles.hpBadgeMax}>{effectiveMaxHp}</span>
          </button>
        </div>

        {/* ── Grupo: Defensa (CA/Toque/Desprevenido/Iniciativa + CMB/CMD) ── */}
        <div className={styles.headerGroup}>
          <span className={styles.headerGroupLabel}>Defensa</span>
          <div className={styles.defenseBand}>
            <StatPill
              label="CA" value={`${ac}`}
              altered={isAltered(['ac', 'ac_natural', 'ac_deflection', 'ac_dodge', 'ac_armor', 'ac_shield'])}
              onExplain={() => explainStat('CA', ac,
                [{ label: 'Base', value: 10 }, { label: 'Destreza', value: dexMod }, { label: 'Tamaño', value: combat.sizeMod }],
                ['ac', 'ac_natural', 'ac_deflection', 'ac_dodge', 'ac_armor', 'ac_shield'])}
            />
            <StatPill
              label="Toque" value={`${touchAC}`}
              altered={isAltered(['ac', 'ac_deflection', 'ac_dodge'])}
              onExplain={() => explainStat('CA de Toque', touchAC,
                [{ label: 'Base', value: 10 }, { label: 'Destreza', value: dexMod }, { label: 'Tamaño', value: combat.sizeMod }],
                ['ac', 'ac_deflection', 'ac_dodge'])}
            />
            <StatPill
              label="Desprev" value={`${flatFootedAC}`}
              altered={isAltered(['ac', 'ac_natural', 'ac_deflection', 'ac_armor', 'ac_shield'])}
              onExplain={() => explainStat('CA Desprevenido', flatFootedAC,
                [{ label: 'Base', value: 10 }, { label: 'Tamaño', value: combat.sizeMod }],
                ['ac', 'ac_natural', 'ac_deflection', 'ac_armor', 'ac_shield'])}
            />
            <Button
              variant="secondary" size="sm" className={styles.headerRollBtn}
              onClick={() => handleQuickRoll(
                `1d20+${initiative}`, `Iniciativa (${initiative >= 0 ? '+' : ''}${initiative})`, false,
                { baseComponents: [{ label: 'Destreza', value: dexMod }], targets: ['initiative'] },
              )}
            >
              <span className={styles.headerRollLabel}>INI</span>
              <span className={styles.headerRollValue}>{initiative >= 0 ? `+${initiative}` : initiative}</span>
            </Button>
          </div>

          <div className={styles.defenseBand}>
            <Button
              variant="secondary" size="sm" className={styles.headerRollBtn}
              onClick={() => handleQuickRoll(
                `1d20+${cmb}`, `CMB (${cmb >= 0 ? '+' : ''}${cmb})`, false,
                { baseComponents: [{ label: 'BAB', value: bab }, { label: 'Fuerza', value: strMod }], targets: ['cmb'] },
              )}
            >
              <span className={styles.headerRollLabel}>CMB</span>
              <span className={styles.headerRollValue}>
                {cmb >= 0 ? `+${cmb}` : cmb}
                {cmbEffect !== 0 && (
                  <span className={cmbEffect > 0 ? styles.effectBadgePos : styles.effectBadgeNeg}>
                    {cmbEffect > 0 ? `+${cmbEffect}` : cmbEffect}
                  </span>
                )}
              </span>
            </Button>
            <Button
              variant="secondary" size="sm" className={styles.headerRollBtn}
              onClick={() => explainStat('CMD', cmd,
                [{ label: 'Base', value: 10 }, { label: 'BAB', value: bab }, { label: 'Fuerza', value: strMod }, { label: 'Destreza', value: dexMod }],
                ['cmd'])}
            >
              <span className={styles.headerRollLabel}>CMD</span>
              <span className={styles.headerRollValue}>
                {cmd}
                {cmdEffect !== 0 && (
                  <span className={cmdEffect > 0 ? styles.effectBadgePos : styles.effectBadgeNeg}>
                    {cmdEffect > 0 ? `+${cmdEffect}` : cmdEffect}
                  </span>
                )}
              </span>
            </Button>
          </div>
        </div>

        {/* ── Grupo: Stats (FUE/DES/CON/INT/SAB/CAR con modificador y puntuación) ── */}
        <div className={styles.headerGroup}>
          <span className={styles.headerGroupLabel}>Stats</span>
          <div className={styles.headerAbilityGrid}>
            {([
              { label: 'FUE', score: abilities.strength },
              { label: 'DES', score: abilities.dexterity },
              { label: 'CON', score: abilities.constitution },
              { label: 'INT', score: abilities.intelligence },
              { label: 'SAB', score: abilities.wisdom },
              { label: 'CAR', score: abilities.charisma },
            ]).map(({ label, score }) => (
              <button
                key={label}
                className={styles.headerAbilityCard}
                onClick={() => handleQuickRoll(`1d20+${calculateModifier(score)}`, `Prueba ${label}`)}
              >
                <span className={styles.headerAbilityLabel}>{label}</span>
                <span className={styles.headerAbilityMod}>{getModifierString(score)}</span>
                <span className={styles.headerAbilityScore}>{score}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Banda de salvaciones — se tiran en el turno de cualquiera, siempre visibles */}
        <div className={styles.saveBand}>
          {([
            { label: 'Fortaleza', total: fortSave, target: 'save_fort' as ModifierTarget },
            { label: 'Reflejos', total: refSave, target: 'save_ref' as ModifierTarget },
            { label: 'Voluntad', total: willSave, target: 'save_will' as ModifierTarget },
          ]).map(({ label, total, target }) => {
            const eff = sumSessionModifiers(resolvedStats.allModifiers, [target])
            return (
              <Button
                key={label} variant="secondary" size="sm" className={styles.headerRollBtn}
                onClick={() => handleQuickRoll(`1d20+${total}`, `${label} (+${total})`)}
              >
                <span className={styles.headerRollLabel}>{label}</span>
                <span className={styles.headerRollValue}>
                  {total >= 0 ? `+${total}` : total}
                  {eff !== 0 && (
                    <span className={eff > 0 ? styles.effectBadgePos : styles.effectBadgeNeg}>
                      {eff > 0 ? `+${eff}` : eff}
                    </span>
                  )}
                </span>
              </Button>
            )
          })}
        </div>
      </header>

      <div className={styles.pageLayout}>
        {/* ── Tab Shell ── */}
        <div className={styles.tabShell}>
          {/* Roll Result Strip */}
          {rollResult !== null && (
            <div className={styles.rollResultStrip}>
              <span className={styles.rollStripType}>{lastRollType}</span>
              <span key={rollResult.key} className={styles.rollStripTotal}>{rollResult.total}</span>
              {history.length > 1 && (
                <span className={styles.rollStripHistory}>
                  {history.slice(1, 4).map((h, i) => (
                    <span key={i} className={`${styles.rollStripPrev} ${h.isCrit ? styles.historyItemCrit : ''} ${h.isFumble ? styles.historyItemFumble : ''}`}>
                      {h.result}
                    </span>
                  ))}
                </span>
              )}
            </div>
          )}

          {/* ─── TAB: COMBATE ─── */}
          {activeTab === 'combat' && (
            <div className={styles.tabContent}>
              {/* Combat Stats Bar — CA/Toque/Desprevenido/Iniciativa/Salvaciones viven en la cabecera */}
              <div className={styles.combatStats}>
                <StatPill
                  label="BAB" value={`+${bab}`}
                  onExplain={() => explainStat('BAB', bab, [{ label: 'Suma de BAB por clase', value: bab }], [])}
                />
              </div>

              {/* Weapons */}
              <Card padding="md">
                <div className={styles.sectionTitleRow}>
                  <h3 className={styles.sectionTitle}><Shield size={18} />Ataques</h3>
                  {hasPowerAttack && (
                    <button
                      className={`${styles.powerAttackToggle} ${powerAttackActive ? styles.powerAttackToggleActive : ''}`}
                      onClick={() => setPowerAttackActive(v => !v)}
                    >
                      Ataque Poderoso {powerAttackActive ? 'ON' : 'OFF'}
                    </button>
                  )}
                </div>
                <div className={styles.weaponList}>
                  {character.weapons && character.weapons.length > 0 ? (
                    character.weapons.map((weapon) => {
                      const isRanged = weapon.range === 'ranged'
                      const paAtkPenalty = (powerAttackActive && !isRanged) ? -powerAttackPenalty : 0
                      const paDmgBonus = (powerAttackActive && !isRanged) ? getPowerAttackDamageBonus(powerAttackPenalty, weapon.grip) : 0
                      const atkBase = computeWeaponAttackBonus(bab, isRanged ? dexMod : strMod, weapon.attackBonus, resolvedStats, combat.sizeMod, combat.negativeLevelPenalty) + paAtkPenalty
                      const dmgMod = isRanged ? dexMod : getStrDamageBonus(strMod, weapon.grip)
                      const dmgNotation = addModifierToNotation(weapon.damage, resolvedStats.damageBonus + dmgMod + paDmgBonus)
                      const iterativeOffsets = getIterativeAttackOffsets(bab)
                      return (
                        <WeaponAttackRow
                          key={weapon.id}
                          name={weapon.name}
                          critical={weapon.critical}
                          iterativeOffsets={iterativeOffsets}
                          attackBase={atkBase}
                          damageNotation={dmgNotation}
                          onRollAttack={(iterAtk, i) => {
                            const offset = iterativeOffsets[i]
                            const baseComponents = [
                              { label: 'BAB', value: bab },
                              { label: isRanged ? 'Destreza' : 'Fuerza', value: isRanged ? dexMod : strMod },
                              { label: 'Arma', value: weapon.attackBonus },
                            ]
                            if (combat.sizeMod !== 0) baseComponents.push({ label: 'Tamaño', value: combat.sizeMod })
                            if (paAtkPenalty !== 0) baseComponents.push({ label: 'Ataque Poderoso', value: paAtkPenalty })
                            if (combat.negativeLevelPenalty > 0) baseComponents.push({ label: 'Nivel negativo', value: -combat.negativeLevelPenalty })
                            if (offset !== 0) baseComponents.push({ label: 'Ataque iterativo', value: -offset })
                            handleQuickRoll(
                              `1d20+${iterAtk}`,
                              `${weapon.name} (Ataque${i > 0 ? ` ${i + 1}` : ''})`,
                              true,
                              { baseComponents, targets: ['attack'] }
                            )
                          }}
                          onRollDamage={() => handleQuickRoll(dmgNotation, `${weapon.name} (Daño)`)}
                        />
                      )
                    })
                  ) : (
                    <div className={styles.quickRolls}>
                      {(() => {
                        const paAtkPenalty = powerAttackActive ? -powerAttackPenalty : 0
                        const paDmgBonus = powerAttackActive ? powerAttackDmgBonus : 0
                        const meleeAtk = computeWeaponAttackBonus(bab, strMod, 0, resolvedStats, combat.sizeMod, combat.negativeLevelPenalty) + paAtkPenalty
                        const rangedAtk = computeWeaponAttackBonus(bab, dexMod, 0, resolvedStats, combat.sizeMod, combat.negativeLevelPenalty)
                        const iterOffsets = getIterativeAttackOffsets(bab)
                        return (
                          <>
                            {iterOffsets.map((offset, i) => {
                              const atk = meleeAtk - offset
                              const baseComponents = [{ label: 'BAB', value: bab }, { label: 'Fuerza', value: strMod }]
                              if (combat.sizeMod !== 0) baseComponents.push({ label: 'Tamaño', value: combat.sizeMod })
                              if (paAtkPenalty !== 0) baseComponents.push({ label: 'Ataque Poderoso', value: paAtkPenalty })
                              if (combat.negativeLevelPenalty > 0) baseComponents.push({ label: 'Nivel negativo', value: -combat.negativeLevelPenalty })
                              if (offset !== 0) baseComponents.push({ label: 'Ataque iterativo', value: -offset })
                              return (
                                <Button
                                  key={`melee-${i}`}
                                  variant="secondary"
                                  onClick={() => handleQuickRoll(`1d20+${atk}`, `Melee Atq.${i + 1} (${atk >= 0 ? `+${atk}` : atk})`, true, { baseComponents, targets: ['attack'] })}
                                >
                                  Melee {i > 0 ? `Atq.${i + 1} ` : ''}{atk >= 0 ? `+${atk}` : atk}
                                </Button>
                              )
                            })}
                            <Button
                              variant="secondary"
                              onClick={() => handleQuickRoll(`1d20+${rangedAtk}`, `Ranged (+${rangedAtk})`, true, {
                                baseComponents: [{ label: 'BAB', value: bab }, { label: 'Destreza', value: dexMod }],
                                targets: ['attack'],
                              })}
                            >
                              Ranged +{rangedAtk}
                            </Button>
                            <Button variant="danger" onClick={() => handleQuickRoll(addModifierToNotation(`1d6+${strMod}`, resolvedStats.damageBonus + paDmgBonus), 'Daño Melee')}>
                              Daño Melee {addModifierToNotation(`1d6+${strMod}`, resolvedStats.damageBonus + paDmgBonus)}
                            </Button>
                            <Button variant="danger" onClick={() => handleQuickRoll(addModifierToNotation(`1d8+${dexMod}`, resolvedStats.damageBonus), 'Daño Ranged')}>
                              Daño Ranged {addModifierToNotation(`1d8+${dexMod}`, resolvedStats.damageBonus)}
                            </Button>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </Card>

              {/* Class Features */}
              {hasAnyFeature && (
                <Card padding="md">
                  <h3 className={styles.sectionTitle}><Zap size={18} />Poderes de Clase</h3>
                  <div className={styles.featureList}>

                    {/* Barbarian Rage */}
                    {barbarianClass && (
                      <ClassFeatureRow
                        name="Rabia"
                        meta="+4 FUE/CON, +2 Voluntad, −2 CA (mientras esté activa)"
                        active={raging}
                        uses={rageUses}
                        max={rageMaxUses}
                      >
                        <Button variant={raging ? 'danger' : 'secondary'} size="sm" onClick={toggleRage} disabled={!raging && rageUses <= 0}>
                          {raging ? 'Fin Rabia' : 'Rabia'}
                        </Button>
                      </ClassFeatureRow>
                    )}

                    {/* Cleric Channel Energy */}
                    {clericClass && (
                      <ClassFeatureRow
                        name="Canalizar Energía"
                        meta={<>
                          {Math.ceil(clericClass.level / 2)}d6 —{' '}
                          {character.channelType === 'negative' ? 'Negativa (daña vivos)' : 'Positiva (cura vivos)'}{' '}
                          — CD {10 + Math.floor(clericClass.level / 2) + chaMod}
                        </>}
                        uses={channelUses}
                        max={channelMaxUses}
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => { useFeature('channel', channelMaxUses); handleQuickRoll(`${Math.ceil(clericClass.level / 2)}d6`, 'Canalizar Energía') }}
                          disabled={channelUses <= 0}
                        >
                          Canalizar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => restoreFeature('channel', channelMaxUses)} disabled={channelUses >= channelMaxUses}>+1</Button>
                      </ClassFeatureRow>
                    )}

                    {/* Cleric Domain Powers */}
                    {clericClass && (character.selectedDomains ?? []).map(domainId => {
                      const domain = getDomainById(domainId)
                      if (!domain) return null
                      const p1 = domain.powers[0]
                      const p1Max = p1.usesFormula === 'fixed' ? (p1.fixedUses ?? 1) : p1.usesFormula === 'unlimited' ? 99 : Math.max(1, 3 + wisMod)
                      const p1Uses = featureUses[`domain_${domainId}_p1`] ?? p1Max
                      const p2 = domain.powers[1]
                      const hasP2 = p2 && clericClass.level >= p2.unlocksAtLevel
                      const p2Max = p2 ? (p2.usesFormula === 'fixed' ? (p2.fixedUses ?? 1) : p2.usesFormula === 'unlimited' ? 99 : Math.max(1, 3 + wisMod)) : 0
                      const p2Uses = featureUses[`domain_${domainId}_p2`] ?? p2Max
                      return (
                        <React.Fragment key={domainId}>
                          <ClassFeatureRow
                            name={`${domain.name} — ${p1.name}`}
                            meta={p1.usesFormula === 'unlimited' ? 'A voluntad' : `${p1Max}/día`}
                            uses={p1.usesFormula !== 'unlimited' ? p1Uses : undefined}
                            max={p1.usesFormula !== 'unlimited' ? p1Max : undefined}
                          >
                            {p1.usesFormula !== 'unlimited' && (
                              <>
                                <Button variant="secondary" size="sm" onClick={() => useFeature(`domain_${domainId}_p1`, p1Max)} disabled={p1Uses <= 0}>Usar</Button>
                                <Button variant="ghost" size="sm" onClick={() => restoreFeature(`domain_${domainId}_p1`, p1Max)} disabled={p1Uses >= p1Max}>+1</Button>
                              </>
                            )}
                          </ClassFeatureRow>
                          {hasP2 && p2 && (
                            <ClassFeatureRow
                              name={`${domain.name} — ${p2.name}`}
                              meta={p2.usesFormula === 'unlimited' ? 'A voluntad' : `${p2Max}/día`}
                              uses={p2.usesFormula !== 'unlimited' ? p2Uses : undefined}
                              max={p2.usesFormula !== 'unlimited' ? p2Max : undefined}
                            >
                              {p2.usesFormula !== 'unlimited' && (
                                <>
                                  <Button variant="secondary" size="sm" onClick={() => useFeature(`domain_${domainId}_p2`, p2Max)} disabled={p2Uses <= 0}>Usar</Button>
                                  <Button variant="ghost" size="sm" onClick={() => restoreFeature(`domain_${domainId}_p2`, p2Max)} disabled={p2Uses >= p2Max}>+1</Button>
                                </>
                              )}
                            </ClassFeatureRow>
                          )}
                        </React.Fragment>
                      )
                    })}

                    {/* Warpriest Fervor */}
                    {warpriestClass && warpriestClass.level >= 2 && (
                      <ClassFeatureRow
                        name="Fervor"
                        meta={`${fervorDice}d6 — Acción veloz (auto) o estándar (aliado)`}
                        uses={fervorUses}
                        max={fervorMax}
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => { useFeature('fervor', fervorMax); handleQuickRoll(`${fervorDice}d6`, 'Fervor') }}
                          disabled={fervorUses <= 0}
                        >
                          Usar Fervor
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => restoreFeature('fervor', fervorMax)} disabled={fervorUses >= fervorMax}>+1</Button>
                      </ClassFeatureRow>
                    )}

                    {/* Warpriest Blessing Powers */}
                    {warpriestClass && (character.selectedBlessings ?? []).map(blessingId => {
                      const blessing = getBlessingById(blessingId)
                      if (!blessing) return null
                      const minor = blessing.powers[0]
                      const major = blessing.powers[1]
                      const hasMinorUses = minor.costsFervor
                      const majorUnlocked = major && warpriestClass.level >= 10
                      return (
                        <React.Fragment key={blessingId}>
                          <ClassFeatureRow
                            name={<>{blessing.name} — {minor.name} <span style={{ fontSize: '0.7em', opacity: 0.6 }}>(Menor)</span></>}
                            meta={<>
                              {minor.actionType === 'swift' ? 'Acción veloz' : 'Acción estándar'}
                              {minor.costsFervor ? ' · cuesta Fervor' : ' · a voluntad'}
                            </>}
                            uses={hasMinorUses ? fervorUses : undefined}
                            max={hasMinorUses ? fervorMax : undefined}
                            usesLabel={hasMinorUses ? 'Fervor' : undefined}
                          >
                            <></>
                          </ClassFeatureRow>
                          {major && (
                            <ClassFeatureRow
                              name={<>{blessing.name} — {major.name} <span style={{ fontSize: '0.7em', opacity: 0.6 }}>(Mayor)</span></>}
                              meta={majorUnlocked
                                ? (major.actionType === 'swift' ? 'Acción veloz' : 'Acción estándar')
                                : 'Requiere nivel 10'}
                              style={{ opacity: majorUnlocked ? 1 : 0.45 }}
                            >
                              <></>
                            </ClassFeatureRow>
                          )}
                        </React.Fragment>
                      )
                    })}

                    {/* Rogue Sneak Attack (passive) */}
                    {rogueClass && (
                      <ClassFeatureRow name="Ataque Furtivo" meta={`+${sneakDice}d6 daño (flanqueo / negado DES)`}>
                        <Button variant="danger" size="sm" onClick={() => handleQuickRoll(`${sneakDice}d6`, 'Ataque Furtivo (daño extra)')}>
                          Tirar {sneakDice}d6
                        </Button>
                      </ClassFeatureRow>
                    )}

                    {/* Paladin Lay on Hands */}
                    {paladinClass && (
                      <ClassFeatureRow name="Imponer Manos" meta={`${Math.floor(paladinClass.level / 2)}d6 curación`} uses={layUses} max={layMaxUses}>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => { useFeature('lay', layMaxUses); handleQuickRoll(`${Math.max(1, Math.floor(paladinClass.level / 2))}d6`, 'Imponer Manos') }}
                          disabled={layUses <= 0}
                        >
                          Curar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => restoreFeature('lay', layMaxUses)} disabled={layUses >= layMaxUses}>+1</Button>
                      </ClassFeatureRow>
                    )}

                    {/* Monk Stunning Fist */}
                    {monkClass && (
                      <ClassFeatureRow name="Puño Aturdidor" meta={`CD ${10 + Math.floor(monkClass.level / 2) + wisMod} Fortaleza`} uses={stunUses} max={stunMaxUses}>
                        <Button variant="secondary" size="sm" onClick={() => useFeature('stun', stunMaxUses)} disabled={stunUses <= 0}>Usar</Button>
                        <Button variant="ghost" size="sm" onClick={() => restoreFeature('stun', stunMaxUses)} disabled={stunUses >= stunMaxUses}>+1</Button>
                      </ClassFeatureRow>
                    )}

                    {/* Bard — Actuación Bárdica */}
                    {bardClass && (
                      <ClassFeatureRow
                        name="Actuación Bárdica"
                        meta={`+${1 + Math.floor(bardClass.level / 6)} ataque/daño aliados (Inspirar Valor)`}
                        uses={bardPerfUses}
                        max={bardPerfMaxRounds}
                        usesLabel="rondas"
                      >
                        <Button variant="secondary" size="sm" onClick={() => useFeature('bardperf', bardPerfMaxRounds)} disabled={bardPerfUses <= 0}>−1 ronda</Button>
                        <Button variant="ghost" size="sm" onClick={() => restoreFeature('bardperf', bardPerfMaxRounds)} disabled={bardPerfUses >= bardPerfMaxRounds}>+1</Button>
                      </ClassFeatureRow>
                    )}

                    {/* Druid — Forma Salvaje */}
                    {druidClass && druidClass.level >= 4 && (
                      <ClassFeatureRow
                        name="Forma Salvaje"
                        meta={`${druidClass.level}h duración · Pequeño-${druidClass.level >= 6 ? 'Grande' : 'Mediano'}`}
                        uses={wildShapeUses}
                        max={wildShapeMaxUses}
                      >
                        <Button variant="secondary" size="sm" onClick={() => useFeature('wildshape', wildShapeMaxUses)} disabled={wildShapeUses <= 0}>Usar</Button>
                        <Button variant="ghost" size="sm" onClick={() => restoreFeature('wildshape', wildShapeMaxUses)} disabled={wildShapeUses >= wildShapeMaxUses}>+1</Button>
                      </ClassFeatureRow>
                    )}

                    {/* Fighter — passive info */}
                    {fighterClass && (
                      <ClassFeatureRow name="Entrenamiento con Armas" meta={`+${Math.floor((fighterClass.level - 1) / 4) + 1} ataque/daño (grupo principal)`}>
                        <span className={styles.featureMeta}>Pasivo</span>
                      </ClassFeatureRow>
                    )}

                    {/* Ranger — Favored Enemy */}
                    {rangerClass && (
                      <ClassFeatureRow name="Enemigo Predilecto" meta={`+${2 + 2 * Math.floor((rangerClass.level - 1) / 5)} ataque/daño/habilidades`}>
                        <span className={styles.featureMeta}>Pasivo</span>
                      </ClassFeatureRow>
                    )}

                    {/* Alchemist — Bombs */}
                    {alchemistClass && (
                      <>
                        <ClassFeatureRow
                          name="Bomba"
                          meta={`${Math.ceil(alchemistClass.level / 2)}d6+${intMod} fuego · salpicadura ${Math.ceil(alchemistClass.level / 2)} daño`}
                          uses={bombUses}
                          max={bombMaxUses}
                        >
                          <Button variant="danger" size="sm" onClick={() => { useFeature('bomb', bombMaxUses); handleQuickRoll(`${Math.ceil(alchemistClass.level / 2)}d6+${intMod}`, 'Bomba') }} disabled={bombUses <= 0}>Lanzar</Button>
                          <Button variant="ghost" size="sm" onClick={() => restoreFeature('bomb', bombMaxUses)} disabled={bombUses >= bombMaxUses}>+1</Button>
                        </ClassFeatureRow>
                        <ClassFeatureRow
                          name="Mutágeno"
                          active={mutagenActive}
                          meta={`+${2 + Math.floor(alchemistClass.level / 4)} armadura natural, +4 atributo físico, −2 mental (mientras esté activo)`}
                          uses={mutaUses}
                          max={1}
                        >
                          {mutagenActive ? (
                            <Button variant="danger" size="sm" onClick={endMutagen}>Fin Mutágeno</Button>
                          ) : (
                            (['str', 'dex', 'con'] as PhysicalAbility[]).map((ability) => (
                              <Button key={ability} variant="secondary" size="sm" onClick={() => activateMutagen(ability)} disabled={mutaUses <= 0}>
                                {MUTAGEN_ABILITY_LABELS[ability]}
                              </Button>
                            ))
                          )}
                        </ClassFeatureRow>
                      </>
                    )}

                    {/* Inquisitor — Sentencia */}
                    {inquisitorClass && (
                      <ClassFeatureRow
                        name="Sentencia"
                        meta={`+${1 + Math.floor((inquisitorClass.level - 1) / 5)} ataque/daño/salvaciones en combate`}
                        uses={judgementUses}
                        max={judgementMaxUses}
                      >
                        <Button variant="secondary" size="sm" onClick={() => useFeature('judgement', judgementMaxUses)} disabled={judgementUses <= 0}>Iniciar</Button>
                        <Button variant="ghost" size="sm" onClick={() => restoreFeature('judgement', judgementMaxUses)} disabled={judgementUses >= judgementMaxUses}>+1</Button>
                      </ClassFeatureRow>
                    )}

                    {/* Cavalier — Desafío + Táctico */}
                    {cavalierClass && (
                      <>
                        <ClassFeatureRow name="Desafío" meta={`+${cavalierClass.level} daño al objetivo desafiado`} uses={challengeUses} max={challengeMaxUses}>
                          <Button variant="secondary" size="sm" onClick={() => useFeature('challenge', challengeMaxUses)} disabled={challengeUses <= 0}>Desafiar</Button>
                          <Button variant="ghost" size="sm" onClick={() => restoreFeature('challenge', challengeMaxUses)} disabled={challengeUses >= challengeMaxUses}>+1</Button>
                        </ClassFeatureRow>
                        {cavalierClass.level >= 5 && (
                          <ClassFeatureRow
                            name="Táctico"
                            meta={`Aliados usan tu dote de trabajo en equipo · ${Math.floor(cavalierClass.level / 5) + 1} min`}
                            uses={tacticianUses}
                            max={1}
                          >
                            <Button variant="secondary" size="sm" onClick={() => useFeature('tactician', 1)} disabled={tacticianUses <= 0}>Activar</Button>
                            <Button variant="ghost" size="sm" onClick={() => restoreFeature('tactician', 1)} disabled={tacticianUses >= 1}>+1</Button>
                          </ClassFeatureRow>
                        )}
                      </>
                    )}

                    {/* Magus — Reserva Arcana */}
                    {maguClass && (
                      <ClassFeatureRow
                        name="Reserva Arcana"
                        meta={`Potenciar arma (+${1 + Math.floor(maguClass.level / 4)}) o recuperar hechizo`}
                        uses={arcanePoolUses}
                        max={arcanePoolMax}
                      >
                        <Button variant="secondary" size="sm" onClick={() => useFeature('arcanepool', arcanePoolMax)} disabled={arcanePoolUses <= 0}>Gastar</Button>
                        <Button variant="ghost" size="sm" onClick={() => restoreFeature('arcanepool', arcanePoolMax)} disabled={arcanePoolUses >= arcanePoolMax}>+1</Button>
                      </ClassFeatureRow>
                    )}

                    {/* Gunslinger — Valor */}
                    {gunslingerClass && (
                      <ClassFeatureRow
                        name="Valor (Grit)"
                        meta="Se recupera: matar con arma de fuego / crítico con arma de fuego"
                        uses={gritUses}
                        max={gritMax}
                      >
                        <Button variant="secondary" size="sm" onClick={() => useFeature('grit', gritMax)} disabled={gritUses <= 0}>Gastar</Button>
                        <Button variant="primary" size="sm" onClick={() => restoreFeature('grit', gritMax)} disabled={gritUses >= gritMax}>+1</Button>
                      </ClassFeatureRow>
                    )}

                    {/* Shifter — Aspecto */}
                    {shifterClass && (
                      <ClassFeatureRow
                        name="Aspecto"
                        meta={`Garras ${Math.ceil(shifterClass.level / 4)}d6 + bonos de aspecto animal`}
                        uses={aspectUses}
                        max={aspectRoundsMax}
                        usesLabel="rondas"
                      >
                        <Button variant="secondary" size="sm" onClick={() => useFeature('aspect', aspectRoundsMax)} disabled={aspectUses <= 0}>−1 ronda</Button>
                        <Button variant="ghost" size="sm" onClick={() => restoreFeature('aspect', aspectRoundsMax)} disabled={aspectUses >= aspectRoundsMax}>+1</Button>
                      </ClassFeatureRow>
                    )}

                    {/* Oracle — Canal de Energía */}
                    {oracleClass && (
                      <ClassFeatureRow
                        name="Canal de Energía (Oráculo)"
                        meta={`${Math.ceil(oracleClass.level / 2)}d6 — CD ${10 + Math.floor(oracleClass.level / 2) + chaMod}`}
                        uses={oracleChannelUses}
                        max={oracleChannelMax}
                      >
                        <Button variant="secondary" size="sm" onClick={() => { useFeature('ochannel', oracleChannelMax); handleQuickRoll(`${Math.ceil(oracleClass.level / 2)}d6`, 'Canal de Energía') }} disabled={oracleChannelUses <= 0}>Canalizar</Button>
                        <Button variant="ghost" size="sm" onClick={() => restoreFeature('ochannel', oracleChannelMax)} disabled={oracleChannelUses >= oracleChannelMax}>+1</Button>
                      </ClassFeatureRow>
                    )}

                    {/* Witch — Hexo (genérico) */}
                    {witchClass && (
                      <ClassFeatureRow name="Hexos" meta={`1 vez/objetivo/día · CD ${10 + Math.floor(witchClass.level / 2) + intMod}`}>
                        <span className={styles.featureMeta}>Ver lista</span>
                      </ClassFeatureRow>
                    )}

                    {/* Summoner — Eidolón passive info */}
                    {summonerClass && (
                      <ClassFeatureRow
                        name="Eídolón"
                        meta={`PV: ${summonerClass.level * 10 + chaMod} · BBA: ${summonerClass.level} · ${Math.floor(summonerClass.level / 2) + 4} puntos de evolución`}
                      >
                        <span className={styles.featureMeta}>Compañero</span>
                      </ClassFeatureRow>
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
                {character.skills && character.skills.some((sr) => sr.ranks > 0) ? (
                  <div className={styles.skillsTable}>
                    <div className={styles.skillsTableHeader}>
                      <span>Clase</span>
                      <span>Atr</span>
                      <span>Habilidad</span>
                      <span>Bono</span>
                    </div>
                    {character.skills
                      .filter((sr) => sr.ranks > 0)
                      .map((skillRank) => ({ skillRank, skillDef: SKILLS.find((s) => s.id === skillRank.id) }))
                      .filter((row) => row.skillDef !== undefined)
                      .sort((a, b) => a.skillDef!.name.localeCompare(b.skillDef!.name))
                      .map(({ skillRank, skillDef: maybeSkillDef }) => {
                        const skillDef = maybeSkillDef!
                        const isClassSkill = isClassSkillForCharacter({ ...character, archetypesByClassId }, skillRank.id)
                        const skillEffectBonus = resolvedStats.skillBonuses[skillRank.id] ?? 0
                        const total = computeSkillTotal({ ...character, archetypesByClassId }, skillDef, resolvedStats, equippedArmorAcp, encumbrancePenalty)
                        return (
                          <div key={skillRank.id} className={styles.skillsTableRow}>
                            <span className={`${styles.skillProf} ${isClassSkill ? styles.skillProfOn : ''}`}>●</span>
                            <span className={styles.skillMod}>{abilityAbbr[skillDef.ability]}</span>
                            <span className={styles.skillNameCell}>{skillDef.name}</span>
                            <button
                              className={styles.skillBonusBtn}
                              onClick={() => handleQuickRoll(`1d20+${total}`, skillDef.name)}
                            >
                              {total >= 0 ? `+${total}` : total}
                              {skillEffectBonus !== 0 && (
                                <span className={skillEffectBonus > 0 ? styles.effectBadgePos : styles.effectBadgeNeg}>
                                  {skillEffectBonus > 0 ? `+${skillEffectBonus}` : skillEffectBonus}
                                </span>
                              )}
                            </button>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <p className={styles.emptyHistory}>Sin habilidades con rangos</p>
                )}
              </Card>

              <Card padding="md">
                <h3 className={styles.sectionTitle}><Brain size={18} />Pruebas de Característica</h3>
                <div className={styles.abilityGrid}>
                  {([
                    { label: 'Fuerza', abbr: 'FUE', score: abilities.strength },
                    { label: 'Destreza', abbr: 'DES', score: abilities.dexterity },
                    { label: 'Constitución', abbr: 'CON', score: abilities.constitution },
                    { label: 'Inteligencia', abbr: 'INT', score: abilities.intelligence },
                    { label: 'Sabiduría', abbr: 'SAB', score: abilities.wisdom },
                    { label: 'Carisma', abbr: 'CAR', score: abilities.charisma },
                  ]).map(({ label, abbr, score }) => (
                    <button
                      key={abbr}
                      className={styles.abilityCard}
                      onClick={() => handleQuickRoll(`1d20+${calculateModifier(score)}`, `Prueba ${abbr}`)}
                    >
                      <span className={styles.abilityLabel}>{label}</span>
                      <span className={styles.abilityMod}>{getModifierString(score)}</span>
                      <span className={styles.abilityScore}>{score}</span>
                    </button>
                  ))}
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
                                <span className={styles.spellMeta}>Nv {spell.level} · {spell.school}{spell.level > 0 ? ` · DC ${calculateSpellDC(spell.level, casterAbilityMod)}` : ''}</span>
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

          {/* ─── TAB: INVENTARIO ─── */}
          {activeTab === 'inventory' && (
            <div className={styles.tabContent}>
              <Card padding="md">
                <h3 className={styles.sectionTitle}><Backpack size={18} />Inventario</h3>
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
            </div>
          )}

          {/* ─── TAB: TRASFONDO ─── */}
          {activeTab === 'background' && (
            <div className={styles.tabContent}>
              <Card padding="md">
                <h3 className={styles.sectionTitle}><ScrollText size={18} />Trasfondo</h3>
                <div className={styles.backgroundGrid}>
                  <div className={styles.backgroundField}>
                    <span className={styles.backgroundLabel}>Raza</span>
                    <span className={styles.backgroundValue}>{raceLabel}</span>
                  </div>
                  <div className={styles.backgroundField}>
                    <span className={styles.backgroundLabel}>Alineamiento</span>
                    <span className={styles.backgroundValue}>{character.alignment || '—'}</span>
                  </div>
                  <div className={styles.backgroundField}>
                    <span className={styles.backgroundLabel}>Clases</span>
                    <span className={styles.backgroundValue}>{classSummary || '—'}</span>
                  </div>
                  {character.favoredClassId && (
                    <div className={styles.backgroundField}>
                      <span className={styles.backgroundLabel}>Clase Favorecida</span>
                      <span className={styles.backgroundValue}>{getClassById(character.favoredClassId)?.name ?? character.favoredClassId}</span>
                    </div>
                  )}
                </div>
                {character.companion && (
                  <div className={styles.backgroundField}>
                    <span className={styles.backgroundLabel}>Compañero Animal</span>
                    <span className={styles.backgroundValue}>{character.companion.name} (Nivel {character.companion.level})</span>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ─── TAB: NOTAS ─── */}
          {activeTab === 'notes' && (
            <div className={styles.tabContent}>
              <Card padding="md">
                <h3 className={styles.sectionTitle}><NotebookPen size={18} />Diario de Campaña</h3>
                <div className={styles.noteDraftRow}>
                  <textarea
                    className={styles.noteDraftInput}
                    placeholder="Anota algo rápido de la sesión…"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                  />
                  <Button variant="primary" size="sm" onClick={addJournalEntry}>Añadir</Button>
                </div>
                {(character.journalEntries ?? []).length === 0 && (
                  <p className={styles.emptyHistory}>{character.notes || 'Sin entradas todavía.'}</p>
                )}
                <div className={styles.journalList}>
                  {[...(character.journalEntries ?? [])].reverse().map((entry) => (
                    <div key={entry.id} className={styles.journalEntryRow}>
                      <span className={styles.journalEntryDate}>{entry.date}</span>
                      <p className={styles.journalEntryContent}>{entry.content}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

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
                {[4, 6, 8, 10, 12, 20, 100].map((sides) => (
                  <button
                    key={sides}
                    className={styles.dicePanelPresetBtn}
                    onClick={() => bumpDicePreset(sides)}
                  >
                    1d{sides}
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

        {/* ── Menú flotante de secciones ── */}
        {tabMenuOpen && (
          <div className={styles.tabMenuFloating}>
            <div className={styles.dicePanelHeader}>
              <span className={styles.dicePanelTitle}><Menu size={16} /> Secciones</span>
              <button className={styles.dicePanelClose} onClick={() => setTabMenuOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.tabMenuGrid}>
              {([
                { id: 'combat' as TabId, icon: Swords, label: 'COMBATE' },
                { id: 'skills' as TabId, icon: Brain, label: 'HABILIDADES' },
                { id: 'spells' as TabId, icon: BookOpen, label: 'CONJUROS' },
                { id: 'inventory' as TabId, icon: Backpack, label: 'INVENTARIO' },
                { id: 'background' as TabId, icon: ScrollText, label: 'TRASFONDO' },
                { id: 'notes' as TabId, icon: NotebookPen, label: 'NOTAS' },
                { id: 'dice' as TabId, icon: Dices, label: 'DADOS' },
                { id: 'encounter' as TabId, icon: Swords, label: 'ENCUENTRO' },
              ]).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  className={`${styles.tabMenuItem} ${activeTab === id ? styles.tabMenuItemActive : ''}`}
                  onClick={() => { setActiveTab(id); setTabMenuOpen(false) }}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Control fijo inferior-derecha: acceso al menú de secciones con el pulgar ── */}
        <div className={styles.fabCluster}>
          <button
            className={`${styles.fabBtn} ${tabMenuOpen ? styles.fabBtnActive : ''}`}
            onClick={() => setTabMenuOpen(!tabMenuOpen)}
            title="Secciones"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* ── Control fijo inferior-izquierda: acceso a Dados con el pulgar ── */}
        <button
          className={`${styles.diceFab} ${dicePanelOpen ? styles.fabBtnActive : ''}`}
          onClick={() => setDicePanelOpen(!dicePanelOpen)}
          title="Dados"
        >
          <Dices size={18} />
        </button>
      </div>
    </div>
  )
}
