export { FEAT_TYPES, getFeatById } from './feats'
export type { Feat, FeatType } from './feats'
export { SKILLS, CLASS_SKILLS, getSkillById, getAbilityModifier } from './skills'
export type { Skill } from './skills'
export { CLASSES, getClassById, getBABForLevel, getSaveForLevel, getMulticlassStats } from './classes'
export type { ClassData, ClassFeature, MagicType, MulticlassStats } from './classes'
export { calculateModifier } from '../store/characterStore'
export type { CharacterClass } from '../store/characterStore'
export { SPELL_SCHOOLS, SPELL_DESCRIPTORS, SPELL_TYPES, calculateSpellDC } from './spells'
export type { Spell, SpellLevel } from './spells'

// Hooks that merge static SRD data with homebrew content
import { SKILLS } from './skills'
import { CLASSES } from './classes'
import { RACES } from './races'
import { useHomebrewStore } from '../store/homebrewStore'

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

export { DOMAINS, getDomainById } from './domains'
export type { DomainData, DomainPower, DomainSpellEntry } from './domains'
export { BLESSINGS, getBlessingById } from './blessings'
export type { BlessingData, BlessingPower } from './blessings'
export { RACES, RACE_OPTIONS, getRaceById } from './races'
export type { Race, Subrace, RacialTrait } from './races'
export { useSRDStore, srdStore } from '../store/srdStore'
export { useHomebrewStore } from '../store/homebrewStore'
export type { HomebrewType } from '../store/homebrewStore'
