import type { ClassData, ClassFeature } from './classes'
import type { Archetype, ArchetypeReplacement } from './archetypes'

export interface ResolvedFeature extends ClassFeature {
  status: 'base' | 'replaced' | 'changed' | 'optional' | 'archetype'
}

export interface ArchetypeConflict {
  featureName: string
  atLevel: number | null
  archetypeNames: [string, string]
}

// El texto de `featureName` viene scrapeado de la página SRD tal cual (en inglés, sin
// normalizar) y no es una clave: dos arquetipos pueden referirse a la misma característica
// con redacciones distintas — p.ej. Spellslinger dice "arcane bond" y Iounmancer dice
// "wizard's arcane bond". Por eso el emparejamiento se hace por solapamiento de palabras
// significativas en vez de por igualdad de texto.
const CONFLICT_STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'but', 'of', 'in', 'on', 'at', 'his', 'her',
  'its', 'their', 'it', 'them', 'this', 'that', 'gains', 'places', 'class',
])

function conflictTokens(featureName: string): Set<string> {
  const normalized = featureName
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
  return new Set(
    normalized.split(/\s+/).filter((w) => w.length > 2 && !CONFLICT_STOPWORDS.has(w)),
  )
}

function featureNamesOverlap(a: string, b: string): boolean {
  const tokensA = conflictTokens(a)
  const tokensB = conflictTokens(b)
  if (tokensA.size === 0 || tokensB.size === 0) return false

  let shared = 0
  for (const t of tokensA) if (tokensB.has(t)) shared++

  if (tokensA.size === 1 && tokensB.size === 1) return shared === 1
  return shared >= 2
}

// Dos reemplazos entran en conflicto si nombran la misma característica de clase. El nivel
// solo descarta el conflicto cuando ambos lo declaran explícitamente y difieren (p.ej. "dote
// de bono de nivel 5" vs "de nivel 10" — franjas distintas de un mismo tipo de rasgo); si
// alguno es null (frecuente, ver Archetype.replaces) no se puede usar para distinguir.
export function replacementsConflict(a: ArchetypeReplacement, b: ArchetypeReplacement): boolean {
  if (a.atLevel != null && b.atLevel != null && a.atLevel !== b.atLevel) return false
  return featureNamesOverlap(a.featureName, b.featureName)
}

export function findConflictingArchetype(option: Archetype, selected: Archetype[]): Archetype | null {
  for (const other of selected) {
    if (other.id === option.id) continue
    for (const r of option.replaces) {
      if (other.replaces.some((or) => replacementsConflict(r, or))) return other
    }
  }
  return null
}

export function findArchetypeConflicts(archetypes: Archetype[]): ArchetypeConflict[] {
  const conflicts: ArchetypeConflict[] = []
  for (let i = 0; i < archetypes.length; i++) {
    for (let j = i + 1; j < archetypes.length; j++) {
      for (const ra of archetypes[i].replaces) {
        for (const rb of archetypes[j].replaces) {
          if (replacementsConflict(ra, rb)) {
            conflicts.push({
              featureName: ra.featureName,
              atLevel: ra.atLevel,
              archetypeNames: [archetypes[i].name, archetypes[j].name],
            })
          }
        }
      }
    }
  }
  return conflicts
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

export function buildArchetypesByClassId(
  classes: { id: string; archetypeIds?: string[] }[],
  getArchetypeById: (id: string) => Archetype | undefined,
): Record<string, Archetype[]> {
  const map: Record<string, Archetype[]> = {}
  for (const cc of classes) {
    map[cc.id] = (cc.archetypeIds ?? [])
      .map((id) => getArchetypeById(id))
      .filter((a): a is Archetype => a !== undefined)
  }
  return map
}
