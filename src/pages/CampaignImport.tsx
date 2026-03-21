import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, FileText, Loader2, AlertCircle, CheckCircle2,
  Users, Map, Scroll, Sword, Package, ChevronDown, ChevronUp,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCampaignStore, generateId } from '../store'
import type {
  CampaignNPC, CampaignLocation, CampaignQuest,
  CampaignEncounter, CampaignLoot, EncounterEnemy,
} from '../store'
import { Button, Card } from '../components/ui'
import styles from './CampaignImport.module.css'

// ── Extracted types (from Gemini) ────────────────────────────────────────────

interface ExtractedEnemy { name: string; hpMax?: number; ac?: number }
interface ExtractedEncounter {
  name: string; difficulty?: string; enemies?: ExtractedEnemy[]
  xpReward?: number; treasure?: string; notes?: string
}
interface ExtractedCampaign {
  name?: string; description?: string; setting?: string
  npcs?: Array<{
    name: string; role?: string; notes?: string; location?: string
    race?: string; appearance?: string; motivation?: string
    cr?: number; hp?: number; ac?: number
  }>
  locations?: Array<{ name: string; type?: string; description?: string; notes?: string }>
  quests?: Array<{ title: string; description?: string; type?: string; xpReward?: number; goldReward?: number; notes?: string }>
  encounters?: ExtractedEncounter[]
  loot?: Array<{ name: string; type?: string; value?: number; notes?: string }>
}

type Step = 'upload' | 'uploading' | 'loading' | 'review'

const VALID_DIFFICULTIES = ['trivial', 'low', 'moderate', 'severe', 'extreme']
const VALID_LOCATION_TYPES = ['city', 'town', 'dungeon', 'wilderness', 'building', 'ruin', 'other']
const VALID_QUEST_TYPES = ['main', 'side', 'personal']
const VALID_NPC_ROLES = ['ally', 'enemy', 'neutral', 'unknown']
const VALID_LOOT_TYPES = ['weapon', 'armor', 'magic', 'coin', 'misc']

// ── Map extracted → store types ───────────────────────────────────────────────

function mapNPCs(raw: ExtractedCampaign['npcs'] = []): CampaignNPC[] {
  return raw.map((n) => ({
    id: generateId(),
    name: n.name || 'PNJ sin nombre',
    role: (VALID_NPC_ROLES.includes(n.role ?? '') ? n.role : 'unknown') as CampaignNPC['role'],
    notes: n.notes ?? '',
    location: n.location || undefined,
    race: n.race || undefined,
    appearance: n.appearance || undefined,
    motivation: n.motivation || undefined,
    cr: n.cr !== undefined ? n.cr : undefined,
    hp: n.hp !== undefined ? n.hp : undefined,
    ac: n.ac !== undefined ? n.ac : undefined,
  }))
}

function mapLocations(raw: ExtractedCampaign['locations'] = []): CampaignLocation[] {
  return raw.map((l) => ({
    id: generateId(),
    name: l.name || 'Ubicación',
    type: (VALID_LOCATION_TYPES.includes(l.type ?? '') ? l.type : 'other') as CampaignLocation['type'],
    description: l.description ?? '',
    status: 'unknown' as const,
    notes: l.notes ?? '',
  }))
}

function mapQuests(raw: ExtractedCampaign['quests'] = []): CampaignQuest[] {
  return raw.map((q) => ({
    id: generateId(),
    title: q.title || 'Misión',
    description: q.description ?? '',
    type: (VALID_QUEST_TYPES.includes(q.type ?? '') ? q.type : 'side') as CampaignQuest['type'],
    status: 'active' as const,
    xpReward: q.xpReward,
    goldReward: q.goldReward,
    notes: q.notes ?? '',
  }))
}

function mapEncounters(raw: ExtractedCampaign['encounters'] = []): CampaignEncounter[] {
  return raw.map((e) => {
    const enemies: EncounterEnemy[] = (e.enemies ?? []).map((en) => ({
      id: generateId(),
      name: en.name || 'Enemigo',
      hpMax: en.hpMax ?? 10,
      hpCurrent: en.hpMax ?? 10,
      ac: en.ac ?? 10,
      initiative: null,
    }))
    return {
      id: generateId(),
      name: e.name || 'Encuentro',
      difficulty: (VALID_DIFFICULTIES.includes(e.difficulty ?? '') ? e.difficulty : 'moderate') as CampaignEncounter['difficulty'],
      status: 'pending' as const,
      enemies,
      xpReward: e.xpReward ?? 0,
      treasure: e.treasure ?? '',
      notes: e.notes ?? '',
    }
  })
}

