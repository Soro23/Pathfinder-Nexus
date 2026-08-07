import { useState } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { renderMarkdown } from '../lib/markdown'
import { Drawer } from '../components/ui/Drawer'
import { formatCR } from '../lib/formatCR'
import styles from './Bestiary.module.css'
import demoStyles from './BestiaryV1Detail.module.css'

// ── Detalle de criatura/PNJ (schema v1), usado por /bestiary-v1 ─────────────
// Encapsula la consulta a v1.creatures (con monster_types, sizes, alignments,
// races, creature_special_abilities, creature_languages y
// creature_condition_immunities embebidos) y el Drawer de ficha completa.
//
// senses/defense/offense/statistics/ecology son columnas jsonb con pares
// clave→valor de texto libre (extraídos del bloque de estadísticas original
// en español, ej. {"ca": "16, contacto 11...", "pv": "26 (4d8+8)"}) — no una
// estructura numérica normalizada. Se renderizan dinámicamente iterando las
// claves presentes en cada fila (con una etiqueta bonita si se reconoce, o
// la clave humanizada si no) en vez de asumir un set fijo de campos, porque
// varía bastante de una criatura a otra.
//
// creature_attacks y creature_feats dan 42501 (permission denied) con el rol
// anon en el estado actual del schema — mismo problema de GRANT pendiente que
// documentan otras tablas de v1 (ver memoria pathfinder-nexus-v1-schema). Se
// consultan aparte del select principal y con captura de error silenciosa
// para que un 42501 en cualquiera de las dos no tumbe el resto de la ficha;
// en cuanto se conceda SELECT sobre ellas, estas secciones se rellenan solas.
// Como tampoco se puede confirmar hoy el nombre exacto de las columnas de
// creature_attacks, su tabla se pinta con columnas derivadas dinámicamente de
// las filas devueltas en vez de asumir nombres de campo no verificados.

export interface RefRow {
  id: string
  name_es: string
}

export interface SpecialAbilityRow {
  id: number
  name_es: string
  description_es: string
}

interface LanguageEmbed {
  languages: RefRow
}

interface ConditionImmunityEmbed {
  conditions: RefRow
}

interface FeatEmbed {
  feats: RefRow
}

export interface CreatureListRow {
  id: string
  name_es: string
  is_npc: boolean
  cr: number | null
  xp: number | null
  class_levels: string | null
  monster_types: RefRow | null
  sizes: RefRow | null
  alignments: RefRow | null
}

export interface CreatureDetailRow {
  id: string
  name_es: string
  is_npc: boolean
  cr: number | null
  xp: number | null
  class_levels: string | null
  gear: string[] | null
  subtypes: string[] | null
  terrain: string[] | null
  senses: Record<string, string> | null
  defense: Record<string, string> | null
  offense: Record<string, string> | null
  statistics: Record<string, string> | null
  ecology: Record<string, string> | null
  description_es: string | null
  variant_of: string | null
  variant_label_es: string | null
  source_path: string | null
  monster_types: RefRow | null
  sizes: RefRow | null
  alignments: RefRow | null
  races: RefRow | null
  creature_special_abilities: SpecialAbilityRow[]
  creature_languages: LanguageEmbed[]
  creature_condition_immunities: ConditionImmunityEmbed[]
}

export interface VariantRefRow {
  id: string
  name_es: string
  variant_label_es: string | null
}

// PostgREST solo usa el filtro sobre una relación embebida para restringir
// las filas padre cuando el embed lleva `!inner` — sin él, `.eq('monster_types.id', ...)`
// se acepta sin error pero no descarta ninguna criatura (se comprobó contra
// la API real: content-range seguía en 7603 filas). Por eso el select de
// monster_types se construye dinámicamente según haya o no filtro de tipo
// activo, igual que feat_type_assignments en FeatsV1Example.tsx.
export function buildCreatureListSelect(typeFilterActive: boolean): string {
  return `id, name_es, is_npc, cr, xp, class_levels,
  monster_types${typeFilterActive ? '!inner' : ''} ( id, name_es ),
  sizes ( id, name_es ),
  alignments ( id, name_es )`
}

