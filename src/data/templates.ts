import type { Character } from '../store'

function makeId(name: string) {
  return `template-${name.toLowerCase().replace(/\s+/g, '-')}`
}

const now = new Date().toISOString()

const empty = {
  xp: 0,
  feats: [] as { id: string; specification?: string }[],
  skills: [],
  spells: [],
  spellSlots: {},
  inventory: [],
  weapons: [],
  armor: [],
  coins: { pp: 0, gp: 0, sp: 0, cp: 0 },
  notes: '',
  statusEffects: [],
  journalEntries: [],
  createdAt: now,
  updatedAt: now,
}

export interface CharacterTemplate {
  id: string
  label: string
  role: string
  desc: string
  character: Character
}

export const TEMPLATES: CharacterTemplate[] = [
  {
    id: 'guerrero-humano',
    label: 'Guerrero Humano',
    role: 'Tanque / DPS',
    desc: 'Combatiente veterano con armadura completa, fuerte y resistente. Perfecto para dominar el frente de batalla.',
    character: {
      ...empty,
      id: makeId('guerrero-humano'),
      name: 'Aldric el Férreo',
      race: 'human',
      classes: [{ id: 'fighter', level: 1 }],
      level: 1,
      alignment: 'ln',
      abilities: { strength: 18, dexterity: 13, constitution: 16, intelligence: 10, wisdom: 12, charisma: 8 },
      hp: { current: 13, max: 13, temp: 0 },
      feats: [{ id: 'power-attack' }, { id: 'toughness' }],
      weapons: [
        { id: 'w1', name: 'Espada larga', attackBonus: 4, damage: '1d8+4', critical: '19-20/×2', range: 'Cuerpo a cuerpo', type: 'Cortante', notes: '' },
        { id: 'w2', name: 'Escudo pesado', attackBonus: 4, damage: '1d4+4', critical: '20/×2', range: 'Cuerpo a cuerpo', type: 'Contundente', notes: '' },
      ],
      armor: [
        { id: 'a1', name: 'Cota de malla', type: 'medium' as const, acBonus: 6, armorCheckPenalty: -3, maxDex: 2, spellFailure: 25, weight: 40, equipped: true, notes: '' },
      ],
    },
  },
  {
    id: 'mago-elfo',
    label: 'Mago Elfo',
    role: 'Lanzador Arcano',
    desc: 'Estudioso de las artes arcanas con alta inteligencia. Devastador a distancia con hechizos de área.',
    character: {
      ...empty,
      id: makeId('mago-elfo'),
      name: 'Erevan Lúnaestrella',
      race: 'elf',
      classes: [{ id: 'wizard', level: 1 }],
      level: 1,
      alignment: 'ng',
      abilities: { strength: 8, dexterity: 16, constitution: 12, intelligence: 19, wisdom: 14, charisma: 10 },
      hp: { current: 7, max: 7, temp: 0 },
      feats: [{ id: 'scribe-scroll' }, { id: 'spell-focus-evocation' }],
      spells: ['magic-missile', 'burning-hands', 'mage-armor', 'detect-magic', 'light', 'prestidigitation'],
      spellSlots: {
        0: { max: 3, used: 0 },
        1: { max: 2, used: 0 },
      },
      weapons: [
        { id: 'w1', name: 'Báculo arcano', attackBonus: -1, damage: '1d6-1', critical: '20/×2', range: 'Cuerpo a cuerpo', type: 'Contundente', notes: '' },
      ],
    },
  },
  {
    id: 'picaro-halfling',
    label: 'Pícaro Halfling',
    role: 'Sigilo / Habilidades',
    desc: 'Ágil y escurridizo, experto en trampas y ataque furtivo. Ideal para exploración y flanqueo.',
    character: {
      ...empty,
      id: makeId('picaro-halfling'),
      name: 'Mira Pies-Ligeros',
      race: 'halfling',
      classes: [{ id: 'rogue', level: 1 }],
      level: 1,
      alignment: 'cn',
      abilities: { strength: 10, dexterity: 19, constitution: 12, intelligence: 14, wisdom: 12, charisma: 14 },
      hp: { current: 9, max: 9, temp: 0 },
      feats: [{ id: 'weapon-finesse' }],
      weapons: [
        { id: 'w1', name: 'Daga', attackBonus: 4, damage: '1d4+4', critical: '19-20/×2', range: 'Cuerpo a cuerpo / Lanzada', type: 'Perforante', notes: 'Finesse' },
        { id: 'w2', name: 'Arco corto', attackBonus: 4, damage: '1d6', critical: '20/×3', range: '60 pies', type: 'Perforante', notes: '' },
      ],
      armor: [
        { id: 'a1', name: 'Armadura de cuero', type: 'light' as const, acBonus: 2, armorCheckPenalty: 0, maxDex: 6, spellFailure: 10, weight: 15, equipped: true, notes: '' },
      ],
    },
  },
  {
    id: 'clerigo-enano',
    label: 'Clérigo Enano',
    role: 'Sanador / Soporte',
    desc: 'Devoto canal del poder divino. Sana a sus aliados, infunde valor y puede destrozar no-muertos.',
    character: {
      ...empty,
      id: makeId('clerigo-enano'),
      name: 'Durin Piedradivina',
      race: 'dwarf',
      classes: [{ id: 'cleric', level: 1 }],
      level: 1,
      alignment: 'lg',
      abilities: { strength: 14, dexterity: 10, constitution: 16, intelligence: 10, wisdom: 18, charisma: 10 },
      hp: { current: 11, max: 11, temp: 0 },
      feats: [{ id: 'combat-casting' }],
      spells: ['cure-light-wounds', 'bless', 'divine-favor', 'guidance', 'light', 'resistance'],
      spellSlots: {
        0: { max: 3, used: 0 },
        1: { max: 2, used: 0 },
      },
      weapons: [
        { id: 'w1', name: 'Maza de guerra', attackBonus: 2, damage: '1d8+2', critical: '20/×2', range: 'Cuerpo a cuerpo', type: 'Contundente', notes: '' },
      ],
      armor: [
        { id: 'a1', name: 'Escama', type: 'medium' as const, acBonus: 5, armorCheckPenalty: -4, maxDex: 3, spellFailure: 25, weight: 30, equipped: true, notes: '' },
        { id: 'a2', name: 'Escudo pesado de madera', type: 'shield' as const, acBonus: 2, armorCheckPenalty: -2, maxDex: null, spellFailure: 15, weight: 10, equipped: true, notes: '' },
      ],
    },
  },
  {
    id: 'barbaro-medio-orco',
    label: 'Bárbaro Medio-Orco',
    role: 'Berserker / DPS',
    desc: 'Furia bruta e imparable. En cólera su daño es devastador. Sin miedo, sin piedad en el combate.',
    character: {
      ...empty,
      id: makeId('barbaro-medio-orco'),
      name: 'Grak Aplastacráneos',
      race: 'half-orc',
      classes: [{ id: 'barbarian', level: 1 }],
      level: 1,
      alignment: 'cn',
      abilities: { strength: 20, dexterity: 14, constitution: 18, intelligence: 8, wisdom: 10, charisma: 6 },
      hp: { current: 16, max: 16, temp: 0 },
      feats: [{ id: 'power-attack' }],
      weapons: [
        { id: 'w1', name: 'Gran hacha', attackBonus: 5, damage: '1d12+7', critical: '20/×3', range: 'Cuerpo a cuerpo', type: 'Cortante', notes: 'Bimano, Power Attack -1/+2' },
      ],
      armor: [
        { id: 'a1', name: 'Armadura de cuero', type: 'light' as const, acBonus: 2, armorCheckPenalty: 0, maxDex: 6, spellFailure: 10, weight: 15, equipped: true, notes: '' },
      ],
    },
  },
]
