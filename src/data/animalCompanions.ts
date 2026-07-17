// Pathfinder SRD — Animal Companion rules
// Reference: https://www.d20pfsrd.com/classes/core-classes/druid/animal-companions/

export interface CompanionLevelData {
  level: number
  hd: number
  bab: number
  fort: number
  ref: number
  will: number
  skills: number       // total skill points accumulated
  feats: number        // total feats
  naBonus: number      // natural armor bonus added to base
  strDexBonus: number  // flat bonus added to STR and DEX
  bonusTricks: number  // bonus tricks beyond the base 3
  special: string[]
}

export const COMPANION_PROGRESSION: CompanionLevelData[] = [
  { level:  1, hd:  2, bab:  1, fort: 3, ref: 3, will: 0, skills:  2, feats: 1, naBonus:  0, strDexBonus: 0, bonusTricks: 1, special: ['Vínculo', 'Compartir Hechizos'] },
  { level:  2, hd:  3, bab:  2, fort: 3, ref: 3, will: 1, skills:  3, feats: 2, naBonus:  0, strDexBonus: 0, bonusTricks: 1, special: [] },
  { level:  3, hd:  3, bab:  2, fort: 3, ref: 3, will: 1, skills:  3, feats: 2, naBonus:  2, strDexBonus: 1, bonusTricks: 2, special: ['Evasión'] },
  { level:  4, hd:  4, bab:  3, fort: 4, ref: 4, will: 1, skills:  4, feats: 2, naBonus:  2, strDexBonus: 1, bonusTricks: 2, special: ['Puntuación de Característica +1'] },
  { level:  5, hd:  5, bab:  3, fort: 4, ref: 4, will: 1, skills:  5, feats: 3, naBonus:  2, strDexBonus: 1, bonusTricks: 2, special: [] },
  { level:  6, hd:  6, bab:  4, fort: 5, ref: 5, will: 2, skills:  6, feats: 3, naBonus:  4, strDexBonus: 2, bonusTricks: 3, special: ['Devoción'] },
  { level:  7, hd:  6, bab:  4, fort: 5, ref: 5, will: 2, skills:  6, feats: 3, naBonus:  4, strDexBonus: 2, bonusTricks: 3, special: [] },
  { level:  8, hd:  7, bab:  5, fort: 5, ref: 5, will: 2, skills:  7, feats: 4, naBonus:  4, strDexBonus: 2, bonusTricks: 3, special: [] },
  { level:  9, hd:  8, bab:  6, fort: 6, ref: 6, will: 2, skills:  8, feats: 4, naBonus:  6, strDexBonus: 3, bonusTricks: 4, special: ['Puntuación de Característica +1', 'Multiataque'] },
  { level: 10, hd:  9, bab:  6, fort: 6, ref: 6, will: 3, skills:  9, feats: 5, naBonus:  6, strDexBonus: 3, bonusTricks: 4, special: [] },
  { level: 11, hd:  9, bab:  6, fort: 6, ref: 6, will: 3, skills:  9, feats: 5, naBonus:  6, strDexBonus: 3, bonusTricks: 4, special: [] },
  { level: 12, hd: 10, bab:  7, fort: 7, ref: 7, will: 3, skills: 10, feats: 5, naBonus:  8, strDexBonus: 4, bonusTricks: 5, special: [] },
  { level: 13, hd: 11, bab:  8, fort: 7, ref: 7, will: 3, skills: 11, feats: 6, naBonus:  8, strDexBonus: 4, bonusTricks: 5, special: [] },
  { level: 14, hd: 12, bab:  9, fort: 8, ref: 8, will: 4, skills: 12, feats: 6, naBonus:  8, strDexBonus: 4, bonusTricks: 5, special: ['Puntuación de Característica +1'] },
  { level: 15, hd: 12, bab:  9, fort: 8, ref: 8, will: 4, skills: 12, feats: 6, naBonus: 10, strDexBonus: 5, bonusTricks: 6, special: ['Evasión Mejorada'] },
  { level: 16, hd: 13, bab:  9, fort: 8, ref: 8, will: 4, skills: 13, feats: 7, naBonus: 10, strDexBonus: 5, bonusTricks: 6, special: [] },
  { level: 17, hd: 14, bab: 10, fort: 9, ref: 9, will: 4, skills: 14, feats: 7, naBonus: 10, strDexBonus: 5, bonusTricks: 6, special: [] },
  { level: 18, hd: 15, bab: 11, fort: 9, ref: 9, will: 5, skills: 15, feats: 8, naBonus: 12, strDexBonus: 6, bonusTricks: 7, special: [] },
  { level: 19, hd: 15, bab: 11, fort: 9, ref: 9, will: 5, skills: 15, feats: 8, naBonus: 12, strDexBonus: 6, bonusTricks: 7, special: [] },
  { level: 20, hd: 16, bab: 12, fort:10, ref:10, will: 5, skills: 16, feats: 8, naBonus: 12, strDexBonus: 6, bonusTricks: 7, special: ['Puntuación de Característica +1'] },
]

