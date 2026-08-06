import { useEffect, useState } from 'react'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { renderMarkdown } from '../lib/markdown'
import { Drawer } from '../components/ui/Drawer'
import { useSkillsV1Drawer } from './SkillsV1Detail'
import styles from './Classes.module.css'
import demoStyles from './ClassesV1Detail.module.css'

// ── Detalle de clase (schema v1), usado por /classes-v1 ─────────────────────
// Encapsula la consulta a v1.classes (con class_skills, archetypes,
// class_levels y class_spell_slots embebidos) y el Drawer de detalle. Al
// abrir una habilidad de clase desde aquí, reutiliza el mismo Drawer de
// habilidad de SkillsV1Detail.tsx (useSkillsV1Drawer) que ya usan
// /skills-v1 y /feats-v1. Los arquetipos abren un segundo par de Drawers
// (lista → detalle) gestionados por useArchetypesV1Drawer más abajo, con
// archetype_features cargado bajo demanda por arquetipo (10143 filas en
// total — demasiado para embeberlas todas de golpe, pero ~5 de media por
// arquetipo, así que cargarlas solo al abrir un arquetipo concreto es barato).
//
// Algunas clases eligen entre listas cerradas de opciones que v1 modela como
// tablas propias con class_id (relación N:1 clase↔mecánica — bloodlines y
// eidolon_evolutions, por ejemplo, las comparten entre dos clases cada una):
// descubrimientos de alquimista, embrujos de bruja, linajes de hechicero y
// rabioso de sangre (bloodlines.class_id distingue "sorcerer"/"bloodrager"),
// espíritus de chamán, misterios/maldiciones de oráculo, órdenes de
// adalid/samurái, y formas base/evoluciones/habilidades universales de
// eidolon de convocador (eidolon_evolutions.kind distingue las tres, y
// class_id distingue "summoner"/"summoner_unchained"; el Convocador
// Desencadenado además tiene su propio sistema de subtipos de eidolon vía
// eidolon_subtypes → eidolon_subtype_bonuses, sin equivalente en el
// convocador base). Varias de estas tablas (`class_features`, `orders`,
// `order_powers`, `eidolon_subtypes`, `eidolon_subtype_bonuses`)
// necesitaron el mismo GRANT — daban 42501 hasta que se concedió SELECT a
// anon. Todas siguen el mismo patrón lista→detalle que los arquetipos
// (algunas con una sub-lista propia, ej. una orden → sus capacidades por
// nivel) y se gestionan con useChoiceDrawer(), parametrizado por
// CLASS_CHOICE_MECHANICS más abajo.
//
// eidolon_subtype_bonuses no tiene name_es propio (solo level+description_es)
// — fetchNestedChoiceDetail sintetiza "Nivel N" como nombre cuando
// hasChildName=false, en vez de forzar una columna que no existe.
//
// Todos los Drawers (clase, arquetipos, opciones de clase, habilidad) quedan
// encapsulados en el único `drawer` que devuelve useClassesV1Drawer().
//
// Fuera de alcance deliberadamente (mismo criterio que prerequisites_structured
// en /feats-v1): `archetype_replaces` (6529 filas) — qué característica de
// clase reemplaza cada arquetipo, una dimensión distinta a "qué gana".
// `race_favored_class_options` (875 filas) tampoco se consulta — es una
// relación raza↔clase, no de la clase en sí.

export interface ClassGroupRef {
  id: string
  name_es: string
}

export interface ClassSkillRef {
  skills: { id: string; name_es: string }
}

export interface ArchetypeRef {
  id: string
  name_es: string
}

export interface ClassLevelRow {
  level: number
  bab: number
  fort: number
  ref: number
  will: number
  special_es: string | null
}

export interface ClassSpellSlotRow {
  level: number
  spell_level: number
  slots: number
}

export interface ClassFeatureRow {
  id: number
  name_es: string
  description_es: string
}

export interface ArchetypeFeatureRow {
  id: number
  name_es: string
  level: number | null
  description_es: string
}

export interface ClassV1Row {
  id: string
  name_es: string
  name_en: string | null
  hit_die: string
  alignment_restriction: string | null
  description_es: string
  class_groups: ClassGroupRef | null
  publishers: { name: string } | null
  sourcebooks: { title: string } | null
  class_skills: ClassSkillRef[]
  archetypes: ArchetypeRef[]
  class_levels: ClassLevelRow[]
  class_spell_slots: ClassSpellSlotRow[]
  class_features: ClassFeatureRow[]
}

