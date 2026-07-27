import { useState } from 'react'
import { ChevronDown, ChevronUp, Moon, RefreshCw, BookOpen, Star } from 'lucide-react'
import { Card, Select, HomebrewBadge } from '../ui'
import { SPELL_SCHOOLS, SPELL_TYPES, SpellLevel, calculateSpellDC, getClassById } from '../../data'
import { useSpells } from '../../hooks/useSpells'
import { useSpellsByIds } from '../../hooks/useSpellsByIds'
import { translateCastingTime, translateRange, translateDuration, translateSavingThrow, translateSpellResistance, translateSchool, translateDescriptor, translateUnits } from '../../lib/spellTermsEs'
import styles from './Spellbook.module.css'

// Tope de conjuros conocidos por nivel de conjuro, sumando la tabla `spellsKnown` de cada
// clase lanzadora espontánea (hechicero, bardo…) según SU propio nivel de clase. Las clases
// preparadoras de lista completa (clérigo, druida…) no tienen `spellsKnown` y no imponen
// tope aquí — conocen toda su lista, solo limitadas por lo que preparan cada día.
// Nota de arquitectura: igual que los slots, `knownSpells` es un único pool por nivel de
// conjuro, no uno por clase — en multiclase con dos lanzadores espontáneos esto suma sus
// topes en vez de mantenerlos separados por lista de conjuros.
function getKnownSpellCap(classes: { id: string; level: number }[], spellLevel: number): number | null {
  let cap: number | null = null
  for (const c of classes) {
    const row = getClassById(c.id)?.spellsKnown?.[c.level - 1]
    const val = row?.[spellLevel]
    if (val !== undefined) cap = (cap ?? 0) + val
  }
  return cap
}

interface SpellSlot {
  max: number
  used: number
}

// Maps classId → spell type(s) available to that class
const CLASS_SPELL_TYPES: Record<string, Array<'arcane' | 'divine'>> = {
  wizard:    ['arcane'],
  sorcerer:  ['arcane'],
  bard:      ['arcane'],
  cleric:    ['divine'],
  druid:     ['divine'],
  paladin:   ['divine'],
  ranger:    ['divine'],
}

// Maps classId → human-readable magic type label
const CLASS_MAGIC_LABEL: Record<string, string> = {
  wizard:   'Arcano',
  sorcerer: 'Arcano',
  bard:     'Bárdico',
  cleric:   'Divino',
  druid:    'Divino',
  paladin:  'Divino',
  ranger:   'Divino',
}

const PREPARED_CASTER_IDS = ['wizard', 'cleric', 'druid', 'paladin', 'ranger']

interface SpellbookProps {
  knownSpells: string[]
  preparedSpells?: string[]
  spellSlots: Record<SpellLevel, SpellSlot>
  abilityModifier: number
  classIds: string[]
  classes?: { id: string; level: number }[]
  isEditing?: boolean
  /** Fuerza el panel de slots a apilarse en una sola columna, para contenedores estrechos (p.ej. un Drawer lateral). */
  compact?: boolean
  onToggleKnown: (spellId: string) => void
  onTogglePrepared?: (spellId: string) => void
  onToggleSlotPip: (level: SpellLevel, pipIndex: number) => void
  onLongRest: () => void
  onSyncSlots?: () => void
  onSetSlotMax?: (level: SpellLevel, max: number) => void
}

