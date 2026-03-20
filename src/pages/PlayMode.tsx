import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Plus, Minus, Dices, History, Shield, Heart, Brain,
  Swords, Flame, X, Zap, BookOpen, Activity
} from 'lucide-react'
import { useCharacterStore, calculateModifier, getModifierString } from '../store'
import { getClassById, getSaveForLevel, getBABForLevel, useSRDStore } from '../data'
import { useSpellsByIds } from '../hooks/useSpellsByIds'
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
type TabId = 'combat' | 'skills' | 'spells' | 'dice'

export function PlayMode() {
  const { skills: SKILLS, classes: CLASSES_DATA } = useSRDStore()
  const { id } = useParams<{ id: string }>()
  const character = useCharacterStore((state) => state.getCharacter(id || ''))
  const updateCharacter = useCharacterStore((state) => state.updateCharacter)

  const [activeTab, setActiveTab] = useState<TabId>('combat')
  const [diceNotation, setDiceNotation] = useState('1d20')
  const [rollResult, setRollResult] = useState<{ total: number; rolls: number[]; key: number } | null>(null)
  const [lastRollType, setLastRollType] = useState('')
  const [history, setHistory] = useState<{ notation: string; result: number; isCrit?: boolean; isFumble?: boolean }[]>([])
  const [critEvent, setCritEvent] = useState<CritEvent | null>(null)
  const [rolling, setRolling] = useState(false)
  const [showStatusEffects, setShowStatusEffects] = useState(false)

  const { spells: spellMap } = useSpellsByIds(character?.spells ?? [])

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

  // Correct AC calculation using equipped armor
  const equippedArmor = (character.armor ?? []).filter((a) => a.equipped)
  const totalArmorBonus = equippedArmor.reduce((sum, a) => sum + a.acBonus, 0)
  const armorMaxDex = equippedArmor.reduce((min, a) =>
    a.maxDex === null ? min : Math.min(min, a.maxDex), Infinity)
  const dexForAC = Math.min(
    calculateModifier(abilities.dexterity),
    armorMaxDex === Infinity ? 99 : armorMaxDex
  )
  const ac = 10 + totalArmorBonus + dexForAC

  const strMod = calculateModifier(abilities.strength)
  const dexMod = calculateModifier(abilities.dexterity)
  const cmb = bab + strMod
  const cmd = 10 + bab + strMod + dexMod
  const initiative = dexMod

  const statusEffects = character.statusEffects ?? []

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

  const toggleSlot = (level: number, slotIndex: number) => {
    const currentSlots = character.spellSlots ?? {}
    const slot = currentSlots[level] ?? { max: 0, used: 0 }
    const newUsed = slotIndex < slot.used ? slot.used - 1 : Math.min(slot.used + 1, slot.max)
    updateCharacter(character.id, {
      spellSlots: { ...currentSlots, [level]: { ...slot, used: newUsed } }
    })
  }

  const hasSpells = classData?.magicType !== null && classData?.magicType !== undefined

  // Concentration bonus
  const casterAbility = classData?.casterAbility
  const concentrationBonus = character.level + (casterAbility ? calculateModifier(abilities[casterAbility]) : 0)

  // Ability abbreviations
  const abilityAbbr: Record<string, string> = {
    strength: 'FUE', dexterity: 'DES', constitution: 'CON',
    intelligence: 'INT', wisdom: 'SAB', charisma: 'CAR'
  }

  const classSkillIds = classData?.classSkills ?? CLASSES_DATA.find(c => c.id === character.classes[0]?.id)?.classSkills ?? []

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
                    handleQuickRoll('1d20', 'Confirmar Crítico')
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

      {/* ── Status Effects Drawer ── */}
      {showStatusEffects && (
        <div className={styles.effectsOverlay} onClick={() => setShowStatusEffects(false)}>
          <div className={styles.effectsDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.effectsHeader}>
              <h3>Efectos de Estado</h3>
              <button className={styles.critClose} onClick={() => setShowStatusEffects(false)}>
                <X size={18} />
              </button>
            </div>
            {statusEffects.length === 0 ? (
              <p className={styles.emptyHistory}>Sin efectos activos</p>
            ) : (
              <ul className={styles.effectsList}>
                {statusEffects.map((eff) => (
                  <li key={eff.id} className={styles.effectItem}>
                    <div className={styles.effectName}>{eff.name}</div>
                    {eff.bonus && <div className={styles.effectBonus}>{eff.bonus}</div>}
                    {eff.duration && <div className={styles.effectDuration}>Duración: {eff.duration}</div>}
                    {eff.description && <div className={styles.effectDesc}>{eff.description}</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className={styles.header}>
        <Link to={`/characters/${id}`} className={styles.backLink}>
          <ArrowLeft size={20} />
          Volver
        </Link>
        <div className={styles.headerRight}>
          <h1>Modo Juego — {character.name}</h1>
          <button
            className={`${styles.statusBtn} ${statusEffects.length > 0 ? styles.statusBtnActive : ''}`}
            onClick={() => setShowStatusEffects(true)}
          >
            <Activity size={16} />
            {statusEffects.length > 0 && (
              <span className={styles.statusBadge}>{statusEffects.length}</span>
            )}
          </button>
        </div>
      </header>

      <div className={styles.pageLayout}>
        {/* ── Tab Shell ── */}
        <div className={styles.tabShell}>
          {/* HP Tracker — always visible */}
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

          {/* Tab Navigation */}
          <nav className={styles.tabNav}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'combat' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('combat')}
            >
              <Swords size={16} /> COMBATE
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'skills' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              <Brain size={16} /> HABILIDADES
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'spells' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('spells')}
            >
              <BookOpen size={16} /> CONJUROS
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'dice' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('dice')}
            >
              <Dices size={16} /> DADOS
            </button>
          </nav>

          {/* ─── TAB: COMBATE ─── */}
          {activeTab === 'combat' && (
            <div className={styles.tabContent}>
              {/* Combat Stats Bar */}
              <div className={styles.combatStats}>
                <div className={styles.statPill}>
                  <span className={styles.statPillLabel}>CA</span>
                  <span className={styles.statPillValue}>{ac}</span>
                </div>
                <div className={styles.statPill}>
                  <span className={styles.statPillLabel}>INI</span>
                  <span className={styles.statPillValue}>{initiative >= 0 ? `+${initiative}` : initiative}</span>
                </div>
                <div className={styles.statPill}>
                  <span className={styles.statPillLabel}>CMB</span>
                  <span className={styles.statPillValue}>{cmb >= 0 ? `+${cmb}` : cmb}</span>
                </div>
                <div className={styles.statPill}>
                  <span className={styles.statPillLabel}>CMD</span>
                  <span className={styles.statPillValue}>{cmd}</span>
                </div>
                <div className={styles.statPill}>
                  <span className={styles.statPillLabel}>BAB</span>
                  <span className={styles.statPillValue}>+{bab}</span>
                </div>
              </div>

              {/* Weapons */}
              <Card padding="md">
                <h3 className={styles.sectionTitle}><Shield size={18} />Ataques</h3>
                <div className={styles.weaponList}>
                  {character.weapons && character.weapons.length > 0 ? (
                    character.weapons.map((weapon) => (
                      <div key={weapon.id} className={styles.weaponRow}>
                        <div className={styles.weaponInfo}>
                          <span className={styles.weaponName}>{weapon.name}</span>
                          <span className={styles.weaponCrit}>×{weapon.critical || '20/×2'}</span>
                        </div>
                        <div className={styles.weaponBtns}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleQuickRoll(
                              `1d20+${bab + weapon.attackBonus}`,
                              `${weapon.name} (Ataque)`,
                              true
                            )}
                          >
                            Atacar {bab + weapon.attackBonus >= 0 ? `+${bab + weapon.attackBonus}` : bab + weapon.attackBonus}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleQuickRoll(weapon.damage, `${weapon.name} (Daño)`)}
                          >
                            Daño {weapon.damage}
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.quickRolls}>
                      <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${bab + strMod}`, `Melee (+${bab + strMod})`, true)}>
                        Melee +{bab + strMod}
                      </Button>
                      <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${bab + dexMod}`, `Ranged (+${bab + dexMod})`, true)}>
                        Ranged +{bab + dexMod}
                      </Button>
                      <Button variant="danger" onClick={() => handleQuickRoll(`1d6+${strMod}`, 'Daño Melee')}>Daño Melee</Button>
                      <Button variant="danger" onClick={() => handleQuickRoll(`1d8+${dexMod}`, 'Daño Ranged')}>Daño Ranged</Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Saving Throws */}
              <Card padding="md">
                <h3 className={styles.sectionTitle}><Heart size={18} />Tiros de Salvación</h3>
                <div className={styles.savesRow}>
                  <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${fortSave}`, `Fortaleza (+${fortSave})`)}>
                    Fortaleza {fortSave >= 0 ? `+${fortSave}` : fortSave}
                  </Button>
                  <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${refSave}`, `Reflejos (+${refSave})`)}>
                    Reflejos {refSave >= 0 ? `+${refSave}` : refSave}
                  </Button>
                  <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${willSave}`, `Voluntad (+${willSave})`)}>
                    Voluntad {willSave >= 0 ? `+${willSave}` : willSave}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* ─── TAB: HABILIDADES ─── */}
          {activeTab === 'skills' && (
            <div className={styles.tabContent}>
              <Card padding="md">
                <h3 className={styles.sectionTitle}><Brain size={18} />Habilidades con Rangos</h3>
                {character.skills && character.skills.length > 0 ? (
                  <div className={styles.skillsGrid}>
                    {character.skills
                      .filter((sr) => sr.ranks > 0)
                      .map((skillRank) => {
                        const skillDef = SKILLS.find((s) => s.id === skillRank.id)
                        if (!skillDef) return null
                        const abilityMod = calculateModifier(abilities[skillDef.ability])
                        const miscTotal = (skillRank.miscBonuses ?? []).reduce((s, b) => s + b.value, 0)
                        const isClassSkill = classSkillIds.includes(skillRank.id)
                        const classBonus = isClassSkill && skillRank.ranks > 0 ? 3 : 0
                        const total = skillRank.ranks + abilityMod + miscTotal + classBonus
                        return (
                          <button
                            key={skillRank.id}
                            className={styles.skillBtn}
                            onClick={() => handleQuickRoll(`1d20+${total}`, skillDef.name)}
                          >
                            <span className={styles.skillName}>
                              {skillDef.name}
                              {isClassSkill && <span className={styles.classSkillDot}>●</span>}
                            </span>
                            <span className={styles.skillAbility}>{abilityAbbr[skillDef.ability]}</span>
                            <span className={styles.skillBonus}>{total >= 0 ? `+${total}` : total}</span>
                          </button>
                        )
                      })}
                  </div>
                ) : (
                  <p className={styles.emptyHistory}>Sin habilidades con rangos</p>
                )}
              </Card>

              <Card padding="md">
                <h3 className={styles.sectionTitle}><Brain size={18} />Pruebas de Característica</h3>
                <div className={styles.quickRolls}>
                  <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.strength)}`, 'Prueba FUE')}>Fuerza {getModifierString(abilities.strength)}</Button>
                  <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.dexterity)}`, 'Prueba DES')}>Destreza {getModifierString(abilities.dexterity)}</Button>
                  <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.constitution)}`, 'Prueba CON')}>Constitución {getModifierString(abilities.constitution)}</Button>
                  <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.intelligence)}`, 'Prueba INT')}>Inteligencia {getModifierString(abilities.intelligence)}</Button>
                  <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.wisdom)}`, 'Prueba SAB')}>Sabiduría {getModifierString(abilities.wisdom)}</Button>
                  <Button variant="secondary" onClick={() => handleQuickRoll(`1d20+${calculateModifier(abilities.charisma)}`, 'Prueba CAR')}>Carisma {getModifierString(abilities.charisma)}</Button>
                </div>
              </Card>
            </div>
          )}

          {/* ─── TAB: CONJUROS ─── */}
          {activeTab === 'spells' && (
            <div className={styles.tabContent}>
              {!hasSpells ? (
                <Card padding="md">
                  <p className={styles.emptyHistory}>Sin conjuros configurados para esta clase.</p>
                </Card>
              ) : (
                <>
                  {/* Spell Slots */}
                  {Object.keys(character.spellSlots ?? {}).length > 0 && (
                    <Card padding="md">
                      <h3 className={styles.sectionTitle}><Zap size={18} />Espacios de Conjuro</h3>
                      <div className={styles.slotContainer}>
                        {Object.entries(character.spellSlots ?? {})
                          .sort(([a], [b]) => Number(a) - Number(b))
                          .map(([levelStr, slot]) => {
                            const level = Number(levelStr)
                            return (
                              <div key={level} className={styles.slotRow}>
                                <span className={styles.slotLevel}>Nv {level}</span>
                                <div className={styles.slotPips}>
                                  {Array.from({ length: slot.max }).map((_, i) => (
                                    <button
                                      key={i}
                                      className={`${styles.slotPip} ${i < slot.used ? styles.slotPipUsed : styles.slotPipAvail}`}
                                      onClick={() => toggleSlot(level, i)}
                                      title={i < slot.used ? 'Clic para recuperar' : 'Clic para gastar'}
                                    />
                                  ))}
                                </div>
                                <span className={styles.slotCount}>{slot.max - slot.used}/{slot.max}</span>
                              </div>
                            )
                          })}
                      </div>
                    </Card>
                  )}

                  {/* Spell List */}
                  <Card padding="md">
                    <h3 className={styles.sectionTitle}><BookOpen size={18} />Conjuros Preparados</h3>
                    {character.spells && character.spells.length > 0 ? (
                      <div className={styles.spellList}>
                        {character.spells.map((spellId) => {
                          const spell = spellMap[spellId]
                          if (!spell) return null
                          return (
                            <div key={spellId} className={styles.spellRow}>
                              <div className={styles.spellInfo}>
                                <span className={styles.spellName}>{spell.name}</span>
                                <span className={styles.spellMeta}>Nv {spell.level} · {spell.school}</span>
                              </div>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleQuickRoll(
                                  `1d20+${concentrationBonus}`,
                                  `Concentración — ${spell.name}`
                                )}
                              >
                                Concentración +{concentrationBonus}
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className={styles.emptyHistory}>Sin conjuros asignados</p>
                    )}
                  </Card>
                </>
              )}
            </div>
          )}

          {/* ─── TAB: DADOS ─── */}
          {activeTab === 'dice' && (
            <div className={styles.tabContent}>
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

              {/* Inline result for mobile (hidden on desktop) */}
              {rollResult !== null && (
                <div className={styles.inlineResult}>
                  <span key={rollResult.key} className={styles.resultNumber}>{rollResult.total}</span>
                  {rollResult.rolls.length > 1 && (
                    <span className={styles.rollsDetail}>[{rollResult.rolls.join(' + ')}]</span>
                  )}
                  {lastRollType && <span className={styles.rollType}>{lastRollType}</span>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Side Panel (desktop only) ── */}
        <aside className={styles.sidePanel}>
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
              <div><span>INI</span><strong>{initiative >= 0 ? `+${initiative}` : initiative}</strong></div>
              <div><span>CMB</span><strong>{cmb >= 0 ? `+${cmb}` : cmb}</strong></div>
              <div><span>CMD</span><strong>{cmd}</strong></div>
              <div><span>BAB</span><strong>+{bab}</strong></div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
