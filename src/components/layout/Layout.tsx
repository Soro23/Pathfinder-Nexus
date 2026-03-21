import { useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Users, Map, BookOpen, LayoutList, Shield, Globe, Star, Zap,
  Sparkles, Backpack, Gem, PawPrint, Settings, Sun, Moon, LogOut, Sword, Wand2,
} from 'lucide-react'
import { useSRDStore } from '../../store/srdStore'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../hooks/useTheme'
import styles from './Layout.module.css'

const compendiumSoon = [
  { icon: LayoutList, label: 'Tablas' },
  { icon: Shield,     label: 'Clases' },
  { icon: Globe,      label: 'Razas' },
  { icon: Star,       label: 'Dotes' },
  { icon: Zap,        label: 'Habilidades' },
  { icon: Sparkles,   label: 'Conjuros' },
  { icon: Backpack,   label: 'Equipación' },
  { icon: Gem,        label: 'Objetos Mágicos' },
  { icon: PawPrint,   label: 'Bestiario' },
]

const bottomNavItems = [
  { path: '/',          icon: Users,     label: 'Personajes', exact: true },
  { path: '/campaigns', icon: Map,       label: 'Campañas',   exact: false },
  { path: '/rules',     icon: BookOpen,  label: 'Reglas',     exact: false },
]

export function Layout() {
  const location = useLocation()
  const { signOut } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const fetchAll = useSRDStore((s) => s.fetchAll)
  useEffect(() => { fetchAll() }, [fetchAll])

  function isActive(path: string, exact: boolean) {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

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

        {/* Navigation */}
        <nav className={styles.nav}>
          {/* ── GESTIÓN ── */}
          <span className={styles.navSection}>Gestión</span>
          <Link
            to="/"
            className={`${styles.navItem} ${isActive('/', true) ? styles.active : ''}`}
          >
            <Users size={18} />
            <span>Mis Personajes</span>
          </Link>
          <Link
            to="/campaigns"
            className={`${styles.navItem} ${isActive('/campaigns', false) ? styles.active : ''}`}
          >
            <Map size={18} />
            <span>Campañas</span>
          </Link>

          {/* ── COMPENDIO ── */}
          <span className={styles.navSection}>Compendio</span>
          <Link
            to="/rules"
            className={`${styles.navItem} ${isActive('/rules', false) ? styles.active : ''}`}
          >
            <BookOpen size={18} />
            <span>Reglas Rápidas</span>
          </Link>
          <Link
            to="/homebrew"
            className={`${styles.navItem} ${isActive('/homebrew', false) ? styles.active : ''}`}
          >
            <Wand2 size={18} />
            <span>Homebrew</span>
          </Link>
          {compendiumSoon.map(({ icon: Icon, label }) => (
            <span key={label} className={`${styles.navItem} ${styles.disabled}`}>
              <Icon size={18} />
              <span>{label}</span>
              <span className={styles.badge}>Pronto</span>
            </span>
          ))}
        </nav>

        {/* ── Footer icons ── */}
        <div className={styles.sidebarFooter}>
          <div className={styles.footerTopRow}>
            <Link
              to="/admin"
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
        <Outlet />
      </main>
    </div>
  )
}
