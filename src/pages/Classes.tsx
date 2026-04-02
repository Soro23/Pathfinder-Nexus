import { useState } from 'react'
import { Shield, ChevronDown, ChevronUp } from 'lucide-react'
import { CLASSES } from '../data/classes'
import { Card } from '../components/ui'
import styles from './Compendium.module.css'
import mobile from '../styles/compendiumMobile.module.css'

const ABILITY_ABBR: Record<string, string> = {
  strength: 'FUE', dexterity: 'DES', constitution: 'CON',
  intelligence: 'INT', wisdom: 'SAB', charisma: 'CAR',
}
const BAB_LABEL: Record<string, string> = { good: 'Bueno (+1/nivel)', medium: 'Medio (+3/4 nivel)', poor: 'Bajo (+1/2 nivel)' }
const SAVE_LABEL: Record<string, string> = { good: 'Buena', poor: 'Baja' }

export function Classes() {
  const [selected, setSelected] = useState(CLASSES[0].id)
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null)

  const cls = CLASSES.find(c => c.id === selected) ?? CLASSES[0]

  function toggleFeature(key: string) {
    setExpandedFeature(prev => prev === key ? null : key)
  }

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile sticky nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <Shield size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            value={selected}
            onChange={e => { setSelected(e.target.value); setExpandedFeature(null) }}
          >
            {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left nav ── */}
      <nav className={styles.leftNav}>
        <div className={styles.leftNavInner}>
          <p className={styles.navTitle}>Clases</p>
          <div className={styles.navList}>
            {CLASSES.map(c => (
              <button
                key={c.id}
                className={`${styles.navBtn} ${selected === c.id ? styles.navBtnActive : ''}`}
                onClick={() => { setSelected(c.id); setExpandedFeature(null) }}
              >
                {c.name}
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
              <h1 className={styles.detailTitle}>{cls.name}</h1>
              <p className={styles.detailDesc}>{cls.description}</p>
            </div>
            <div className={styles.hitDieBadge}>d{cls.hitDie}</div>
          </div>

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

          <Card padding="md">
            <h2 className={styles.sectionTitle}>Características de Clase</h2>
            <div className={styles.featureList}>
              {cls.features.map((f) => {
                const key = `${cls.id}-${f.name}-${f.level}`
                const expanded = expandedFeature === key
                return (
                  <div key={key} className={styles.featureRow}>
                    <button className={styles.featureHeader} onClick={() => toggleFeature(key)}>
                      <span className={styles.featureLevel}>Nv {f.level}</span>
                      <span className={styles.featureName}>{f.name}</span>
                      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {expanded && <p className={styles.featureDesc}>{f.description}</p>}
                  </div>
                )
              })}
            </div>
          </Card>

          <Card padding="md">
            <h2 className={styles.sectionTitle}>Habilidades de Clase</h2>
            <div className={styles.skillPills}>
              {cls.classSkills.map(s => (
                <span key={s} className={styles.skillPill}>{s.replace(/_/g, ' ')}</span>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
