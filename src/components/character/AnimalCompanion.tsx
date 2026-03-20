import { useState } from 'react'
import { PlusCircle, Trash2, Heart, Shield, Swords } from 'lucide-react'
import { AnimalCompanion as AnimalCompanionType, calculateModifier, getModifierString } from '../../store'
import { Button, Input } from '../ui'
import styles from './AnimalCompanion.module.css'

interface Props {
  companion?: AnimalCompanionType
  onChange: (companion: AnimalCompanionType | undefined) => void
  isEditing: boolean
}

const EMPTY_COMPANION: AnimalCompanionType = {
  name: '',
  type: 'Lobo',
  level: 1,
  hp: { current: 13, max: 13 },
  abilities: {
    strength: 13, dexterity: 15, constitution: 15,
    intelligence: 2, wisdom: 12, charisma: 6,
  },
  attacks: [{ name: 'Mordisco', bonus: 2, damage: '1d6+1' }],
  skills: { 'Percepción': 5 },
  specialAbilities: ['Vínculo de Bestia', 'Compartir Hechizos'],
}

const ABILITY_LABELS: Record<string, string> = {
  strength: 'FUE', dexterity: 'DES', constitution: 'CON',
  intelligence: 'INT', wisdom: 'SAB', charisma: 'CAR',
}

