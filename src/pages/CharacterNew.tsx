import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, ChevronDown, Check, Lightbulb, Dice6 } from 'lucide-react'
import { Button, Card, HomebrewBadge, AbilityScoreCard } from '../components/ui'
import { useCharacterStore, generateId, calculateModifier } from '../store'
import type { XpProgressionSpeed } from '../store'
import { getClassById, hasFloatingAbilityBonus } from '../data'
import { useSRDStore } from '../store/srdStore'
import { useHomebrewStore } from '../store/homebrewStore'
import { ArchetypeSelector } from '../components/character/ArchetypeSelector'
import styles from './CharacterNew.module.css'

const CORE_RACES = ['human', 'elf', 'dwarf', 'halfling', 'gnome', 'half-orc', 'half-elf']
const UNCOMMON_RACES = ['kitsune', 'nagaji', 'samsaran', 'wayang', 'vanara', 'grippli', 'strix', 'android']

// ── Class data by category ──
const CLASS_GROUPS: { label: string; classes: { value: string; label: string; role: string; desc: string; hitDie: string }[] }[] = [
  {
    label: 'Clases Principales',
    classes: [
      { value: 'fighter', label: 'Guerrero', role: 'Combate', desc: 'Maestro de las armas y el combate cuerpo a cuerpo.', hitDie: 'd10' },
      { value: 'barbarian', label: 'Bárbaro', role: 'Combate', desc: 'Guerrero primitivo que entra en cólera devastadora.', hitDie: 'd12' },
      { value: 'monk', label: 'Monje', role: 'Combate', desc: 'Artista marcial que domina su cuerpo y mente.', hitDie: 'd8' },
      { value: 'paladin', label: 'Paladín', role: 'Sagrado', desc: 'Campeón sagrado guiado por su código de honor.', hitDie: 'd10' },
      { value: 'ranger', label: 'Explorador', role: 'Natural', desc: 'Guerrero del natural con compañero animal.', hitDie: 'd10' },
      { value: 'rogue', label: 'Pícaro', role: 'Sigilo', desc: 'Experto en habilidades, trampas y ataques furtivos.', hitDie: 'd8' },
      { value: 'wizard', label: 'Mago', role: 'Arcano', desc: 'Lanzador arcano que estudia los secretos del universo.', hitDie: 'd6' },
      { value: 'sorcerer', label: 'Hechicero', role: 'Arcano', desc: 'Magia innata que fluye por su sangre dracónica.', hitDie: 'd6' },
      { value: 'bard', label: 'Bardo', role: 'Arcano', desc: 'Maestro de la música y las artes arcanas.', hitDie: 'd8' },
      { value: 'cleric', label: 'Clérigo', role: 'Divino', desc: 'Canal de poder divino de su deidad.', hitDie: 'd8' },
      { value: 'druid', label: 'Druida', role: 'Natural', desc: 'Guardián de la naturaleza con poder elemental.', hitDie: 'd8' },
    ],
  },
  {
    label: 'Clases Base (APG)',
    classes: [
      { value: 'alchemist', label: 'Alquimista', role: 'Alquimia', desc: 'Maestro de bombas, mutágenos y extractos.', hitDie: 'd8' },
      { value: 'oracle', label: 'Oráculo', role: 'Divino', desc: 'Canaliza poder divino a través de un misterio.', hitDie: 'd8' },
      { value: 'inquisitor', label: 'Inquisidor', role: 'Divino', desc: 'Cazador de herejes con magia divina y combate.', hitDie: 'd8' },
      { value: 'witch', label: 'Bruja', role: 'Arcano', desc: 'Lanzadora arcana con familiar, hexes y patrono.', hitDie: 'd6' },
      { value: 'cavalier', label: 'Caballero', role: 'Combate', desc: 'Guerrero montado vinculado a una orden caballeresca.', hitDie: 'd10' },
      { value: 'magus', label: 'Magus', role: 'Arcano', desc: 'Fusiona hechizos arcanos con combate marcial.', hitDie: 'd8' },
      { value: 'summoner', label: 'Invocador', role: 'Arcano', desc: 'Vinculado a un eidolón extraplanar.', hitDie: 'd8' },
      { value: 'gunslinger', label: 'Pistolero', role: 'Combate', desc: 'Maestro de armas de fuego y chispa.', hitDie: 'd10' },
      { value: 'shifter', label: 'Cambiaformas', role: 'Natural', desc: 'Adopta aspectos y formas animales.', hitDie: 'd10' },
      { value: 'vigilante', label: 'Vigilante', role: 'Sigilo', desc: 'Héroe de doble identidad entre la sociedad y las sombras.', hitDie: 'd8' },
    ],
  },
  {
    label: 'Clases Híbridas (ACG)',
    classes: [
      { value: 'arcanist', label: 'Arcanista', role: 'Arcano', desc: 'Fusión de mago y hechicero con explotaciones arcanas.', hitDie: 'd6' },
      { value: 'bloodrager', label: 'Rabioso de Sangre', role: 'Combate', desc: 'Berserker con linaje mágico que lanza hechizos en furia.', hitDie: 'd10' },
      { value: 'brawler', label: 'Luchador', role: 'Combate', desc: 'Combatiente sin armas: guerrero + monje.', hitDie: 'd10' },
      { value: 'hunter', label: 'Cazador', role: 'Natural', desc: 'Rastreador con compañero animal: druida + explorador.', hitDie: 'd8' },
      { value: 'investigator', label: 'Investigador', role: 'Sigilo', desc: 'Detective alquímico con inspiración e ingenio.', hitDie: 'd8' },
      { value: 'shaman', label: 'Chamán', role: 'Divino', desc: 'Invocador de espíritus: bruja + oráculo.', hitDie: 'd8' },
      { value: 'skald', label: 'Escaldo', role: 'Arcano', desc: 'Bardo bárbaro que inspira con cantos de guerra.', hitDie: 'd8' },
      { value: 'slayer', label: 'Segador', role: 'Sigilo', desc: 'Cazador letal: explorador + pícaro.', hitDie: 'd10' },
      { value: 'swashbuckler', label: 'Espadachín', role: 'Combate', desc: 'Combatiente ágil y elegante con panache.', hitDie: 'd10' },
      { value: 'warpriest', label: 'Sacerdote de Guerra', role: 'Divino', desc: 'Combina fuerza del guerrero con bendiciones del clérigo.', hitDie: 'd8' },
    ],
  },
  {
    label: 'Clases Alternativas',
    classes: [
      { value: 'antipaladin', label: 'Antipaladín', role: 'Oscuro', desc: 'Contraparte oscura del paladín, campeón del mal.', hitDie: 'd10' },
      { value: 'ninja', label: 'Ninja', role: 'Sigilo', desc: 'Espía y asesino con poderes místicos ki.', hitDie: 'd8' },
      { value: 'samurai', label: 'Samurai', role: 'Combate', desc: 'Guerrero noble guiado por código de honor, maestro de la katana.', hitDie: 'd10' },
    ],
  },
  {
    label: 'Clases Ocultas (OA)',
    classes: [
      { value: 'kineticist', label: 'Kineticista', role: 'Psíquico', desc: 'Canal de energía elemental con impulsos cinéticos.', hitDie: 'd8' },
      { value: 'psychic', label: 'Psíquico', role: 'Psíquico', desc: 'Lanzador de máxima potencia que usa la mente como canal.', hitDie: 'd6' },
      { value: 'mesmerist', label: 'Mesmerista', role: 'Psíquico', desc: 'Maestro del encantamiento que hipnotiza con la mirada.', hitDie: 'd8' },
      { value: 'occultist', label: 'Ocultista', role: 'Psíquico', desc: 'Canaliza magia psíquica a través de antigüedades.', hitDie: 'd8' },
      { value: 'medium', label: 'Médium', role: 'Psíquico', desc: 'Canaliza espíritus legendarios que alteran sus capacidades.', hitDie: 'd8' },
      { value: 'spiritualist', label: 'Espiritista', role: 'Psíquico', desc: 'Vinculado a un fantasma ectoplásmico compañero.', hitDie: 'd8' },
    ],
  },
]

