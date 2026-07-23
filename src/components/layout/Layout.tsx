import { Suspense, useEffect, useRef, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Users, Map, BookOpen, LayoutList, Shield, Globe, Zap,
  Sparkles, Backpack, PawPrint, Settings, Sun, Moon, LogOut, Sword, Wand2, X,
  Search as SearchIcon,
} from 'lucide-react'
import { useSRDStore } from '../../store/srdStore'
import { usePageTransitionStore } from '../../store/pageTransitionStore'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../hooks/useTheme'
import { PageLoader } from './PageLoader'
import styles from './Layout.module.css'

const compendiumLinks = [
  { path: '/rules',       icon: BookOpen,   label: 'Reglas Rápidas' },
  { path: '/srd',         icon: SearchIcon, label: 'Buscador de Reglas' },
  { path: '/homebrew',    icon: Wand2,      label: 'Homebrew' },
  { path: '/tables',      icon: LayoutList, label: 'Tablas' },
  { path: '/skills',      icon: Zap,        label: 'Habilidades' },
  { path: '/spells',      icon: Sparkles,   label: 'Hechizos' },
  { path: '/feats',       icon: Sword,      label: 'Dotes' },
  { path: '/items',       icon: Backpack,   label: 'Equipo' },
  { path: '/bestiary',    icon: PawPrint,   label: 'Bestiario' },
  { path: '/classes',     icon: Shield,     label: 'Clases' },
  { path: '/races',       icon: Globe,      label: 'Razas' },
  { path: '/npcs',        icon: Users,      label: 'NPCs' },
]

const bottomNavItems = [
  { path: '/',          icon: Users,  label: 'Personajes', exact: true },
  { path: '/campaigns', icon: Map,    label: 'Campañas',   exact: false },
]