export function AnimalCompanion({ companion, onChange, isEditing }: Props) {
  const [newAbility, setNewAbility] = useState('')

  if (!companion) {
    return (
      <div className={styles.empty}>
        <Swords size={40} className={styles.emptyIcon} />
        <h3>Sin Compañero Animal</h3>
        <p>Rangers y Druidas pueden vincular un compañero animal a su causa.</p>
        {isEditing && (
          <Button variant="primary" onClick={() => onChange(EMPTY_COMPANION)}>
            <PlusCircle size={16} />
            Vincular Compañero
          </Button>
        )}
      </div>
    )
  }

  const update = (updates: Partial<AnimalCompanionType>) => {
    onChange({ ...companion, ...updates })
  }

  const fortSave = 2 + calculateModifier(companion.abilities.constitution)
  const refSave  = 2 + calculateModifier(companion.abilities.dexterity)
  const willSave = 0 + calculateModifier(companion.abilities.wisdom)

  return (
    <div className={styles.companion}>
      {/* ── Header ── */}
      <div className={styles.companionHeader}>
        <div className={styles.companionAvatar}>
          {companion.name.charAt(0).toUpperCase() || '?'}
        </div>
        <div className={styles.companionInfo}>
          {isEditing ? (
            <Input
              label="Nombre"
              value={companion.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Nombre del compañero"
            />
          ) : (
            <h2 className={styles.companionName}>{companion.name || 'Sin nombre'}</h2>
          )}
          <p className={styles.companionMeta}>
            {companion.type} · Nivel {companion.level}
          </p>
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
            {isEditing ? (
              <>
                <input
                  type="number"
                  className={styles.hpInput}
                  value={companion.hp.current}
                  onChange={(e) => update({ hp: { ...companion.hp, current: +e.target.value } })}
                />
                <span className={styles.hpSlash}>/</span>
                <input
                  type="number"
                  className={styles.hpInput}
                  value={companion.hp.max}
                  onChange={(e) => update({ hp: { ...companion.hp, max: +e.target.value } })}
                />
              </>
            ) : (
              <>
                <span className={styles.hpCurrent}>{companion.hp.current}</span>
                <span className={styles.hpSlash}>/</span>
                <span className={styles.hpMax}>{companion.hp.max}</span>
              </>
            )}
          </div>
          <span className={styles.hpLabel}>Puntos de Vida</span>
          <div className={styles.hpBar}>
            <div
              className={styles.hpBarFill}
              style={{ width: `${Math.max(0, Math.min(100, (companion.hp.current / companion.hp.max) * 100))}%` }}
            />
          </div>
          {!isEditing && (
            <div className={styles.hpQuickBtns}>
              <button className={styles.hpBtn} onClick={() => update({ hp: { ...companion.hp, current: Math.max(0, companion.hp.current - 1) } })}>−1</button>
              <button className={styles.hpBtn} onClick={() => update({ hp: { ...companion.hp, current: Math.min(companion.hp.max, companion.hp.current + 1) } })}>+1</button>
            </div>
          )}
        </div>

        {/* Saves */}
        <div className={styles.savesCard}>
          <Shield size={16} className={styles.savesIcon} />
          <h4 className={styles.savesTitle}>Salvaciones</h4>
          <div className={styles.saveRow}>
            <span>Fortaleza</span>
            <span className={styles.saveVal}>{fortSave >= 0 ? '+' : ''}{fortSave}</span>
          </div>
          <div className={styles.saveRow}>
            <span>Reflejos</span>
            <span className={styles.saveVal}>{refSave >= 0 ? '+' : ''}{refSave}</span>
          </div>
          <div className={styles.saveRow}>
            <span>Voluntad</span>
            <span className={styles.saveVal}>{willSave >= 0 ? '+' : ''}{willSave}</span>
          </div>
        </div>
      </div>

      {/* ── Abilities ── */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Atributos</h3>
        <div className={styles.abilityGrid}>
          {(Object.keys(ABILITY_LABELS) as (keyof typeof companion.abilities)[]).map((attr) => {
            const val = companion.abilities[attr]
            return (
              <div key={attr} className={styles.abilityBlock}>
                <span className={styles.abilityAbbr}>{ABILITY_LABELS[attr]}</span>
                {isEditing ? (
                  <input
                    type="number"
                    className={styles.abilityInput}
                    value={val}
                    min={1}
                    max={30}
                    onChange={(e) => update({ abilities: { ...companion.abilities, [attr]: +e.target.value } })}
                  />
                ) : (
                  <span className={styles.abilityScore}>{val}</span>
                )}
                <span className={styles.abilityMod}>{getModifierString(val)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Attacks ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Ataques</h3>
          {isEditing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => update({ attacks: [...companion.attacks, { name: '', bonus: 0, damage: '1d6' }] })}
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
                      onChange={(e) => {
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
                      onChange={(e) => {
                        const updated = [...companion.attacks]
                        updated[i] = { ...attack, bonus: +e.target.value }
                        update({ attacks: updated })
                      }}
                    />
                  ) : (
                    <span className={styles.attackBonus}>{attack.bonus >= 0 ? '+' : ''}{attack.bonus}</span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      className={styles.tableInput}
                      value={attack.damage}
                      onChange={(e) => {
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

      {/* ── Special Abilities ── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Rasgos Especiales</h3>
          {isEditing && (
            <div className={styles.addAbility}>
              <input
                className={styles.tableInput}
                placeholder="Ej: Evasión"
                value={newAbility}
                onChange={(e) => setNewAbility(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newAbility.trim()) {
                    update({ specialAbilities: [...companion.specialAbilities, newAbility.trim()] })
                    setNewAbility('')
                  }
                }}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (newAbility.trim()) {
                    update({ specialAbilities: [...companion.specialAbilities, newAbility.trim()] })
                    setNewAbility('')
                  }
                }}
              >
                <PlusCircle size={14} />
              </Button>
            </div>
          )}
        </div>
        <div className={styles.abilitiesChips}>
          {companion.specialAbilities.map((ab, i) => (
            <span key={i} className={styles.abilityChip}>
              {ab}
              {isEditing && (
                <button
                  className={styles.chipRemove}
                  onClick={() => update({ specialAbilities: companion.specialAbilities.filter((_, j) => j !== i) })}
                >
                  ×
                </button>
              )}
            </span>
          ))}
          {companion.specialAbilities.length === 0 && (
            <p className={styles.emptyText}>Sin rasgos especiales</p>
          )}
        </div>
      </div>
    </div>
  )
}
