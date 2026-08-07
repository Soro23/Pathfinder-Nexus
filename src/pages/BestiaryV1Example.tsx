import { useEffect, useState } from 'react'
import { Skull, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatCR } from '../lib/formatCR'
import { useCreatureDrawer, buildCreatureListSelect, type CreatureListRow, type RefRow } from './BestiaryV1Detail'
import styles from './Bestiary.module.css'
import demoStyles from './BestiaryV1Example.module.css'
import mobile from '../styles/compendiumMobile.module.css'

// ── Página de ejemplo aislada ───────────────────────────────────────────────
// Consulta directamente el schema `v1` (v1.creatures, que fusiona monstruos y
// PNJ en una sola tabla vía is_npc) sin pasar por srdStore ni tocar /bestiary.
// Objetivo: validar el acceso al nuevo schema, igual que FeatsV1Example.tsx,
// SkillsV1Example.tsx y ClassesV1Example.tsx.
//
// Con 7603 filas no tiene sentido embeber senses/defense/offense/statistics/
// ecology + habilidades especiales de todas de golpe — se pagina por nombre
// (30 por página, igual que /feats-v1) y el detalle completo (ficha tipo
// bloque de estadísticas) se carga bajo demanda al abrir el Drawer, ver
// BestiaryV1Detail.tsx (useCreatureDrawer). El nav lateral filtra por los 13
// v1.monster_types reales en vez de las categorías fijas que usa /bestiary.

const PAGE_SIZE = 30
const SEARCH_DEBOUNCE_MS = 300

type NpcFilter = 'all' | 'monster' | 'npc'

export function BestiaryV1Example() {
  const [monsterTypes, setMonsterTypes] = useState<RefRow[]>([])
  const [activeType, setActiveType] = useState('all')
  const [npcFilter, setNpcFilter] = useState<NpcFilter>('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [creatures, setCreatures] = useState<CreatureListRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { open, drawer } = useCreatureDrawer()

  useEffect(() => {
    supabase
      .schema('v1')
      .from('monster_types')
      .select('id, name_es')
      .order('name_es')
      .then(({ data, error: err }) => {
        if (err) return
        setMonsterTypes((data ?? []) as unknown as RefRow[])
      })
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    let query = supabase
      .schema('v1')
      .from('creatures')
      .select(buildCreatureListSelect(activeType !== 'all'), { count: 'exact' })
      .order('name_es')
      .order('id')
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (activeType !== 'all') {
      query = query.eq('monster_types.id', activeType)
    }
    if (npcFilter !== 'all') {
      query = query.eq('is_npc', npcFilter === 'npc')
    }
    if (search.trim()) {
      query = query.ilike('name_es', `%${search.trim()}%`)
    }

    query.then(({ data, count, error: err }) => {
      if (cancelled) return
      if (err) {
        setError(err.message)
        setCreatures([])
        setTotalCount(0)
      } else {
        setCreatures((data ?? []) as unknown as CreatureListRow[])
        setTotalCount(count ?? 0)
      }
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [activeType, npcFilter, search, page])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const handleTypeChange = (typeId: string) => {
    setActiveType(typeId)
    setPage(1)
  }

  const handleNpcFilterChange = (value: NpcFilter) => {
    setNpcFilter(value)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile sticky nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <Skull size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            value={activeType}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="all">Todos los tipos</option>
            {monsterTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name_es}</option>
            ))}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>

        <div className={mobile.mobileCatSelectWrap}>
          <select
            className={mobile.mobileCatSelect}
            value={npcFilter}
            onChange={(e) => handleNpcFilterChange(e.target.value as NpcFilter)}
          >
            <option value="all">Monstruos y PNJ</option>
            <option value="monster">Solo monstruos</option>
            <option value="npc">Solo PNJ</option>
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left nav ── */}
      <nav className={styles.monsterNav}>
        <div className={styles.monsterNavInner}>
          <p className={styles.navTitle}>Tipo (schema v1)</p>
          <div className={styles.navList}>
            <button
              className={`${styles.navBtn} ${activeType === 'all' ? styles.navBtnActive : ''}`}
              onClick={() => handleTypeChange('all')}
            >
              Todos los tipos
            </button>
            {monsterTypes.map((t) => (
              <button
                key={t.id}
                className={`${styles.navBtn} ${activeType === t.id ? styles.navBtnActive : ''}`}
                onClick={() => handleTypeChange(t.id)}
              >
                {t.name_es}
              </button>
            ))}
          </div>

          <p className={styles.navTitle} style={{ marginTop: 'var(--space-4)' }}>Origen</p>
          <div className={styles.navList}>
            <button
              className={`${styles.navBtn} ${npcFilter === 'all' ? styles.navBtnActive : ''}`}
              onClick={() => handleNpcFilterChange('all')}
            >
              Monstruos y PNJ
            </button>
            <button
              className={`${styles.navBtn} ${npcFilter === 'monster' ? styles.navBtnActive : ''}`}
              onClick={() => handleNpcFilterChange('monster')}
            >
              Solo monstruos
            </button>
            <button
              className={`${styles.navBtn} ${npcFilter === 'npc' ? styles.navBtnActive : ''}`}
              onClick={() => handleNpcFilterChange('npc')}
            >
              Solo PNJ
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <Skull size={28} />
          </div>
          <div>
            <h1>Bestiario (v1)</h1>
            <p className={styles.subtitle}>
              Ejemplo de página contra el nuevo schema — {totalCount} criaturas
            </p>
          </div>
        </header>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Buscar criaturas..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={styles.searchInput}
          />
          {searchInput && (
            <button className={styles.searchClear} onClick={() => setSearchInput('')}>
              ×
            </button>
          )}
        </div>

        {error && (
          <div className={demoStyles.errorBanner}>
            Error consultando el schema v1: {error}
          </div>
        )}

        <div className={styles.resultsAndPagination}>
          <p className={styles.resultsCount}>
            {totalCount} criatura{totalCount !== 1 ? 's' : ''} encontrada{totalCount !== 1 ? 's' : ''}
          </p>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationBtn}
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Anterior
              </button>
              <span className={styles.paginationInfo}>
                Página {page} de {totalPages}
              </span>
              <button
                className={styles.paginationBtn}
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.loader} />
            <p>Cargando criaturas...</p>
          </div>
        ) : (
          <>
            <div className={demoStyles.tableWrap}>
              <table className={demoStyles.table}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Tamaño</th>
                    <th>Alineamiento</th>
                    <th>Origen</th>
                    <th>FD</th>
                    <th>PX</th>
                  </tr>
                </thead>
                <tbody>
                  {creatures.map((c) => (
                    <tr key={c.id} onClick={() => open(c.id)}>
                      <td className={demoStyles.rowName}>{c.name_es}</td>
                      <td>{c.monster_types?.name_es ?? '—'}</td>
                      <td>{c.sizes?.name_es ?? '—'}</td>
                      <td>{c.alignments?.name_es ?? '—'}</td>
                      <td className={demoStyles.countCell}>{c.is_npc ? 'PNJ' : 'Monstruo'}</td>
                      <td className={demoStyles.crCell}>{formatCR(c.cr)}</td>
                      <td className={demoStyles.countCell}>{c.xp != null ? c.xp.toLocaleString('es') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {creatures.length === 0 && !error && (
              <div className={styles.noResults}>
                <p>No se encontraron criaturas con los criterios seleccionados.</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationBtn}
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </button>
                <span className={styles.paginationInfo}>
                  Página {page} de {totalPages}
                </span>
                <button
                  className={styles.paginationBtn}
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {drawer}
    </div>
  )
}
