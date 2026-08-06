import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { renderMarkdown } from '../lib/markdown'
import { Drawer } from '../components/ui/Drawer'
import styles from './Skills.module.css'
import demoStyles from './SkillsV1Detail.module.css'

// ── Detalle de habilidad (schema v1), compartido entre /skills-v1 y los
// enlaces de prerrequisito de dote → habilidad en /feats-v1 ──────────────────
// Encapsula la consulta a v1.skills (con skill_subtypes y class_skills
// embebidos) y el Drawer de detalle con navegación a dos niveles
// (habilidad ↔ subtipo) para que ambas páginas de ejemplo no dupliquen esta
// lógica — ver featsV1PrerequisiteLinks.ts para cómo se detecta la mención de
// una habilidad dentro del texto de un prerrequisito.

export interface SkillSubtypeRow {
  id: string
  name_es: string
  description_es: string
}

export interface ClassSkillRow {
  classes: { id: string; name_es: string }
}

export interface SkillV1Row {
  id: string
  name_es: string
  name_en: string | null
  key_ability: string
  armor_check_penalty: boolean
  trained_only: boolean
  description_es: string
  skill_subtypes: SkillSubtypeRow[]
  class_skills: ClassSkillRow[]
}

export const SKILL_SELECT = `id, name_es, name_en, key_ability, armor_check_penalty, trained_only, description_es,
  skill_subtypes ( id, name_es, description_es ),
  class_skills ( classes ( id, name_es ) )`

interface SkillDetailProps {
  skill: SkillV1Row
  onSelectSubtype: (id: string) => void
}

export function SkillDetail({ skill, onSelectSubtype }: SkillDetailProps) {
  const sortedClasses = [...skill.class_skills].sort((a, b) => a.classes.name_es.localeCompare(b.classes.name_es))

  return (
    <>
      <div className={demoStyles.drawerMeta}>
        <span className={`${styles.skillTag} ${styles.ability}`}>{skill.key_ability}</span>
        {skill.trained_only && (
          <span className={`${styles.skillTag} ${styles.classSkill}`}>Solo entrenado</span>
        )}
        {skill.armor_check_penalty && (
          <span className={`${styles.skillTag} ${styles.armorPenalty}`}>−1 por armadura</span>
        )}
      </div>

      {skill.skill_subtypes.length > 0 && (
        <div className={styles.skillSection}>
          <p className={styles.skillSectionTitle}>Subtipos</p>
          <div className={styles.usesList}>
            {skill.skill_subtypes.map((subtype) => (
              <button
                key={subtype.id}
                type="button"
                className={`${styles.useItem} ${demoStyles.subtypeChip}`}
                onClick={() => onSelectSubtype(subtype.id)}
              >
                {subtype.name_es}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={`${styles.skillDescription} ${demoStyles.skillDescription}`}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(skill.description_es) }}
      />

      {sortedClasses.length > 0 && (
        <div className={styles.skillSection}>
          <p className={styles.skillSectionTitle}>Habilidad de clase para ({sortedClasses.length})</p>
          <div className={styles.usesList}>
            {sortedClasses.map(({ classes: cls }) => (
              <span key={cls.id} className={styles.useItem}>{cls.name_es}</span>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

interface SubtypeDetailProps {
  subtype: SkillSubtypeRow
  skillName: string
  onBack: () => void
}

export function SubtypeDetail({ subtype, skillName, onBack }: SubtypeDetailProps) {
  return (
    <>
      <button type="button" className={demoStyles.backBtn} onClick={onBack}>
        <ArrowLeft size={14} /> Volver a {skillName}
      </button>

      <div
        className={`${styles.skillDescription} ${demoStyles.skillDescription}`}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(subtype.description_es) }}
      />
    </>
  )
}

// Carga v1.skills una vez y gestiona el Drawer de detalle (habilidad ↔
// subtipo) — cada página consumidora solo necesita llamar a `open(skillId)`
// y renderizar `drawer` donde corresponda.
export function useSkillsV1Drawer() {
  const [skills, setSkills] = useState<SkillV1Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [skillId, setSkillId] = useState<string | null>(null)
  const [subtypeId, setSubtypeId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .schema('v1')
      .from('skills')
      .select(SKILL_SELECT)
      .order('name_es')
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) {
          setError(err.message)
          setSkills([])
        } else {
          setSkills((data ?? []) as unknown as SkillV1Row[])
        }
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const skill = skills.find((s) => s.id === skillId) ?? null
  const subtype = skill?.skill_subtypes.find((s) => s.id === subtypeId) ?? null

  function open(id: string, initialSubtypeId?: string) {
    setSkillId(id)
    setSubtypeId(initialSubtypeId ?? null)
  }

  function close() {
    setSkillId(null)
    setSubtypeId(null)
  }

  const drawer = (
    <Drawer
      open={!!skill}
      onClose={close}
      title={(subtype ? subtype.name_es : skill?.name_es) ?? ''}
      panelClassName={demoStyles.wideDrawerPanel}
    >
      {skill && (
        subtype ? (
          <SubtypeDetail subtype={subtype} skillName={skill.name_es} onBack={() => setSubtypeId(null)} />
        ) : (
          <SkillDetail skill={skill} onSelectSubtype={setSubtypeId} />
        )
      )}
    </Drawer>
  )

  return { skills, loading, error, open, close, drawer }
}
