import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImagePlus, X, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCharacterStore, generateId } from '../store'
import type { Character, Weapon, Armor, SkillRank } from '../store'
import { CLASSES } from '../data/classes'
import { FEATS } from '../data/feats'
import { Button } from '../components/ui'
import styles from './CharacterImport.module.css'

// ── Types ────────────────────────────────────────────────────────────────────

interface ExtractedData {
  name?: string
  race?: string
  class?: string
  level?: number
  xp?: number
  alignment?: string
  abilities?: {
    strength?: number
    dexterity?: number
    constitution?: number
    intelligence?: number
    wisdom?: number
    charisma?: number
  }
  hp?: { current?: number; max?: number; temp?: number }
  skills?: Array<{ id: string; ranks: number }>
  feats?: string[]
  weapons?: Array<{
    name: string
    attackBonus?: number
    damage?: string
    critical?: string
    range?: string
    type?: string
    notes?: string
  }>
  armor?: Array<{
    name: string
    type?: string
    acBonus?: number
    armorCheckPenalty?: number
    maxDex?: number | null
    spellFailure?: number
    weight?: number
    equipped?: boolean
    notes?: string
  }>
  coins?: { pp?: number; gp?: number; sp?: number; cp?: number }
  notes?: string
}

type Step = 'upload' | 'loading' | 'review'

// ── Helpers ──────────────────────────────────────────────────────────────────

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.readAsDataURL(file)
  })

const ALIGNMENTS = [
  { value: 'lg', label: 'Legal Bueno' },
  { value: 'ng', label: 'Neutral Bueno' },
  { value: 'cg', label: 'Caótico Bueno' },
  { value: 'ln', label: 'Legal Neutral' },
  { value: 'n',  label: 'Neutral' },
  { value: 'cn', label: 'Caótico Neutral' },
  { value: 'le', label: 'Legal Malvado' },
  { value: 'ne', label: 'Neutral Malvado' },
  { value: 'ce', label: 'Caótico Malvado' },
]

