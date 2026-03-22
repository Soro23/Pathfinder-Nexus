import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Sword, Theater, Plus, ChevronUp, ChevronDown,
  SkipForward, RotateCcw, Dices, Shield, Heart, Target,
  MapPin, Scroll, Users, MessageSquare, Trash2, RefreshCw,
} from 'lucide-react'
import { useCampaignStore, useCharacterStore } from '../store'
import type { Campaign, Character, CampaignCharacter, CampaignNPC, CampaignEncounter, CampaignLocation, CampaignQuest } from '../store'
import styles from './PartyView.module.css'

// ── Types ─────────────────────────────────────────────────────────────────────

type GmMode = 'combat' | 'roleplay'

interface Combatant {
  key: string
  name: string
  initiative: number | ''
  hpCurrent: number
  hpMax: number
  ac: number
  type: 'party' | 'npc' | 'enemy'
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcAC(char: Character): number {
  const dexMod = Math.floor((char.abilities.dexterity - 10) / 2)
  const armorBonus = (char.armor ?? [])
    .filter((a) => a.equipped)
    .reduce((sum, a) => sum + a.acBonus, 0)
  return 10 + dexMod + armorBonus
}

function HpBar({ cur, max }: { cur: number; max: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (cur / max) * 100)) : 0
  const cls = pct > 50 ? styles.hpGood : pct > 25 ? styles.hpWarn : styles.hpDanger
  return (
    <div className={styles.hpBar}>
      <div className={`${styles.hpFill} ${cls}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── Combat mode ───────────────────────────────────────────────────────────────

function CombatMode({ campaign, partyMembers, localChars }: {
  campaign: Campaign
  partyMembers: Character[]
  localChars: CampaignCharacter[]
}) {
  const [combatants, setCombatants] = useState<Combatant[]>([])
  const [round, setRound] = useState(1)
  const [turnIdx, setTurnIdx] = useState(0)

  const npcs: CampaignNPC[] = campaign.npcs ?? []
  const encounters: CampaignEncounter[] = campaign.encounters ?? []

  // Sort by initiative desc (blanks go last)
  const sorted = useMemo(() => [...combatants].sort((a, b) => {
    if (a.initiative === '' && b.initiative === '') return 0
    if (a.initiative === '') return 1
    if (b.initiative === '') return -1
    return (b.initiative as number) - (a.initiative as number)
  }), [combatants])

  const current = sorted[turnIdx % Math.max(sorted.length, 1)]

  function addCombatant(c: Combatant) {
    if (combatants.find((x) => x.key === c.key)) return
    setCombatants((p) => [...p, c])
  }

  function removeCombatant(key: string) {
    setCombatants((p) => p.filter((c) => c.key !== key))
    setTurnIdx(0)
  }

  function updateCombatant(key: string, updates: Partial<Combatant>) {
    setCombatants((p) => p.map((c) => c.key === key ? { ...c, ...updates } : c))
  }

  function adjustHP(key: string, delta: number) {
    setCombatants((p) => p.map((c) => c.key === key
      ? { ...c, hpCurrent: Math.min(c.hpMax, Math.max(0, c.hpCurrent + delta)) }
      : c))
  }

  function rollAll() {
    setCombatants((p) => p.map((c) => ({
      ...c,
      initiative: Math.floor(Math.random() * 20) + 1,
    })))
    setTurnIdx(0)
  }

  function nextTurn() {
    if (sorted.length === 0) return
    const next = (turnIdx + 1) % sorted.length
    if (next === 0) setRound((r) => r + 1)
    setTurnIdx(next)
  }

  function reset() {
    setCombatants([])
    setRound(1)
    setTurnIdx(0)
  }

  const inTracker = (key: string) => !!combatants.find((c) => c.key === key)

  return (
    <div className={styles.combatLayout}>

      {/* ── Left: Pool ── */}
      <div className={styles.pool}>
        <h3 className={styles.poolTitle}><Users size={15} /> Party</h3>
        {partyMembers.map((ch) => (
          <div key={ch.id} className={`${styles.poolCard} ${inTracker('pc-' + ch.id) ? styles.poolCardAdded : ''}`}>
            <div className={styles.poolCardInfo}>
              <span className={styles.poolCardName}>{ch.name}</span>
              <div className={styles.poolCardMeta}>
                <span><Heart size={11} /> {ch.hp.current}/{ch.hp.max}</span>
                <span><Shield size={11} /> CA {calcAC(ch)}</span>
              </div>
              <HpBar cur={ch.hp.current} max={ch.hp.max} />
            </div>
            <button
              className={styles.addBtn}
              onClick={() => addCombatant({
                key: 'pc-' + ch.id,
                name: ch.name,
                initiative: '',
                hpCurrent: ch.hp.current,
                hpMax: ch.hp.max,
                ac: calcAC(ch),
                type: 'party',
              })}
              disabled={inTracker('pc-' + ch.id)}
            >
              <Plus size={13} />
            </button>
          </div>
        ))}
        {localChars.map((ch) => (
          <div key={ch.id} className={`${styles.poolCard} ${inTracker('lc-' + ch.id) ? styles.poolCardAdded : ''}`}>
            <div className={styles.poolCardInfo}>
              <span className={styles.poolCardName}>{ch.name}</span>
              <div className={styles.poolCardMeta}>
                <span><Heart size={11} /> {ch.hpCurrent}/{ch.hpMax}</span>
                <span><Shield size={11} /> CA {ch.ac}</span>
              </div>
              <HpBar cur={ch.hpCurrent} max={ch.hpMax} />
            </div>
            <button
              className={styles.addBtn}
              onClick={() => addCombatant({
                key: 'lc-' + ch.id,
                name: ch.name,
                initiative: '',
                hpCurrent: ch.hpCurrent,
                hpMax: ch.hpMax,
                ac: ch.ac,
                type: 'party',
              })}
              disabled={inTracker('lc-' + ch.id)}
            >
              <Plus size={13} />
            </button>
          </div>
        ))}

        {npcs.length > 0 && (
          <>
            <h3 className={styles.poolTitle} style={{ marginTop: 'var(--space-4)' }}><MessageSquare size={15} /> PNJs</h3>
            {npcs.map((npc) => (
              <div key={npc.id} className={`${styles.poolCard} ${inTracker('npc-' + npc.id) ? styles.poolCardAdded : ''}`}>
                <div className={styles.poolCardInfo}>
                  <span className={styles.poolCardName}>{npc.name}</span>
                  <div className={styles.poolCardMeta}>
                    {npc.hp && <span><Heart size={11} /> {npc.hp}</span>}
                    {npc.ac && <span><Shield size={11} /> CA {npc.ac}</span>}
                    {npc.cr !== undefined && <span>CR {npc.cr}</span>}
                  </div>
                </div>
                <button
                  className={styles.addBtn}
                  onClick={() => addCombatant({
                    key: 'npc-' + npc.id,
                    name: npc.name,
                    initiative: '',
                    hpCurrent: npc.hp ?? 10,
                    hpMax: npc.hp ?? 10,
                    ac: npc.ac ?? 10,
                    type: 'npc',
                  })}
                  disabled={inTracker('npc-' + npc.id)}
                >
                  <Plus size={13} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Center: Initiative tracker ── */}
      <div className={styles.tracker}>
        <div className={styles.trackerHeader}>
          <div className={styles.trackerControls}>
            <span className={styles.roundBadge}>Ronda {round}</span>
            <button className={styles.ctrlBtn} onClick={rollAll} title="Tirar iniciativas"><Dices size={14} /> Tirar</button>
            <button className={styles.ctrlBtn} onClick={nextTurn} disabled={sorted.length === 0} title="Siguiente turno">
              <SkipForward size={14} /> Siguiente
            </button>
            <button className={styles.ctrlBtn} onClick={reset} title="Reiniciar combate"><RotateCcw size={14} /></button>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className={styles.trackerEmpty}>
            <Target size={36} />
            <p>Añade combatientes desde los paneles laterales</p>
          </div>
        ) : (
          <div className={styles.initiative}>
            {sorted.map((c, i) => {
              const isCurrent = sorted.length > 0 && current?.key === c.key
              return (
                <div key={c.key} className={`${styles.initRow} ${isCurrent ? styles.initRowActive : ''}`}>
                  <div className={styles.initPos}>{i + 1}</div>
                  <input
                    type="number"
                    className={styles.initInput}
                    value={c.initiative}
                    placeholder="—"
                    onChange={(e) => updateCombatant(c.key, { initiative: e.target.value === '' ? '' : +e.target.value })}
                  />
                  <div className={styles.initName}>
                    <span className={`${styles.typeChip} ${styles['typeChip_' + c.type]}`}>{c.type === 'party' ? 'PJ' : c.type === 'npc' ? 'PNJ' : 'ENE'}</span>
                    <span>{c.name}</span>
                  </div>
                  <div className={styles.initHP}>
                    <button className={styles.hpBtn} onClick={() => adjustHP(c.key, -1)}>−1</button>
                    <button className={styles.hpBtn} onClick={() => adjustHP(c.key, -5)}>−5</button>
                    <HpBar cur={c.hpCurrent} max={c.hpMax} />
                    <span className={styles.hpText}>{c.hpCurrent}/{c.hpMax}</span>
                    <button className={styles.hpBtn} onClick={() => adjustHP(c.key, +1)}>+1</button>
                    <button className={styles.hpBtn} onClick={() => adjustHP(c.key, +5)}>+5</button>
                  </div>
                  <span className={styles.acBadge}><Shield size={11} />{c.ac}</span>
                  <button className={styles.removeInitBtn} onClick={() => removeCombatant(c.key)}><Trash2 size={12} /></button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Right: Enemies ── */}
      <div className={styles.pool}>
        <h3 className={styles.poolTitle}><Sword size={15} /> Enemigos</h3>

        {encounters.map((enc) => (
          <div key={enc.id} className={styles.encounterGroup}>
            <div className={styles.encounterGroupName}>{enc.name}</div>
            {enc.enemies.map((en) => (
              <div key={en.id} className={`${styles.poolCard} ${inTracker('en-' + en.id) ? styles.poolCardAdded : ''}`}>
                <div className={styles.poolCardInfo}>
                  <span className={styles.poolCardName}>{en.name}</span>
                  <div className={styles.poolCardMeta}>
                    <span><Heart size={11} /> {en.hpCurrent}/{en.hpMax}</span>
                    <span><Shield size={11} /> CA {en.ac}</span>
                  </div>
                  <HpBar cur={en.hpCurrent} max={en.hpMax} />
                </div>
                <button
                  className={`${styles.addBtn} ${styles.addBtnEnemy}`}
                  onClick={() => addCombatant({
                    key: 'en-' + en.id,
                    name: en.name,
                    initiative: en.initiative ?? '',
                    hpCurrent: en.hpCurrent,
                    hpMax: en.hpMax,
                    ac: en.ac,
                    type: 'enemy',
                  })}
                  disabled={inTracker('en-' + en.id)}
                >
                  <Plus size={13} />
                </button>
              </div>
            ))}
          </div>
        ))}

        {encounters.length === 0 && (
          <p className={styles.poolEmpty}>No hay encuentros en esta campaña. Añádelos desde la tab Encuentros.</p>
        )}
      </div>
    </div>
  )
}

// ── Roleplay mode ─────────────────────────────────────────────────────────────

function RoleplayMode({ campaign }: {
  campaign: Campaign
}) {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [openQuest, setOpenQuest] = useState<string | null>(null)

  const locations: CampaignLocation[] = campaign.locations ?? []
  const quests: CampaignQuest[] = campaign.quests ?? []
  const npcs: CampaignNPC[] = campaign.npcs ?? []
  const activeQuests = quests.filter((q) => q.status === 'active')
  const selectedLoc = locations.find((l) => l.id === selectedLocationId)
  const locNPCs = selectedLoc
    ? npcs.filter((n) => n.location && n.location.toLowerCase().includes(selectedLoc.name.toLowerCase()))
    : []

  const STATUS_COLOR: Record<string, string> = {
    unknown: '#888', known: '#4a90d9', explored: '#2e7d32', cleared: '#b8860b',
  }
  const STATUS_LABEL: Record<string, string> = {
    unknown: 'Desconocida', known: 'Conocida', explored: 'Explorada', cleared: 'Liberada',
  }
  const ROLE_COLOR: Record<string, string> = {
    ally: '#2e7d32', enemy: '#c62828', neutral: '#888', unknown: '#555',
  }
  const ROLE_LABEL: Record<string, string> = {
    ally: 'Aliado', enemy: 'Enemigo', neutral: 'Neutral', unknown: '?',
  }

  return (
    <div className={styles.roleplayLayout}>

      {/* ── Left: Locations + NPCs ── */}
      <div className={styles.roleplayPanel}>
        <h3 className={styles.panelTitle}><MapPin size={15} /> Ubicaciones</h3>
        {locations.length === 0
          ? <p className={styles.poolEmpty}>Sin ubicaciones registradas.</p>
          : locations.map((loc) => (
            <button
              key={loc.id}
              className={`${styles.locBtn} ${selectedLocationId === loc.id ? styles.locBtnActive : ''}`}
              onClick={() => setSelectedLocationId(loc.id === selectedLocationId ? null : loc.id)}
            >
              <span className={styles.locName}>{loc.name}</span>
              <span className={styles.locStatus} style={{ color: STATUS_COLOR[loc.status] }}>
                {STATUS_LABEL[loc.status]}
              </span>
            </button>
          ))
        }

        {selectedLoc && (
          <div className={styles.locDetail}>
            <p className={styles.locDesc}>{selectedLoc.description || <em>Sin descripción.</em>}</p>
            {selectedLoc.notes && <p className={styles.locNotes}><strong>Notas GM:</strong> {selectedLoc.notes}</p>}
            {locNPCs.length > 0 && (
              <>
                <div className={styles.locNPCTitle}><Users size={12} /> PNJs aquí</div>
                {locNPCs.map((n) => (
                  <div key={n.id} className={styles.npcMini}>
                    <span className={styles.npcMiniRole} style={{ color: ROLE_COLOR[n.role] }}>{ROLE_LABEL[n.role]}</span>
                    <span className={styles.npcMiniName}>{n.name}</span>
                    {n.motivation && <span className={styles.npcMiniMotivation}>"{n.motivation}"</span>}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Center: All NPCs ── */}
      <div className={styles.roleplayMain}>
        <h3 className={styles.panelTitle}><Users size={15} /> PNJs de la campaña</h3>
        {npcs.length === 0
          ? <p className={styles.poolEmpty}>Sin PNJs registrados.</p>
          : npcs.map((npc) => (
            <div key={npc.id} className={styles.npcCard}>
              <div className={styles.npcCardTop}>
                <span className={styles.npcCardName}>{npc.name}</span>
                <span className={styles.npcCardRole} style={{ background: ROLE_COLOR[npc.role] + '22', color: ROLE_COLOR[npc.role] }}>
                  {ROLE_LABEL[npc.role]}
                </span>
              </div>
              {npc.race && <span className={styles.npcCardSub}>{npc.race}{npc.location ? ` · ${npc.location}` : ''}</span>}
              {npc.appearance && <p className={styles.npcCardField}><strong>Apariencia:</strong> {npc.appearance}</p>}
              {npc.motivation && <p className={styles.npcCardField}><strong>Motivación:</strong> {npc.motivation}</p>}
              {npc.notes && <p className={styles.npcCardField}><strong>Notas:</strong> {npc.notes}</p>}
              {(npc.hp || npc.ac || npc.cr !== undefined) && (
                <div className={styles.npcCardStats}>
                  {npc.cr !== undefined && <span>CR {npc.cr}</span>}
                  {npc.hp && <span><Heart size={11} /> {npc.hp}</span>}
                  {npc.ac && <span><Shield size={11} /> CA {npc.ac}</span>}
                </div>
              )}
            </div>
          ))
        }
      </div>

      {/* ── Right: Quests ── */}
      <div className={styles.roleplayPanel}>
        <h3 className={styles.panelTitle}><Scroll size={15} /> Misiones activas</h3>
        {activeQuests.length === 0
          ? <p className={styles.poolEmpty}>No hay misiones activas.</p>
          : activeQuests.map((q) => (
            <div key={q.id} className={styles.questCard}>
              <button
                className={styles.questHeader}
                onClick={() => setOpenQuest(openQuest === q.id ? null : q.id)}
              >
                <span className={`${styles.questType} ${styles['questType_' + q.type]}`}>{q.type === 'main' ? 'Principal' : q.type === 'side' ? 'Secundaria' : 'Personal'}</span>
                <span className={styles.questTitle}>{q.title}</span>
                {openQuest === q.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {openQuest === q.id && (
                <div className={styles.questBody}>
                  {q.description && <p>{q.description}</p>}
                  {q.notes && <p className={styles.questNotes}>{q.notes}</p>}
                  {(q.xpReward || q.goldReward) && (
                    <div className={styles.questRewards}>
                      {q.xpReward && <span>🏆 {q.xpReward} XP</span>}
                      {q.goldReward && <span>💰 {q.goldReward} po</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        }

        <h3 className={styles.panelTitle} style={{ marginTop: 'var(--space-5)' }}>
          <Scroll size={15} /> Otras misiones
        </h3>
        {quests.filter((q) => q.status !== 'active').map((q) => (
          <div key={q.id} className={`${styles.questCard} ${styles.questCardDone}`}>
            <button
              className={styles.questHeader}
              onClick={() => setOpenQuest(openQuest === q.id ? null : q.id)}
            >
              <span className={styles.questStatusChip} style={{
                color: q.status === 'completed' ? '#2e7d32' : q.status === 'failed' ? '#c62828' : '#888'
              }}>
                {q.status === 'completed' ? '✓ Completada' : q.status === 'failed' ? '✗ Fallida' : '? Desconocida'}
              </span>
              <span className={styles.questTitle}>{q.title}</span>
              {openQuest === q.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {openQuest === q.id && q.description && (
              <div className={styles.questBody}><p>{q.description}</p></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function PartyView() {
  const { id } = useParams<{ id: string }>()
  const campaign = useCampaignStore((s) => s.getCampaign(id || '')) as Campaign | undefined
  const characters = useCharacterStore((s) => s.characters)
  const [mode, setMode] = useState<GmMode>('combat')
  const [refreshKey, setRefreshKey] = useState(0)

  if (!campaign) {
    return (
      <div className={styles.notFound}>
        <h2>Campaña no encontrada</h2>
        <Link to="/campaigns">Volver a Crónicas</Link>
      </div>
    )
  }

  const partyMembers = characters.filter((c) => campaign.characterIds.includes(c.id))
  const localChars = (campaign.campaignCharacters ?? []).filter((c) => c.inParty !== false)

  return (
    <div className={styles.page} key={refreshKey}>
      <header className={styles.header}>
        <Link to={`/campaigns/${campaign.id}`} className={styles.backLink}>
          <ArrowLeft size={18} />
          Volver a campaña
        </Link>
        <div className={styles.titleArea}>
          <div className={styles.titleIcon}>{mode === 'combat' ? <Sword size={18} /> : <Theater size={18} />}</div>
          <h1 className={styles.title}>{campaign.name}</h1>
          <span className={styles.subtitle}>Vista GM</span>
        </div>

        {/* Mode toggle */}
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${mode === 'combat' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('combat')}
          >
            <Sword size={15} /> Combate
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'roleplay' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('roleplay')}
          >
            <Theater size={15} /> Roleplay
          </button>
        </div>

        <button className={styles.refreshBtn} onClick={() => setRefreshKey((k) => k + 1)} title="Actualizar datos">
          <RefreshCw size={16} />
        </button>
      </header>

      {mode === 'combat' && (
        <CombatMode
          campaign={campaign}
          partyMembers={partyMembers}
          localChars={localChars}
        />
      )}
      {mode === 'roleplay' && (
        <RoleplayMode campaign={campaign} />
      )}
    </div>
  )
}
