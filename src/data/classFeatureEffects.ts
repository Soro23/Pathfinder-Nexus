import type { Modifier, ModifierTarget } from '../engine'

// Rabia (bárbaro) — SRD Pathfinder 1e: +4 moral a Fuerza y Constitución, +2 moral a
// Voluntad, −2 a CA (penalización sin tipo), mientras la rabia está activa.
export const RAGE_EFFECT_ID = 'rage-effect'

export const RAGE_EFFECT_MODIFIERS: Modifier[] = [
  { id: 'temp-rage-str', source: 'Rabia', type: 'morale', target: 'str', value: 4 },
  { id: 'temp-rage-con', source: 'Rabia', type: 'morale', target: 'con', value: 4 },
  { id: 'temp-rage-will', source: 'Rabia', type: 'morale', target: 'save_will', value: 2 },
  { id: 'temp-rage-ac', source: 'Rabia', type: 'untyped', target: 'ac', value: -2 },
]

export type PhysicalAbility = 'str' | 'dex' | 'con'

export const MUTAGEN_EFFECT_ID = 'mutagen-effect'

const MUTAGEN_PHYSICAL_TARGET: Record<PhysicalAbility, ModifierTarget> = {
  str: 'str', dex: 'dex', con: 'con',
}

// Pareja mental penalizada por el mutágeno: Fuerza↔Inteligencia, Destreza↔Sabiduría,
// Constitución↔Carisma (SRD Pathfinder 1e, alquimista).
const MUTAGEN_MENTAL_PAIR: Record<PhysicalAbility, ModifierTarget> = {
  str: 'int', dex: 'wis', con: 'cha',
}

export const MUTAGEN_ABILITY_LABELS: Record<PhysicalAbility, string> = {
  str: 'Fuerza', dex: 'Destreza', con: 'Constitución',
}

// +4 al físico elegido, −2 a su pareja mental, bono de armadura natural según el nivel
// del alquimista — misma fórmula que ya se mostraba en el texto de Modo Juego (2 +
// nivel/4 redondeado hacia abajo), para no introducir una discrepancia entre lo que el
// jugador ya veía escrito y el efecto real que ahora se aplica.
export function buildMutagenModifiers(physical: PhysicalAbility, alchemistLevel: number): Modifier[] {
  const naturalArmor = 2 + Math.floor(alchemistLevel / 4)
  return [
    { id: 'temp-mutagen-phys', source: 'Mutágeno', type: 'untyped', target: MUTAGEN_PHYSICAL_TARGET[physical], value: 4 },
    { id: 'temp-mutagen-mental', source: 'Mutágeno', type: 'untyped', target: MUTAGEN_MENTAL_PAIR[physical], value: -2 },
    { id: 'temp-mutagen-armor', source: 'Mutágeno', type: 'natural', target: 'ac_natural', value: naturalArmor },
  ]
}