export interface AnimalAttack {
  name: string
  damage: string
  type: 'primary' | 'secondary'
}

export interface AnimalBaseStats {
  id: string
  name: string
  size: 'P' | 'M' | 'G'
  speed: string
  naturalArmor: number
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
  attacks: AnimalAttack[]
  specialQualities: string[]
  senses: string[]
}

export const ANIMAL_TYPES: AnimalBaseStats[] = [
  {
    id: 'wolf', name: 'Lobo', size: 'M', speed: '50 pies',
    naturalArmor: 2, str: 13, dex: 15, con: 15, int: 2, wis: 12, cha: 6,
    attacks: [{ name: 'Mordisco', damage: '1d6', type: 'primary' }],
    specialQualities: ['Derribo'],
    senses: ['Visión en Penumbra', 'Olfato'],
  },
  {
    id: 'bear', name: 'Oso (pequeño)', size: 'P', speed: '40 pies',
    naturalArmor: 2, str: 15, dex: 15, con: 13, int: 2, wis: 12, cha: 6,
    attacks: [
      { name: 'Mordisco', damage: '1d4', type: 'primary' },
      { name: 'Zarpazo', damage: '1d3', type: 'primary' },
      { name: 'Zarpazo', damage: '1d3', type: 'primary' },
    ],
    specialQualities: [],
    senses: ['Visión en Penumbra', 'Olfato'],
  },
  {
    id: 'horse', name: 'Caballo', size: 'G', speed: '60 pies',
    naturalArmor: 1, str: 16, dex: 13, con: 14, int: 2, wis: 12, cha: 6,
    attacks: [
      { name: 'Coz', damage: '1d4', type: 'primary' },
      { name: 'Coz', damage: '1d4', type: 'primary' },
      { name: 'Mordisco', damage: '1d3', type: 'secondary' },
    ],
    specialQualities: [],
    senses: ['Visión en Penumbra', 'Olfato'],
  },
  {
    id: 'pony', name: 'Poni', size: 'M', speed: '40 pies',
    naturalArmor: 0, str: 13, dex: 13, con: 13, int: 2, wis: 12, cha: 6,
    attacks: [
      { name: 'Coz', damage: '1d3', type: 'primary' },
      { name: 'Coz', damage: '1d3', type: 'primary' },
    ],
    specialQualities: [],
    senses: ['Visión en Penumbra', 'Olfato'],
  },
  {
    id: 'eagle', name: 'Águila / Halcón', size: 'P', speed: '10 pies, vuelo 80 pies (maniobrabilidad media)',
    naturalArmor: 1, str: 10, dex: 15, con: 12, int: 2, wis: 14, cha: 6,
    attacks: [
      { name: 'Garra', damage: '1d4', type: 'primary' },
      { name: 'Garra', damage: '1d4', type: 'primary' },
      { name: 'Mordisco', damage: '1d4', type: 'secondary' },
    ],
    specialQualities: [],
    senses: ['Visión en Penumbra'],
  },
  {
    id: 'ape', name: 'Simio', size: 'M', speed: '30 pies, trepar 30 pies',
    naturalArmor: 1, str: 13, dex: 17, con: 10, int: 2, wis: 12, cha: 7,
    attacks: [
      { name: 'Mordisco', damage: '1d4', type: 'primary' },
      { name: 'Zarpazo', damage: '1d4', type: 'primary' },
      { name: 'Zarpazo', damage: '1d4', type: 'primary' },
    ],
    specialQualities: [],
    senses: ['Visión en Penumbra', 'Olfato'],
  },
  {
    id: 'dog', name: 'Perro', size: 'P', speed: '40 pies',
    naturalArmor: 1, str: 13, dex: 15, con: 13, int: 2, wis: 12, cha: 6,
    attacks: [{ name: 'Mordisco', damage: '1d4', type: 'primary' }],
    specialQualities: [],
    senses: ['Visión en Penumbra', 'Olfato'],
  },
  {
    id: 'cat_big', name: 'Felino Grande (León/Tigre)', size: 'M', speed: '40 pies',
    naturalArmor: 1, str: 15, dex: 17, con: 13, int: 2, wis: 12, cha: 6,
    attacks: [
      { name: 'Mordisco', damage: '1d6', type: 'primary' },
      { name: 'Zarpazo', damage: '1d4', type: 'primary' },
      { name: 'Zarpazo', damage: '1d4', type: 'primary' },
    ],
    specialQualities: ['Aferrar', 'Salto'],
    senses: ['Visión en Penumbra', 'Olfato'],
  },
  {
    id: 'cat_small', name: 'Felino Pequeño (Lince)', size: 'P', speed: '40 pies',
    naturalArmor: 1, str: 12, dex: 18, con: 13, int: 2, wis: 12, cha: 6,
    attacks: [
      { name: 'Mordisco', damage: '1d4', type: 'primary' },
      { name: 'Zarpazo', damage: '1d3', type: 'primary' },
      { name: 'Zarpazo', damage: '1d3', type: 'primary' },
    ],
    specialQualities: [],
    senses: ['Visión en Penumbra', 'Olfato'],
  },
  {
    id: 'crocodile', name: 'Cocodrilo', size: 'P', speed: '20 pies, nadar 30 pies',
    naturalArmor: 3, str: 13, dex: 12, con: 13, int: 1, wis: 12, cha: 8,
    attacks: [{ name: 'Mordisco', damage: '1d6', type: 'primary' }],
    specialQualities: ['Aguantar la Respiración', 'Derribar'],
    senses: ['Visión en Penumbra', 'Olfato'],
  },
  {
    id: 'snake_constrictor', name: 'Serpiente Constrictora', size: 'M', speed: '20 pies, nadar 20 pies',
    naturalArmor: 1, str: 15, dex: 12, con: 13, int: 1, wis: 12, cha: 2,
    attacks: [
      { name: 'Mordisco', damage: '1d4', type: 'primary' },
      { name: 'Constricción', damage: '1d4', type: 'secondary' },
    ],
    specialQualities: ['Aferrar', 'Constricción'],
    senses: ['Visión en Penumbra', 'Olfato', 'Sentido Sísmico'],
  },
  {
    id: 'snake_viper', name: 'Serpiente Víbora', size: 'P', speed: '20 pies, nadar 20 pies',
    naturalArmor: 1, str: 8, dex: 17, con: 11, int: 1, wis: 12, cha: 2,
    attacks: [{ name: 'Mordisco', damage: '1d3', type: 'primary' }],
    specialQualities: ['Veneno (CON 1d2)'],
    senses: ['Visión en Penumbra', 'Olfato'],
  },
  {
    id: 'shark', name: 'Tiburón', size: 'P', speed: 'nadar 60 pies',
    naturalArmor: 1, str: 12, dex: 15, con: 13, int: 1, wis: 12, cha: 2,
    attacks: [{ name: 'Mordisco', damage: '1d4', type: 'primary' }],
    specialQualities: ['Sentido Ciego 30 pies', 'Olfato'],
    senses: ['Sentido Ciego 30 pies', 'Olfato'],
  },
  {
    id: 'dolphin', name: 'Delfín', size: 'M', speed: 'nadar 60 pies',
    naturalArmor: 2, str: 12, dex: 14, con: 13, int: 2, wis: 12, cha: 7,
    attacks: [{ name: 'Mordisco', damage: '1d4', type: 'primary' }],
    specialQualities: ['Aguantar la Respiración', 'Ecolocalización'],
    senses: ['Visión en Penumbra', 'Ecolocalización'],
  },
  {
    id: 'boar', name: 'Jabalí', size: 'P', speed: '40 pies',
    naturalArmor: 3, str: 13, dex: 12, con: 15, int: 2, wis: 13, cha: 4,
    attacks: [{ name: 'Cornada', damage: '1d4', type: 'primary' }],
    specialQualities: ['Combatir hasta Morir', 'Olfato'],
    senses: ['Visión en Penumbra', 'Olfato'],
  },
  {
    id: 'camel', name: 'Camello', size: 'G', speed: '50 pies',
    naturalArmor: 1, str: 14, dex: 15, con: 14, int: 2, wis: 11, cha: 4,
    attacks: [
      { name: 'Mordisco', damage: '1d4', type: 'primary' },
      { name: 'Coz', damage: '1d4', type: 'secondary' },
      { name: 'Coz', damage: '1d4', type: 'secondary' },
    ],
    specialQualities: ['Resistencia al Calor'],
    senses: ['Visión en Penumbra', 'Olfato'],
  },
  {
    id: 'badger', name: 'Tejón', size: 'P', speed: '30 pies, excavar 10 pies, trepar 10 pies',
    naturalArmor: 2, str: 10, dex: 17, con: 15, int: 2, wis: 12, cha: 10,
    attacks: [
      { name: 'Mordisco', damage: '1d4', type: 'primary' },
      { name: 'Zarpazo', damage: '1d3', type: 'primary' },
      { name: 'Zarpazo', damage: '1d3', type: 'primary' },
    ],
    specialQualities: ['Rabia', 'Olfato'],
    senses: ['Visión en Penumbra', 'Olfato'],
  },
  {
    id: 'antelope', name: 'Antílope', size: 'P', speed: '60 pies',
    naturalArmor: 1, str: 10, dex: 17, con: 14, int: 2, wis: 13, cha: 5,
    attacks: [{ name: 'Cornada', damage: '1d4', type: 'primary' }],
    specialQualities: [],
    senses: ['Visión en Penumbra'],
  },
  {
    id: 'deinonychus', name: 'Deinonico (Raptor)', size: 'P', speed: '60 pies',
    naturalArmor: 1, str: 13, dex: 16, con: 13, int: 2, wis: 12, cha: 6,
    attacks: [
      { name: 'Mordisco', damage: '1d6', type: 'primary' },
      { name: 'Garra', damage: '1d4', type: 'primary' },
      { name: 'Garra', damage: '1d4', type: 'primary' },
      { name: 'Ataque de Cola', damage: '1d4', type: 'secondary' },
    ],
    specialQualities: ['Aferrar'],
    senses: ['Visión en Penumbra', 'Olfato'],
  },
  {
    id: 'allosaurus', name: 'Alosaurio (Dinosaurio)', size: 'M', speed: '40 pies',
    naturalArmor: 4, str: 14, dex: 16, con: 10, int: 2, wis: 15, cha: 10,
    attacks: [
      { name: 'Mordisco', damage: '1d6', type: 'primary' },
      { name: 'Zarpazo', damage: '1d4', type: 'primary' },
      { name: 'Zarpazo', damage: '1d4', type: 'primary' },
    ],
    specialQualities: [],
    senses: ['Visión en Penumbra', 'Olfato'],
  },
]

