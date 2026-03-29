import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { LogOut, Moon, Sun, Settings } from 'lucide-react'
import styles from './Tools.module.css'

export function Tools() {
  const { signOut } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()

  return (
    <div className={styles.toolsContainer}>
      <h2>Herramientas</h2>
      <div className={styles.toolsSection}>
        <Link to="/admin" className={styles.toolsItem}>
          <Settings size={20} />
          <span>Administración</span>
        </Link>
      </div>
      <div className={styles.toolsSection}>
        <button onClick={toggleTheme} className={styles.toolsItem}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span>{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</span>
        </button>
      </div>
      <div className={styles.toolsSection}>
        <button onClick={signOut} className={styles.toolsItem}>
          <LogOut size={20} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}