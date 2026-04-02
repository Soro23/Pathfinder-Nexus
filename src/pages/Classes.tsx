import { useState } from 'react'
import { Shield, ChevronDown, ChevronUp } from 'lucide-react'
import { CLASSES, getBABForLevel, getSaveForLevel } from '../data/classes'
import styles from './Classes.module.css'
import mobile from '../styles/compendiumMobile.module.css'

const ABILITY_ABBR: Record<string, string> = {
  strength: 'FUE', dexterity: 'DES', constitution: 'CON',
  intelligence: 'INT', wisdom: 'SAB', charisma: 'CAR',
}
const BAB_LABEL: Record<string, string> = {
  good: 'Bueno (+1/nv)', medium: 'Medio (+3/4 nv)', poor: 'Bajo (+1/2 nv)',
}
const SAVE_LABEL: Record<string, string> = { good: 'Buena', poor: 'Baja' }

const LEVELS = Array.from({ length: 20 }, (_, i) => i + 1)

const SOURCE_LABEL: Record<string, string> = {
  core: 'Libro Básico',
  apg: 'APG',
  acg: 'ACG',
  other: 'Otros',
}

function sortedByName(arr: typeof CLASSES) {
  return [...arr].sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

const GROUPED_CLASSES = [
  { key: 'core',  label: SOURCE_LABEL.core,  classes: sortedByName(CLASSES.filter(c => c.source === 'core')) },
  { key: 'apg',   label: SOURCE_LABEL.apg,   classes: sortedByName(CLASSES.filter(c => c.source === 'apg')) },
  { key: 'acg',   label: SOURCE_LABEL.acg,   classes: sortedByName(CLASSES.filter(c => c.source === 'acg')) },
  { key: 'other', label: SOURCE_LABEL.other, classes: sortedByName(CLASSES.filter(c => c.source === 'other')) },
].filter(g => g.classes.length > 0)

function ProgressionTable({ cls }: { cls: typeof CLASSES[0] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={styles.cardSection}>
      <button className={styles.collapseBtn} onClick={() => setOpen(v => !v)}>
        <span className={styles.sectionTitle}>Progresión BBA y Tiradas</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div className={styles.tableWrap}>
          <table className={styles.progTable}>
            <thead>
              <tr>
                <th>Nv</th>
                <th>BBA</th>
                <th>Fort.</th>
                <th>Reflejos</th>
                <th>Voluntad</th>
              </tr>
            </thead>
            <tbody>
              {LEVELS.map(lv => (
                <tr key={lv}>
                  <td className={styles.progLv}>{lv}</td>
                  <td>+{getBABForLevel(lv, cls.baseAttackBonus)}</td>
                  <td>+{getSaveForLevel(lv, cls.fortitudeSave)}</td>
                  <td>+{getSaveForLevel(lv, cls.reflexSave)}</td>
                  <td>+{getSaveForLevel(lv, cls.willSave)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SpellsTable({ cls }: { cls: typeof CLASSES[0] }) {
  if (!cls.spellsPerDay) return null
  const table = cls.spellsPerDay
  // Find max spell level across all character levels
  const maxSpellLv = table.reduce((max, row) => Math.max(max, row.length - 1), 0)
  const spellCols = Array.from({ length: maxSpellLv + 1 }, (_, i) => i)
  // Check if there are any non-empty rows
  const hasAny = table.some(row => row.length > 0)
  if (!hasAny) return null

  return (
    <div className={styles.cardSection}>
      <p className={styles.sectionTitle}>Conjuros por Día</p>
      <div className={styles.tableWrap}>
        <table className={styles.spellTable}>
          <thead>
            <tr>
              <th>Nv</th>
              {spellCols.map(sl => <th key={sl}>{sl}º</th>)}
            </tr>
          </thead>
          <tbody>
            {table.map((row, idx) => (
              <tr key={idx}>
                <td className={styles.progLv}>{idx + 1}</td>
                {spellCols.map(sl => (
                  <td key={sl}>{row[sl] !== undefined ? row[sl] : '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Classes() {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile select nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <Shield size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            defaultValue=""
            onChange={e => { scrollTo(e.target.value); (e.target as HTMLSelectElement).value = '' }}
          >
            <option value="" disabled>Ir a clase…</option>
            {GROUPED_CLASSES.map(g => (
              <optgroup key={g.key} label={g.label}>
                {g.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
            ))}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left nav ── */}
      <nav className={styles.sideNav}>
        <div className={styles.sideNavInner}>
          <p className={styles.navTitle}>Clases</p>
          <div className={styles.navList}>
            {GROUPED_CLASSES.map(g => (
              <div key={g.key} className={styles.navGroup}>
                <span className={styles.navGroupLabel}>{g.label}</span>
                {g.classes.map(c => (
                  <button key={c.id} className={styles.navBtn} onClick={() => scrollTo(c.id)}>
                    {c.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className={styles.content}>
        <header className={styles.pageHeader}>
          <Shield size={28} className={styles.headerIcon} />
          <div>
            <h1>Clases</h1>
            <p className={styles.subtitle}>Todas las clases base de Pathfinder</p>
          </div>
        </header>

        <div className={styles.classList}>
          {GROUPED_CLASSES.map(g => (
            <div key={g.key} className={styles.sourceGroup}>
              <div className={styles.sourceHeader}>
                <span className={styles.sourceLabel}>{g.label}</span>
              </div>
              {g.classes.map(cls => (
            <div key={cls.id} id={cls.id} className={styles.classCard}>

              {/* Card header */}
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleRow}>
                  <h2 className={styles.className}>{cls.name}</h2>
                  <span className={styles.hitDieBadge}>d{cls.hitDie}</span>
                </div>
                <p className={styles.classDesc}>{cls.description}</p>
              </div>

              {/* Stats row */}
              <div className={styles.statsRow}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>BBA</span>
                  <span className={styles.statVal}>{BAB_LABEL[cls.baseAttackBonus]}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Fortaleza</span>
                  <span className={styles.statVal}>{SAVE_LABEL[cls.fortitudeSave]}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Reflejos</span>
                  <span className={styles.statVal}>{SAVE_LABEL[cls.reflexSave]}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Voluntad</span>
                  <span className={styles.statVal}>{SAVE_LABEL[cls.willSave]}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Hab./nivel</span>
                  <span className={styles.statVal}>{cls.skillPointsPerLevel} + INT</span>
                </div>
                {cls.casterAbility && (
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Magia</span>
                    <span className={styles.statVal}>{ABILITY_ABBR[cls.casterAbility]}</span>
                  </div>
                )}
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Oro inicial</span>
                  <span className={styles.statVal}>{cls.startingGoldDice} po</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Alineamiento</span>
                  <span className={styles.statVal}>{cls.alignment.join(', ')}</span>
                </div>
              </div>

              {/* Proficiencies */}
              {cls.proficiencies && (
                <div className={styles.cardSection}>
                  <p className={styles.sectionTitle}>Competencias</p>
                  <div className={styles.proficiencies}>
                    <div className={styles.profRow}>
                      <span className={styles.profLabel}>Armas</span>
                      <span className={styles.profVal}>{cls.proficiencies.weapons}</span>
                    </div>
                    <div className={styles.profRow}>
                      <span className={styles.profLabel}>Armadura</span>
                      <span className={styles.profVal}>{cls.proficiencies.armor}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className={styles.cardSection}>
                <p className={styles.sectionTitle}>Características de Clase</p>
                <div className={styles.featureTable}>
                  {cls.features.map(f => (
                    <div key={`${f.name}-${f.level}`} className={styles.featureRow}>
                      <span className={styles.featureLevel}>Nv {f.level}</span>
                      <div className={styles.featureBody}>
                        <span className={styles.featureName}>{f.name}</span>
                        <span className={styles.featureDesc}>{f.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Class skills */}
              <div className={styles.cardSection}>
                <p className={styles.sectionTitle}>Habilidades de Clase</p>
                <div className={styles.skillPills}>
                  {cls.classSkills.map(s => (
                    <span key={s} className={styles.skillPill}>{s.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              </div>

              {/* Spells per day */}
              <SpellsTable cls={cls} />

              {/* Progression table (collapsible) */}
              <ProgressionTable cls={cls} />

            </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
