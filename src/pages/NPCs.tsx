import { useEffect, useState } from 'react'
import { Users, ChevronDown, ChevronUp, Shield } from 'lucide-react'
import { useSRDStore } from '../store/srdStore'
import type { NPC } from '../store/srdStore'
import { usePageTransition } from '../hooks/usePageTransition'
import { formatCR } from '../lib/formatCR'
import styles from './NPCs.module.css'
import mobile from '../styles/compendiumMobile.module.css'

// ── CR grouping ────────────────────────────────────────────────────────────
// Los grupos filtran sobre el valor numérico de `cr` (0.17, 0.25, 0.33, 0.5, 1, 2…),
// nunca sobre el string formateado — así los 111 NPCs con CR fraccionario (< 1)
// entran en su propio grupo en vez de quedar excluidos.

const CR_GROUPS = [
  { key: 'cr-fraction', label: 'CR < 1',    min: 0,   max: 1 - Number.EPSILON },
  { key: 'cr1-5',       label: 'CR 1–5',    min: 1,   max: 5   },
  { key: 'cr6-10',      label: 'CR 6–10',   min: 6,   max: 10  },
  { key: 'cr11-15',     label: 'CR 11–15',  min: 11,  max: 15  },
  { key: 'cr16-20',     label: 'CR 16–20',  min: 16,  max: 20  },
  { key: 'cr21-25',     label: 'CR 21–25',  min: 21,  max: 25  },
  { key: 'cr26',        label: 'CR 26+',    min: 26,  max: 999 },
]

function crBadgeClass(cr: number): string {
  if (cr <= 5)  return styles.crGreen
  if (cr <= 10) return styles.crYellow
  if (cr <= 15) return styles.crOrange
  if (cr <= 20) return styles.crRed
  return styles.crPurple
}

function modifier(score: number | undefined | null): string {
  if (score == null) return '—'
  const mod = Math.floor((score - 10) / 2)
  return mod >= 0 ? `+${mod}` : `${mod}`
}

// ── NPC card sub-components ────────────────────────────────────────────────

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={styles.cardSection}>
      <button className={styles.collapseBtn} onClick={() => setOpen(v => !v)}>
        <span className={styles.sectionTitle}>{title}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && children}
    </div>
  )
}

