import { useState } from 'react'
import { PlusCircle, Trash2, Heart, Shield, Swords, ChevronDown, ChevronUp } from 'lucide-react'
import type { AnimalCompanion as AnimalCompanionType } from '../../store'
import { getModifierString } from '../../store'
import {
  ANIMAL_TYPES,
  COMPANION_PROGRESSION,
  COMPANION_TRICKS,
  COMPANION_FEAT_SUGGESTIONS,
  calculateCompanionStats,
} from '../../data/animalCompanions'
import { Button } from '../ui'
import styles from './AnimalCompanion.module.css'

interface Props {
  companion?: AnimalCompanionType
  onChange: (companion: AnimalCompanionType | undefined) => void
  isEditing: boolean
}

const DEFAULT_ANIMAL_ID = 'wolf'

function makeDefaultCompanion(): AnimalCompanionType {
  const base = ANIMAL_TYPES.find(a => a.id === DEFAULT_ANIMAL_ID)!
  const computed = calculateCompanionStats(base, 1)
  return {
    name: '',
    animalTypeId: DEFAULT_ANIMAL_ID,
    level: 1,
    hp: { current: computed.hd * 4, max: computed.hd * 4 },
    tricks: [],
    feats: [],
    customSpecialAbilities: [],
    attacks: base.attacks.map(a => ({ name: a.name, bonus: computed.bab, damage: a.damage })),
    skills: {},
    notes: '',
  }
}

function sgn(n: number) { return n >= 0 ? `+${n}` : `${n}` }

export function AnimalCompanion({ companion, onChange, isEditing }: Props) {
  const [newAbility, setNewAbility] = useState('')
  const [newFeat, setNewFeat] = useState('')
  const [statsExpanded, setStatsExpanded] = useState(true)

  if (!companion) {
    return (
      <div className={styles.empty}>
        <Swords size={40} className={styles.emptyIcon} />
        <h3>Sin Compañero Animal</h3>
        <p>Rangers y Druidas pueden vincular un compañero animal a su causa.</p>
        {isEditing && (
          <Button variant="primary" onClick={() => onChange(makeDefaultCompanion())}>
            <PlusCircle size={16} />
            Vincular Compañero
          </Button>
        )}
      </div>
    )
  }

  const update = (updates: Partial<AnimalCompanionType>) => onChange({ ...companion, ...updates })

  const base = ANIMAL_TYPES.find(a => a.id === companion.animalTypeId) ?? ANIMAL_TYPES[0]
  const prog = COMPANION_PROGRESSION[Math.min(companion.level - 1, 19)]
  const computed = calculateCompanionStats(base, companion.level)

  const maxTricks = 3 + prog.bonusTricks

  // Auto + custom special abilities
  const autoSpecials = [...prog.special, ...base.specialQualities, ...base.senses]

  const handleAnimalTypeChange = (newId: string) => {
    const newBase = ANIMAL_TYPES.find(a => a.id === newId)!
    const newComputed = calculateCompanionStats(newBase, companion.level)
    update({
      animalTypeId: newId,
      attacks: newBase.attacks.map(a => ({ name: a.name, bonus: newComputed.bab, damage: a.damage })),
    })
  }

  const handleLevelChange = (newLevel: number) => {
    const clamped = Math.max(1, Math.min(20, newLevel))
    const newComputed = calculateCompanionStats(base, clamped)
    update({
      level: clamped,
      attacks: companion.attacks.map(a => ({ ...a, bonus: newComputed.bab })),
    })
  }

  const toggleTrick = (trick: string) => {
    if (companion.tricks.includes(trick)) {
      update({ tricks: companion.tricks.filter(t => t !== trick) })
    } else if (companion.tricks.length < maxTricks) {
      update({ tricks: [...companion.tricks, trick] })
    }
  }

  return (
    <div className={styles.companion}>
      {/* ── Header ── */}
      <div className={styles.companionHeader}>
        <div className={styles.companionAvatar}>
          {companion.name.charAt(0).toUpperCase() || base.name.charAt(0)}
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
            <h2 className={styles.companionName}>{companion.name || base.name}</h2>
          )}
          {isEditing ? (
            <div className={styles.typeRow}>
              <select
                className={styles.typeSelect}
                value={companion.animalTypeId}
                onChange={e => handleAnimalTypeChange(e.target.value)}
              >
                {ANIMAL_TYPES.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.size})</option>
                ))}
              </select>
              <div className={styles.levelRow}>
                <span className={styles.levelLabel}>Nivel efectivo:</span>
                <button className={styles.levelBtn} onClick={() => handleLevelChange(companion.level - 1)}>−</button>
                <span className={styles.levelVal}>{companion.level}</span>
                <button className={styles.levelBtn} onClick={() => handleLevelChange(companion.level + 1)}>+</button>
              </div>
            </div>
          ) : (
            <p className={styles.companionMeta}>
              {base.name} · Talla {base.size} · Nivel {companion.level} · {base.speed}
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
              {([ ['FUE', computed.str], ['DES', computed.dex], ['CON', computed.con], ['INT', base.int], ['SAB', base.wis], ['CAR', base.cha] ] as [string, number][]).map(([label, val]) => (
                <div key={label} className={styles.abilityBlock}>
                  <span className={styles.abilityAbbr}>{label}</span>
                  <span className={styles.abilityScore}>{val}</span>
                  <span className={styles.abilityMod}>{getModifierString(val)}</span>
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
          <span className={styles.trickCounter}>{companion.feats.length}/{prog.feats}</span>
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