const XP_SPEEDS: { value: XpProgressionSpeed; label: string; desc: string }[] = [
  { value: 'slow', label: 'Lenta', desc: 'Campañas largas, subidas de nivel poco frecuentes.' },
  { value: 'medium', label: 'Normal', desc: 'Ritmo estándar de progresión.' },
  { value: 'fast', label: 'Rápida', desc: 'Subidas de nivel frecuentes, ideal para one-shots.' },
]

const ALIGNMENTS = [
  { value: 'lg', label: 'Legal Bueno' },
  { value: 'ng', label: 'Neutral Bueno' },
  { value: 'cg', label: 'Caótico Bueno' },
  { value: 'ln', label: 'Legal Neutral' },
  { value: 'tn', label: 'True Neutral' },
  { value: 'cn', label: 'Caótico Neutral' },
  { value: 'le', label: 'Legal Malvado' },
  { value: 'ne', label: 'Neutral Malvado' },
  { value: 'ce', label: 'Caótico Malvado' },
]

const ABILITY_KEYS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const
type AbilityKey = typeof ABILITY_KEYS[number]

const ABILITY_LABELS: Record<AbilityKey, [string, string]> = {
  strength: ['FUERZA', 'FUE'],
  dexterity: ['DESTREZA', 'DES'],
  constitution: ['CONSTITUCIÓN', 'CON'],
  intelligence: ['INTELIGENCIA', 'INT'],
  wisdom: ['SABIDURÍA', 'SAB'],
  charisma: ['CARISMA', 'CAR'],
}

