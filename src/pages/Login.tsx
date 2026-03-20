import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sword, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button, Input } from '../components/ui'
import styles from './Login.module.css'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Auth not implemented — localStorage-only app
    // Navigate to dashboard in a real implementation
  }

  return (
    <div className={styles.page}>
      {/* ── Left panel (decorative) ── */}
      <aside className={styles.leftPanel}>
        <Link to="/landing" className={styles.brand}>
          <div className={styles.brandIcon}>
            <Sword size={20} />
          </div>
          <span className={styles.brandName}>El Cronista</span>
        </Link>
        <div className={styles.quote}>
          <p className={styles.quoteText}>
            "El conocimiento es la armadura más poderosa.
            El cronista que registra la historia de los héroes
            es tan importante como los héroes mismos."
          </p>
          <span className={styles.quoteAuthor}>— Archivista de Absalom</span>
        </div>
        <div className={styles.decorDots}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.decorDot} />
          ))}
        </div>
      </aside>

      {/* ── Right panel (form) ── */}
      <main className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h1>Comienza tu Crónica</h1>
            <p>
              Accede a tus bestiarios, hechizos y registros históricos.
              El conocimiento de los reinos te espera.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <Input
                label="Correo del Cronista"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cronista@example.com"
              />
            </div>

            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña secreta"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className={styles.remember}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className={styles.checkbox}
                />
                Mantener sesión iniciada
              </label>
              <Link to="#" className={styles.forgotLink}>¿Olvidaste tu clave?</Link>
            </div>

            <Button variant="primary" size="lg" type="submit">
              Entrar al Archivo
            </Button>
          </form>

          {/* ── Divider ── */}
          <div className={styles.divider}>
            <span>o continúa con</span>
          </div>

          {/* ── Social ── */}
          <div className={styles.social}>
            <button className={styles.socialBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </button>
            <button className={styles.socialBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.82 19.82 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Continuar con Discord
            </button>
          </div>

          <p className={styles.registerLink}>
            ¿Aún no eres un cronista?{' '}
            <Link to="#">Regístrate aquí</Link>
          </p>

          <p className={styles.localNote}>
            También puedes{' '}
            <Link to="/">usar la app sin cuenta</Link>
            {' '}— tus datos se guardan en el navegador.
          </p>
        </div>
      </main>
    </div>
  )
}
