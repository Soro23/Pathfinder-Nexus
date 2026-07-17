import { useState } from 'react'
import { Plus, Trash2, Sword, Shield, Check, Pencil, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Card, Button, Input } from '../ui'
import { generateId } from '../../store'
import type { Weapon, Armor, InventoryItem, EquipmentSlot, CustomSlot } from '../../store'
import { computeWeaponAttackBonus } from '../../engine'
import type { ResolvedStats } from '../../engine'
import styles from './ArsenalManager.module.css'

interface ArsenalManagerProps {
  weapons: Weapon[]
  armor: Armor[]
  bab: number
  strMod: number
  dexMod: number
  sizeMod: number
  ac: number
  resolvedStats: ResolvedStats
  onWeaponsChange: (weapons: Weapon[]) => void
  onArmorChange: (armor: Armor[]) => void
  inventory: InventoryItem[]
  equippedSlots: EquipmentSlot[]
  customSlots: CustomSlot[]
  onEquippedSlotsChange: (slots: EquipmentSlot[]) => void
  onCustomSlotsChange: (slots: CustomSlot[]) => void
}

const FIXED_SLOTS: { slotId: string; label: string; color: string }[] = [
  { slotId: 'head',       label: 'Cabeza',                    color: '#4fc3f7' },
  { slotId: 'headband',   label: 'Diadema / Casco',           color: '#81c784' },
  { slotId: 'eyes',       label: 'Ojos (gafas/visor)',        color: '#a5d6a7' },
  { slotId: 'neck',       label: 'Cuello (amuleto/collar)',   color: '#ef9a9a' },
  { slotId: 'shoulders',  label: 'Hombros',                   color: '#ffb74d' },
  { slotId: 'chest',      label: 'Pecho (armadura principal)', color: '#f44336' },
  { slotId: 'body',       label: 'Cuerpo (ropa/base)',        color: '#9ccc65' },
  { slotId: 'armor_extra',label: 'Armadura adicional',        color: '#8bc34a' },
  { slotId: 'belt',       label: 'Cinturón',                  color: '#ce93d8' },
  { slotId: 'wrists',     label: 'Muñecas',                   color: '#b39ddb' },
  { slotId: 'hands',      label: 'Manos (guantes)',           color: '#9575cd' },
  { slotId: 'ring1',      label: 'Anillo 1',                  color: '#4db6ac' },
  { slotId: 'ring2',      label: 'Anillo 2',                  color: '#26a69a' },
  { slotId: 'feet',       label: 'Pies (botas)',              color: '#42a5f5' },
]

const ARMOR_TYPE_LABELS: Record<Armor['type'], string> = {
  light: 'Ligera',
  medium: 'Media',
  heavy: 'Pesada',
  shield: 'Escudo',
}

const DEFAULT_WEAPON = {
  name: '', attackBonus: 0, damage: '1d6', critical: '×2', range: 'melee', type: 'Cortante', notes: '', grip: 'one-handed' as const,
}
const GRIP_LABELS: Record<NonNullable<Weapon['grip']>, string> = {
  'one-handed': 'Una mano',
  'two-handed': 'Dos manos (×1.5 FUE)',
  'off-hand': 'Mano secundaria (×0.5 FUE)',
}
const DEFAULT_ARMOR: Omit<Armor, 'id'> = {
  name: '', type: 'light', acBonus: 1, armorCheckPenalty: 0, maxDex: null,
  spellFailure: 0, weight: 15, equipped: false, notes: '',
}