const CREATURE_DETAIL_SELECT = `id, name_es, is_npc, cr, xp, class_levels, gear,
  subtypes, terrain, senses, defense, offense, statistics, ecology,
  description_es, variant_of, variant_label_es, source_path,
  monster_types ( id, name_es ),
  sizes ( id, name_es ),
  alignments ( id, name_es ),
  races ( id, name_es ),
  creature_special_abilities ( id, name_es, description_es ),
  creature_languages ( languages ( id, name_es ) ),
  creature_condition_immunities ( conditions ( id, name_es ) )`

// Etiquetas bonitas para las claves más habituales de los bloques jsonb.
// Cualquier clave no listada aquí cae al humanizador genérico (formatStatLabel).
const STAT_LABELS: Record<string, string> = {
  ca: 'CA',
  aura: 'Aura',
  init: 'Iniciativa',
  sentidos: 'Sentidos',
  percepcion: 'Percepción',
  pv: 'PV',
  pv_regeneracion: 'Regeneración',
  regeneracion: 'Regeneración',
  rd: 'RD',
  dr: 'RD',
  ref: 'Reflejos',
  vol: 'Voluntad',
  fort: 'Fortaleza',
  debilidades: 'Debilidades',
  resistencias: 'Resistencias',
  inmunidades: 'Inmunidades',
  ri: 'RI',
  velocidad: 'Velocidad',
  cuerpo_a_cuerpo: 'Cuerpo a cuerpo',
  distancia: 'A distancia',
  ataques_especiales: 'Ataques especiales',
  espacio: 'Espacio',
  alcance: 'Alcance',
  fue: 'FUE',
  des: 'DES',
  con: 'CON',
  int: 'INT',
  sab: 'SAB',
  car: 'CAR',
  ataque_base: 'Ataque base',
  cmb: 'CMB',
  cmd: 'CMD',
  dotes: 'Dotes',
  habilidades: 'Habilidades',
  idiomas: 'Idiomas',
  modificadores_raciales: 'Modificadores raciales',
  cualidades_especiales: 'Cualidades especiales',
  equipo_de_combate: 'Equipo de combate',
  otros_objetos: 'Otros objetos',
  entorno: 'Entorno',
  organizacion: 'Organización',
  tesoro: 'Tesoro',
}

