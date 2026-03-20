import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Users, BookOpen, Scroll, Sword, Plus, Trash2,
  X, Edit2, Check, Monitor, PlusCircle
} from 'lucide-react'
import { useCampaignStore, useCharacterStore } from '../store'
import type { Campaign, CampaignNote, CampaignNPC } from '../store'
import { Button, Card, Input } from '../components/ui'
import { PartyCard, CharacterAssigner } from '../components/campaign'
import styles from './CampaignView.module.css'

type Tab = 'overview' | 'party' | 'notes' | 'npcs'

const NOTE_CATEGORY_LABELS: Record<CampaignNote['category'], string> = {
  story: 'Historia',
  npc: 'PNJ',
  location: 'Lugar',
  loot: 'Botín',
  misc: 'Misc',
}

const NPC_ROLE_LABELS: Record<CampaignNPC['role'], string> = {
  ally: 'Aliado',
  enemy: 'Enemigo',
  neutral: 'Neutral',
  unknown: 'Desconocido',
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

  // NPC form
  const [showNPCForm, setShowNPCForm] = useState(false)
  const [npcName, setNpcName] = useState('')
  const [npcRole, setNpcRole] = useState<CampaignNPC['role']>('neutral')
  const [npcNotes, setNpcNotes] = useState('')
  const [npcLocation, setNpcLocation] = useState('')

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

  const startEdit = () => {
    setEditName(campaign.name)
    setEditDesc(campaign.description)
    setIsEditing(true)
  }

  const saveEdit = () => {
    updateCampaign(campaign.id, { name: editName.trim() || campaign.name, description: editDesc.trim() })
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (confirm(`¿Eliminar la campaña "${campaign.name}"?`)) {
      deleteCampaign(campaign.id)
      navigate('/campaigns')
    }
  }

  const submitNote = () => {
    if (!noteTitle.trim()) return
    addNote(campaign.id, { title: noteTitle.trim(), content: noteContent.trim(), category: noteCategory })
    setNoteTitle(''); setNoteContent(''); setNoteCategory('story'); setShowNoteForm(false)
  }

  const submitNPC = () => {
    if (!npcName.trim()) return
    addNPC(campaign.id, { name: npcName.trim(), role: npcRole, notes: npcNotes.trim(), location: npcLocation.trim() || undefined })
    setNpcName(''); setNpcRole('neutral'); setNpcNotes(''); setNpcLocation(''); setShowNPCForm(false)
  }

  const STATUS_LABELS: Record<Campaign['status'], string> = {
    active: 'Activa', paused: 'En pausa', completed: 'Completada',
  }

  const filteredNotes = filterNoteCategory === 'all'
    ? campaign.notes
    : campaign.notes.filter((n) => n.category === filterNoteCategory)

  const tabs: { id: Tab; label: string; icon: typeof Sword }[] = [
    { id: 'overview', label: 'Resumen', icon: BookOpen },
    { id: 'party', label: 'Party', icon: Users },
    { id: 'notes', label: 'Notas', icon: Scroll },
    { id: 'npcs', label: 'PNJs', icon: Users },
  ]

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <Link to="/campaigns" className={styles.backLink}>
          <ArrowLeft size={20} />
          Crónicas
        </Link>
        <div className={styles.titleRow}>
          <div>
            {isEditing ? (
              <input
                className={styles.editNameInput}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                autoFocus
              />
            ) : (
              <h1 className={styles.title}>{campaign.name}</h1>
            )}
            <p className={styles.subtitle}>
              {campaign.setting && `${campaign.setting} · `}
              <span className={`${styles.statusChip} ${styles[`status_${campaign.status}`]}`}>
                {STATUS_LABELS[campaign.status]}
              </span>
              {campaign.gmName && ` · GM: ${campaign.gmName}`}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link to={`/campaigns/${campaign.id}/party`} className={styles.partyViewLink}>
              <Monitor size={16} />
              Vista GM
            </Link>
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
        {tabs.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            className={`${styles.tab} ${activeTab === tabId ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tabId)}
          >
            <Icon size={15} />
            {label}
            {tabId === 'party' && <span className={styles.tabBadge}>{partyMembers.length}</span>}
            {tabId === 'notes' && campaign.notes.length > 0 && <span className={styles.tabBadge}>{campaign.notes.length}</span>}
            {tabId === 'npcs' && campaign.npcs.length > 0 && <span className={styles.tabBadge}>{campaign.npcs.length}</span>}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className={styles.tabContent}>

        {/* ══ RESUMEN ══ */}
        {activeTab === 'overview' && (
          <div className={styles.overviewTab}>
            <div className={styles.statsRow}>
              {[
                { label: 'Personajes', val: campaign.characterIds.length, icon: Users },
                { label: 'Sesiones', val: campaign.sessionCount, icon: BookOpen },
                { label: 'Notas', val: campaign.notes.length, icon: Scroll },
                { label: 'PNJs', val: campaign.npcs.length, icon: Users },
              ].map(({ label, val, icon: Icon }) => (
                <Card key={label} padding="md" className={styles.statCard}>
                  <Icon size={20} className={styles.statIcon} />
                  <span className={styles.statVal}>{val}</span>
                  <span className={styles.statLabel}>{label}</span>
                </Card>
              ))}
            </div>

            <Card padding="md">
              <div className={styles.sectionHeaderRow}>
                <h3 className={styles.sectionTitle}>Descripción</h3>
              </div>
              {isEditing ? (
                <textarea
                  className={styles.editTextarea}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={5}
                  placeholder="Describe la premisa de la campaña..."
                />
              ) : (
                <p className={styles.descText}>
                  {campaign.description || <em className={styles.empty}>Sin descripción.</em>}
                </p>
              )}
            </Card>

            <Card padding="md">
              <div className={styles.sectionHeaderRow}>
                <h3 className={styles.sectionTitle}>Progreso de sesiones</h3>
                <div className={styles.sessionControls}>
                  <button className={styles.sessionBtn}
                    onClick={() => updateCampaign(campaign.id, { sessionCount: Math.max(0, campaign.sessionCount - 1) })}>
                    −
                  </button>
                  <span className={styles.sessionCount}>{campaign.sessionCount}</span>
                  <button className={styles.sessionBtn}
                    onClick={() => updateCampaign(campaign.id, { sessionCount: campaign.sessionCount + 1 })}>
                    +
                  </button>
                </div>
              </div>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Estado:</span>
                <select
                  className={styles.statusSelect}
                  value={campaign.status}
                  onChange={(e) => updateCampaign(campaign.id, { status: e.target.value as Campaign['status'] })}
                >
                  <option value="active">Activa</option>
                  <option value="paused">En pausa</option>
                  <option value="completed">Completada</option>
                </select>
              </div>
            </Card>
          </div>
        )}

        {/* ══ PARTY ══ */}
        {activeTab === 'party' && (
          <div className={styles.partyTab}>
            <div className={styles.sectionHeaderRow}>
              <h3 className={styles.sectionTitle}>Personajes ({partyMembers.length})</h3>
              <Button variant="secondary" size="sm" onClick={() => setShowAssigner(true)}>
                <PlusCircle size={14} />
                Gestionar
              </Button>
            </div>
            {partyMembers.length === 0 ? (
              <div className={styles.emptyParty}>
                <Users size={40} className={styles.emptyIcon} />
                <p>No hay personajes en esta campaña.</p>
                <Button variant="secondary" size="sm" onClick={() => setShowAssigner(true)}>
                  <PlusCircle size={14} />
                  Añadir personajes
                </Button>
              </div>
            ) : (
              <div className={styles.partyGrid}>
                {partyMembers.map((char) => (
                  <PartyCard key={char.id} character={char} />
                ))}
              </div>
            )}
            {showAssigner && (
              <CharacterAssigner
                campaignId={campaign.id}
                assignedIds={campaign.characterIds}
                onClose={() => setShowAssigner(false)}
              />
            )}
          </div>
        )}

        {/* ══ NOTAS ══ */}
        {activeTab === 'notes' && (
          <div className={styles.notesTab}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.noteCategoryChips}>
                {(['all', 'story', 'npc', 'location', 'loot', 'misc'] as const).map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.catChip} ${filterNoteCategory === cat ? styles.catChipActive : ''}`}
                    onClick={() => setFilterNoteCategory(cat)}
                  >
                    {cat === 'all' ? 'Todas' : NOTE_CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setShowNoteForm(true)}>
                <Plus size={14} />
                Nueva Nota
              </Button>
            </div>

            {showNoteForm && (
              <Card padding="md" className={styles.noteForm}>
                <div className={styles.noteFormGrid}>
                  <Input label="Título" value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)} placeholder="Resumen de sesión 1" />
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Categoría</label>
                    <select className={styles.formSelect} value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value as CampaignNote['category'])}>
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
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Describe los eventos, hallazgos o detalles..." />
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
                      <div className={styles.noteHeader}
                        onClick={() => setExpandedNote(isOpen ? null : note.id)}>
                        <span className={`${styles.noteCatChip} ${styles[`cat_${note.category}`]}`}>
                          {NOTE_CATEGORY_LABELS[note.category]}
                        </span>
                        <span className={styles.noteTitle}>{note.title}</span>
                        <button className={styles.noteDeleteBtn}
                          onClick={(e) => { e.stopPropagation(); deleteNote(campaign.id, note.id) }}>
                          <Trash2 size={12} />
                        </button>
                        <span className={styles.expandIcon}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                      {isOpen && (
                        <div className={styles.noteBody}>
                          <textarea
                            className={styles.noteTextarea}
                            value={note.content}
                            rows={5}
                            onChange={(e) => updateNote(campaign.id, note.id, { content: e.target.value })}
                            placeholder="Sin contenido..."
                          />
                        </div>
                      )}
                    </Card>
                  )
                })}
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
                <Plus size={14} />
                Nuevo PNJ
              </Button>
            </div>

            {showNPCForm && (
              <Card padding="md" className={styles.noteForm}>
                <div className={styles.noteFormGrid}>
                  <Input label="Nombre" value={npcName}
                    onChange={(e) => setNpcName(e.target.value)} placeholder="Aroden el Sabio" />
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Rol</label>
                    <select className={styles.formSelect} value={npcRole}
                      onChange={(e) => setNpcRole(e.target.value as CampaignNPC['role'])}>
                      <option value="ally">Aliado</option>
                      <option value="enemy">Enemigo</option>
                      <option value="neutral">Neutral</option>
                      <option value="unknown">Desconocido</option>
                    </select>
                  </div>
                  <Input label="Localización" value={npcLocation}
                    onChange={(e) => setNpcLocation(e.target.value)} placeholder="Ciudad de Absalom" />
                  <div className={styles.fullWidth}>
                    <label className={styles.formLabel}>Notas</label>
                    <textarea className={styles.formTextarea} rows={3} value={npcNotes}
                      onChange={(e) => setNpcNotes(e.target.value)}
                      placeholder="Descripción, motivaciones, relación con el grupo..." />
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
                {campaign.npcs.map((npc) => (
                  <Card key={npc.id} padding="md" className={styles.npcCard}>
                    <div className={styles.npcRow}>
                      <span className={`${styles.roleChip} ${styles[`role_${npc.role}`]}`}>
                        {NPC_ROLE_LABELS[npc.role]}
                      </span>
                      <div className={styles.npcInfo}>
                        <span className={styles.npcName}>{npc.name}</span>
                        {npc.location && <span className={styles.npcLocation}>{npc.location}</span>}
                        {npc.notes && <p className={styles.npcNotes}>{npc.notes}</p>}
                      </div>
                      <div className={styles.npcActions}>
                        <select
                          className={styles.roleSelect}
                          value={npc.role}
                          onChange={(e) => updateNPC(campaign.id, npc.id, { role: e.target.value as CampaignNPC['role'] })}
                        >
                          <option value="ally">Aliado</option>
                          <option value="enemy">Enemigo</option>
                          <option value="neutral">Neutral</option>
                          <option value="unknown">Desconocido</option>
                        </select>
                        <button className={styles.npcDeleteBtn}
                          onClick={() => deleteNPC(campaign.id, npc.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