export function ArsenalManager({
  weapons, armor, bab, strMod, dexMod, sizeMod, ac, resolvedStats, onWeaponsChange, onArmorChange,
  inventory, equippedSlots, customSlots, onEquippedSlotsChange, onCustomSlotsChange,
}: ArsenalManagerProps) {
  const [equipadoOpen, setEquipadoOpen] = useState(false)
  const [assigningSlot, setAssigningSlot] = useState<string | null>(null)
  const [newCustomLabel, setNewCustomLabel] = useState('')
  const [addingCustomSlot, setAddingCustomSlot] = useState(false)
  const [addingWeapon, setAddingWeapon] = useState(false)
  const [addingArmor, setAddingArmor]   = useState(false)
  const [newWeapon, setNewWeapon] = useState<Omit<Weapon, 'id'>>(DEFAULT_WEAPON)
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

  // ── AC display (el valor final ya viene calculado por engine/combatStats — ver CharacterView) ──
  const equippedBody   = armor.find((a) => a.equipped && a.type !== 'shield')
  const equippedShield = armor.find((a) => a.equipped && a.type === 'shield')
  const effectiveDex   = equippedBody
    ? Math.min(dexMod, equippedBody.maxDex ?? 99)
    : dexMod

  // ── Weapon helpers ──
  const calcAttack = (bonus: number, isRanged: boolean) =>
    computeWeaponAttackBonus(bab, isRanged ? dexMod : strMod, bonus, resolvedStats, sizeMod)

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

  // ── Equipment slot helpers ──
  const getSlotItem = (slotId: string): InventoryItem | undefined => {
    const slot = equippedSlots.find((s) => s.slotId === slotId)
    if (!slot?.itemId) return undefined
    return inventory.find((i) => i.id === slot.itemId)
  }

  const assignItem = (slotId: string, itemId: string) => {
    // Remove item from any other slot first
    const cleared = equippedSlots
      .filter((s) => s.slotId !== slotId)
      .map((s) => s.itemId === itemId ? { ...s, itemId: null } : s)
    const existing = cleared.find((s) => s.slotId === slotId)
    if (existing) {
      onEquippedSlotsChange(cleared.map((s) => s.slotId === slotId ? { ...s, itemId } : s))
    } else {
      onEquippedSlotsChange([...cleared, { slotId, itemId }])
    }
    setAssigningSlot(null)
  }

  const unassignItem = (slotId: string) => {
    onEquippedSlotsChange(equippedSlots.map((s) => s.slotId === slotId ? { ...s, itemId: null } : s))
  }

  const addCustomSlot = () => {
    if (!newCustomLabel.trim()) return
    onCustomSlotsChange([...customSlots, { id: generateId(), label: newCustomLabel.trim() }])
    setNewCustomLabel('')
    setAddingCustomSlot(false)
  }

  const removeCustomSlot = (id: string) => {
    onCustomSlotsChange(customSlots.filter((s) => s.id !== id))
    onEquippedSlotsChange(equippedSlots.filter((s) => s.slotId !== `custom_${id}`))
  }

  // Items not currently assigned to any slot
  const assignedItemIds = new Set(equippedSlots.map((s) => s.itemId).filter((id): id is string => id !== null))
  const availableItems = (slotId: string) => {
    const currentItemId = equippedSlots.find((s) => s.slotId === slotId)?.itemId
    return inventory.filter((i) => !assignedItemIds.has(i.id) || i.id === currentItemId)
  }

  const renderSlotRow = (slotId: string, label: string, color: string) => {
    const item = getSlotItem(slotId)
    const isAssigning = assigningSlot === slotId
    return (
      <div key={slotId} className={styles.slotRow}>
        <span className={styles.slotDot} style={{ background: color }} />
        <span className={styles.slotLabel}>{label}</span>
        {isAssigning ? (
          <div className={styles.slotAssignRow}>
            <select
              className={styles.slotSelect}
              defaultValue=""
              onChange={(e) => { if (e.target.value) assignItem(slotId, e.target.value) }}
            >
              <option value="" disabled>Seleccionar objeto...</option>
              {availableItems(slotId).map((i) => (
                <option key={i.id} value={i.id}>{i.name}{i.quantity > 1 ? ` (×${i.quantity})` : ''}</option>
              ))}
            </select>
            <button className={styles.slotCancelBtn} onClick={() => setAssigningSlot(null)}>
              <X size={12} />
            </button>
          </div>
        ) : item ? (
          <div className={styles.slotFilled}>
            <span className={styles.slotItemName}>{item.name}</span>
            <button className={styles.slotUnassignBtn} onClick={() => unassignItem(slotId)} title="Desequipar">
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className={styles.slotEmpty}>
            <span className={styles.slotEmptyText}>— vacío —</span>
            <button
              className={styles.slotAssignBtn}
              onClick={() => setAssigningSlot(slotId)}
              disabled={inventory.length === 0}
            >
              Asignar
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
    {/* ══════════════ EQUIPADO ══════════════ */}
    <div className={styles.equipadoSection}>
      <button className={styles.equipadoHeader} onClick={() => setEquipadoOpen((v) => !v)}>
        <span className={styles.equipadoTitle}>Equipado</span>
        <span className={styles.equipadoCount}>
          {equippedSlots.filter((s) => s.itemId).length} / {FIXED_SLOTS.length + customSlots.length}
        </span>
        {equipadoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {equipadoOpen && (
        <div className={styles.equipadoBody}>
          <div className={styles.slotsGrid}>
            {FIXED_SLOTS.map((s) => renderSlotRow(s.slotId, s.label, s.color))}
          </div>

          {/* Custom slots */}
          <div className={styles.customSlotsSection}>
            <span className={styles.customSlotsTitle}>Huecos personalizados (Homebrew)</span>
            {customSlots.length > 0 && (
              <div className={styles.slotsGrid}>
                {customSlots.map((cs) => {
                  const slotId = `custom_${cs.id}`
                  const item = getSlotItem(slotId)
                  const isAssigning = assigningSlot === slotId
                  return (
                    <div key={cs.id} className={`${styles.slotRow} ${styles.slotRowCustom}`}>
                      <span className={styles.slotDot} style={{ background: '#90a4ae' }} />
                      <span className={styles.slotLabel}>{cs.label}</span>
                      {isAssigning ? (
                        <div className={styles.slotAssignRow}>
                          <select
                            className={styles.slotSelect}
                            defaultValue=""
                            onChange={(e) => { if (e.target.value) assignItem(slotId, e.target.value) }}
                          >
                            <option value="" disabled>Seleccionar objeto...</option>
                            {availableItems(slotId).map((i) => (
                              <option key={i.id} value={i.id}>{i.name}{i.quantity > 1 ? ` (×${i.quantity})` : ''}</option>
                            ))}
                          </select>
                          <button className={styles.slotCancelBtn} onClick={() => setAssigningSlot(null)}>
                            <X size={12} />
                          </button>
                        </div>
                      ) : item ? (
                        <div className={styles.slotFilled}>
                          <span className={styles.slotItemName}>{item.name}</span>
                          <button className={styles.slotUnassignBtn} onClick={() => unassignItem(slotId)} title="Desequipar">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className={styles.slotEmpty}>
                          <span className={styles.slotEmptyText}>— vacío —</span>
                          <button
                            className={styles.slotAssignBtn}
                            onClick={() => setAssigningSlot(slotId)}
                            disabled={inventory.length === 0}
                          >
                            Asignar
                          </button>
                        </div>
                      )}
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeCustomSlot(cs.id)}
                        title="Eliminar hueco"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
            {addingCustomSlot ? (
              <div className={styles.addCustomRow}>
                <Input
                  value={newCustomLabel}
                  onChange={(e) => setNewCustomLabel(e.target.value)}
                  placeholder="Nombre del hueco..."
                  onKeyDown={(e) => { if (e.key === 'Enter') addCustomSlot() }}
                />
                <Button variant="ghost" size="sm" onClick={() => { setAddingCustomSlot(false); setNewCustomLabel('') }}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" onClick={addCustomSlot}>
                  Añadir
                </Button>
              </div>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setAddingCustomSlot(true)}>
                <Plus size={14} />
                Añadir hueco
              </Button>
            )}
          </div>
        </div>
      )}
    </div>

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
              <div className={styles.formField}>
                <label className={styles.formLabel}>Alcance</label>
                <select
                  className={styles.formSelect}
                  value={newWeapon.range}
                  onChange={(e) => setNewWeapon({ ...newWeapon, range: e.target.value })}
                >
                  <option value="melee">Cuerpo a cuerpo</option>
                  <option value="ranged">A distancia</option>
                </select>
              </div>
              {newWeapon.range === 'melee' && (
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Empuñadura</label>
                  <select
                    className={styles.formSelect}
                    value={newWeapon.grip}
                    onChange={(e) => setNewWeapon({ ...newWeapon, grip: e.target.value as Weapon['grip'] })}
                  >
                    {(Object.keys(GRIP_LABELS) as Array<NonNullable<Weapon['grip']>>).map((g) => (
                      <option key={g} value={g}>{GRIP_LABELS[g]}</option>
                    ))}
                  </select>
                </div>
              )}
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
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>Alcance</label>
                        <select
                          className={styles.formSelect}
                          value={editingWeapon.range}
                          onChange={(e) => setEditingWeapon({ ...editingWeapon, range: e.target.value })}
                        >
                          <option value="melee">Cuerpo a cuerpo</option>
                          <option value="ranged">A distancia</option>
                        </select>
                      </div>
                      {editingWeapon.range === 'melee' && (
                        <div className={styles.formField}>
                          <label className={styles.formLabel}>Empuñadura</label>
                          <select
                            className={styles.formSelect}
                            value={editingWeapon.grip ?? 'one-handed'}
                            onChange={(e) => setEditingWeapon({ ...editingWeapon, grip: e.target.value as Weapon['grip'] })}
                          >
                            {(Object.keys(GRIP_LABELS) as Array<NonNullable<Weapon['grip']>>).map((g) => (
                              <option key={g} value={g}>{GRIP_LABELS[g]}</option>
                            ))}
                          </select>
                        </div>
                      )}
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
              const isRanged = w.range === 'ranged'
              const total = calcAttack(w.attackBonus, isRanged)
              return (
                <div key={w.id} className={styles.weaponRow}>
                  <div className={styles.weaponInfo}>
                    <span className={styles.itemName}>{w.name}</span>
                    <span className={styles.itemMeta}>
                      {w.type} · {w.range === 'melee' ? 'Cuerpo a cuerpo' : 'A distancia'}
                      {w.range === 'melee' && w.grip && w.grip !== 'one-handed' && ` · ${GRIP_LABELS[w.grip]}`}
                      {w.notes && ` · ${w.notes}`}
                    </span>
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
          <span className={styles.acNumber}>{ac}</span>
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
    </div>
  )
}