function NPCCard({ npc }: { npc: NPC }) {
  const { defense: def, offense: off, statistics: stat } = npc

  const abilityScores = [
    { label: 'FUE', score: stat.str },
    { label: 'DES', score: stat.dex },
    { label: 'CON', score: stat.con },
    { label: 'INT', score: stat.int },
    { label: 'SAB', score: stat.wis },
    { label: 'CAR', score: stat.cha },
  ]

  return (
    <div id={npc.id} className={styles.npcCard}>
      {/* ── Header ── */}
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <span className={styles.npcName}>{npc.name}</span>
          <div className={styles.badges}>
            <span className={`${styles.crBadge} ${crBadgeClass(npc.cr)}`}>CR {formatCR(npc.cr)}</span>
            {npc.xp != null && (
              <span className={styles.xpBadge}>{npc.xp.toLocaleString()} XP</span>
            )}
          </div>
        </div>
        <div className={styles.metaRow}>
          {npc.alignment && <span className={styles.metaTag}>{npc.alignment}</span>}
          {npc.size && <span className={styles.metaTag}>{npc.size}</span>}
          {npc.creatureType && <span className={styles.metaTag}>{npc.creatureType}</span>}
          {npc.race && <span className={styles.metaTag}>{npc.race}</span>}
        </div>
        {npc.classes && <div className={styles.classLine}>{npc.classes}</div>}
        {npc.aura && <div className={styles.auraLine}>Aura: {npc.aura}</div>}
      </div>

      {/* ── Init & Senses row ── */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Iniciativa</span>
          <span className={styles.statVal}>{npc.init >= 0 ? `+${npc.init}` : npc.init}</span>
        </div>
        {npc.senses.perception && (
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Percepción</span>
            <span className={styles.statVal}>{npc.senses.perception}</span>
          </div>
        )}
        {npc.senses.darkvision && (
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Visión oscura</span>
            <span className={styles.statVal}>{npc.senses.darkvision}</span>
          </div>
        )}
        {off.speed && (
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Velocidad</span>
            <span className={styles.statVal}>{off.speed}</span>
          </div>
        )}
      </div>

      {/* ── Defense ── */}
      {(def.ac != null || def.hp != null) && (
        <div className={styles.cardSection}>
          <div className={styles.sectionTitle}>Defensa</div>
          <div className={styles.defenseGrid}>
            {def.ac != null && (
              <div className={styles.defItem}>
                <span className={styles.defLabel}>CA</span>
                <span className={styles.defVal}>{def.ac}</span>
                {(def.touchAc != null || def.flatFootedAc != null) && (
                  <span className={styles.defSub}>
                    toque {def.touchAc ?? '—'} · sorprendido {def.flatFootedAc ?? '—'}
                  </span>
                )}
              </div>
            )}
            {def.hp != null && (
              <div className={styles.defItem}>
                <span className={styles.defLabel}>PG</span>
                <span className={styles.defVal}>{def.hp}</span>
                {def.hpFormula && <span className={styles.defSub}>{def.hpFormula}</span>}
              </div>
            )}
            {(def.fort != null || def.ref != null || def.will != null) && (
              <div className={styles.defItem}>
                <span className={styles.defLabel}>Tiradas de salvación</span>
                <span className={styles.defVal}>
                  Fort {def.fort != null ? (def.fort >= 0 ? `+${def.fort}` : def.fort) : '—'}{' '}
                  · Ref {def.ref != null ? (def.ref >= 0 ? `+${def.ref}` : def.ref) : '—'}{' '}
                  · Vol {def.will != null ? (def.will >= 0 ? `+${def.will}` : def.will) : '—'}
                </span>
                {def.saveNotes && <span className={styles.defSub}>{def.saveNotes}</span>}
              </div>
            )}
            {def.dr && (
              <div className={styles.defItem}>
                <span className={styles.defLabel}>RD</span>
                <span className={styles.defVal}>{def.dr}</span>
              </div>
            )}
            {def.resistances && (
              <div className={styles.defItem}>
                <span className={styles.defLabel}>Resistencias</span>
                <span className={styles.defVal}>{def.resistances}</span>
              </div>
            )}
          </div>
          {def.acDetails && <p className={styles.noteText}>{def.acDetails}</p>}
          {def.defensiveAbilities && (
            <p className={styles.noteText}><strong>Capacidades defensivas:</strong> {def.defensiveAbilities}</p>
          )}
        </div>
      )}

      {/* ── Offense ── */}
      {(off.melee || off.ranged || off.specialAttacks) && (
        <div className={styles.cardSection}>
          <div className={styles.sectionTitle}>Ataque</div>
          <div className={styles.offenseBlock}>
            {off.melee && (
              <div className={styles.attackRow}>
                <span className={styles.attackLabel}>Cuerpo a cuerpo</span>
                <span className={styles.attackVal}>{off.melee}</span>
              </div>
            )}
            {off.ranged && (
              <div className={styles.attackRow}>
                <span className={styles.attackLabel}>A distancia</span>
                <span className={styles.attackVal}>{off.ranged}</span>
              </div>
            )}
            {off.specialAttacks && (
              <div className={styles.attackRow}>
                <span className={styles.attackLabel}>Ataques especiales</span>
                <span className={styles.attackVal}>{off.specialAttacks}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Spells (collapsible) ── */}
      {(off.spellLikeAbilities || off.spellsPrepared) && (
        <CollapsibleSection title="Magia">
          <div className={styles.offenseBlock}>
            {off.spellLikeAbilities && (
              <div className={styles.attackRow}>
                <span className={styles.attackLabel}>Habilidades mágicas</span>
                <span className={styles.attackVal}>{off.spellLikeAbilities}</span>
              </div>
            )}
            {off.spellsPrepared && (
              <div className={styles.attackRow}>
                <span className={styles.attackLabel}>Conjuros preparados</span>
                <span className={styles.attackVal}>{off.spellsPrepared}</span>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* ── Ability scores ── */}
      {abilityScores.some(a => a.score != null) && (
        <div className={styles.cardSection}>
          <div className={styles.sectionTitle}>Características</div>
          <div className={styles.abilityGrid}>
            {abilityScores.map(({ label, score }) => (
              <div key={label} className={styles.abilityItem}>
                <span className={styles.abilityLabel}>{label}</span>
                <span className={styles.abilityScore}>{score ?? '—'}</span>
                <span className={styles.abilityMod}>{modifier(score)}</span>
              </div>
            ))}
          </div>
          {(stat.bab != null || stat.cmb != null || stat.cmd != null) && (
            <div className={styles.combatRow}>
              {stat.bab != null && (
                <span className={styles.combatItem}>
                  <span className={styles.combatLabel}>BBA</span>{' '}
                  <span className={styles.combatVal}>+{stat.bab}</span>
                </span>
              )}
              {stat.cmb != null && (
                <span className={styles.combatItem}>
                  <span className={styles.combatLabel}>CMB</span>{' '}
                  <span className={styles.combatVal}>+{stat.cmb}</span>
                </span>
              )}
              {stat.cmd != null && (
                <span className={styles.combatItem}>
                  <span className={styles.combatLabel}>CMD</span>{' '}
                  <span className={styles.combatVal}>{stat.cmd}</span>
                  {stat.cmdNotes && <span className={styles.cmdNote}> ({stat.cmdNotes})</span>}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Skills & Feats ── */}
      {(stat.skillsList || stat.feats || stat.languages || stat.traits || stat.sq) && (
        <CollapsibleSection title="Habilidades, Dotes y Rasgos">
          <div className={styles.offenseBlock}>
            {stat.skillsList && (
              <div className={styles.attackRow}>
                <span className={styles.attackLabel}>Habilidades</span>
                <span className={styles.attackVal}>{stat.skillsList}</span>
              </div>
            )}
            {stat.feats && (
              <div className={styles.attackRow}>
                <span className={styles.attackLabel}>Dotes</span>
                <span className={styles.attackVal}>{stat.feats}</span>
              </div>
            )}
            {stat.traits && (
              <div className={styles.attackRow}>
                <span className={styles.attackLabel}>Rasgos</span>
                <span className={styles.attackVal}>{stat.traits}</span>
              </div>
            )}
            {stat.languages && (
              <div className={styles.attackRow}>
                <span className={styles.attackLabel}>Idiomas</span>
                <span className={styles.attackVal}>{stat.languages}</span>
              </div>
            )}
            {stat.sq && (
              <div className={styles.attackRow}>
                <span className={styles.attackLabel}>Cualidades especiales</span>
                <span className={styles.attackVal}>{stat.sq}</span>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* ── Gear (collapsible) ── */}
      {npc.gear.length > 0 && (
        <CollapsibleSection title="Equipo">
          <ul className={styles.gearList}>
            {npc.gear.map((item, i) => (
              <li key={i} className={styles.gearItem}>{item}</li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* ── Description ── */}
      {npc.description && (
        <div className={styles.cardSection}>
          <p className={styles.descText}>{npc.description}</p>
        </div>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

export function NPCs() {
  const npcs = useSRDStore(s => s.npcs ?? [])
  const initialized = useSRDStore(s => s.npcsInitialized)
  const fetchNpcs = useSRDStore(s => s.fetchNpcs)
  useEffect(() => { if (!initialized) fetchNpcs() }, [initialized, fetchNpcs])
  const { isLoading } = usePageTransition(initialized)

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // Build groups that have at least one NPC
  const groupedNPCs = CR_GROUPS.map(g => ({
    ...g,
    npcs: [...npcs]
      .filter(n => n.cr >= g.min && n.cr <= g.max)
      .sort((a, b) => a.cr - b.cr || a.name.localeCompare(b.name, 'es')),
  })).filter(g => g.npcs.length > 0)

  const displayGroups = selectedGroup
    ? groupedNPCs.filter(g => g.key === selectedGroup)
    : groupedNPCs

  const flatNPCs = displayGroups.flatMap(g => g.npcs.map(npc => ({ npc, groupKey: g.key, groupLabel: g.label })))
  const totalPages = Math.max(1, Math.ceil(flatNPCs.length / PAGE_SIZE))
  const pagedNPCs = flatNPCs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reagrupa la página actual en tramos consecutivos del mismo CR para
  // mostrar una única cabecera por grupo, igual que en la vista sin paginar.
  const pagedGroups: { key: string; label: string; npcs: NPC[] }[] = []
  for (const { npc, groupKey, groupLabel } of pagedNPCs) {
    const last = pagedGroups[pagedGroups.length - 1]
    if (last && last.key === groupKey) last.npcs.push(npc)
    else pagedGroups.push({ key: groupKey, label: groupLabel, npcs: [npc] })
  }

  const resetPage = () => setPage(1)

  const handleGroupChange = (group: string | null) => {
    setSelectedGroup(group)
    resetPage()
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.pageLayout}>
      {/* ── Sidebar nav ── */}
      <aside className={styles.sideNav}>
        <div className={styles.sideNavInner}>
          <div className={styles.navTitle}>Filtrar por CR</div>
          <div className={styles.navFilterList}>
            <button
              className={`${styles.navFilterBtn} ${selectedGroup === null ? styles.navFilterBtnActive : ''}`}
              onClick={() => handleGroupChange(null)}
            >
              <span>Todos</span>
              <span className={styles.navFilterCount}>{npcs.length}</span>
            </button>
            {groupedNPCs.map(group => (
              <button
                key={group.key}
                className={`${styles.navFilterBtn} ${selectedGroup === group.key ? styles.navFilterBtnActive : ''}`}
                onClick={() => handleGroupChange(group.key)}
              >
                <span>{group.label}</span>
                <span className={styles.navFilterCount}>{group.npcs.length}</span>
              </button>
            ))}
          </div>

          <div className={styles.navTitle}>NPCs</div>
          <div className={styles.navList}>
            {displayGroups.map(group => (
              <div key={group.key} className={styles.navGroup}>
                <div className={styles.navGroupLabel}>{group.label}</div>
                {group.npcs.map(npc => (
                  <button
                    key={npc.id}
                    className={styles.navBtn}
                    onClick={() => scrollTo(npc.id)}
                  >
                    {npc.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className={styles.content}>
        {/* Mobile category bar */}
        <div className={mobile.mobileCatBar}>
          <div className={mobile.mobileCatSelectWrap}>
            <Shield size={16} className={mobile.mobileCatIcon} />
            <select
              className={mobile.mobileCatSelect}
              value={selectedGroup ?? ''}
              onChange={e => handleGroupChange(e.target.value || null)}
            >
              <option value="">Todos los CR</option>
              {groupedNPCs.map(g => (
                <option key={g.key} value={g.key}>{g.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className={mobile.mobileCatChevron} />
          </div>
        </div>

        {/* Page header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerIcon}>
            <Users size={32} />
          </div>
          <div>
            <h1>NPCs</h1>
            <p className={styles.subtitle}>Personajes no jugadores para tus aventuras</p>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.loader} />
            <p>Cargando NPCs...</p>
          </div>
        ) : (
        <>
        {npcs.length === 0 && (
          <p className={styles.emptyText}>No hay NPCs disponibles aún.</p>
        )}

        {npcs.length > 0 && (
          <div className={styles.resultsAndPagination}>
            <p className={styles.resultsCount}>
              {flatNPCs.length} NPC{flatNPCs.length !== 1 ? 's' : ''} encontrado{flatNPCs.length !== 1 ? 's' : ''}
            </p>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationBtn}
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </button>
                <span className={styles.paginationInfo}>
                  Página {page} de {totalPages}
                </span>
                <button
                  className={styles.paginationBtn}
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}

        <div className={styles.npcList}>
          {pagedGroups.map((group, i) => (
            <div key={`${group.key}-${i}`} className={styles.crGroup}>
              <div className={styles.groupHeader}>
                <span className={styles.groupLabel}>{group.label}</span>
              </div>
              {group.npcs.map(npc => (
                <NPCCard key={npc.id} npc={npc} />
              ))}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Anterior
            </button>
            <span className={styles.paginationInfo}>
              Página {page} de {totalPages}
            </span>
            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}
