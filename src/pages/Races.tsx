import { useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { useSRDStore } from '../store/srdStore'
import styles from './Classes.module.css'
import mobile from '../styles/compendiumMobile.module.css'

const ABILITY_ABBR: Record<string, string> = {
  strength: 'FUE', dexterity: 'DES', constitution: 'CON',
  intelligence: 'INT', wisdom: 'SAB', charisma: 'CAR',
}

export function Races() {
  const races = useSRDStore(s => s.races)
  const fetchAll = useSRDStore(s => s.fetchAll)

  useEffect(() => { fetchAll() }, [fetchAll])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile select nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <Globe size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            defaultValue=""
            onChange={e => { scrollTo(e.target.value); (e.target as HTMLSelectElement).value = '' }}
          >
            <option value="" disabled>Ir a raza…</option>
            {races.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left nav ── */}
      <nav className={styles.sideNav}>
        <div className={styles.sideNavInner}>
          <p className={styles.navTitle}>Razas</p>
          <div className={styles.navList}>
            {races.map(r => (
              <button key={r.id} className={styles.navBtn} onClick={() => scrollTo(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className={styles.content}>
        <header className={styles.pageHeader}>
          <Globe size={28} className={styles.headerIcon} />
          <div>
            <h1>Razas</h1>
            <p className={styles.subtitle}>Todas las razas base de Pathfinder</p>
          </div>
        </header>

        <div className={styles.classList}>
          {races.map(race => (
            <div key={race.id} id={race.id} className={styles.classCard}>

              {/* Card header */}
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleRow}>
                  <h2 className={styles.className}>{race.label}</h2>
                  <div className={styles.raceMeta}>
                    <span className={styles.raceTag}>{race.size === 'small' ? 'Pequeño' : 'Mediano'}</span>
                    <span className={styles.raceTag}>{race.speed} pies</span>
                  </div>
                </div>
                <p className={styles.classDesc}>{race.desc}</p>
              </div>

              {/* Stats row */}
              <div className={styles.statsRow}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Bonificadores</span>
                  <span className={styles.statVal}>{race.bonusDesc}</span>
                </div>
                {race.favoredClass && (
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Clase Favorita</span>
                    <span className={styles.statVal}>{race.favoredClass === 'any' ? 'Cualquiera' : race.favoredClass}</span>
                  </div>
                )}
              </div>

              {/* Racial traits */}
              <div className={styles.cardSection}>
                <p className={styles.sectionTitle}>Rasgos Raciales</p>
                <div className={styles.featureTable}>
                  {race.traits.map(t => (
                    <div key={t.name} className={styles.featureRow}>
                      <div className={styles.featureBody}>
                        <span className={styles.featureName}>{t.name}</span>
                        <span className={styles.featureDesc}>{t.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subraces */}
              {race.subraces && race.subraces.length > 0 && (
                <div className={styles.cardSection}>
                  <p className={styles.sectionTitle}>Subrazas</p>
                  <div className={styles.subraceGrid}>
                    {race.subraces.map(sub => (
                      <div key={sub.id} className={styles.subraceCard}>
                        <p className={styles.subraceName}>{sub.label}</p>
                        <p className={styles.subraceBonus}>
                          {Object.entries(sub.bonuses)
                            .map(([k, v]) => `${v! > 0 ? '+' : ''}${v} ${ABILITY_ABBR[k] ?? k}`)
                            .join(', ')}
                        </p>
                        {sub.traits.map(t => (
                          <p key={t.name} className={styles.subraceTraitRow}>
                            <strong>{t.name}: </strong>{t.description}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
