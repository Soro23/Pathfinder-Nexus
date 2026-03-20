export { FEATS, FEAT_TYPES, getFeatById } from './feats'
export type { Feat } from './feats'
export { SKILLS, CLASS_SKILLS, getSkillById, getAbilityModifier } from './skills'
export type { Skill } from './skills'
export { CLASSES, getClassById, getBABForLevel, getSaveForLevel } from './classes'
export type { ClassData, ClassFeature, MagicType } from './classes'
export { calculateModifier } from '../store/characterStore'
export type { CharacterClass } from '../store/characterStore'
export { SPELLS, SPELL_SCHOOLS, SPELL_DESCRIPTORS, SPELL_TYPES, getSpellById, getSpellsByLevel, calculateSpellDC } from './spells'
export type { Spell, SpellLevel } from './spells'

// Hook that merges static spells with user-imported custom spells
import { SPELLS } from './spells'
import { useCustomSpellsStore } from '../store/customSpellsStore'
export function useAllSpells() {
  const customSpells = useCustomSpellsStore(s => s.customSpells)
  return [...SPELLS, ...customSpells]
}
export { RACES, RACE_OPTIONS, getRaceById } from './races'
export type { Race, Subrace, RacialTrait } from './races'