// class_spell_slots.class_id no tiene una FK real definida en la base (a
// diferencia de class_levels/class_skills/archetypes, que sí la tienen) —
// PostgREST no puede embeberla aquí ("Could not find a relationship between
// 'classes' and 'class_spell_slots'"), así que se consulta aparte y se
// combina en el cliente (ver fetchSpellSlotsByClass más abajo).
export const CLASS_SELECT = `id, name_es, name_en, hit_die, alignment_restriction, description_es,
  class_groups ( id, name_es ),
  publishers ( name ),
  sourcebooks ( title ),
  class_skills ( skills ( id, name_es ) ),
  archetypes ( id, name_es ),
  class_levels ( level, bab, fort, ref, will, special_es ),
  class_features ( id, name_es, description_es )`

async function fetchSpellSlotsByClass(): Promise<Map<string, ClassSpellSlotRow[]>> {
  const { data, error } = await supabase
    .schema('v1')
    .from('class_spell_slots')
    .select('class_id, level, spell_level, slots')
  if (error) throw error
  const map = new Map<string, ClassSpellSlotRow[]>()
  for (const row of (data ?? []) as { class_id: string; level: number; spell_level: number; slots: number }[]) {
    if (!map.has(row.class_id)) map.set(row.class_id, [])
    map.get(row.class_id)!.push({ level: row.level, spell_level: row.spell_level, slots: row.slots })
  }
  return map
}

// Carga bajo demanda al abrir el detalle de un arquetipo concreto — con
// 10143 filas en total no tiene sentido embeberlas todas en CLASS_SELECT.
export async function fetchArchetypeFeatures(archetypeId: string): Promise<ArchetypeFeatureRow[]> {
  const { data, error } = await supabase
    .schema('v1')
    .from('archetype_features')
    .select('id, name_es, level, description_es')
    .eq('archetype_id', archetypeId)
    .order('level')
  if (error) throw error
  return (data ?? []) as ArchetypeFeatureRow[]
}

// ── Opciones de clase con tabla propia (descubrimientos, embrujos, estirpes,
// espíritus, misterios/maldiciones) — ver comentario de cabecera del archivo.
export interface ChoiceListItem {
  id: string
  name_es: string
}

export interface ChoiceSubItem {
  id: number
  name_es: string
  level: number | null
  description_es: string
}

export interface ChoiceDetail {
  description_es: string | null
  items: ChoiceSubItem[]
}

export interface ChoiceMechanic {
  key: string
  label: string
  // Tabla donde vive la descripción principal (fila plana, o fila padre en
  // las mecánicas anidadas) — usado por el editor de Admin para saber dónde
  // guardar la edición sin duplicar este mapeo clase→tabla.
  table: string
  // Solo en mecánicas anidadas: la tabla de las sub-opciones (bloodline_powers,
  // spirit_abilities, revelations, order_powers, eidolon_subtype_bonuses).
  childTable?: string
  fetchList: (classId: string) => Promise<ChoiceListItem[]>
  fetchDetail: (id: string) => Promise<ChoiceDetail>
}

async function fetchChoiceList(table: string, classId: string): Promise<ChoiceListItem[]> {
  const { data, error } = await supabase
    .schema('v1')
    .from(table)
    .select('id, name_es')
    .eq('class_id', classId)
    .order('name_es')
  if (error) throw error
  return (data ?? []) as ChoiceListItem[]
}

// Igual que fetchChoiceList pero filtrando además por `kind` — necesario
// para eidolon_evolutions, que mezcla formas base, evoluciones y
// habilidades universales de eidolon en una sola tabla.
async function fetchChoiceListByKind(table: string, classId: string, kind: string): Promise<ChoiceListItem[]> {
  const { data, error } = await supabase
    .schema('v1')
    .from(table)
    .select('id, name_es')
    .eq('class_id', classId)
    .eq('kind', kind)
    .order('name_es')
  if (error) throw error
  return (data ?? []) as ChoiceListItem[]
}

// Para opciones planas (descubrimiento, embrujo, maldición, subtipo de
// eidolon) la propia fila ya tiene su descripción completa — no hay una
// sub-lista de hijos.
async function fetchFlatChoiceDetail(table: string, id: string): Promise<ChoiceDetail> {
  const { data, error } = await supabase.schema('v1').from(table).select('description_es').eq('id', id).single()
  if (error) throw error
  return { description_es: (data as { description_es: string }).description_es, items: [] }
}

