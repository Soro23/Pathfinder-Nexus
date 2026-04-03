import { useState, useEffect, useRef } from 'react'
import { Download, Trash2, AlertTriangle, CheckCircle, Pencil, Search, ArrowLeft, Save, BookOpen, Star, Sword, Users, Wand2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Spell } from '../data/spells'
import { SPELL_SCHOOLS } from '../data/spells'
import { useCustomSpellsStore } from '../store/customSpellsStore'
import { parseD20SpellPage, parseD20SkillPage, parseD20FeatPage, parseD20ClassPage, parseD20RacePage } from '../utils/d20pfsrdParser'
import { supabase } from '../lib/supabase'
import { mapSpellRow } from '../hooks/useSpells'
import { useSRDStore, srdStore } from '../store/srdStore'
import type { Skill } from '../data/skills'
import type { Feat, FeatType } from '../data/feats'
import type { ClassData } from '../data/classes'
import type { Race } from '../data/races'
import type { Archetype, ReplacementType } from '../data/archetypes'
import { CLASSES } from '../data/classes'
import styles from './Admin.module.css'

// ── Proxy helpers ─────────────────────────────────────────────────────────────

const PROXIES: Array<{
  build: (url: string) => string
  extract: (res: Response) => Promise<string>
}> = [
    {
      build: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      extract: async (res) => {
        const json = await res.json()
        if (!json.contents) throw new Error('allorigins: sin contenido')
        return json.contents as string
      },
    },
    {
      build: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
      extract: (res) => res.text(),
    },
    {
      build: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      extract: (res) => res.text(),
    },
  ]

async function fetchWithProxy(url: string): Promise<string> {
  let lastError = ''
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy.build(url))
      if (!res.ok) { lastError = `HTTP ${res.status}`; continue }
      const html = await proxy.extract(res)
      if (html && html.length > 100) return html
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e)
    }
  }
  throw new Error(`No se pudo obtener la página (${lastError})`)
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const SPELL_COLS =
  'id,name,school,subschool,descriptor,level,type,class_lists,casting_time,range,' +
  'target,area,effect,duration,saving_throw,spell_resistance,description,material,' +
  'arcane_focus,divine_focus,costly_components'

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

async function findDuplicateInDB(name: string, customSpells: Spell[]): Promise<Spell | null> {
  const n = normalize(name)
  const customDup = customSpells.find(s => normalize(s.name) === n)
    ?? customSpells.find(s => normalize(s.name).includes(n) || n.includes(normalize(s.name)))
  if (customDup) return customDup

  const { data } = await supabase.from('spells').select(SPELL_COLS).ilike('name', `%${name.trim()}%`).limit(5)
  if (data && data.length > 0) {
    const rows = data as unknown as Record<string, unknown>[]
    const exact = rows.find(r => normalize(r.name as string) === n)
    const partial = rows.find(r => { const rn = normalize(r.name as string); return rn.includes(n) || n.includes(rn) })
    const match = exact ?? partial
    if (match) return mapSpellRow(match)
  }
  return null
}

// ── Admin page ────────────────────────────────────────────────────────────────

type TabId = 'spells' | 'skills' | 'feats' | 'classes' | 'races' | 'archetypes'
type ImportStatus = 'idle' | 'loading' | 'done' | 'error'

export function Admin() {
  const [activeTab, setActiveTab] = useState<TabId>('spells')
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const tabNavRef = useRef<HTMLDivElement>(null)

  const updateArrows = () => {
    if (!tabNavRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = tabNavRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabNavRef.current) return
    const scrollAmount = tabNavRef.current.clientWidth * 0.7
    tabNavRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>Herramientas de Administración</h1>
        <p className={styles.subtitle}>Gestiona y amplía la biblioteca de hechizos de la aplicación.</p>
      </header>

      <div className={styles.tabNavWrapper}>
        {showLeftArrow && (
          <button className={`${styles.tabArrow} ${styles.left}`} onClick={() => scrollTabs('left')}>
            <ChevronLeft size={20} />
          </button>
        )}
        <nav className={styles.tabNav} ref={tabNavRef} onScroll={updateArrows}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'spells' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('spells')}
          >
            <Wand2 size={16} /> Conjuros
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'skills' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <BookOpen size={16} /> Skills
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'feats' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('feats')}
          >
            <Star size={16} /> Feats
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'classes' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('classes')}
          >
            <Sword size={16} /> Clases
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'races' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('races')}
          >
            <Users size={16} /> Razas
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'archetypes' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('archetypes')}
          >
            <Sword size={16} /> Arquetipos
          </button>
        </nav>
        {showRightArrow && (
          <button className={`${styles.tabArrow} ${styles.right}`} onClick={() => scrollTabs('right')}>
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'spells' && <SpellsEditor />}
        {activeTab === 'skills' && <SkillsEditor />}
        {activeTab === 'feats' && <FeatsEditor />}
        {activeTab === 'classes' && <ClassesEditor />}
        {activeTab === 'races' && <RacesEditor />}
        {activeTab === 'archetypes' && <ArchetypesEditor />}
      </div>
    </div>
  )
}

// ── Spells Editor ─────────────────────────────────────────────────────────────

