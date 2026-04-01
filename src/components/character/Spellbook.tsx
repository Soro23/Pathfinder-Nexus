import { useState } from 'react'
import { ChevronDown, ChevronUp, Moon, RefreshCw } from 'lucide-react'
import { Card, Select } from '../ui'
import { SPELL_SCHOOLS, SPELL_TYPES, SpellLevel } from '../../data'
import { useSpells } from '../../hooks/useSpells'
import styles from './Spellbook.module.css'

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

interface SpellbookProps {
  knownSpells: string[]
  spellSlots: Record<SpellLevel, SpellSlot>
  abilityModifier: number
  classIds: string[]
  isEditing?: boolean
  onToggleKnown: (spellId: string) => void
  onToggleSlotPip: (level: SpellLevel, pipIndex: number) => void
  onLongRest: () => void
  onSyncSlots?: () => void
  onSetSlotMax?: (level: SpellLevel, max: number) => void
}

export function Spellbook({
  knownSpells,
  spellSlots,
  abilityModifier,
  classIds,
  isEditing,
  onToggleKnown,
  onToggleSlotPip,
  onLongRest,
  onSyncSlots,
  onSetSlotMax,
}: SpellbookProps) {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterSchool, setFilterSchool] = useState<string>('all')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [showKnownOnly, setShowKnownOnly] = useState(false)
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null)

  const levels: SpellLevel[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

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
    <div className={styles.container}>
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

            if (isLocked && !isEditing) {
              return (
                <div key={level} className={`${styles.slotRow} ${styles.slotRowLocked}`}>
                  <span className={styles.slotLevel}>
                    {level === 0 ? 'Cantrip' : `Nv ${level}`}
                  </span>
                  <span className={styles.slotLockedLabel}>—</span>
                </div>
              )
            }

            const max  = slot?.max  ?? 0
            const used = slot?.used ?? 0
            const available = max - used

            return (
              <div key={level} className={`${styles.slotRow} ${isLocked ? styles.slotRowLocked : ''}`}>
                <span className={styles.slotLevel}>
                  {level === 0 ? 'Cantrip' : `Nv ${level}`}
                </span>

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
                ) : (
                  <div className={styles.slotPipsArea}>
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
                    <span className={styles.slotCount}>
                      {available}/{max}
                    </span>
                    {level >= 1 && (
                      <span className={styles.slotDC} title="CD del conjuro">DC {10 + abilityModifier + level}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className={styles.slotHint}>Mod. lanzamiento: {abilityModifier >= 0 ? '+' : ''}{abilityModifier}</p>
      </div>

      <div className={styles.spellList}>
        {/* RF-P07: Magic type badge(s) */}
        {magicTypeBadges.length > 0 && (
          <div className={styles.magicTypeBadges}>
            {magicTypeBadges.map((label) => (
              <span key={label} className={styles.magicTypeBadge}>{label}</span>
            ))}
          </div>
        )}
        <div className={styles.filters}>
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

        {loading && (
          <div className={styles.loadingRow}>Cargando hechizos…</div>
        )}

        {!loading && (
          <div className={styles.resultsCount}>
            {total > spells.length
              ? `Mostrando ${spells.length} de ${total} hechizos`
              : `${spells.length} hechizo${spells.length !== 1 ? 's' : ''}`}
          </div>
        )}

        <div className={styles.spellsContainer}>
          {spells.map((spell) => {
            const isKnown = knownSpells.includes(spell.id)
            const isExpanded = expandedSpell === spell.id

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
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleKnown(spell.id)
                    }}
                  >
                    {isKnown ? '★' : '☆'}
                  </button>
                  <div className={styles.spellInfo}>
                    <span className={styles.spellName}>{spell.name}</span>
                    <span className={styles.spellMeta}>
                      {spell.school} {spell.descriptor && `(${spell.descriptor})`}
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
                      <div><strong>Tiempo:</strong> {spell.castingTime}</div>
                      <div><strong>Alcance:</strong> {spell.range}</div>
                      <div><strong>Duración:</strong> {spell.duration}</div>
                      {spell.target && <div><strong>Objetivo:</strong> {spell.target}</div>}
                      {spell.area && <div><strong>Área:</strong> {spell.area}</div>}
                      {spell.savingThrow && (
                        <div><strong>TS:</strong> {spell.savingThrow}</div>
                      )}
                      {spell.spellResistance && (
                        <div><strong>SR:</strong> {spell.spellResistance}</div>
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
