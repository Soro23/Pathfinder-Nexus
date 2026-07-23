import type { ClassData } from '../data/classes'
import type { Feat } from '../data/feats'
import type { AbilityKey, CharacterClass, HpGainMode } from '../store/characterStore'
import { calculateModifier } from '../store/characterStore'

// Niveles de personaje en los que corresponde un aumento de característica permanente (+1),
// según la tabla de progresión estándar PF1e/SRD.
export const ABILITY_INCREASE_LEVELS = [4, 8, 12, 16, 20] as const

export function isAbilityIncreaseLevel(characterLevel: number): boolean {
  return (ABILITY_INCREASE_LEVELS as readonly number[]).includes(characterLevel)
}

// Dote genérica en cada nivel de personaje impar (1, 3, 5…). El nivel 1 se resuelve en la
// creación del personaje, no en el modal de subida de nivel.
export function isGenericFeatLevel(characterLevel: number): boolean {
  return characterLevel % 2 === 1
}

export interface BonusFeatSlot {
  id: string
  label: string
  allowedTypes?: string[]
}

export function getBonusFeatSlotsForClassLevel(classId: string, classLevel: number): BonusFeatSlot[] {
  if (classId === 'fighter' && (classLevel === 1 || classLevel % 2 === 0)) {
    return [{ id: `fighter-${classLevel}`, label: 'Dote adicional de guerrero', allowedTypes: ['combat'] }]
  }

  if (classId === 'wizard' && classLevel > 0 && classLevel % 5 === 0) {
    return [{ id: `wizard-${classLevel}`, label: 'Dote adicional de mago', allowedTypes: ['metamagic', 'item_creation'] }]
  }

  if (classId === 'monk' && [1, 2, 6, 10, 14, 18].includes(classLevel)) {
    return [{ id: `monk-${classLevel}`, label: 'Dote adicional de monje', allowedTypes: ['combat'] }]
  }

  return []
}

export function getExpectedFeatCount(characterLevel: number, classes: CharacterClass[]): number {
  const genericFeats = Array.from({ length: characterLevel }, (_, index) => index + 1)
    .filter(isGenericFeatLevel)
    .length

  const bonusFeats = classes.reduce((sum, cls) => {
    let classBonusFeats = 0
    for (let classLevel = 1; classLevel <= cls.level; classLevel += 1) {
      classBonusFeats += getBonusFeatSlotsForClassLevel(cls.id, classLevel).length
    }
    return sum + classBonusFeats
  }, 0)

  return genericFeats + bonusFeats
}

export function computeHpGain(mode: HpGainMode, hitDie: number, conMod: number, rolled: number | null): number | null {
  if (mode === 'average') {
    // Media redondeada hacia arriba (estilo Pathfinder Society): d6→4, d8→5, d10→6, d12→7.
    const average = Math.floor(hitDie / 2) + 1
    return Math.max(1, average + conMod)
  }
  if (rolled === null) return null
  return Math.max(1, rolled + conMod)
}

// ── Alineamiento ──────────────────────────────────────────────────────────────────────
// El código de alineamiento del personaje ('lg', 'tn'…) se descompone en sus dos ejes para
// poder comparar contra las restricciones de clase, que en los datos SRD vienen como texto
// libre en español ('No Legal', 'Neutral', 'Legal Bueno', 'Cualquiera'…).
type LawAxis = 'lawful' | 'neutral' | 'chaotic'
type GoodAxis = 'good' | 'neutral' | 'evil'

const ALIGNMENT_AXES: Record<string, { law: LawAxis; good: GoodAxis; label: string }> = {
  lg: { law: 'lawful', good: 'good', label: 'Legal Bueno' },
  ng: { law: 'neutral', good: 'good', label: 'Neutral Bueno' },
  cg: { law: 'chaotic', good: 'good', label: 'Caótico Bueno' },
  ln: { law: 'lawful', good: 'neutral', label: 'Legal Neutral' },
  tn: { law: 'neutral', good: 'neutral', label: 'Neutral' },
  cn: { law: 'chaotic', good: 'neutral', label: 'Caótico Neutral' },
  le: { law: 'lawful', good: 'evil', label: 'Legal Malvado' },
  ne: { law: 'neutral', good: 'evil', label: 'Neutral Malvado' },
  ce: { law: 'chaotic', good: 'evil', label: 'Caótico Malvado' },
}

