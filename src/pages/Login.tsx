import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sword, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button, Input } from '../components/ui'
import { supabase } from '../lib/supabase'
import styles from './Login.module.css'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setError('Revisa tu correo para confirmar tu cuenta.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'discord') => {
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin + '/' } })
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
            <h1>{isRegister ? 'Crea tu Cuenta' : 'Comienza tu Crónica'}</h1>
            <p>
              {isRegister
                ? 'Regístrate para guardar tus personajes y campañas en la nube.'
                : 'Accede a tus bestiarios, hechizos y registros históricos. El conocimiento de los reinos te espera.'}
            </p>
          </div>

          {error && (
            <div style={{ color: 'var(--color-accent-gold)', fontSize: '0.875rem', padding: '0.5rem', border: '1px solid var(--color-accent-gold)', borderRadius: '4px' }}>
              {error}
            </div>
          )}

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

            <Button variant="primary" size="lg" type="submit" disabled={loading}>
              {loading ? 'Cargando...' : isRegister ? 'Crear Cuenta' : 'Entrar al Archivo'}
            </Button>
          </form>

          {/* ── Divider ── */}
          <div className={styles.divider}>
            <span>o continúa con</span>
          </div>

          {/* ── Social ── */}
          <div className={styles.social}>
            <button type="button" className={styles.socialBtn} onClick={() => handleOAuth('google')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </button>
          </div>

          <p className={styles.registerLink}>
            {isRegister ? '¿Ya tienes cuenta? ' : '¿Aún no eres un cronista? '}
            <button type="button" onClick={() => { setIsRegister(!isRegister); setError(null) }} style={{ background: 'none', border: 'none', color: 'var(--color-accent-gold)', cursor: 'pointer', padding: 0, font: 'inherit' }}>
              {isRegister ? 'Inicia sesión' : 'Regístrate aquí'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
