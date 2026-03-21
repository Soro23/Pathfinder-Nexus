import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Users, BookOpen, Scroll, Sword, Plus, Trash2,
  X, Edit2, Check, Monitor, PlusCircle, Map, Package,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import { useCampaignStore, useCharacterStore } from '../store'
import { RACES, CLASSES } from '../data'
import type {
  Campaign, CampaignNote, CampaignNPC,
  CampaignLocation, CampaignQuest, CampaignEncounter, CampaignLoot,
  EncounterEnemy, CampaignCharacter,
} from '../store'
import { generateId } from '../store'
import { Button, Card, Input, SearchSelect } from '../components/ui'
import { PartyCard, CharacterAssigner, EncounterTracker, CampaignCharacterCard } from '../components/campaign'
import styles from './CampaignView.module.css'

type Tab = 'overview' | 'sessions' | 'party' | 'npcs' | 'locations' | 'quests' | 'encounters' | 'loot' | 'notes'

const NOTE_CATEGORY_LABELS: Record<CampaignNote['category'], string> = {
  story: 'Historia', npc: 'PNJ', location: 'Lugar', loot: 'Botín', misc: 'Misc',
}
const NPC_ROLE_LABELS: Record<CampaignNPC['role'], string> = {
  ally: 'Aliado', enemy: 'Enemigo', neutral: 'Neutral', unknown: 'Desconocido',
}
const LOCATION_TYPE_LABELS: Record<CampaignLocation['type'], string> = {
  city: 'Ciudad', town: 'Pueblo', dungeon: 'Mazmorra', wilderness: 'Exterior',
  building: 'Edificio', ruin: 'Ruina', other: 'Otro',
}
const LOCATION_STATUS_LABELS: Record<CampaignLocation['status'], string> = {
  unknown: 'Desconocido', known: 'Conocido', explored: 'Explorado', cleared: 'Limpio',
}
const LOCATION_STATUS_SEQUENCE: CampaignLocation['status'][] = ['unknown', 'known', 'explored', 'cleared']

const QUEST_TYPE_LABELS: Record<CampaignQuest['type'], string> = {
  main: 'Principal', side: 'Secundaria', personal: 'Personal',
}
const QUEST_STATUS_LABELS: Record<CampaignQuest['status'], string> = {
  active: 'Activa', completed: 'Completada', failed: 'Fallida', unknown: 'Desconocida',
}
const DIFFICULTY_LABELS: Record<CampaignEncounter['difficulty'], string> = {
  trivial: 'Trivial', low: 'Baja', moderate: 'Moderada', severe: 'Severa', extreme: 'Extrema',
}
const LOOT_TYPE_LABELS: Record<CampaignLoot['type'], string> = {
  weapon: 'Arma', armor: 'Armadura', magic: 'Mágico', coin: 'Monedas', misc: 'Misc',
}

