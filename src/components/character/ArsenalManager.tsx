import { useState } from 'react'
import { Plus, Trash2, Sword, Shield, Check, Pencil } from 'lucide-react'
import { Card, Button, Input } from '../ui'
import { generateId } from '../../store'
import type { Weapon, Armor } from '../../store'
import styles from './ArsenalManager.module.css'

interface ArsenalManagerProps {
  weapons: Weapon[]
  armor: Armor[]
  bab: number
  strMod: number
  dexMod: number
  onWeaponsChange: (weapons: Weapon[]) => void
  onArmorChange: (armor: Armor[]) => void
}

const ARMOR_TYPE_LABELS: Record<Armor['type'], string> = {
  light: 'Ligera',
  medium: 'Media',
  heavy: 'Pesada',
  shield: 'Escudo',
}

const DEFAULT_WEAPON = {
  name: '', attackBonus: 0, damage: '1d6', critical: '×2', range: 'Melee', type: 'Cortante', notes: '',
}
const DEFAULT_ARMOR: Omit<Armor, 'id'> = {
  name: '', type: 'light', acBonus: 1, armorCheckPenalty: 0, maxDex: null,
  spellFailure: 0, weight: 15, equipped: false, notes: '',
}

export function ArsenalManager({
  weapons, armor, bab, strMod, dexMod, onWeaponsChange, onArmorChange,
}: ArsenalManagerProps) {
  const [addingWeapon, setAddingWeapon] = useState(false)
  const [addingArmor, setAddingArmor]   = useState(false)
  const [newWeapon, setNewWeapon] = useState(DEFAULT_WEAPON)
  const [newArmor, setNewArmor]   = useState<Omit<Armor, 'id'>>(DEFAULT_ARMOR)
  const [editingWeaponId, setEditingWeaponId] = useState<string | null>(null)
  const [editingWeapon, setEditingWeapon] = useState<Weapon | null>(null)
  const [editingArmorId, setEditingArmorId] = useState<string | null>(null)
  const [editingArmor, setEditingArmor] = useState<Armor | null>(null)

  const startEditWeapon = (w: Weapon) => {
    setEditingWeaponId(w.id)
    setEditingWeapon({ ...w })
    setAddingWeapon(false)
  }
  const saveWeapon = () => {
    if (!editingWeapon) return
    onWeaponsChange(weapons.map((w) => w.id === editingWeapon.id ? editingWeapon : w))
    setEditingWeaponId(null)
    setEditingWeapon(null)
  }

  const startEditArmor = (a: Armor) => {
    setEditingArmorId(a.id)
    setEditingArmor({ ...a })
    setAddingArmor(false)
  }
  const saveArmor = () => {
    if (!editingArmor) return
    onArmorChange(armor.map((a) => a.id === editingArmor.id ? editingArmor : a))
    setEditingArmorId(null)
    setEditingArmor(null)
  }

  // ── AC computation ──
  const equippedBody   = armor.find((a) => a.equipped && a.type !== 'shield')
  const equippedShield = armor.find((a) => a.equipped && a.type === 'shield')
  const effectiveDex   = equippedBody
    ? Math.min(dexMod, equippedBody.maxDex ?? 99)
    : dexMod
  const computedAC = 10 + effectiveDex + (equippedBody?.acBonus ?? 0) + (equippedShield?.acBonus ?? 0)

  // ── Weapon helpers ──
  const calcAttack = (bonus: number, isRanged: boolean) =>
    bab + (isRanged ? dexMod : strMod) + bonus

  const addWeapon = () => {
    if (!newWeapon.name.trim()) return
    onWeaponsChange([...weapons, { id: generateId(), ...newWeapon }])
    setNewWeapon(DEFAULT_WEAPON)
    setAddingWeapon(false)
  }

  // ── Armor helpers ──
  const toggleEquip = (id: string, type: Armor['type']) => {
    onArmorChange(armor.map((a) => {
      if (a.id === id) return { ...a, equipped: !a.equipped }
      // Only one body armor and one shield at a time
      if (type !== 'shield' && a.type !== 'shield' && a.equipped) return { ...a, equipped: false }
      if (type === 'shield' && a.type === 'shield' && a.equipped) return { ...a, equipped: false }
      return a
    }))
  }

  const addArmorPiece = () => {
    if (!newArmor.name.trim()) return
    onArmorChange([...armor, { id: generateId(), ...newArmor }])
    setNewArmor(DEFAULT_ARMOR)
    setAddingArmor(false)
  }

  return (
    <div className={styles.split}>
      {/* ══════════════ ARMAS ══════════════ */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <Sword size={16} className={styles.panelIcon} />
          <h4 className={styles.panelTitle}>Armas</h4>
          <span className={styles.countBadge}>{weapons.length}</span>
          <Button variant="secondary" size="sm" onClick={() => setAddingWeapon(true)}>
            <Plus size={14} />
            Añadir
          </Button>
        </div>

        {addingWeapon && (
          <Card padding="md" className={styles.addForm}>
            <div className={styles.formGrid}>
              <Input label="Nombre" value={newWeapon.name}
                onChange={(e) => setNewWeapon({ ...newWeapon, name: e.target.value })}
                placeholder="Espada larga" />
              <Input label="Bono ataque" type="number" value={newWeapon.attackBonus}
                onChange={(e) => setNewWeapon({ ...newWeapon, attackBonus: +e.target.value || 0 })} />
              <Input label="Daño" value={newWeapon.damage}
                onChange={(e) => setNewWeapon({ ...newWeapon, damage: e.target.value })}
                placeholder="1d8" />
              <Input label="Crítico" value={newWeapon.critical}
                onChange={(e) => setNewWeapon({ ...newWeapon, critical: e.target.value })}
                placeholder="19–20/×2" />
              <Input label="Alcance" value={newWeapon.range}
                onChange={(e) => setNewWeapon({ ...newWeapon, range: e.target.value })}
                placeholder="Melee / 30 ft" />
              <Input label="Tipo de daño" value={newWeapon.type}
                onChange={(e) => setNewWeapon({ ...newWeapon, type: e.target.value })}
                placeholder="Cortante" />
              <Input label="Notas" value={newWeapon.notes}
                onChange={(e) => setNewWeapon({ ...newWeapon, notes: e.target.value })}
                placeholder="+1 llameante" />
            </div>
            <div className={styles.formActions}>
              <Button variant="ghost" onClick={() => setAddingWeapon(false)}>Cancelar</Button>
              <Button variant="primary" onClick={addWeapon}>Añadir Arma</Button>
            </div>
          </Card>
        )}

        {weapons.length === 0 ? (
          <p className={styles.emptyMsg}>Sin armas añadidas</p>
        ) : (
          <div className={styles.itemList}>
            {weapons.map((w) => {
              if (editingWeaponId === w.id && editingWeapon) {
                return (
                  <Card key={w.id} padding="md" className={styles.addForm}>
                    <div className={styles.formGrid}>
                      <Input label="Nombre" value={editingWeapon.name}
                        onChange={(e) => setEditingWeapon({ ...editingWeapon, name: e.target.value })}/>
                      <Input label="Bono ataque" type="number" value={editingWeapon.attackBonus}
                        onChange={(e) => setEditingWeapon({ ...editingWeapon, attackBonus: +e.target.value || 0 })}/>
                      <Input label="Daño" value={editingWeapon.damage}
                        onChange={(e) => setEditingWeapon({ ...editingWeapon, damage: e.target.value })}/>
                      <Input label="Crítico" value={editingWeapon.critical}
                        onChange={(e) => setEditingWeapon({ ...editingWeapon, critical: e.target.value })}/>
                      <Input label="Alcance" value={editingWeapon.range}
                        onChange={(e) => setEditingWeapon({ ...editingWeapon, range: e.target.value })}/>
                      <Input label="Tipo de daño" value={editingWeapon.type}
                        onChange={(e) => setEditingWeapon({ ...editingWeapon, type: e.target.value })}/>
                      <Input label="Notas" value={editingWeapon.notes}
                        onChange={(e) => setEditingWeapon({ ...editingWeapon, notes: e.target.value })}/>
                    </div>
                    <div className={styles.formActions}>
                      <Button variant="ghost" onClick={() => { setEditingWeaponId(null); setEditingWeapon(null) }}>Cancelar</Button>
                      <Button variant="primary" onClick={saveWeapon}>Guardar</Button>
                    </div>
                  </Card>
                )
              }
              const isRanged = /ft|ranged/i.test(w.range)
              const total = calcAttack(w.attackBonus, isRanged)
              return (
                <div key={w.id} className={styles.weaponRow}>
                  <div className={styles.weaponInfo}>
                    <span className={styles.itemName}>{w.name}</span>
                    <span className={styles.itemMeta}>{w.type} · {w.range}{w.notes && ` · ${w.notes}`}</span>
                  </div>
                  <div className={styles.weaponStats}>
                    <div className={styles.statCol}>
                      <span className={styles.statLbl}>ATA</span>
                      <span className={styles.statVal}>{total >= 0 ? '+' : ''}{total}</span>
                    </div>
                    <div className={styles.statCol}>
                      <span className={styles.statLbl}>Daño</span>
                      <span className={styles.statVal}>{w.damage}</span>
                    </div>
                    <div className={styles.statCol}>
                      <span className={styles.statLbl}>Crit</span>
                      <span className={styles.statVal}>{w.critical}</span>
                    </div>
                  </div>
                  <button className={styles.editBtn} onClick={() => startEditWeapon(w)}>
                    <Pencil size={14} />
                  </button>
                  <button className={styles.removeBtn}
                    onClick={() => onWeaponsChange(weapons.filter((x) => x.id !== w.id))}>
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ══════════════ ARMADURAS ══════════════ */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <Shield size={16} className={styles.panelIcon} />
          <h4 className={styles.panelTitle}>Armaduras</h4>
          <span className={styles.countBadge}>{armor.length}</span>
          <Button variant="secondary" size="sm" onClick={() => setAddingArmor(true)}>
            <Plus size={14} />
            Añadir
          </Button>
        </div>

        {/* Computed AC display */}
        <div className={styles.acDisplay}>
          <span className={styles.acNumber}>{computedAC}</span>
          <span className={styles.acLabel}>CA total</span>
          {equippedBody && (
            <span className={styles.acBreakdown}>
              10 + {effectiveDex} DES + {equippedBody.acBonus} arm{equippedShield ? ` + ${equippedShield.acBonus} esc` : ''}
            </span>
          )}
        </div>

        {addingArmor && (
          <Card padding="md" className={styles.addForm}>
            <div className={styles.formGrid}>
              <Input label="Nombre" value={newArmor.name}
                onChange={(e) => setNewArmor({ ...newArmor, name: e.target.value })}
                placeholder="Cota de malla" />
              <div className={styles.formField}>
                <label className={styles.formLabel}>Tipo</label>
                <select className={styles.formSelect}
                  value={newArmor.type}
                  onChange={(e) => setNewArmor({ ...newArmor, type: e.target.value as Armor['type'] })}>
                  <option value="light">Ligera</option>
                  <option value="medium">Media</option>
                  <option value="heavy">Pesada</option>
                  <option value="shield">Escudo</option>
                </select>
              </div>
              <Input label="Bonus CA" type="number" value={newArmor.acBonus}
                onChange={(e) => setNewArmor({ ...newArmor, acBonus: +e.target.value || 0 })} />
              <Input label="Pen. armadura" type="number" value={newArmor.armorCheckPenalty}
                onChange={(e) => setNewArmor({ ...newArmor, armorCheckPenalty: +e.target.value || 0 })} />
              <Input label="DES máx (vacío=∞)" type="number"
                value={newArmor.maxDex ?? ''}
                onChange={(e) => setNewArmor({ ...newArmor, maxDex: e.target.value === '' ? null : +e.target.value })} />
              <Input label="% Fallo arcano" type="number" value={newArmor.spellFailure}
                onChange={(e) => setNewArmor({ ...newArmor, spellFailure: +e.target.value || 0 })} />
              <Input label="Peso (lbs)" type="number" value={newArmor.weight}
                onChange={(e) => setNewArmor({ ...newArmor, weight: +e.target.value || 0 })} />
            </div>
            <div className={styles.formActions}>
              <Button variant="ghost" onClick={() => setAddingArmor(false)}>Cancelar</Button>
              <Button variant="primary" onClick={addArmorPiece}>Añadir Armadura</Button>
            </div>
          </Card>
        )}

        {armor.length === 0 ? (
          <p className={styles.emptyMsg}>Sin armadura equipada</p>
        ) : (
          <div className={styles.itemList}>
            {armor.map((a) => {
              if (editingArmorId === a.id && editingArmor) {
                return (
                  <Card key={a.id} padding="md" className={styles.addForm}>
                    <div className={styles.formGrid}>
                      <Input label="Nombre" value={editingArmor.name}
                        onChange={(e) => setEditingArmor({ ...editingArmor, name: e.target.value })}/>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>Tipo</label>
                        <select className={styles.formSelect} value={editingArmor.type}
                          onChange={(e) => setEditingArmor({ ...editingArmor, type: e.target.value as Armor['type'] })}>
                          <option value="light">Ligera</option>
                          <option value="medium">Media</option>
                          <option value="heavy">Pesada</option>
                          <option value="shield">Escudo</option>
                        </select>
                      </div>
                      <Input label="Bonus CA" type="number" value={editingArmor.acBonus}
                        onChange={(e) => setEditingArmor({ ...editingArmor, acBonus: +e.target.value || 0 })}/>
                      <Input label="Pen. armadura" type="number" value={editingArmor.armorCheckPenalty}
                        onChange={(e) => setEditingArmor({ ...editingArmor, armorCheckPenalty: +e.target.value || 0 })}/>
                      <Input label="DES máx (vacío=∞)" type="number"
                        value={editingArmor.maxDex ?? ''}
                        onChange={(e) => setEditingArmor({ ...editingArmor, maxDex: e.target.value === '' ? null : +e.target.value })}/>
                      <Input label="% Fallo arcano" type="number" value={editingArmor.spellFailure}
                        onChange={(e) => setEditingArmor({ ...editingArmor, spellFailure: +e.target.value || 0 })}/>
                      <Input label="Peso (lbs)" type="number" value={editingArmor.weight}
                        onChange={(e) => setEditingArmor({ ...editingArmor, weight: +e.target.value || 0 })}/>
                    </div>
                    <div className={styles.formActions}>
                      <Button variant="ghost" onClick={() => { setEditingArmorId(null); setEditingArmor(null) }}>Cancelar</Button>
                      <Button variant="primary" onClick={saveArmor}>Guardar</Button>
                    </div>
                  </Card>
                )
              }
              return (
                <div key={a.id} className={`${styles.armorRow} ${a.equipped ? styles.armorEquipped : ''}`}>
                  <div className={styles.armorInfo}>
                    <div className={styles.armorNameRow}>
                      <span className={styles.itemName}>{a.name}</span>
                      <span className={`${styles.typeChip} ${styles[`type_${a.type}`]}`}>
                        {ARMOR_TYPE_LABELS[a.type]}
                      </span>
                    </div>
                    <span className={styles.itemMeta}>
                      CA +{a.acBonus}
                      {a.armorCheckPenalty !== 0 && ` · ACP ${a.armorCheckPenalty}`}
                      {a.maxDex !== null && ` · DES máx ${a.maxDex}`}
                      {a.spellFailure > 0 && ` · ${a.spellFailure}% fallo arc.`}
                    </span>
                  </div>
                  <button
                    className={`${styles.equipBtn} ${a.equipped ? styles.equipBtnOn : ''}`}
                    onClick={() => toggleEquip(a.id, a.type)}
                    title={a.equipped ? 'Desequipar' : 'Equipar'}
                  >
                    {a.equipped ? <Check size={14} /> : 'Equipar'}
                  </button>
                  <button className={styles.editBtn} onClick={() => startEditArmor(a)}>
                    <Pencil size={14} />
                  </button>
                  <button className={styles.removeBtn}
                    onClick={() => onArmorChange(armor.filter((x) => x.id !== a.id))}>
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
