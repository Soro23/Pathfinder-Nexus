import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Minus, Dices, History, Shield, Heart, Brain, Swords, Flame, X } from 'lucide-react'
import { useCharacterStore, calculateModifier, getModifierString } from '../store'
import { getClassById, getSaveForLevel, getBABForLevel } from '../data'
import { Button, Card } from '../components/ui'
import styles from './PlayMode.module.css'

function rollDice(notation: string): { total: number; rolls: number[] } {
  const match = notation.match(/(\d+)d(\d+)([+-]\d+)?/)
  if (!match) return { total: 0, rolls: [0] }

  const [, countStr, sidesStr, modifierStr] = match
  const count = parseInt(countStr)
  const sides = parseInt(sidesStr)
  const modifier = modifierStr ? parseInt(modifierStr) : 0

  const rolls: number[] = []
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1)
  }
  const subtotal = rolls.reduce((sum, r) => sum + r, 0)
  return { total: subtotal + modifier, rolls }
}

type CritEvent = { type: 'crit' | 'fumble'; name: string; roll: number }

export function PlayMode() {
  const { id } = useParams<{ id: string }>()
  const character = useCharacterStore((state) => state.getCharacter(id || ''))
  const updateCharacter = useCharacterStore((state) => state.updateCharacter)

  const [diceNotation, setDiceNotation] = useState('1d20')
  const [rollResult, setRollResult] = useState<{ total: number; rolls: number[]; key: number } | null>(null)
  const [lastRollType, setLastRollType] = useState('')
  const [history, setHistory] = useState<{ notation: string; result: number; isCrit?: boolean; isFumble?: boolean }[]>([])
  const [critEvent, setCritEvent] = useState<CritEvent | null>(null)
  const [rolling, setRolling] = useState(false)

  if (!character) {
    return (
      <div className={styles.notFound}>
        <h2>Personaje no encontrado</h2>
        <Link to="/">
          <Button variant="secondary">
            <ArrowLeft size={18} />
            Volver
          </Button>
        </Link>
      </div>
    )
  }

  const { abilities } = character
  const classData = getClassById(character.classes[0]?.id || '')
  const fortSave = getSaveForLevel(character.level, classData?.fortitudeSave || 'poor') + calculateModifier(abilities.constitution)
  const refSave = getSaveForLevel(character.level, classData?.reflexSave || 'poor') + calculateModifier(abilities.dexterity)
  const willSave = getSaveForLevel(character.level, classData?.willSave || 'poor') + calculateModifier(abilities.wisdom)
  const bab = getBABForLevel(character.level, classData?.baseAttackBonus || 'poor')
  const ac = 10 + calculateModifier(abilities.dexterity)

  function triggerRollAnimation(cb: () => void) {
    setRolling(true)
    setTimeout(() => {
      cb()
      setRolling(false)
    }, 280)
  }

  const handleRoll = () => {
    triggerRollAnimation(() => {
      const result = rollDice(diceNotation)
      setRollResult({ ...result, key: Date.now() })
      setLastRollType(diceNotation)
      setHistory((prev) => [{ notation: diceNotation, result: result.total }, ...prev.slice(0, 19)])
    })
  }

  // isAttack=true → detect crits/fumbles from raw d20
  const handleQuickRoll = (notation: string, name: string, isAttack = false) => {
    triggerRollAnimation(() => {
      const result = rollDice(notation)
      const d20 = result.rolls[0]
      const isCrit = isAttack && d20 === 20
      const isFumble = isAttack && d20 === 1

      setRollResult({ ...result, key: Date.now() })
      setLastRollType(name)
      setHistory((prev) => [{ notation: name, result: result.total, isCrit, isFumble }, ...prev.slice(0, 19)])

      if (isCrit) setCritEvent({ type: 'crit', name, roll: result.total })
      else if (isFumble) setCritEvent({ type: 'fumble', name, roll: result.total })
    })
  }

  const adjustHP = (amount: number) => {
    const newHP = Math.max(0, Math.min(character.hp.max, character.hp.current + amount))
    updateCharacter(character.id, { hp: { ...character.hp, current: newHP } })
  }

  return (
    <div className={styles.container}>
      {/* ── Critical / Fumble Modal ── */}
      {critEvent && (
        <div className={styles.critOverlay} onClick={() => setCritEvent(null)}>
          <div
            className={`${styles.critModal} ${critEvent.type === 'crit' ? styles.critModalCrit : styles.critModalFumble}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.critClose} onClick={() => setCritEvent(null)}>
              <X size={18} />
            </button>
            {critEvent.type === 'crit' ? (
              <>
                <div className={styles.critIcon}><Flame size={44} /></div>
                <h2 className={styles.critTitle}>¡GOLPE CRÍTICO!</h2>
                <p className={styles.critSub}>{critEvent.name}</p>
                <p className={styles.critDesc}>
                  20 natural. Confirma el crítico tirando de nuevo con el mismo bonificador.
                  Si superas la CA del objetivo, el daño se <strong>duplica</strong>.
                </p>
                <div className={styles.critActions}>
                  <Button variant="primary" onClick={() => {
                    handleQuickRoll(`1d20`, `Confirmar Crítico`)
                    setCritEvent(null)
                  }}>
                    Confirmar Crítico
                  </Button>
                  <Button variant="secondary" onClick={() => setCritEvent(null)}>Cerrar</Button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.critIcon}><Swords size={44} /></div>
                <h2 className={styles.critTitle}>¡PIFIA!</h2>
                <p className={styles.critSub}>{critEvent.name}</p>
                <p className={styles.critDesc}>
                  1 natural — fallo automático. El DM puede aplicar una consecuencia dramática.
                </p>
                <div className={styles.critActions}>
                  <Button variant="danger" onClick={() => setCritEvent(null)}>Aceptar mi destino</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <header className={styles.header}>
        <Link to={`/characters/${id}`} className={styles.backLink}>
          <ArrowLeft size={20} />
          Volver
        </Link>
        <h1>Modo Juego — {character.name}</h1>
      </header>

      <div className={styles.grid}>
        <div className={styles.mainPanel}>
          <Card padding="lg" className={styles.hpPanel}>
            <div className={styles.hpDisplay}>
              <Button variant="danger" size="lg" onClick={() => adjustHP(-1)}>
                <Minus size={20} />
              </Button>
              <div className={styles.hpValue}>
                <span className={character.hp.current <= character.hp.max * 0.25 ? styles.critical : ''}>
                  {character.hp.current}
                </span>
                <span className={styles.hpMax}>/ {character.hp.max}</span>
              </div>
              <Button variant="primary" size="lg" onClick={() => adjustHP(1)}>
                <Plus size={20} />
              </Button>
            </div>
            <div className={styles.hpControls}>
              <Button variant="danger" size="sm" onClick={() => adjustHP(-Math.ceil(character.hp.max / 4))}>-1/4</Button>
              <Button variant="secondary" size="sm" onClick={() => adjustHP(-5)}>-5</Button>
              <Button variant="secondary" size="sm" onClick={() => adjustHP(5)}>+5</Button>
              <Button variant="primary" size="sm" onClick={() => adjustHP(Math.ceil(character.hp.max / 4))}>+1/4</Button>
            </div>
          </Card>

          <Card padding="md">
            <h3 className={styles.sectionTitle}><Shield size={18} />Ataques</h3>
            <div className={styles.quickRolls}>
              <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${bab + calculateModifier(abilities.strength)}`, `Melee (+${bab + calculateModifier(abilities.strength)})`, true)}>
                Melee +{bab + calculateModifier(abilities.strength)}
              </Button>
              <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${bab + calculateModifier(abilities.dexterity)}`, `Ranged (+${bab + calculateModifier(abilities.dexterity)})`, true)}>
                Ranged +{bab + calculateModifier(abilities.dexterity)}
              </Button>
              <Button variant="danger" onClick={() => handleQuickRoll(`1d6+${calculateModifier(abilities.strength)}`, `Daño Melee`)}>Daño Melee</Button>
              <Button variant="danger" onClick={() => handleQuickRoll(`1d8+${calculateModifier(abilities.dexterity)}`, `Daño Ranged`)}>Daño Ranged</Button>
            </div>
          </Card>

          <Card padding="md">
            <h3 className={styles.sectionTitle}><Heart size={18} />Tiros de Salvación</h3>
            <div className={styles.quickRolls}>
              <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${fortSave}`, `Fortitud (+${fortSave})`)}>
                Fortaleza {getModifierString(abilities.constitution + (classData?.fortitudeSave === 'good' ? character.level : 0))}
              </Button>
              <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${refSave}`, `Reflejos (+${refSave})`)}>
                Reflejos {getModifierString(abilities.dexterity + (classData?.reflexSave === 'good' ? character.level : 0))}
              </Button>
              <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${willSave}`, `Voluntad (+${willSave})`)}>
                Voluntad {getModifierString(abilities.wisdom + (classData?.willSave === 'good' ? character.level : 0))}
              </Button>
            </div>
          </Card>

          <Card padding="md">
            <h3 className={styles.sectionTitle}><Brain size={18} />Pruebas de Habilidad</h3>
            <div className={styles.quickRolls}>
              <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.strength)}`, `STR Check`)}>Fuerza</Button>
              <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.dexterity)}`, `DEX Check`)}>Destreza</Button>
              <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.constitution)}`, `CON Check`)}>Constitución</Button>
              <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.intelligence)}`, `INT Check`)}>Inteligencia</Button>
              <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.wisdom)}`, `WIS Check`)}>Sabiduría</Button>
              <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.charisma)}`, `CHA Check`)}>Carisma</Button>
            </div>
          </Card>

          <Card padding="md">
            <h3 className={styles.sectionTitle}><Dices size={18} />Tirador de Dados</h3>
            <div className={styles.diceRoller}>
              <div className={styles.diceInput}>
                <input
                  type="text"
                  value={diceNotation}
                  onChange={(e) => setDiceNotation(e.target.value)}
                  placeholder="1d20+5"
                  className={styles.diceInputField}
                />
                <Button variant="primary" onClick={handleRoll} className={rolling ? styles.btnShaking : ''}>
                  Tirar
                </Button>
              </div>
              <div className={styles.presets}>
                {['1d4', '1d6', '1d8', '1d10', '1d12', '1d20', '2d6', '2d10', '1d100'].map((d) => (
                  <button
                    key={d}
                    className={`${styles.presetBtn} ${rolling ? styles.presetShaking : ''}`}
                    onClick={() => { setDiceNotation(d); handleQuickRoll(d, d) }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className={styles.sidePanel}>
          <Card padding="md" className={styles.resultCard}>
            <h3 className={styles.sectionTitle}>Resultado</h3>
            <div className={styles.result}>
              {rollResult !== null ? (
                <span key={rollResult.key} className={styles.resultNumber}>{rollResult.total}</span>
              ) : (
                <span className={styles.resultPlaceholder}>-</span>
              )}
              {rollResult !== null && rollResult.rolls.length > 1 && (
                <span className={styles.rollsDetail}>[{rollResult.rolls.join(' + ')}]</span>
              )}
            </div>
            {lastRollType && <span className={styles.rollType}>{lastRollType}</span>}
          </Card>

          <Card padding="md" className={styles.historyCard}>
            <h3 className={styles.sectionTitle}><History size={18} />Historial</h3>
            {history.length === 0 ? (
              <p className={styles.emptyHistory}>Sin tiradas aún</p>
            ) : (
              <ul className={styles.historyList}>
                {history.map((h, i) => (
                  <li key={i} className={`${styles.historyItem} ${h.isCrit ? styles.historyItemCrit : ''} ${h.isFumble ? styles.historyItemFumble : ''}`}>
                    <span className={styles.historyNotation}>
                      {h.isCrit && '⚡ '}{h.isFumble && '💀 '}{h.notation}
                    </span>
                    <span className={styles.historyResult}>{h.result}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card padding="sm" className={styles.statsCard}>
            <div className={styles.miniStats}>
              <div><span>CA</span><strong>{ac}</strong></div>
              <div><span>Iniciativa</span><strong>{getModifierString(abilities.dexterity)}</strong></div>
              <div><span>BAB</span><strong>+{bab}</strong></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
