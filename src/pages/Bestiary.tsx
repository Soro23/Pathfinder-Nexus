import { useState } from 'react'
import { PawPrint, Search, Skull, Flame, CloudRain, Mountain, TreeDeciduous, Users, Ghost, Sparkles, Bug, ChevronDown } from 'lucide-react'
import { useMonsters } from '../hooks/useMonsters'
import styles from './Bestiary.module.css'
import mobile from '../styles/compendiumMobile.module.css'

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: <PawPrint size={14} /> },
  { id: 'aberration', label: 'Aberraciones', icon: <Skull size={14} /> },
  { id: 'animal', label: 'Animales', icon: <Bug size={14} /> },
  { id: 'construct', label: 'Constructos', icon: <Sparkles size={14} /> },
  { id: 'creature', label: 'Criaturas', icon: <PawPrint size={14} /> },
  { id: 'dragon', label: 'Dragones', icon: <Flame size={14} /> },
  { id: 'elemental', label: 'Elementales', icon: <Flame size={14} /> },
  { id: 'fey', label: 'Feéricos', icon: <CloudRain size={14} /> },
  { id: 'giant', label: 'Gigantes', icon: <Mountain size={14} /> },
  { id: 'humanoid', label: 'Humanoides', icon: <Users size={14} /> },
  { id: 'magical-beast', label: 'Bestias Mágicas', icon: <Bug size={14} /> },
  { id: 'monstrous-humanoid', label: 'Humanoides Monstruosos', icon: <Skull size={14} /> },
  { id: 'ooze', label: 'Gelatinas', icon: <Bug size={14} /> },
  { id: 'outsider', label: 'Extranjeros', icon: <Sparkles size={14} /> },
  { id: 'plant', label: 'Plantas', icon: <TreeDeciduous size={14} /> },
  { id: 'undead', label: 'No-muertos', icon: <Ghost size={14} /> },
  { id: 'vermin', label: 'Vermes', icon: <Bug size={14} /> },
]

const CR_RANGES = [
  { id: 'all', label: 'Cualquier CR' },
  { id: '0', label: 'CR 0' },
  { id: '1/8', label: 'CR 1/8' },
  { id: '1/4', label: 'CR 1/4' },
  { id: '1/2', label: 'CR 1/2' },
  { id: '1-3', label: 'CR 1-3' },
  { id: '4-6', label: 'CR 4-6' },
  { id: '7-10', label: 'CR 7-10' },
  { id: '11-15', label: 'CR 11-15' },
  { id: '16-20', label: 'CR 16-20' },
  { id: '21+', label: 'CR 21+' },
]

function crMatchesRange(cr: number, range: string): boolean {
  if (range === 'all') return true
  if (range === '0') return cr === 0
  if (range === '1/8') return cr === 0.125
  if (range === '1/4') return cr === 0.25
  if (range === '1/2') return cr === 0.5
  if (range === '1-3') return cr >= 1 && cr <= 3
  if (range === '4-6') return cr >= 4 && cr <= 6
  if (range === '7-10') return cr >= 7 && cr <= 10
  if (range === '11-15') return cr >= 11 && cr <= 15
  if (range === '16-20') return cr >= 16 && cr <= 20
  if (range === '21+') return cr >= 21
  return true
}

