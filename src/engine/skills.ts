import type { CharacterClass, SkillRank } from '../store/characterStore'
import { calculateModifier } from '../store/characterStore'
import { getClassById } from '../data/classes'
import type { Skill } from '../data/skills'
import { getCharacterSize, getSizeSkillModifier } from './size'
import type { ResolvedStats } from './types'

// Forma mínima necesaria para calcular habilidades — un `Character` completo la satisface
// estructuralmente, pero también permite pasar el estado en edición de SkillsList (cuyos
// rangos viven en un prop `ranks` controlado, separado de `character.skills`).
export interface SkillCalcContext {
  abilities: Record<string, number>
  classes: CharacterClass[]
  skills: SkillRank[]
  race: string
}

// Puntos de habilidad totales ganados: por cada clase, (base de la clase + mod. Int,
// mínimo 1 por regla SRD) × niveles en esa clase. Soporta multiclase — cada clase aporta
// sus propios puntos según su propia tabla base.
export function computeSkillPointsAvailable(character: SkillCalcContext, spentRanks: number): number {
  const intMod = calculateModifier(character.abilities.intelligence)
  let total = 0
  for (const cc of character.classes) {
    const classData = getClassById(cc.id)
    if (!classData) continue
    total += Math.max(1, classData.skillPointsPerLevel + intMod) * cc.level
  }
  return Math.max(0, total - spentRanks)
}

// Una habilidad es "de clase" si lo es para cualquiera de las clases del personaje (multiclase).
export function isClassSkillForCharacter(character: SkillCalcContext, skillId: string): boolean {
  return character.classes.some((cc) => getClassById(cc.id)?.classSkills?.includes(skillId))
}

// Bono total de una habilidad: rangos + mod. característica + bono de clase (+3 si tiene al
// menos 1 rango y es de clase en alguna de sus clases) + penalización de armadura + modificador
// de tamaño (solo Sigilo/Volar) + bonos misceláneos + modificadores del motor (dotes/objetos).
// Recibe el objeto Skill ya resuelto (en vez de buscarlo en un catálogo estático) para funcionar
// igual con el catálogo base o con el catálogo ampliado con homebrew de useSRDStore().
export function computeSkillTotal(
  character: SkillCalcContext,
  skill: Skill,
  resolvedStats: ResolvedStats,
  equippedArmorAcp: number,
): number {
  const rankEntry = character.skills.find((s) => s.id === skill.id)
  const ranks = rankEntry?.ranks ?? 0
  const abilityMod = calculateModifier(character.abilities[skill.ability])
  const classBonus = ranks > 0 && isClassSkillForCharacter(character, skill.id) ? 3 : 0
  const acp = skill.hasArmorCheckPenalty ? equippedArmorAcp : 0
  const misc = rankEntry?.miscBonuses?.reduce((s, b) => s + b.value, 0) ?? 0
  const featBonus = resolvedStats.skillBonuses?.[skill.id] ?? 0
  const sizeMod = getSizeSkillModifier(getCharacterSize(character), skill.id)

  return ranks + abilityMod + classBonus + acp + misc + featBonus + sizeMod
}
