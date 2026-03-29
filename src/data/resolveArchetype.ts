import type { ClassData, ClassFeature } from './classes'
import type { Archetype } from './archetypes'

export interface ResolvedFeature extends ClassFeature {
  status: 'base' | 'replaced' | 'changed' | 'optional' | 'archetype'
}

export function resolveClassFeatures(
  classData: ClassData,
  archetype: Archetype | null,
): ResolvedFeature[] {
  if (!archetype) {
    return classData.features.map((f) => ({ ...f, status: 'base' as const }))
  }

  const replacedNames = new Set(
    archetype.replaces.map((r) => `${r.featureName}:${r.atLevel}`),
  )
  const replacementMap = new Map(
    archetype.replaces.map((r) => [`${r.featureName}:${r.atLevel}`, r.type]),
  )

  const baseResolved: ResolvedFeature[] = classData.features.map((f) => {
    const key = `${f.name}:${f.level}`
    if (replacedNames.has(key)) {
      const type = replacementMap.get(key)!
      return {
        ...f,
        status: type === 'replaces' ? 'replaced' : type === 'changes' ? 'changed' : 'optional',
      }
    }
    return { ...f, status: 'base' }
  })

  const archetypeFeatures: ResolvedFeature[] = archetype.features.map((f) => ({
    ...f,
    status: 'archetype' as const,
  }))

  return [...baseResolved, ...archetypeFeatures].sort(
    (a, b) => a.level - b.level || a.name.localeCompare(b.name),
  )
}

export function resolveClassSkills(
  classData: ClassData,
  archetype: Archetype | null,
): string[] {
  if (!archetype) return classData.classSkills

  const skills = new Set(classData.classSkills)

  for (const s of archetype.classSkillsAdded ?? []) skills.add(s)
  for (const s of archetype.classSkillsRemoved ?? []) skills.delete(s)

  return Array.from(skills)
}
