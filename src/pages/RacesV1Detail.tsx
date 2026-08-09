import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { renderMarkdown } from '../lib/markdown'
import { Drawer } from '../components/ui/Drawer'
import styles from './Classes.module.css'
import demoStyles from './RacesV1Detail.module.css'

// ── Detalle de raza (schema v1), usado por /races-v1 ────────────────────────
// Encapsula la consulta a v1.races (con race_traits, race_languages,
// race_favored_class_options, race_feats y race_variants embebidos) y el
// Drawer de detalle. 82 filas, así que se cargan todas de golpe en una sola
// query — igual que /classes-v1 y /skills-v1 — en vez de paginar como
// /feats-v1 o /bestiary-v1.
//
// races.standard_traits/alternate_traits (jsonb) siguen existiendo en la fila
// pero son redundantes con race_traits (misma info ya normalizada por fila,
// con trait_kind 'standard'|'alternate'); se usa race_traits como fuente para
// el Drawer y el jsonb no se consulta.
//
// race_feats.feat_id es nullable — no todas las dotes raciales mencionadas en
// el texto original se resolvieron contra v1.feats (match_confidence
// 'slug'|'exact'|'fuzzy'|'unmatched'). Cuando no hay fila de dote resuelta se
// muestra feat_name_raw tal cual, sin intentar enlazar.
//
// Cobertura desigual: de las 82 razas, 37 son las "clásicas" (Core Rulebook +
// Advanced Race Guide) con datos completos; las otras 45 vienen de
// more-races/ (bestiario adaptado a raza jugable — gnoll, centauro,
// sahuagin, drider, ogro...) y tienen huecos reales: 12/82 sin rasgos
// parseables y 27/82 sin base_speed_ft. Las secciones de rasgos muestran un
// aviso explícito cuando no hay datos en vez de desaparecer sin más, para que
// no parezca una página rota.
//
// race_variants (39 filas, solo 8 de las 82 razas) mezcla dos procedencias
// distintas en el mismo source_kind: 'subpage' (variante regional/de sangre,
// ej. aasimar de sangre bestial) y 'heritage' (linaje de ascendencia, ej.
// tiefling/aasimar/skinwalker). Su columna `benefits` es jsonb catch-all sin
// forma fija — cambia de claves según la raza y la fuente original (a veces
// una lista de rasgos {name_es, description_es}, a veces un objeto plano
// clave→texto, a veces una lista de strings) — se renderiza genéricamente
// por clave/tipo de valor en vez de asumir un shape concreto, ver
// renderBenefitValue más abajo.

export interface SizeRef {
  id: string
  name_es: string
}

export interface LanguageRef {
  id: string
  name_es: string
}

export interface ClassRef {
  id: string
  name_es: string
}

export interface FeatRef {
  id: string
  name_es: string
}

export interface RaceTraitRow {
  id: number
  trait_kind: 'standard' | 'alternate'
  name_es: string
  description_es: string
}

export interface RaceLanguageRow {
  is_bonus: boolean
  languages: LanguageRef
}

export interface RaceFavoredClassOptionRow {
  id: number
  option_es: string
  classes: ClassRef | null
}

export interface RaceFeatRow {
  id: number
  feat_name_raw: string
  match_confidence: 'slug' | 'exact' | 'fuzzy' | 'unmatched'
  feats: FeatRef | null
}

// benefits es jsonb catch-all heterogéneo — ver comentario de cabecera.
// Los valores reales observados son: string, string[], objeto plano
// clave→string, o array de objetos {name_es, description_es?, url?}.
export type RaceVariantBenefits = Record<string, unknown>

export interface RaceVariantRow {
  id: number
  name_es: string
  name_en: string | null
  source_kind: 'subpage' | 'heritage'
  ability_modifiers: Record<string, number> | null
  benefits: RaceVariantBenefits | null
  description_es: string | null
}

export interface RaceV1Row {
  id: string
  name_es: string
  name_en: string | null
  creature_type: string | null
  base_speed_ft: number | null
  ability_modifiers: Record<string, number> | null
  description_es: string
  sizes: SizeRef | null
  publishers: { name: string } | null
  sourcebooks: { title: string } | null
  race_traits: RaceTraitRow[]
  race_languages: RaceLanguageRow[]
  race_favored_class_options: RaceFavoredClassOptionRow[]
  race_feats: RaceFeatRow[]
  race_variants: RaceVariantRow[]
}

export const RACE_SELECT = `id, name_es, name_en, creature_type, base_speed_ft, ability_modifiers, description_es,
  sizes ( id, name_es ),
  publishers ( name ),
  sourcebooks ( title ),
  race_traits ( id, trait_kind, name_es, description_es ),
  race_languages ( is_bonus, languages ( id, name_es ) ),
  race_favored_class_options ( id, option_es, classes ( id, name_es ) ),
  race_feats ( id, feat_name_raw, match_confidence, feats ( id, name_es ) ),
  race_variants ( id, name_es, name_en, source_kind, ability_modifiers, benefits, description_es )`

