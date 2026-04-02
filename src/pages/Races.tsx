import { useState } from 'react'
import { Globe, ChevronDown, ChevronUp, Star } from 'lucide-react'
import { RACES } from '../data/races'
import { Card } from '../components/ui'
import styles from './Compendium.module.css'
import mobile from '../styles/compendiumMobile.module.css'

const ABILITY_ABBR: Record<string, string> = {
  strength: 'FUE', dexterity: 'DES', constitution: 'CON',
  intelligence: 'INT', wisdom: 'SAB', charisma: 'CAR',
}

export function Races() {
  const [selected, setSelected] = useState(RACES[0].id)
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)

  const race = RACES.find(r => r.id === selected) ?? RACES[0]

  function toggleFeature(key: string) {
    setExpandedFeature(prev => prev === key ? null : key)
  }

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile sticky nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <Globe size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            value={selected}
            onChange={e => { setSelected(e.target.value); setExpandedFeature(null) }}
          >
            {RACES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left nav ── */}
      <nav className={styles.leftNav}>
        <div className={styles.leftNavInner}>
          <p className={styles.navTitle}>Razas</p>
          <div className={styles.navList}>
            {RACES.map(r => (
              <button
                key={r.id}
                className={`${styles.navBtn} ${selected === r.id ? styles.navBtnActive : ''}`}
                onClick={() => { setSelected(r.id); setExpandedFeature(null) }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className={styles.content}>
        <div className={styles.detailView}>
          <div className={styles.detailHeader}>
            <div>
              <h1 className={styles.detailTitle}>{race.label}</h1>
              <p className={styles.detailDesc}>{race.desc}</p>
            </div>
            <div className={styles.raceBadge}>
              <span>{race.size === 'small' ? 'Pequeño' : 'Mediano'}</span>
              <span>{race.speed} pies</span>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Bonificadores</span>
              <span className={styles.statValue}>{race.bonusDesc}</span>
            </div>
            {race.favoredClass && (
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Clase Favorita</span>
                <span className={styles.statValue}>{race.favoredClass === 'any' ? 'Cualquiera' : race.favoredClass}</span>
              </div>
            )}
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Tamaño</span>
              <span className={styles.statValue}>{race.size === 'small' ? 'Pequeño' : 'Mediano'}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Velocidad Base</span>
              <span className={styles.statValue}>{race.speed} pies</span>
            </div>
          </div>

          <Card padding="md">
            <h2 className={styles.sectionTitle}>Rasgos Raciales</h2>
            <div className={styles.featureList}>
              {race.traits.map((t) => {
                const key = `${race.id}-${t.name}`
                const expanded = expandedFeature === key
                return (
                  <div key={key} className={styles.featureRow}>
                    <button className={styles.featureHeader} onClick={() => toggleFeature(key)}>
                      <Star size={12} className={styles.traitIcon} />
                      <span className={styles.featureName}>{t.name}</span>
                      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {expanded && <p className={styles.featureDesc}>{t.description}</p>}
                  </div>
                )
              })}
            </div>
          </Card>

          {race.subraces && race.subraces.length > 0 && (
            <Card padding="md">
              <h2 className={styles.sectionTitle}>Subrazas</h2>
              <div className={styles.subraceList}>
                {race.subraces.map(sub => (
                  <div key={sub.id} className={styles.subraceCard}>
                    <h3 className={styles.subraceName}>{sub.label}</h3>
                    <p className={styles.subraceBonus}>
                      {Object.entries(sub.bonuses)
                        .map(([k, v]) => `${v! > 0 ? '+' : ''}${v} ${ABILITY_ABBR[k] ?? k}`)
                        .join(', ')}
                    </p>
                    <ul className={styles.subraceTraits}>
                      {sub.traits.map(t => (
                        <li key={t.name}>
                          <strong>{t.name}:</strong> {t.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
