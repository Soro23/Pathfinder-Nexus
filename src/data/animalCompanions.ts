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

// El catálogo de especies (antes ANIMAL_TYPES, 17 entradas fijas) vive ahora en la tabla
// Supabase `animal_companions` (291 filas) — ver src/hooks/useAnimalCompanions.ts y
// src/engine/companion.ts para el fetch y el cálculo de stats a partir de esos datos.

export function mod(score: number): number {
  return Math.floor((score - 10) / 2)
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
