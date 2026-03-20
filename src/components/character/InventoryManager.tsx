import { useState } from 'react'
import { Plus, Trash2, Package, Coins, Weight } from 'lucide-react'
import { Card, Button, Input } from '../ui'
import { generateId } from '../../store'
import type { InventoryItem } from '../../store'
import styles from './InventoryManager.module.css'

interface InventoryManagerProps {
  items: InventoryItem[]
  gold: number
  silver: number
  copper: number
  platinum: number
  onChangeItems: (items: InventoryItem[]) => void
  onChangeCoins: (coins: { pp: number; gp: number; sp: number; cp: number }) => void
  carryCapacity: number
}

export function InventoryManager({
  items,
  gold,
  silver,
  copper,
  platinum,
  onChangeItems,
  onChangeCoins,
  carryCapacity,
}: InventoryManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, weight: 0, notes: '' })

  const totalWeight = items.reduce((sum, item) => sum + item.weight * item.quantity, 0)
  const isOverEncumbered = totalWeight > carryCapacity

  const addItem = () => {
    if (!newItem.name.trim()) return

    const item: InventoryItem = {
      id: generateId(),
      name: newItem.name,
      quantity: newItem.quantity,
      weight: newItem.weight,
      equipped: false,
      notes: newItem.notes,
    }

    onChangeItems([...items, item])
    setNewItem({ name: '', quantity: 1, weight: 0, notes: '' })
    setIsAdding(false)
  }

  const removeItem = (id: string) => {
    onChangeItems(items.filter((item) => item.id !== id))
  }

  const toggleEquipped = (id: string) => {
    onChangeItems(
      items.map((item) =>
        item.id === id ? { ...item, equipped: !item.equipped } : item
      )
    )
  }

  const updateQuantity = (id: string, delta: number) => {
    onChangeItems(
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    )
  }

  const updateCoin = (type: 'pp' | 'gp' | 'sp' | 'cp', delta: number) => {
    const coinValues = { pp: platinum, gp: gold, sp: silver, cp: copper }
    const newValue = Math.max(0, coinValues[type] + delta)
    const newCoins = { ...coinValues, [type]: newValue }
    onChangeCoins({ pp: newCoins.pp, gp: newCoins.gp, sp: newCoins.sp, cp: newCoins.cp })
  }

  const totalGoldValue = platinum * 10 + gold + silver * 0.1 + copper * 0.01

  return (
    <div className={styles.container}>
      <Card padding="md" className={styles.coinsCard}>
        <div className={styles.coinsHeader}>
          <Coins size={18} className={styles.coinsIcon} />
          <h4>Monedas</h4>
        </div>
        <div className={styles.coinsGrid}>
          <div className={styles.coinRow}>
            <span className={styles.coinLabel}>PP</span>
            <button className={styles.coinBtn} onClick={() => updateCoin('pp', -1)}>-</button>
            <span className={styles.coinValue}>{platinum}</span>
            <button className={styles.coinBtn} onClick={() => updateCoin('pp', 1)}>+</button>
          </div>
          <div className={styles.coinRow}>
            <span className={styles.coinLabel}>GP</span>
            <button className={styles.coinBtn} onClick={() => updateCoin('gp', -1)}>-</button>
            <span className={styles.coinValue}>{gold}</span>
            <button className={styles.coinBtn} onClick={() => updateCoin('gp', 1)}>+</button>
          </div>
          <div className={styles.coinRow}>
            <span className={styles.coinLabel}>SP</span>
            <button className={styles.coinBtn} onClick={() => updateCoin('sp', -1)}>-</button>
            <span className={styles.coinValue}>{silver}</span>
            <button className={styles.coinBtn} onClick={() => updateCoin('sp', 1)}>+</button>
          </div>
          <div className={styles.coinRow}>
            <span className={styles.coinLabel}>CP</span>
            <button className={styles.coinBtn} onClick={() => updateCoin('cp', -1)}>-</button>
            <span className={styles.coinValue}>{copper}</span>
            <button className={styles.coinBtn} onClick={() => updateCoin('cp', 1)}>+</button>
          </div>
        </div>
        <div className={styles.totalGold}>
          Total: <strong>{totalGoldValue.toFixed(2)} GP</strong>
        </div>
      </Card>

      <div className={styles.weightCard}>
        <div className={styles.weightInfo}>
          <Weight size={18} />
          <span>Peso Total:</span>
          <strong className={isOverEncumbered ? styles.overweight : ''}>
            {totalWeight.toFixed(1)} lbs
          </strong>
          <span className={styles.capacity}>/ {carryCapacity} lbs</span>
        </div>
        <div className={styles.weightBar}>
          <div
            className={`${styles.weightFill} ${isOverEncumbered ? styles.overweightFill : ''}`}
            style={{ width: `${Math.min(100, (totalWeight / carryCapacity) * 100)}%` }}
          />
        </div>
        {isOverEncumbered && (
          <p className={styles.encumberedWarning}>
            ¡Carga excesiva! Velocidad reducida a la mitad.
          </p>
        )}
      </div>

      <div className={styles.inventoryHeader}>
        <div className={styles.inventoryTitle}>
          <Package size={18} />
          <h4>Inventario ({items.length} objetos)</h4>
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
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Nombre del objeto"
            />
            <Input
              label="Cantidad"
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              min={1}
            />
            <Input
              label="Peso (lbs)"
              type="number"
              value={newItem.weight}
              onChange={(e) => setNewItem({ ...newItem, weight: parseFloat(e.target.value) || 0 })}
              step={0.1}
              min={0}
            />
          </div>
          <div className={styles.formActions}>
            <Button variant="ghost" onClick={() => setIsAdding(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={addItem}>
              Añadir
            </Button>
          </div>
        </Card>
      )}

      {items.length === 0 ? (
        <Card padding="md" className={styles.empty}>
          <p>Inventario vacío</p>
        </Card>
      ) : (
        <div className={styles.itemsList}>
          {items.map((item) => (
            <div
              key={item.id}
              className={`${styles.itemRow} ${item.equipped ? styles.equipped : ''}`}
            >
              <div className={styles.itemInfo}>
                <button
                  className={`${styles.equipBtn} ${item.equipped ? styles.isEquipped : ''}`}
                  onClick={() => toggleEquipped(item.id)}
                >
                  {item.equipped ? 'E' : '-'}
                </button>
                <span className={styles.itemName}>{item.name}</span>
                {item.equipped && <span className={styles.equippedBadge}>Equipado</span>}
              </div>
              <div className={styles.itemControls}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => updateQuantity(item.id, -1)}
                >
                  -
                </button>
                <span className={styles.qty}>x{item.quantity}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => updateQuantity(item.id, 1)}
                >
                  +
                </button>
                <span className={styles.itemWeight}>{(item.weight * item.quantity).toFixed(1)} lbs</span>
                <button
                  className={styles.deleteBtn}
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