const ABILITY_LABELS: Record<string, string> = {
  str: 'FUE', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR',
}
const ABILITY_ORDER = ['str', 'dex', 'con', 'int', 'wis', 'cha']

export function formatAbilityModifiers(mods: Record<string, number> | null): string {
  if (!mods) return '—'
  const parts: string[] = []
  for (const key of ABILITY_ORDER) {
    const value = mods[key]
    if (value == null) continue
    parts.push(`${value > 0 ? '+' : ''}${value} ${ABILITY_LABELS[key]}`)
  }
  if (mods.choice != null) {
    parts.push(`+${mods.choice} a elección`)
  }
  return parts.length > 0 ? parts.join(', ') : '—'
}

// Convierte una clave jsonb (snake_case, a veces con sufijo "_es") en una
// etiqueta legible — ej. "aptitud_sortilega_alternativa_es" → "Aptitud
// Sortilega Alternativa". No hay traducción de acentos perdidos en las
// claves originales (ej. "sortilega" sin tilde) porque son literales del
// jsonb fuente, no texto libre — se muestran tal cual llegan.
function humanizeBenefitKey(key: string): string {
  return key
    .replace(/_es$/, '')
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// benefits no tiene un shape fijo (ver comentario de cabecera) — se
// distingue en tiempo de ejecución entre string, lista de strings, lista de
// objetos {name_es, description_es?/url?} y objeto plano clave→string,
// en vez de asumir cuál de las cuatro formas trae cada raza.
function BenefitValue({ value }: { value: unknown }) {
  if (value == null) return null

  if (typeof value === 'string') {
    return <p className={styles.featureDesc}>{value}</p>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null
    if (typeof value[0] === 'string') {
      return (
        <ul className={demoStyles.benefitList}>
          {(value as string[]).map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      )
    }
    return (
      <div className={styles.featureTable}>
        {(value as Record<string, unknown>[]).map((item, i) => (
          <div key={i} className={styles.featureRow}>
            <div className={styles.featureBody}>
              <span className={styles.featureName}>{String(item.name_es ?? item.url ?? '—')}</span>
              {item.description_es != null && (
                <span className={styles.featureDesc}>{String(item.description_es)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (typeof value === 'object') {
    return (
      <div className={demoStyles.benefitObject}>
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <p key={k} className={styles.featureDesc}>
            <strong>{humanizeBenefitKey(k)}: </strong>
            {typeof v === 'string' ? v : JSON.stringify(v)}
          </p>
        ))}
      </div>
    )
  }

  return <p className={styles.featureDesc}>{String(value)}</p>
}

function RaceVariantCard({ variant }: { variant: RaceVariantRow }) {
  const hasModifiers = Object.keys(variant.ability_modifiers ?? {}).length > 0
  const benefitEntries = Object.entries(variant.benefits ?? {})

  return (
    <div className={demoStyles.variantCard}>
      <div className={demoStyles.variantHeader}>
        <span className={demoStyles.variantName}>{variant.name_es}</span>
        <span className={demoStyles.badge}>
          {variant.source_kind === 'heritage' ? 'Herencia / Linaje' : 'Variante'}
        </span>
      </div>
      {hasModifiers && (
        <p className={demoStyles.sourceLine}>
          Modificadores: {formatAbilityModifiers(variant.ability_modifiers)}
        </p>
      )}
      {variant.description_es && <p className={styles.featureDesc}>{variant.description_es}</p>}
      {benefitEntries.map(([key, value]) => (
        <div key={key} className={demoStyles.benefitGroup}>
          <p className={demoStyles.benefitTitle}>{humanizeBenefitKey(key)}</p>
          <BenefitValue value={value} />
        </div>
      ))}
    </div>
  )
}

interface RaceDetailProps {
  race: RaceV1Row
}

export function RaceDetail({ race }: RaceDetailProps) {
  const standardTraits = race.race_traits.filter((t) => t.trait_kind === 'standard')
  const alternateTraits = race.race_traits.filter((t) => t.trait_kind === 'alternate')
  const initialLanguages = race.race_languages.filter((l) => !l.is_bonus).map((l) => l.languages)
  const bonusLanguages = race.race_languages.filter((l) => l.is_bonus).map((l) => l.languages)
  const favoredClassOptions = [...race.race_favored_class_options].sort((a, b) => a.id - b.id)
  const racialFeats = [...race.race_feats].sort((a, b) => a.id - b.id)
  const variants = [...race.race_variants].sort((a, b) => a.id - b.id)

  return (
    <>
      <div className={demoStyles.drawerMeta}>
        {race.sizes && <span className={demoStyles.badge}>{race.sizes.name_es}</span>}
        {race.base_speed_ft != null && <span className={demoStyles.badge}>{race.base_speed_ft} pies</span>}
        {race.creature_type && <span className={demoStyles.badge}>{race.creature_type}</span>}
      </div>

      {(race.publishers || race.sourcebooks) && (
        <p className={demoStyles.sourceLine}>
          Fuente: {race.publishers?.name}
          {race.sourcebooks ? ` — ${race.sourcebooks.title}` : ''}
        </p>
      )}

      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Modificadores de característica</span>
          <span className={styles.statVal}>{formatAbilityModifiers(race.ability_modifiers)}</span>
        </div>
      </div>

      <div
        className={demoStyles.raceDescription}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(race.description_es) }}
      />

      {standardTraits.length === 0 && alternateTraits.length === 0 ? (
        <div className={styles.cardSection}>
          <p className={styles.sectionTitle}>Rasgos raciales</p>
          <p className={demoStyles.emptyNotice}>Sin datos de rasgos disponibles para esta raza.</p>
        </div>
      ) : (
        <>
          {standardTraits.length > 0 && (
            <div className={styles.cardSection}>
              <p className={styles.sectionTitle}>Rasgos raciales estándar ({standardTraits.length})</p>
              <div className={styles.featureTable}>
                {standardTraits.map((t) => (
                  <div key={t.id} className={styles.featureRow}>
                    <div className={styles.featureBody}>
                      <span className={styles.featureName}>{t.name_es}</span>
                      <span className={styles.featureDesc}>{t.description_es}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alternateTraits.length > 0 && (
            <div className={styles.cardSection}>
              <p className={styles.sectionTitle}>Rasgos raciales alternativos ({alternateTraits.length})</p>
              <div className={styles.featureTable}>
                {alternateTraits.map((t) => (
                  <div key={t.id} className={styles.featureRow}>
                    <div className={styles.featureBody}>
                      <span className={styles.featureName}>{t.name_es}</span>
                      <span className={styles.featureDesc}>{t.description_es}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {initialLanguages.length > 0 && (
        <div className={styles.cardSection}>
          <p className={styles.sectionTitle}>Idiomas iniciales ({initialLanguages.length})</p>
          <div className={styles.skillPills}>
            {initialLanguages.map((l) => (
              <span key={l.id} className={styles.skillPill}>{l.name_es}</span>
            ))}
          </div>
        </div>
      )}

      {bonusLanguages.length > 0 && (
        <div className={styles.cardSection}>
          <p className={styles.sectionTitle}>Idiomas a elección (Lingüística) ({bonusLanguages.length})</p>
          <div className={styles.skillPills}>
            {bonusLanguages.map((l) => (
              <span key={l.id} className={styles.skillPill}>{l.name_es}</span>
            ))}
          </div>
        </div>
      )}

      {favoredClassOptions.length > 0 && (
        <div className={styles.cardSection}>
          <p className={styles.sectionTitle}>Opciones de clase predilecta ({favoredClassOptions.length})</p>
          <div className={styles.featureTable}>
            {favoredClassOptions.map((o) => (
              <div key={o.id} className={styles.featureRow}>
                <div className={styles.featureBody}>
                  <span className={styles.featureName}>{o.classes?.name_es ?? 'Todas las clases'}</span>
                  <span className={styles.featureDesc}>{o.option_es}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {racialFeats.length > 0 && (
        <div className={styles.cardSection}>
          <p className={styles.sectionTitle}>Dotes raciales ({racialFeats.length})</p>
          <div className={styles.skillPills}>
            {racialFeats.map((f) => (
              <span
                key={f.id}
                className={demoStyles.featChip}
                title={f.match_confidence === 'unmatched' || f.match_confidence === 'fuzzy'
                  ? 'Sin coincidencia exacta en v1.feats'
                  : undefined}
              >
                {f.feats?.name_es ?? f.feat_name_raw}
              </span>
            ))}
          </div>
        </div>
      )}

      {variants.length > 0 && (
        <div className={styles.cardSection}>
          <p className={styles.sectionTitle}>Variantes y herencias ({variants.length})</p>
          <div className={demoStyles.variantList}>
            {variants.map((v) => <RaceVariantCard key={v.id} variant={v} />)}
          </div>
        </div>
      )}
    </>
  )
}

// Carga v1.races una vez (82 filas) y gestiona el Drawer de detalle.
export function useRacesV1Drawer() {
  const [races, setRaces] = useState<RaceV1Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [raceId, setRaceId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .schema('v1')
      .from('races')
      .select(RACE_SELECT)
      .order('name_es')
      .order('id', { foreignTable: 'race_traits' })
      .order('id', { foreignTable: 'race_variants' })
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) {
          setError(err.message)
          setRaces([])
        } else {
          setRaces((data ?? []) as unknown as RaceV1Row[])
        }
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const race = races.find((r) => r.id === raceId) ?? null

  function open(id: string) {
    setRaceId(id)
  }

  function close() {
    setRaceId(null)
  }

  const drawer = (
    <Drawer open={!!race} onClose={close} title={race?.name_es ?? ''} panelClassName={demoStyles.wideDrawerPanel}>
      {race && <RaceDetail race={race} />}
    </Drawer>
  )

  return { races, loading, error, open, close, drawer }
}