// Compara el alineamiento del personaje contra las entradas de `ClassData.alignment`.
// Heurística de mejor esfuerzo (el dato de origen es texto libre scrapeado del SRD):
// 'Cualquiera' siempre permite; 'No Legal'/'No Caótico'/'No Bueno'/'No Malvado' descartan
// el eje correspondiente; 'Neutral' a secas exige un componente neutral en cualquier eje
// (regla del druida); cualquier otra entrada se compara por etiqueta exacta ('Legal Bueno'…).
export function isAlignmentAllowedForClass(alignmentCode: string, classData: ClassData): boolean {
  const axes = ALIGNMENT_AXES[alignmentCode]
  if (!axes) return true
  // Sin datos de alineamiento (p.ej. clase homebrew creada sin restricciones): no bloquear.
  if (classData.alignment.length === 0) return true
  if (classData.alignment.some((entry) => entry === 'Cualquiera')) return true

  return classData.alignment.some((entry) => {
    if (entry === 'No Legal') return axes.law !== 'lawful'
    if (entry === 'No Caótico') return axes.law !== 'chaotic'
    if (entry === 'No Bueno') return axes.good !== 'good'
    if (entry === 'No Malvado') return axes.good !== 'evil'
    if (entry === 'Neutral') return axes.law === 'neutral' || axes.good === 'neutral'
    return entry === axes.label
  })
}

export function getAlignmentLabel(alignmentCode: string): string {
  return ALIGNMENT_AXES[alignmentCode]?.label ?? alignmentCode
}

// ── Prerrequisitos de dotes ──────────────────────────────────────────────────────────────
// `Feat.prerequisite` es texto libre en español. Se parsean los patrones más comunes del SRD
// (BAB mínimo, puntuación de característica mínima, otra dote como requisito) para dar una
// validación de mejor esfuerzo; los prerrequisitos que no encajan ningún patrón reconocido se
// muestran igualmente pero no bloquean la elección (V-05 exige avisar, no impedir a ciegas
// cuando no podemos interpretar el texto con confianza).
export interface FeatPrereqContext {
  bab: number
  abilities: Record<AbilityKey, number>
  featIds: string[]
}

const ABILITY_ABBR_TO_KEY: Record<string, AbilityKey> = {
  fue: 'strength', des: 'dexterity', con: 'constitution',
  int: 'intelligence', sab: 'wisdom', car: 'charisma',
}

export interface FeatPrereqCheck {
  met: boolean
  unmetReasons: string[]
}

export function checkFeatPrerequisites(feat: Feat, context: FeatPrereqContext, allFeats: Feat[]): FeatPrereqCheck {
  const text = feat.prerequisite
  if (!text) return { met: true, unmetReasons: [] }

  const unmetReasons: string[] = []

  const babMatch = text.match(/BAB\s*\+?(\d+)/i)
  if (babMatch && context.bab < parseInt(babMatch[1], 10)) {
    unmetReasons.push(`Requiere BAB +${babMatch[1]} (tienes +${context.bab})`)
  }

  const abilityRegex = /(FUE|DES|CON|INT|SAB|CAR)\s*(\d+)/gi
  for (const match of text.matchAll(abilityRegex)) {
    const key = ABILITY_ABBR_TO_KEY[match[1].toLowerCase()]
    const required = parseInt(match[2], 10)
    if (key && context.abilities[key] < required) {
      unmetReasons.push(`Requiere ${match[1].toUpperCase()} ${required} (tienes ${context.abilities[key]})`)
    }
  }

  for (const other of allFeats) {
    if (other.id === feat.id) continue
    const nameEscaped = other.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(`\\b${nameEscaped}\\b`, 'i').test(text) && !context.featIds.includes(other.id)) {
      unmetReasons.push(`Requiere la dote "${other.name}"`)
    }
  }

  return { met: unmetReasons.length === 0, unmetReasons }
}

// ── Clase predilecta ─────────────────────────────────────────────────────────────────────
export const FAVORED_CLASS_LABELS: Record<'hp' | 'skill' | 'racial', string> = {
  hp: '+1 punto de golpe',
  skill: '+1 punto de habilidad',
  racial: 'Opción racial alternativa',
}

export function getFavoredClassHpBonus(choice: 'hp' | 'skill' | 'racial' | undefined): number {
  return choice === 'hp' ? 1 : 0
}

export function getFavoredClassSkillBonus(choice: 'hp' | 'skill' | 'racial' | undefined): number {
  return choice === 'skill' ? 1 : 0
}

export function getIntModForSkillPoints(intelligenceScore: number): number {
  return calculateModifier(intelligenceScore)
}
