import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronRight, Search, Star, BookOpen, Shield } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { updateV1Field } from '../lib/adminV1'
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
} from './ClassesV1Detail'
import { SKILL_SELECT, type SkillV1Row } from './SkillsV1Detail'
import adminStyles from './Admin.module.css'
import styles from './AdminV1Editor.module.css'

// ── Edición de contenido Markdown del schema v1 ──────────────────────────────
// Sub-panel de Admin (montado por Admin.tsx cuando activeTab === 'v1').
// Reutiliza el guardado genérico (updateV1Field) y el editor de un solo
// campo (MarkdownFieldEditor, con su Drawer a pantalla completa) en cada
// punto donde v1 tiene un campo `_es` en Markdown: dotes, habilidades y
// subtipos, y clases con sus características, arquetipos y mecánicas de
// elección (ver CLASS_CHOICE_MECHANICS en ClassesV1Detail.tsx).

type V1TabId = 'feats' | 'skills' | 'classes'

export function V1ContentEditor() {
  const [tab, setTab] = useState<V1TabId>('feats')

  return (
    <div className={adminStyles.editorCard}>
      <nav className={styles.subNav}>
        <button className={`${styles.subNavBtn} ${tab === 'feats' ? styles.subNavBtnActive : ''}`} onClick={() => setTab('feats')}>
          <Star size={16} /> Dotes v1
        </button>
        <button className={`${styles.subNavBtn} ${tab === 'skills' ? styles.subNavBtnActive : ''}`} onClick={() => setTab('skills')}>
          <BookOpen size={16} /> Habilidades v1
        </button>
        <button className={`${styles.subNavBtn} ${tab === 'classes' ? styles.subNavBtnActive : ''}`} onClick={() => setTab('classes')}>
          <Shield size={16} /> Clases v1
        </button>
      </nav>

      {tab === 'feats' && <V1FeatsEditor />}
      {tab === 'skills' && <V1SkillsEditor />}
      {tab === 'classes' && <V1ClassesEditor />}
    </div>
  )
}

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

function V1FeatsEditor() {
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
      <div className={styles.detailPane}>
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
    <div className={styles.listPane}>
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

function V1SkillsEditor() {
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
      <div className={styles.detailPane}>
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
    <div className={styles.listPane}>
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

// ── Clases v1 (descripción, características, arquetipos, mecánicas de elección) ──

function V1ClassesEditor() {
  const [classes, setClasses] = useState<ClassV1Row[]>([])
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
  }, [])

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
      <div className={styles.detailPane}>
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
      <div className={styles.detailPane}>
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
      <div className={styles.detailPane}>
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
      <div className={styles.detailPane}>
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
    <div className={styles.listPane}>
      {loading && <p className={adminStyles.noResults}>Cargando…</p>}
      <ul className={adminStyles.searchResults}>
        {classes.map((cls) => (
          <li key={cls.id} className={adminStyles.searchResultItem} onClick={() => selectClass(cls.id)}>
            <span className={adminStyles.searchResultName}>{cls.name_es}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
