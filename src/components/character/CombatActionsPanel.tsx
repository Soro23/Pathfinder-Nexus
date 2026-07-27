import { useState, useMemo } from 'react'
import styles from './CombatActionsPanel.module.css'

type ActionEconomy = 'standard' | 'full' | 'move' | 'swift' | 'free'

interface CombatActionEffect {
  label: string
  text: string
}

interface CombatAction {
  id: string
  name: string
  economy: ActionEconomy
  summary: string
  effects?: CombatActionEffect[]
}

const ECONOMY_LABELS: Record<ActionEconomy, string> = {
  standard: 'Estándar',
  full: 'Ronda Completa',
  move: 'Movimiento',
  swift: 'Veloz/Inmediata',
  free: 'Libre',
}

const COMBAT_ACTIONS: CombatAction[] = [
  {
    id: 'attack',
    name: 'Ataque',
    economy: 'standard',
    summary: 'Realizas un único ataque cuerpo a cuerpo o a distancia contra un objetivo al alcance.',
  },
  {
    id: 'full-attack',
    name: 'Ataque Total',
    economy: 'full',
    summary: 'Realizas todos los ataques a los que tienes derecho por tu bonificador base de ataque, incluidos los ataques iterativos, en lugar de un único ataque.',
  },
  {
    id: 'charge',
    name: 'Carga',
    economy: 'full',
    summary: 'Te mueves hasta el doble de tu velocidad en línea recta hacia un enemigo y rematas con un ataque cuerpo a cuerpo.',
    effects: [
      { label: 'Ataque', text: '+2 a la tirada de ataque de la carga.' },
      { label: 'Defensa', text: '−2 a la CA hasta el inicio de tu siguiente turno.' },
    ],
  },
  {
    id: 'unarmed-strike',
    name: 'Ataque sin Armas',
    economy: 'standard',
    summary: 'Golpeas con el puño, el pie o la cabeza en lugar de con un arma.',
    effects: [
      { label: 'Daño', text: '1d3 + FUE, contundente y no letal (salvo que elijas causar daño letal, con −4 al ataque).' },
      { label: 'Provoca', text: 'Ataque de oportunidad, salvo que tengas Combate sin Armas Mejorado o un poder similar.' },
    ],
  },
  {
    id: 'grapple',
    name: 'Agarrar',
    economy: 'standard',
    summary: 'Intentas sujetar a un enemigo para inmovilizarlo, arrastrarlo o impedir que actúe con libertad.',
    effects: [
      { label: 'Iniciar', text: 'CMB frente a la CMD del objetivo; si tienes éxito, ambos quedáis Agarrados.' },
      { label: 'Mantener', text: 'CMB frente a CMD para dañar, inmovilizar o mover al objetivo agarrado.' },
    ],
  },
  {
    id: 'trip',
    name: 'Derribar',
    economy: 'standard',
    summary: 'Intentas hacer caer al suelo a un enemigo de tamaño no mayor al tuyo en más de una categoría.',
    effects: [
      { label: 'Éxito', text: 'CMB frente a CMD; el objetivo queda con la condición Postrado.' },
      { label: 'Fallo', text: 'El objetivo puede intentar derribarte a ti como respuesta.' },
    ],
  },
  {
    id: 'disarm',
    name: 'Desarmar',
    economy: 'standard',
    summary: 'Intentas hacer que un enemigo suelte el arma que empuña.',
    effects: [
      { label: 'Prueba', text: 'CMB frente a CMD (+4 si usas un arma con gancho o rasgo de desarme).' },
      { label: 'Fallo', text: 'El objetivo puede intentar desarmarte a ti como respuesta.' },
    ],
  },
  {
    id: 'bull-rush',
    name: 'Empujón',
    economy: 'standard',
    summary: 'Intentas empujar a un enemigo hacia atrás sin causarle daño.',
    effects: [
      { label: 'Éxito', text: 'Empujas al objetivo 5 pies, y otros 5 por cada 5 que superes su CMD.' },
    ],
  },
  {
    id: 'feint',
    name: 'Finta',
    economy: 'standard',
    summary: 'Engañas a un enemigo en combate para que baje la guardia ante tu próximo ataque.',
    effects: [
      { label: 'Prueba', text: 'Amaño enfrentado a Sentido Motriz (10 + BBA + mod. Sabiduría del objetivo).' },
      { label: 'Éxito', text: 'El objetivo pierde su bonificador de Destreza a la CA contra tu siguiente ataque.' },
    ],
  },
  {
    id: 'total-defense',
    name: 'Defensa Total',
    economy: 'standard',
    summary: 'Te concentras por completo en esquivar y bloquear en lugar de atacar.',
    effects: [
      { label: 'Efecto', text: '+4 a la CA hasta el inicio de tu siguiente turno. No puedes atacar este turno.' },
    ],
  },
  {
    id: 'fight-defensively',
    name: 'Luchar a la Defensiva',
    economy: 'standard',
    summary: 'Atacas con cautela, sacrificando precisión a cambio de protección.',
    effects: [
      { label: 'Efecto', text: '−4 a la tirada de ataque y +2 a la CA hasta el inicio de tu siguiente turno.' },
    ],
  },
  {
    id: 'coup-de-grace',
    name: 'Golpe de Gracia',
    economy: 'full',
    summary: 'Rematas a un enemigo indefenso (dormido, atado, inconsciente...) con un golpe letal.',
    effects: [
      { label: 'Efecto', text: 'Ataque cuerpo a cuerpo automático e impacto crítico.' },
      { label: 'Objetivo', text: 'Debe superar Fortaleza (CD 10 + daño infligido) o muere.' },
    ],
  },
  {
    id: 'withdraw',
    name: 'Retirada de Combate',
    economy: 'full',
    summary: 'Te alejas de la refriega sin sufrir un ataque de oportunidad del enemigo con el que estabas trabado.',
    effects: [
      { label: 'Efecto', text: 'Te mueves hasta el doble de tu velocidad; el primer paso no provoca ataque de oportunidad.' },
    ],
  },
  {
    id: 'run',
    name: 'Correr',
    economy: 'full',
    summary: 'Te desplazas en línea recta a máxima velocidad, sacrificando precisión defensiva.',
    effects: [
      { label: 'Efecto', text: 'Te mueves hasta 4 veces tu velocidad (o 5 veces con carrera); pierdes tu bonificador de Destreza a la CA.' },
    ],
  },
  {
    id: 'ready',
    name: 'Preparar',
    economy: 'standard',
    summary: 'Preparas una acción estándar o de movimiento con un disparador concreto.',
    effects: [
      { label: 'Efecto', text: 'La acción preparada se resuelve como una acción inmediata en cuanto ocurre el disparador.' },
    ],
  },
]