// Duración del pliegue de salida — debe coincidir con la animación de cada página de catálogo.
const EXIT_ANIMATION_MS = 400

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const fetchAll = useSRDStore((s) => s.fetchAll)
  const setExiting = usePageTransitionStore((s) => s.setExiting)
  const pendingPath = usePageTransitionStore((s) => s.pendingPath)
  const setPendingPath = usePageTransitionStore((s) => s.setPendingPath)
  const [compendiumOpen, setCompendiumOpen] = useState(false)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => { setCompendiumOpen(false) }, [location.pathname])
  useEffect(() => () => { if (exitTimerRef.current) clearTimeout(exitTimerRef.current) }, [])

  // El destino pendiente manda mientras se navega: el ítem del menú se resalta
  // como si ya estuvieses ahí desde el primer clic, no cuando la URL cambia de verdad.
  function isActive(path: string, exact: boolean) {
    const current = pendingPath ?? location.pathname
    if (exact) return current === path
    return current.startsWith(path)
  }

  // Intercepta la navegación por clic para reproducir el pliegue de salida de la
  // página de catálogo actual (si tiene uno) antes de cambiar de ruta de verdad.
  // Respeta ctrl/cmd/shift (abrir en pestaña nueva).
  function handleNavClick(path: string) {
    return (e: React.MouseEvent) => {
      if (path === location.pathname) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      setPendingPath(path)
      setExiting(true)
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
      exitTimerRef.current = setTimeout(() => {
        setExiting(false)
        navigate(path)
        setPendingPath(null)
      }, EXIT_ANIMATION_MS)
    }
  }

  const isCompendiumActive = compendiumLinks.some(({ path }) => location.pathname.startsWith(path))

  return (
    <div className={styles.layout}>
      {/* ── Mobile Compendium Sheet ── */}
      {compendiumOpen && (
        <div className={styles.compendiumOverlay} onClick={() => setCompendiumOpen(false)}>
          <div className={styles.compendiumSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.compendiumSheetHeader}>
              <span>Compendio</span>
              <button className={styles.compendiumCloseBtn} onClick={() => setCompendiumOpen(false)}>
                <X size={20} />
              </button>
            </div>
            {compendiumLinks.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                onClick={handleNavClick(path)}
                className={`${styles.compendiumSheetItem} ${isActive(path, false) ? styles.compendiumSheetItemActive : ''}`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Mobile Bottom Nav ── */}
      <nav className={styles.bottomNav}>
        {bottomNavItems.map(({ path, icon: Icon, label, exact }) => (
          <Link
            key={path}
            to={path}
            onClick={handleNavClick(path)}
            className={`${styles.bottomNavItem} ${isActive(path, exact) ? styles.bottomNavActive : ''}`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        ))}
        <button
          className={`${styles.bottomNavItem} ${isCompendiumActive || compendiumOpen ? styles.bottomNavActive : ''}`}
          onClick={() => setCompendiumOpen((v) => !v)}
        >
          <BookOpen size={22} />
          <span>Compendio</span>
        </button>
        <Link
          to="/tools"
          onClick={handleNavClick('/tools')}
          className={`${styles.bottomNavItem} ${isActive('/tools', false) ? styles.bottomNavActive : ''}`}
        >
          <Settings size={22} />
          <span>Herramientas</span>
        </Link>
      </nav>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        {/* Brand */}
        <Link to="/" onClick={handleNavClick('/')} className={styles.brand}>
          <div className={styles.brandIcon}>
            <Sword size={18} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>El Cronista</span>
            <span className={styles.brandSub}>Pathfinder Nexus</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className={styles.nav}>
          {/* ── GESTIÓN ── */}
          <span className={styles.navSection}>Gestión</span>
          <Link
            to="/"
            onClick={handleNavClick('/')}
            className={`${styles.navItem} ${isActive('/', true) ? styles.active : ''}`}
          >
            <Users size={18} />
            <span>Mis Personajes</span>
          </Link>
          <Link
            to="/campaigns"
            onClick={handleNavClick('/campaigns')}
            className={`${styles.navItem} ${isActive('/campaigns', false) ? styles.active : ''}`}
          >
            <Map size={18} />
            <span>Campañas</span>
          </Link>

          {/* ── COMPENDIO ── */}
          <span className={styles.navSection}>Compendio</span>
          <Link
            to="/rules"
            onClick={handleNavClick('/rules')}
            className={`${styles.navItem} ${isActive('/rules', false) ? styles.active : ''}`}
          >
            <BookOpen size={18} />
            <span>Reglas Rápidas</span>
          </Link>
          <Link
            to="/srd"
            onClick={handleNavClick('/srd')}
            className={`${styles.navItem} ${isActive('/srd', false) ? styles.active : ''}`}
          >
            <SearchIcon size={18} />
            <span>Buscador de Reglas</span>
          </Link>
          <Link
            to="/homebrew"
            onClick={handleNavClick('/homebrew')}
            className={`${styles.navItem} ${isActive('/homebrew', false) ? styles.active : ''}`}
          >
            <Wand2 size={18} />
            <span>Homebrew</span>
          </Link>
          <Link
            to="/tables"
            onClick={handleNavClick('/tables')}
            className={`${styles.navItem} ${isActive('/tables', false) ? styles.active : ''}`}
          >
            <LayoutList size={18} />
            <span>Tablas</span>
          </Link>
          <Link
            to="/skills"
            onClick={handleNavClick('/skills')}
            className={`${styles.navItem} ${isActive('/skills', false) ? styles.active : ''}`}
          >
            <Zap size={18} />
            <span>Habilidades</span>
          </Link>
          <Link
            to="/spells"
            onClick={handleNavClick('/spells')}
            className={`${styles.navItem} ${isActive('/spells', false) ? styles.active : ''}`}
          >
            <Sparkles size={18} />
            <span>Hechizos</span>
          </Link>
          <Link
            to="/feats"
            onClick={handleNavClick('/feats')}
            className={`${styles.navItem} ${isActive('/feats', false) ? styles.active : ''}`}
          >
            <Sword size={18} />
            <span>Dotes</span>
          </Link>
          <Link
            to="/items"
            onClick={handleNavClick('/items')}
            className={`${styles.navItem} ${isActive('/items', false) ? styles.active : ''}`}
          >
            <Backpack size={18} />
            <span>Equipo</span>
          </Link>
          <Link
            to="/bestiary"
            onClick={handleNavClick('/bestiary')}
            className={`${styles.navItem} ${isActive('/bestiary', false) ? styles.active : ''}`}
          >
            <PawPrint size={18} />
            <span>Bestiario</span>
          </Link>
          <Link
            to="/classes"
            onClick={handleNavClick('/classes')}
            className={`${styles.navItem} ${isActive('/classes', false) ? styles.active : ''}`}
          >
            <Shield size={18} />
            <span>Clases</span>
          </Link>
          <Link
            to="/races"
            onClick={handleNavClick('/races')}
            className={`${styles.navItem} ${isActive('/races', false) ? styles.active : ''}`}
          >
            <Globe size={18} />
            <span>Razas</span>
          </Link>
          <Link
            to="/npcs"
            onClick={handleNavClick('/npcs')}
            className={`${styles.navItem} ${isActive('/npcs', false) ? styles.active : ''}`}
          >
            <Users size={18} />
            <span>NPCs</span>
          </Link>
        </nav>

        {/* ── Footer icons ── */}
        <div className={styles.sidebarFooter}>
          <div className={styles.footerTopRow}>
            <Link
              to="/admin"
              onClick={handleNavClick('/admin')}
              className={`${styles.footerBtn} ${isActive('/admin', false) ? styles.footerBtnActive : ''}`}
              title="Administración"
            >
              <Settings size={18} />
            </Link>
            <button
              onClick={toggleTheme}
              className={styles.footerBtn}
              title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
          <button onClick={signOut} className={styles.signOutBtn}>
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
