import { useEffect, useState } from 'react'
import { Sparkles, Search, ChevronDown } from 'lucide-react'
import { useSpells } from '../hooks/useSpells'
import { usePageTransition } from '../hooks/usePageTransition'
import { SPELL_SCHOOLS, SPELL_TYPES } from '../data/spells'
import styles from './Spells.module.css'
import mobile from '../styles/compendiumMobile.module.css'

const LEVELS = [
  { id: 'all', label: 'Todos los niveles' },
  { id: '0', label: 'Nivel 0 (Trucos)' },
  { id: '1', label: 'Nivel 1' },
  { id: '2', label: 'Nivel 2' },
  { id: '3', label: 'Nivel 3' },
  { id: '4', label: 'Nivel 4' },
  { id: '5', label: 'Nivel 5' },
  { id: '6', label: 'Nivel 6' },
  { id: '7', label: 'Nivel 7' },
  { id: '8', label: 'Nivel 8' },
  { id: '9', label: 'Nivel 9' },
]

const TYPE_LABELS: Record<string, string> = {
  arcane: 'Arcano',
  divine: 'Divino',
  both: 'Ambos',
}

const PAGE_SIZE = 150

export function Spells() {
  const [level, setLevel] = useState('all')
  const [type, setType] = useState('all')
  const [school, setSchool] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { spells, loading, total } = useSpells(
    {
      search,
      type,
      school,
      level,
      classIds: [],
      showKnownOnly: false,
      knownSpellIds: [],
    },
    page
  )

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  useEffect(() => {
    if (!loading) setHasLoadedOnce(true)
  }, [loading])
  const { isLoading } = usePageTransition(hasLoadedOnce)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const resetPage = () => setPage(1)

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile sticky nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <Sparkles size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            value={level}
            onChange={(e) => { setLevel(e.target.value); resetPage() }}
          >
            {LEVELS.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>{lvl.label}</option>
            ))}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left nav ── */}
      <nav className={styles.spellNav}>
        <div className={styles.spellNavInner}>
          <p className={styles.navTitle}>Nivel</p>
          <div className={styles.navList}>
            {LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                className={`${styles.navBtn} ${level === lvl.id ? styles.navBtnActive : ''}`}
                onClick={() => { setLevel(lvl.id); resetPage() }}
              >
                <span>{lvl.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <Sparkles size={28} />
          </div>
          <div>
            <h1>Hechizos</h1>
            <p className={styles.subtitle}>Todos los conjuros del sistema Pathfinder</p>
          </div>
        </header>

        {isLoading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.loader} />
            <p>Cargando hechizos...</p>
          </div>
        ) : (
        <>
        {/* Search */}
        <div className={styles.searchBar}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar hechizos..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage() }}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => { setSearch(''); resetPage() }}>
              ×
            </button>
          )}
        </div>

        {/* Type / school filters */}
        <div className={styles.filterBar}>
          <span className={styles.filterLabel}>Tipo:</span>
          <select
            className={styles.filterSelect}
            value={type}
            onChange={(e) => { setType(e.target.value); resetPage() }}
          >
            {SPELL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <span className={styles.filterLabel}>Escuela:</span>
          <select
            className={styles.filterSelect}
            value={school}
            onChange={(e) => { setSchool(e.target.value); resetPage() }}
          >
            <option value="all">Todas</option>
            {SPELL_SCHOOLS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Results count and pagination */}
        <div className={styles.resultsAndPagination}>
          <p className={styles.resultsCount}>
            {loading ? 'Cargando...' : `${total} hechizo${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
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

        {/* Spells grid */}
        <div className={styles.spellsGrid}>
          {spells.map((spell) => (
            <div key={spell.id} id={spell.id} className={styles.spellCard}>
              <div className={styles.spellHeader}>
                <h3 className={styles.spellName}>{spell.name}</h3>
                <div className={styles.spellBadges}>
                  <span className={styles.badge + ' ' + styles.levelBadge}>
                    {spell.level === 0 ? 'Truco' : `Nivel ${spell.level}`}
                  </span>
                  <span className={`${styles.badge} ${styles.typeBadge} ${styles[spell.type]}`}>
                    {TYPE_LABELS[spell.type] ?? spell.type}
                  </span>
                </div>
              </div>

              <div className={styles.spellMeta}>
                <span><strong>Escuela:</strong> {spell.school}{spell.subschool ? ` (${spell.subschool})` : ''}</span>
                <span><strong>Tiempo:</strong> {spell.castingTime}</span>
                <span><strong>Alcance:</strong> {spell.range}</span>
                <span><strong>Duración:</strong> {spell.duration}</span>
                {spell.savingThrow && <span><strong>Salvación:</strong> {spell.savingThrow}</span>}
                {spell.spellResistance && <span><strong>RC:</strong> {spell.spellResistance}</span>}
              </div>

              <p className={styles.spellDescription}>{spell.description}</p>

              {spell.source && (
                <p className={styles.spellSource}>Fuente: {spell.source}</p>
              )}
            </div>
          ))}
        </div>

        {/* Pagination bottom */}
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

        {!loading && spells.length === 0 && (
          <div className={styles.noResults}>
            <p>No se encontraron hechizos con los criterios seleccionados.</p>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}