type AbilityMethod = 'free' | 'pointbuy' | 'standard' | 'heroic' | 'roll4d6'

const ABILITY_METHODS: { id: AbilityMethod; label: string }[] = [
  { id: 'free', label: 'Libre' },
  { id: 'pointbuy', label: 'Compra (25 pts)' },
  { id: 'standard', label: 'Array Estándar' },
  { id: 'heroic', label: 'Array Heroico' },
  { id: 'roll4d6', label: 'Tirar 4d6' },
]

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]
const HEROIC_ARRAY = [18, 16, 14, 12, 10, 8]

function rollStartingGold(notation: string): number {
  const match = notation.match(/^(\d+)d(\d+)\*(\d+)$/)
  if (!match) return 0
  const count = parseInt(match[1])
  const sides = parseInt(match[2])
  const mult = parseInt(match[3])
  let total = 0
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1
  }
  return total * mult
}

function roll4d6DropLowest(): number {
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1)
  rolls.sort((a, b) => a - b)
  return rolls[1] + rolls[2] + rolls[3]
}

type Step = 'race' | 'class' | 'abilities' | 'summary'

const STEPS: { id: Step; label: string; tip: string }[] = [
  { id: 'race', label: 'Raza', tip: 'Tu raza determina tus bonificadores raciales de atributo y habilidades especiales innatas.' },
  { id: 'class', label: 'Clase', tip: 'La clase define tu rol en el grupo: guerrero, lanzador de hechizos, pícaro... cada una tiene habilidades únicas.' },
  { id: 'abilities', label: 'Atributos', tip: 'Elige cómo generar tus atributos: libre, compra de puntos, array predefinido o tirando 4d6 y eliminando el menor.' },
  { id: 'summary', label: 'Resumen', tip: 'Revisa todos los datos antes de crear tu personaje. Podrás editarlos después desde la hoja de personaje.' },
]

const DEFAULT_ABILITIES: Record<AbilityKey, number> = {
  strength: 10, dexterity: 10, constitution: 10,
  intelligence: 10, wisdom: 10, charisma: 10,
}