export function CombatActionsPanel() {
  const [economyFilter, setEconomyFilter] = useState<ActionEconomy | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const availableEconomies = useMemo(
    () => Array.from(new Set(COMBAT_ACTIONS.map((a) => a.economy))),
    []
  )

  const filteredActions = useMemo(
    () => (economyFilter === 'all' ? COMBAT_ACTIONS : COMBAT_ACTIONS.filter((a) => a.economy === economyFilter)),
    [economyFilter]
  )

  const selectedAction = COMBAT_ACTIONS.find((a) => a.id === selectedId) ?? null

  return (
    <div className={styles.container}>
      <div className={styles.filterRow}>
        <button
          className={`${styles.filterPill} ${economyFilter === 'all' ? styles.filterPillActive : ''}`}
          onClick={() => setEconomyFilter('all')}
        >
          Todas
        </button>
        {availableEconomies.map((economy) => (
          <button
            key={economy}
            className={`${styles.filterPill} ${economyFilter === economy ? styles.filterPillActive : ''}`}
            onClick={() => setEconomyFilter(economy)}
          >
            {ECONOMY_LABELS[economy]}
          </button>
        ))}
      </div>

      <div className={styles.actionGrid}>
        {filteredActions.map((action) => (
          <button
            key={action.id}
            className={`${styles.actionPill} ${selectedId === action.id ? styles.actionPillActive : ''}`}
            onClick={() => setSelectedId((current) => (current === action.id ? null : action.id))}
          >
            {action.name}
          </button>
        ))}
      </div>

      {selectedAction && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <span className={styles.detailName}>{selectedAction.name}</span>
            <span className={styles.detailEconomy}>{ECONOMY_LABELS[selectedAction.economy]}</span>
          </div>
          <p className={styles.detailSummary}>{selectedAction.summary}</p>
          {selectedAction.effects && (
            <ul className={styles.detailEffects}>
              {selectedAction.effects.map((effect) => (
                <li key={effect.label}>
                  <strong>{effect.label}:</strong> {effect.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