// eidolon_evolutions también tiene point_cost — se antepone a la
// descripción como una línea en negrita antes de pasar por renderDescription.
async function fetchEidolonEvolutionDetail(id: string): Promise<ChoiceDetail> {
  const { data, error } = await supabase.schema('v1').from('eidolon_evolutions').select('description_es, point_cost').eq('id', id).single()
  if (error) throw error
  const row = data as { description_es: string; point_cost: number | null }
  const prefix = row.point_cost != null ? `**Coste:** ${row.point_cost} punto(s) de evolución\n\n` : ''
  return { description_es: prefix + row.description_es, items: [] }
}

// Para opciones anidadas (misterio→revelaciones, espíritu→capacidades,
// linaje→poderes, orden→capacidades, subtipo de eidolon→bonificaciones) la
// fila padre aporta el texto introductorio y la tabla hija (con FK real a la
// tabla padre) aporta la lista de sub-opciones. eidolon_subtype_bonuses no
// tiene columna name_es propia — hasChildName=false sintetiza "Nivel N" en
// su lugar en vez de forzar una columna inexistente.
async function fetchNestedChoiceDetail(
  parentTable: string,
  childTable: string,
  fkColumn: string,
  id: string,
  hasLevel: boolean,
  hasChildName: boolean = true
): Promise<ChoiceDetail> {
  const cols = ['id']
  if (hasChildName) cols.push('name_es')
  if (hasLevel) cols.push('level')
  cols.push('description_es')
  const childSelect: string = cols.join(', ')
  const [{ data: parent, error: perr }, { data: children, error: cerr }] = await Promise.all([
    supabase.schema('v1').from(parentTable).select('description_es').eq('id', id).single(),
    supabase.schema('v1').from(childTable).select(childSelect).eq(fkColumn, id).order(hasLevel ? 'level' : 'name_es'),
  ])
  if (perr) throw perr
  if (cerr) throw cerr
  return {
    description_es: (parent as { description_es: string } | null)?.description_es ?? null,
    items: ((children ?? []) as unknown as Record<string, unknown>[]).map((c) => {
      const level = hasLevel ? (c.level as number) : null
      return {
        id: c.id as number,
        name_es: hasChildName ? (c.name_es as string) : `Nivel ${level}`,
        level,
        description_es: c.description_es as string,
      }
    }),
  }
}

// eidolon_evolutions mezcla formas base, evoluciones y habilidades
// universales en una sola tabla (columna `kind`) — se reparte en tres
// mecánicas independientes. Tanto "summoner" como "summoner_unchained"
// tienen sus propias filas (class_id distinto), así que esta función se usa
// para ambas entradas del mapa.
function eidolonEvolutionMechanics(): ChoiceMechanic[] {
  return [
    {
      key: 'eidolon_base_forms',
      label: 'Formas base de eidolon',
      table: 'eidolon_evolutions',
      fetchList: (classId) => fetchChoiceListByKind('eidolon_evolutions', classId, 'base_form'),
      fetchDetail: fetchEidolonEvolutionDetail,
    },
    {
      key: 'eidolon_evolutions',
      label: 'Evoluciones de eidolon',
      table: 'eidolon_evolutions',
      fetchList: (classId) => fetchChoiceListByKind('eidolon_evolutions', classId, 'evolution'),
      fetchDetail: fetchEidolonEvolutionDetail,
    },
    {
      key: 'eidolon_universal_abilities',
      label: 'Habilidades universales de eidolon',
      table: 'eidolon_evolutions',
      fetchList: (classId) => fetchChoiceListByKind('eidolon_evolutions', classId, 'universal_ability'),
      fetchDetail: fetchEidolonEvolutionDetail,
    },
  ]
}

