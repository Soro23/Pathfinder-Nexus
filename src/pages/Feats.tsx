import { useState } from 'react'
import { Sword, Shield, Sparkles, Wand2, Users, Target, Zap, BookOpen, Scroll, ChevronDown } from 'lucide-react'
import { FEATS, type FeatType } from '../data/feats'
import styles from './Feats.module.css'
import mobile from '../styles/compendiumMobile.module.css'

const CATEGORIES: { id: FeatType; label: string; icon: React.ReactNode }[] = [
  { id: 'combat', label: 'Combate', icon: <Sword size={14} /> },
  { id: 'general', label: 'General', icon: <Shield size={14} /> },
  { id: 'metamagic', label: 'Metamagia', icon: <Sparkles size={14} /> },
  { id: 'item_creation', label: 'Creación', icon: <Wand2 size={14} /> },
  { id: 'teamwork', label: 'Cooperación', icon: <Users size={14} /> },
  { id: 'critical', label: 'Crítico', icon: <Target size={14} /> },
  { id: 'style', label: 'Estilo', icon: <Zap size={14} /> },
  { id: 'race', label: 'Raza', icon: <BookOpen size={14} /> },
  { id: 'story', label: 'Historia', icon: <Scroll size={14} /> },
]

const TYPE_LABELS: Record<FeatType, string> = {
  combat: 'Combate',
  general: 'General',
  metamagic: 'Metamagia',
  item_creation: 'Creación',
  teamwork: 'Cooperación',
  critical: 'Crítico',
  style: 'Estilo',
  race: 'Raza',
  story: 'Historia',
}

export function Feats() {
  const [activeCategory, setActiveCategory] = useState<FeatType | 'all'>('all')
  const [search, setSearch] = useState('')

  const filteredFeats = FEATS.filter((feat) => {
    const matchesCategory = activeCategory === 'all' || feat.type.includes(activeCategory)
    const matchesSearch = search === '' || 
      feat.name.toLowerCase().includes(search.toLowerCase()) ||
      feat.benefit.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className={`${styles.pageLayout} ${mobile.pageLayout}`}>

      {/* ── Mobile sticky nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <Sword size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            value={activeCategory}
            onChange={e => setActiveCategory(e.target.value as FeatType | 'all')}
          >
            <option value="all">Todas las dotes</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      {/* ── Left nav ── */}
      <nav className={styles.featNav}>
        <div className={styles.featNavInner}>
          <p className={styles.navTitle}>Categorías</p>
          <div className={styles.navList}>
            <button
              className={`${styles.navBtn} ${activeCategory === 'all' ? styles.navBtnActive : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Todas las dotes
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.navBtn} ${activeCategory === cat.id ? styles.navBtnActive : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span className={styles.featCount}>
                  {FEATS.filter((f) => f.type.includes(cat.id)).length}
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
            <Sword size={28} />
          </div>
          <div>
            <h1>Dotes</h1>
            <p className={styles.subtitle}>Todas las dotes del sistema Pathfinder ({FEATS.length})</p>
          </div>
        </header>

        {/* Search */}
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Buscar dotes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch('')}>
              ×
            </button>
          )}
        </div>

        {/* Results count */}
        <p className={styles.resultsCount}>
          {filteredFeats.length} dote{filteredFeats.length !== 1 ? 's' : ''} encontrada{filteredFeats.length !== 1 ? 's' : ''}
        </p>

        {/* Feats grid */}
        <div key={activeCategory} className={styles.featsGrid}>
          {filteredFeats.map((feat) => (
            <div key={feat.id} id={feat.id} className={styles.featCard}>
              <div className={styles.featHeader}>
                <h3 className={styles.featName}>{feat.name}</h3>
                <div className={styles.featTypes}>
                  {feat.type.map((t) => (
                    <span key={t} className={`${styles.featType} ${styles[t]}`}>
                      {TYPE_LABELS[t]}
                    </span>
                  ))}
                </div>
              </div>

              {feat.prerequisite && (
                <p className={styles.featPrereq}>
                  <strong>Prerrequisito:</strong> {feat.prerequisite}
                </p>
              )}

              <p className={styles.featBenefit}>{feat.benefit}</p>

              {feat.normal && (
                <p className={styles.featNormal}>
                  <strong>Normal:</strong> {feat.normal}
                </p>
              )}

              {feat.special && (
                <p className={styles.featSpecial}>
                  <strong>Especial:</strong> {feat.special}
                </p>
              )}

              {feat.uses && feat.uses.length > 0 && (
                <div className={styles.featSection}>
                  <p className={styles.featSectionTitle}>Usos</p>
                  <div className={styles.usesList}>
                    {feat.uses.map((use, i) => (
                      <span key={i} className={styles.useItem}>{use}</span>
                    ))}
                  </div>
                </div>
              )}

              {feat.notes && feat.notes.length > 0 && (
                <div className={styles.featSection}>
                  <p className={styles.featSectionTitle}>Notas</p>
                  <ul className={styles.notesList}>
                    {feat.notes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {feat.source && (
                <p className={styles.featSource}>Fuente: {feat.source}</p>
              )}
            </div>
          ))}
        </div>

        {filteredFeats.length === 0 && (
          <div className={styles.noResults}>
            <p>No se encontraron dotes con los criterios seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
