import { useMemo } from 'react'
import styles from './Feats.module.css'
import demoStyles from './FeatsV1Example.module.css'
import {
  parsePrerequisiteLinks,
  buildSkillPrefixList,
  linkSkillMention,
  type FeatRef,
  type SkillRef,
  type SkillSubtypeRef,
} from './featsV1PrerequisiteLinks'
import type { SkillV1Row } from './SkillsV1Detail'

export interface FeatTypeRef {
  id: string
  name_es: string
}

export interface FeatV1Row {
  id: string
  name_es: string
  name_en: string | null
  prerequisites_es: string | null
  benefit_es: string
  normal_es: string | null
  special_es: string | null
  publishers: { name: string } | null
  sourcebooks: { title: string } | null
  feat_type_assignments: { feat_types: FeatTypeRef }[]
}

interface PrerequisiteTextProps {
  text: string
  nameIndex: Map<string, FeatRef>
  skillsByLengthDesc: SkillRef[]
  subtypesBySkillId: Map<string, SkillSubtypeRef[]>
  onSelectFeat: (id: string) => void
  onSelectSkill: (skillId: string, subtypeId?: string) => void
}

// Enlaza los fragmentos que coinciden con el nombre exacto de otra dote, y —
// para los que no— los que mencionan una habilidad (ej. "Diplomacia 3
// rangos", "Saber (planos) 3 rangos") — ver featsV1PrerequisiteLinks.ts sobre
// por qué ambos enlaces son best-effort.
function PrerequisiteText({
  text, nameIndex, skillsByLengthDesc, subtypesBySkillId, onSelectFeat, onSelectSkill,
}: PrerequisiteTextProps) {
  const segments = parsePrerequisiteLinks(text, nameIndex).flatMap((segment) =>
    segment.feat ? [segment] : linkSkillMention(segment.text, skillsByLengthDesc, subtypesBySkillId)
  )

  return (
    <>
      {segments.map((segment, i) => {
        if (segment.feat) {
          return (
            <button key={i} type="button" className={demoStyles.prereqLink} onClick={() => onSelectFeat(segment.feat!.id)}>
              {segment.text}
            </button>
          )
        }
        if (segment.skillSubtype) {
          return (
            <button
              key={i}
              type="button"
              className={demoStyles.prereqLink}
              onClick={() => onSelectSkill(segment.skillSubtype!.skillId, segment.skillSubtype!.id)}
            >
              {segment.text}
            </button>
          )
        }
        if (segment.skill) {
          return (
            <button key={i} type="button" className={demoStyles.prereqLink} onClick={() => onSelectSkill(segment.skill!.id)}>
              {segment.text}
            </button>
          )
        }
        return <span key={i}>{segment.text}</span>
      })}
    </>
  )
}

interface FeatsV1CardBodyProps {
  feat: FeatV1Row
  nameIndex: Map<string, FeatRef>
  skills: SkillV1Row[]
  onSelectFeat: (id: string) => void
  onSelectSkill: (skillId: string, subtypeId?: string) => void
}

export function FeatsV1CardBody({ feat, nameIndex, skills, onSelectFeat, onSelectSkill }: FeatsV1CardBodyProps) {
  const skillsByLengthDesc = useMemo(
    () => buildSkillPrefixList(skills.map((s) => ({ id: s.id, name_es: s.name_es }))),
    [skills]
  )
  const subtypesBySkillId = useMemo(() => {
    const map = new Map<string, SkillSubtypeRef[]>()
    for (const skill of skills) {
      map.set(skill.id, skill.skill_subtypes.map((st) => ({ id: st.id, name_es: st.name_es, skillId: skill.id })))
    }
    return map
  }, [skills])

  return (
    <>
      <div className={styles.featHeader}>
        <h3 className={styles.featName}>{feat.name_es}</h3>
        <div className={styles.featTypes}>
          {feat.feat_type_assignments.map(({ feat_types }) => (
            <span key={feat_types.id} className={demoStyles.typeBadge}>
              {feat_types.name_es}
            </span>
          ))}
        </div>
      </div>

      {feat.prerequisites_es && (
        <p className={styles.featPrereq}>
          <strong>Prerrequisito:</strong>{' '}
          <PrerequisiteText
            text={feat.prerequisites_es}
            nameIndex={nameIndex}
            skillsByLengthDesc={skillsByLengthDesc}
            subtypesBySkillId={subtypesBySkillId}
            onSelectFeat={onSelectFeat}
            onSelectSkill={onSelectSkill}
          />
        </p>
      )}

      <p className={styles.featBenefit}>{feat.benefit_es}</p>

      {feat.normal_es && (
        <p className={styles.featNormal}>
          <strong>Normal:</strong> {feat.normal_es}
        </p>
      )}

      {feat.special_es && (
        <p className={styles.featSpecial}>
          <strong>Especial:</strong> {feat.special_es}
        </p>
      )}

      {(feat.publishers || feat.sourcebooks) && (
        <p className={styles.featSource}>
          Fuente: {feat.publishers?.name}
          {feat.sourcebooks?.title ? ` — ${feat.sourcebooks.title}` : ''}
        </p>
      )}
    </>
  )
}
