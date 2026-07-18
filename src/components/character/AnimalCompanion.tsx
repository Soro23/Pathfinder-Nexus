import { useEffect, useMemo, useState } from 'react'
import { PlusCircle, Trash2, Heart, Shield, Swords, ChevronDown, ChevronUp, AlertTriangle, Loader2 } from 'lucide-react'
import type { AnimalCompanion as AnimalCompanionType } from '../../store'
import { getModifierString } from '../../store'
import { COMPANION_TRICKS, COMPANION_FEAT_SUGGESTIONS } from '../../data/animalCompanions'
import { computeCompanionStats } from '../../engine'
import { useAnimalCompanionCatalog, fetchCompanionDetail } from '../../hooks/useAnimalCompanions'
import { COMPANION_TYPE_LABELS } from '../../types/animalCompanion'
import type { CompanionDetail, CompanionListItem, CompanionType } from '../../types/animalCompanion'
import { Button } from '../ui'
import styles from './AnimalCompanion.module.css'

interface Props {
  companion?: AnimalCompanionType
  onChange: (companion: AnimalCompanionType | undefined) => void
  isEditing: boolean
}

function sgn(n: number) { return n >= 0 ? `+${n}` : `${n}` }

function makeCompanionFromDetail(detail: CompanionDetail): AnimalCompanionType {
  const computed = computeCompanionStats(detail, 1)
  return {
    name: '',
    animalTypeId: detail.id,
    level: 1,
    hp: { current: computed.hd * 4, max: computed.hd * 4 },
    tricks: [],
    feats: [],
    customSpecialAbilities: [],
    attacks: computed.attacks.map(a => ({ name: a.name, bonus: computed.bab, damage: a.damage })),
    skills: {},
    notes: '',
  }
}

