import { BookOpen, ChevronDown } from 'lucide-react'
import { Card } from '../components/ui'
import styles from './Rules.module.css'
import mobile from '../styles/compendiumMobile.module.css'

const QUICK_RULES = [
  {
    title: 'Tiradas de Ataque',
    formula: '1d20 + Modificador de Atributo + Bonificador de Ataque Base + Bonificadores varios',
    description: 'El resultado debe igualar o superar la Clase de Armadura (CA) del objetivo para impactar.',
  },
  {
    title: 'Daño',
    formula: 'Tirada de dado de daño + Modificador de Atributo',
    description: 'El daño se resta directamente de los Puntos de Golpe del objetivo.',
  },
  {
    title: 'Clase de Armadura (CA)',
    formula: '10 + Destreza + Armadura + Escudo + Bonificadores',
    description: 'Representa qué tan difícil es impactar a un personaje.',
  },
  {
    title: 'Salvaciones',
    formula: '1d20 + Modificador de Atributo + Bonificador de competencia (si aplica)',
    description: 'Se tira para resistir efectos como venenos, hechizos o trampas.',
  },
  {
    title: 'Iniciativa',
    formula: '1d20 + Destreza',
    description: 'Determina el orden de actuación en combate.',
  },
]

const CONDITION_LIST = [
  { name: 'Envenenado', effect: 'Desventaja en tiradas de ataque y pruebas de habilidad que usen Fuerza o Destreza.' },
  { name: 'Asustado', effect: 'Desventaja en tiradas de ataque y pruebas de habilidad mientras la fuente de miedo esté visible.' },
  { name: 'Cegado', effect: 'Falla todas las tiradas que requieran vista. Ataques contra tienen desventaja.' },
  { name: 'Sordo', effect: 'Falla todas las tiradas que requieran audición.' },
  { name: 'Aparagizado', effect: 'Velocidad reducida a 0. Recibe daño doble de caídas.' },
  { name: 'Contenído', effect: 'No puede moverse ni hablar. Automáticamente falla salvaciones de Fuerza y Destreza.' },
  { name: 'Encantado', effect: 'No puede atacar al encantador. Salvaciones de Sabiduría con desventaja.' },
  { name: 'Aterrorizado', effect: 'No puede acercarse voluntariamente a la fuente de miedo. Salvaciones de Sabiduría.' },
  { name: 'Agarrado', effect: 'Velocidad reducida a 0. Ataques contra tienen ventaja.' },
  { name: 'Incapacitado', effect: 'No puede tomar acciones ni reacciones.' },
  { name: 'Invisible', effect: 'Ataques contra tienen ventaja. Sus ataques tienen desventaja.' },
  { name: 'Aturdido', effect: 'No puede moverse ni hablar. Automáticamente falla salvaciones. Ataques contra tienen ventaja.' },
]

const SECTIONS = [
  { id: 'formulas',    label: 'Fórmulas Básicas' },
  { id: 'condiciones', label: 'Condiciones' },
]

export function Rules() {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.container}>

      {/* ── Mobile sticky nav ── */}
      <div className={mobile.mobileCatBar}>
        <div className={mobile.mobileCatSelectWrap}>
          <BookOpen size={15} className={mobile.mobileCatIcon} />
          <select
            className={mobile.mobileCatSelect}
            defaultValue=""
            onChange={e => { scrollTo(e.target.value); (e.target as HTMLSelectElement).value = '' }}
          >
            <option value="" disabled>Ir a sección…</option>
            {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <ChevronDown size={15} className={mobile.mobileCatChevron} />
        </div>
      </div>

      <header className={styles.header}>
        <BookOpen size={28} className={styles.headerIcon} />
        <div>
          <h1>Reglas Rápidas</h1>
          <p className={styles.subtitle}>Referencia rápida del sistema d20 Pathfinder</p>
        </div>
      </header>

      <section id="formulas" className={styles.section}>
        <h2>Fórmulas Básicas</h2>
        <div className={styles.formulaGrid}>
          {QUICK_RULES.map((rule) => (
            <Card key={rule.title} padding="md" hoverable>
              <h3>{rule.title}</h3>
              <code className={styles.formula}>{rule.formula}</code>
              <p>{rule.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="condiciones" className={styles.section}>
        <h2>Condiciones</h2>
        <div className={styles.conditionList}>
          {CONDITION_LIST.map((cond) => (
            <Card key={cond.name} padding="sm" className={styles.conditionCard}>
              <h4>{cond.name}</h4>
              <p>{cond.effect}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
