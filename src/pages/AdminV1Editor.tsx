import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ChevronRight, Search, AlertTriangle, CheckCircle, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { updateV1Field, updateClassLevel, setClassSkill } from '../lib/adminV1'
import { MarkdownFieldEditor } from '../components/ui/MarkdownFieldEditor'
import {
  CLASS_SELECT,
  CLASS_CHOICE_MECHANICS,
  fetchArchetypeFeatures,
  type ClassV1Row,
  type ArchetypeRef,
  type ArchetypeFeatureRow,
  type ChoiceMechanic,
  type ChoiceListItem,
  type ChoiceDetail,
  type ClassLevelRow,
  type ClassSkillRef,
} from './ClassesV1Detail'
import { SKILL_SELECT, type SkillV1Row } from './SkillsV1Detail'
import adminStyles from './Admin.module.css'
import styles from './AdminV1Editor.module.css'

// ── Edición de contenido Markdown del schema v1 ──────────────────────────────
// Los tres editores de abajo se montan directamente como entradas del menú
// lateral de Admin.tsx (grupo "Contenido v1"). Reutilizan el guardado
// genérico (updateV1Field) y el editor de un solo campo (MarkdownFieldEditor,
// con su Drawer a pantalla completa) en cada punto donde v1 tiene un campo
// `_es` en Markdown: dotes, habilidades y subtipos, y clases con sus
// características, arquetipos y mecánicas de elección (ver
// CLASS_CHOICE_MECHANICS en ClassesV1Detail.tsx).

// ── Dotes v1 ──────────────────────────────────────────────────────────────

interface FeatV1AdminRow {
  id: string
  name_es: string
  prerequisites_es: string | null
  benefit_es: string
  normal_es: string | null
  special_es: string | null
}

const FEAT_ADMIN_SELECT = 'id, name_es, prerequisites_es, benefit_es, normal_es, special_es'

export function V1FeatsEditor() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<FeatV1AdminRow[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<FeatV1AdminRow | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setLoading(true)
      const query = supabase.schema('v1').from('feats').select(FEAT_ADMIN_SELECT).order('name_es').limit(30)
      const request = search.trim() ? query.ilike('name_es', `%${search.trim()}%`) : query
      request.then(({ data }) => {
        setResults((data ?? []) as FeatV1AdminRow[])
        setLoading(false)
      })
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  function setField<K extends keyof FeatV1AdminRow>(key: K, value: FeatV1AdminRow[K]) {
    setSelected((f) => f && ({ ...f, [key]: value }))
  }

  if (selected) {
    return (
      <div className={`${adminStyles.editorCard} ${styles.detailPane}`}>
        <div className={adminStyles.editFormHeader}>
          <button className={adminStyles.backBtn} onClick={() => setSelected(null)}><ArrowLeft size={16} /> Volver</button>
          <h2 className={adminStyles.editFormTitle}>{selected.name_es}</h2>
        </div>
        <MarkdownFieldEditor
          label="Prerrequisito"
          value={selected.prerequisites_es ?? ''}
          onSave={(v) => updateV1Field('feats', selected.id, 'prerequisites_es', v)}
          onSaved={(v) => setField('prerequisites_es', v)}
        />
        <MarkdownFieldEditor
          label="Beneficio"
          value={selected.benefit_es}
          onSave={(v) => updateV1Field('feats', selected.id, 'benefit_es', v)}
          onSaved={(v) => setField('benefit_es', v)}
        />
        <MarkdownFieldEditor
          label="Normal"
          value={selected.normal_es ?? ''}
          onSave={(v) => updateV1Field('feats', selected.id, 'normal_es', v)}
          onSaved={(v) => setField('normal_es', v)}
        />
        <MarkdownFieldEditor
          label="Especial"
          value={selected.special_es ?? ''}
          onSave={(v) => updateV1Field('feats', selected.id, 'special_es', v)}
          onSaved={(v) => setField('special_es', v)}
        />
      </div>
    )
  }

  return (
    <div className={`${adminStyles.editorCard} ${styles.listPane}`}>
      <div className={adminStyles.editorSearchRow}>
        <Search size={16} className={adminStyles.editorSearchIcon} />
        <input
          className={adminStyles.editorSearchInput}
          placeholder="Buscar dote…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {loading && <span className={adminStyles.spinner} />}
      </div>
      <ul className={adminStyles.searchResults}>
        {results.map((feat) => (
          <li key={feat.id} className={adminStyles.searchResultItem} onClick={() => setSelected(feat)}>
            <span className={adminStyles.searchResultName}>{feat.name_es}</span>
          </li>
        ))}
      </ul>
      {!search && !loading && <p className={adminStyles.noResults}>Mostrando primeras 30 — busca para filtrar</p>}
    </div>
  )
}

