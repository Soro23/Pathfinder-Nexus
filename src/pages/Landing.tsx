import { Link } from 'react-router-dom'
import { BookOpen, Sword, Package, PawPrint, ChevronRight, Scroll, Users } from 'lucide-react'
import { Button } from '../components/ui'
import styles from './Landing.module.css'

const FEATURES = [
  {
    icon: Scroll,
    title: 'Hoja de Personaje Digital',
    description: 'Todos tus atributos, combate, tiros de salvación y niveles de clase. Calculados al instante, sin errores.',
  },
  {
    icon: BookOpen,
    title: 'Gestor de Hechizos',
    description: 'Administra tu grimorio, slots por nivel y hechizos preparados. Desde cantrips hasta conjuros de nivel 9.',
  },
  {
    icon: Package,
    title: 'Inventario y Arsenal',
    description: 'Rastrea tu equipo, armas, monedas y peso de carga. Guarda notas en cada objeto y calcula tu capacidad.',
  },
  {
    icon: PawPrint,
    title: 'Compañero Animal',
    description: 'Rangers y Druidas pueden gestionar su compañero: stats, ataques, habilidades especiales y salvaciones.',
  },
]

export function Landing() {
  return (
    <div className={styles.landing}>
      {/* ── Navbar ── */}
      <header className={styles.navbar}>
        <div className={styles.navBrand}>
          <div className={styles.brandIcon}>
            <Sword size={18} />
          </div>
          <span className={styles.brandName}>El Cronista</span>
        </div>
        <nav className={styles.navLinks}>
          <Link to="/rules">Compendio</Link>
        </nav>
        <div className={styles.navActions}>
          <Link to="/login">
            <Button variant="secondary" size="sm">Entrar</Button>
          </Link>
          <Link to="/">
            <Button variant="primary" size="sm">Empezar</Button>
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Pathfinder Nexus · SRD 3.5</p>
          <h1 className={styles.heroTitle}>
            La Crónica de<br />Tus Héroes
          </h1>
          <p className={styles.heroSubtitle}>
            Gestiona tus personajes de Pathfinder con la precisión de un grimorio arcano
            y la elegancia de un cuaderno de cronista premium. Sin papel, sin cálculos manuales.
          </p>
          <div className={styles.heroActions}>
            <Link to="/">
              <Button variant="primary" size="lg">
                Comienza tu Crónica
                <ChevronRight size={20} />
              </Button>
            </Link>
            <Link to="/rules">
              <Button variant="secondary" size="lg">
                <BookOpen size={18} />
                Ver el Compendio
              </Button>
            </Link>
          </div>
          <p className={styles.heroBadge}>
            <Users size={14} />
            Sin cuenta requerida · Todo en tu navegador
          </p>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardAccent} />
            <div className={styles.heroCardBody}>
              <div className={styles.heroAvatar}>T</div>
              <div>
                <p className={styles.heroCharName}>Theron Ashveil</p>
                <p className={styles.heroCharMeta}>Humano · Guerrero · Nivel 8</p>
              </div>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatVal}>68</span>
                <span className={styles.heroStatLbl}>PV</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatVal}>19</span>
                <span className={styles.heroStatLbl}>CA</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatVal}>+8</span>
                <span className={styles.heroStatLbl}>BAB</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatVal}>+3</span>
                <span className={styles.heroStatLbl}>Fort</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className={styles.features}>
        <div className={styles.featuresHeader}>
          <h2>Todo lo que necesitas en un grimorio</h2>
          <p>Desde la creación hasta la batalla final, El Cronista te acompaña.</p>
        </div>
        <div className={styles.featuresGrid}>
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <h2>¿Listo para comenzar tu aventura?</h2>
        <p>Crea tu primer personaje en menos de 2 minutos. Sin registro, sin complicaciones.</p>
        <Link to="/characters/new">
          <Button variant="primary" size="lg">
            Crear mi Primer Personaje
            <ChevronRight size={20} />
          </Button>
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <p>El Cronista · Pathfinder Nexus · Basado en el SRD d20 System</p>
      </footer>
    </div>
  )
}
