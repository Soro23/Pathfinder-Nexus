import { useMemo } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { formatAbilityModifiers, useRacesV1Drawer, type RaceV1Row } from './RacesV1Detail'
import styles from './Classes.module.css'
import demoStyles from './RacesV1Example.module.css'
import mobile from '../styles/compendiumMobile.module.css'

// ── Página de ejemplo aislada ───────────────────────────────────────────────
// Consulta directamente el schema `v1` (v1.races, con race_traits,
// race_languages, race_favored_class_options, race_feats y race_variants
// embebidos) sin pasar por srdStore ni tocar /races. Objetivo: validar el
// acceso al nuevo schema, igual que FeatsV1Example.tsx, SkillsV1Example.tsx,
// ClassesV1Example.tsx y BestiaryV1Example.tsx.
//
// 82 razas con descripción larga + rasgos estándar/alternativos + idiomas +
// dotes raciales + variantes por fila son demasiado para volcar en línea (ver
// memoria pathfinder-nexus-v1-example-pages-ux) — se reorganiza como tabla
// resumen (tipo, tamaño, velocidad, modificadores, nº rasgos, fuente) +
// Drawer con el detalle completo al hacer clic, mismo patrón que
// /classes-v1. La consulta y el Drawer viven en RacesV1Detail.tsx.
//
// El nav lateral agrupa por tamaño (v1.sizes vía sizes_id) en vez de listar
// las 82 razas sueltas, igual que /classes-v1 agrupa por class_group_id. De
// las 82, solo 37 son las razas "clásicas" con datos completos — el resto
// (más de bestiario adaptado a raza jugable) puede llegar sin velocidad base
// o sin rasgos parseables; la tabla usa '—' para esos huecos.

export function RacesV1Example() {
  const { races, loading, error, open, drawer } = useRacesV1Drawer()

  const grouped = useMemo(() => {
    const map = new Map<string, { id: string; name_es: string; races: RaceV1Row[] }>()
    for (const r of races) {
      if (!r.sizes) continue
      const key = r.sizes.id
      if (!map.has(key)) map.set(key, { id: key, name_es: r.sizes.name_es, races: [] })
      map.get(key)!.races.push(r)
    }
    return [...map.values()].sort((a, b) => a.name_es.localeCompare(b.name_es, 'es'))
  }, [races])

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile sticky nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <Globe size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            defaultValue=""
            onChange={e => { open(e.target.value); (e.target as HTMLSelectElement).value = '' }}
          >
            <option value="" disabled>Ver raza…</option>
            {grouped.map(g => (
              <optgroup key={g.id} label={g.name_es}>
                {g.races.map(r => <option key={r.id} value={r.id}>{r.name_es}</option>)}
              </optgroup>
            ))}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left nav ── */}
      <nav className={styles.sideNav}>
        <div className={styles.sideNavInner}>
          <p className={styles.navTitle}>Tamaño (schema v1)</p>
          <div className={styles.navList}>
            {grouped.map(g => (
              <div key={g.id} className={styles.navGroup}>
                <span className={styles.navGroupLabel}>{g.name_es}</span>
                {g.races.map(r => (
                  <button key={r.id} className={styles.navBtn} onClick={() => open(r.id)}>
                    {r.name_es}
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
          <Globe size={28} className={styles.headerIcon} />
          <div>
            <h1>Razas (v1)</h1>
            <p className={styles.subtitle}>
              Ejemplo de página contra el nuevo schema — {races.length} razas
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
            <p>Cargando razas...</p>
          </div>
        ) : (
          <div className={demoStyles.tableWrap}>
            <table className={demoStyles.table}>
              <thead>
                <tr>
                  <th>Raza</th>
                  <th>Tipo</th>
                  <th>Tamaño</th>
                  <th>Velocidad</th>
                  <th>Modificadores</th>
                  <th>Rasgos</th>
                  <th>Fuente</th>
                </tr>
              </thead>
              <tbody>
                {races.map(r => (
                  <tr key={r.id} onClick={() => open(r.id)}>
                    <td className={demoStyles.rowName}>{r.name_es}</td>
                    <td className={demoStyles.typeCell}>{r.creature_type ?? '—'}</td>
                    <td>{r.sizes?.name_es ?? '—'}</td>
                    <td>{r.base_speed_ft != null ? `${r.base_speed_ft} pies` : '—'}</td>
                    <td className={demoStyles.modifiersCell}>{formatAbilityModifiers(r.ability_modifiers)}</td>
                    <td className={demoStyles.countCell}>
                      {r.race_traits.length > 0 ? r.race_traits.length : '—'}
                      {r.race_variants.length > 0 ? ` (+${r.race_variants.length} var.)` : ''}
                    </td>
                    <td className={demoStyles.countCell}>{r.sourcebooks?.title ?? '—'}</td>
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
