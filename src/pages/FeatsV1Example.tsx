import { useEffect, useState } from 'react'
import { Sword, ChevronDown, GitBranch } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Drawer } from '../components/ui/Drawer'
import { FeatsV1CardBody, type FeatV1Row, type FeatTypeRef } from './FeatsV1CardBody'
import { FeatsV1Tree } from './FeatsV1Tree'
import { buildFeatNameIndex, extractPrerequisiteFeatIds, transitiveReduceRequires, type FeatRef } from './featsV1PrerequisiteLinks'
import styles from './Feats.module.css'
import demoStyles from './FeatsV1Example.module.css'
import mobile from '../styles/compendiumMobile.module.css'

// ── Página de ejemplo aislada ───────────────────────────────────────────────
// Consulta directamente el schema `v1` (categorización relacional de dotes vía
// feat_types/feat_type_assignments) sin pasar por srdStore ni tocar /feats.
// Objetivo: validar el acceso al nuevo schema y mostrar el alcance de los datos.
//
// El árbol de dependencias y los enlaces de prerrequisito son best-effort:
// v1.feats.prerequisites_structured está vacío, así que el vínculo dote→dote se
// infiere comparando el texto de prerequisites_es contra los nombres de las demás
// dotes (ver featsV1PrerequisiteLinks.ts). Algunos prerrequisitos reales no van a
// enlazar si el nombre citado no coincide exactamente con el de la dote.

const FEAT_SELECT = `id, name_es, name_en, prerequisites_es, benefit_es, normal_es, special_es,
  publishers ( name ),
  sourcebooks ( title ),
  feat_type_assignments ( feat_types ( id, name_es ) )`

const PAGE_SIZE = 30
const SEARCH_DEBOUNCE_MS = 300
const GLOBAL_INDEX_PAGE_SIZE = 1000

interface GlobalFeatRow {
  id: string
  name_es: string
  prerequisites_es: string | null
}

async function fetchAllFeatRefs(): Promise<GlobalFeatRow[]> {
  const rows: GlobalFeatRow[] = []
  let offset = 0
  while (true) {
    const { data, error } = await supabase
      .schema('v1')
      .from('feats')
      .select('id, name_es, prerequisites_es')
      // `id` como desempate: sin él, PostgREST puede repetir u omitir filas con el
      // mismo name_es al cruzar el límite de página (hay dotes con nombres duplicados
      // entre distintas editoriales/sourcebooks).
      .order('name_es')
      .order('id')
      .range(offset, offset + GLOBAL_INDEX_PAGE_SIZE - 1)
    if (error || !data || data.length === 0) break
    rows.push(...(data as unknown as GlobalFeatRow[]))
    if (data.length < GLOBAL_INDEX_PAGE_SIZE) break
    offset += GLOBAL_INDEX_PAGE_SIZE
  }
  return rows
}

type ViewMode = 'tree' | 'grid'