export function CampaignView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const campaign = useCampaignStore((s) => s.getCampaign(id || ''))
  const updateCampaign = useCampaignStore((s) => s.updateCampaign)
  const deleteCampaign = useCampaignStore((s) => s.deleteCampaign)
  const addNote = useCampaignStore((s) => s.addNote)
  const updateNote = useCampaignStore((s) => s.updateNote)
  const deleteNote = useCampaignStore((s) => s.deleteNote)
  const addNPC = useCampaignStore((s) => s.addNPC)
  const updateNPC = useCampaignStore((s) => s.updateNPC)
  const deleteNPC = useCampaignStore((s) => s.deleteNPC)
  const addSession = useCampaignStore((s) => s.addSession)
  const updateSession = useCampaignStore((s) => s.updateSession)
  const deleteSession = useCampaignStore((s) => s.deleteSession)
  const addLocation = useCampaignStore((s) => s.addLocation)
  const updateLocation = useCampaignStore((s) => s.updateLocation)
  const deleteLocation = useCampaignStore((s) => s.deleteLocation)
  const addQuest = useCampaignStore((s) => s.addQuest)
  const updateQuest = useCampaignStore((s) => s.updateQuest)
  const deleteQuest = useCampaignStore((s) => s.deleteQuest)
  const addEncounter = useCampaignStore((s) => s.addEncounter)
  const updateEncounter = useCampaignStore((s) => s.updateEncounter)
  const deleteEncounter = useCampaignStore((s) => s.deleteEncounter)
  const updateEnemy = useCampaignStore((s) => s.updateEnemy)
  const addLoot = useCampaignStore((s) => s.addLoot)
  const updateLoot = useCampaignStore((s) => s.updateLoot)
  const deleteLoot = useCampaignStore((s) => s.deleteLoot)
  const addCampaignCharacter = useCampaignStore((s) => s.addCampaignCharacter)
  const updateCampaignCharacter = useCampaignStore((s) => s.updateCampaignCharacter)
  const deleteCampaignCharacter = useCampaignStore((s) => s.deleteCampaignCharacter)
  const characters = useCharacterStore((s) => s.characters)

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [showAssigner, setShowAssigner] = useState(false)

  // Note form
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteCategory, setNoteCategory] = useState<CampaignNote['category']>('story')
  const [expandedNote, setExpandedNote] = useState<string | null>(null)
  const [filterNoteCategory, setFilterNoteCategory] = useState<string>('all')

  // NPC form & expand
  const [showNPCForm, setShowNPCForm] = useState(false)
  const [npcName, setNpcName] = useState('')
  const [npcRole, setNpcRole] = useState<CampaignNPC['role']>('neutral')
  const [npcNotes, setNpcNotes] = useState('')
  const [npcLocation, setNpcLocation] = useState('')
  const [npcRace, setNpcRace] = useState('')
  const [npcAppearance, setNpcAppearance] = useState('')
  const [npcPersonality, setNpcPersonality] = useState('')
  const [npcMotivation, setNpcMotivation] = useState('')
  const [npcCr, setNpcCr] = useState('')
  const [npcHp, setNpcHp] = useState('')
  const [npcAc, setNpcAc] = useState('')
  const [expandedNPC, setExpandedNPC] = useState<string | null>(null)

  // Session form
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10))
  const [sessionSummary, setSessionSummary] = useState('')
  const [sessionXp, setSessionXp] = useState('0')
  const [sessionHighlights, setSessionHighlights] = useState<string[]>([])
  const [sessionHighlightInput, setSessionHighlightInput] = useState('')
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  // Location form
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [locName, setLocName] = useState('')
  const [locType, setLocType] = useState<CampaignLocation['type']>('other')
  const [locDesc, setLocDesc] = useState('')
  const [locNotes, setLocNotes] = useState('')

  // Quest form
  const [showQuestForm, setShowQuestForm] = useState(false)
  const [questTitle, setQuestTitle] = useState('')
  const [questDesc, setQuestDesc] = useState('')
  const [questType, setQuestType] = useState<CampaignQuest['type']>('side')
  const [questXp, setQuestXp] = useState('')
  const [questGold, setQuestGold] = useState('')
  const [filterQuestType, setFilterQuestType] = useState<string>('all')

  // Encounter form
  const [showEncounterForm, setShowEncounterForm] = useState(false)
  const [encName, setEncName] = useState('')
  const [encDifficulty, setEncDifficulty] = useState<CampaignEncounter['difficulty']>('moderate')
  const [encXp, setEncXp] = useState('0')
  const [encTreasure, setEncTreasure] = useState('')
  const [encNotes, setEncNotes] = useState('')
  const [encEnemies, setEncEnemies] = useState<Omit<EncounterEnemy, 'id'>[]>([])
  const [encEnemyName, setEncEnemyName] = useState('')
  const [encEnemyHp, setEncEnemyHp] = useState('')
  const [encEnemyAc, setEncEnemyAc] = useState('')
  const [expandedEncounter, setExpandedEncounter] = useState<string | null>(null)

  // Loot form
  const [showLootForm, setShowLootForm] = useState(false)
  const [lootName, setLootName] = useState('')
  const [lootType, setLootType] = useState<CampaignLoot['type']>('misc')
  const [lootValue, setLootValue] = useState('')
  const [lootNotes, setLootNotes] = useState('')

  // Campaign character form
  const [showCCForm, setShowCCForm] = useState(false)
  const [ccName, setCcName] = useState('')
  const [ccRace, setCcRace] = useState('')
  const [ccClass, setCcClass] = useState('')
  const [ccLevel, setCcLevel] = useState('1')
  const [ccBab, setCcBab] = useState('0')
  const [ccAc, setCcAc] = useState('10')
  const [ccHp, setCcHp] = useState('10')
  const [ccStealth, setCcStealth] = useState('0')
  const [ccPerception, setCcPerception] = useState('0')
  const [ccNotes, setCcNotes] = useState('')

  if (!campaign) {
    return (
      <div className={styles.notFound}>
        <h2>Campaña no encontrada</h2>
        <Link to="/campaigns">
          <Button variant="secondary"><ArrowLeft size={18} />Volver a Crónicas</Button>
        </Link>
      </div>
    )
  }

  const partyMembers = characters.filter((c) => campaign.characterIds.includes(c.id))
  const sessions = [...(campaign.sessions ?? [])].sort((a, b) => b.number - a.number)
  const activeQuests = (campaign.quests ?? []).filter((q) => q.status === 'active')

  const STATUS_LABELS: Record<Campaign['status'], string> = {
    active: 'Activa', paused: 'En pausa', completed: 'Completada',
  }

  const startEdit = () => { setEditName(campaign.name); setEditDesc(campaign.description); setIsEditing(true) }
  const saveEdit = () => { updateCampaign(campaign.id, { name: editName.trim() || campaign.name, description: editDesc.trim() }); setIsEditing(false) }
  const handleDelete = () => {
    if (confirm(`¿Eliminar la campaña "${campaign.name}"?`)) { deleteCampaign(campaign.id); navigate('/campaigns') }
  }

  const submitNote = () => {
    if (!noteTitle.trim()) return
    addNote(campaign.id, { title: noteTitle.trim(), content: noteContent.trim(), category: noteCategory })
    setNoteTitle(''); setNoteContent(''); setNoteCategory('story'); setShowNoteForm(false)
  }

  const submitNPC = () => {
    if (!npcName.trim()) return
    addNPC(campaign.id, {
      name: npcName.trim(), role: npcRole, notes: npcNotes.trim(),
      location: npcLocation.trim() || undefined, race: npcRace.trim() || undefined,
      appearance: npcAppearance.trim() || undefined, personality: npcPersonality.trim() || undefined,
      motivation: npcMotivation.trim() || undefined,
      cr: npcCr ? Number(npcCr) : undefined, hp: npcHp ? Number(npcHp) : undefined, ac: npcAc ? Number(npcAc) : undefined,
    })
    setNpcName(''); setNpcRole('neutral'); setNpcNotes(''); setNpcLocation('')
    setNpcRace(''); setNpcAppearance(''); setNpcPersonality(''); setNpcMotivation('')
    setNpcCr(''); setNpcHp(''); setNpcAc(''); setShowNPCForm(false)
  }

  const addHighlight = () => {
    if (!sessionHighlightInput.trim()) return
    setSessionHighlights((h) => [...h, sessionHighlightInput.trim()])
    setSessionHighlightInput('')
  }

  const submitSession = () => {
    if (!sessionTitle.trim()) return
    addSession(campaign.id, {
      number: (campaign.sessions ?? []).length + 1,
      date: sessionDate,
      title: sessionTitle.trim(),
      summary: sessionSummary.trim(),
      xpAwarded: Number(sessionXp) || 0,
      highlights: sessionHighlights,
    })
    setSessionTitle(''); setSessionDate(new Date().toISOString().slice(0, 10))
    setSessionSummary(''); setSessionXp('0'); setSessionHighlights([]); setShowSessionForm(false)
  }

  const submitLocation = () => {
    if (!locName.trim()) return
    addLocation(campaign.id, { name: locName.trim(), type: locType, description: locDesc.trim(), status: 'unknown', notes: locNotes.trim() })
    setLocName(''); setLocType('other'); setLocDesc(''); setLocNotes(''); setShowLocationForm(false)
  }

  const cycleLocationStatus = (locId: string, current: CampaignLocation['status']) => {
    const idx = LOCATION_STATUS_SEQUENCE.indexOf(current)
    const next = LOCATION_STATUS_SEQUENCE[(idx + 1) % LOCATION_STATUS_SEQUENCE.length]
    updateLocation(campaign.id, locId, { status: next })
  }

  const submitQuest = () => {
    if (!questTitle.trim()) return
    addQuest(campaign.id, {
      title: questTitle.trim(), description: questDesc.trim(), type: questType,
      status: 'active', notes: '',
      xpReward: questXp ? Number(questXp) : undefined,
      goldReward: questGold ? Number(questGold) : undefined,
    })
    setQuestTitle(''); setQuestDesc(''); setQuestType('side'); setQuestXp(''); setQuestGold(''); setShowQuestForm(false)
  }

  const addEncEnemyToForm = () => {
    if (!encEnemyName.trim() || !encEnemyHp) return
    setEncEnemies((prev) => [...prev, { name: encEnemyName.trim(), hpMax: Number(encEnemyHp), hpCurrent: Number(encEnemyHp), ac: Number(encEnemyAc) || 10, initiative: null }])
    setEncEnemyName(''); setEncEnemyHp(''); setEncEnemyAc('')
  }

  const submitEncounter = () => {
    if (!encName.trim()) return
    addEncounter(campaign.id, {
      name: encName.trim(), difficulty: encDifficulty, status: 'pending',
      enemies: encEnemies.map((e) => ({ ...e, id: generateId() })),
      xpReward: Number(encXp) || 0, treasure: encTreasure.trim(), notes: encNotes.trim(),
    })
    setEncName(''); setEncDifficulty('moderate'); setEncXp('0'); setEncTreasure(''); setEncNotes(''); setEncEnemies([]); setShowEncounterForm(false)
  }

  const submitLoot = () => {
    if (!lootName.trim()) return
    addLoot(campaign.id, { name: lootName.trim(), type: lootType, value: lootValue ? Number(lootValue) : undefined, notes: lootNotes.trim() })
    setLootName(''); setLootType('misc'); setLootValue(''); setLootNotes(''); setShowLootForm(false)
  }

  const submitCampaignCharacter = () => {
    if (!ccName.trim()) return
    const hp = Number(ccHp) || 1
    addCampaignCharacter(campaign.id, {
      name: ccName.trim(), race: ccRace.trim(), className: ccClass.trim(),
      level: Number(ccLevel) || 1, bab: Number(ccBab) || 0,
      ac: Number(ccAc) || 10, hpMax: hp, hpCurrent: hp,
      stealth: Number(ccStealth) || 0, perception: Number(ccPerception) || 0,
      notes: ccNotes.trim(), inParty: true,
    })
    setCcName(''); setCcRace(''); setCcClass(''); setCcLevel('1'); setCcBab('0')
    setCcAc('10'); setCcHp('10'); setCcStealth('0'); setCcPerception('0'); setCcNotes('')
    setShowCCForm(false)
  }

  const filteredNotes = filterNoteCategory === 'all' ? campaign.notes : campaign.notes.filter((n) => n.category === filterNoteCategory)
  const filteredQuests = filterQuestType === 'all' ? (campaign.quests ?? []) : (campaign.quests ?? []).filter((q) => q.type === filterQuestType)
  const unassignedLootValue = (campaign.loot ?? []).filter((l) => !l.assignedTo).reduce((sum, l) => sum + (l.value ?? 0), 0)

  const tabs: { id: Tab; label: string; icon: typeof Sword; count?: number }[] = [
    { id: 'overview', label: 'Resumen', icon: BookOpen },
    { id: 'sessions', label: 'Sesiones', icon: BookOpen, count: (campaign.sessions ?? []).length },
    { id: 'party', label: 'Party', icon: Users, count: partyMembers.length + (campaign.campaignCharacters ?? []).filter((c) => c.inParty !== false).length },
    { id: 'npcs', label: 'PNJs', icon: Users, count: campaign.npcs.length },
    { id: 'locations', label: 'Ubicaciones', icon: Map, count: (campaign.locations ?? []).length },
    { id: 'quests', label: 'Misiones', icon: Scroll, count: activeQuests.length },
    { id: 'encounters', label: 'Encuentros', icon: Sword, count: (campaign.encounters ?? []).length },
    { id: 'loot', label: 'Botín', icon: Package, count: (campaign.loot ?? []).length },
    { id: 'notes', label: 'Notas', icon: Scroll, count: campaign.notes.length },
  ]

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <Link to="/campaigns" className={styles.backLink}><ArrowLeft size={20} />Crónicas</Link>
        <div className={styles.titleRow}>
          <div>
            {isEditing ? (
              <input className={styles.editNameInput} value={editName}
                onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEdit()} autoFocus />
            ) : (
              <h1 className={styles.title}>{campaign.name}</h1>
            )}
            <p className={styles.subtitle}>
              {campaign.setting && `${campaign.setting} · `}
              <span className={`${styles.statusChip} ${styles[`status_${campaign.status}`]}`}>{STATUS_LABELS[campaign.status]}</span>
              {campaign.gmName && ` · GM: ${campaign.gmName}`}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link to={`/campaigns/${campaign.id}/party`} className={styles.partyViewLink}><Monitor size={16} />Vista GM</Link>
            {isEditing ? (
              <>
                <Button variant="primary" size="sm" onClick={saveEdit}><Check size={14} />Guardar</Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}><X size={14} /></Button>
              </>
            ) : (
              <Button variant="secondary" size="sm" onClick={startEdit}><Edit2 size={14} />Editar</Button>
            )}
            <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 size={14} /></Button>
          </div>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {tabs.map(({ id: tabId, label, icon: Icon, count }) => (
          <button key={tabId} className={`${styles.tab} ${activeTab === tabId ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tabId)}>
            <Icon size={15} />{label}
            {count !== undefined && count > 0 && <span className={styles.tabBadge}>{count}</span>}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className={styles.tabContent}>

        {/* ══ RESUMEN ══ */}
        {activeTab === 'overview' && (
          <div className={styles.overviewTab}>
            <div className={styles.statsRow5}>
              {[
                { label: 'Personajes', val: campaign.characterIds.length, icon: Users },
                { label: 'Sesiones', val: (campaign.sessions ?? []).length, icon: BookOpen },
                { label: 'Misiones activas', val: activeQuests.length, icon: Scroll },
                { label: 'PNJs', val: campaign.npcs.length, icon: Users },
                { label: 'Ubicaciones', val: (campaign.locations ?? []).length, icon: Map },
              ].map(({ label, val, icon: Icon }) => (
                <Card key={label} padding="md" className={styles.statCard}>
                  <Icon size={20} className={styles.statIcon} />
                  <span className={styles.statVal}>{val}</span>
                  <span className={styles.statLabel}>{label}</span>
                </Card>
              ))}
            </div>

            <div className={styles.overviewSections}>
              <Card padding="md">
                <div className={styles.sectionHeaderRow}>
                  <h3 className={styles.sectionTitle}>Últimas sesiones</h3>
                </div>
                {sessions.length === 0 ? (
                  <p className={styles.emptyMsg}>Sin sesiones registradas.</p>
                ) : (
                  <div className={styles.overviewSection}>
                    {sessions.slice(0, 2).map((s) => (
                      <div key={s.id} className={styles.overviewSessionItem}>
                        <span className={styles.overviewSessionTitle}>#{s.number} {s.title}</span>
                        <span className={styles.overviewSessionMeta}>{s.date} · {s.xpAwarded} XP</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card padding="md">
                <div className={styles.sectionHeaderRow}>
                  <h3 className={styles.sectionTitle}>Misiones activas</h3>
                </div>
                {activeQuests.length === 0 ? (
                  <p className={styles.emptyMsg}>Sin misiones activas.</p>
                ) : (
                  <div className={styles.overviewSection}>
                    {activeQuests.slice(0, 3).map((q) => (
                      <div key={q.id} className={styles.overviewQuestItem}>
                        <span className={`${styles.questTypeChip} ${styles[`questType_${q.type}`]}`}>{QUEST_TYPE_LABELS[q.type]}</span>
                        <span className={styles.questTitle}>{q.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <Card padding="md">
              <div className={styles.sectionHeaderRow}><h3 className={styles.sectionTitle}>Descripción</h3></div>
              {isEditing ? (
                <textarea className={styles.editTextarea} value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)} rows={5} placeholder="Describe la premisa de la campaña..." />
              ) : (
                <p className={styles.descText}>{campaign.description || <em className={styles.empty}>Sin descripción.</em>}</p>
              )}
            </Card>

            <Card padding="md">
              <div className={styles.sectionHeaderRow}>
                <h3 className={styles.sectionTitle}>Estado</h3>
              </div>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Estado:</span>
                <select className={styles.statusSelect} value={campaign.status}
                  onChange={(e) => updateCampaign(campaign.id, { status: e.target.value as Campaign['status'] })}>
                  <option value="active">Activa</option>
                  <option value="paused">En pausa</option>
                  <option value="completed">Completada</option>
                </select>
              </div>
            </Card>
          </div>
        )}

        {/* ══ SESIONES ══ */}
        {activeTab === 'sessions' && (
          <div className={styles.sessionsTab}>
            <div className={styles.sectionHeaderRow}>
              <h3 className={styles.sectionTitle}>Sesiones ({sessions.length})</h3>
              <Button variant="secondary" size="sm" onClick={() => setShowSessionForm(true)}>
                <Plus size={14} />Nueva Sesión
              </Button>
            </div>

            {showSessionForm && (
              <Card padding="md" className={styles.noteForm}>
                <div className={styles.noteFormGrid}>
                  <Input label="Título" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} placeholder="El Despertar del Oráculo" />
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Fecha</label>
                    <input type="date" className={styles.formSelect} value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>XP Otorgada</label>
                    <input type="number" className={styles.formSelect} value={sessionXp} onChange={(e) => setSessionXp(e.target.value)} min="0" />
                  </div>
                  <div className={styles.fullWidth}>
                    <label className={styles.formLabel}>Resumen</label>
                    <textarea className={styles.formTextarea} rows={4} value={sessionSummary}
                      onChange={(e) => setSessionSummary(e.target.value)} placeholder="Describe los eventos clave de la sesión..." />
                  </div>
                  <div className={`${styles.fullWidth} ${styles.formField}`}>
                    <label className={styles.formLabel}>Highlights</label>
                    <div className={styles.highlightInputRow}>
                      <input className={styles.formSelect} style={{ flex: 1 }} value={sessionHighlightInput}
                        onChange={(e) => setSessionHighlightInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                        placeholder="Punto clave..." />
                      <Button variant="secondary" size="sm" onClick={addHighlight}><Plus size={13} /></Button>
                    </div>
                    {sessionHighlights.length > 0 && (
                      <div className={styles.tagRow}>
                        {sessionHighlights.map((h, i) => (
                          <span key={i} className={styles.tag}>
                            {h}
                            <button className={styles.tagRemoveBtn} onClick={() => setSessionHighlights((prev) => prev.filter((_, j) => j !== i))}>×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.formActions}>
                  <Button variant="ghost" onClick={() => setShowSessionForm(false)}>Cancelar</Button>
                  <Button variant="primary" onClick={submitSession} disabled={!sessionTitle.trim()}>Guardar Sesión</Button>
                </div>
              </Card>
            )}

            {sessions.length === 0 ? (
              <p className={styles.emptyMsg}>Sin sesiones registradas.</p>
            ) : (
              <div className={styles.notesList}>
                {sessions.map((ses) => {
                  const isOpen = expandedSession === ses.id
                  return (
                    <Card key={ses.id} padding="md" hoverable className={styles.noteCard}>
                      <div className={styles.sessionCardHeader} onClick={() => setExpandedSession(isOpen ? null : ses.id)}>
                        <span className={styles.sessionNumber}>#{ses.number}</span>
                        <span className={styles.sessionTitle}>{ses.title}</span>
                        <span className={styles.sessionDate}>{ses.date}</span>
                        {ses.xpAwarded > 0 && <span className={styles.sessionXp}>{ses.xpAwarded} XP</span>}
                        <button className={styles.noteDeleteBtn} onClick={(e) => { e.stopPropagation(); deleteSession(campaign.id, ses.id) }}><Trash2 size={12} /></button>
                        <span className={styles.expandIcon}>{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                      </div>
                      {isOpen && (
                        <div className={styles.sessionBody}>
                          <textarea className={styles.noteTextarea} rows={5} value={ses.summary}
                            onChange={(e) => updateSession(campaign.id, ses.id, { summary: e.target.value })}
                            placeholder="Resumen de la sesión..." />
                          {ses.highlights.length > 0 && (
                            <div className={styles.sessionHighlights}>
                              <span className={styles.sessionHighlightsTitle}>Highlights</span>
                              {ses.highlights.map((h, i) => (
                                <span key={i} className={styles.highlightItem}>{h}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ PARTY ══ */}
        {activeTab === 'party' && (
          <div className={styles.partyTab}>
            {/* Personajes del roster global */}
            <div className={styles.sectionHeaderRow}>
              <h3 className={styles.sectionTitle}>Personajes ({partyMembers.length})</h3>
              <Button variant="secondary" size="sm" onClick={() => setShowAssigner(true)}>
                <PlusCircle size={14} />Gestionar roster
              </Button>
            </div>
            {partyMembers.length === 0 ? (
              <p className={styles.emptyMsg}>Sin personajes del roster asignados.</p>
            ) : (
              <div className={styles.partyGrid}>
                {partyMembers.map((char) => <PartyCard key={char.id} character={char} />)}
              </div>
            )}
            {showAssigner && (
              <CharacterAssigner campaignId={campaign.id} assignedIds={campaign.characterIds} onClose={() => setShowAssigner(false)} />
            )}

            {/* Personajes locales de campaña */}
            <div className={styles.sectionHeaderRow} style={{ marginTop: 'var(--space-4)' }}>
              <h3 className={styles.sectionTitle}>Personajes locales ({(campaign.campaignCharacters ?? []).length})</h3>
              <Button variant="secondary" size="sm" onClick={() => setShowCCForm(true)}>
                <Plus size={14} />Nuevo personaje
              </Button>
            </div>

            {showCCForm && (
              <Card padding="md" className={styles.noteForm}>
                <div className={styles.noteFormGrid}>
                  <Input label="Nombre *" value={ccName} onChange={(e) => setCcName(e.target.value)} placeholder="Aldric Tormennt" />
                  <SearchSelect
                    label="Raza"
                    value={ccRace}
                    onChange={setCcRace}
                    options={RACES.map((r) => ({ value: r.id, label: r.label }))}
                    placeholder="Buscar raza..."
                  />
                  <SearchSelect
                    label="Clase"
                    value={ccClass}
                    onChange={setCcClass}
                    options={CLASSES.map((c) => ({ value: c.id, label: c.name }))}
                    placeholder="Buscar clase..."
                  />
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Nivel</label>
                    <input type="number" className={styles.formSelect} value={ccLevel} onChange={(e) => setCcLevel(e.target.value)} min="1" max="20" />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>BAB</label>
                    <input type="number" className={styles.formSelect} value={ccBab} onChange={(e) => setCcBab(e.target.value)} />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>CA</label>
                    <input type="number" className={styles.formSelect} value={ccAc} onChange={(e) => setCcAc(e.target.value)} min="0" />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>PG (máx)</label>
                    <input type="number" className={styles.formSelect} value={ccHp} onChange={(e) => setCcHp(e.target.value)} min="1" />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Sigilo</label>
                    <input type="number" className={styles.formSelect} value={ccStealth} onChange={(e) => setCcStealth(e.target.value)} />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Percepción</label>
                    <input type="number" className={styles.formSelect} value={ccPerception} onChange={(e) => setCcPerception(e.target.value)} />
                  </div>
                  <div className={styles.fullWidth}>
                    <label className={styles.formLabel}>Notas</label>
                    <textarea className={styles.formTextarea} rows={3} value={ccNotes} onChange={(e) => setCcNotes(e.target.value)} placeholder="Notas del personaje..." />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <Button variant="ghost" onClick={() => setShowCCForm(false)}>Cancelar</Button>
                  <Button variant="primary" onClick={submitCampaignCharacter} disabled={!ccName.trim()}>Crear personaje</Button>
                </div>
              </Card>
            )}

            {(campaign.campaignCharacters ?? []).length === 0 ? (
              <p className={styles.emptyMsg}>Sin personajes locales. Créalos aquí para personajes que no estén en el roster global.</p>
            ) : (
              <div className={styles.partyGrid}>
                {(campaign.campaignCharacters ?? []).map((char: CampaignCharacter) => (
                  <CampaignCharacterCard
                    key={char.id}
                    char={char}
                    onUpdate={(updates) => updateCampaignCharacter(campaign.id, char.id, updates)}
                    onDelete={() => deleteCampaignCharacter(campaign.id, char.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ NPCs ══ */}
        {activeTab === 'npcs' && (
          <div className={styles.npcsTab}>
            <div className={styles.sectionHeaderRow}>
              <h3 className={styles.sectionTitle}>PNJs ({campaign.npcs.length})</h3>
              <Button variant="secondary" size="sm" onClick={() => setShowNPCForm(true)}>
                <Plus size={14} />Nuevo PNJ
              </Button>
            </div>

            {showNPCForm && (
              <Card padding="md" className={styles.noteForm}>
                <div className={styles.noteFormGrid}>
                  <Input label="Nombre" value={npcName} onChange={(e) => setNpcName(e.target.value)} placeholder="Aroden el Sabio" />
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Rol</label>
                    <select className={styles.formSelect} value={npcRole} onChange={(e) => setNpcRole(e.target.value as CampaignNPC['role'])}>
                      <option value="ally">Aliado</option>
                      <option value="enemy">Enemigo</option>
                      <option value="neutral">Neutral</option>
                      <option value="unknown">Desconocido</option>
                    </select>
                  </div>
                  <Input label="Raza" value={npcRace} onChange={(e) => setNpcRace(e.target.value)} placeholder="Humano" />
                  <Input label="Localización" value={npcLocation} onChange={(e) => setNpcLocation(e.target.value)} placeholder="Ciudad de Absalom" />
                  <div className={styles.fullWidth}>
                    <label className={styles.formLabel}>Apariencia</label>
                    <textarea className={styles.formTextarea} rows={2} value={npcAppearance} onChange={(e) => setNpcAppearance(e.target.value)} placeholder="Descripción física..." />
                  </div>
                  <div className={styles.fullWidth}>
                    <label className={styles.formLabel}>Motivación</label>
                    <textarea className={styles.formTextarea} rows={2} value={npcMotivation} onChange={(e) => setNpcMotivation(e.target.value)} placeholder="¿Qué quiere este PNJ?" />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>CR</label>
                    <input type="number" className={styles.formSelect} value={npcCr} onChange={(e) => setNpcCr(e.target.value)} placeholder="—" min="0" />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>HP</label>
                    <input type="number" className={styles.formSelect} value={npcHp} onChange={(e) => setNpcHp(e.target.value)} placeholder="—" min="0" />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>CA</label>
                    <input type="number" className={styles.formSelect} value={npcAc} onChange={(e) => setNpcAc(e.target.value)} placeholder="—" min="0" />
                  </div>
                  <div className={styles.fullWidth}>
                    <label className={styles.formLabel}>Notas</label>
                    <textarea className={styles.formTextarea} rows={3} value={npcNotes} onChange={(e) => setNpcNotes(e.target.value)} placeholder="Relación con el grupo, secretos..." />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <Button variant="ghost" onClick={() => setShowNPCForm(false)}>Cancelar</Button>
                  <Button variant="primary" onClick={submitNPC} disabled={!npcName.trim()}>Guardar PNJ</Button>
                </div>
              </Card>
            )}

            {campaign.npcs.length === 0 ? (
              <p className={styles.emptyMsg}>Sin PNJs registrados.</p>
            ) : (
              <div className={styles.npcsList}>
                {campaign.npcs.map((npc) => {
                  const isOpen = expandedNPC === npc.id
                  return (
                    <Card key={npc.id} padding="md" hoverable className={styles.npcCard}>
                      <div className={styles.npcRow}>
                        <span className={`${styles.roleChip} ${styles[`role_${npc.role}`]}`}>{NPC_ROLE_LABELS[npc.role]}</span>
                        <div className={styles.npcInfo} style={{ cursor: 'pointer' }} onClick={() => setExpandedNPC(isOpen ? null : npc.id)}>
                          <span className={styles.npcName}>{npc.name}</span>
                          {npc.location && <span className={styles.npcLocation}>{npc.location}</span>}
                        </div>
                        <div className={styles.npcActions}>
                          <select className={styles.roleSelect} value={npc.role}
                            onChange={(e) => updateNPC(campaign.id, npc.id, { role: e.target.value as CampaignNPC['role'] })}>
                            <option value="ally">Aliado</option>
                            <option value="enemy">Enemigo</option>
                            <option value="neutral">Neutral</option>
                            <option value="unknown">Desconocido</option>
                          </select>
                          <button className={styles.npcDeleteBtn} onClick={() => deleteNPC(campaign.id, npc.id)}><Trash2 size={14} /></button>
                        </div>
                      </div>
                      {isOpen && (
                        <div className={styles.npcExpanded}>
                          <div className={styles.npcFieldsGrid}>
                            {npc.race && <div className={styles.npcField}><span className={styles.npcFieldLabel}>Raza</span><span className={styles.npcFieldValue}>{npc.race}</span></div>}
                            {npc.appearance && <div className={`${styles.npcField} ${styles.fullWidth}`}><span className={styles.npcFieldLabel}>Apariencia</span><span className={styles.npcFieldValue}>{npc.appearance}</span></div>}
                            {npc.personality && <div className={`${styles.npcField} ${styles.fullWidth}`}><span className={styles.npcFieldLabel}>Personalidad</span><span className={styles.npcFieldValue}>{npc.personality}</span></div>}
                            {npc.motivation && <div className={`${styles.npcField} ${styles.fullWidth}`}><span className={styles.npcFieldLabel}>Motivación</span><span className={styles.npcFieldValue}>{npc.motivation}</span></div>}
                          </div>
                          {(npc.cr !== undefined || npc.hp !== undefined || npc.ac !== undefined) && (
                            <div className={styles.npcStatsRow}>
                              {npc.cr !== undefined && <div className={styles.npcStat}><span className={styles.npcStatVal}>{npc.cr}</span><span className={styles.npcStatLabel}>CR</span></div>}
                              {npc.hp !== undefined && <div className={styles.npcStat}><span className={styles.npcStatVal}>{npc.hp}</span><span className={styles.npcStatLabel}>HP</span></div>}
                              {npc.ac !== undefined && <div className={styles.npcStat}><span className={styles.npcStatVal}>{npc.ac}</span><span className={styles.npcStatLabel}>CA</span></div>}
                            </div>
                          )}
                          <div>
                            <label className={styles.formLabel}>Notas</label>
                            <textarea className={styles.noteTextarea} rows={3} value={npc.notes}
                              onChange={(e) => updateNPC(campaign.id, npc.id, { notes: e.target.value })}
                              placeholder="Notas sobre este PNJ..." />
                          </div>
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ UBICACIONES ══ */}
        {activeTab === 'locations' && (
          <div className={styles.locationsTab}>
            <div className={styles.sectionHeaderRow}>
              <h3 className={styles.sectionTitle}>Ubicaciones ({(campaign.locations ?? []).length})</h3>
              <Button variant="secondary" size="sm" onClick={() => setShowLocationForm(true)}>
                <Plus size={14} />Nueva Ubicación
              </Button>
            </div>

            {showLocationForm && (
              <Card padding="md" className={styles.noteForm}>
                <div className={styles.noteFormGrid}>
                  <Input label="Nombre" value={locName} onChange={(e) => setLocName(e.target.value)} placeholder="Fortaleza del Norte" />
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Tipo</label>
                    <select className={styles.formSelect} value={locType} onChange={(e) => setLocType(e.target.value as CampaignLocation['type'])}>
                      {(Object.keys(LOCATION_TYPE_LABELS) as CampaignLocation['type'][]).map((t) => (
                        <option key={t} value={t}>{LOCATION_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.fullWidth}>
                    <label className={styles.formLabel}>Descripción</label>
                    <textarea className={styles.formTextarea} rows={3} value={locDesc}
                      onChange={(e) => setLocDesc(e.target.value)} placeholder="Describe el lugar..." />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <Button variant="ghost" onClick={() => setShowLocationForm(false)}>Cancelar</Button>
                  <Button variant="primary" onClick={submitLocation} disabled={!locName.trim()}>Guardar Ubicación</Button>
                </div>
              </Card>
            )}

            {(campaign.locations ?? []).length === 0 ? (
              <p className={styles.emptyMsg}>Sin ubicaciones registradas.</p>
            ) : (
              <div className={styles.notesList}>
                {(campaign.locations ?? []).map((loc) => (
                  <Card key={loc.id} padding="md" className={`${styles.locationCard} ${loc.parentId ? styles.locationIndented : ''}`}>
                    <div className={styles.locationHeader}>
                      <span className={styles.locationTypeChip}>{LOCATION_TYPE_LABELS[loc.type]}</span>
                      <span className={styles.locationName}>{loc.name}</span>
                      <button
                        className={`${styles.locationStatusChip} ${styles[`locStatus_${loc.status}`]}`}
                        onClick={() => cycleLocationStatus(loc.id, loc.status)}
                        title="Click para cambiar estado"
                      >
                        {LOCATION_STATUS_LABELS[loc.status]}
                      </button>
                      <button className={styles.noteDeleteBtn} onClick={() => deleteLocation(campaign.id, loc.id)}><Trash2 size={12} /></button>
                    </div>
                    {loc.description && <p className={styles.locationDesc}>{loc.description}</p>}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ MISIONES ══ */}
        {activeTab === 'quests' && (
          <div className={styles.questsTab}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.noteCategoryChips}>
                {(['all', 'main', 'side', 'personal'] as const).map((t) => (
                  <button key={t} className={`${styles.catChip} ${filterQuestType === t ? styles.catChipActive : ''}`}
                    onClick={() => setFilterQuestType(t)}>
                    {t === 'all' ? 'Todas' : QUEST_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setShowQuestForm(true)}>
                <Plus size={14} />Nueva Misión
              </Button>
            </div>

            {showQuestForm && (
              <Card padding="md" className={styles.noteForm}>
                <div className={styles.noteFormGrid}>
                  <Input label="Título" value={questTitle} onChange={(e) => setQuestTitle(e.target.value)} placeholder="Rescatar al alcalde" />
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Tipo</label>
                    <select className={styles.formSelect} value={questType} onChange={(e) => setQuestType(e.target.value as CampaignQuest['type'])}>
                      <option value="main">Principal</option>
                      <option value="side">Secundaria</option>
                      <option value="personal">Personal</option>
                    </select>
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>XP</label>
                    <input type="number" className={styles.formSelect} value={questXp} onChange={(e) => setQuestXp(e.target.value)} placeholder="0" min="0" />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Oro (gp)</label>
                    <input type="number" className={styles.formSelect} value={questGold} onChange={(e) => setQuestGold(e.target.value)} placeholder="0" min="0" />
                  </div>
                  <div className={styles.fullWidth}>
                    <label className={styles.formLabel}>Descripción</label>
                    <textarea className={styles.formTextarea} rows={3} value={questDesc}
                      onChange={(e) => setQuestDesc(e.target.value)} placeholder="Describe la misión..." />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <Button variant="ghost" onClick={() => setShowQuestForm(false)}>Cancelar</Button>
                  <Button variant="primary" onClick={submitQuest} disabled={!questTitle.trim()}>Guardar Misión</Button>
                </div>
              </Card>
            )}

            {(['active', 'completed', 'failed', 'unknown'] as const).map((status) => {
              const group = filteredQuests.filter((q) => q.status === status)
              if (group.length === 0) return null
              return (
                <div key={status} className={styles.questGroup}>
                  <span className={styles.questGroupTitle}>{QUEST_STATUS_LABELS[status]} ({group.length})</span>
                  <div className={styles.notesList}>
                    {group.map((quest) => (
                      <Card key={quest.id} padding="md" className={styles.questCard}>
                        <div className={styles.questHeader}>
                          <span className={`${styles.questTypeChip} ${styles[`questType_${quest.type}`]}`}>{QUEST_TYPE_LABELS[quest.type]}</span>
                          <span className={styles.questTitle}>{quest.title}</span>
                          {(quest.xpReward || quest.goldReward) && (
                            <div className={styles.questRewards}>
                              {quest.xpReward && <span className={styles.questRewardBadge}>{quest.xpReward} XP</span>}
                              {quest.goldReward && <span className={styles.questRewardBadge}>{quest.goldReward} gp</span>}
                            </div>
                          )}
                          <select className={styles.questStatusSelect} value={quest.status}
                            onChange={(e) => updateQuest(campaign.id, quest.id, { status: e.target.value as CampaignQuest['status'] })}>
                            <option value="active">Activa</option>
                            <option value="completed">Completada</option>
                            <option value="failed">Fallida</option>
                            <option value="unknown">Desconocida</option>
                          </select>
                          <button className={styles.noteDeleteBtn} onClick={() => deleteQuest(campaign.id, quest.id)}><Trash2 size={12} /></button>
                        </div>
                        {quest.description && <p className={styles.questDesc}>{quest.description}</p>}
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}

            {filteredQuests.length === 0 && <p className={styles.emptyMsg}>Sin misiones registradas.</p>}
          </div>
        )}

        {/* ══ ENCUENTROS ══ */}
        {activeTab === 'encounters' && (
          <div className={styles.encountersTab}>
            <div className={styles.sectionHeaderRow}>
              <h3 className={styles.sectionTitle}>Encuentros ({(campaign.encounters ?? []).length})</h3>
              <Button variant="secondary" size="sm" onClick={() => setShowEncounterForm(true)}>
                <Plus size={14} />Nuevo Encuentro
              </Button>
            </div>

            {showEncounterForm && (
              <Card padding="md" className={styles.noteForm}>
                <div className={styles.noteFormGrid}>
                  <Input label="Nombre" value={encName} onChange={(e) => setEncName(e.target.value)} placeholder="Guardianes del templo" />
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Dificultad</label>
                    <select className={styles.formSelect} value={encDifficulty} onChange={(e) => setEncDifficulty(e.target.value as CampaignEncounter['difficulty'])}>
                      {(Object.keys(DIFFICULTY_LABELS) as CampaignEncounter['difficulty'][]).map((d) => (
                        <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>XP</label>
                    <input type="number" className={styles.formSelect} value={encXp} onChange={(e) => setEncXp(e.target.value)} min="0" />
                  </div>
                  <Input label="Tesoro" value={encTreasure} onChange={(e) => setEncTreasure(e.target.value)} placeholder="100 gp, poción de curación" />

                  <div className={`${styles.fullWidth} ${styles.formField}`}>
                    <label className={styles.formLabel}>Enemigos</label>
                    <div className={styles.highlightInputRow}>
                      <input className={styles.formSelect} style={{ flex: 2 }} value={encEnemyName} onChange={(e) => setEncEnemyName(e.target.value)} placeholder="Nombre del enemigo" />
                      <input type="number" className={styles.formSelect} style={{ width: 64 }} value={encEnemyHp} onChange={(e) => setEncEnemyHp(e.target.value)} placeholder="HP" min="1" />
                      <input type="number" className={styles.formSelect} style={{ width: 64 }} value={encEnemyAc} onChange={(e) => setEncEnemyAc(e.target.value)} placeholder="CA" min="0" />
                      <Button variant="secondary" size="sm" onClick={addEncEnemyToForm}><Plus size={13} /></Button>
                    </div>
                    {encEnemies.length > 0 && (
                      <div className={styles.tagRow}>
                        {encEnemies.map((e, i) => (
                          <span key={i} className={styles.tag}>
                            {e.name} ({e.hpMax} HP / CA {e.ac})
                            <button className={styles.tagRemoveBtn} onClick={() => setEncEnemies((prev) => prev.filter((_, j) => j !== i))}>×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.formActions}>
                  <Button variant="ghost" onClick={() => setShowEncounterForm(false)}>Cancelar</Button>
                  <Button variant="primary" onClick={submitEncounter} disabled={!encName.trim()}>Guardar Encuentro</Button>
                </div>
              </Card>
            )}

            {(campaign.encounters ?? []).length === 0 ? (
              <p className={styles.emptyMsg}>Sin encuentros registrados.</p>
            ) : (
              <div className={styles.notesList}>
                {(campaign.encounters ?? []).map((enc) => {
                  const isOpen = expandedEncounter === enc.id
                  return (
                    <Card key={enc.id} padding="md" hoverable className={styles.encounterCard}>
                      <div className={styles.encounterHeader} onClick={() => setExpandedEncounter(isOpen ? null : enc.id)}>
                        <span className={`${styles.difficultyChip} ${styles[`diff_${enc.difficulty}`]}`}>{DIFFICULTY_LABELS[enc.difficulty]}</span>
                        <span className={styles.encounterName}>{enc.name}</span>
                        <span className={`${styles.encounterStatusChip} ${styles[`encStatus_${enc.status}`]}`}>{enc.status === 'pending' ? 'Pendiente' : enc.status === 'active' ? 'Activo' : 'Completado'}</span>
                        <span className={styles.sessionXp}>{enc.enemies.length} enemigos</span>
                        <button className={styles.noteDeleteBtn} onClick={(e) => { e.stopPropagation(); deleteEncounter(campaign.id, enc.id) }}><Trash2 size={12} /></button>
                        <span className={styles.expandIcon}>{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                      </div>
                      {isOpen && (
                        <EncounterTracker
                          encounter={enc}
                          onUpdateEnemy={(enemyId, updates) => updateEnemy(campaign.id, enc.id, enemyId, updates)}
                          onComplete={() => updateEncounter(campaign.id, enc.id, { status: 'completed' })}
                        />
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ BOTÍN ══ */}
        {activeTab === 'loot' && (
          <div className={styles.lootTab}>
            <div className={styles.sectionHeaderRow}>
              <h3 className={styles.sectionTitle}>Botín ({(campaign.loot ?? []).length})</h3>
              <Button variant="secondary" size="sm" onClick={() => setShowLootForm(true)}>
                <Plus size={14} />Añadir Item
              </Button>
            </div>

            {showLootForm && (
              <Card padding="md" className={styles.noteForm}>
                <div className={styles.noteFormGrid}>
                  <Input label="Nombre" value={lootName} onChange={(e) => setLootName(e.target.value)} placeholder="Espada larga +1" />
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Tipo</label>
                    <select className={styles.formSelect} value={lootType} onChange={(e) => setLootType(e.target.value as CampaignLoot['type'])}>
                      {(Object.keys(LOOT_TYPE_LABELS) as CampaignLoot['type'][]).map((t) => (
                        <option key={t} value={t}>{LOOT_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Valor (gp)</label>
                    <input type="number" className={styles.formSelect} value={lootValue} onChange={(e) => setLootValue(e.target.value)} placeholder="0" min="0" />
                  </div>
                  <div className={styles.fullWidth}>
                    <label className={styles.formLabel}>Notas</label>
                    <textarea className={styles.formTextarea} rows={2} value={lootNotes} onChange={(e) => setLootNotes(e.target.value)} placeholder="Propiedades especiales..." />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <Button variant="ghost" onClick={() => setShowLootForm(false)}>Cancelar</Button>
                  <Button variant="primary" onClick={submitLoot} disabled={!lootName.trim()}>Añadir</Button>
                </div>
              </Card>
            )}

            {(campaign.loot ?? []).length === 0 ? (
              <p className={styles.emptyMsg}>Sin botín registrado.</p>
            ) : (
              <Card padding="md">
                <table className={styles.lootTable}>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Tipo</th>
                      <th>Valor</th>
                      <th>Asignado a</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(campaign.loot ?? []).map((item) => (
                      <tr key={item.id} className={styles.lootRow}>
                        <td>
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            {item.notes && <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-on-surface-variant)' }}>{item.notes}</div>}
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.lootTypeChip} ${styles[`lootType_${item.type}`]}`}>{LOOT_TYPE_LABELS[item.type]}</span>
                        </td>
                        <td>{item.value !== undefined ? `${item.value} gp` : '—'}</td>
                        <td>
                          <select className={styles.lootAssignSelect} value={item.assignedTo ?? ''}
                            onChange={(e) => updateLoot(campaign.id, item.id, { assignedTo: e.target.value || undefined })}>
                            <option value="">Sin asignar</option>
                            {partyMembers.map((char) => (
                              <option key={char.id} value={char.id}>{char.name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button className={styles.npcDeleteBtn} onClick={() => deleteLoot(campaign.id, item.id)}><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={styles.lootFooter}>
                  <span>Sin asignar:</span>
                  <span className={styles.lootTotal}>{unassignedLootValue} gp</span>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ══ NOTAS ══ */}
        {activeTab === 'notes' && (
          <div className={styles.notesTab}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.noteCategoryChips}>
                {(['all', 'story', 'npc', 'location', 'loot', 'misc'] as const).map((cat) => (
                  <button key={cat} className={`${styles.catChip} ${filterNoteCategory === cat ? styles.catChipActive : ''}`}
                    onClick={() => setFilterNoteCategory(cat)}>
                    {cat === 'all' ? 'Todas' : NOTE_CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setShowNoteForm(true)}>
                <Plus size={14} />Nueva Nota
              </Button>
            </div>

            {showNoteForm && (
              <Card padding="md" className={styles.noteForm}>
                <div className={styles.noteFormGrid}>
                  <Input label="Título" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Resumen de sesión 1" />
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Categoría</label>
                    <select className={styles.formSelect} value={noteCategory} onChange={(e) => setNoteCategory(e.target.value as CampaignNote['category'])}>
                      <option value="story">Historia</option>
                      <option value="npc">PNJ</option>
                      <option value="location">Lugar</option>
                      <option value="loot">Botín</option>
                      <option value="misc">Misc</option>
                    </select>
                  </div>
                  <div className={styles.fullWidth}>
                    <label className={styles.formLabel}>Contenido</label>
                    <textarea className={styles.formTextarea} rows={4} value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)} placeholder="Describe los eventos, hallazgos o detalles..." />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <Button variant="ghost" onClick={() => setShowNoteForm(false)}>Cancelar</Button>
                  <Button variant="primary" onClick={submitNote} disabled={!noteTitle.trim()}>Guardar Nota</Button>
                </div>
              </Card>
            )}

            {filteredNotes.length === 0 ? (
              <p className={styles.emptyMsg}>Sin notas{filterNoteCategory !== 'all' ? ' en esta categoría' : ''}.</p>
            ) : (
              <div className={styles.notesList}>
                {filteredNotes.map((note) => {
                  const isOpen = expandedNote === note.id
                  return (
                    <Card key={note.id} padding="md" hoverable className={styles.noteCard}>
                      <div className={styles.noteHeader} onClick={() => setExpandedNote(isOpen ? null : note.id)}>
                        <span className={`${styles.noteCatChip} ${styles[`cat_${note.category}`]}`}>{NOTE_CATEGORY_LABELS[note.category]}</span>
                        <span className={styles.noteTitle}>{note.title}</span>
                        <button className={styles.noteDeleteBtn} onClick={(e) => { e.stopPropagation(); deleteNote(campaign.id, note.id) }}><Trash2 size={12} /></button>
                        <span className={styles.expandIcon}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                      {isOpen && (
                        <div className={styles.noteBody}>
                          <textarea className={styles.noteTextarea} value={note.content} rows={5}
                            onChange={(e) => updateNote(campaign.id, note.id, { content: e.target.value })}
                            placeholder="Sin contenido..." />
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