function formatStatLabel(key: string): string {
  return STAT_LABELS[key] ?? key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

interface StatSectionProps {
  title: string
  data: Record<string, string> | null
}

function StatSection({ title, data }: StatSectionProps) {
  const entries = data ? Object.entries(data).filter(([, value]) => value) : []
  if (entries.length === 0) return null

  return (
    <div className={demoStyles.statSection}>
      <p className={demoStyles.statSectionTitle}>{title}</p>
      <div className={demoStyles.statGrid}>
        {entries.map(([key, value]) => (
          <div key={key} className={demoStyles.statRow}>
            <span className={demoStyles.statLabel}>{formatStatLabel(key)}</span>
            <span className={demoStyles.statValue}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// creature_attacks da 42501 con el rol anon a día de hoy — devuelve [] en vez
// de propagar el error para no tumbar el resto de la ficha (ver comentario
// de cabecera). Se pinta como tabla de columnas derivadas dinámicamente
// porque no se puede confirmar el nombre exacto de sus columnas mientras
// siga bloqueada.
async function fetchCreatureAttacks(creatureId: string): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase
    .schema('v1')
    .from('creature_attacks')
    .select('*')
    .eq('creature_id', creatureId)
    .order('id')
  if (error) return []
  return (data ?? []) as Record<string, unknown>[]
}

async function fetchCreatureFeats(creatureId: string): Promise<FeatEmbed[]> {
  const { data, error } = await supabase
    .schema('v1')
    .from('creature_feats')
    .select('feats ( id, name_es )')
    .eq('creature_id', creatureId)
  if (error) return []
  return (data ?? []) as unknown as FeatEmbed[]
}

async function fetchVariants(creatureId: string): Promise<VariantRefRow[]> {
  const { data, error } = await supabase
    .schema('v1')
    .from('creatures')
    .select('id, name_es, variant_label_es')
    .eq('variant_of', creatureId)
    .order('variant_label_es')
  if (error) return []
  return (data ?? []) as VariantRefRow[]
}

async function fetchVariantOf(variantOfId: string): Promise<RefRow | null> {
  const { data, error } = await supabase
    .schema('v1')
    .from('creatures')
    .select('id, name_es')
    .eq('id', variantOfId)
    .maybeSingle()
  if (error) return null
  return (data ?? null) as RefRow | null
}

function buildAttackColumns(rows: Record<string, unknown>[]): string[] {
  const skip = new Set(['id', 'creature_id'])
  const cols: string[] = []
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (skip.has(key) || cols.includes(key)) continue
      cols.push(key)
    }
  }
  return cols
}

interface CreatureDetailProps {
  creature: CreatureDetailRow
  attacks: Record<string, unknown>[]
  feats: FeatEmbed[]
  variants: VariantRefRow[]
  variantOf: RefRow | null
  onSelectVariant: (id: string) => void
}

export function CreatureDetail({ creature, attacks, feats, variants, variantOf, onSelectVariant }: CreatureDetailProps) {
  const attackColumns = buildAttackColumns(attacks)
  const languages = creature.creature_languages.map((l) => l.languages).filter(Boolean)
  const conditionImmunities = creature.creature_condition_immunities.map((c) => c.conditions).filter(Boolean)

  return (
    <>
      <div className={demoStyles.drawerMeta}>
        {creature.cr != null && <span className={demoStyles.crBadge}>FD {formatCR(creature.cr)}</span>}
        {creature.xp != null && <span className={demoStyles.badge}>{creature.xp.toLocaleString('es')} PX</span>}
        {creature.monster_types && <span className={demoStyles.badge}>{creature.monster_types.name_es}</span>}
        {creature.sizes && <span className={demoStyles.badge}>{creature.sizes.name_es}</span>}
        {creature.alignments && <span className={demoStyles.badge}>{creature.alignments.name_es}</span>}
        {creature.races && <span className={demoStyles.badge}>Raza: {creature.races.name_es}</span>}
        <span className={demoStyles.badge}>{creature.is_npc ? 'PNJ' : 'Monstruo'}</span>
      </div>

      {creature.subtypes && creature.subtypes.length > 0 && (
        <p className={demoStyles.sourceLine}>Subtipos: {creature.subtypes.join(', ')}</p>
      )}
      {creature.terrain && creature.terrain.length > 0 && (
        <p className={demoStyles.sourceLine}>Terreno: {creature.terrain.join(', ')}</p>
      )}
      {creature.class_levels && (
        <p className={demoStyles.sourceLine}>Niveles de clase: {creature.class_levels}</p>
      )}

      {variantOf && (
        <button type="button" className={demoStyles.variantBtn} onClick={() => onSelectVariant(variantOf.id)}>
          <ArrowLeft size={14} /> Variante de: {variantOf.name_es}
          {creature.variant_label_es ? ` (${creature.variant_label_es})` : ''}
        </button>
      )}

      {variants.length > 0 && (
        <div className={styles.monsterSection}>
          <span className={styles.sectionLabel}>Variantes ({variants.length})</span>
          <div className={demoStyles.usesList}>
            {variants.map((v) => (
              <button key={v.id} type="button" className={demoStyles.variantChip} onClick={() => onSelectVariant(v.id)}>
                {v.variant_label_es ?? v.name_es} <ChevronRight size={12} />
              </button>
            ))}
          </div>
        </div>
      )}

      {creature.description_es && (
        <div
          className={`${demoStyles.creatureDescription}`}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(creature.description_es) }}
        />
      )}

      <StatSection title="Sentidos" data={creature.senses} />
      <StatSection title="Defensa" data={creature.defense} />
      <StatSection title="Ofensiva" data={creature.offense} />
      <StatSection title="Estadísticas" data={creature.statistics} />
      <StatSection title="Ecología" data={creature.ecology} />

      {attacks.length > 0 && (
        <div className={styles.monsterSection}>
          <span className={styles.sectionLabel}>Ataques ({attacks.length})</span>
          <div className={demoStyles.tableWrap}>
            <table className={demoStyles.attackTable}>
              <thead>
                <tr>
                  {attackColumns.map((col) => (
                    <th key={col}>{formatStatLabel(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attacks.map((row, i) => (
                  <tr key={i}>
                    {attackColumns.map((col) => (
                      <td key={col}>{row[col] != null && row[col] !== '' ? String(row[col]) : '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {creature.creature_special_abilities.length > 0 && (
        <div className={styles.monsterSection}>
          <span className={styles.sectionLabel}>Habilidades especiales ({creature.creature_special_abilities.length})</span>
          <div className={demoStyles.abilityList}>
            {creature.creature_special_abilities.map((a) => (
              <div key={a.id} className={demoStyles.abilityRow}>
                <span className={demoStyles.abilityName}>{a.name_es}</span>
                <p className={demoStyles.abilityDesc}>{a.description_es}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {feats.length > 0 && (
        <div className={styles.monsterSection}>
          <span className={styles.sectionLabel}>Dotes ({feats.length})</span>
          <div className={demoStyles.usesList}>
            {feats.map((f) => (
              <span key={f.feats.id} className={demoStyles.chip}>{f.feats.name_es}</span>
            ))}
          </div>
        </div>
      )}

      {languages.length > 0 && (
        <div className={styles.monsterSection}>
          <span className={styles.sectionLabel}>Idiomas ({languages.length})</span>
          <div className={demoStyles.usesList}>
            {languages.map((l) => (
              <span key={l.id} className={demoStyles.chip}>{l.name_es}</span>
            ))}
          </div>
        </div>
      )}

      {conditionImmunities.length > 0 && (
        <div className={styles.monsterSection}>
          <span className={styles.sectionLabel}>Inmunidades a estados ({conditionImmunities.length})</span>
          <div className={demoStyles.usesList}>
            {conditionImmunities.map((c) => (
              <span key={c.id} className={demoStyles.chip}>{c.name_es}</span>
            ))}
          </div>
        </div>
      )}

      {creature.gear && creature.gear.length > 0 && (
        <div className={styles.monsterSection}>
          <span className={styles.sectionLabel}>Equipo ({creature.gear.length})</span>
          <ul className={demoStyles.gearList}>
            {creature.gear.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {creature.source_path && (
        <p className={styles.monsterSource}>Fuente: {creature.source_path}</p>
      )}
    </>
  )
}

// Carga el detalle de una criatura bajo demanda al abrirla (7603 filas es
// demasiado para embeber senses/defense/offense/statistics/ecology +
// habilidades especiales de todas de golpe) y gestiona el Drawer de ficha
// completa, incluida la navegación entre variantes (forma base ↔ formas
// alternativas, ver comentario de cabecera del archivo sobre variant_of).
export function useCreatureDrawer() {
  const [creatureId, setCreatureId] = useState<string | null>(null)
  const [creature, setCreature] = useState<CreatureDetailRow | null>(null)
  const [attacks, setAttacks] = useState<Record<string, unknown>[]>([])
  const [feats, setFeats] = useState<FeatEmbed[]>([])
  const [variants, setVariants] = useState<VariantRefRow[]>([])
  const [variantOf, setVariantOf] = useState<RefRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function open(id: string) {
    setCreatureId(id)
    setCreature(null)
    setAttacks([])
    setFeats([])
    setVariants([])
    setVariantOf(null)
    setError(null)
    setLoading(true)

    supabase
      .schema('v1')
      .from('creatures')
      .select(CREATURE_DETAIL_SELECT)
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message)
          setLoading(false)
          return
        }
        const row = data as unknown as CreatureDetailRow | null
        setCreature(row)
        setLoading(false)

        if (!row) return
        fetchCreatureAttacks(id).then(setAttacks)
        fetchCreatureFeats(id).then(setFeats)
        fetchVariants(id).then(setVariants)
        if (row.variant_of) fetchVariantOf(row.variant_of).then(setVariantOf)
      })
  }

  function close() {
    setCreatureId(null)
  }

  const drawer = (
    <Drawer
      open={!!creatureId}
      onClose={close}
      title={creature?.name_es ?? (loading ? 'Cargando...' : '')}
      panelClassName={demoStyles.wideDrawerPanel}
    >
      {error && <div className={demoStyles.errorText}>Error: {error}</div>}
      {loading && !creature && <p className={demoStyles.sourceLine}>Cargando ficha...</p>}
      {creature && (
        <CreatureDetail
          creature={creature}
          attacks={attacks}
          feats={feats}
          variants={variants}
          variantOf={variantOf}
          onSelectVariant={open}
        />
      )}
    </Drawer>
  )

  return { open, close, drawer }
}
