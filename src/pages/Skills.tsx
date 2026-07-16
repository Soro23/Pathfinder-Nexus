import { Zap, ChevronDown } from 'lucide-react'
import { SKILLS } from '../data/skills'
import { usePageTransition } from '../hooks/usePageTransition'
import styles from './Skills.module.css'
import mobile from '../styles/compendiumMobile.module.css'

function fmtAbility(ability: string): string {
  const map: Record<string, string> = {
    strength: 'FUE',
    dexterity: 'DES',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'SAB',
    charisma: 'CAR',
  }
  return map[ability] || ability.substring(0, 3).toUpperCase()
}

export function Skills() {
  const { isExiting, isEntering, isLoading } = usePageTransition(true)
  const navClass = isExiting ? styles.navExiting : isEntering ? styles.navEntering : ''

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile sticky nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <Zap size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            defaultValue=""
            onChange={e => { scrollTo(e.target.value); (e.target as HTMLSelectElement).value = '' }}
          >
            <option value="" disabled>Ir a habilidad…</option>
            {SKILLS.map(skill => (
              <option key={skill.id} value={skill.id}>{skill.name}</option>
            ))}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left skill nav ── */}
      <nav className={styles.skillNav}>
        <div className={`${styles.skillNavInner} ${navClass}`}>
          <p className={styles.navTitle}>Habilidades</p>
          <div className={styles.navList}>
            {SKILLS.map((skill) => (
              <button
                key={skill.id}
                className={styles.navBtn}
                onClick={() => scrollTo(skill.id)}
              >
                {skill.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className={`${styles.content} ${isExiting ? styles.contentExiting : ''}`}>
        <header className={styles.header}>
          <Zap size={28} className={styles.headerIcon} />
          <div>
            <h1>Habilidades</h1>
            <p className={styles.subtitle}>Todas las habilidades del sistema Pathfinder</p>
          </div>
        </header>

        {isLoading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.loader} />
            <p>Cargando habilidades...</p>
          </div>
        ) : (
        <div className={styles.skillsGrid}>
          {SKILLS.map((skill) => (
            <div key={skill.id} id={skill.id} className={styles.skillCard}>
              <div className={styles.skillHeader}>
                <h3 className={styles.skillName}>{skill.name}</h3>
                <div className={styles.skillMeta}>
                  <span className={`${styles.skillTag} ${styles.ability}`}>
                    {fmtAbility(skill.ability)}
                  </span>
                  {skill.isClassSkill && (
                    <span className={`${styles.skillTag} ${styles.classSkill}`}>
                      Skill de clase
                    </span>
                  )}
                  {skill.hasArmorCheckPenalty && (
                    <span className={`${styles.skillTag} ${styles.armorPenalty}`}>
                      −1 por armadura
                    </span>
                  )}
                </div>
              </div>
              
              <p className={styles.skillDescription}>{skill.description}</p>

              {skill.uses && skill.uses.length > 0 && (
                <div className={styles.skillSection}>
                  <p className={styles.skillSectionTitle}>Usos principales</p>
                  <div className={styles.usesList}>
                    {skill.uses.map((use, i) => (
                      <span key={i} className={styles.useItem}>{use}</span>
                    ))}
                  </div>
                </div>
              )}

              {skill.typicalDCs && skill.typicalDCs.length > 0 && (
                <div className={styles.skillSection}>
                  <p className={styles.skillSectionTitle}>DCs típicas</p>
                  <table className={styles.dcTable}>
                    <thead>
                      <tr>
                        <th>DC</th>
                        <th>Ejemplo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skill.typicalDCs.map((item, i) => (
                        <tr key={i}>
                          <td>{item.dc}</td>
                          <td>{item.example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {skill.notes && skill.notes.length > 0 && (
                <div className={styles.skillSection}>
                  <p className={styles.skillSectionTitle}>Notas</p>
                  <ul className={styles.notesList}>
                    {skill.notes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  )
}
