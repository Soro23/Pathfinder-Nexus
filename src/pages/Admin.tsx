import { useState, useEffect } from 'react'
import { Download, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import type { Spell } from '../data/spells'
import { useCustomSpellsStore } from '../store/customSpellsStore'
import { parseD20SpellPage } from '../utils/d20pfsrdParser'
import { supabase } from '../lib/supabase'
import { mapSpellRow } from '../hooks/useSpells'
import styles from './Admin.module.css'

const PROXY = 'https://corsproxy.io/?'

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

async function findDuplicateInDB(name: string, customSpells: Spell[]): Promise<Spell | null> {
  const n = normalize(name)
  // Check custom spells first (client-side, instant)
  const customDup = customSpells.find(s => normalize(s.name) === n)
    ?? customSpells.find(s => normalize(s.name).includes(n) || n.includes(normalize(s.name)))
  if (customDup) return customDup

  // Check Supabase spells table
  const { data } = await supabase
    .from('spells')
    .select('id,name,school,subschool,descriptor,level,type,casting_time,range,target,area,effect,duration,saving_throw,spell_resistance,description,material,arcane_focus,divine_focus,costly_components')
    .ilike('name', `%${name.trim()}%`)
    .limit(5)

  if (data && data.length > 0) {
    const exact = data.find(r => normalize(r.name as string) === n)
    const partial = data.find(r => {
      const rn = normalize(r.name as string)
      return rn.includes(n) || n.includes(rn)
    })
    const match = exact ?? partial
    if (match) return mapSpellRow(match as unknown as Record<string, unknown>)
  }
  return null
}

type Status = 'idle' | 'loading' | 'done' | 'error'

export function Admin() {
  const [activeTab] = useState<'importer'>('importer')
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [preview, setPreview] = useState<Partial<Spell> | null>(null)
  const [duplicate, setDuplicate] = useState<Spell | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [added, setAdded] = useState(false)

  const { customSpells, fetchCustomSpells, addSpell, removeSpell, loading } = useCustomSpellsStore()

  useEffect(() => { fetchCustomSpells() }, [fetchCustomSpells])

  async function handleImport() {
    if (!url.trim()) return
    setStatus('loading')
    setPreview(null)
    setDuplicate(null)
    setAdded(false)
    setErrorMsg('')

    try {
      const response = await fetch(PROXY + encodeURIComponent(url.trim()))
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const html = await response.text()
      const parsed = parseD20SpellPage(html)
      const dup = await findDuplicateInDB(parsed.rawName ?? '', customSpells)
      setPreview(parsed)
      setDuplicate(dup)
      setStatus('done')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error desconocido')
      setStatus('error')
    }
  }

  async function handleAdd(forceNewId = false) {
    if (!preview) return
    const spell = { ...preview } as Spell
    if (forceNewId) {
      spell.id = spell.id + '_custom_' + Date.now()
    }
    const { error } = await addSpell(spell)
    if (error) {
      setErrorMsg(error)
      setStatus('error')
    } else {
      setAdded(true)
      setPreview(null)
      setDuplicate(null)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>Herramientas de Administración</h1>
        <p className={styles.subtitle}>Gestiona y amplía la biblioteca de hechizos de la aplicación.</p>
      </header>

      <nav className={styles.tabNav}>
        <button className={`${styles.tabBtn} ${activeTab === 'importer' ? styles.tabBtnActive : ''}`}>
          <Download size={16} />
          Importador de Hechizos
        </button>
      </nav>

      <div className={styles.tabContent}>
        {/* ── URL input ── */}
        <div className={styles.importerCard}>
          <h2>Importar desde d20pfsrd.com</h2>
          <p className={styles.cardDesc}>
            Pega la URL de cualquier hechizo de d20pfsrd.com para añadirlo a la biblioteca.
          </p>
          <div className={styles.urlRow}>
            <input
              className={styles.urlInput}
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.d20pfsrd.com/magic/all-spells/f/fireball"
              onKeyDown={e => e.key === 'Enter' && handleImport()}
            />
            <button
              className={styles.importBtn}
              onClick={handleImport}
              disabled={status === 'loading' || !url.trim()}
            >
              {status === 'loading' ? (
                <span className={styles.spinner} />
              ) : (
                <><Download size={16} /> Importar</>
              )}
            </button>
          </div>

          {/* Error */}
          {status === 'error' && (
            <div className={styles.errorAlert}>
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success */}
          {added && (
            <div className={styles.successBanner}>
              <CheckCircle size={16} />
              Hechizo añadido correctamente a la biblioteca.
            </div>
          )}

          {/* Duplicate warning */}
          {duplicate && preview && (
            <div className={styles.duplicateWarning}>
              <AlertTriangle size={16} />
              <strong>Posible duplicado:</strong> Ya existe un hechizo similar llamado &ldquo;{duplicate.name}&rdquo;.
              <div className={styles.dupActions}>
                <button className={styles.btnSecondary} onClick={() => { setPreview(null); setDuplicate(null) }}>
                  Cancelar
                </button>
                <button className={styles.btnPrimary} onClick={() => handleAdd(true)}>
                  Añadir igualmente
                </button>
              </div>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <SpellPreviewCard spell={preview} onAdd={() => handleAdd(false)} />
          )}
        </div>

        {/* ── Custom spells list ── */}
        {customSpells.length > 0 && (
          <div className={styles.customListCard}>
            <h2>Hechizos importados ({customSpells.length})</h2>
            {loading && <p>Cargando...</p>}
            <ul className={styles.customList}>
              {customSpells.map(sp => (
                <li key={sp.id} className={styles.customListItem}>
                  <span className={styles.customSpellName}>{sp.name}</span>
                  <span className={styles.customSpellMeta}>{sp.school} · Nivel {sp.level}</span>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeSpell(sp.id)}
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function SpellPreviewCard({ spell, onAdd }: { spell: Partial<Spell>; onAdd: () => void }) {
  return (
    <div className={styles.previewCard}>
      <div className={styles.previewHeader}>
        <h3 className={styles.previewName}>{spell.name}</h3>
        <span className={styles.previewSchool}>
          {spell.school}
          {spell.subschool && ` (${spell.subschool})`}
          {spell.descriptor && ` [${spell.descriptor}]`}
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

      <button className={styles.addBtn} onClick={onAdd}>
        <CheckCircle size={16} />
        Añadir a la biblioteca
      </button>
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