// ── Calculation ─────────────────────────────────────────────────────────────

export interface ComputedCompanionStats {
  hd: number
  bab: number
  fort: number
  ref: number
  will: number
  str: number
  dex: number
  con: number
  naturalArmor: number
  ac: number
  maxFeats: number
  maxTricks: number
  skillPoints: number
  special: string[]
}

export function mod(score: number): number {
  return Math.floor((score - 10) / 2)
}

// Modificador de tamaño a CA (Pequeño +1, Mediano +0, Grande -1) — misma tabla estándar
// que para personajes, restringida a los tres tamaños que usan los compañeros animales.
const SIZE_AC_MOD: Record<AnimalBaseStats['size'], number> = { P: 1, M: 0, G: -1 }

export function calculateCompanionStats(
  base: AnimalBaseStats,
  companionLevel: number
): ComputedCompanionStats {
  const lvl = Math.max(1, Math.min(20, companionLevel))
  const prog = COMPANION_PROGRESSION[lvl - 1]
  const str = base.str + prog.strDexBonus
  const dex = base.dex + prog.strDexBonus
  const con = base.con
  const na = base.naturalArmor + prog.naBonus
  return {
    hd: prog.hd,
    bab: prog.bab,
    fort: prog.fort + mod(con),
    ref:  prog.ref  + mod(dex),
    will: prog.will + mod(base.wis),
    str, dex, con,
    naturalArmor: na,
    ac: 10 + mod(dex) + na + SIZE_AC_MOD[base.size],
    maxFeats: prog.feats,
    maxTricks: 3 + prog.bonusTricks,
    skillPoints: prog.skills,
    special: prog.special,
  }
}

export function getAnimalById(id: string): AnimalBaseStats | undefined {
  return ANIMAL_TYPES.find(a => a.id === id)
}

// Predefined trick list
export const COMPANION_TRICKS = [
  'Atacar', 'Atacar (2)', 'Venir', 'Defender', 'Buscar', 'Proteger',
  'Rastrear', 'Guardar', 'Bajar', 'Sentarse', 'Permanecer', 'Tumbarse',
  'Vigilar', 'Trabajar', 'Llevar', 'Guiar', 'Buscar Presa',
]

// Common feats for animal companions
export const COMPANION_FEAT_SUGGESTIONS = [
  'Aguante', 'Alerta', 'Arma Enfocada (Mordisco)', 'Ataque de Poder',
  'Combate a Ciegas', 'Correr', 'Destreza en Combate', 'Evasión de Hechizos',
  'Golpe Poderoso', 'Iniciativa Mejorada', 'Mordisco Mejorado', 'Multiataque',
  'Pies Ligeros', 'Resistencia (Fortaleza)', 'Vitalidad',
]