function mapLoot(raw: ExtractedCampaign['loot'] = []): CampaignLoot[] {
  return raw.map((l) => ({
    id: generateId(),
    name: l.name || 'Item',
    type: (VALID_LOOT_TYPES.includes(l.type ?? '') ? l.type : 'misc') as CampaignLoot['type'],
    value: l.value,
    notes: l.notes ?? '',
  }))
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CampaignImport() {
  const navigate = useNavigate()
  const addCampaign = useCampaignStore((s) => s.addCampaign)
  const updateCampaign = useCampaignStore((s) => s.updateCampaign)

  const [step, setStep] = useState<Step>('upload')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<ExtractedCampaign | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editSetting, setEditSetting] = useState('')
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggle = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }))

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') { setError('Solo se aceptan archivos PDF.'); return }
    if (f.size > 50 * 1024 * 1024) { setError('El PDF no puede superar los 50 MB.'); return }
    setPdfFile(f)
    setError(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleAnalyze = async () => {
    if (!pdfFile) return
    setError(null)

    const storagePath = `temp/${Date.now()}_${pdfFile.name.replace(/[^a-z0-9._-]/gi, '_')}`

    try {
      // Step 1 — upload to Supabase Storage
      setStep('uploading')
      const { error: uploadError } = await supabase.storage
        .from('campaign-pdfs')
        .upload(storagePath, pdfFile, { contentType: 'application/pdf', upsert: false })
      if (uploadError) throw new Error(`Upload error: ${uploadError.message}`)

      // Step 2 — call Edge Function with only the storage path
      setStep('loading')
      const { data, error: fnError } = await supabase.functions.invoke('extract-campaign', {
        body: { storagePath },
      })

      // Step 3 — clean up temp file (best-effort)
      supabase.storage.from('campaign-pdfs').remove([storagePath]).catch(() => {})

      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(data.error)

      const camp = data.campaign as ExtractedCampaign
      setExtracted(camp)
      setEditName(camp.name ?? '')
      setEditDesc(camp.description ?? '')
      setEditSetting(camp.setting ?? '')
      setStep('review')
    } catch (err) {
      // Clean up temp file on error too (best-effort)
      supabase.storage.from('campaign-pdfs').remove([storagePath]).catch(() => {})
      setError(err instanceof Error ? err.message : String(err))
      setStep('upload')
    }
  }

  const handleCreate = async () => {
    if (!extracted) return
    setSaving(true)
    try {
      const id = await addCampaign({
        name: editName.trim() || 'Campaña importada',
        description: editDesc.trim(),
        setting: editSetting.trim(),
        gmName: '',
        status: 'active',
      })
      if (!id) throw new Error('No se pudo crear la campaña')

      await updateCampaign(id, {
        npcs: mapNPCs(extracted.npcs),
        locations: mapLocations(extracted.locations),
        quests: mapQuests(extracted.quests),
        encounters: mapEncounters(extracted.encounters),
        loot: mapLoot(extracted.loot),
      })

      navigate(`/campaigns/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSaving(false)
    }
  }

  // ── Upload step ──────────────────────────────────────────────────────────────

  if (step === 'upload') return (
    <div className={styles.page}>
      <Link to="/campaigns" className={styles.backLink}><ArrowLeft size={18} />Volver a Crónicas</Link>
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <div className={styles.titleIcon}><FileText size={28} /></div>
          <div>
            <h1 className={styles.title}>Importar Campaña desde PDF</h1>
            <p className={styles.subtitle}>Sube el PDF de un módulo Pathfinder y extraeremos automáticamente nombre, descripción, PNJs, ubicaciones, misiones, encuentros y botín.</p>
          </div>
        </div>

        <Card padding="lg">
          <div
            className={`${styles.dropZone} ${pdfFile ? styles.dropZoneReady : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className={styles.hiddenInput}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            {pdfFile ? (
              <div className={styles.fileReady}>
                <CheckCircle2 size={36} className={styles.fileReadyIcon} />
                <span className={styles.fileName}>{pdfFile.name}</span>
                <span className={styles.fileSize}>({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                <span className={styles.changeHint}>Clic para cambiar</span>
              </div>
            ) : (
              <div className={styles.dropPrompt}>
                <FileText size={40} className={styles.dropIcon} />
                <span className={styles.dropMain}>Arrastra el PDF aquí</span>
                <span className={styles.dropSub}>o haz clic para seleccionar — máx. 50 MB</span>
              </div>
            )}
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className={styles.formActions}>
            <Button variant="ghost" onClick={() => navigate('/campaigns')}>Cancelar</Button>
            <Button variant="primary" onClick={handleAnalyze} disabled={!pdfFile}>
              <FileText size={16} />
              Analizar PDF
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )

  // ── Uploading step ───────────────────────────────────────────────────────────

  if (step === 'uploading') return (
    <div className={styles.page}>
      <div className={styles.loadingState}>
        <Loader2 size={48} className={styles.spinner} />
        <h2 className={styles.loadingTitle}>Subiendo PDF…</h2>
        <p className={styles.loadingDesc}>Transfiriendo el archivo al servidor. Puede tardar unos segundos según el tamaño.</p>
      </div>
    </div>
  )

  // ── Loading step ─────────────────────────────────────────────────────────────

  if (step === 'loading') return (
    <div className={styles.page}>
      <div className={styles.loadingState}>
        <Loader2 size={48} className={styles.spinner} />
        <h2 className={styles.loadingTitle}>Analizando campaña…</h2>
        <p className={styles.loadingDesc}>Gemini está leyendo el módulo y extrayendo datos. Puede tardar entre 15 y 60 segundos según el tamaño del PDF.</p>
      </div>
    </div>
  )

  // ── Review step ──────────────────────────────────────────────────────────────

  const npcs = extracted?.npcs ?? []
  const locations = extracted?.locations ?? []
  const quests = extracted?.quests ?? []
  const encounters = extracted?.encounters ?? []
  const loot = extracted?.loot ?? []

  const sections = [
    { key: 'npcs', label: 'PNJs', icon: Users, items: npcs, render: (n: typeof npcs[0]) => `${n.name}${n.role ? ` (${n.role})` : ''}` },
    { key: 'locations', label: 'Ubicaciones', icon: Map, items: locations, render: (l: typeof locations[0]) => `${l.name}${l.type ? ` · ${l.type}` : ''}` },
    { key: 'quests', label: 'Misiones', icon: Scroll, items: quests, render: (q: typeof quests[0]) => `${q.title}${q.type ? ` (${q.type})` : ''}` },
    { key: 'encounters', label: 'Encuentros', icon: Sword, items: encounters, render: (e: typeof encounters[0]) => `${e.name} · ${(e.enemies ?? []).length} enemigos` },
    { key: 'loot', label: 'Botín', icon: Package, items: loot, render: (l: typeof loot[0]) => `${l.name}${l.value ? ` (${l.value} gp)` : ''}` },
  ] as const

  return (
    <div className={styles.page}>
      <Link to="/campaigns" className={styles.backLink}><ArrowLeft size={18} />Volver a Crónicas</Link>
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <div className={styles.titleIcon}><CheckCircle2 size={28} /></div>
          <div>
            <h1 className={styles.title}>Revisar datos extraídos</h1>
            <p className={styles.subtitle}>Comprueba la información antes de crear la campaña. Podrás editarla en detalle después.</p>
          </div>
        </div>

        {/* Basic info */}
        <Card padding="md">
          <h3 className={styles.sectionTitle}>Información básica</h3>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Nombre de la campaña</label>
              <input className={styles.formInput} value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nombre de la campaña" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Ambientación</label>
              <input className={styles.formInput} value={editSetting} onChange={(e) => setEditSetting(e.target.value)} placeholder="Mundo o ambientación" />
            </div>
            <div className={`${styles.formField} ${styles.fullWidth}`}>
              <label className={styles.formLabel}>Descripción</label>
              <textarea className={styles.formTextarea} rows={4} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Sinopsis de la campaña..." />
            </div>
          </div>
        </Card>

        {/* Extracted sections */}
        {sections.map(({ key, label, icon: Icon, items, render }) => (
          <Card key={key} padding="md">
            <button className={styles.sectionHeader} onClick={() => toggle(key)}>
              <Icon size={18} className={styles.sectionIcon} />
              <span className={styles.sectionTitle}>{label}</span>
              <span className={styles.sectionCount}>{items.length}</span>
              <span className={styles.sectionChevron}>{expanded[key] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
            </button>
            {expanded[key] && (
              <ul className={styles.previewList}>
                {items.length === 0
                  ? <li className={styles.previewEmpty}>No se encontraron datos.</li>
                  : items.map((item, i) => (
                    <li key={i} className={styles.previewItem}>
                      {(render as (item: unknown) => string)(item)}
                    </li>
                  ))
                }
              </ul>
            )}
          </Card>
        ))}

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} />{error}
          </div>
        )}

        <div className={styles.formActions}>
          <Button variant="ghost" onClick={() => { setStep('upload'); setExtracted(null) }}>Volver a subir</Button>
          <Button variant="primary" onClick={handleCreate} disabled={saving || !editName.trim()}>
            {saving ? <Loader2 size={16} className={styles.spinner} /> : <CheckCircle2 size={16} />}
            {saving ? 'Creando…' : 'Crear campaña'}
          </Button>
        </div>
      </div>
    </div>
  )
}