export const CLASS_CHOICE_MECHANICS: Record<string, ChoiceMechanic[]> = {
  alchemist: [{
    key: 'discoveries',
    label: 'Descubrimientos',
    table: 'discoveries',
    fetchList: (classId) => fetchChoiceList('discoveries', classId),
    fetchDetail: (id) => fetchFlatChoiceDetail('discoveries', id),
  }],
  witch: [{
    key: 'hexes',
    label: 'Embrujos',
    table: 'hexes',
    fetchList: (classId) => fetchChoiceList('hexes', classId),
    fetchDetail: (id) => fetchFlatChoiceDetail('hexes', id),
  }],
  sorcerer: [{
    key: 'bloodlines',
    label: 'Linajes',
    table: 'bloodlines',
    childTable: 'bloodline_powers',
    fetchList: (classId) => fetchChoiceList('bloodlines', classId),
    fetchDetail: (id) => fetchNestedChoiceDetail('bloodlines', 'bloodline_powers', 'bloodline_id', id, true),
  }],
  bloodrager: [{
    key: 'bloodlines',
    label: 'Linajes',
    table: 'bloodlines',
    childTable: 'bloodline_powers',
    fetchList: (classId) => fetchChoiceList('bloodlines', classId),
    fetchDetail: (id) => fetchNestedChoiceDetail('bloodlines', 'bloodline_powers', 'bloodline_id', id, true),
  }],
  shaman: [{
    key: 'spirits',
    label: 'Espíritus',
    table: 'spirits',
    childTable: 'spirit_abilities',
    fetchList: (classId) => fetchChoiceList('spirits', classId),
    fetchDetail: (id) => fetchNestedChoiceDetail('spirits', 'spirit_abilities', 'spirit_id', id, true),
  }],
  oracle: [
    {
      key: 'mysteries',
      label: 'Misterios',
      table: 'mysteries',
      childTable: 'revelations',
      fetchList: (classId) => fetchChoiceList('mysteries', classId),
      fetchDetail: (id) => fetchNestedChoiceDetail('mysteries', 'revelations', 'mystery_id', id, false),
    },
    {
      key: 'oracle_curses',
      label: 'Maldiciones',
      table: 'oracle_curses',
      fetchList: (classId) => fetchChoiceList('oracle_curses', classId),
      fetchDetail: (id) => fetchFlatChoiceDetail('oracle_curses', id),
    },
  ],
  cavalier: [{
    key: 'orders',
    label: 'Órdenes',
    table: 'orders',
    childTable: 'order_powers',
    fetchList: (classId) => fetchChoiceList('orders', classId),
    fetchDetail: (id) => fetchNestedChoiceDetail('orders', 'order_powers', 'order_id', id, true),
  }],
  samurai: [{
    key: 'orders',
    label: 'Órdenes',
    table: 'orders',
    childTable: 'order_powers',
    fetchList: (classId) => fetchChoiceList('orders', classId),
    fetchDetail: (id) => fetchNestedChoiceDetail('orders', 'order_powers', 'order_id', id, true),
  }],
  summoner: eidolonEvolutionMechanics(),
  summoner_unchained: [
    ...eidolonEvolutionMechanics(),
    {
      key: 'eidolon_subtypes',
      label: 'Subtipos de eidolon',
      table: 'eidolon_subtypes',
      childTable: 'eidolon_subtype_bonuses',
      fetchList: (classId) => fetchChoiceList('eidolon_subtypes', classId),
      fetchDetail: (id) => fetchNestedChoiceDetail('eidolon_subtypes', 'eidolon_subtype_bonuses', 'subtype_id', id, true, false),
    },
  ],
}

// class_spell_slots llega como filas planas (class_id, level, spell_level,
// slots) — solo 11 de las 39 clases tienen alguna. Se pivota a una matriz
// nivel × nivel de conjuro para poder pintarla como tabla, igual que
// SpellsTable en Classes.tsx hace con el array spellsPerDay del store viejo.
function buildSpellSlotMatrix(rows: ClassSpellSlotRow[]) {
  const levels = [...new Set(rows.map((r) => r.level))].sort((a, b) => a - b)
  const spellLevels = [...new Set(rows.map((r) => r.spell_level))].sort((a, b) => a - b)
  const matrix = new Map<number, Map<number, number>>()
  for (const r of rows) {
    if (!matrix.has(r.level)) matrix.set(r.level, new Map())
    matrix.get(r.level)!.set(r.spell_level, r.slots)
  }
  return { levels, spellLevels, matrix }
}

interface ClassDetailProps {
  cls: ClassV1Row
  onSelectSkill: (skillId: string) => void
  onOpenArchetypes: (className: string, archetypes: ArchetypeRef[]) => void
  onOpenChoice: (mechanic: ChoiceMechanic, classId: string, className: string) => void
}

