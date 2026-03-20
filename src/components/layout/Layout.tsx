import { Outlet, Link, useLocation, useMatch } from 'react-router-dom'
import { Users, PlusCircle, BookOpen, Backpack, Sparkles, Map, Sword, PawPrint } from 'lucide-react'
import { useCharacterStore } from '../../store'
import styles from './Layout.module.css'

const navItems = [
  { path: '/', icon: Users, label: 'Mis Personajes', exact: true },
  { path: '/characters/new', icon: PlusCircle, label: 'Crear Personaje', exact: true },
  { path: '/rules', icon: BookOpen, label: 'Compendio', exact: false },
]

export function Layout() {
  const location = useLocation()

  // Detect active character from URL
  const charMatch = useMatch('/characters/:id')
  const charMatchPlay = useMatch('/characters/:id/play')
  const activeCharId = (charMatch ?? charMatchPlay)?.params.id ?? null

  const character = useCharacterStore((state) =>
    activeCharId ? state.getCharacter(activeCharId) : undefined
  )

  function isActive(path: string, exact: boolean) {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  // Contextual character links — enabled when inside a character route
  const contextualItems = [
    { icon: Backpack, label: 'Inventario', tab: 'inventory' },
    { icon: Sparkles, label: 'Hechizos', tab: 'spells' },
    { icon: PawPrint, label: 'Compañero', tab: 'companion' },
  ]

  // Bottom nav items for mobile
  const bottomNavItems = [
    { path: '/', icon: Users, label: 'Héroes', exact: true },
    { path: '/characters/new', icon: PlusCircle, label: 'Crear', exact: true },
    { path: '/rules', icon: BookOpen, label: 'Reglas', exact: false },
    { path: '/campaigns', icon: Map, label: 'Campañas', exact: false },
  ]

  return (
    <div className={styles.layout}>
      {/* ── Mobile Bottom Nav ── */}
      <nav className={styles.bottomNav}>
        {bottomNavItems.map(({ path, icon: Icon, label, exact }) => (
          <Link
            key={path}
            to={path}
            className={`${styles.bottomNavItem} ${isActive(path, exact) ? styles.bottomNavActive : ''}`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        {/* Brand */}
        <Link to="/" className={styles.brand}>
          <div className={styles.brandIcon}>
            <Sword size={18} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>El Cronista</span>
            <span className={styles.brandSub}>Pathfinder Nexus</span>
          </div>
        </Link>

        {/* Primary navigation */}
        <nav className={styles.nav}>
          <span className={styles.navSection}>Gestión</span>
          {navItems.map(({ path, icon: Icon, label, exact }) => (
            <Link
              key={path}
              to={path}
              className={`${styles.navItem} ${isActive(path, exact) ? styles.active : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}

          {/* Active character section */}
          <span className={styles.navSection}>Personaje Activo</span>
          {activeCharId && character ? (
            <>
              <div className={styles.activeCharacterChip}>
                <div className={styles.activeCharAvatar}>
                  {character.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.activeCharInfo}>
                  <span className={styles.activeCharName}>{character.name}</span>
                  <span className={styles.activeCharLevel}>Nivel {character.level}</span>
                </div>
              </div>
              {contextualItems.map(({ icon: Icon, label }) => (
                <Link
                  key={label}
                  to={`/characters/${activeCharId}`}
                  className={`${styles.navItem} ${styles.contextualItem}`}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </>
          ) : (
            contextualItems.map(({ icon: Icon, label }) => (
              <span key={label} className={`${styles.navItem} ${styles.disabled}`} title="Selecciona un personaje">
                <Icon size={18} />
                <span>{label}</span>
              </span>
            ))
          )}

          <Link
            to="/campaigns"
            className={`${styles.navItem} ${isActive('/campaigns', false) ? styles.active : ''}`}
          >
            <Map size={18} />
            <span>Campañas</span>
          </Link>
        </nav>

        {/* CTA in sidebar */}
        <Link to="/characters/new" className={styles.sidebarCta}>
          <PlusCircle size={16} />
          Nueva Aventura
        </Link>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