export function Spellbook({
  knownSpells,
  preparedSpells = [],
  spellSlots,
  abilityModifier,
  classIds,
  classes = [],
  isEditing,
  compact = false,
  onToggleKnown,
  onTogglePrepared,
  onToggleSlotPip,
  onLongRest,
  onSyncSlots,
  onSetSlotMax,
}: SpellbookProps) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSchool, setFilterSchool] = useState<string>('all')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  // En el panel lateral de Modo Juego (compact) se abre filtrado a "Solo conocidos"
  // por defecto: es la vista que se usa en partida y evita cargar/renderizar todo el
  // listado de conjuros de la clase en cada apertura del drawer.
  const [showKnownOnly, setShowKnownOnly] = useState(compact)
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null)
  const [spellView, setSpellView] = useState<'book' | 'prepared'>('book')

  const levels: SpellLevel[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  const isPreparedCaster = classIds.some(id => PREPARED_CASTER_IDS.includes(id))

  const { spells: preparedSpellData } = useSpellsByIds(preparedSpells)
  const { spells: knownSpellData } = useSpellsByIds(knownSpells)
  const knownCountAtLevel = (level: number) =>
    Object.values(knownSpellData).filter((s) => s.level === level).length

  const { spells, loading, total } = useSpells({
    search,
    type: filterType,
    school: filterSchool,
    level: filterLevel,
    classIds,
    showKnownOnly,
    knownSpellIds: knownSpells,
  })

  // Collect all spell types available to the character's classes
  const allowedTypes = new Set<string>(
    classIds.flatMap((id) => CLASS_SPELL_TYPES[id] ?? [])
  )
  const filterByClass = allowedTypes.size > 0
  const presentTypes = filterByClass ? [...allowedTypes] as ('arcane' | 'divine')[] : ['arcane', 'divine'] as const

  // RF-P07: Derive unique magic type labels for badge display
  const magicTypeBadges = [...new Set(
    classIds.map((id) => CLASS_MAGIC_LABEL[id]).filter(Boolean)
  )]

  return (
    <div className={`${styles.container} ${compact ? styles.containerCompact : ''}`}>
      <div className={styles.slotsPanel}>
        <div className={styles.slotsPanelHeader}>
          <h3 className={styles.sectionTitle}>Slots</h3>
          <div className={styles.slotsPanelActions}>
            {onSyncSlots && (
              <button className={styles.slotActionBtn} onClick={onSyncSlots} title="Sincronizar slots con clase">
                <RefreshCw size={13} />
              </button>
            )}
            <button className={styles.slotRestBtn} onClick={onLongRest} title="Descanso largo — recuperar todos los slots">
              <Moon size={13} />
              <span>Descanso</span>
            </button>
          </div>
        </div>

        <div className={styles.slotsGrid}>
          {levels.map((level) => {
            const slot = spellSlots[level]
            const isLocked = !slot || slot.max === 0
            const max  = slot?.max  ?? 0
            const used = slot?.used ?? 0
            const available = max - used

            return (
              <div key={level} className={`${styles.slotRow} ${isLocked && !isEditing ? styles.slotRowLocked : ''}`}>
                <div className={styles.slotRowTop}>
                  <span className={styles.slotLevel}>
                    {level === 0 ? 'Cantrip' : `Nv ${level}`}
                  </span>
                  {isLocked && !isEditing ? (
                    <span className={styles.slotLockedLabel}>—</span>
                  ) : !isEditing && (
                    <span className={styles.slotRowMeta}>
                      <span className={styles.slotCount}>{available}/{max}</span>
                      {level >= 1 && (
                        <span className={styles.slotDC} title="CD del conjuro">DC {calculateSpellDC(level, abilityModifier)}</span>
                      )}
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className={styles.slotEditRow}>
                    <span className={styles.slotEditLabel}>Máx:</span>
                    <input
                      className={styles.slotMaxInput}
                      type="number"
                      min={0}
                      max={9}
                      defaultValue={max}
                      onBlur={(e) => onSetSlotMax?.(level, Math.max(0, Math.min(9, parseInt(e.target.value) || 0)))}
                    />
                  </div>
                ) : !isLocked && (
                  <div className={styles.slotPips}>
                    {Array.from({ length: max }).map((_, i) => (
                      <button
                        key={i}
                        className={`${styles.slotPip} ${i < used ? styles.slotPipUsed : styles.slotPipAvail}`}
                        onClick={() => onToggleSlotPip(level, i)}
                        title={i < used ? 'Clic para recuperar' : 'Clic para gastar'}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className={styles.slotHint}>Mod. lanzamiento: {abilityModifier >= 0 ? '+' : ''}{abilityModifier}</p>
      </div>

      <div className={styles.spellList}>
        {/* Prepared caster view toggle */}
        {isPreparedCaster && (
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${spellView === 'book' ? styles.viewBtnActive : ''}`}
              onClick={() => setSpellView('book')}
            >
              <BookOpen size={13} /> Libro
            </button>
            <button
              className={`${styles.viewBtn} ${spellView === 'prepared' ? styles.viewBtnActive : ''}`}
              onClick={() => setSpellView('prepared')}
            >
              <Star size={13} /> Preparados hoy ({preparedSpells.length})
            </button>
          </div>
        )}

        {/* Prepared spells view */}
        {isPreparedCaster && spellView === 'prepared' && (
          <div className={styles.preparedPanel}>
            {preparedSpells.length === 0 ? (
              <p className={styles.preparedEmpty}>Sin conjuros preparados. Cambia a "Libro" para preparar hechizos.</p>
            ) : (
              <div className={styles.preparedList}>
                {[...new Set(preparedSpells)].map((spellId) => {
                  const spell = preparedSpellData[spellId]
                  const count = preparedSpells.filter(id => id === spellId).length
                  return (
                    <div key={spellId} className={styles.preparedRow}>
                      <div className={styles.preparedInfo}>
                        <span className={styles.preparedName}>{spell?.name ?? spellId}</span>
                        {spell && <span className={styles.preparedMeta}>Nv {spell.level} · {translateSchool(spell.school)}</span>}
                      </div>
                      {count > 1 && <span className={styles.preparedCount}>×{count}</span>}
                      <button
                        className={styles.preparedRemove}
                        onClick={() => onTogglePrepared?.(spellId)}
                        title="Quitar una preparación"
                      >×</button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* RF-P07: Magic type badge(s) */}
        {(spellView === 'book' || !isPreparedCaster) && magicTypeBadges.length > 0 && (
          <div className={styles.magicTypeBadges}>
            {magicTypeBadges.map((label) => (
              <span key={label} className={styles.magicTypeBadge}>{label}</span>
            ))}
          </div>
        )}
        <div className={styles.filters} style={isPreparedCaster && spellView === 'prepared' ? { display: 'none' } : {}}>
          {/* Type chips — only if more than one type is available */}
          {presentTypes.length > 1 && (
            <div className={styles.typeChips}>
              {SPELL_TYPES.filter((t) => t.value === 'all' || presentTypes.includes(t.value as 'arcane' | 'divine')).map((t) => (
                <button
                  key={t.value}
                  className={`${styles.typeChip} ${filterType === t.value ? styles.typeChipActive : ''}`}
                  onClick={() => setFilterType(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            placeholder="Buscar hechizo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <Select
            value={filterSchool}
            onChange={(e) => setFilterSchool(e.target.value)}
            options={[
              { value: 'all', label: 'Todas las escuelas' },
              ...SPELL_SCHOOLS.map((s) => ({ value: s, label: s })),
            ]}
          />
          <Select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            options={[
              { value: 'all', label: 'Todos los niveles' },
              { value: '0', label: 'Cantrip' },
              { value: '1', label: 'Nivel 1' },
              { value: '2', label: 'Nivel 2' },
              { value: '3', label: 'Nivel 3' },
              { value: '4', label: 'Nivel 4' },
              { value: '5', label: 'Nivel 5' },
              { value: '6', label: 'Nivel 6' },
              { value: '7', label: 'Nivel 7' },
              { value: '8', label: 'Nivel 8' },
              { value: '9', label: 'Nivel 9' },
            ]}
          />
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={showKnownOnly}
              onChange={(e) => setShowKnownOnly(e.target.checked)}
            />
            Solo conocidos
          </label>
        </div>

        {loading && !(isPreparedCaster && spellView === 'prepared') && (
          <div className={styles.loadingRow}>Cargando hechizos…</div>
        )}

        {!loading && !(isPreparedCaster && spellView === 'prepared') && (
          <div className={styles.resultsCount}>
            {total > spells.length
              ? `Mostrando ${spells.length} de ${total} hechizos`
              : `${spells.length} hechizo${spells.length !== 1 ? 's' : ''}`}
          </div>
        )}

        <div className={`${styles.spellsContainer} ${isPreparedCaster && spellView === 'prepared' ? styles.spellsHidden : ''}`}>
          {spells.map((spell) => {
            const isKnown = knownSpells.includes(spell.id)
            const isPrepared = preparedSpells.includes(spell.id)
            const isExpanded = expandedSpell === spell.id
            const slotsForLevel = spellSlots[spell.level as SpellLevel]
            const preparedCount = preparedSpells.filter(id => id === spell.id).length
            const knownCap = getKnownSpellCap(classes, spell.level)
            const knownCapReached = !isKnown && knownCap !== null && knownCountAtLevel(spell.level) >= knownCap

            return (
              <Card
                key={spell.id}
                padding="sm"
                hoverable
                className={`${styles.spellCard} ${isKnown ? styles.known : ''}`}
              >
                <div
                  className={styles.spellHeader}
                  onClick={() => setExpandedSpell(isExpanded ? null : spell.id)}
                >
                  <button
                    className={`${styles.knowBtn} ${isKnown ? styles.isKnown : ''}`}
                    disabled={knownCapReached}
                    title={knownCapReached ? `Tope de conjuros conocidos de nivel ${spell.level} alcanzado (${knownCap})` : undefined}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (knownCapReached) return
                      onToggleKnown(spell.id)
                    }}
                  >
                    {isKnown ? '★' : '☆'}
                  </button>
                  {isPreparedCaster && isKnown && spell.level > 0 && (
                    <button
                      className={`${styles.prepareBtn} ${isPrepared ? styles.prepareBtnActive : ''}`}
                      title={isPrepared ? `Preparado (×${preparedCount}) — clic para quitar` : 'Preparar hoy'}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (slotsForLevel && preparedSpells.filter(id => id === spell.id).length < (slotsForLevel.max || 0)) {
                          onTogglePrepared?.(spell.id)
                        } else if (isPrepared) {
                          onTogglePrepared?.(spell.id)
                        }
                      }}
                    >
                      {isPrepared ? `P${preparedCount > 1 ? `×${preparedCount}` : ''}` : 'P'}
                    </button>
                  )}
                  <div className={styles.spellInfo}>
                    <span className={styles.spellName}>{spell.name}</span>
                    {spell.source === 'Homebrew' && <HomebrewBadge />}
                    <span className={styles.spellMeta}>
                      {translateSchool(spell.school)} {spell.descriptor && `(${translateDescriptor(spell.descriptor)})`}
                    </span>
                  </div>
                  {spell.type === 'both' && (
                    <span className={styles.bothBadge} title="Arcano y Divino">A+D</span>
                  )}
                  <span className={styles.spellLevel}>
                    {spell.level === 0 ? 'C' : spell.level}
                  </span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {isExpanded && (
                  <div className={styles.spellDetails}>
                    <div className={styles.spellStats}>
                      <div><strong>Tiempo:</strong> {translateCastingTime(spell.castingTime)}</div>
                      <div><strong>Alcance:</strong> {translateRange(spell.range)}</div>
                      <div><strong>Duración:</strong> {translateDuration(spell.duration)}</div>
                      {spell.target && <div><strong>Objetivo:</strong> {translateUnits(spell.target)}</div>}
                      {spell.area && <div><strong>Área:</strong> {translateUnits(spell.area)}</div>}
                      {spell.savingThrow && (
                        <div><strong>TS:</strong> {translateSavingThrow(spell.savingThrow)}</div>
                      )}
                      {spell.spellResistance && (
                        <div><strong>RC:</strong> {translateSpellResistance(spell.spellResistance)}</div>
                      )}
                    </div>
                    <p className={styles.spellDesc}>{spell.description}</p>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