/** Selector de especie: filtro de texto + <select> agrupado por tipo de compañero. */
function SpeciesPicker({
  catalog, loading, value, onSelect, disabled,
}: {
  catalog: CompanionListItem[]
  loading: boolean
  value?: string
  onSelect: (id: string) => void
  disabled?: boolean
}) {
  const [filterText, setFilterText] = useState('')

  const grouped = useMemo(() => {
    const term = filterText.trim().toLowerCase()
    const filtered = term ? catalog.filter(c => c.name.toLowerCase().includes(term)) : catalog
    const types = Object.keys(COMPANION_TYPE_LABELS) as CompanionType[]
    return types
      .map(type => [type, filtered.filter(c => c.companionType === type)] as const)
      .filter(([, items]) => items.length > 0)
  }, [catalog, filterText])

  return (
    <div className={styles.typeRow} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <input
        className={styles.tableInput}
        placeholder="Buscar especie…"
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
        disabled={loading || disabled}
      />
      <select
        className={styles.typeSelect}
        value={value ?? ''}
        disabled={loading || disabled}
        onChange={e => e.target.value && onSelect(e.target.value)}
      >
        <option value="" disabled>{loading ? 'Cargando catálogo…' : 'Selecciona una especie…'}</option>
        {grouped.map(([type, items]) => (
          <optgroup key={type} label={COMPANION_TYPE_LABELS[type]}>
            {items.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </optgroup>
        ))}
      </select>
    </div>
  )
}

export function AnimalCompanion({ companion, onChange, isEditing }: Props) {
  const [newAbility, setNewAbility] = useState('')
  const [newFeat, setNewFeat] = useState('')
  const [statsExpanded, setStatsExpanded] = useState(true)

  const { catalog, loading: catalogLoading } = useAnimalCompanionCatalog()

  const [detail, setDetail] = useState<CompanionDetail | undefined>()
  const [detailLoading, setDetailLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!companion) { setDetail(undefined); setNotFound(false); return }
    let cancelled = false
    setDetailLoading(true)
    setNotFound(false)
    fetchCompanionDetail(companion.animalTypeId)
      .then(d => {
        if (cancelled) return
        setDetail(d)
        setNotFound(!d)
      })
      .catch(() => { if (!cancelled) setNotFound(true) })
      .finally(() => { if (!cancelled) setDetailLoading(false) })
    return () => { cancelled = true }
  }, [companion?.animalTypeId])

  if (!companion) {
    return (
      <div className={styles.empty}>
        <Swords size={40} className={styles.emptyIcon} />
        <h3>Sin Compañero Animal</h3>
        <p>Rangers y Druidas pueden vincular un compañero animal a su causa.</p>
        {isEditing && (
          <div style={{ width: '100%', maxWidth: 360 }}>
            <SpeciesPicker
              catalog={catalog}
              loading={catalogLoading}
              onSelect={async (id) => {
                setDetailLoading(true)
                const d = await fetchCompanionDetail(id)
                setDetailLoading(false)
                if (!d) return
                setDetail(d)
                onChange(makeCompanionFromDetail(d))
              }}
              disabled={detailLoading}
            />
          </div>
        )}
      </div>
    )
  }

  const update = (updates: Partial<AnimalCompanionType>) => onChange({ ...companion, ...updates })

  if (notFound && !detailLoading) {
    return (
      <div className={styles.companion}>
        <div className={styles.empty}>
          <AlertTriangle size={40} className={styles.emptyIcon} />
          <h3>Compañero no encontrado</h3>
          <p>
            «{companion.animalTypeId}» ya no existe en el catálogo actual. Selecciona una especie
            de nuevo para recalcular sus estadísticas (se conservan nombre, PV, trucos y dotes).
          </p>
          {isEditing && (
            <div style={{ width: '100%', maxWidth: 360 }}>
              <SpeciesPicker
                catalog={catalog}
                loading={catalogLoading}
                onSelect={async (id) => {
                  setDetailLoading(true)
                  const d = await fetchCompanionDetail(id)
                  setDetailLoading(false)
                  if (!d) return
                  setDetail(d)
                  const computed = computeCompanionStats(d, companion.level)
                  update({
                    animalTypeId: id,
                    attacks: computed.attacks.map(a => ({ name: a.name, bonus: computed.bab, damage: a.damage })),
                  })
                }}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (detailLoading || !detail) {
    return (
      <div className={styles.empty}>
        <Loader2 size={32} className={`${styles.emptyIcon} ${styles.spinner}`} />
        <p>Cargando estadísticas del compañero…</p>
      </div>
    )
  }

  const computed = computeCompanionStats(detail, companion.level)
  const maxTricks = computed.maxTricks

  // Rasgos automáticos: progresión por nivel + statblock del catálogo (ya combinados en el motor).
  const autoSpecials = computed.special

  const handleAnimalTypeChange = async (newId: string) => {
    setDetailLoading(true)
    const newDetail = await fetchCompanionDetail(newId)
    setDetailLoading(false)
    if (!newDetail) return
    setDetail(newDetail)
    const newComputed = computeCompanionStats(newDetail, companion.level)
    update({
      animalTypeId: newId,
      attacks: newComputed.attacks.map(a => ({ name: a.name, bonus: newComputed.bab, damage: a.damage })),
    })
  }

  const handleLevelChange = (newLevel: number) => {
    const clamped = Math.max(1, Math.min(20, newLevel))
    const newComputed = computeCompanionStats(detail, clamped)
    update({
      level: clamped,
      attacks: newComputed.attacks.map(a => ({ name: a.name, bonus: newComputed.bab, damage: a.damage })),
    })
  }

  const toggleTrick = (trick: string) => {
    if (companion.tricks.includes(trick)) {
      update({ tricks: companion.tricks.filter(t => t !== trick) })
    } else if (companion.tricks.length < maxTricks) {
      update({ tricks: [...companion.tricks, trick] })
    }
  }

  const abilityEntries: [string, number | undefined][] = [
    ['FUE', computed.str], ['DES', computed.dex], ['CON', computed.con],
    ['INT', computed.int], ['SAB', computed.wis], ['CAR', computed.cha],
  ]

  return (
    <div className={styles.companion}>
      {/* ── Header ── */}
      <div className={styles.companionHeader}>
        <div className={styles.companionAvatar}>
          {companion.name.charAt(0).toUpperCase() || detail.name.charAt(0)}
        </div>
        <div className={styles.companionInfo}>
          {isEditing ? (
            <input
              className={styles.nameInput}
              value={companion.name}
              onChange={e => update({ name: e.target.value })}
              placeholder="Nombre del compañero"
            />
          ) : (
            <h2 className={styles.companionName}>{companion.name || detail.name}</h2>
          )}
          {isEditing ? (
            <div className={styles.typeRow}>
              <SpeciesPicker
                catalog={catalog}
                loading={catalogLoading}
                value={companion.animalTypeId}
                onSelect={handleAnimalTypeChange}
              />
              <div className={styles.levelRow}>
                <span className={styles.levelLabel}>Nivel efectivo:</span>
                <button className={styles.levelBtn} onClick={() => handleLevelChange(companion.level - 1)}>−</button>
                <span className={styles.levelVal}>{companion.level}</span>
                <button className={styles.levelBtn} onClick={() => handleLevelChange(companion.level + 1)}>+</button>
              </div>
            </div>
          ) : (
            <p className={styles.companionMeta}>
              {detail.name} · Talla {companion.level >= (detail.advancementLevel ?? Infinity) ? detail.sizeAdvanced : detail.sizeStart} · Nivel {companion.level}
            </p>
          )}
        </div>
        {isEditing && (
          <Button variant="danger" onClick={() => onChange(undefined)}>
            <Trash2 size={16} />
            Desvincular
          </Button>
        )}
      </div>

      {/* ── HP + Saves ── */}
      <div className={styles.statsRow}>
        {/* HP */}
        <div className={styles.hpCard}>
          <Heart size={20} className={styles.hpIcon} />
          <div className={styles.hpValues}>
            <input
              type="number"
              className={styles.hpInput}
              value={companion.hp.current}
              onChange={e => update({ hp: { ...companion.hp, current: +e.target.value } })}
            />
            <span className={styles.hpSlash}>/</span>
            <input
              type="number"
              className={styles.hpInput}
              value={companion.hp.max}
              onChange={e => update({ hp: { ...companion.hp, max: +e.target.value } })}
            />
          </div>
          <span className={styles.hpLabel}>Puntos de Vida</span>
          <div className={styles.hpBar}>
            <div
              className={styles.hpBarFill}
              style={{ width: `${Math.max(0, Math.min(100, (companion.hp.current / companion.hp.max) * 100))}%` }}
            />
          </div>
          <div className={styles.hpQuickBtns}>
            <button className={styles.hpBtn} onClick={() => update({ hp: { ...companion.hp, current: Math.max(0, companion.hp.current - 1) } })}>−1</button>
            <button className={styles.hpBtn} onClick={() => update({ hp: { ...companion.hp, current: Math.min(companion.hp.max, companion.hp.current + 1) } })}>+1</button>
          </div>
        </div>

        {/* Saves */}
        <div className={styles.savesCard}>
          <Shield size={16} className={styles.savesIcon} />
          <h4 className={styles.savesTitle}>Salvaciones</h4>
          <div className={styles.saveRow}>
            <span>Fortaleza</span>
            <span className={styles.saveVal}>{sgn(computed.fort)}</span>
          </div>
          <div className={styles.saveRow}>
            <span>Reflejos</span>
            <span className={styles.saveVal}>{sgn(computed.ref)}</span>
          </div>
          <div className={styles.saveRow}>
            <span>Voluntad</span>
            <span className={styles.saveVal}>{sgn(computed.will)}</span>
          </div>
        </div>
      </div>

      {/* ── Auto-calculated Stats ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader} onClick={() => setStatsExpanded(e => !e)} style={{ cursor: 'pointer' }}>
          <h3 className={styles.sectionTitle} style={{ marginBottom: 0, paddingBottom: 0, background: 'none' }}>
            Stats Auto-calculados <span className={styles.autoBadge}>AUTO</span>
          </h3>
          {statsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {statsExpanded && (
          <>
            <div className={styles.statGrid}>
              <div className={styles.statBlock}>
                <span className={styles.statLabel}>DGs</span>
                <span className={styles.statVal}>{computed.hd}</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statLabel}>BAB</span>
                <span className={styles.statVal}>{sgn(computed.bab)}</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statLabel}>CA</span>
                <span className={styles.statVal}>{computed.ac}</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statLabel}>NA</span>
                <span className={styles.statVal}>{sgn(computed.naturalArmor)}</span>
              </div>
            </div>

            <div className={styles.abilityGrid}>
              {abilityEntries.map(([label, val]) => (
                <div key={label} className={styles.abilityBlock}>
                  <span className={styles.abilityAbbr}>{label}</span>
                  <span className={styles.abilityScore}>{val ?? '—'}</span>
                  <span className={styles.abilityMod}>{val !== undefined ? getModifierString(val) : ''}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Attacks ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Ataques</h3>
          {isEditing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => update({ attacks: [...companion.attacks, { name: '', bonus: computed.bab, damage: '1d6' }] })}
            >
              <PlusCircle size={14} />
              Añadir
            </Button>
          )}
        </div>
        <table className={styles.attacksTable}>
          <thead>
            <tr>
              <th>Ataque</th>
              <th>Bonif.</th>
              <th>Daño</th>
              {isEditing && <th />}
            </tr>
          </thead>
          <tbody>
            {companion.attacks.map((attack, i) => (
              <tr key={i}>
                <td>
                  {isEditing ? (
                    <input
                      className={styles.tableInput}
                      value={attack.name}
                      onChange={e => {
                        const updated = [...companion.attacks]
                        updated[i] = { ...attack, name: e.target.value }
                        update({ attacks: updated })
                      }}
                    />
                  ) : attack.name}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="number"
                      className={`${styles.tableInput} ${styles.tableInputSm}`}
                      value={attack.bonus}
                      onChange={e => {
                        const updated = [...companion.attacks]
                        updated[i] = { ...attack, bonus: +e.target.value }
                        update({ attacks: updated })
                      }}
                    />
                  ) : (
                    <span className={styles.attackBonus}>{sgn(attack.bonus)}</span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      className={styles.tableInput}
                      value={attack.damage}
                      onChange={e => {
                        const updated = [...companion.attacks]
                        updated[i] = { ...attack, damage: e.target.value }
                        update({ attacks: updated })
                      }}
                    />
                  ) : (
                    <span className={styles.attackDamage}>{attack.damage}</span>
                  )}
                </td>
                {isEditing && (
                  <td>
                    <button
                      className={styles.removeBtn}
                      onClick={() => update({ attacks: companion.attacks.filter((_, j) => j !== i) })}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {companion.attacks.length === 0 && (
              <tr><td colSpan={4} className={styles.emptyRow}>Sin ataques registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Tricks / Training ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            Trucos / Entrenamiento
          </h3>
          <span className={styles.trickCounter}>{companion.tricks.length}/{maxTricks}</span>
        </div>
        <div className={styles.tricksList}>
          {COMPANION_TRICKS.map(trick => {
            const learned = companion.tricks.includes(trick)
            const canLearn = !learned && companion.tricks.length < maxTricks
            return (
              <label key={trick} className={`${styles.trickItem} ${learned ? styles.trickLearned : ''} ${!learned && !canLearn ? styles.trickDisabled : ''}`}>
                <input
                  type="checkbox"
                  checked={learned}
                  onChange={() => toggleTrick(trick)}
                  disabled={!learned && !canLearn}
                />
                <span>{trick}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* ── Feats ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Dotes</h3>
          <span className={styles.trickCounter}>{companion.feats.length}/{computed.maxFeats}</span>
        </div>
        {isEditing && (
          <div className={styles.addRow}>
            <input
              className={styles.tableInput}
              list="feat-suggestions"
              placeholder="Nombre de dote…"
              value={newFeat}
              onChange={e => setNewFeat(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newFeat.trim()) {
                  update({ feats: [...companion.feats, newFeat.trim()] })
                  setNewFeat('')
                }
              }}
            />
            <datalist id="feat-suggestions">
              {COMPANION_FEAT_SUGGESTIONS.map(f => <option key={f} value={f} />)}
            </datalist>
            <Button variant="secondary" size="sm" onClick={() => {
              if (newFeat.trim()) {
                update({ feats: [...companion.feats, newFeat.trim()] })
                setNewFeat('')
              }
            }}>
              <PlusCircle size={14} />
            </Button>
          </div>
        )}
        <div className={styles.abilitiesChips}>
          {companion.feats.map((feat, i) => (
            <span key={i} className={styles.abilityChip}>
              {feat}
              {isEditing && (
                <button
                  className={styles.chipRemove}
                  onClick={() => update({ feats: companion.feats.filter((_, j) => j !== i) })}
                >×</button>
              )}
            </span>
          ))}
          {companion.feats.length === 0 && <p className={styles.emptyText}>Sin dotes registradas</p>}
        </div>
      </div>

      {/* ── Special Abilities ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Rasgos Especiales</h3>
          {isEditing && (
            <div className={styles.addRow}>
              <input
                className={styles.tableInput}
                placeholder="Rasgo personalizado…"
                value={newAbility}
                onChange={e => setNewAbility(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newAbility.trim()) {
                    update({ customSpecialAbilities: [...companion.customSpecialAbilities, newAbility.trim()] })
                    setNewAbility('')
                  }
                }}
              />
              <Button variant="secondary" size="sm" onClick={() => {
                if (newAbility.trim()) {
                  update({ customSpecialAbilities: [...companion.customSpecialAbilities, newAbility.trim()] })
                  setNewAbility('')
                }
              }}>
                <PlusCircle size={14} />
              </Button>
            </div>
          )}
        </div>
        <div className={styles.abilitiesChips}>
          {autoSpecials.map((ab, i) => (
            <span key={`auto-${i}`} className={`${styles.abilityChip} ${styles.autoChip}`}>{ab}</span>
          ))}
          {companion.customSpecialAbilities.map((ab, i) => (
            <span key={`custom-${i}`} className={styles.abilityChip}>
              {ab}
              {isEditing && (
                <button
                  className={styles.chipRemove}
                  onClick={() => update({ customSpecialAbilities: companion.customSpecialAbilities.filter((_, j) => j !== i) })}
                >×</button>
              )}
            </span>
          ))}
          {autoSpecials.length === 0 && companion.customSpecialAbilities.length === 0 && (
            <p className={styles.emptyText}>Sin rasgos especiales</p>
          )}
        </div>
      </div>

      {/* ── Notes ── */}
      {(isEditing || companion.notes) && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Notas</h3>
          {isEditing ? (
            <textarea
              className={styles.notesArea}
              value={companion.notes ?? ''}
              onChange={e => update({ notes: e.target.value })}
              placeholder="Notas sobre el compañero…"
              rows={3}
            />
          ) : (
            <p className={styles.notesText}>{companion.notes}</p>
          )}
        </div>
      )}
    </div>
  )
}
