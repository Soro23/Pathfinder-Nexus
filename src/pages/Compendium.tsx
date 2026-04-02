import { useState } from 'react'
import { Shield, Globe, ChevronDown, ChevronUp, Star } from 'lucide-react'
import { CLASSES } from '../data/classes'
import { RACES } from '../data/races'
import { Card } from '../components/ui'
import styles from './Compendium.module.css'
import mobile from '../styles/compendiumMobile.module.css'

type Section = 'classes' | 'races'

const ABILITY_ABBR: Record<string, string> = {
  strength: 'FUE', dexterity: 'DES', constitution: 'CON',
  intelligence: 'INT', wisdom: 'SAB', charisma: 'CAR',
}

const BAB_LABEL: Record<string, string> = { good: 'Bueno (+1/nivel)', medium: 'Medio (+3/4 nivel)', poor: 'Bajo (+1/2 nivel)' }
const SAVE_LABEL: Record<string, string> = { good: 'Buena', poor: 'Baja' }

export function Compendium() {
  const [section, setSection] = useState<Section>('classes')
  const [selectedClass, setSelectedClass] = useState(CLASSES[0].id)
  const [selectedRace, setSelectedRace] = useState(RACES[0].id)
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)

  const cls = CLASSES.find(c => c.id === selectedClass) ?? CLASSES[0]
  const race = RACES.find(r => r.id === selectedRace) ?? RACES[0]

  function toggleFeature(key: string) {
    setExpandedFeature(prev => prev === key ? null : key)
  }

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile sticky nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          {section === 'classes' ? <Shield size={15} className={mobile.mobileCatIcon} /> : <Globe size={15} className={mobile.mobileCatIcon} />}
          <select
            className={mobile.mobileCatSelect}
            value={section === 'classes' ? selectedClass : selectedRace}
            onChange={e => {
              if (section === 'classes') setSelectedClass(e.target.value)
              else setSelectedRace(e.target.value)
            }}
          >
            {section === 'classes'
              ? CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
              : RACES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)
            }
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left nav ── */}
      <nav className={styles.leftNav}>
        <div className={styles.leftNavInner}>
          {/* Section toggle */}
          <div className={styles.sectionToggle}>
            <button
              className={`${styles.sectionBtn} ${section === 'classes' ? styles.sectionBtnActive : ''}`}
              onClick={() => setSection('classes')}
            >
              <Shield size={14} /> Clases
            </button>
            <button
              className={`${styles.sectionBtn} ${section === 'races' ? styles.sectionBtnActive : ''}`}
              onClick={() => setSection('races')}
            >
              <Globe size={14} /> Razas
            </button>
          </div>

          <div className={styles.navList}>
            {section === 'classes'
              ? CLASSES.map(c => (
                  <button
                    key={c.id}
                    className={`${styles.navBtn} ${selectedClass === c.id ? styles.navBtnActive : ''}`}
                    onClick={() => setSelectedClass(c.id)}
                  >
                    {c.name}
                  </button>
                ))
              : RACES.map(r => (
                  <button
                    key={r.id}
                    className={`${styles.navBtn} ${selectedRace === r.id ? styles.navBtnActive : ''}`}
                    onClick={() => setSelectedRace(r.id)}
                  >
                    {r.label}
                  </button>
                ))
            }
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className={styles.content}>

        {section === 'classes' && (
          <div className={styles.detailView}>
            {/* Header */}
            <div className={styles.detailHeader}>
              <div>
                <h1 className={styles.detailTitle}>{cls.name}</h1>
                <p className={styles.detailDesc}>{cls.description}</p>
              </div>
              <div className={styles.hitDieBadge}>d{cls.hitDie}</div>
            </div>

            {/* Stats row */}
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>BBA</span>
                <span className={styles.statValue}>{BAB_LABEL[cls.baseAttackBonus]}</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Puntos de Hab.</span>
                <span className={styles.statValue}>{cls.skillPointsPerLevel} + INT/nivel</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Fortaleza</span>
                <span className={styles.statValue}>{SAVE_LABEL[cls.fortitudeSave]}</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Reflejos</span>
                <span className={styles.statValue}>{SAVE_LABEL[cls.reflexSave]}</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Voluntad</span>
                <span className={styles.statValue}>{SAVE_LABEL[cls.willSave]}</span>
              </div>
              {cls.casterAbility && (
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Magia</span>
                  <span className={styles.statValue}>{ABILITY_ABBR[cls.casterAbility]} — {cls.magicType}</span>
                </div>
              )}
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Alineamiento</span>
                <span className={styles.statValue}>{cls.alignment.join(', ')}</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Oro inicial</span>
                <span className={styles.statValue}>{cls.startingGoldDice} po</span>
              </div>
            </div>

            {/* Class features */}
            <Card padding="md">
              <h2 className={styles.sectionTitle}>Características de Clase</h2>
              <div className={styles.featureList}>
                {cls.features.map((f) => {
                  const key = `${cls.id}-${f.name}-${f.level}`
                  const expanded = expandedFeature === key
                  return (
                    <div key={key} className={styles.featureRow}>
                      <button
                        className={styles.featureHeader}
                        onClick={() => toggleFeature(key)}
                      >
                        <span className={styles.featureLevel}>Nv {f.level}</span>
                        <span className={styles.featureName}>{f.name}</span>
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {expanded && (
                        <p className={styles.featureDesc}>{f.description}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Class skills */}
            <Card padding="md">
              <h2 className={styles.sectionTitle}>Habilidades de Clase</h2>
              <div className={styles.skillPills}>
                {cls.classSkills.map(s => (
                  <span key={s} className={styles.skillPill}>{s.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </Card>
          </div>
        )}

        {section === 'races' && (
          <div className={styles.detailView}>
            {/* Header */}
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

            {/* Ability bonuses */}
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

            {/* Racial traits */}
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

            {/* Subraces */}
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
        )}
      </main>
    </div>
  )
}