export function CharacterNew() {
  const navigate = useNavigate()
  const addCharacter = useCharacterStore((state) => state.addCharacter)
  const storeRaces = useSRDStore(s => s.races)
  const fetchAll = useSRDStore(s => s.fetchAll)
  const homebrewRaces = useHomebrewStore(s => s.races)
  const homebrewClasses = useHomebrewStore(s => s.classes)

  useEffect(() => { fetchAll() }, [fetchAll])

  const RACE_GROUPS = [
    { label: 'Razas Principales', races: storeRaces.filter(r => CORE_RACES.includes(r.id)) },
    { label: 'Razas Destacadas', races: storeRaces.filter(r => !CORE_RACES.includes(r.id) && !UNCOMMON_RACES.includes(r.id)) },
    { label: 'Razas Poco Comunes', races: storeRaces.filter(r => UNCOMMON_RACES.includes(r.id)) },
    ...(homebrewRaces.length > 0
      ? [{ label: 'Razas Homebrew', races: homebrewRaces.map(r => ({ ...r, source: r.source ?? 'Homebrew' })) }]
      : []),
  ]

  const ALL_CLASS_GROUPS = [
    ...CLASS_GROUPS,
    ...(homebrewClasses.length > 0
      ? [{
        label: 'Clases Homebrew',
        classes: homebrewClasses.map(c => ({
          value: c.id, label: c.name, role: 'Homebrew', desc: c.description || '—', hitDie: `d${c.hitDie}`,
        })),
      }]
      : []),
  ]
  const ALL_CLASSES = ALL_CLASS_GROUPS.flatMap((g) => g.classes)

  const [step, setStep] = useState<Step>('race')

  const [form, setForm] = useState({
    name: '',
    race: '',
    raceAbilityChoice: '' as AbilityKey | '',
    class: '',
    alignment: 'ng',
    xpProgression: 'medium' as XpProgressionSpeed,
    ...DEFAULT_ABILITIES,
  })

  const [startingGold, setStartingGold] = useState(0)
  const [selectedArchetypeIds, setSelectedArchetypeIds] = useState<string[]>([])
  const [isFavoredClass, setIsFavoredClass] = useState(true)

  // ── Accordion open state (exclusive - only one open at a time) ──
  const [openRaceGroup, setOpenRaceGroup] = useState<string>('Razas Principales')
  const [openClassGroup, setOpenClassGroup] = useState<string>('Clases Principales')

  const toggleRaceGroup = (label: string) =>
    setOpenRaceGroup((prev) => prev === label ? '' : label)
  const toggleClassGroup = (label: string) =>
    setOpenClassGroup((prev) => prev === label ? '' : label)

  // ── Ability method state ──
  const [abilityMethod, setAbilityMethod] = useState<AbilityMethod>('free')
  const [rolledValues, setRolledValues] = useState<number[]>([])
  // assignedRolls: maps AbilityKey → index into current array/roll pool (null = unassigned)
  const [assignedIdx, setAssignedIdx] = useState<Partial<Record<AbilityKey, number>>>({})

  const currentStepIndex = STEPS.findIndex((s) => s.id === step)
  const currentStepData = STEPS[currentStepIndex]

  const updateForm = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const changeMethod = (method: AbilityMethod) => {
    setAbilityMethod(method)
    setAssignedIdx({})
    setRolledValues([])
    setForm((prev) => ({ ...prev, ...DEFAULT_ABILITIES }))
  }

  // ── Point-buy helpers ──
  const totalPoints = 25
  const usedPoints = ABILITY_KEYS.reduce((sum, k) => sum + form[k], 0) - 60
  const remainingPoints = totalPoints - usedPoints

  // ── Array/roll assignment ──
  const currentPool = abilityMethod === 'standard' ? STANDARD_ARRAY
    : abilityMethod === 'heroic' ? HEROIC_ARRAY
      : abilityMethod === 'roll4d6' ? rolledValues
        : []

  const usedIndices = new Set(Object.values(assignedIdx))

  const assignValue = (attr: AbilityKey, poolIndex: number) => {
    const val = currentPool[poolIndex]
    // if already assigned elsewhere, free it
    const prevIdx = assignedIdx[attr]
    const newAssigned = { ...assignedIdx }
    if (prevIdx !== undefined) {
      // unset former ability
    }
    newAssigned[attr] = poolIndex
    setAssignedIdx(newAssigned)
    setForm((prev) => ({ ...prev, [attr]: val }))
  }

  const allAssigned = abilityMethod === 'standard' || abilityMethod === 'heroic' || abilityMethod === 'roll4d6'
    ? Object.keys(assignedIdx).length === 6
    : true

  const doRoll4d6 = () => {
    const vals = Array.from({ length: 6 }, () => roll4d6DropLowest())
    setRolledValues(vals)
    setAssignedIdx({})
    setForm((prev) => ({ ...prev, ...DEFAULT_ABILITIES }))
  }

  // ── Validation per step ──
  const canProceedAbilities = () => {
    if (abilityMethod === 'pointbuy') return remainingPoints >= 0
    if (abilityMethod === 'roll4d6' && rolledValues.length === 0) return false
    return allAssigned
  }

  // ── Submit ──
  const selectedRace = RACE_GROUPS.flatMap((g) => g.races).find((r) => r.id === form.race)
  const hasFloatingRaceBonus = hasFloatingAbilityBonus(form.race)
  const selectedClass = ALL_CLASSES.find((c) => c.value === form.class)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.race || !form.class || submitting) return
    if (hasFloatingRaceBonus && !form.raceAbilityChoice) return
    setSubmitting(true)
    setSubmitError(null)

    const classData = getClassById(form.class)
    const hitDie = classData?.hitDie ?? 8
    const conMod = Math.floor((form.constitution - 10) / 2)
    const startingHp = Math.max(1, hitDie + conMod)
    const id = generateId()

    const newCharacter = {
      id,
      name: form.name,
      race: form.race,
      raceAbilityChoice: hasFloatingRaceBonus && form.raceAbilityChoice ? form.raceAbilityChoice : undefined,
      classes: [{ id: form.class, level: 1, archetypeIds: selectedArchetypeIds }],
      level: 1,
      xp: 0,
      xpProgression: form.xpProgression,
      alignment: form.alignment,
      abilities: {
        strength: form.strength,
        dexterity: form.dexterity,
        constitution: form.constitution,
        intelligence: form.intelligence,
        wisdom: form.wisdom,
        charisma: form.charisma,
      },
      hp: { current: startingHp, max: startingHp, temp: 0 },
      feats: [],
      skills: [],
      spells: [],
      spellSlots: { 0: { max: 0, used: 0 }, 1: { max: 0, used: 0 }, 2: { max: 0, used: 0 }, 3: { max: 0, used: 0 }, 4: { max: 0, used: 0 }, 5: { max: 0, used: 0 }, 6: { max: 0, used: 0 }, 7: { max: 0, used: 0 }, 8: { max: 0, used: 0 }, 9: { max: 0, used: 0 } },
      inventory: [],
      weapons: [],
      armor: [],
      coins: { pp: 0, gp: startingGold, sp: 0, cp: 0 },
      notes: '',
      favoredClassId: isFavoredClass ? form.class : undefined,
      negativeLevels: 0,
      levelHistory: [{
        characterLevel: 1,
        classId: form.class,
        classLevel: 1,
        archetypeIds: selectedArchetypeIds,
        hpMode: 'manual' as const,
        hpRolled: null,
        hpGained: startingHp,
        featIds: [],
        skillRanksSpent: {},
        source: 'creation' as const,
        createdAt: new Date().toISOString(),
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      await addCharacter(newCharacter)
      navigate(`/characters/${id}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo crear el personaje.')
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={18} />
          Volver
        </Link>
        <div>
          <h1>Nuevo Personaje</h1>
          <p className={styles.headerSub}>Hoja de Scribe en Progreso</p>
        </div>
      </header>

      {/* ── Progress indicator ── */}
      <div className={styles.progress}>
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            className={`${styles.progressStep} ${i < currentStepIndex ? styles.progressDone : ''} ${i === currentStepIndex ? styles.progressActive : ''}`}
            onClick={() => i < currentStepIndex && setStep(s.id)}
            disabled={i > currentStepIndex}
          >
            <div className={styles.progressDot}>
              {i < currentStepIndex ? <Check size={14} /> : i + 1}
            </div>
            <span>{s.label}</span>
            {i < STEPS.length - 1 && <div className={`${styles.progressLine} ${i < currentStepIndex ? styles.progressLineDone : ''}`} />}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        {/* ── Form card ── */}
        <Card padding="lg" className={styles.formCard}>
          {/* ═══ PASO 1: RAZA ═══ */}
          {step === 'race' && (
            <div className={styles.stepContent}>
              <h2>Elige tu Raza</h2>
              <p className={styles.stepDesc}>Tu herencia racial moldea tus capacidades innatas.</p>

              <div className={styles.nameRow}>
                <label className={styles.nameLabel}>Nombre del Personaje</label>
                <input
                  className={styles.nameInput}
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="Ej: Erevan Brightsword"
                />
              </div>

              <div className={styles.accordionList}>
                {RACE_GROUPS.map((group) => {
                  const isOpen = openRaceGroup === group.label
                  const groupHasSelected = group.races.some((r) => r.id === form.race)
                  return (
                    <div key={group.label} className={styles.accordionGroup}>
                      <button
                        className={`${styles.accordionHeader} ${isOpen ? styles.accordionHeaderOpen : ''} ${groupHasSelected ? styles.accordionHasSelected : ''}`}
                        onClick={() => toggleRaceGroup(group.label)}
                      >
                        <span className={styles.accordionLabel}>{group.label}</span>
                        <span className={styles.accordionMeta}>{group.races.length} razas</span>
                        <ChevronDown size={16} className={`${styles.accordionChevron} ${isOpen ? styles.accordionChevronOpen : ''}`} />
                      </button>
                      {isOpen && (
                        <div className={styles.raceGrid}>
                          {group.races.map((race) => (
                            <button
                              key={race.id}
                              className={`${styles.raceCard} ${form.race === race.id ? styles.selected : ''}`}
                              onClick={() => {
                                updateForm('race', race.id)
                                updateForm('raceAbilityChoice', '')
                              }}
                            >
                              <span className={styles.raceName}>{race.label}</span>
                              {race.source === 'Homebrew' && <HomebrewBadge />}
                              <span className={styles.raceBonus}>{race.bonusDesc}</span>
                              {form.race === race.id && <Check size={16} className={styles.selectedCheck} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {selectedRace && (
                <p className={styles.raceDesc}>{selectedRace.desc}</p>
              )}

              {hasFloatingRaceBonus && (
                <div className={styles.nameRow}>
                  <label className={styles.nameLabel}>¿A qué característica aplicas el +2 racial?</label>
                  <div className={styles.raceGrid}>
                    {ABILITY_KEYS.map((key) => (
                      <button
                        key={key}
                        className={`${styles.raceCard} ${form.raceAbilityChoice === key ? styles.selected : ''}`}
                        onClick={() => updateForm('raceAbilityChoice', key)}
                      >
                        <span className={styles.raceName}>{ABILITY_LABELS[key][0]}</span>
                        {form.raceAbilityChoice === key && <Check size={16} className={styles.selectedCheck} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.stepActions}>
                <Button
                  variant="primary"
                  onClick={() => setStep('class')}
                  disabled={!form.race || !form.name.trim() || (hasFloatingRaceBonus && !form.raceAbilityChoice)}
                >
                  Siguiente: Clase
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* ═══ PASO 2: CLASE ═══ */}
          {step === 'class' && (
            <div className={styles.stepContent}>
              <h2>Elige tu Clase</h2>
              <p className={styles.stepDesc}>Tu clase define tu rol y habilidades durante la aventura.</p>

              <div className={styles.accordionList}>
                {ALL_CLASS_GROUPS.map((group) => {
                  const isOpen = openClassGroup === group.label
                  const groupHasSelected = group.classes.some((c) => c.value === form.class)
                  return (
                    <div key={group.label} className={styles.accordionGroup}>
                      <button
                        className={`${styles.accordionHeader} ${isOpen ? styles.accordionHeaderOpen : ''} ${groupHasSelected ? styles.accordionHasSelected : ''}`}
                        onClick={() => toggleClassGroup(group.label)}
                      >
                        <span className={styles.accordionLabel}>{group.label}</span>
                        <span className={styles.accordionMeta}>{group.classes.length} clases</span>
                        <ChevronDown size={16} className={`${styles.accordionChevron} ${isOpen ? styles.accordionChevronOpen : ''}`} />
                      </button>
                      {isOpen && (
                        <div className={styles.classGrid}>
                          {group.classes.map((cls) => (
                            <button
                              key={cls.value}
                              className={`${styles.classCard} ${form.class === cls.value ? styles.selected : ''}`}
                              onClick={() => { updateForm('class', cls.value); setSelectedArchetypeIds([]) }}
                            >
                              <div className={styles.classHeader}>
                                <span className={styles.className}>{cls.label}</span>
                                <span className={styles.classRole}>{cls.role}</span>
                              </div>
                              <span className={styles.classDie}>DG: {cls.hitDie}</span>
                              <p className={styles.classDesc}>{cls.desc}</p>
                              {form.class === cls.value && <Check size={16} className={styles.selectedCheck} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className={styles.alignmentRow}>
                <label className={styles.nameLabel}>Alineamiento</label>
                <select
                  className={styles.alignSelect}
                  value={form.alignment}
                  onChange={(e) => updateForm('alignment', e.target.value)}
                >
                  {ALIGNMENTS.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.alignmentRow}>
                <label className={styles.nameLabel}>Velocidad de Progresión (XP)</label>
                <div className={styles.methodChips}>
                  {XP_SPEEDS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      className={`${styles.methodChip} ${form.xpProgression === s.value ? styles.methodChipActive : ''}`}
                      onClick={() => updateForm('xpProgression', s.value)}
                      title={s.desc}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {form.class && (
                <div className={styles.archetypeSection}>
                  <ArchetypeSelector
                    classId={form.class}
                    value={selectedArchetypeIds}
                    onChange={setSelectedArchetypeIds}
                  />
                </div>
              )}

              {form.class && (
                <label className={styles.nameLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={isFavoredClass}
                    onChange={(e) => setIsFavoredClass(e.target.checked)}
                  />
                  Clase predilecta (favored class) — al subir en esta clase podrás elegir +1 PG, +1 punto de habilidad, u opción racial
                </label>
              )}

              <div className={styles.stepActions}>
                <Button variant="secondary" onClick={() => setStep('race')}>
                  <ArrowLeft size={18} />
                  Atrás
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setStep('abilities')}
                  disabled={!form.class}
                >
                  Siguiente: Atributos
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* ═══ PASO 3: ATRIBUTOS ═══ */}
          {step === 'abilities' && (
            <div className={styles.stepContent}>
              <h2>Distribuye tus Atributos</h2>

              {/* Method selector */}
              <div className={styles.methodChips}>
                {ABILITY_METHODS.map((m) => (
                  <button
                    key={m.id}
                    className={`${styles.methodChip} ${abilityMethod === m.id ? styles.methodChipActive : ''}`}
                    onClick={() => changeMethod(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Point-buy status */}
              {abilityMethod === 'pointbuy' && (
                <p className={styles.stepDesc}>
                  {remainingPoints > 0
                    ? <>Puntos restantes: <strong className={styles.pointsLeft}>{remainingPoints}</strong></>
                    : remainingPoints < 0
                      ? <span className={styles.pointsOver}>Has superado el límite en {-remainingPoints} puntos</span>
                      : <span className={styles.pointsExact}>Puntos distribuidos perfectamente</span>
                  }
                </p>
              )}

              {/* Array / roll pool */}
              {(abilityMethod === 'standard' || abilityMethod === 'heroic' || abilityMethod === 'roll4d6') && (
                <div>
                  {abilityMethod === 'roll4d6' && (
                    <div className={styles.rollRow}>
                      <button className={styles.rollBtn} onClick={doRoll4d6}>
                        <Dice6 size={16} />
                        {rolledValues.length > 0 ? 'Volver a Tirar' : 'Tirar Dados'}
                      </button>
                      {rolledValues.length > 0 && (
                        <span className={styles.stepDesc}>
                          {6 - Object.keys(assignedIdx).length} valores por asignar
                        </span>
                      )}
                    </div>
                  )}

                  {currentPool.length > 0 && (
                    <div className={styles.arrayPool}>
                      <span className={styles.nameLabel}>Valores disponibles:</span>
                      <div className={styles.arrayChips}>
                        {currentPool.map((val, i) => (
                          <span
                            key={i}
                            className={`${styles.arrayChip} ${usedIndices.has(i) ? styles.arrayChipUsed : ''}`}
                          >
                            {val}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ability grid */}
              <div className={styles.abilityGrid}>
                {ABILITY_KEYS.map((attr) => {
                  const [fullLabel, abbr] = ABILITY_LABELS[attr]
                  const value = form[attr]
                  const mod = calculateModifier(value)
                  const isArrayMethod = abilityMethod === 'standard' || abilityMethod === 'heroic' || abilityMethod === 'roll4d6'
                  const currentAssignedIdx = assignedIdx[attr]

                  return (
                    <div key={attr} className={styles.abilityCard}>
                      <span className={styles.abilityLabel}>{fullLabel}</span>
                      <span className={styles.abilityAbbr}>{abbr}</span>

                      {abilityMethod === 'free' && (
                        <input
                          type="number"
                          className={styles.freeInput}
                          value={value}
                          onChange={(e) => {
                            const rawValue = e.target.value
                            if (rawValue === '') return
                            const parsedValue = Number(rawValue)
                            if (Number.isNaN(parsedValue)) return
                            updateForm(attr, parsedValue)
                          }}
                        />
                      )}

                      {abilityMethod === 'pointbuy' && (
                        <div className={styles.abilityControls}>
                          <button
                            className={styles.abilityBtn}
                            onClick={() => updateForm(attr, Math.max(7, value - 1))}
                            disabled={value <= 7}
                          >
                            −
                          </button>
                          <span className={styles.abilityNumber}>{value}</span>
                          <button
                            className={styles.abilityBtn}
                            onClick={() => updateForm(attr, Math.min(18, value + 1))}
                            disabled={value >= 18 || remainingPoints <= 0}
                          >
                            +
                          </button>
                        </div>
                      )}

                      {isArrayMethod && currentPool.length > 0 && (
                        <select
                          className={styles.arraySelect}
                          value={currentAssignedIdx !== undefined ? String(currentAssignedIdx) : ''}
                          onChange={(e) => {
                            const idx = +e.target.value
                            assignValue(attr, idx)
                          }}
                        >
                          <option value="">— elige —</option>
                          {currentPool.map((val, i) => {
                            const takenByOther = usedIndices.has(i) && currentAssignedIdx !== i
                            return (
                              <option key={i} value={i} disabled={takenByOther}>
                                {val}{takenByOther ? ' ✓' : ''}
                              </option>
                            )
                          })}
                        </select>
                      )}

                      {isArrayMethod && currentPool.length === 0 && (
                        <span className={styles.abilityNumber}>—</span>
                      )}

                      <span className={`${styles.abilityMod} ${mod >= 0 ? styles.modPos : styles.modNeg}`}>
                        {mod >= 0 ? '+' : ''}{mod}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className={styles.stepActions}>
                <Button variant="secondary" onClick={() => setStep('class')}>
                  <ArrowLeft size={18} />
                  Atrás
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setStartingGold(rollStartingGold(getClassById(form.class)?.startingGoldDice ?? '3d6*10'))
                    setStep('summary')
                  }}
                  disabled={!canProceedAbilities()}
                >
                  Ver Resumen
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* ═══ PASO 4: RESUMEN ═══ */}
          {step === 'summary' && (
            <div className={styles.stepContent}>
              <h2>Resumen del Personaje</h2>
              <p className={styles.stepDesc}>Confirma los datos antes de dar vida a tu héroe.</p>

              <div className={styles.summaryCard}>
                <div className={styles.summaryTop}>
                  <div className={styles.summaryAvatar}>
                    {form.name.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className={styles.summaryName}>{form.name || 'Sin nombre'}</h3>
                    <p className={styles.summaryMeta}>
                      {selectedRace?.label} · {selectedClass?.label} · Nivel 1
                    </p>
                    <p className={styles.summaryAlign}>
                      {ALIGNMENTS.find((a) => a.value === form.alignment)?.label}
                      {' · XP '}
                      {XP_SPEEDS.find((s) => s.value === form.xpProgression)?.label}
                    </p>
                  </div>
                </div>

                <div className={styles.summaryStats}>
                  <div className={styles.summaryStat}>
                    <span className={styles.summaryStatVal}>{Math.max(1, (getClassById(form.class)?.hitDie ?? 8) + Math.floor((form.constitution - 10) / 2))}</span>
                    <span className={styles.summaryStatLbl}>HP</span>
                  </div>
                  <div className={styles.summaryStat}>
                    <span className={styles.summaryStatVal}>{10 + calculateModifier(form.dexterity)}</span>
                    <span className={styles.summaryStatLbl}>CA</span>
                  </div>
                  <div className={styles.summaryStat}>
                    <span className={styles.summaryStatVal}>{selectedClass?.hitDie ?? 'd8'}</span>
                    <span className={styles.summaryStatLbl}>DG</span>
                  </div>
                  <div className={styles.summaryStat}>
                    <span className={styles.summaryStatVal}>{startingGold}</span>
                    <span className={styles.summaryStatLbl}>GP</span>
                  </div>
                </div>

                <div className={styles.summaryAbilities}>
                  {ABILITY_KEYS.map((attr) => {
                    const [, abbr] = ABILITY_LABELS[attr]
                    const val = form[attr]
                    const mod = calculateModifier(val)
                    return <AbilityScoreCard key={attr} label={abbr} score={val} modifier={mod} />
                  })}
                </div>
              </div>

              {submitError && (
                <p className={styles.errorText}>{submitError}</p>
              )}
              <div className={styles.stepActions}>
                <Button variant="secondary" onClick={() => setStep('abilities')}>
                  <ArrowLeft size={18} />
                  Atrás
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!form.name.trim() || submitting}
                >
                  <Check size={18} />
                  {submitting ? 'Guardando...' : 'Crear Personaje'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ── Scribe advisor ── */}
        <aside className={styles.advisor}>
          <div className={styles.advisorIcon}>
            <Lightbulb size={18} />
          </div>
          <div>
            <p className={styles.advisorTitle}>Consejero Scribe</p>
            <p className={styles.advisorText}>{currentStepData.tip}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