export function Bestiary() {
  const { monsters, loading } = useMonsters()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [crFilter, setCrFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 50

  const filteredMonsters = monsters.filter((monster) => {
    const matchesCategory = activeCategory === 'all' || monster.type.toLowerCase().includes(activeCategory)
    const matchesSearch = search === '' || 
      monster.name.toLowerCase().includes(search.toLowerCase()) ||
      (monster.type && monster.type.toLowerCase().includes(search.toLowerCase()))
    const matchesCR = crMatchesRange(monster.cr, crFilter)
    return matchesCategory && matchesSearch && matchesCR
  })

  const totalPages = Math.ceil(filteredMonsters.length / PAGE_SIZE)
  const paginatedMonsters = filteredMonsters.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const getCRString = (cr: number) => {
    if (cr < 1) return `1/${Math.round(1/cr)}`
    return cr.toString()
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
          <p>Cargando criaturas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile sticky nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <PawPrint size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            value={activeCategory}
            onChange={e => { setActiveCategory(e.target.value); setCurrentPage(1) }}
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>

        {/* Mobile CR filter */}
        <div className={mobile.mobileCatSelectWrap}>
          <Skull size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            value={crFilter}
            onChange={e => { setCrFilter(e.target.value); setCurrentPage(1) }}
          >
            {CR_RANGES.map(cr => (
              <option key={cr.id} value={cr.id}>{cr.label}</option>
            ))}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left nav ── */}
      <nav className={styles.monsterNav}>
        <div className={styles.monsterNavInner}>
          <p className={styles.navTitle}>Categorías</p>
          <div className={styles.navList}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.navBtn} ${activeCategory === cat.id ? styles.navBtnActive : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.icon}
                <span>{cat.label}</span>
                {cat.id !== 'all' && (
                  <span className={styles.monsterCount}>
                    {monsters.filter((m) => m.type.toLowerCase().includes(cat.id.replace('-', ' '))).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <p className={styles.navTitle} style={{ marginTop: 'var(--space-4)' }}>Nivel de Desafío (CR)</p>
          <div className={styles.navList}>
            {CR_RANGES.map((cr) => (
              <button
                key={cr.id}
                className={`${styles.navBtn} ${crFilter === cr.id ? styles.navBtnActive : ''}`}
                onClick={() => { setCrFilter(cr.id); setCurrentPage(1) }}
              >
                <span>{cr.label}</span>
                <span className={styles.monsterCount}>
                  {monsters.filter((m) => crMatchesRange(m.cr, cr.id)).length}
                </span>
              </button>
            ))}
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
            <h1>Bestiario</h1>
            <p className={styles.subtitle}>Criaturas del sistema Pathfinder ({monsters.length})</p>
          </div>
        </header>

        {/* Search and filters */}
        <div className={styles.searchBar}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar criaturas..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch('')}>
              ×
            </button>
          )}
        </div>

        {/* CR Filter */}
        <div className={styles.crFilterBar}>
          <span className={styles.crFilterLabel}>Filtrar por CR:</span>
          <select
            className={styles.crFilterSelect}
            value={crFilter}
            onChange={(e) => { setCrFilter(e.target.value); setCurrentPage(1) }}
          >
            {CR_RANGES.map((cr) => (
              <option key={cr.id} value={cr.id}>{cr.label}</option>
            ))}
          </select>
        </div>

        {/* Results count and pagination */}
        <div className={styles.resultsAndPagination}>
          <p className={styles.resultsCount}>
            {filteredMonsters.length} criatura{filteredMonsters.length !== 1 ? 's' : ''} encontrada{filteredMonsters.length !== 1 ? 's' : ''}
          </p>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationBtn}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span className={styles.paginationInfo}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                className={styles.paginationBtn}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Monster grid */}
        <div key={activeCategory + crFilter + search + currentPage} className={styles.monstersGrid}>
          {paginatedMonsters.map((monster) => (
            <div key={monster.id} id={monster.id} className={styles.monsterCard}>
              <div className={styles.monsterHeader}>
                <div className={styles.monsterNameRow}>
                  <h3 className={styles.monsterName}>{monster.name}</h3>
                  <span className={styles.crBadge}>CR {getCRString(monster.cr)}</span>
                </div>
                <div className={styles.monsterTypes}>
                  <span className={styles.monsterType}>{monster.size} {monster.type}</span>
                  {monster.subtype && <span className={styles.monsterSubtype}>{monster.subtype}</span>}
                </div>
              </div>

              <div className={styles.monsterAlignment}>
                {monster.alignment}
              </div>

              <div className={styles.statBlock}>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>CA</span>
                  <span className={styles.statValue}>{monster.ac}{monster.acNotes && <span className={styles.statNote}> {monster.acNotes}</span>}</span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>PG</span>
                  <span className={styles.statValue}>{monster.hp}{monster.hpNotes && <span className={styles.statNote}> {monster.hpNotes}</span>}</span>
                </div>
              </div>
              <div className={styles.statBlock}>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Fort +{monster.fort} / Ref +{monster.ref} / Vol +{monster.will}</span>
                </div>
              </div>

              <div className={styles.abilityScores}>
                <div className={styles.ability}><span>FUE</span><span>{monster.str}</span></div>
                <div className={styles.ability}><span>DES</span><span>{monster.dex}</span></div>
                <div className={styles.ability}><span>CON</span><span>{monster.con}</span></div>
                <div className={styles.ability}><span>INT</span><span>{monster.int}</span></div>
                <div className={styles.ability}><span>SAB</span><span>{monster.wis}</span></div>
                <div className={styles.ability}><span>CAR</span><span>{monster.cha}</span></div>
              </div>

              <div className={styles.monsterDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Iniciativa</span>
                  <span className={styles.detailValue}>{monster.init >= 0 ? '+' : ''}{monster.init}</span>
                </div>
                { monster.speed && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Velocidad</span>
                    <span className={styles.detailValue}>{monster.speed}</span>
                  </div>
                )}
              </div>

              {monster.senses && (
                <div className={styles.monsterSection}>
                  <span className={styles.sectionLabel}>Sentidos</span>
                  <span className={styles.sectionValue}>{monster.senses}</span>
                </div>
              )}

              {(monster.dr || monster.immune || monster.resist) && (
                <div className={styles.monsterSection}>
                  <span className={styles.sectionLabel}>Defensas</span>
                  <span className={styles.sectionValue}>
                  {[
                      monster.dr && `RD ${monster.dr}`,
                      monster.immune && `Inmunidad: ${monster.immune}`,
                      monster.resist && `Resistencia: ${monster.resist}`
                    ]
                      .filter(Boolean)
                      .map((item, i) => (
                        <span key={i}>
                          {item}
                          <br />
                        </span>
                      ))}
                  </span>
                </div>
              )}

              {monster.melee && (
                <div className={styles.monsterSection}>
                  <span className={styles.sectionLabel}>Melé</span>
                  <span className={styles.sectionValue}>{monster.melee}</span>
                </div>
              )}

              {monster.ranged && (
                <div className={styles.monsterSection}>
                  <span className={styles.sectionLabel}>A distancia</span>
                  <span className={styles.sectionValue}>{monster.ranged}</span>
                </div>
              )}

              {monster.specialAttacks && (
                <div className={styles.monsterSection}>
                  <span className={styles.sectionLabel}>Ataques especiales</span>
                  <span className={styles.sectionValue}>{monster.specialAttacks}</span>
                </div>
              )}

              {monster.feats && monster.feats.length > 0 && (
                <div className={styles.monsterSection}>
                  <span className={styles.sectionLabel}>Dotes</span>
                  <span className={styles.sectionValue}>{monster.feats.join(', ')}</span>
                </div>
              )}

              {monster.skills && (
                <div className={styles.monsterSection}>
                  <span className={styles.sectionLabel}>Habilidades</span>
                  <span className={styles.sectionValue}>{monster.skills}</span>
                </div>
              )}

              {monster.languages && (
                <div className={styles.monsterSection}>
                  <span className={styles.sectionLabel}>Idiomas</span>
                  <span className={styles.sectionValue}>{monster.languages}</span>
                </div>
              )}

              {monster.organization && (
                <div className={styles.monsterSection}>
                  <span className={styles.sectionLabel}>Organización</span>
                  <span className={styles.sectionValue}>{monster.organization}</span>
                </div>
              )}

              {monster.treasure && (
                <div className={styles.monsterSection}>
                  <span className={styles.sectionLabel}>Tesoro</span>
                  <span className={styles.sectionValue}>{monster.treasure}</span>
                </div>
              )}

              {monster.description && (
                <div className={styles.monsterDescription}>
                  {monster.description}
                </div>
              )}

              {monster.source && (
                <p className={styles.monsterSource}>Fuente: {monster.source}</p>
              )}
            </div>
          ))}
        </div>

        {/* Pagination bottom */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className={styles.paginationInfo}>
              Página {currentPage} de {totalPages}
            </span>
            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}

        {filteredMonsters.length === 0 && (
          <div className={styles.noResults}>
            <p>No se encontraron criaturas con los criterios seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  )
}