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

// Hooks that merge SRD data (estático u oficial vía Supabase) con el contenido homebrew
// del usuario, marcando cada item homebrew con su propia categoría (`source`).
import { useSRDStore } from '../store/srdStore'
import { useHomebrewStore } from '../store/homebrewStore'

export function useAllSkills() {
  const official = useSRDStore(s => s.skills)
  const brew = useHomebrewStore(s => s.skills)
  return [...official, ...brew.map(s => ({ ...s, source: s.source ?? 'Homebrew' }))]
}
export function useAllClasses() {
  const official = useSRDStore(s => s.classes)
  const brew = useHomebrewStore(s => s.classes)
  return [...official, ...brew.map(c => ({ ...c, source: c.source ?? 'homebrew' as const }))]
}
export function useAllRaces() {
  const official = useSRDStore(s => s.races)
  const brew = useHomebrewStore(s => s.races)
  return [...official, ...brew.map(r => ({ ...r, source: r.source ?? 'Homebrew' }))]
}
export function useAllFeats() {
  const official = useSRDStore(s => s.feats)
  const brew = useHomebrewStore(s => s.feats)
  return [...official, ...brew.map(f => ({ ...f, source: f.source ?? 'Homebrew' }))]
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
