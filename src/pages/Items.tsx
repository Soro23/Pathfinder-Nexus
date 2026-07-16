import { useState } from 'react'
import { Backpack, Search, ChevronDown } from 'lucide-react'
import { useItems, fetchItemDescription } from '../hooks/useItems'
import { ITEM_TYPES } from '../lib/itemsService'
import styles from './Items.module.css'
import mobile from '../styles/compendiumMobile.module.css'

const ITEM_TYPE_LABELS: Record<string, string> = {
  weapon: 'Arma',
  armor: 'Armadura',
  shield: 'Escudo',
  potion: 'Poción',
  scroll: 'Pergamino',
  wand: 'Varita',
  staff: 'Bastón',
  ring: 'Anillo',
  rod: 'Vara',
  wondrous: 'Objeto maravilloso',
  mundane: 'Mundano',
  ammunition: 'Munición',
  tool: 'Herramienta',
  other: 'Otro',
  alchemical: 'Alquímico',
  container: 'Contenedor',
  cursed: 'Maldito',
  gear: 'Equipo de aventurero',
}

const PAGE_SIZE = 60

export function Items() {
  const [itemType, setItemType] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [descriptions, setDescriptions] = useState<Record<string, string | 'loading'>>({})

  const { items, loading, total } = useItems({ search, itemType }, page)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const resetPage = () => setPage(1)

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const loadDescription = (id: string) => {
    if (descriptions[id]) return
    setDescriptions((prev) => ({ ...prev, [id]: 'loading' }))
    fetchItemDescription(id).then((text) => {
      setDescriptions((prev) => ({ ...prev, [id]: text ?? '' }))
    })
  }

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile sticky nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <Backpack size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            value={itemType}
            onChange={(e) => { setItemType(e.target.value); resetPage() }}
          >
            <option value="all">Todos los tipos</option>
            {ITEM_TYPES.map((t) => (
              <option key={t} value={t}>{ITEM_TYPE_LABELS[t]}</option>
            ))}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left nav ── */}
      <nav className={styles.itemNav}>
        <div className={styles.itemNavInner}>
          <p className={styles.navTitle}>Tipo</p>
          <div className={styles.navList}>
            <button
              className={`${styles.navBtn} ${itemType === 'all' ? styles.navBtnActive : ''}`}
              onClick={() => { setItemType('all'); resetPage() }}
            >
              Todos los tipos
            </button>
            {ITEM_TYPES.map((t) => (
              <button
                key={t}
                className={`${styles.navBtn} ${itemType === t ? styles.navBtnActive : ''}`}
                onClick={() => { setItemType(t); resetPage() }}
              >
                {ITEM_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <Backpack size={28} />
          </div>
          <div>
            <h1>Equipo</h1>
            <p className={styles.subtitle}>Objetos mundanos y mágicos del sistema Pathfinder</p>
          </div>
        </header>

        {/* Search */}
        <div className={styles.searchBar}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar objetos..."
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

        {/* Results count and pagination */}
        <div className={styles.resultsAndPagination}>
          <p className={styles.resultsCount}>
            {loading ? 'Cargando...' : `${total} objeto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
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

        {/* Items grid */}
        <div className={styles.itemsGrid}>
          {items.map((item) => (
            <div key={item.id} id={item.id} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <h3 className={styles.itemName}>{item.name}</h3>
                {item.magical && <span className={`${styles.badge} ${styles.magicalBadge}`}>Mágico</span>}
              </div>

              <div className={styles.itemMeta}>
                <span className={`${styles.badge} ${styles.typeBadge}`}>
                  {ITEM_TYPE_LABELS[item.item_type] ?? item.item_type}
                </span>
                {item.subtype && <span><strong>Subtipo:</strong> {item.subtype}</span>}
                {item.slot && <span><strong>Ranura:</strong> {item.slot}</span>}
                {item.price_gp !== undefined && <span><strong>Precio:</strong> {item.price_gp} po</span>}
                {item.weight !== undefined && <span><strong>Peso:</strong> {item.weight} lb</span>}
                {item.consumable && <span>Consumible</span>}
              </div>

              <div className={styles.itemDescription}>
                {descriptions[item.id] === 'loading' ? (
                  <p>Cargando descripción...</p>
                ) : descriptions[item.id] ? (
                  <p>{descriptions[item.id]}</p>
                ) : (
                  <button
                    type="button"
                    className={styles.paginationBtn}
                    onClick={() => loadDescription(item.id)}
                  >
                    Ver descripción completa
                  </button>
                )}
              </div>
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

        {!loading && items.length === 0 && (
          <div className={styles.noResults}>
            <p>No se encontraron objetos con los criterios seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
