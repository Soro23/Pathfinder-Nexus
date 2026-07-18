import type { ClassData, ClassFeature } from './classes'
import type { Archetype } from './archetypes'

export interface ResolvedFeature extends ClassFeature {
  status: 'base' | 'replaced' | 'changed' | 'optional' | 'archetype'
}

export interface ArchetypeConflict {
  featureName: string
  atLevel: number
  archetypeNames: string[]
}

export function findArchetypeConflicts(archetypes: Archetype[]): ArchetypeConflict[] {
  const byKey = new Map<string, ArchetypeConflict>()

  for (const archetype of archetypes) {
    for (const r of archetype.replaces) {
      const key = `${r.featureName}:${r.atLevel}`
      const entry = byKey.get(key)
      if (entry) {
        entry.archetypeNames.push(archetype.name)
      } else {
        byKey.set(key, { featureName: r.featureName, atLevel: r.atLevel, archetypeNames: [archetype.name] })
      }
    }
  }

  return Array.from(byKey.values()).filter((c) => c.archetypeNames.length > 1)
}

export function resolveClassFeatures(
  classData: ClassData,
  archetypes: Archetype[],
): ResolvedFeature[] {
  if (archetypes.length === 0) {
    return classData.features.map((f) => ({ ...f, status: 'base' as const }))
  }

  const replacementByKey = new Map<string, Archetype['replaces'][number]>()
  for (const archetype of archetypes) {
    for (const r of archetype.replaces) {
      replacementByKey.set(`${r.featureName}:${r.atLevel}`, r)
    }
  }

  const baseResolved: ResolvedFeature[] = classData.features.map((f) => {
    const replacement = replacementByKey.get(`${f.name}:${f.level}`)
    if (!replacement) return { ...f, status: 'base' }
    return {
      ...f,
      status: replacement.type === 'replaces' ? 'replaced' : replacement.type === 'changes' ? 'changed' : 'optional',
    }
  })

  const archetypeFeatures: ResolvedFeature[] = archetypes.flatMap((archetype) =>
    archetype.features.map((f) => ({ ...f, status: 'archetype' as const })),
  )

  return [...baseResolved, ...archetypeFeatures].sort(
    (a, b) => a.level - b.level || a.name.localeCompare(b.name),
  )
}

export function resolveClassSkills(
  classData: ClassData,
  archetypes: Archetype[],
): string[] {
  if (archetypes.length === 0) return classData.classSkills

  const skills = new Set(classData.classSkills)

  for (const archetype of archetypes) {
    for (const s of archetype.classSkillsAdded ?? []) skills.add(s)
  }
  for (const archetype of archetypes) {
    for (const s of archetype.classSkillsRemoved ?? []) skills.delete(s)
  }

  return Array.from(skills)
}
