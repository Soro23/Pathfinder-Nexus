import styles from './Feats.module.css'
import demoStyles from './FeatsV1Example.module.css'
import { parsePrerequisiteLinks, type FeatRef } from './featsV1PrerequisiteLinks'

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
  onSelectFeat: (id: string) => void
}

// Enlaza solo los fragmentos que coinciden con el nombre exacto de otra dote —
// ver featsV1PrerequisiteLinks.ts sobre por qué es best-effort.
function PrerequisiteText({ text, nameIndex, onSelectFeat }: PrerequisiteTextProps) {
  const segments = parsePrerequisiteLinks(text, nameIndex)
  return (
    <>
      {segments.map((segment, i) =>
        segment.feat ? (
          <button
            key={i}
            type="button"
            className={demoStyles.prereqLink}
            onClick={() => onSelectFeat(segment.feat!.id)}
          >
            {segment.text}
          </button>
        ) : (
          <span key={i}>{segment.text}</span>
        )
      )}
    </>
  )
}

interface FeatsV1CardBodyProps {
  feat: FeatV1Row
  nameIndex: Map<string, FeatRef>
  onSelectFeat: (id: string) => void
}

export function FeatsV1CardBody({ feat, nameIndex, onSelectFeat }: FeatsV1CardBodyProps) {
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
          <PrerequisiteText text={feat.prerequisites_es} nameIndex={nameIndex} onSelectFeat={onSelectFeat} />
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