export function FeatsV1Example() {
  const [view, setView] = useState<ViewMode>('tree')
  const [featTypes, setFeatTypes] = useState<FeatTypeRef[]>([])
  const [feats, setFeats] = useState<FeatV1Row[]>([])
  const [activeType, setActiveType] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Índice global de dependencias (independiente de la paginación/filtro) ──
  const [nameIndex, setNameIndex] = useState<Map<string, FeatRef>>(new Map())
  const [featsById, setFeatsById] = useState<Map<string, FeatRef>>(new Map())
  const [requiredByMap, setRequiredByMap] = useState<Map<string, string[]>>(new Map())
  const [treeRoots, setTreeRoots] = useState<FeatRef[]>([])

  // ── Panel de detalle (clic en dote-prerrequisito, desde card o árbol) ──
  const [selectedFeatId, setSelectedFeatId] = useState<string | null>(null)
  const [selectedFeat, setSelectedFeat] = useState<FeatV1Row | null>(null)

  useEffect(() => {
    supabase
      .schema('v1')
      .from('feat_types')
      .select('id, name_es')
      .order('name_es')
      .then(({ data, error: err }) => {
        if (err) return
        setFeatTypes((data ?? []) as unknown as FeatTypeRef[])
      })
  }, [])

  useEffect(() => {
    let cancelled = false

    fetchAllFeatRefs().then((rows) => {
      if (cancelled) return

      const refs: FeatRef[] = rows.map((r) => ({ id: r.id, name_es: r.name_es }))
      const index = buildFeatNameIndex(refs)
      const byId = new Map(refs.map((r) => [r.id, r]))
      const requiresMap = new Map<string, string[]>()

      for (const row of rows) {
        const prereqIds = row.prerequisites_es ? extractPrerequisiteFeatIds(row.prerequisites_es, index) : []
        requiresMap.set(row.id, prereqIds)
      }

      // Reducción transitiva: si una dote exige tanto a A como a B, y B ya exige a A
      // (directa o indirectamente), el vínculo directo con A es redundante para el árbol.
      const reducedRequires = transitiveReduceRequires(requiresMap)
      const requiredBy = new Map<string, string[]>()

      for (const [featId, prereqIds] of reducedRequires) {
        for (const targetId of prereqIds) {
          const existing = requiredBy.get(targetId)
          if (existing) existing.push(featId)
          else requiredBy.set(targetId, [featId])
        }
      }

      const roots = refs
        .filter((r) => (requiredBy.get(r.id)?.length ?? 0) > 0 && (requiresMap.get(r.id)?.length ?? 0) === 0)
        .sort((a, b) => a.name_es.localeCompare(b.name_es))

      setNameIndex(index)
      setFeatsById(byId)
      setRequiredByMap(requiredBy)
      setTreeRoots(roots)
    })

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    if (view !== 'grid') return

    let cancelled = false
    setLoading(true)
    setError(null)

    let query = supabase
      .schema('v1')
      .from('feats')
      .select(
        `id, name_es, name_en, prerequisites_es, benefit_es, normal_es, special_es,
         publishers ( name ),
         sourcebooks ( title ),
         feat_type_assignments${activeType === 'all' ? '' : '!inner'} ( feat_types ( id, name_es ) )`,
        { count: 'exact' }
      )
      .order('name_es')
      .order('id')
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (activeType !== 'all') {
      query = query.eq('feat_type_assignments.feat_type_id', activeType)
    }
    if (search.trim()) {
      query = query.ilike('name_es', `%${search.trim()}%`)
    }

    query.then(({ data, count, error: err }) => {
      if (cancelled) return
      if (err) {
        setError(err.message)
        setFeats([])
        setTotalCount(0)
      } else {
        setFeats((data ?? []) as unknown as FeatV1Row[])
        setTotalCount(count ?? 0)
      }
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [activeType, search, page, view])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const handleTypeChange = (typeId: string) => {
    setActiveType(typeId)
    setPage(1)
    setView('grid')
  }

  const handleShowTree = () => setView('tree')

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSelectFeat = (id: string) => {
    setSelectedFeatId(id)
    setSelectedFeat(null)
    supabase
      .schema('v1')
      .from('feats')
      .select(FEAT_SELECT)
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        setSelectedFeat((data ?? null) as unknown as FeatV1Row | null)
      })
  }

  const handleCloseDrawer = () => {
    setSelectedFeatId(null)
    setSelectedFeat(null)
  }

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile sticky nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <Sword size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            value={view === 'tree' ? 'tree' : activeType}
            onChange={e => (e.target.value === 'tree' ? handleShowTree() : handleTypeChange(e.target.value))}
          >
            <option value="tree">Árbol de dotes</option>
            <option value="all">Todas las dotes</option>
            {featTypes.map(t => (
              <option key={t.id} value={t.id}>{t.name_es}</option>
            ))}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left nav ── */}
      <nav className={styles.featNav}>
        <div className={styles.featNavInner}>
          <p className={styles.navTitle}>Categorías (schema v1)</p>
          <div className={styles.navList}>
            <button
              className={`${styles.navBtn} ${view === 'tree' ? styles.navBtnActive : ''}`}
              onClick={handleShowTree}
            >
              <GitBranch size={14} />
              <span>Árbol de dotes</span>
            </button>
            <button
              className={`${styles.navBtn} ${view === 'grid' && activeType === 'all' ? styles.navBtnActive : ''}`}
              onClick={() => handleTypeChange('all')}
            >
              Todas las dotes
            </button>
            {featTypes.map(t => (
              <button
                key={t.id}
                className={`${styles.navBtn} ${view === 'grid' && activeType === t.id ? styles.navBtnActive : ''}`}
                onClick={() => handleTypeChange(t.id)}
              >
                {t.name_es}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <Sword size={28} />
          </div>
          <div>
            <h1>Dotes (v1)</h1>
            <p className={styles.subtitle}>
              {view === 'tree'
                ? 'Ejemplo de página contra el nuevo schema — árbol de dependencias entre dotes'
                : `Ejemplo de página contra el nuevo schema — ${totalCount} dotes`}
            </p>
          </div>
        </header>

        {view === 'tree' ? (
          <FeatsV1Tree
            roots={treeRoots}
            requiredBy={requiredByMap}
            featsById={featsById}
            onSelectFeat={handleSelectFeat}
          />
        ) : (
          <>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Buscar dotes..."
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
                {totalCount} dote{totalCount !== 1 ? 's' : ''} encontrada{totalCount !== 1 ? 's' : ''}
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
                <p>Cargando dotes...</p>
              </div>
            ) : (
              <>
                <div className={styles.featsGrid}>
                  {feats.map((feat) => (
                    <div key={feat.id} id={feat.id} className={styles.featCard}>
                      <FeatsV1CardBody feat={feat} nameIndex={nameIndex} onSelectFeat={handleSelectFeat} />
                    </div>
                  ))}
                </div>

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

                {feats.length === 0 && !error && (
                  <div className={styles.noResults}>
                    <p>No se encontraron dotes con los criterios seleccionados.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <Drawer
        open={!!selectedFeatId}
        onClose={handleCloseDrawer}
        title={selectedFeat?.name_es ?? 'Cargando dote...'}
      >
        {selectedFeat ? (
          <FeatsV1CardBody feat={selectedFeat} nameIndex={nameIndex} onSelectFeat={handleSelectFeat} />
        ) : (
          <p className={styles.subtitle}>Cargando...</p>
        )}
      </Drawer>
    </div>
  )
}