// ── Habilidades v1 ────────────────────────────────────────────────────────

export function V1SkillsEditor() {
  const [skills, setSkills] = useState<SkillV1Row[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    supabase.schema('v1').from('skills').select(SKILL_SELECT).order('name_es').then(({ data }) => {
      setSkills((data ?? []) as unknown as SkillV1Row[])
      setLoading(false)
    })
  }, [])

  function updateSkill(id: string, patch: Partial<SkillV1Row>) {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function updateSubtype(skillId: string, subtypeId: string, description_es: string) {
    setSkills((prev) => prev.map((s) => (
      s.id === skillId
        ? { ...s, skill_subtypes: s.skill_subtypes.map((st) => (st.id === subtypeId ? { ...st, description_es } : st)) }
        : s
    )))
  }

  const selected = skills.find((s) => s.id === selectedId) ?? null

  if (selected) {
    return (
      <div className={`${adminStyles.editorCard} ${styles.detailPane}`}>
        <div className={adminStyles.editFormHeader}>
          <button className={adminStyles.backBtn} onClick={() => setSelectedId(null)}><ArrowLeft size={16} /> Volver</button>
          <h2 className={adminStyles.editFormTitle}>{selected.name_es}</h2>
        </div>
        <MarkdownFieldEditor
          label="Descripción"
          value={selected.description_es}
          onSave={(v) => updateV1Field('skills', selected.id, 'description_es', v)}
          onSaved={(v) => updateSkill(selected.id, { description_es: v })}
        />
        {selected.skill_subtypes.length > 0 && (
          <div className={styles.sectionBlock}>
            <p className={styles.sectionTitle}>Subtipos ({selected.skill_subtypes.length})</p>
            {selected.skill_subtypes.map((st) => (
              <MarkdownFieldEditor
                key={st.id}
                label={st.name_es}
                value={st.description_es}
                onSave={(v) => updateV1Field('skill_subtypes', st.id, 'description_es', v)}
                onSaved={(v) => updateSubtype(selected.id, st.id, v)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`${adminStyles.editorCard} ${styles.listPane}`}>
      {loading && <p className={adminStyles.noResults}>Cargando…</p>}
      <ul className={adminStyles.searchResults}>
        {skills.map((skill) => (
          <li key={skill.id} className={adminStyles.searchResultItem} onClick={() => setSelectedId(skill.id)}>
            <span className={adminStyles.searchResultName}>{skill.name_es}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Clases v1 — tabla de progresión (BBA/salvaciones/especial por nivel) ────

interface ClassLevelsTableProps {
  classId: string
  levels: ClassLevelRow[]
  onSaved: (levels: ClassLevelRow[]) => void
}

function ClassLevelsTable({ classId, levels, onSaved }: ClassLevelsTableProps) {
  const [rows, setRows] = useState(levels)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { setRows(levels) }, [levels])

  function setCell(level: number, key: 'bab' | 'fort' | 'ref' | 'will', raw: string) {
    const value = Number(raw)
    setRows((prev) => prev.map((r) => (r.level === level ? { ...r, [key]: Number.isNaN(value) ? 0 : value } : r)))
    setSaved(false)
  }

  function setSpecial(level: number, value: string) {
    setRows((prev) => prev.map((r) => (r.level === level ? { ...r, special_es: value } : r)))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const changed = rows.filter((r) => {
        const original = levels.find((o) => o.level === r.level)
        return original && (
          original.bab !== r.bab || original.fort !== r.fort || original.ref !== r.ref ||
          original.will !== r.will || original.special_es !== r.special_es
        )
      })
      for (const r of changed) {
        await updateClassLevel(classId, r.level, { bab: r.bab, fort: r.fort, ref: r.ref, will: r.will, special_es: r.special_es || null })
      }
      onSaved(rows)
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.sectionBlock}>
      <p className={styles.sectionTitle}>Progresión</p>
      <div className={styles.tableScroll}>
        <table className={styles.levelsTable}>
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
            {rows.map((r) => (
              <tr key={r.level}>
                <td className={styles.levelCell}>{r.level}</td>
                <td><input type="number" value={r.bab} onChange={(e) => setCell(r.level, 'bab', e.target.value)} /></td>
                <td><input type="number" value={r.fort} onChange={(e) => setCell(r.level, 'fort', e.target.value)} /></td>
                <td><input type="number" value={r.ref} onChange={(e) => setCell(r.level, 'ref', e.target.value)} /></td>
                <td><input type="number" value={r.will} onChange={(e) => setCell(r.level, 'will', e.target.value)} /></td>
                <td>
                  <input
                    type="text"
                    className={styles.specialInput}
                    value={r.special_es ?? ''}
                    onChange={(e) => setSpecial(r.level, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <div className={adminStyles.errorAlert}><AlertTriangle size={16} /><span>{error}</span></div>}
      {saved && !error && <div className={adminStyles.successBanner}><CheckCircle size={16} />Progresión guardada.</div>}
      <div className={adminStyles.saveRow}>
        <button className={adminStyles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? <span className={adminStyles.spinner} /> : <><Save size={16} /> Guardar progresión</>}
        </button>
      </div>
    </div>
  )
}

// ── Clases v1 — habilidades de clase (checklist sobre v1.class_skills) ──────

interface ClassSkillsChecklistProps {
  classId: string
  allSkills: { id: string; name_es: string }[]
  current: ClassSkillRef[]
  onSaved: (skills: ClassSkillRef[]) => void
}

function ClassSkillsChecklist({ classId, allSkills, current, onSaved }: ClassSkillsChecklistProps) {
  const [selectedIds, setSelectedIds] = useState(() => new Set(current.map((cs) => cs.skills.id)))
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { setSelectedIds(new Set(current.map((cs) => cs.skills.id))) }, [current])

  async function toggle(skill: { id: string; name_es: string }) {
    const wasSelected = selectedIds.has(skill.id)
    setPendingId(skill.id)
    setError('')
    try {
      await setClassSkill(classId, skill.id, !wasSelected)
      const next = new Set(selectedIds)
      if (wasSelected) next.delete(skill.id)
      else next.add(skill.id)
      setSelectedIds(next)
      onSaved(allSkills.filter((s) => next.has(s.id)).map((s) => ({ skills: s })))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setPendingId(null)
    }
  }

  const sortedSkills = [...allSkills].sort((a, b) => a.name_es.localeCompare(b.name_es, 'es'))

  return (
    <div className={styles.sectionBlock}>
      <p className={styles.sectionTitle}>Habilidades de clase ({selectedIds.size})</p>
      {error && <div className={adminStyles.errorAlert}><AlertTriangle size={16} /><span>{error}</span></div>}
      <div className={styles.skillCheckGrid}>
        {sortedSkills.map((skill) => (
          <label key={skill.id} className={styles.skillCheckItem}>
            <input
              type="checkbox"
              checked={selectedIds.has(skill.id)}
              disabled={pendingId === skill.id}
              onChange={() => toggle(skill)}
            />
            {skill.name_es}
          </label>
        ))}
      </div>
    </div>
  )
}

// ── Clases v1 (descripción, progresión, habilidades, características, arquetipos, mecánicas) ──

export function V1ClassesEditor() {
  const [classes, setClasses] = useState<ClassV1Row[]>([])
  const [allSkills, setAllSkills] = useState<{ id: string; name_es: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [archetypeView, setArchetypeView] = useState<{ archetype: ArchetypeRef; features: ArchetypeFeatureRow[] } | null>(null)
  const [archetypeLoading, setArchetypeLoading] = useState(false)
  const [mechanicView, setMechanicView] = useState<{ mechanic: ChoiceMechanic; items: ChoiceListItem[] } | null>(null)
  const [mechanicLoading, setMechanicLoading] = useState(false)
  const [mechanicDetail, setMechanicDetail] = useState<{ item: ChoiceListItem; detail: ChoiceDetail } | null>(null)
  const [mechanicDetailLoading, setMechanicDetailLoading] = useState(false)

  useEffect(() => {
    supabase.schema('v1').from('classes').select(CLASS_SELECT).order('name_es').then(({ data }) => {
      setClasses((data ?? []) as unknown as ClassV1Row[])
      setLoading(false)
    })
    supabase.schema('v1').from('skills').select('id, name_es').order('name_es').then(({ data }) => {
      setAllSkills((data ?? []) as { id: string; name_es: string }[])
    })
  }, [])

  // Agrupa por class_groups (núcleo, base, híbrida, alternativa, desencadenada)
  // en vez de listar las 39 clases en plano — mismo criterio que /classes-v1
  // (ver ClassesV1Example.tsx), mucho más fácil de escanear para encontrar una clase.
  const groupedClasses = useMemo(() => {
    const map = new Map<string, { id: string; name_es: string; classes: ClassV1Row[] }>()
    for (const c of classes) {
      if (!c.class_groups) continue
      const key = c.class_groups.id
      if (!map.has(key)) map.set(key, { id: key, name_es: c.class_groups.name_es, classes: [] })
      map.get(key)!.classes.push(c)
    }
    return [...map.values()].sort((a, b) => a.name_es.localeCompare(b.name_es, 'es'))
  }, [classes])

  function updateClass(id: string, patch: Partial<ClassV1Row>) {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  function updateFeature(classId: string, featureId: number, description_es: string) {
    setClasses((prev) => prev.map((c) => (
      c.id === classId
        ? { ...c, class_features: c.class_features.map((f) => (f.id === featureId ? { ...f, description_es } : f)) }
        : c
    )))
  }

  function updateLevels(classId: string, class_levels: ClassLevelRow[]) {
    setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, class_levels } : c)))
  }

  function updateClassSkills(classId: string, class_skills: ClassSkillRef[]) {
    setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, class_skills } : c)))
  }

  function selectClass(id: string) {
    setSelectedId(id)
    setArchetypeView(null)
    setMechanicView(null)
    setMechanicDetail(null)
  }

  function openArchetype(archetype: ArchetypeRef) {
    setArchetypeLoading(true)
    setArchetypeView({ archetype, features: [] })
    fetchArchetypeFeatures(archetype.id).then((features) => {
      setArchetypeView({ archetype, features })
      setArchetypeLoading(false)
    })
  }

  function updateArchetypeFeature(featureId: number, description_es: string) {
    setArchetypeView((prev) => prev && ({
      ...prev,
      features: prev.features.map((f) => (f.id === featureId ? { ...f, description_es } : f)),
    }))
  }

  function openMechanic(mechanic: ChoiceMechanic, classId: string) {
    setMechanicLoading(true)
    setMechanicView({ mechanic, items: [] })
    mechanic.fetchList(classId).then((items) => {
      setMechanicView({ mechanic, items })
      setMechanicLoading(false)
    })
  }

  function openMechanicItem(item: ChoiceListItem) {
    if (!mechanicView) return
    setMechanicDetailLoading(true)
    mechanicView.mechanic.fetchDetail(item.id).then((detail) => {
      setMechanicDetail({ item, detail })
      setMechanicDetailLoading(false)
    })
  }

  function updateMechanicItemDescription(description_es: string) {
    setMechanicDetail((prev) => prev && ({ ...prev, detail: { ...prev.detail, description_es } }))
  }

  function updateMechanicSubItem(subItemId: number, description_es: string) {
    setMechanicDetail((prev) => prev && ({
      ...prev,
      detail: { ...prev.detail, items: prev.detail.items.map((it) => (it.id === subItemId ? { ...it, description_es } : it)) },
    }))
  }

  const selected = classes.find((c) => c.id === selectedId) ?? null

  if (selected && mechanicView && mechanicDetail) {
    const mechanic = mechanicView.mechanic
    const { item, detail } = mechanicDetail
    return (
      <div className={`${adminStyles.editorCard} ${styles.detailPane}`}>
        <div className={adminStyles.editFormHeader}>
          <button className={adminStyles.backBtn} onClick={() => setMechanicDetail(null)}><ArrowLeft size={16} /> Volver a {mechanic.label.toLowerCase()}</button>
          <h2 className={adminStyles.editFormTitle}>{item.name_es}</h2>
        </div>
        {mechanicDetailLoading && <p className={adminStyles.noResults}>Cargando…</p>}
        {!mechanicDetailLoading && detail.description_es !== null && (
          <MarkdownFieldEditor
            label="Descripción"
            value={detail.description_es}
            onSave={(v) => updateV1Field(mechanic.table, item.id, 'description_es', v)}
            onSaved={updateMechanicItemDescription}
          />
        )}
        {!mechanicDetailLoading && detail.items.length > 0 && (
          <div className={styles.sectionBlock}>
            <p className={styles.sectionTitle}>{mechanic.label} — opciones ({detail.items.length})</p>
            {detail.items.map((sub) => (
              <MarkdownFieldEditor
                key={sub.id}
                label={sub.level != null ? `${sub.name_es} (Nv. ${sub.level})` : sub.name_es}
                value={sub.description_es}
                onSave={(v) => updateV1Field(mechanic.childTable!, sub.id, 'description_es', v)}
                onSaved={(v) => updateMechanicSubItem(sub.id, v)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (selected && mechanicView) {
    return (
      <div className={`${adminStyles.editorCard} ${styles.detailPane}`}>
        <div className={adminStyles.editFormHeader}>
          <button className={adminStyles.backBtn} onClick={() => setMechanicView(null)}><ArrowLeft size={16} /> Volver a {selected.name_es}</button>
          <h2 className={adminStyles.editFormTitle}>{mechanicView.mechanic.label}</h2>
        </div>
        {mechanicLoading && <p className={adminStyles.noResults}>Cargando…</p>}
        <ul className={adminStyles.searchResults}>
          {mechanicView.items.map((item) => (
            <li key={item.id} className={adminStyles.searchResultItem} onClick={() => openMechanicItem(item)}>
              <span className={adminStyles.searchResultName}>{item.name_es}</span>
              <ChevronRight size={14} />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (selected && archetypeView) {
    return (
      <div className={`${adminStyles.editorCard} ${styles.detailPane}`}>
        <div className={adminStyles.editFormHeader}>
          <button className={adminStyles.backBtn} onClick={() => setArchetypeView(null)}><ArrowLeft size={16} /> Volver a {selected.name_es}</button>
          <h2 className={adminStyles.editFormTitle}>{archetypeView.archetype.name_es}</h2>
        </div>
        {archetypeLoading && <p className={adminStyles.noResults}>Cargando…</p>}
        {!archetypeLoading && archetypeView.features.length === 0 && (
          <p className={adminStyles.noResults}>Este arquetipo no tiene características registradas.</p>
        )}
        {archetypeView.features.map((f) => (
          <MarkdownFieldEditor
            key={f.id}
            label={f.level != null ? `${f.name_es} (Nv. ${f.level})` : f.name_es}
            value={f.description_es}
            onSave={(v) => updateV1Field('archetype_features', f.id, 'description_es', v)}
            onSaved={(v) => updateArchetypeFeature(f.id, v)}
          />
        ))}
      </div>
    )
  }

  if (selected) {
    const choiceMechanics = CLASS_CHOICE_MECHANICS[selected.id] ?? []
    return (
      <div className={`${adminStyles.editorCard} ${styles.detailPane}`}>
        <div className={adminStyles.editFormHeader}>
          <button className={adminStyles.backBtn} onClick={() => setSelectedId(null)}><ArrowLeft size={16} /> Volver</button>
          <h2 className={adminStyles.editFormTitle}>{selected.name_es}</h2>
        </div>

        <MarkdownFieldEditor
          label="Descripción"
          value={selected.description_es}
          onSave={(v) => updateV1Field('classes', selected.id, 'description_es', v)}
          onSaved={(v) => updateClass(selected.id, { description_es: v })}
        />

        {selected.class_levels.length > 0 && (
          <ClassLevelsTable
            classId={selected.id}
            levels={selected.class_levels}
            onSaved={(levels) => updateLevels(selected.id, levels)}
          />
        )}

        {allSkills.length > 0 && (
          <ClassSkillsChecklist
            classId={selected.id}
            allSkills={allSkills}
            current={selected.class_skills}
            onSaved={(class_skills) => updateClassSkills(selected.id, class_skills)}
          />
        )}

        {selected.class_features.length > 0 && (
          <div className={styles.sectionBlock}>
            <p className={styles.sectionTitle}>Características de clase ({selected.class_features.length})</p>
            {selected.class_features.map((f) => (
              <MarkdownFieldEditor
                key={f.id}
                label={f.name_es}
                value={f.description_es}
                onSave={(v) => updateV1Field('class_features', f.id, 'description_es', v)}
                onSaved={(v) => updateFeature(selected.id, f.id, v)}
              />
            ))}
          </div>
        )}

        {selected.archetypes.length > 0 && (
          <div className={styles.sectionBlock}>
            <p className={styles.sectionTitle}>Arquetipos ({selected.archetypes.length})</p>
            <ul className={adminStyles.searchResults}>
              {[...selected.archetypes].sort((a, b) => a.name_es.localeCompare(b.name_es, 'es')).map((a) => (
                <li key={a.id} className={adminStyles.searchResultItem} onClick={() => openArchetype(a)}>
                  <span className={adminStyles.searchResultName}>{a.name_es}</span>
                  <ChevronRight size={14} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {choiceMechanics.length > 0 && (
          <div className={styles.sectionBlock}>
            <p className={styles.sectionTitle}>Mecánicas de elección</p>
            <ul className={adminStyles.searchResults}>
              {choiceMechanics.map((m) => (
                <li key={m.key} className={adminStyles.searchResultItem} onClick={() => openMechanic(m, selected.id)}>
                  <span className={adminStyles.searchResultName}>{m.label}</span>
                  <ChevronRight size={14} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`${adminStyles.editorCard} ${styles.listPane}`}>
      {loading && <p className={adminStyles.noResults}>Cargando…</p>}
      {groupedClasses.map((group) => (
        <div key={group.id} className={styles.sectionBlock}>
          <p className={styles.sectionTitle}>{group.name_es}</p>
          <ul className={adminStyles.searchResults}>
            {group.classes.map((cls) => (
              <li key={cls.id} className={adminStyles.searchResultItem} onClick={() => selectClass(cls.id)}>
                <span className={adminStyles.searchResultName}>{cls.name_es}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
