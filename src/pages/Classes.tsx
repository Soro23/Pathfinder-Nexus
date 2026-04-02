import { Shield, ChevronDown } from 'lucide-react'
import { CLASSES } from '../data/classes'
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
            {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left nav ── */}
      <nav className={styles.sideNav}>
        <div className={styles.sideNavInner}>
          <p className={styles.navTitle}>Clases</p>
          <div className={styles.navList}>
            {CLASSES.map(c => (
              <button key={c.id} className={styles.navBtn} onClick={() => scrollTo(c.id)}>
                {c.name}
              </button>
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
          {CLASSES.map(cls => (
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
              </div>

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

            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
