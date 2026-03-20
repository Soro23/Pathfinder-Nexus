import { useState, useEffect, useRef } from 'react'
import { Download, Trash2, AlertTriangle, CheckCircle, Pencil, Search, ArrowLeft, Save } from 'lucide-react'
import type { Spell } from '../data/spells'
import { SPELL_SCHOOLS } from '../data/spells'
import { useCustomSpellsStore } from '../store/customSpellsStore'
import { parseD20SpellPage } from '../utils/d20pfsrdParser'
import { supabase } from '../lib/supabase'
import { mapSpellRow } from '../hooks/useSpells'
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

type TabId = 'importer' | 'editor'
type ImportStatus = 'idle' | 'loading' | 'done' | 'error'

export function Admin() {
  const [activeTab, setActiveTab] = useState<TabId>('importer')

  // Importer state
  const [url, setUrl] = useState('')
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle')
  const [preview, setPreview] = useState<Partial<Spell> | null>(null)
  const [duplicate, setDuplicate] = useState<Spell | null>(null)
  const [importError, setImportError] = useState('')
  const [added, setAdded] = useState(false)

  const { customSpells, fetchCustomSpells, addSpell, removeSpell, loading } = useCustomSpellsStore()
  useEffect(() => { fetchCustomSpells() }, [fetchCustomSpells])

  async function handleImport() {
    if (!url.trim()) return
    setImportStatus('loading')
    setPreview(null); setDuplicate(null); setAdded(false); setImportError('')
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
    const { error } = await addSpell(spell)
    if (error) { setImportError(error); setImportStatus('error') }
    else { setAdded(true); setPreview(null); setDuplicate(null) }
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>Herramientas de Administración</h1>
        <p className={styles.subtitle}>Gestiona y amplía la biblioteca de hechizos de la aplicación.</p>
      </header>

      <nav className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'importer' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('importer')}
        >
          <Download size={16} /> Importador de Hechizos
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'editor' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          <Pencil size={16} /> Editor de Conjuros
        </button>
      </nav>

      <div className={styles.tabContent}>
        {activeTab === 'importer' && (
          <>
            <div className={styles.importerCard}>
              <h2>Importar desde d20pfsrd.com</h2>
              <p className={styles.cardDesc}>Pega la URL de cualquier hechizo de d20pfsrd.com para añadirlo a la biblioteca.</p>
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
              {added && (
                <div className={styles.successBanner}><CheckCircle size={16} />Hechizo añadido correctamente a la biblioteca.</div>
              )}
              {duplicate && preview && (
                <div className={styles.duplicateWarning}>
                  <AlertTriangle size={16} />
                  <strong>Posible duplicado:</strong> Ya existe un hechizo similar llamado &ldquo;{duplicate.name}&rdquo;.
                  <div className={styles.dupActions}>
                    <button className={styles.btnSecondary} onClick={() => { setPreview(null); setDuplicate(null) }}>Cancelar</button>
                    <button className={styles.btnPrimary} onClick={() => handleAdd(true)}>Añadir igualmente</button>
                  </div>
                </div>
              )}
              {preview && <SpellPreviewCard spell={preview} onAdd={() => handleAdd(false)} />}
            </div>

            {customSpells.length > 0 && (
              <div className={styles.customListCard}>
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
          </>
        )}

        {activeTab === 'editor' && <SpellEditor />}
      </div>
    </div>
  )
}

// ── Spell Editor ──────────────────────────────────────────────────────────────

type EditorPhase = 'search' | 'edit'

function SpellEditor() {
  const [phase, setPhase] = useState<EditorPhase>('search')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Spell[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [selectedName, setSelectedName] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  function selectSpell(spell: Spell) {
    setSelectedId(spell.id)
    setSelectedName(spell.name)
    setPhase('edit')
  }

  function backToSearch() {
    setPhase('search')
    setSelectedId('')
    setSelectedName('')
  }

  if (phase === 'edit' && selectedId) {
    return <SpellEditForm spellId={selectedId} spellName={selectedName} onBack={backToSearch} />
  }

  return (
    <div className={styles.editorCard}>
      <h2>Buscar conjuro para editar</h2>
      <p className={styles.cardDesc}>Escribe el nombre del conjuro que quieres modificar.</p>

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
            <li key={spell.id} className={styles.searchResultItem} onClick={() => selectSpell(spell)}>
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
                {[0,1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n === 0 ? '0 (Cantrip)' : n}</option>)}
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
