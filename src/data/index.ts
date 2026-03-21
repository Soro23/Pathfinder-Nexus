export { FEATS, FEAT_TYPES, getFeatById } from './feats'
export type { Feat } from './feats'
export { SKILLS, CLASS_SKILLS, getSkillById, getAbilityModifier } from './skills'
export type { Skill } from './skills'
export { CLASSES, getClassById, getBABForLevel, getSaveForLevel, getMulticlassStats } from './classes'
export type { ClassData, ClassFeature, MagicType, MulticlassStats } from './classes'
export { calculateModifier } from '../store/characterStore'
export type { CharacterClass } from '../store/characterStore'
export { SPELLS, SPELL_SCHOOLS, SPELL_DESCRIPTORS, SPELL_TYPES, getSpellById, getSpellsByLevel, calculateSpellDC } from './spells'
export type { Spell, SpellLevel } from './spells'

// Hooks that merge static SRD data with homebrew content
import { SPELLS } from './spells'
import { FEATS } from './feats'
import { SKILLS } from './skills'
import { CLASSES } from './classes'
import { RACES } from './races'
import { useCustomSpellsStore } from '../store/customSpellsStore'
import { useHomebrewStore } from '../store/homebrewStore'

export function useAllSpells() {
  const customSpells = useCustomSpellsStore(s => s.customSpells)
  const brewSpells = useHomebrewStore(s => s.spells)
  return [...SPELLS, ...customSpells, ...brewSpells]
}
export function useAllFeats() {
  const brew = useHomebrewStore(s => s.feats)
  return [...FEATS, ...brew]
}
export function useAllSkills() {
  const brew = useHomebrewStore(s => s.skills)
  return [...SKILLS, ...brew]
}
export function useAllClasses() {
  const brew = useHomebrewStore(s => s.classes)
  return [...CLASSES, ...brew]
}
export function useAllRaces() {
  const brew = useHomebrewStore(s => s.races)
  return [...RACES, ...brew]
}

export { RACES, RACE_OPTIONS, getRaceById } from './races'
export type { Race, Subrace, RacialTrait } from './races'
export { useSRDStore, srdStore } from '../store/srdStore'
export { useHomebrewStore } from '../store/homebrewStore'
export type { HomebrewType } from '../store/homebrewStore'