function SpellsEditor() {
  const [phase, setPhase] = useState<'list' | 'edit'>('list')
  const [showImporter, setShowImporter] = useState(false)
  const [importedMsg, setImportedMsg] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Spell[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [selectedName, setSelectedName] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { customSpells, fetchCustomSpells, removeSpell, loading } = useCustomSpellsStore()
  useEffect(() => { fetchCustomSpells() }, [fetchCustomSpells])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!search.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const { data } = await supabase
        .from('spells').select('id,name,school,subschool,level,type')
        .ilike('name', `%${search.trim()}%`)
        .order('name').limit(20)
      setResults((data ?? []).map(r => mapSpellRow(r as unknown as Record<string, unknown>)))
      setSearching(false)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  if (phase === 'edit' && selectedId) {
    return <SpellEditForm spellId={selectedId} spellName={selectedName} onBack={() => setPhase('list')} />
  }

  return (
    <div className={styles.editorCard}>
      <div className={styles.editorListHeader}>
        <h2>Conjuros{search && results.length > 0 ? ` (${results.length})` : ''}</h2>
        <button className={styles.importBtn} onClick={() => { setShowImporter(true); setImportedMsg(false) }}>
          <Download size={16} /> Importar desde URL
        </button>
      </div>

      {importedMsg && <div className={styles.successBanner}><CheckCircle size={16} />Conjuro añadido a la biblioteca.</div>}

      {showImporter && (
        <SpellImporterPanel
          onImported={() => { setShowImporter(false); setImportedMsg(true) }}
          onCancel={() => setShowImporter(false)}
        />
      )}

      <div className={styles.editorSearchRow}>
        <Search size={16} className={styles.editorSearchIcon} />
        <input
          className={styles.editorSearchInput}
          type="text"
          placeholder="Nombre del conjuro…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
        {searching && <span className={styles.spinner} />}
      </div>

      {results.length > 0 && (
        <ul className={styles.searchResults}>
          {results.map(spell => (
            <li key={spell.id} className={styles.searchResultItem}
              onClick={() => { setSelectedId(spell.id); setSelectedName(spell.name); setPhase('edit') }}>
              <div className={styles.searchResultMain}>
                <span className={styles.searchResultName}>{spell.name}</span>
                <span className={styles.searchResultMeta}>
                  {spell.school}{spell.subschool ? ` (${spell.subschool})` : ''} · Nv {spell.level}
                </span>
              </div>
              <span className={`${styles.typePill} ${styles[`typePill_${spell.type}`]}`}>
                {spell.type === 'both' ? 'A+D' : spell.type === 'arcane' ? 'Arc' : 'Div'}
              </span>
              <Pencil size={14} className={styles.editHint} />
            </li>
          ))}
        </ul>
      )}

      {search.trim() && !searching && results.length === 0 && (
        <p className={styles.noResults}>Sin resultados para &ldquo;{search}&rdquo;</p>
      )}

      {customSpells.length > 0 && (
        <div className={styles.customListCard} style={{ marginTop: 'var(--space-5)' }}>
          <h2>Hechizos importados ({customSpells.length})</h2>
          {loading && <p>Cargando...</p>}
          <ul className={styles.customList}>
            {customSpells.map(sp => (
              <li key={sp.id} className={styles.customListItem}>
                <span className={styles.customSpellName}>{sp.name}</span>
                <span className={styles.customSpellMeta}>{sp.school} · Nivel {sp.level}</span>
                <button className={styles.removeBtn} onClick={() => removeSpell(sp.id)} title="Eliminar">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Spell Edit Form ───────────────────────────────────────────────────────────

interface SpellEditFormProps {
  spellId: string
  spellName: string
  onBack: () => void
}

// Flat form state matching DB column names exactly — no type gymnastics
interface SpellFormState {
  name: string
  school: string
  subschool: string
  descriptor: string
  level: string
  type: 'arcane' | 'divine' | 'both'
  class_lists: string
  casting_time: string
  range: string
  target: string
  area: string
  effect: string
  duration: string
  saving_throw: string
  spell_resistance: string
  description: string
  material: string
  arcane_focus: string
  divine_focus: boolean
  costly_components: boolean
}

const EMPTY_FORM: SpellFormState = {
  name: '', school: '', subschool: '', descriptor: '', level: '0',
  type: 'arcane', class_lists: '', casting_time: '', range: '', target: '',
  area: '', effect: '', duration: '', saving_throw: '', spell_resistance: '',
  description: '', material: '', arcane_focus: '', divine_focus: false, costly_components: false,
}

function rowToForm(row: Record<string, unknown>): SpellFormState {
  return {
    name: (row.name as string) ?? '',
    school: (row.school as string) ?? '',
    subschool: (row.subschool as string) ?? '',
    descriptor: (row.descriptor as string) ?? '',
    level: String(row.level ?? 0),
    type: (row.type as 'arcane' | 'divine' | 'both') ?? 'arcane',
    class_lists: (row.class_lists as string) ?? '',
    casting_time: (row.casting_time as string) ?? '',
    range: (row.range as string) ?? '',
    target: (row.target as string) ?? '',
    area: (row.area as string) ?? '',
    effect: (row.effect as string) ?? '',
    duration: (row.duration as string) ?? '',
    saving_throw: (row.saving_throw as string) ?? '',
    spell_resistance: (row.spell_resistance as string) ?? '',
    description: (row.description as string) ?? '',
    material: (row.material as string) ?? '',
    arcane_focus: (row.arcane_focus as string) ?? '',
    divine_focus: !!(row.divine_focus),
    costly_components: !!(row.costly_components),
  }
}

function SpellEditForm({ spellId, spellName, onBack }: SpellEditFormProps) {
  const [form, setForm] = useState<SpellFormState>(EMPTY_FORM)
  const [loadingSpell, setLoadingSpell] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLoadingSpell(true)
    supabase.from('spells').select(SPELL_COLS).eq('id', spellId).single()
      .then(({ data }) => {
        if (data) setForm(rowToForm(data as unknown as Record<string, unknown>))
        setLoadingSpell(false)
      })
  }, [spellId])

  function set<K extends keyof SpellFormState>(key: K, value: SpellFormState[K]) {
    setForm(f => ({ ...f, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true); setSaveError(''); setSaved(false)
    const payload = {
      name: form.name,
      school: form.school,
      subschool: form.subschool || null,
      descriptor: form.descriptor || null,
      level: parseInt(form.level),
      type: form.type,
      class_lists: form.class_lists || null,
      casting_time: form.casting_time || null,
      range: form.range || null,
      target: form.target || null,
      area: form.area || null,
      effect: form.effect || null,
      duration: form.duration || null,
      saving_throw: form.saving_throw || null,
      spell_resistance: form.spell_resistance || null,
      description: form.description || null,
      material: form.material || null,
      arcane_focus: form.arcane_focus || null,
      divine_focus: form.divine_focus,
      costly_components: form.costly_components,
    }
    const { error } = await supabase.from('spells').update(payload).eq('id', spellId)
    if (error) setSaveError(error.message)
    else setSaved(true)
    setSaving(false)
  }

  return (
    <div className={styles.editorCard}>
      <div className={styles.editFormHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={16} /> Volver
        </button>
        <h2 className={styles.editFormTitle}>{spellName}</h2>
      </div>

      {loadingSpell && <div className={styles.loadingMsg}>Cargando datos del conjuro…</div>}

      {!loadingSpell && (
        <>
          {saveError && <div className={styles.errorAlert}><AlertTriangle size={16} /><span>{saveError}</span></div>}
          {saved && <div className={styles.successBanner}><CheckCircle size={16} />Conjuro guardado correctamente.</div>}

          <div className={styles.editGrid}>
            <Field label="Nombre">
              <input className={styles.fieldInput} value={form.name} onChange={e => set('name', e.target.value)} />
            </Field>

            <Field label="Escuela">
              <select className={styles.fieldInput} value={form.school} onChange={e => set('school', e.target.value)}>
                {[...new Set([...SPELL_SCHOOLS, form.school])].filter(Boolean).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>

            <Field label="Sub-escuela">
              <input className={styles.fieldInput} value={form.subschool} onChange={e => set('subschool', e.target.value)} />
            </Field>

            <Field label="Descriptor">
              <input className={styles.fieldInput} value={form.descriptor} onChange={e => set('descriptor', e.target.value)} />
            </Field>

            <Field label="Nivel">
              <select className={styles.fieldInput} value={form.level} onChange={e => set('level', e.target.value)}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <option key={n} value={n}>{n === 0 ? '0 (Cantrip)' : n}</option>)}
              </select>
            </Field>

            <Field label="Tipo">
              <select className={styles.fieldInput} value={form.type} onChange={e => set('type', e.target.value as 'arcane' | 'divine' | 'both')}>
                <option value="arcane">Arcano</option>
                <option value="divine">Divino</option>
                <option value="both">Ambos</option>
              </select>
            </Field>

            <Field label="Tiempo de lanzamiento">
              <input className={styles.fieldInput} value={form.casting_time} onChange={e => set('casting_time', e.target.value)} />
            </Field>

            <Field label="Alcance">
              <input className={styles.fieldInput} value={form.range} onChange={e => set('range', e.target.value)} />
            </Field>

            <Field label="Objetivo">
              <input className={styles.fieldInput} value={form.target} onChange={e => set('target', e.target.value)} />
            </Field>

            <Field label="Área">
              <input className={styles.fieldInput} value={form.area} onChange={e => set('area', e.target.value)} />
            </Field>

            <Field label="Efecto">
              <input className={styles.fieldInput} value={form.effect} onChange={e => set('effect', e.target.value)} />
            </Field>

            <Field label="Duración">
              <input className={styles.fieldInput} value={form.duration} onChange={e => set('duration', e.target.value)} />
            </Field>

            <Field label="Tirada de salvación">
              <input className={styles.fieldInput} value={form.saving_throw} onChange={e => set('saving_throw', e.target.value)} />
            </Field>

            <Field label="Resistencia a conjuros">
              <input className={styles.fieldInput} value={form.spell_resistance} onChange={e => set('spell_resistance', e.target.value)} />
            </Field>

            <Field label="Material">
              <input className={styles.fieldInput} value={form.material} onChange={e => set('material', e.target.value)} />
            </Field>

            <Field label="Foco arcano">
              <input className={styles.fieldInput} value={form.arcane_focus} onChange={e => set('arcane_focus', e.target.value)} />
            </Field>

            <Field label="Clases (class_lists)" wide>
              <input className={styles.fieldInput} value={form.class_lists} onChange={e => set('class_lists', e.target.value)} />
            </Field>

            <div className={styles.checkboxRow}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={form.divine_focus} onChange={e => set('divine_focus', e.target.checked)} />
                Foco divino (DF)
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={form.costly_components} onChange={e => set('costly_components', e.target.checked)} />
                Componentes costosos
              </label>
            </div>
          </div>

          <Field label="Descripción" wide>
            <textarea
              className={styles.descriptionBox}
              rows={8}
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </Field>

          <div className={styles.saveRow}>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? <span className={styles.spinner} /> : <><Save size={16} /> Guardar cambios</>}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? styles.fieldWide : styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  )
}

// ── Importer sub-components ───────────────────────────────────────────────────

function SpellPreviewCard({ spell, onAdd }: { spell: Partial<Spell>; onAdd: () => void }) {
  return (
    <div className={styles.previewCard}>
      <div className={styles.previewHeader}>
        <h3 className={styles.previewName}>{spell.name}</h3>
        <span className={styles.previewSchool}>
          {spell.school}{spell.subschool && ` (${spell.subschool})`}{spell.descriptor && ` [${spell.descriptor}]`}
        </span>
      </div>
      <div className={styles.spellGrid}>
        {spell.classLists && Object.keys(spell.classLists).length > 0 && (
          <PreviewField label="Nivel por clase">
            {Object.entries(spell.classLists).map(([cls, lvl]) => (
              <span key={cls} className={styles.classTag}>{cls} {lvl}</span>
            ))}
          </PreviewField>
        )}
        {!spell.classLists && <PreviewField label="Nivel">{String(spell.level ?? 0)}</PreviewField>}
        <PreviewField label="Tiempo de lanzamiento">{spell.castingTime}</PreviewField>
        <PreviewField label="Alcance">{spell.range}</PreviewField>
        {spell.target && <PreviewField label="Objetivo">{spell.target}</PreviewField>}
        {spell.area && <PreviewField label="Área">{spell.area}</PreviewField>}
        {spell.effect && <PreviewField label="Efecto">{spell.effect}</PreviewField>}
        <PreviewField label="Duración">{spell.duration}</PreviewField>
        {spell.savingThrow && <PreviewField label="Salvación">{spell.savingThrow}</PreviewField>}
        {spell.spellResistance && <PreviewField label="Resistencia">{spell.spellResistance}</PreviewField>}
      </div>
      {spell.description && (
        <div className={styles.previewField}>
          <span className={styles.previewLabel}>Descripción</span>
          <textarea className={styles.descriptionBox} readOnly value={spell.description} rows={6} />
        </div>
      )}
      <button className={styles.addBtn} onClick={onAdd}><CheckCircle size={16} />Añadir a la biblioteca</button>
    </div>
  )
}

function PreviewField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.previewField}>
      <span className={styles.previewLabel}>{label}</span>
      <span className={styles.previewValue}>{children}</span>
    </div>
  )
}

// ── URL Importer Panel (generic, JSON-based) ──────────────────────────────

function UrlImporterPanel({
  table,
  requiredFields,
  placeholder,
  parser,
  onImported,
  onCancel,
}: {
  table: string
  requiredFields: string[]
  placeholder: string
  parser: (html: string) => Record<string, unknown>
  onImported: () => void
  onCancel: () => void
}) {
  const [url, setUrl] = useState('')
  const [fetchStatus, setFetchStatus] = useState<ImportStatus>('idle')
  const [fetchError, setFetchError] = useState('')
  const [jsonText, setJsonText] = useState('')
  const [missing, setMissing] = useState<string[]>([])
  const [duplicate, setDuplicate] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function handleFetch() {
    if (!url.trim()) return
    setFetchStatus('loading'); setFetchError(''); setJsonText(''); setMissing([]); setDuplicate(null)
    try {
      const html = await fetchWithProxy(url.trim())
      const data = parser(html)
      setJsonText(JSON.stringify(data, null, 2))
      setMissing(requiredFields.filter(f => !(f in data) || data[f] === null || data[f] === undefined))
      // Check for duplicate by id
      if (data.id) {
        const { data: existing } = await supabase.from(table).select('id').eq('id', data.id).limit(1)
        if (existing && existing.length > 0) setDuplicate(data.id as string)
      }
      setFetchStatus('done')
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Error desconocido')
      setFetchStatus('error')
    }
  }

  async function handleSave(forceNewId = false) {
    let data: Record<string, unknown>
    try {
      data = JSON.parse(jsonText)
    } catch {
      setSaveError('JSON inválido'); return
    }
    const miss = requiredFields.filter(f => !(f in data) || data[f] === null || data[f] === undefined)
    if (miss.length > 0) { setSaveError(`Faltan campos requeridos: ${miss.join(', ')}`); return }
    if (forceNewId) data.id = String(data.id) + '_' + Date.now()
    setSaving(true); setSaveError('')
    const { error: err } = await supabase.from(table).insert(data)
    if (err) { setSaveError(err.message); setSaving(false); return }
    await refreshSRD()
    onImported()
    setSaving(false)
  }

  return (
    <div className={styles.importerCard} style={{ marginBottom: 'var(--space-4)' }}>
      <h2>Importar desde d20pfsrd.com</h2>
      <p className={styles.cardDesc}>
        Pega la URL de la página de d20pfsrd.com. Se parseará automáticamente — revisa el JSON antes de guardar.
      </p>
      <div className={styles.urlRow}>
        <input
          className={styles.urlInput}
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder={placeholder}
          onKeyDown={e => e.key === 'Enter' && handleFetch()}
        />
        <button className={styles.importBtn} onClick={handleFetch} disabled={fetchStatus === 'loading' || !url.trim()}>
          {fetchStatus === 'loading' ? <span className={styles.spinner} /> : <><Download size={16} /> Obtener</>}
        </button>
      </div>
      {fetchStatus === 'error' && (
        <div className={styles.errorAlert}><AlertTriangle size={16} /><span>{fetchError}</span></div>
      )}
      {fetchStatus === 'done' && (
        <div className={styles.previewCard}>
          {missing.length > 0 && (
            <div className={styles.duplicateWarning}>
              <AlertTriangle size={16} />
              <span>Faltan campos requeridos: <strong>{missing.join(', ')}</strong>. Edita el JSON para añadirlos.</span>
            </div>
          )}
          {duplicate && (
            <div className={styles.duplicateWarning}>
              <AlertTriangle size={16} />
              <strong>Duplicado:</strong> Ya existe un registro con id <code>{duplicate}</code>.
              <div className={styles.dupActions}>
                <button className={styles.btnSecondary} onClick={onCancel}>Cancelar</button>
                <button className={styles.btnPrimary} onClick={() => handleSave(true)}>Guardar con nuevo ID</button>
              </div>
            </div>
          )}
          {!duplicate && (
            <>
              <Field label="JSON del registro (editable)" wide>
                <textarea
                  className={styles.descriptionBox}
                  rows={12}
                  value={jsonText}
                  onChange={e => { setJsonText(e.target.value); setSaveError('') }}
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                />
              </Field>
              {saveError && <div className={styles.errorAlert}><AlertTriangle size={16} /><span>{saveError}</span></div>}
              <div className={styles.dupActions}>
                <button className={styles.btnSecondary} onClick={onCancel}>Cancelar</button>
                <button className={styles.addBtn} onClick={() => handleSave(false)} disabled={saving}>
                  {saving ? <span className={styles.spinner} /> : <><CheckCircle size={16} /> Guardar nuevo</>}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Spell Importer Panel ───────────────────────────────────────────────────

function SpellImporterPanel({ onImported, onCancel }: { onImported: () => void; onCancel: () => void }) {
  const [url, setUrl] = useState('')
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle')
  const [preview, setPreview] = useState<Partial<Spell> | null>(null)
  const [duplicate, setDuplicate] = useState<Spell | null>(null)
  const [importError, setImportError] = useState('')

  const { customSpells } = useCustomSpellsStore()

  async function handleImport() {
    if (!url.trim()) return
    setImportStatus('loading')
    setPreview(null); setDuplicate(null); setImportError('')
    try {
      const html = await fetchWithProxy(url.trim())
      const parsed = parseD20SpellPage(html)
      const dup = await findDuplicateInDB(parsed.rawName ?? '', customSpells)
      setPreview(parsed); setDuplicate(dup); setImportStatus('done')
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Error desconocido')
      setImportStatus('error')
    }
  }

  async function handleAdd(forceNewId = false) {
    if (!preview) return
    const spell = { ...preview } as Spell
    if (forceNewId) spell.id = spell.id + '_custom_' + Date.now()
    const payload = {
      id: spell.id,
      name: spell.name,
      school: spell.school,
      subschool: spell.subschool ?? null,
      descriptor: spell.descriptor ?? null,
      level: spell.level,
      type: spell.type,
      class_lists: spell.classLists ?? null,
      casting_time: spell.castingTime,
      range: spell.range,
      target: spell.target ?? null,
      area: spell.area ?? null,
      effect: spell.effect ?? null,
      duration: spell.duration,
      saving_throw: spell.savingThrow ?? null,
      spell_resistance: spell.spellResistance ?? null,
      description: spell.description,
      material: spell.material ?? null,
      arcane_focus: spell.arcaneFocus ?? null,
      divine_focus: spell.divineFocus ?? null,
      costly_components: spell.costlyComponents ?? null,
    }
    const { error } = await supabase.from('spells').insert(payload)
    if (error) { setImportError(error.message); setImportStatus('error') }
    else {
      await refreshSRD()
      setPreview(null); setDuplicate(null); onImported()
    }
  }

  return (
    <div className={styles.importerCard} style={{ marginBottom: 'var(--space-4)' }}>
      <h2>Importar desde d20pfsrd.com</h2>
      <p className={styles.cardDesc}>Pega la URL de cualquier conjuro de d20pfsrd.com para añadirlo a la biblioteca.</p>
      <div className={styles.urlRow}>
        <input
          className={styles.urlInput}
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://www.d20pfsrd.com/magic/all-spells/f/fireball"
          onKeyDown={e => e.key === 'Enter' && handleImport()}
        />
        <button className={styles.importBtn} onClick={handleImport} disabled={importStatus === 'loading' || !url.trim()}>
          {importStatus === 'loading' ? <span className={styles.spinner} /> : <><Download size={16} /> Importar</>}
        </button>
      </div>
      {importStatus === 'error' && (
        <div className={styles.errorAlert}><AlertTriangle size={16} /><span>{importError}</span></div>
      )}
      {duplicate && preview && (
        <div className={styles.duplicateWarning}>
          <AlertTriangle size={16} />
          <strong>Posible duplicado:</strong> Ya existe un hechizo similar llamado &ldquo;{duplicate.name}&rdquo;.
          <div className={styles.dupActions}>
            <button className={styles.btnSecondary} onClick={onCancel}>Cancelar</button>
            <button className={styles.btnPrimary} onClick={() => handleAdd(true)}>Añadir igualmente</button>
          </div>
        </div>
      )}
      {preview && !duplicate && <SpellPreviewCard spell={preview} onAdd={() => handleAdd(false)} />}
    </div>
  )
}

// ── Shared SRD list/edit pattern ───────────────────────────────────────────

async function refreshSRD() {
  // Force re-fetch by resetting initialized flag, then fetching
  srdStore.setState({ initialized: false })
  await srdStore.getState().fetchAll()
}

// ── Skills Editor ──────────────────────────────────────────────────────────

type SkillForm = {
  name: string
  ability: Skill['ability']
  is_class_skill: boolean
  has_armor_check_penalty: boolean
  description: string
}

const ABILITY_OPTIONS: Array<{ value: Skill['ability']; label: string }> = [
  { value: 'strength', label: 'Fuerza' },
  { value: 'dexterity', label: 'Destreza' },
  { value: 'constitution', label: 'Constitución' },
  { value: 'intelligence', label: 'Inteligencia' },
  { value: 'wisdom', label: 'Sabiduría' },
  { value: 'charisma', label: 'Carisma' },
]

function SkillsEditor() {
  const { skills } = useSRDStore()
  const [selected, setSelected] = useState<Skill | null>(null)
  const [form, setForm] = useState<SkillForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showImporter, setShowImporter] = useState(false)
  const [importedMsg, setImportedMsg] = useState(false)

  function selectSkill(skill: Skill) {
    setSelected(skill)
    setForm({
      name: skill.name,
      ability: skill.ability,
      is_class_skill: skill.isClassSkill,
      has_armor_check_penalty: skill.hasArmorCheckPenalty,
      description: skill.description,
    })
    setSaved(false)
    setError('')
  }

  function back() { setSelected(null); setForm(null) }

  async function save() {
    if (!selected || !form) return
    setSaving(true); setError(''); setSaved(false)
    const { error: err } = await supabase.from('skills').update({
      name: form.name,
      ability: form.ability,
      is_class_skill: form.is_class_skill,
      has_armor_check_penalty: form.has_armor_check_penalty,
      description: form.description,
    }).eq('id', selected.id)
    if (err) setError(err.message)
    else { setSaved(true); await refreshSRD() }
    setSaving(false)
  }

  if (selected && form) {
    return (
      <div className={styles.editorCard}>
        <div className={styles.editFormHeader}>
          <button className={styles.backBtn} onClick={back}><ArrowLeft size={16} /> Volver</button>
          <h2 className={styles.editFormTitle}>{selected.name}</h2>
        </div>
        {error && <div className={styles.errorAlert}><AlertTriangle size={16} /><span>{error}</span></div>}
        {saved && <div className={styles.successBanner}><CheckCircle size={16} />Habilidad guardada.</div>}
        <div className={styles.editGrid}>
          <Field label="Nombre"><input className={styles.fieldInput} value={form.name} onChange={e => setForm(f => f && ({ ...f, name: e.target.value }))} /></Field>
          <Field label="Atributo">
            <select className={styles.fieldInput} value={form.ability} onChange={e => setForm(f => f && ({ ...f, ability: e.target.value as Skill['ability'] }))}>
              {ABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={form.is_class_skill} onChange={e => setForm(f => f && ({ ...f, is_class_skill: e.target.checked }))} />
              Habilidad de clase
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={form.has_armor_check_penalty} onChange={e => setForm(f => f && ({ ...f, has_armor_check_penalty: e.target.checked }))} />
              Penalización por armadura
            </label>
          </div>
        </div>
        <Field label="Descripción" wide>
          <textarea className={styles.descriptionBox} rows={4} value={form.description} onChange={e => setForm(f => f && ({ ...f, description: e.target.value }))} />
        </Field>
        <div className={styles.saveRow}>
          <button className={styles.saveBtn} onClick={save} disabled={saving}>
            {saving ? <span className={styles.spinner} /> : <><Save size={16} /> Guardar</>}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.editorCard}>
      <div className={styles.editorListHeader}>
        <h2>Skills ({skills.length})</h2>
        <button className={styles.importBtn} onClick={() => { setShowImporter(true); setImportedMsg(false) }}>
          <Download size={16} /> Importar desde URL
        </button>
      </div>
      {importedMsg && <div className={styles.successBanner}><CheckCircle size={16} />Skill importada correctamente.</div>}
      {showImporter && (
        <UrlImporterPanel
          table="skills"
          requiredFields={['name', 'ability']}
          placeholder="https://www.d20pfsrd.com/skills/acrobatics"
          parser={parseD20SkillPage}
          onImported={() => { setShowImporter(false); setImportedMsg(true) }}
          onCancel={() => setShowImporter(false)}
        />
      )}
      <ul className={styles.searchResults}>
        {[...skills].sort((a, b) => a.name.localeCompare(b.name, 'es')).map(skill => (
          <li key={skill.id} className={styles.searchResultItem} onClick={() => selectSkill(skill)}>
            <div className={styles.searchResultMain}>
              <span className={styles.searchResultName}>{skill.name}</span>
              <span className={styles.searchResultMeta}>{skill.ability.substring(0, 3).toUpperCase()}{skill.hasArmorCheckPenalty ? ' · ACP' : ''}</span>
            </div>
            <Pencil size={14} className={styles.editHint} />
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Feats Editor ───────────────────────────────────────────────────────────

const FEAT_TYPE_OPTIONS = [
  { value: 'combat', label: 'Combate' },
  { value: 'general', label: 'General' },
  { value: 'metamagic', label: 'Metamagia' },
  { value: 'item_creation', label: 'Creación de Objetos' },
  { value: 'teamwork', label: 'Trabajo en Equipo' },
  { value: 'critical', label: 'Crítico' },
  { value: 'style', label: 'Estilo' },
  { value: 'race', label: 'Raza' },
  { value: 'story', label: 'Historia' },
]

type FeatForm = {
  name: string
  type: FeatType[]
  prerequisite: string
  benefit: string
  normal: string
  special: string
  effects: string
}

function FeatsEditor() {
  const { feats } = useSRDStore()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Feat | null>(null)
  const [form, setForm] = useState<FeatForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [jsonError, setJsonError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [filtered, setFiltered] = useState<Feat[]>([])
  const [showImporter, setShowImporter] = useState(false)
  const [importedMsg, setImportedMsg] = useState(false)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const q = search.toLowerCase()
      const base = q ? feats.filter(f => f.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q)) : feats.slice(0, 30)
      setFiltered([...base].sort((a, b) => a.name.localeCompare(b.name, 'es')))
    }, 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search, feats])

  function selectFeat(feat: Feat) {
    setSelected(feat)
    setForm({
      name: feat.name,
      type: feat.type,
      prerequisite: feat.prerequisite ?? '',
      benefit: feat.benefit,
      normal: feat.normal ?? '',
      special: feat.special ?? '',
      effects: feat.effects ? JSON.stringify(feat.effects, null, 2) : '',
    })
    setSaved(false); setError(''); setJsonError('')
  }

  function back() { setSelected(null); setForm(null) }

  function validateEffects(val: string): unknown[] | null {
    if (!val.trim()) return []
    try { return JSON.parse(val) } catch { return null }
  }

  async function save() {
    if (!selected || !form) return
    const effects = validateEffects(form.effects)
    if (effects === null) { setJsonError('JSON de effects inválido'); return }
    setSaving(true); setError(''); setSaved(false); setJsonError('')
    const { error: err } = await supabase.from('feats').update({
      name: form.name,
      type: form.type,
      prerequisite: form.prerequisite || null,
      benefit: form.benefit,
      normal: form.normal || null,
      special: form.special || null,
      effects: effects.length > 0 ? effects : null,
    }).eq('id', selected.id)
    if (err) setError(err.message)
    else { setSaved(true); await refreshSRD() }
    setSaving(false)
  }

  if (selected && form) {
    return (
      <div className={styles.editorCard}>
        <div className={styles.editFormHeader}>
          <button className={styles.backBtn} onClick={back}><ArrowLeft size={16} /> Volver</button>
          <h2 className={styles.editFormTitle}>{selected.name}</h2>
        </div>
        {error && <div className={styles.errorAlert}><AlertTriangle size={16} /><span>{error}</span></div>}
        {saved && <div className={styles.successBanner}><CheckCircle size={16} />Dote guardada.</div>}
        <div className={styles.editGrid}>
          <Field label="Nombre"><input className={styles.fieldInput} value={form.name} onChange={e => setForm(f => f && ({ ...f, name: e.target.value }))} /></Field>
          <Field label="Tipo">
            <select className={styles.fieldInput} value={form.type[0] || ''} onChange={e => setForm(f => f && ({ ...f, type: [e.target.value as FeatType] }))}>
              {FEAT_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Prerrequisito" wide><input className={styles.fieldInput} value={form.prerequisite} onChange={e => setForm(f => f && ({ ...f, prerequisite: e.target.value }))} /></Field>
        </div>
        <Field label="Beneficio" wide>
          <textarea className={styles.descriptionBox} rows={4} value={form.benefit} onChange={e => setForm(f => f && ({ ...f, benefit: e.target.value }))} />
        </Field>
        <Field label="Normal" wide>
          <textarea className={styles.descriptionBox} rows={2} value={form.normal} onChange={e => setForm(f => f && ({ ...f, normal: e.target.value }))} />
        </Field>
        <Field label="Especial" wide>
          <textarea className={styles.descriptionBox} rows={2} value={form.special} onChange={e => setForm(f => f && ({ ...f, special: e.target.value }))} />
        </Field>
        <Field label="Effects (JSON)" wide>
          <textarea className={styles.descriptionBox} rows={4} value={form.effects} onChange={e => { setForm(f => f && ({ ...f, effects: e.target.value })); setJsonError('') }} style={{ fontFamily: 'monospace', fontSize: '0.8rem' }} />
        </Field>
        {jsonError && <div className={styles.errorAlert}><AlertTriangle size={16} /><span>{jsonError}</span></div>}
        <div className={styles.saveRow}>
          <button className={styles.saveBtn} onClick={save} disabled={saving}>
            {saving ? <span className={styles.spinner} /> : <><Save size={16} /> Guardar</>}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.editorCard}>
      <div className={styles.editorListHeader}>
        <h2>Feats ({feats.length})</h2>
        <button className={styles.importBtn} onClick={() => { setShowImporter(true); setImportedMsg(false) }}>
          <Download size={16} /> Importar desde URL
        </button>
      </div>
      {importedMsg && <div className={styles.successBanner}><CheckCircle size={16} />Dote importada correctamente.</div>}
      {showImporter && (
        <UrlImporterPanel
          table="feats"
          requiredFields={['name', 'type', 'benefit']}
          placeholder="https://www.d20pfsrd.com/feats/combat-feats/power-attack-combat"
          parser={parseD20FeatPage}
          onImported={() => { setShowImporter(false); setImportedMsg(true) }}
          onCancel={() => setShowImporter(false)}
        />
      )}
      <div className={styles.editorSearchRow}>
        <Search size={16} className={styles.editorSearchIcon} />
        <input className={styles.editorSearchInput} placeholder="Buscar dote…" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
      </div>
      <ul className={styles.searchResults}>
        {filtered.map(feat => (
          <li key={feat.id} className={styles.searchResultItem} onClick={() => selectFeat(feat)}>
            <div className={styles.searchResultMain}>
              <span className={styles.searchResultName}>{feat.name}</span>
              <span className={styles.searchResultMeta}>{feat.type}</span>
            </div>
            <Pencil size={14} className={styles.editHint} />
          </li>
        ))}
      </ul>
      {!search && <p className={styles.noResults}>Mostrando primeras 30 — busca para filtrar</p>}
    </div>
  )
}

// ── Classes Editor ─────────────────────────────────────────────────────────

type ClassForm = {
  name: string
  hit_die: string
  base_attack_bonus: string
  fortitude_save: string
  reflex_save: string
  will_save: string
  skill_points_per_level: string
  magic_type: string
  caster_ability: string
  starting_gold_dice: string
  description: string
  class_skills: string
  features: string
  alignment: string
  spells_per_day: string
}

function ClassesEditor() {
  const { classes } = useSRDStore()
  const [selected, setSelected] = useState<ClassData | null>(null)
  const [form, setForm] = useState<ClassForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({})
  const [showImporter, setShowImporter] = useState(false)
  const [importedMsg, setImportedMsg] = useState(false)

  function selectClass(cls: ClassData) {
    setSelected(cls)
    setForm({
      name: cls.name,
      hit_die: String(cls.hitDie),
      base_attack_bonus: cls.baseAttackBonus,
      fortitude_save: cls.fortitudeSave,
      reflex_save: cls.reflexSave,
      will_save: cls.willSave,
      skill_points_per_level: String(cls.skillPointsPerLevel),
      magic_type: cls.magicType ?? '',
      caster_ability: cls.casterAbility ?? '',
      starting_gold_dice: cls.startingGoldDice,
      description: cls.description,
      class_skills: JSON.stringify(cls.classSkills, null, 2),
      features: JSON.stringify(cls.features, null, 2),
      alignment: JSON.stringify(cls.alignment, null, 2),
      spells_per_day: cls.spellsPerDay ? JSON.stringify(cls.spellsPerDay, null, 2) : '',
    })
    setSaved(false); setError(''); setJsonErrors({})
  }

  function back() { setSelected(null); setForm(null) }

  function parseField(key: string, val: string): [unknown, string | null] {
    if (!val.trim()) return [null, null]
    try { return [JSON.parse(val), null] } catch { return [null, `JSON inválido en ${key}`] }
  }

  async function save() {
    if (!selected || !form) return
    const errs: Record<string, string> = {}
    const [classSkills, e1] = parseField('class_skills', form.class_skills)
    const [features, e2] = parseField('features', form.features)
    const [alignment, e3] = parseField('alignment', form.alignment)
    const [spellsPerDay, e4] = parseField('spells_per_day', form.spells_per_day)
    if (e1) errs.class_skills = e1
    if (e2) errs.features = e2
    if (e3) errs.alignment = e3
    if (e4) errs.spells_per_day = e4
    if (Object.keys(errs).length > 0) { setJsonErrors(errs); return }

    setSaving(true); setError(''); setSaved(false); setJsonErrors({})
    const { error: err } = await supabase.from('classes').update({
      name: form.name,
      hit_die: parseInt(form.hit_die),
      base_attack_bonus: form.base_attack_bonus,
      fortitude_save: form.fortitude_save,
      reflex_save: form.reflex_save,
      will_save: form.will_save,
      skill_points_per_level: parseInt(form.skill_points_per_level),
      magic_type: form.magic_type || null,
      caster_ability: form.caster_ability || null,
      starting_gold_dice: form.starting_gold_dice,
      description: form.description,
      class_skills: classSkills,
      features,
      alignment,
      spells_per_day: spellsPerDay,
    }).eq('id', selected.id)
    if (err) setError(err.message)
    else { setSaved(true); await refreshSRD() }
    setSaving(false)
  }

  if (selected && form) {
    const setF = (key: keyof ClassForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => f && ({ ...f, [key]: e.target.value }))

    return (
      <div className={styles.editorCard}>
        <div className={styles.editFormHeader}>
          <button className={styles.backBtn} onClick={back}><ArrowLeft size={16} /> Volver</button>
          <h2 className={styles.editFormTitle}>{selected.name}</h2>
        </div>
        {error && <div className={styles.errorAlert}><AlertTriangle size={16} /><span>{error}</span></div>}
        {saved && <div className={styles.successBanner}><CheckCircle size={16} />Clase guardada.</div>}
        <div className={styles.editGrid}>
          <Field label="Nombre"><input className={styles.fieldInput} value={form.name} onChange={setF('name')} /></Field>
          <Field label="Dado de Golpe (d?)"><input className={styles.fieldInput} type="number" value={form.hit_die} onChange={setF('hit_die')} /></Field>
          <Field label="BAB">
            <select className={styles.fieldInput} value={form.base_attack_bonus} onChange={setF('base_attack_bonus')}>
              <option value="good">good</option><option value="medium">medium</option><option value="poor">poor</option>
            </select>
          </Field>
          <Field label="Fort">
            <select className={styles.fieldInput} value={form.fortitude_save} onChange={setF('fortitude_save')}>
              <option value="good">good</option><option value="poor">poor</option>
            </select>
          </Field>
          <Field label="Ref">
            <select className={styles.fieldInput} value={form.reflex_save} onChange={setF('reflex_save')}>
              <option value="good">good</option><option value="poor">poor</option>
            </select>
          </Field>
          <Field label="Vol">
            <select className={styles.fieldInput} value={form.will_save} onChange={setF('will_save')}>
              <option value="good">good</option><option value="poor">poor</option>
            </select>
          </Field>
          <Field label="Puntos de Hab/Nivel"><input className={styles.fieldInput} type="number" value={form.skill_points_per_level} onChange={setF('skill_points_per_level')} /></Field>
          <Field label="Tipo de Magia">
            <select className={styles.fieldInput} value={form.magic_type} onChange={setF('magic_type')}>
              <option value="">Ninguna</option><option value="arcane">arcane</option><option value="divine">divine</option><option value="bardic">bardic</option><option value="alchemist">alchemist</option>
            </select>
          </Field>
          <Field label="Atributo de Lanzamiento">
            <select className={styles.fieldInput} value={form.caster_ability} onChange={setF('caster_ability')}>
              <option value="">Ninguno</option><option value="intelligence">intelligence</option><option value="wisdom">wisdom</option><option value="charisma">charisma</option>
            </select>
          </Field>
          <Field label="Oro inicial (dados)"><input className={styles.fieldInput} value={form.starting_gold_dice} onChange={setF('starting_gold_dice')} /></Field>
          <Field label="Descripción" wide>
            <textarea className={styles.descriptionBox} rows={3} value={form.description} onChange={setF('description')} />
          </Field>
        </div>
        {(['class_skills', 'features', 'alignment', 'spells_per_day'] as const).map(key => (
          <div key={key}>
            <Field label={key} wide>
              <textarea className={styles.descriptionBox} rows={key === 'spells_per_day' ? 8 : 4} value={form[key]} onChange={setF(key)} style={{ fontFamily: 'monospace', fontSize: '0.8rem' }} />
            </Field>
            {jsonErrors[key] && <div className={styles.errorAlert}><AlertTriangle size={16} /><span>{jsonErrors[key]}</span></div>}
          </div>
        ))}
        <div className={styles.saveRow}>
          <button className={styles.saveBtn} onClick={save} disabled={saving}>
            {saving ? <span className={styles.spinner} /> : <><Save size={16} /> Guardar</>}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.editorCard}>
      <div className={styles.editorListHeader}>
        <h2>Clases ({classes.length})</h2>
        <button className={styles.importBtn} onClick={() => { setShowImporter(true); setImportedMsg(false) }}>
          <Download size={16} /> Importar desde URL
        </button>
      </div>
      {importedMsg && <div className={styles.successBanner}><CheckCircle size={16} />Clase importada correctamente.</div>}
      {showImporter && (
        <UrlImporterPanel
          table="classes"
          requiredFields={['name', 'hit_die', 'base_attack_bonus', 'fortitude_save', 'reflex_save', 'will_save', 'skill_points_per_level']}
          placeholder="https://www.d20pfsrd.com/classes/core-classes/barbarian"
          parser={parseD20ClassPage}
          onImported={() => { setShowImporter(false); setImportedMsg(true) }}
          onCancel={() => setShowImporter(false)}
        />
      )}
      <ul className={styles.searchResults}>
        {[...classes].sort((a, b) => a.name.localeCompare(b.name, 'es')).map(cls => (
          <li key={cls.id} className={styles.searchResultItem} onClick={() => selectClass(cls)}>
            <div className={styles.searchResultMain}>
              <span className={styles.searchResultName}>{cls.name}</span>
              <span className={styles.searchResultMeta}>d{cls.hitDie} · {cls.baseAttackBonus} BAB{cls.magicType ? ` · ${cls.magicType}` : ''}</span>
            </div>
            <Pencil size={14} className={styles.editHint} />
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Races Editor ───────────────────────────────────────────────────────────

type RaceForm = {
  label: string
  size: string
  speed: string
  bonus_desc: string
  favored_class: string
  desc: string
  bonuses: string
  traits: string
  subraces: string
}

function RacesEditor() {
  const { races } = useSRDStore()
  const [selected, setSelected] = useState<Race | null>(null)
  const [form, setForm] = useState<RaceForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({})
  const [showImporter, setShowImporter] = useState(false)
  const [importedMsg, setImportedMsg] = useState(false)

  function selectRace(race: Race) {
    setSelected(race)
    setForm({
      label: race.label,
      size: race.size,
      speed: String(race.speed),
      bonus_desc: race.bonusDesc,
      favored_class: race.favoredClass ?? '',
      desc: race.desc,
      bonuses: JSON.stringify(race.bonuses, null, 2),
      traits: JSON.stringify(race.traits, null, 2),
      subraces: race.subraces ? JSON.stringify(race.subraces, null, 2) : '',
    })
    setSaved(false); setError(''); setJsonErrors({})
  }

  function back() { setSelected(null); setForm(null) }

  function parseField(key: string, val: string): [unknown, string | null] {
    if (!val.trim()) return [null, null]
    try { return [JSON.parse(val), null] } catch { return [null, `JSON inválido en ${key}`] }
  }

  async function save() {
    if (!selected || !form) return
    const errs: Record<string, string> = {}
    const [bonuses, e1] = parseField('bonuses', form.bonuses)
    const [traits, e2] = parseField('traits', form.traits)
    const [subraces, e3] = parseField('subraces', form.subraces)
    if (e1) errs.bonuses = e1
    if (e2) errs.traits = e2
    if (e3) errs.subraces = e3
    if (Object.keys(errs).length > 0) { setJsonErrors(errs); return }

    setSaving(true); setError(''); setSaved(false); setJsonErrors({})
    const { error: err } = await supabase.from('races').update({
      label: form.label,
      size: form.size,
      speed: parseInt(form.speed),
      bonus_desc: form.bonus_desc,
      favored_class: form.favored_class || null,
      desc: form.desc,
      bonuses,
      traits,
      subraces,
    }).eq('id', selected.id)
    if (err) setError(err.message)
    else { setSaved(true); await refreshSRD() }
    setSaving(false)
  }

  if (selected && form) {
    const setF = (key: keyof RaceForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => f && ({ ...f, [key]: e.target.value }))

    return (
      <div className={styles.editorCard}>
        <div className={styles.editFormHeader}>
          <button className={styles.backBtn} onClick={back}><ArrowLeft size={16} /> Volver</button>
          <h2 className={styles.editFormTitle}>{selected.label}</h2>
        </div>
        {error && <div className={styles.errorAlert}><AlertTriangle size={16} /><span>{error}</span></div>}
        {saved && <div className={styles.successBanner}><CheckCircle size={16} />Raza guardada.</div>}
        <div className={styles.editGrid}>
          <Field label="Nombre"><input className={styles.fieldInput} value={form.label} onChange={setF('label')} /></Field>
          <Field label="Tamaño">
            <select className={styles.fieldInput} value={form.size} onChange={setF('size')}>
              <option value="small">small</option><option value="medium">medium</option>
            </select>
          </Field>
          <Field label="Velocidad (ft)"><input className={styles.fieldInput} type="number" value={form.speed} onChange={setF('speed')} /></Field>
          <Field label="Descripción de Bonos" wide><input className={styles.fieldInput} value={form.bonus_desc} onChange={setF('bonus_desc')} /></Field>
          <Field label="Clase Favorecida"><input className={styles.fieldInput} value={form.favored_class} onChange={setF('favored_class')} /></Field>
          <Field label="Descripción" wide>
            <textarea className={styles.descriptionBox} rows={3} value={form.desc} onChange={setF('desc')} />
          </Field>
        </div>
        {(['bonuses', 'traits', 'subraces'] as const).map(key => (
          <div key={key}>
            <Field label={key} wide>
              <textarea className={styles.descriptionBox} rows={key === 'traits' ? 6 : 4} value={form[key]} onChange={setF(key)} style={{ fontFamily: 'monospace', fontSize: '0.8rem' }} />
            </Field>
            {jsonErrors[key] && <div className={styles.errorAlert}><AlertTriangle size={16} /><span>{jsonErrors[key]}</span></div>}
          </div>
        ))}
        <div className={styles.saveRow}>
          <button className={styles.saveBtn} onClick={save} disabled={saving}>
            {saving ? <span className={styles.spinner} /> : <><Save size={16} /> Guardar</>}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.editorCard}>
      <div className={styles.editorListHeader}>
        <h2>Razas ({races.length})</h2>
        <button className={styles.importBtn} onClick={() => { setShowImporter(true); setImportedMsg(false) }}>
          <Download size={16} /> Importar desde URL
        </button>
      </div>
      {importedMsg && <div className={styles.successBanner}><CheckCircle size={16} />Raza importada correctamente.</div>}
      {showImporter && (
        <UrlImporterPanel
          table="races"
          requiredFields={['label', 'size', 'speed']}
          placeholder="https://www.d20pfsrd.com/races/core-races/dwarf"
          parser={parseD20RacePage}
          onImported={() => { setShowImporter(false); setImportedMsg(true) }}
          onCancel={() => setShowImporter(false)}
        />
      )}
      <ul className={styles.searchResults}>
        {[...races].sort((a, b) => a.label.localeCompare(b.label, 'es')).map(race => (
          <li key={race.id} className={styles.searchResultItem} onClick={() => selectRace(race)}>
            <div className={styles.searchResultMain}>
              <span className={styles.searchResultName}>{race.label}</span>
              <span className={styles.searchResultMeta}>{race.size} · {race.speed}ft{race.favoredClass ? ` · ${race.favoredClass}` : ''}</span>
            </div>
            <Pencil size={14} className={styles.editHint} />
          </li>
        ))}
      </ul>
    </div>
  )
}


// -- Archetypes Editor --------------------------------------------------------

const EMPTY_ARCHETYPE: Omit<Archetype, 'id'> = {
  classId: '',
  name: '',
  description: '',
  replaces: [],
  features: [],
  classSkillsAdded: [],
  classSkillsRemoved: [],
}

function ArchetypesEditor() {
  const { archetypes } = useSRDStore()
  const [selected, setSelected] = useState<Archetype | null>(null)
  const [form, setForm] = useState<Omit<Archetype, 'id'>>(EMPTY_ARCHETYPE)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [filterClass, setFilterClass] = useState<string>('')

  const grouped = CLASSES.reduce<Record<string, Archetype[]>>((acc, cls) => {
    acc[cls.id] = archetypes.filter((a) => a.classId === cls.id)
    return acc
  }, {})

  function startNew() {
    setSelected(null)
    setForm(EMPTY_ARCHETYPE)
    setStatus('')
  }

  function startEdit(a: Archetype) {
    setSelected(a)
    setForm({
      classId: a.classId,
      name: a.name,
      description: a.description,
      replaces: a.replaces,
      features: a.features,
      classSkillsAdded: a.classSkillsAdded ?? [],
      classSkillsRemoved: a.classSkillsRemoved ?? [],
      spellsPerDayOverride: a.spellsPerDayOverride,
    })
    setStatus('')
  }

  async function handleSave() {
    if (!form.classId || !form.name) { setStatus('Completa clase y nombre'); return }
    setSaving(true)
    setStatus('')
    try {
      const payload = {
        class_id: form.classId,
        name: form.name,
        description: form.description,
        replaces: form.replaces,
        features: form.features,
        class_skills_added: form.classSkillsAdded,
        class_skills_removed: form.classSkillsRemoved,
        spells_per_day_override: form.spellsPerDayOverride ?? null,
      }
      if (selected) {
        await supabase.from('archetypes').update(payload).eq('id', selected.id)
      } else {
        await supabase.from('archetypes').insert({ id: form.name.toLowerCase().replace(/\s+/g, '-'), ...payload })
      }
      setStatus('Guardado')
      srdStore.setState({ initialized: false })
      await srdStore.getState().fetchAll()
    } catch (e) {
      setStatus('Error: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminar este arquetipo?')) return
    await supabase.from('archetypes').delete().eq('id', id)
    srdStore.setState({ initialized: false })
    await srdStore.getState().fetchAll()
    if (selected?.id === id) startNew()
  }

  const addReplacement = () =>
    setForm((f) => ({ ...f, replaces: [...f.replaces, { featureName: '', atLevel: 1, type: 'replaces' as ReplacementType }] }))

  const updateReplacement = (i: number, key: string, value: string | number) =>
    setForm((f) => ({ ...f, replaces: f.replaces.map((r, idx) => idx === i ? { ...r, [key]: value } : r) }))

  const removeReplacement = (i: number) =>
    setForm((f) => ({ ...f, replaces: f.replaces.filter((_, idx) => idx !== i) }))

  const visibleClasses = CLASSES.filter((c) =>
    filterClass ? c.id === filterClass : (grouped[c.id] ?? []).length > 0
  )

  return (
    <div className={styles.editorLayout}>
      <aside className={styles.editorSidebar}>
        <div className={styles.editorSidebarHeader}>
          <select className={styles.filterSelect} value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
            <option value="">Todas las clases</option>
            {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className={styles.newBtn} onClick={startNew}>+ Nuevo</button>
        </div>
        <ul className={styles.itemList}>
          {visibleClasses.map((cls) => {
            const list = grouped[cls.id] ?? []
            if (list.length === 0) return null
            return (
              <li key={cls.id}>
                <span className={styles.listGroupLabel}>{cls.name}</span>
                {list.map((a) => (
                  <div
                    key={a.id}
                    className={[styles.listItem, selected?.id === a.id ? styles.listItemActive : ''].join(' ')}
                    onClick={() => startEdit(a)}
                  >
                    <span className={styles.listItemName}>{a.name}</span>
                    <button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); handleDelete(a.id) }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </li>
            )
          })}
        </ul>
      </aside>
      <div className={styles.editorForm}>
        <h3 className={styles.formTitle}>{selected ? 'Editar: ' + selected.name : 'Nuevo Arquetipo'}</h3>
        <div className={styles.formRow}>
          <label>Clase</label>
          <select className={styles.inputFull} value={form.classId} onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}>
            <option value="">Selecciona clase...</option>
            {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className={styles.formRow}>
          <label>Nombre</label>
          <input className={styles.inputFull} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nombre del arquetipo" />
        </div>
        <div className={styles.formRow}>
          <label>Descripcion</label>
          <textarea className={styles.textareaFull} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className={styles.formSection}>
          <div className={styles.formSectionHeader}>
            <span>Reemplazos</span>
            <button className={styles.addRowBtn} onClick={addReplacement}>+ Anadir</button>
          </div>
          {form.replaces.map((r, i) => (
            <div key={i} className={styles.replacementRow}>
              <input className={styles.inputMd} placeholder="Nombre de la caracteristica" value={r.featureName} onChange={(e) => updateReplacement(i, 'featureName', e.target.value)} />
              <input className={styles.inputSm} type="number" min={1} max={20} value={r.atLevel} onChange={(e) => updateReplacement(i, 'atLevel', parseInt(e.target.value) || 1)} />
              <select className={styles.inputSm} value={r.type} onChange={(e) => updateReplacement(i, 'type', e.target.value)}>
                <option value="replaces">Reemplaza</option>
                <option value="changes">Modifica</option>
                <option value="optional">Opcional</option>
              </select>
              <button className={styles.deleteBtn} onClick={() => removeReplacement(i)}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
        <div className={styles.formRow}>
          <label>Caracteristicas (JSON)</label>
          <textarea className={styles.textareaFull} rows={5}
            value={JSON.stringify(form.features, null, 2)}
            onChange={(e) => { try { setForm((f) => ({ ...f, features: JSON.parse(e.target.value) })) } catch { } }}
          />
        </div>
        <div className={styles.formRow}>
          <label>Habilidades Anadidas (coma)</label>
          <input className={styles.inputFull} value={(form.classSkillsAdded ?? []).join(', ')}
            onChange={(e) => setForm((f) => ({ ...f, classSkillsAdded: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} />
        </div>
        <div className={styles.formRow}>
          <label>Habilidades Eliminadas (coma)</label>
          <input className={styles.inputFull} value={(form.classSkillsRemoved ?? []).join(', ')}
            onChange={(e) => setForm((f) => ({ ...f, classSkillsRemoved: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))} />
        </div>
        <div className={styles.formRow}>
          <label>Override Hechizos por Dia (JSON, opcional)</label>
          <textarea className={styles.textareaFull} rows={3}
            value={form.spellsPerDayOverride ? JSON.stringify(form.spellsPerDayOverride, null, 2) : ''}
            onChange={(e) => { try { setForm((f) => ({ ...f, spellsPerDayOverride: e.target.value.trim() ? JSON.parse(e.target.value) : undefined })) } catch { } }}
          />
        </div>
        <div className={styles.formActions}>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
          {status && <span className={styles.statusMsg}>{status}</span>}
        </div>
      </div>
    </div>
  )
}