export function ClassDetail({ cls, onSelectSkill, onOpenArchetypes, onOpenChoice }: ClassDetailProps) {
  const sortedSkills = [...cls.class_skills].sort((a, b) => a.skills.name_es.localeCompare(b.skills.name_es, 'es'))
  const hasSpells = cls.class_spell_slots.length > 0
  const choiceMechanics = CLASS_CHOICE_MECHANICS[cls.id] ?? []
  const { levels, spellLevels, matrix } = hasSpells
    ? buildSpellSlotMatrix(cls.class_spell_slots)
    : { levels: [] as number[], spellLevels: [] as number[], matrix: new Map<number, Map<number, number>>() }

  return (
    <>
      <div className={demoStyles.drawerMeta}>
        <span className={styles.hitDieBadge}>{cls.hit_die}</span>
        {cls.alignment_restriction && <span className={demoStyles.badge}>{cls.alignment_restriction}</span>}
        {cls.archetypes.length > 0 && (
          <button
            type="button"
            className={demoStyles.archetypesBtn}
            onClick={() => onOpenArchetypes(cls.name_es, cls.archetypes)}
          >
            Arquetipos ({cls.archetypes.length}) <ChevronRight size={14} />
          </button>
        )}
        {choiceMechanics.map((m) => (
          <button
            key={m.key}
            type="button"
            className={demoStyles.archetypesBtn}
            onClick={() => onOpenChoice(m, cls.id, cls.name_es)}
          >
            {m.label} <ChevronRight size={14} />
          </button>
        ))}
      </div>

      {(cls.publishers || cls.sourcebooks) && (
        <p className={demoStyles.sourceLine}>
          Fuente: {cls.publishers?.name}
          {cls.sourcebooks ? ` — ${cls.sourcebooks.title}` : ''}
        </p>
      )}

      <div
        className={demoStyles.classDescription}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(cls.description_es) }}
      />

      {cls.class_features.length > 0 && (
        <div className={styles.cardSection}>
          <p className={styles.sectionTitle}>Características de clase ({cls.class_features.length})</p>
          <div className={styles.featureTable}>
            {cls.class_features.map((f) => (
              <div key={f.id} className={styles.featureRow}>
                <div className={styles.featureBody}>
                  <span className={styles.featureName}>{f.name_es}</span>
                  <div
                    className={`${styles.featureDesc} ${demoStyles.featureDescHtml}`}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(f.description_es) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sortedSkills.length > 0 && (
        <div className={styles.cardSection}>
          <p className={styles.sectionTitle}>Habilidades de clase ({sortedSkills.length})</p>
          <div className={styles.skillPills}>
            {sortedSkills.map(({ skills: s }) => (
              <button
                key={s.id}
                type="button"
                className={`${styles.skillPill} ${demoStyles.skillPillBtn}`}
                onClick={() => onSelectSkill(s.id)}
              >
                {s.name_es}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.cardSection}>
        <p className={styles.sectionTitle}>Progresión</p>
        <div className={styles.tableWrap}>
          <table className={styles.progTable}>
            <thead>
              <tr>
                <th>Nv</th>
                <th>BBA</th>
                <th>Fort.</th>
                <th>Reflejos</th>
                <th>Voluntad</th>
                <th>Especial</th>
              </tr>
            </thead>
            <tbody>
              {cls.class_levels.map((lv) => (
                <tr key={lv.level}>
                  <td className={styles.progLv}>{lv.level}</td>
                  <td>+{lv.bab}</td>
                  <td>+{lv.fort}</td>
                  <td>+{lv.ref}</td>
                  <td>+{lv.will}</td>
                  <td className={demoStyles.specialCell}>{lv.special_es || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {hasSpells && (
        <div className={styles.cardSection}>
          <p className={styles.sectionTitle}>Conjuros por día</p>
          <div className={styles.tableWrap}>
            <table className={styles.spellTable}>
              <thead>
                <tr>
                  <th>Nv</th>
                  {spellLevels.map((sl) => (
                    <th key={sl}>{sl}º</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {levels.map((lv) => (
                  <tr key={lv}>
                    <td className={styles.progLv}>{lv}</td>
                    {spellLevels.map((sl) => (
                      <td key={sl}>{matrix.get(lv)?.get(sl) ?? '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

// Gestiona el par de Drawers de arquetipo: lista (todos los arquetipos de la
// clase abierta) → detalle (archetype_features del arquetipo elegido,
// cargado bajo demanda al hacer clic). Encapsulado aparte de
// useClassesV1Drawer porque tiene su propio loading/error, independiente del
// de la clase.
function useArchetypesV1Drawer() {
  const [listFor, setListFor] = useState<{ className: string; archetypes: ArchetypeRef[] } | null>(null)
  const [selected, setSelected] = useState<ArchetypeRef | null>(null)
  const [features, setFeatures] = useState<ArchetypeFeatureRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openList(className: string, archetypes: ArchetypeRef[]) {
    setListFor({ className, archetypes })
  }

  function closeList() {
    setListFor(null)
    setSelected(null)
  }

  function openArchetype(a: ArchetypeRef) {
    setSelected(a)
    setLoading(true)
    setError(null)
    fetchArchetypeFeatures(a.id)
      .then(setFeatures)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }

  function closeArchetype() {
    setSelected(null)
  }

  const sortedArchetypes = listFor
    ? [...listFor.archetypes].sort((a, b) => a.name_es.localeCompare(b.name_es, 'es'))
    : []

  const drawer = (
    <>
      <Drawer
        open={!!listFor}
        onClose={closeList}
        title={listFor ? `Arquetipos de ${listFor.className}` : ''}
      >
        <div className={styles.navList}>
          {sortedArchetypes.map((a) => (
            <button key={a.id} type="button" className={demoStyles.archetypeListItem} onClick={() => openArchetype(a)}>
              {a.name_es} <ChevronRight size={14} />
            </button>
          ))}
        </div>
      </Drawer>

      <Drawer open={!!selected} onClose={closeArchetype} title={selected?.name_es ?? ''} panelClassName={demoStyles.wideDrawerPanel}>
        <button type="button" className={demoStyles.backBtn} onClick={closeArchetype}>
          <ArrowLeft size={14} /> Volver a arquetipos
        </button>

        {loading && <p className={demoStyles.sourceLine}>Cargando características...</p>}
        {error && <div className={demoStyles.errorText}>Error: {error}</div>}

        {!loading && !error && features.length === 0 && (
          <p className={demoStyles.sourceLine}>Este arquetipo no tiene características registradas.</p>
        )}

        {!loading && !error && features.length > 0 && (
          <div className={styles.featureTable}>
            {features.map((f) => (
              <div key={f.id} className={styles.featureRow}>
                <div className={styles.featureBody}>
                  <span className={styles.featureName}>
                    {f.name_es}
                    {f.level != null ? ` (Nv. ${f.level})` : ''}
                  </span>
                  <div
                    className={`${styles.featureDesc} ${demoStyles.featureDescHtml}`}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(f.description_es) }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </>
  )

  return { drawer, openList }
}

// Gestiona el par de Drawers de opciones de clase (descubrimientos, embrujos,
// estirpes, espíritus, misterios/maldiciones): lista → detalle, con el mismo
// patrón que useArchetypesV1Drawer pero parametrizado por ChoiceMechanic para
// no repetir la lógica de estado/Drawer una vez por mecánica.
function useChoiceDrawer() {
  const [listFor, setListFor] = useState<{ mechanic: ChoiceMechanic; className: string; items: ChoiceListItem[] } | null>(null)
  const [listLoading, setListLoading] = useState(false)
  const [selected, setSelected] = useState<ChoiceListItem | null>(null)
  const [detail, setDetail] = useState<ChoiceDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openList(mechanic: ChoiceMechanic, classId: string, className: string) {
    setError(null)
    setListLoading(true)
    setListFor({ mechanic, className, items: [] })
    mechanic.fetchList(classId)
      .then((items) => setListFor({ mechanic, className, items }))
      .catch((err: Error) => setError(err.message))
      .finally(() => setListLoading(false))
  }

  function closeList() {
    setListFor(null)
    setSelected(null)
  }

  function openItem(item: ChoiceListItem) {
    if (!listFor) return
    setSelected(item)
    setDetail(null)
    setDetailLoading(true)
    setError(null)
    listFor.mechanic.fetchDetail(item.id)
      .then(setDetail)
      .catch((err: Error) => setError(err.message))
      .finally(() => setDetailLoading(false))
  }

  function closeItem() {
    setSelected(null)
  }

  const sortedItems = listFor ? [...listFor.items].sort((a, b) => a.name_es.localeCompare(b.name_es, 'es')) : []

  const drawer = (
    <>
      <Drawer
        open={!!listFor}
        onClose={closeList}
        title={listFor ? `${listFor.mechanic.label} de ${listFor.className}` : ''}
      >
        {listLoading && <p className={demoStyles.sourceLine}>Cargando...</p>}
        <div className={styles.navList}>
          {sortedItems.map((it) => (
            <button key={it.id} type="button" className={demoStyles.archetypeListItem} onClick={() => openItem(it)}>
              {it.name_es} <ChevronRight size={14} />
            </button>
          ))}
        </div>
      </Drawer>

      <Drawer open={!!selected} onClose={closeItem} title={selected?.name_es ?? ''} panelClassName={demoStyles.wideDrawerPanel}>
        <button type="button" className={demoStyles.backBtn} onClick={closeItem}>
          <ArrowLeft size={14} /> Volver a {listFor?.mechanic.label.toLowerCase()}
        </button>

        {detailLoading && <p className={demoStyles.sourceLine}>Cargando...</p>}
        {error && <div className={demoStyles.errorText}>Error: {error}</div>}

        {detail && !detailLoading && (
          <>
            {detail.description_es && (
              <div
                className={demoStyles.classDescription}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(detail.description_es) }}
              />
            )}

            {detail.items.length > 0 && (
              <div className={styles.featureTable}>
                {detail.items.map((it) => (
                  <div key={it.id} className={styles.featureRow}>
                    <div className={styles.featureBody}>
                      <span className={styles.featureName}>
                        {it.name_es}
                        {it.level != null ? ` (Nv. ${it.level})` : ''}
                      </span>
                      <div
                        className={`${styles.featureDesc} ${demoStyles.featureDescHtml}`}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(it.description_es) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Drawer>
    </>
  )

  return { drawer, openList }
}

// Carga v1.classes una vez y gestiona el Drawer de detalle. Los Drawers de
// habilidad (useSkillsV1Drawer), arquetipos (useArchetypesV1Drawer) y
// opciones de clase (useChoiceDrawer) quedan encapsulados dentro del
// `drawer` que devuelve este hook, así la página consumidora solo renderiza
// uno.
export function useClassesV1Drawer() {
  const [classes, setClasses] = useState<ClassV1Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [classId, setClassId] = useState<string | null>(null)
  const skillDrawer = useSkillsV1Drawer()
  const archetypesDrawer = useArchetypesV1Drawer()
  const choiceDrawer = useChoiceDrawer()

  useEffect(() => {
    let cancelled = false

    Promise.all([
      supabase
        .schema('v1')
        .from('classes')
        .select(CLASS_SELECT)
        .order('name_es')
        .order('level', { foreignTable: 'class_levels' })
        .order('id', { foreignTable: 'class_features' }),
      fetchSpellSlotsByClass(),
    ])
      .then(([{ data, error: err }, spellSlotsByClass]) => {
        if (cancelled) return
        if (err) {
          setError(err.message)
          setClasses([])
        } else {
          const rows = (data ?? []) as unknown as ClassV1Row[]
          for (const row of rows) {
            row.class_levels = [...row.class_levels].sort((a, b) => a.level - b.level)
            row.class_spell_slots = (spellSlotsByClass.get(row.id) ?? []).sort(
              (a, b) => a.level - b.level || a.spell_level - b.spell_level
            )
          }
          setClasses(rows)
        }
        setLoading(false)
      })
      .catch((err: Error) => {
        if (cancelled) return
        setError(err.message)
        setClasses([])
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const cls = classes.find((c) => c.id === classId) ?? null

  function open(id: string) {
    setClassId(id)
  }

  function close() {
    setClassId(null)
  }

  const drawer = (
    <>
      <Drawer open={!!cls} onClose={close} title={cls?.name_es ?? ''} panelClassName={demoStyles.wideDrawerPanel}>
        {cls && (
          <ClassDetail
            cls={cls}
            onSelectSkill={skillDrawer.open}
            onOpenArchetypes={archetypesDrawer.openList}
            onOpenChoice={choiceDrawer.openList}
          />
        )}
      </Drawer>
      {archetypesDrawer.drawer}
      {choiceDrawer.drawer}
      {skillDrawer.drawer}
    </>
  )

  return { classes, loading, error, open, close, drawer }
}
