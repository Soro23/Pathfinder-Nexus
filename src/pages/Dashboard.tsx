import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusCircle, Heart, Shield, BookOpen, Sparkles, Backpack, Upload, Wand2, X, ImagePlus } from 'lucide-react'
import { useCharacterStore, calculateModifier } from '../store'
import type { Character } from '../store'
import { getClassById } from '../data'
import { TEMPLATES } from '../data/templates'
import { Button } from '../components/ui'
import styles from './Dashboard.module.css'

const SPELLCASTERS = ['wizard', 'sorcerer', 'cleric', 'druid', 'bard', 'ranger', 'paladin']

export function Dashboard() {
  const characters = useCharacterStore((state) => state.characters)
  const addCharacter = useCharacterStore((state) => state.addCharacter)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const [showTemplates, setShowTemplates] = useState(false)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Character
        if (!data.id || !data.name) throw new Error('JSON inválido')
        // Give it a fresh id to avoid collisions
        addCharacter({ ...data, id: `${data.id}-imported-${Date.now()}` })
      } catch {
        alert('No se pudo importar el personaje. Asegúrate de que es un JSON válido de Pathfinder Nexus.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleUseTemplate = (templateChar: Character) => {
    const newChar: Character = {
      ...templateChar,
      id: `char-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addCharacter(newChar)
    navigate(`/characters/${newChar.id}`)
  }

  return (
    <div className={styles.dashboard}>
      {/* ── Templates Modal ── */}
      {showTemplates && (
        <div className={styles.templatesOverlay} onClick={() => setShowTemplates(false)}>
          <div className={styles.templatesPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.templatesPanelHeader}>
              <div>
                <h2 className={styles.templatesPanelTitle}>Plantillas de Personaje</h2>
                <p className={styles.templatesPanelSub}>Comienza con un personaje listo para jugar</p>
              </div>
              <button className={styles.templatesClose} onClick={() => setShowTemplates(false)}><X size={20} /></button>
            </div>
            <div className={styles.templatesGrid}>
              {TEMPLATES.map((tpl) => (
                <button key={tpl.id} className={styles.templateCard} onClick={() => handleUseTemplate(tpl.character)}>
                  <div className={styles.templateCardHeader}>
                    <span className={styles.templateName}>{tpl.label}</span>
                    <span className={styles.templateRole}>{tpl.role}</span>
                  </div>
                  <p className={styles.templateDesc}>{tpl.desc}</p>
                  <span className={styles.templateCta}>Usar plantilla →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* ── Page header ── */}
      <header className={styles.header}>
        <div>
          <h1>Salón de Héroes</h1>
          <p className={styles.subtitle}>
            Tu registro de leyendas y viajeros. Gestiona tus hojas de personaje y prepara tu próxima incursión en las Tierras Interiores.
          </p>
        </div>
        <div className={styles.headerActions}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <Button variant="secondary" size="md" onClick={() => navigate('/characters/import')} title="Importar personaje desde imagen">
            <ImagePlus size={16} />
            Importar Imagen
          </Button>
          <Button variant="secondary" size="md" onClick={() => fileInputRef.current?.click()} title="Importar personaje desde JSON">
            <Upload size={16} />
            Importar JSON
          </Button>
          <Button variant="secondary" size="md" onClick={() => setShowTemplates(true)}>
            <Wand2 size={16} />
            Plantillas
          </Button>
          <Link to="/characters/new">
            <Button variant="primary" size="md">
              <PlusCircle size={18} />
              Nuevo Personaje
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Character grid ── */}
      <div className={styles.grid}>
        {characters.map((char) => {
          const hpPercent = Math.max(0, Math.min(100, (char.hp.current / char.hp.max) * 100))
          const primaryClassId = char.classes[0]?.id ?? ''
          const classData = getClassById(primaryClassId)
          const isSpellcaster = SPELLCASTERS.includes(primaryClassId)
          const hasCompanion = !!char.companion

          return (
            <Link key={char.id} to={`/characters/${char.id}`} className={styles.cardLink}>
              <div className={styles.characterCard}>
                {/* Color accent strip */}
                <div className={styles.cardAccent} />

                {/* Card header */}
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderLeft}>
                    <div className={styles.avatarPlaceholder}>
                      {char.imageUrl ? (
                        <img src={char.imageUrl} alt={char.name} className={styles.avatarImage} />
                      ) : (
                        char.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className={styles.characterName}>{char.name}</h3>
                      <p className={styles.classRace}>
                        {(classData?.name ?? char.classes.map(c => c.id).join('/')) + ' · ' + char.race}
                      </p>
                    </div>
                  </div>
                  <span className={styles.level}>Nv. {char.level}</span>
                </div>

                {/* Stats row */}
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <Heart size={14} className={styles.hpIcon} />
                    <div>
                      <span className={styles.statValue}>{char.hp.current}/{char.hp.max}</span>
                      <div className={styles.hpBarMini}>
                        <div
                          className={`${styles.hpBarMiniFill} ${hpPercent < 25 ? styles.hpDanger : hpPercent < 50 ? styles.hpWarning : ''}`}
                          style={{ width: `${hpPercent}%` }}
                        />
                      </div>
                    </div>
                    <span className={styles.statLabel}>PV</span>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.stat}>
                    <Shield size={14} className={styles.acIcon} />
                    <span className={styles.statValue}>{10 + calculateModifier(char.abilities.dexterity)}</span>
                    <span className={styles.statLabel}>CA</span>
                  </div>
                </div>

                {/* Action footer */}
                <div className={styles.cardFooter}>
                  <span className={styles.viewLink}>
                    <BookOpen size={14} />
                    Ver Hoja Detallada
                  </span>
                  {isSpellcaster && (
                    <span className={styles.contextualLink}>
                      <Sparkles size={13} />
                      Hechizos
                    </span>
                  )}
                  {hasCompanion && (
                    <span className={styles.contextualLink}>
                      <Backpack size={13} />
                      Compañero
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}

        {/* Create new card */}
        <Link to="/characters/new" className={styles.cardLink}>
          <div className={`${styles.characterCard} ${styles.createCard}`}>
            <PlusCircle size={36} className={styles.createIcon} />
            <h3>Crear Nuevo Personaje</h3>
            <p>Comienza una nueva gesta</p>
          </div>
        </Link>
      </div>

      {characters.length === 0 && (
        <p className={styles.emptyHint}>
          Crea tu primer personaje para comenzar tu aventura
        </p>
      )}
    </div>
  )
}