function mapExtractedToCharacter(extracted: ExtractedData): Character {
  const id = generateId()
  const now = new Date().toISOString()

  // Map class name → CharacterClass array
  const classSlug = (extracted.class ?? '').toLowerCase().replace(/\s+/g, '_')
  const matchedClass = CLASSES.find((c) => c.id === classSlug || c.name.toLowerCase() === (extracted.class ?? '').toLowerCase())
  const classId = matchedClass?.id ?? (classSlug || 'fighter')
  const level = extracted.level ?? 1

  // Map feats: try to match by name, keep unmatched as raw name strings
  const featIds: string[] = (extracted.feats ?? []).map((featName) => {
    const match = FEATS.find(
      (f) => f.name.toLowerCase() === featName.toLowerCase() || f.id === featName.toLowerCase().replace(/\s+/g, '_')
    )
    return match?.id ?? featName
  })

  // Map skills
  const skills: SkillRank[] = (extracted.skills ?? []).map((s) => ({
    id: s.id,
    ranks: s.ranks,
  }))

  // Map weapons
  const weapons: Weapon[] = (extracted.weapons ?? []).map((w) => ({
    id: generateId(),
    name: w.name,
    attackBonus: w.attackBonus ?? 0,
    damage: w.damage ?? '1d4',
    critical: w.critical ?? '20/x2',
    range: w.range ?? 'melee',
    type: w.type ?? 'slashing',
    notes: w.notes ?? '',
  }))

  // Map armor
  const armor: Armor[] = (extracted.armor ?? []).map((a) => ({
    id: generateId(),
    name: a.name,
    type: (['light', 'medium', 'heavy', 'shield'].includes(a.type ?? '') ? a.type : 'light') as Armor['type'],
    acBonus: a.acBonus ?? 0,
    armorCheckPenalty: a.armorCheckPenalty ?? 0,
    maxDex: a.maxDex ?? null,
    spellFailure: a.spellFailure ?? 0,
    weight: a.weight ?? 0,
    equipped: a.equipped ?? true,
    notes: a.notes ?? '',
  }))

  const abs = extracted.abilities ?? {}

  return {
    id,
    name: extracted.name ?? 'Personaje Importado',
    race: extracted.race ?? 'human',
    classes: [{ id: classId, level }],
    level,
    xp: extracted.xp ?? 0,
    alignment: extracted.alignment ?? 'n',
    abilities: {
      strength:     abs.strength     ?? 10,
      dexterity:    abs.dexterity    ?? 10,
      constitution: abs.constitution ?? 10,
      intelligence: abs.intelligence ?? 10,
      wisdom:       abs.wisdom       ?? 10,
      charisma:     abs.charisma     ?? 10,
    },
    hp: {
      current: extracted.hp?.current ?? 10,
      max:     extracted.hp?.max     ?? 10,
      temp:    extracted.hp?.temp    ?? 0,
    },
    feats: featIds,
    skills,
    spells: [],
    spellSlots: {},
    inventory: [],
    weapons,
    armor,
    coins: {
      pp: extracted.coins?.pp ?? 0,
      gp: extracted.coins?.gp ?? 0,
      sp: extracted.coins?.sp ?? 0,
      cp: extracted.coins?.cp ?? 0,
    },
    notes: extracted.notes ?? '',
    createdAt: now,
    updatedAt: now,
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function CharacterImport() {
  const navigate = useNavigate()
  const addCharacter = useCharacterStore((state) => state.addCharacter)

  const [step, setStep] = useState<Step>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [character, setCharacter] = useState<Character | null>(null)
  const [saving, setSaving] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  // ── File handling ──────────────────────────────────────────────────────────

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter((f) => f.type.startsWith('image/'))
    const combined = [...files, ...arr].slice(0, 5)
    setFiles(combined)
    const urls = combined.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    setError(null)
  }, [files])

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    const urls = updated.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  // ── Analysis ───────────────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (files.length === 0) return
    setStep('loading')
    setError(null)

    try {
      const images = await Promise.all(
        files.map(async (f) => ({
          data: await toBase64(f),
          mediaType: f.type,
        }))
      )

      const { data, error: fnError } = await supabase.functions.invoke('extract-character', {
        body: { images },
      })

      if (fnError) throw new Error(fnError.message)
      if (data?.error) {
        console.error('Edge function error:', data)
        throw new Error(data.raw ? `${data.error}\n\nRAW: ${data.raw}` : data.error)
      }

      const mapped = mapExtractedToCharacter(data.character as ExtractedData)
      setCharacter(mapped)
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setStep('upload')
    }
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!character) return
    setSaving(true)
    await addCharacter(character)
    navigate(`/characters/${character.id}`)
  }

  // ── Render: Upload ─────────────────────────────────────────────────────────

  if (step === 'upload') {
    return (
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>Importar desde Imagen</h1>
          <p className={styles.subtitle}>Sube una foto o escaneo de tu hoja de personaje y la IA extraerá los datos automáticamente.</p>
        </header>

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div
          ref={dropRef}
          className={`${styles.dropZone} ${files.length > 0 ? styles.dropZoneHasFiles : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => files.length === 0 && fileInputRef.current?.click()}
        >
          {files.length === 0 ? (
            <>
              <ImagePlus size={40} className={styles.dropIcon} />
              <p className={styles.dropText}>Arrastra imágenes aquí o haz clic para seleccionar</p>
              <p className={styles.dropHint}>JPG, PNG, WEBP · Máximo 5 imágenes</p>
            </>
          ) : (
            <div className={styles.thumbnails}>
              {previews.map((url, i) => (
                <div key={i} className={styles.thumbnail}>
                  <img src={url} alt={`Página ${i + 1}`} className={styles.thumbnailImg} />
                  <button
                    className={styles.thumbnailRemove}
                    onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                    title="Eliminar imagen"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {files.length < 5 && (
                <button
                  className={styles.addMoreBtn}
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                >
                  <ImagePlus size={24} />
                  <span>Añadir</span>
                </button>
              )}
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />

        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => navigate('/')}>Cancelar</Button>
          <Button variant="primary" onClick={handleAnalyze} disabled={files.length === 0}>
            Analizar con IA
          </Button>
        </div>
      </div>
    )
  }

  // ── Render: Loading ────────────────────────────────────────────────────────

  if (step === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <Loader2 size={48} className={styles.spinner} />
          <h2>Analizando imágenes…</h2>
          <p>La IA está extrayendo los datos de tu hoja de personaje. Esto puede tardar unos segundos.</p>
        </div>
      </div>
    )
  }

  // ── Render: Review ─────────────────────────────────────────────────────────

  if (!character) return null

  const updateField = <K extends keyof Character>(key: K, value: Character[K]) =>
    setCharacter((prev) => prev ? { ...prev, [key]: value } : prev)

  const updateAbility = (key: keyof Character['abilities'], value: number) =>
    setCharacter((prev) => prev ? { ...prev, abilities: { ...prev.abilities, [key]: value } } : prev)

  const updateHp = (key: keyof Character['hp'], value: number) =>
    setCharacter((prev) => prev ? { ...prev, hp: { ...prev.hp, [key]: value } } : prev)

  const updateCoins = (key: keyof Character['coins'], value: number) =>
    setCharacter((prev) => prev ? { ...prev, coins: { ...prev.coins, [key]: value } } : prev)

  const updateWeapon = (index: number, key: keyof Weapon, value: string | number) =>
    setCharacter((prev) => {
      if (!prev) return prev
      const weapons = prev.weapons.map((w, i) => i === index ? { ...w, [key]: value } : w)
      return { ...prev, weapons }
    })

  const removeWeapon = (index: number) =>
    setCharacter((prev) => prev ? { ...prev, weapons: prev.weapons.filter((_, i) => i !== index) } : prev)

  const updateArmor = (index: number, key: keyof Armor, value: string | number | boolean | null) =>
    setCharacter((prev) => {
      if (!prev) return prev
      const armor = (prev.armor ?? []).map((a, i) => i === index ? { ...a, [key]: value } : a)
      return { ...prev, armor }
    })

  const removeArmor = (index: number) =>
    setCharacter((prev) => prev ? { ...prev, armor: (prev.armor ?? []).filter((_, i) => i !== index) } : prev)

  const updateSkillRanks = (index: number, ranks: number) =>
    setCharacter((prev) => {
      if (!prev) return prev
      const skills = prev.skills.map((s, i) => i === index ? { ...s, ranks } : s)
      return { ...prev, skills }
    })

  const removeFeat = (feat: string) =>
    setCharacter((prev) => prev ? { ...prev, feats: prev.feats.filter((f) => f !== feat) } : prev)

  const primaryClassId = character.classes[0]?.id ?? 'fighter'

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>Revisar Datos Extraídos</h1>
        <p className={styles.subtitle}>Verifica y corrige los datos antes de crear el personaje.</p>
      </header>

      <div className={styles.reviewForm}>

        {/* ── Identidad ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Identidad</h2>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label>Nombre</label>
              <input
                className={styles.input}
                value={character.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>Raza</label>
              <input
                className={styles.input}
                value={character.race}
                onChange={(e) => updateField('race', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label>Clase</label>
              <select
                className={styles.select}
                value={primaryClassId}
                onChange={(e) => updateField('classes', [{ id: e.target.value, level: character.classes[0]?.level ?? 1 }])}
              >
                {CLASSES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value={primaryClassId}>{primaryClassId}</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Nivel</label>
              <input
                className={styles.input}
                type="number"
                min={1}
                max={20}
                value={character.level}
                onChange={(e) => {
                  const lv = Number(e.target.value)
                  updateField('level', lv)
                  updateField('classes', [{ id: primaryClassId, level: lv }])
                }}
              />
            </div>
            <div className={styles.field}>
              <label>Alineamiento</label>
              <select
                className={styles.select}
                value={character.alignment}
                onChange={(e) => updateField('alignment', e.target.value)}
              >
                {ALIGNMENTS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>XP</label>
              <input
                className={styles.input}
                type="number"
                min={0}
                value={character.xp}
                onChange={(e) => updateField('xp', Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* ── Atributos ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Atributos</h2>
          <div className={styles.abilitiesGrid}>
            {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map((ab) => {
              const labels: Record<typeof ab, string> = {
                strength: 'Fuerza', dexterity: 'Destreza', constitution: 'Constitución',
                intelligence: 'Inteligencia', wisdom: 'Sabiduría', charisma: 'Carisma',
              }
              return (
                <div key={ab} className={styles.abilityBox}>
                  <label>{labels[ab]}</label>
                  <input
                    className={styles.abilityInput}
                    type="number"
                    min={1}
                    max={30}
                    value={character.abilities[ab]}
                    onChange={(e) => updateAbility(ab, Number(e.target.value))}
                  />
                </div>
              )
            })}
          </div>
        </section>

        {/* ── HP ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Puntos de Golpe</h2>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label>Actuales</label>
              <input className={styles.input} type="number" value={character.hp.current} onChange={(e) => updateHp('current', Number(e.target.value))} />
            </div>
            <div className={styles.field}>
              <label>Máximos</label>
              <input className={styles.input} type="number" value={character.hp.max} onChange={(e) => updateHp('max', Number(e.target.value))} />
            </div>
            <div className={styles.field}>
              <label>Temporales</label>
              <input className={styles.input} type="number" value={character.hp.temp} onChange={(e) => updateHp('temp', Number(e.target.value))} />
            </div>
          </div>
        </section>

        {/* ── Skills ── */}
        {character.skills.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Habilidades (con rangos)</h2>
            <div className={styles.skillsTable}>
              {character.skills.map((skill, i) => (
                <div key={skill.id} className={styles.skillRow}>
                  <span className={styles.skillName}>{skill.id}</span>
                  <input
                    className={styles.skillRanksInput}
                    type="number"
                    min={0}
                    max={20}
                    value={skill.ranks}
                    onChange={(e) => updateSkillRanks(i, Number(e.target.value))}
                  />
                  <button
                    className={styles.removeBtn}
                    onClick={() => setCharacter((prev) => prev ? { ...prev, skills: prev.skills.filter((_, idx) => idx !== i) } : prev)}
                    title="Eliminar"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Feats ── */}
        {character.feats.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Dotes</h2>
            <div className={styles.chips}>
              {character.feats.map((feat) => (
                <span key={feat} className={styles.chip}>
                  {feat}
                  <button className={styles.chipRemove} onClick={() => removeFeat(feat)}><X size={12} /></button>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── Weapons ── */}
        {character.weapons.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Armas</h2>
            {character.weapons.map((w, i) => (
              <div key={w.id} className={styles.weaponRow}>
                <input className={styles.input} value={w.name} onChange={(e) => updateWeapon(i, 'name', e.target.value)} placeholder="Nombre" />
                <input className={styles.inputSm} type="number" value={w.attackBonus} onChange={(e) => updateWeapon(i, 'attackBonus', Number(e.target.value))} placeholder="Ataque" title="Bono de ataque" />
                <input className={styles.inputSm} value={w.damage} onChange={(e) => updateWeapon(i, 'damage', e.target.value)} placeholder="Daño" />
                <input className={styles.inputSm} value={w.critical} onChange={(e) => updateWeapon(i, 'critical', e.target.value)} placeholder="Crítico" />
                <button className={styles.removeBtn} onClick={() => removeWeapon(i)}><X size={14} /></button>
              </div>
            ))}
          </section>
        )}

        {/* ── Armor ── */}
        {(character.armor ?? []).length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Armadura</h2>
            {(character.armor ?? []).map((a, i) => (
              <div key={a.id} className={styles.weaponRow}>
                <input className={styles.input} value={a.name} onChange={(e) => updateArmor(i, 'name', e.target.value)} placeholder="Nombre" />
                <input className={styles.inputSm} type="number" value={a.acBonus} onChange={(e) => updateArmor(i, 'acBonus', Number(e.target.value))} placeholder="Bon. CA" title="Bonificación CA" />
                <input className={styles.inputSm} type="number" value={a.armorCheckPenalty} onChange={(e) => updateArmor(i, 'armorCheckPenalty', Number(e.target.value))} placeholder="Pen." title="Penalización armadura" />
                <button className={styles.removeBtn} onClick={() => removeArmor(i)}><X size={14} /></button>
              </div>
            ))}
          </section>
        )}

        {/* ── Coins ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Monedas</h2>
          <div className={styles.fieldGrid}>
            {(['pp', 'gp', 'sp', 'cp'] as const).map((coin) => (
              <div key={coin} className={styles.field}>
                <label>{coin.toUpperCase()}</label>
                <input className={styles.input} type="number" min={0} value={character.coins[coin]} onChange={(e) => updateCoins(coin, Number(e.target.value))} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Notes ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Notas</h2>
          <textarea
            className={styles.textarea}
            rows={4}
            value={character.notes}
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </section>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => setStep('upload')} disabled={saving}>Volver</Button>
        <Button variant="primary" onClick={handleCreate} disabled={saving}>
          {saving ? <Loader2 size={16} className={styles.spinner} /> : null}
          Crear Personaje
        </Button>
      </div>
    </div>
  )
}
