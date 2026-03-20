import { useState } from 'react'
import { Plus, Trash2, Sword } from 'lucide-react'
import { Card, Button, Input } from '../ui'
import { generateId } from '../../store'
import styles from './WeaponManager.module.css'

export interface Weapon {
  id: string
  name: string
  attackBonus: number
  damage: string
  critical: string
  range: string
  type: string
  notes: string
}

interface WeaponManagerProps {
  weapons: Weapon[]
  bab: number
  strMod: number
  dexMod: number
  onChange: (weapons: Weapon[]) => void
}

export function WeaponManager({ weapons, bab, strMod, dexMod, onChange }: WeaponManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newWeapon, setNewWeapon] = useState({
    name: '',
    attackBonus: 0,
    damage: '1d6',
    critical: 'x2',
    range: 'melee',
    type: 'slashing',
    notes: '',
  })

  const addWeapon = () => {
    if (!newWeapon.name.trim()) return

    const weapon: Weapon = {
      id: generateId(),
      ...newWeapon,
    }

    onChange([...weapons, weapon])
    setNewWeapon({
      name: '',
      attackBonus: 0,
      damage: '1d6',
      critical: 'x2',
      range: 'melee',
      type: 'slashing',
      notes: '',
    })
    setIsAdding(false)
  }

  const removeWeapon = (id: string) => {
    onChange(weapons.filter((w) => w.id !== id))
  }

  const calculateAttack = (bonus: number, isRanged: boolean) => {
    const mod = isRanged ? dexMod : strMod
    return bab + mod + bonus
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Sword size={18} />
          <h4>Armas ({weapons.length})</h4>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setIsAdding(true)}>
          <Plus size={16} />
          Añadir
        </Button>
      </div>

      {isAdding && (
        <Card padding="md" className={styles.addForm}>
          <div className={styles.formGrid}>
            <Input
              label="Nombre"
              value={newWeapon.name}
              onChange={(e) => setNewWeapon({ ...newWeapon, name: e.target.value })}
              placeholder="Espada larga"
            />
            <Input
              label="Ataque (Bono)"
              type="number"
              value={newWeapon.attackBonus}
              onChange={(e) => setNewWeapon({ ...newWeapon, attackBonus: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Daño"
              value={newWeapon.damage}
              onChange={(e) => setNewWeapon({ ...newWeapon, damage: e.target.value })}
              placeholder="1d8"
            />
            <Input
              label="Crítico"
              value={newWeapon.critical}
              onChange={(e) => setNewWeapon({ ...newWeapon, critical: e.target.value })}
              placeholder="x2"
            />
            <div className={styles.rangeField}>
              <label className={styles.rangeLabel}>Distancia</label>
              <select
                className={styles.rangeSelect}
                value={newWeapon.range}
                onChange={(e) => setNewWeapon({ ...newWeapon, range: e.target.value })}
              >
                <option value="melee">Cuerpo a cuerpo (FUE)</option>
                <option value="ranged">A distancia (DES)</option>
              </select>
            </div>
            <Input
              label="Tipo"
              value={newWeapon.type}
              onChange={(e) => setNewWeapon({ ...newWeapon, type: e.target.value })}
              placeholder="slashing"
            />
            <Input
              label="Notas"
              value={newWeapon.notes}
              onChange={(e) => setNewWeapon({ ...newWeapon, notes: e.target.value })}
              placeholder="Plus +1 flaming"
            />
          </div>
          <div className={styles.formActions}>
            <Button variant="ghost" onClick={() => setIsAdding(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={addWeapon}>
              Añadir Arma
            </Button>
          </div>
        </Card>
      )}

      {weapons.length === 0 ? (
        <Card padding="md" className={styles.empty}>
          <p>Sin armas añadidas</p>
        </Card>
      ) : (
        <div className={styles.weaponsList}>
          {weapons.map((weapon) => {
            const isRanged = weapon.range === 'ranged'
            const totalAttack = calculateAttack(weapon.attackBonus, isRanged)
            
            return (
              <div key={weapon.id} className={styles.weaponRow}>
                <div className={styles.weaponInfo}>
                  <span className={styles.weaponName}>{weapon.name}</span>
                  <span className={styles.weaponType}>
                    {weapon.type} · {isRanged ? 'A distancia' : 'Cuerpo a cuerpo'}
                  </span>
                  {weapon.notes && (
                    <span className={styles.weaponNotes}>{weapon.notes}</span>
                  )}
                </div>
                <div className={styles.weaponStats}>
                  <div className={styles.attackCol}>
                    <span className={styles.statLabel}>ATA</span>
                    <span className={styles.attackBonus}>
                      {totalAttack >= 0 ? '+' : ''}{totalAttack}
                    </span>
                  </div>
                  <div className={styles.damageCol}>
                    <span className={styles.statLabel}>Daño</span>
                    <span className={styles.damage}>{weapon.damage}</span>
                  </div>
                  <div className={styles.critCol}>
                    <span className={styles.statLabel}>Crit</span>
                    <span className={styles.critical}>{weapon.critical}</span>
                  </div>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => removeWeapon(weapon.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
