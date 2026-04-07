import { useState, useRef } from 'react'
import { Plus, Trash2, Package, Coins, Weight, Search, Loader, Star, FlaskConical } from 'lucide-react'
import { Card, Button, Input } from '../ui'
import { generateId } from '../../store'
import type { InventoryItem } from '../../store'
import { searchCatalogItems } from '../../lib/itemsService'
import type { CatalogItem } from '../../lib/itemsService'
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

type AddMode = 'manual' | 'catalog'

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
  const [addMode, setAddMode] = useState<AddMode>('manual')
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, weight: 0, notes: '' })

  // Catalog search state
  const [catalogQuery, setCatalogQuery] = useState('')
  const [catalogResults, setCatalogResults] = useState<CatalogItem[]>([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Quick gold state
  const [quickGoldAmount, setQuickGoldAmount] = useState('')

  const totalWeight = items.reduce((sum, item) => sum + item.weight * item.quantity, 0)
  const isOverEncumbered = totalWeight > carryCapacity
  const totalGoldValue = platinum * 10 + gold + silver * 0.1 + copper * 0.01

  const addItem = () => {
    if (!newItem.name.trim()) return
    const base: InventoryItem = {
      id: generateId(),
      name: newItem.name,
      quantity: newItem.quantity,
      weight: newItem.weight,
      equipped: false,
      notes: newItem.notes || undefined,
    }
    if (selectedCatalogItem) {
      base.itemDbId = selectedCatalogItem.id
      base.itemType = selectedCatalogItem.item_type
      base.priceGp = selectedCatalogItem.price_gp
      base.magical = selectedCatalogItem.magical
      base.consumable = selectedCatalogItem.consumable
      base.description = selectedCatalogItem.description
    }
    onChangeItems([...items, base])
    resetAddForm()
  }

  const resetAddForm = () => {
    setNewItem({ name: '', quantity: 1, weight: 0, notes: '' })
    setSelectedCatalogItem(null)
    setCatalogQuery('')
    setCatalogResults([])
    setIsAdding(false)
    setAddMode('manual')
  }

  const removeItem = (id: string) => {
    onChangeItems(items.filter((item) => item.id !== id))
  }

  const toggleEquipped = (id: string) => {
    onChangeItems(items.map((item) => item.id === id ? { ...item, equipped: !item.equipped } : item))
  }

  const updateQuantity = (id: string, delta: number) => {
    onChangeItems(items.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ))
  }

  const updateCoin = (type: 'pp' | 'gp' | 'sp' | 'cp', value: number) => {
    onChangeCoins({
      pp: type === 'pp' ? Math.max(0, value) : platinum,
      gp: type === 'gp' ? Math.max(0, value) : gold,
      sp: type === 'sp' ? Math.max(0, value) : silver,
      cp: type === 'cp' ? Math.max(0, value) : copper,
    })
  }

  const handleQuickGold = (sign: 1 | -1) => {
    const amount = parseFloat(quickGoldAmount)
    if (!amount || isNaN(amount) || amount <= 0) return
    updateCoin('gp', gold + sign * amount)
    setQuickGoldAmount('')
  }

  // Catalog search with debounce
  const handleCatalogSearch = (query: string) => {
    setCatalogQuery(query)
    setSelectedCatalogItem(null)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (!query.trim()) { setCatalogResults([]); return }
    setCatalogLoading(true)
    searchTimeout.current = setTimeout(async () => {
      const results = await searchCatalogItems(query)
      setCatalogResults(results)
      setCatalogLoading(false)
    }, 350)
  }

  const selectCatalogItem = (item: CatalogItem) => {
    setSelectedCatalogItem(item)
    setNewItem({
      name: item.name,
      quantity: 1,
      weight: item.weight ?? 0,
      notes: '',
    })
    setCatalogResults([])
    setCatalogQuery(item.name)
  }

  return (
    <div className={styles.container}>
      {/* ── Monedas ── */}
      <Card padding="md" className={styles.coinsCard}>
        <div className={styles.coinsHeader}>
          <Coins size={18} className={styles.coinsIcon} />
          <h4>Monedas</h4>
        </div>
        <div className={styles.coinsGrid}>
          {(['pp', 'gp', 'sp', 'cp'] as const).map((type) => {
            const val = type === 'pp' ? platinum : type === 'gp' ? gold : type === 'sp' ? silver : copper
            return (
              <div key={type} className={styles.coinRow}>
                <span className={`${styles.coinLabel} ${styles[`coin_${type}`]}`}>{type.toUpperCase()}</span>
                <button className={styles.coinBtn} onClick={() => updateCoin(type, val - 1)}>-</button>
                <input
                  className={styles.coinInput}
                  type="number"
                  min={0}
                  value={val}
                  onChange={(e) => updateCoin(type, parseInt(e.target.value) || 0)}
                />
                <button className={styles.coinBtn} onClick={() => updateCoin(type, val + 1)}>+</button>
              </div>
            )
          })}
        </div>

        {/* Quick gold transaction */}
        <div className={styles.quickGoldRow}>
          <input
            className={styles.quickGoldInput}
            type="number"
            min={1}
            placeholder="Cantidad GP..."
            value={quickGoldAmount}
            onChange={(e) => setQuickGoldAmount(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleQuickGold(1) }}
          />
          <button className={`${styles.quickGoldBtn} ${styles.quickGoldAdd}`} onClick={() => handleQuickGold(1)} title="Ganar GP">
            + GP
          </button>
          <button className={`${styles.quickGoldBtn} ${styles.quickGoldSub}`} onClick={() => handleQuickGold(-1)} title="Gastar GP">
            − GP
          </button>
        </div>

        <div className={styles.totalGold}>
          Total: <strong>{totalGoldValue.toFixed(2)} GP</strong>
        </div>
      </Card>

      {/* ── Peso ── */}
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
          <p className={styles.encumberedWarning}>¡Carga excesiva! Velocidad reducida a la mitad.</p>
        )}
      </div>

      {/* ── Inventario header ── */}
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

      {/* ── Add form ── */}
      {isAdding && (
        <Card padding="md" className={styles.addForm}>
          {/* Mode toggle */}
          <div className={styles.modeTabs}>
            <button
              className={`${styles.modeTab} ${addMode === 'manual' ? styles.modeTabActive : ''}`}
              onClick={() => { setAddMode('manual'); setSelectedCatalogItem(null) }}
            >
              Manual
            </button>
            <button
              className={`${styles.modeTab} ${addMode === 'catalog' ? styles.modeTabActive : ''}`}
              onClick={() => setAddMode('catalog')}
            >
              <Search size={13} />
              Buscar en catálogo
            </button>
          </div>

          {/* Catalog search */}
          {addMode === 'catalog' && (
            <div className={styles.catalogSearch}>
              <div className={styles.catalogInputRow}>
                <Search size={15} className={styles.catalogSearchIcon} />
                <input
                  className={styles.catalogInput}
                  placeholder="Buscar objeto por nombre..."
                  value={catalogQuery}
                  onChange={(e) => handleCatalogSearch(e.target.value)}
                  autoFocus
                />
                {catalogLoading && <Loader size={15} className={styles.catalogSpinner} />}
              </div>
              {catalogResults.length > 0 && (
                <div className={styles.catalogResults}>
                  {catalogResults.map((r) => (
                    <button key={r.id} className={styles.catalogResult} onClick={() => selectCatalogItem(r)}>
                      <div className={styles.catalogResultMain}>
                        <span className={styles.catalogResultName}>{r.name}</span>
                        <div className={styles.catalogResultBadges}>
                          {r.magical && <span className={styles.badgeMagical}><Star size={10} /> Mágico</span>}
                          {r.consumable && <span className={styles.badgeConsumable}><FlaskConical size={10} /> Consumible</span>}
                        </div>
                      </div>
                      <div className={styles.catalogResultMeta}>
                        <span className={styles.catalogResultType}>{r.item_type}{r.subtype ? ` · ${r.subtype}` : ''}</span>
                        {r.price_gp != null && <span className={styles.catalogResultPrice}>{r.price_gp} GP</span>}
                        {r.weight != null && <span>{r.weight} lbs</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {selectedCatalogItem && (
                <div className={styles.selectedCatalog}>
                  <span className={styles.selectedCatalogName}>✓ {selectedCatalogItem.name}</span>
                  {selectedCatalogItem.description && (
                    <p className={styles.selectedCatalogDesc}>{selectedCatalogItem.description}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Fields (always visible) */}
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
            <Button variant="ghost" onClick={resetAddForm}>Cancelar</Button>
            <Button variant="primary" onClick={addItem}>Añadir</Button>
          </div>
        </Card>
      )}

      {/* ── Item list ── */}
      {items.length === 0 ? (
        <Card padding="md" className={styles.empty}>
          <p>Inventario vacío</p>
        </Card>
      ) : (
        <div className={styles.itemsList}>
          {items.map((item) => (
            <div key={item.id} className={`${styles.itemRow} ${item.equipped ? styles.equipped : ''}`}>
              <div className={styles.itemInfo}>
                <button
                  className={`${styles.equipBtn} ${item.equipped ? styles.isEquipped : ''}`}
                  onClick={() => toggleEquipped(item.id)}
                  title={item.equipped ? 'Desequipar' : 'Equipar'}
                >
                  {item.equipped ? 'E' : '-'}
                </button>
                <div className={styles.itemNameBlock}>
                  <span className={styles.itemName}>{item.name}</span>
                  <div className={styles.itemBadges}>
                    {item.equipped && <span className={styles.equippedBadge}>Equipado</span>}
                    {item.magical && <span className={styles.badgeMagical}><Star size={9} /></span>}
                    {item.consumable && <span className={styles.badgeConsumable}><FlaskConical size={9} /></span>}
                    {item.priceGp != null && (
                      <span className={styles.badgePrice}>{item.priceGp} GP</span>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.itemControls}>
                <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, -1)}>-</button>
                <span className={styles.qty}>x{item.quantity}</span>
                <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, 1)}>+</button>
                <span className={styles.itemWeight}>{(item.weight * item.quantity).toFixed(1)} lbs</span>
                <button className={styles.deleteBtn} onClick={() => removeItem(item.id)}>
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
