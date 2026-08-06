import { useMemo } from 'react'
import { Shield, ChevronDown } from 'lucide-react'
import { useClassesV1Drawer, type ClassV1Row } from './ClassesV1Detail'
import styles from './Classes.module.css'
import demoStyles from './ClassesV1Example.module.css'
import mobile from '../styles/compendiumMobile.module.css'

// ── Página de ejemplo aislada ───────────────────────────────────────────────
// Consulta directamente el schema `v1` (v1.classes, con class_skills,
// archetypes, class_levels y class_spell_slots embebidos) sin pasar por
// srdStore ni tocar /classes. Objetivo: validar el acceso al nuevo schema,
// igual que FeatsV1Example.tsx y SkillsV1Example.tsx.
//
// Mostrar las 39 clases con su progresión de 20 niveles y tabla de conjuros
// pivotada en línea obligaría a un scroll enorme para encontrar cualquier
// dato puntual — se reorganiza como tabla resumen (grupo, dado de golpeo,
// alineamiento, nº habilidades, nº arquetipos) + Drawer con el detalle
// completo al hacer clic, mismo patrón que /skills-v1. La consulta, el
// Drawer y el helper de pivote de conjuros viven en ClassesV1Detail.tsx; el
// Drawer de habilidad que se abre al pulsar una habilidad de clase reutiliza
// useSkillsV1Drawer() de SkillsV1Detail.tsx.
//
// El nav lateral agrupa por class_group_id presente en los datos (base,
// núcleo, híbrida, alternativa, desencadenada) en vez de listar los 9 grupos
// fijos de v1.class_groups — de prestigio, PNJ, monstruo y terceros no hay
// ninguna clase cargada todavía, así que no tiene sentido mostrarlos vacíos.

export function ClassesV1Example() {
  const { classes, loading, error, open, drawer } = useClassesV1Drawer()

  const grouped = useMemo(() => {
    const map = new Map<string, { id: string; name_es: string; classes: ClassV1Row[] }>()
    for (const c of classes) {
      if (!c.class_groups) continue
      const key = c.class_groups.id
      if (!map.has(key)) map.set(key, { id: key, name_es: c.class_groups.name_es, classes: [] })
      map.get(key)!.classes.push(c)
    }
    return [...map.values()].sort((a, b) => a.name_es.localeCompare(b.name_es, 'es'))
  }, [classes])

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile sticky nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <Shield size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            defaultValue=""
            onChange={e => { open(e.target.value); (e.target as HTMLSelectElement).value = '' }}
          >
            <option value="" disabled>Ver clase…</option>
            {grouped.map(g => (
              <optgroup key={g.id} label={g.name_es}>
                {g.classes.map(c => <option key={c.id} value={c.id}>{c.name_es}</option>)}
              </optgroup>
            ))}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left nav ── */}
      <nav className={styles.sideNav}>
        <div className={styles.sideNavInner}>
          <p className={styles.navTitle}>Clases (schema v1)</p>
          <div className={styles.navList}>
            {grouped.map(g => (
              <div key={g.id} className={styles.navGroup}>
                <span className={styles.navGroupLabel}>{g.name_es}</span>
                {g.classes.map(c => (
                  <button key={c.id} className={styles.navBtn} onClick={() => open(c.id)}>
                    {c.name_es}
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
            <h1>Clases (v1)</h1>
            <p className={styles.subtitle}>
              Ejemplo de página contra el nuevo schema — {classes.length} clases
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
            <p>Cargando clases...</p>
          </div>
        ) : (
          <div className={demoStyles.tableWrap}>
            <table className={demoStyles.table}>
              <thead>
                <tr>
                  <th>Clase</th>
                  <th>Grupo</th>
                  <th>Dado de golpeo</th>
                  <th>Alineamiento</th>
                  <th>Habilidades</th>
                  <th>Arquetipos</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(c => (
                  <tr key={c.id} onClick={() => open(c.id)}>
                    <td className={demoStyles.rowName}>{c.name_es}</td>
                    <td>{c.class_groups?.name_es ?? '—'}</td>
                    <td className={demoStyles.hitDieCell}>{c.hit_die}</td>
                    <td>{c.alignment_restriction ?? '—'}</td>
                    <td className={demoStyles.countCell}>{c.class_skills.length}</td>
                    <td className={demoStyles.countCell}>{c.archetypes.length}</td>
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
