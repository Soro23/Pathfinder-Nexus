import { Zap, ChevronDown } from 'lucide-react'
import { useSkillsV1Drawer } from './SkillsV1Detail'
import styles from './Skills.module.css'
import demoStyles from './SkillsV1Example.module.css'
import mobile from '../styles/compendiumMobile.module.css'

// ── Página de ejemplo aislada ───────────────────────────────────────────────
// Consulta directamente el schema `v1` (v1.skills) sin pasar por srdStore ni
// tocar /skills. Objetivo: validar el acceso al nuevo schema, igual que
// FeatsV1Example.tsx para dotes.
//
// A diferencia de v1.feats, v1.skills no tiene prerrequisitos ni relación
// entre filas — son solo 26 habilidades planas, así que no hace falta
// paginación ni búsqueda. Sí hay dos tablas relacionadas que vale la pena
// mostrar: `skill_subtypes` (los 10 subtipos de Saber — Arcano, Mazmorras,
// etc.; ninguna otra skill del schema tiene subtipos, ni siquiera
// Artesanía/Interpretar/Profesión pese a que narrativamente también se
// especializan) y `class_skills` (qué clases tienen cada habilidad como
// habilidad de clase, vía class_id/skill_id → 491 filas para 38 clases).
//
// Mostrar las 26 descripciones completas en línea (subtipos + Markdown largo
// + hasta 38 chips de clase por fila) obligaba a un scroll enorme para
// encontrar cualquier dato puntual. Se reorganiza como tabla resumen
// (característica, entrenamiento, penalización, nº clases) + Drawer con el
// detalle completo al hacer clic — la consulta, el Drawer y la navegación
// habilidad↔subtipo viven en SkillsV1Detail.tsx (compartido con /feats-v1,
// donde los prerrequisitos que mencionan una habilidad abren el mismo Drawer).

export function SkillsV1Example() {
  const { skills, loading, error, open, drawer } = useSkillsV1Drawer()

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile sticky nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <Zap size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            defaultValue=""
            onChange={e => { open(e.target.value); (e.target as HTMLSelectElement).value = '' }}
          >
            <option value="" disabled>Ver habilidad…</option>
            {skills.map(skill => (
              <option key={skill.id} value={skill.id}>{skill.name_es}</option>
            ))}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left nav ── */}
      <nav className={styles.skillNav}>
        <div className={styles.skillNavInner}>
          <p className={styles.navTitle}>Habilidades (schema v1)</p>
          <div className={styles.navList}>
            {skills.map((skill) => (
              <button
                key={skill.id}
                className={styles.navBtn}
                onClick={() => open(skill.id)}
              >
                {skill.name_es}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className={styles.content}>
        <header className={styles.header}>
          <Zap size={28} className={styles.headerIcon} />
          <div>
            <h1>Habilidades (v1)</h1>
            <p className={styles.subtitle}>
              Ejemplo de página contra el nuevo schema — {skills.length} habilidades
            </p>
          </div>
        </header>

        {error && (
          <div className={demoStyles.errorBanner}>
            Error consultando el schema v1: {error}
          </div>
        )}

        {loading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.loader} />
            <p>Cargando habilidades...</p>
          </div>
        ) : (
          <div className={demoStyles.tableWrap}>
            <table className={demoStyles.table}>
              <thead>
                <tr>
                  <th>Habilidad</th>
                  <th>Característica</th>
                  <th>Entrenamiento</th>
                  <th>Penalización armadura</th>
                  <th>Clases</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <tr key={skill.id} onClick={() => open(skill.id)}>
                    <td className={demoStyles.rowName}>{skill.name_es}</td>
                    <td className={demoStyles.abilityCell}>{skill.key_ability}</td>
                    <td className={skill.trained_only ? demoStyles.yesCell : demoStyles.dashCell}>
                      {skill.trained_only ? 'Solo entrenado' : '—'}
                    </td>
                    <td className={skill.armor_check_penalty ? demoStyles.yesCell : demoStyles.dashCell}>
                      {skill.armor_check_penalty ? '−1' : '—'}
                    </td>
                    <td className={demoStyles.countCell}>{skill.class_skills.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {drawer}
    </div>
  )
}
