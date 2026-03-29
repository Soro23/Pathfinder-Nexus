import { useEffect, useState } from 'react'
import {
  Sparkles, Star, Zap, Shield, Globe,
  PlusCircle, Trash2, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react'
import { useHomebrewStore } from '../store/homebrewStore'
import type { HomebrewType } from '../store/homebrewStore'
import { SPELL_SCHOOLS } from '../data/spells'
import { FEAT_TYPES, type FeatType } from '../data/feats'
import { Button, Card } from '../components/ui'
import styles from './Homebrew.module.css'

const FEAT_TYPE_LABELS: Record<FeatType, string> = {
  combat: 'Combate',
  general: 'General',
  metamagic: 'Metamagia',
  item_creation: 'Creación',
  teamwork: 'Cooperación',
  critical: 'Crítico',
  style: 'Estilo',
  race: 'Raza',
  story: 'Historia',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`${styles.field} ${full ? styles.fullWidth : ''}`}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  )
}

function Inp(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={styles.input} {...props} />
}

function Sel({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return <select className={styles.input} {...props}>{children}</select>
}

function Txt(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={styles.textarea} rows={3} {...props} />
}

// ── Tab definitions ───────────────────────────────────────────────────────────

const TABS: { id: HomebrewType; label: string; icon: React.ElementType }[] = [
  { id: 'spell',  label: 'Conjuros',     icon: Sparkles },
  { id: 'feat',   label: 'Dotes',        icon: Star },
  { id: 'skill',  label: 'Habilidades',  icon: Zap },
  { id: 'class',  label: 'Clases',       icon: Shield },
  { id: 'race',   label: 'Razas',        icon: Globe },
]

// ── Empty form states ────────────────────────────────────────────────────────

const emptySpell = () => ({
  name: '', school: 'abjuration', level: 1, type: 'arcane' as const,
  castingTime: '1 standard action', range: 'close', duration: '1 round/level',
  description: '', savingThrow: '', spellResistance: '',
})

const emptyFeat = () => ({
  name: '', type: ['general'] as FeatType[], prerequisite: '', benefit: '', normal: '', special: '',
})

const emptySkill = () => ({
  name: '', ability: 'dexterity' as const, isClassSkill: false, hasArmorCheckPenalty: false, description: '',
})

const emptyClass = () => ({
  name: '', hitDie: 8, baseAttackBonus: 'medium' as const,
  fortitudeSave: 'poor' as const, reflexSave: 'poor' as const, willSave: 'good' as const,
  skillPointsPerLevel: 2, description: '',
  magicType: null as null | 'arcane' | 'divine' | 'bardic' | 'alchemist',
  casterAbility: null as null | 'intelligence' | 'wisdom' | 'charisma',
  startingGoldDice: '3d6', classSkills: [] as string[], features: [], alignment: [],
  spellsPerDay: undefined,
})

const emptyRace = () => ({
  label: '', size: 'medium' as const, speed: 30, bonusDesc: '', desc: '',
  bonuses: {}, traits: [] as { name: string; description: string }[], subraces: undefined,
})

// ── Forms ────────────────────────────────────────────────────────────────────

function SpellForm({ onSave, saving }: { onSave: (d: object) => void; saving: boolean }) {
  const [f, setF] = useState(emptySpell)
  const set = (k: string, v: unknown) => setF(p => ({ ...p, [k]: v }))
  return (
    <div className={styles.formGrid}>
      <Field label="Nombre *"><Inp value={f.name} onChange={e => set('name', e.target.value)} /></Field>
      <Field label="Escuela">
        <Sel value={f.school} onChange={e => set('school', e.target.value)}>
          {SPELL_SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
        </Sel>
      </Field>
      <Field label="Nivel (0–9)">
        <Inp type="number" min={0} max={9} value={f.level} onChange={e => set('level', +e.target.value)} />
      </Field>
      <Field label="Tipo">
        <Sel value={f.type} onChange={e => set('type', e.target.value)}>
          <option value="arcane">Arcano</option>
          <option value="divine">Divino</option>
          <option value="both">Ambos</option>
        </Sel>
      </Field>
      <Field label="Tiempo de lanzamiento"><Inp value={f.castingTime} onChange={e => set('castingTime', e.target.value)} /></Field>
      <Field label="Alcance"><Inp value={f.range} onChange={e => set('range', e.target.value)} /></Field>
      <Field label="Duración"><Inp value={f.duration} onChange={e => set('duration', e.target.value)} /></Field>
      <Field label="Tirada de salvación"><Inp value={f.savingThrow} onChange={e => set('savingThrow', e.target.value)} /></Field>
      <Field label="Resistencia a la magia"><Inp value={f.spellResistance} onChange={e => set('spellResistance', e.target.value)} /></Field>
      <Field label="Descripción *" full><Txt value={f.description} onChange={e => set('description', e.target.value)} /></Field>
      <div className={`${styles.formActions} ${styles.fullWidth}`} style={{ gridColumn: '1 / -1' }}>
        <Button variant="primary" onClick={() => onSave(f)} disabled={!f.name.trim() || !f.description.trim() || saving}>
          {saving ? <Loader2 size={14} className={styles.spin} /> : <PlusCircle size={14} />}
          Guardar conjuro
        </Button>
      </div>
    </div>
  )
}

function FeatForm({ onSave, saving }: { onSave: (d: object) => void; saving: boolean }) {
  const [f, setF] = useState(emptyFeat)
  const set = (k: string, v: unknown) => setF(p => ({ ...p, [k]: v }))
  return (
    <div className={styles.formGrid}>
      <Field label="Nombre *"><Inp value={f.name} onChange={e => set('name', e.target.value)} /></Field>
      <Field label="Tipo">
        <Sel value={f.type[0] || ''} onChange={e => set('type', [e.target.value as FeatType])}>
          {FEAT_TYPES.map((t: FeatType) => <option key={t} value={t}>{FEAT_TYPE_LABELS[t]}</option>)}
        </Sel>
      </Field>
      <Field label="Prerrequisito"><Inp value={f.prerequisite} onChange={e => set('prerequisite', e.target.value)} /></Field>
      <div />
      <Field label="Beneficio *" full><Txt value={f.benefit} onChange={e => set('benefit', e.target.value)} /></Field>
      <Field label="Normal" full><Txt rows={2} value={f.normal} onChange={e => set('normal', e.target.value)} /></Field>
      <Field label="Especial" full><Txt rows={2} value={f.special} onChange={e => set('special', e.target.value)} /></Field>
      <div className={`${styles.formActions} ${styles.fullWidth}`} style={{ gridColumn: '1 / -1' }}>
        <Button variant="primary" onClick={() => onSave(f)} disabled={!f.name.trim() || !f.benefit.trim() || saving}>
          {saving ? <Loader2 size={14} className={styles.spin} /> : <PlusCircle size={14} />}
          Guardar dote
        </Button>
      </div>
    </div>
  )
}

function SkillForm({ onSave, saving }: { onSave: (d: object) => void; saving: boolean }) {
  const [f, setF] = useState(emptySkill)
  const set = (k: string, v: unknown) => setF(p => ({ ...p, [k]: v }))
  const ABILITIES = ['strength','dexterity','constitution','intelligence','wisdom','charisma'] as const
  const LABELS: Record<string, string> = { strength:'Fuerza',dexterity:'Destreza',constitution:'Constitución',intelligence:'Inteligencia',wisdom:'Sabiduría',charisma:'Carisma' }
  return (
    <div className={styles.formGrid}>
      <Field label="Nombre *"><Inp value={f.name} onChange={e => set('name', e.target.value)} /></Field>
      <Field label="Característica">
        <Sel value={f.ability} onChange={e => set('ability', e.target.value)}>
          {ABILITIES.map(a => <option key={a} value={a}>{LABELS[a]}</option>)}
        </Sel>
      </Field>
      <div className={styles.checkRow}>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={f.isClassSkill} onChange={e => set('isClassSkill', e.target.checked)} />
          Habilidad de clase
        </label>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={f.hasArmorCheckPenalty} onChange={e => set('hasArmorCheckPenalty', e.target.checked)} />
          Penalización por armadura
        </label>
      </div>
      <Field label="Descripción *" full><Txt value={f.description} onChange={e => set('description', e.target.value)} /></Field>
      <div className={`${styles.formActions} ${styles.fullWidth}`} style={{ gridColumn: '1 / -1' }}>
        <Button variant="primary" onClick={() => onSave(f)} disabled={!f.name.trim() || !f.description.trim() || saving}>
          {saving ? <Loader2 size={14} className={styles.spin} /> : <PlusCircle size={14} />}
          Guardar habilidad
        </Button>
      </div>
    </div>
  )
}

function ClassForm({ onSave, saving }: { onSave: (d: object) => void; saving: boolean }) {
  const [f, setF] = useState(emptyClass)
  const set = (k: string, v: unknown) => setF(p => ({ ...p, [k]: v }))
  return (
    <div className={styles.formGrid}>
      <Field label="Nombre *"><Inp value={f.name} onChange={e => set('name', e.target.value)} /></Field>
      <Field label="Dado de vida">
        <Sel value={f.hitDie} onChange={e => set('hitDie', +e.target.value)}>
          {[4,6,8,10,12].map(d => <option key={d} value={d}>d{d}</option>)}
        </Sel>
      </Field>
      <Field label="BAB">
        <Sel value={f.baseAttackBonus} onChange={e => set('baseAttackBonus', e.target.value)}>
          <option value="good">Bueno (+1/nivel)</option>
          <option value="medium">Medio (+3/4 nivel)</option>
          <option value="poor">Malo (+1/2 nivel)</option>
        </Sel>
      </Field>
      <Field label="Pts. habilidad/nivel">
        <Inp type="number" min={0} value={f.skillPointsPerLevel} onChange={e => set('skillPointsPerLevel', +e.target.value)} />
      </Field>
      <Field label="Salvación de Fortaleza">
        <Sel value={f.fortitudeSave} onChange={e => set('fortitudeSave', e.target.value)}>
          <option value="good">Buena</option><option value="poor">Mala</option>
        </Sel>
      </Field>
      <Field label="Salvación de Reflejos">
        <Sel value={f.reflexSave} onChange={e => set('reflexSave', e.target.value)}>
          <option value="good">Buena</option><option value="poor">Mala</option>
        </Sel>
      </Field>
      <Field label="Salvación de Voluntad">
        <Sel value={f.willSave} onChange={e => set('willSave', e.target.value)}>
          <option value="good">Buena</option><option value="poor">Mala</option>
        </Sel>
      </Field>
      <Field label="Magia">
        <Sel value={f.magicType ?? ''} onChange={e => set('magicType', e.target.value || null)}>
          <option value="">Ninguna</option>
          <option value="arcane">Arcana</option>
          <option value="divine">Divina</option>
          <option value="bardic">Bárdica</option>
          <option value="alchemist">Alquimista</option>
        </Sel>
      </Field>
      {f.magicType && (
        <Field label="Característica de lanzamiento">
          <Sel value={f.casterAbility ?? ''} onChange={e => set('casterAbility', e.target.value || null)}>
            <option value="">—</option>
            <option value="intelligence">Inteligencia</option>
            <option value="wisdom">Sabiduría</option>
            <option value="charisma">Carisma</option>
          </Sel>
        </Field>
      )}
      <Field label="Descripción *" full><Txt value={f.description} onChange={e => set('description', e.target.value)} /></Field>
      <div className={`${styles.formActions} ${styles.fullWidth}`} style={{ gridColumn: '1 / -1' }}>
        <Button variant="primary" onClick={() => onSave(f)} disabled={!f.name.trim() || !f.description.trim() || saving}>
          {saving ? <Loader2 size={14} className={styles.spin} /> : <PlusCircle size={14} />}
          Guardar clase
        </Button>
      </div>
    </div>
  )
}

function RaceForm({ onSave, saving }: { onSave: (d: object) => void; saving: boolean }) {
  const [f, setF] = useState(emptyRace)
  const [traitName, setTraitName] = useState('')
  const [traitDesc, setTraitDesc] = useState('')
  const set = (k: string, v: unknown) => setF(p => ({ ...p, [k]: v }))

  const addTrait = () => {
    if (!traitName.trim()) return
    setF(p => ({ ...p, traits: [...p.traits, { name: traitName.trim(), description: traitDesc.trim() }] }))
    setTraitName(''); setTraitDesc('')
  }
  const removeTrait = (i: number) => setF(p => ({ ...p, traits: p.traits.filter((_, j) => j !== i) }))

  const ABILITY_KEYS = ['strength','dexterity','constitution','intelligence','wisdom','charisma'] as const
  const ABILITY_LABELS: Record<string, string> = { strength:'FUE',dexterity:'DES',constitution:'CON',intelligence:'INT',wisdom:'SAB',charisma:'CAR' }

  return (
    <div className={styles.formGrid}>
      <Field label="Nombre *"><Inp value={f.label} onChange={e => set('label', e.target.value)} /></Field>
      <Field label="Tamaño">
        <Sel value={f.size} onChange={e => set('size', e.target.value)}>
          <option value="medium">Mediano</option>
          <option value="small">Pequeño</option>
        </Sel>
      </Field>
      <Field label="Velocidad (casillas)">
        <Inp type="number" min={0} value={f.speed} onChange={e => set('speed', +e.target.value)} />
      </Field>
      <Field label="Descripción de bonificadores"><Inp value={f.bonusDesc} onChange={e => set('bonusDesc', e.target.value)} /></Field>

      {/* Ability bonuses */}
      <div className={`${styles.abilityRow} ${styles.fullWidth}`}>
        {ABILITY_KEYS.map(ab => (
          <div key={ab} className={styles.abilityCell}>
            <label className={styles.fieldLabel}>{ABILITY_LABELS[ab]}</label>
            <Inp type="number" style={{ width: 60 }}
              value={(f.bonuses as Record<string, number>)[ab] ?? 0}
              onChange={e => set('bonuses', { ...f.bonuses, [ab]: +e.target.value || undefined })}
            />
          </div>
        ))}
      </div>

      <Field label="Descripción de la raza *" full>
        <Txt value={f.desc} onChange={e => set('desc', e.target.value)} />
      </Field>

      {/* Traits */}
      <div className={styles.fullWidth}>
        <label className={styles.fieldLabel}>Rasgos raciales</label>
        {f.traits.map((t, i) => (
          <div key={i} className={styles.traitRow}>
            <span className={styles.traitName}>{t.name}</span>
            <span className={styles.traitDesc}>{t.description}</span>
            <button className={styles.removeBtn} onClick={() => removeTrait(i)}><Trash2 size={12} /></button>
          </div>
        ))}
        <div className={styles.traitAddRow}>
          <Inp placeholder="Nombre del rasgo" value={traitName} onChange={e => setTraitName(e.target.value)} />
          <Inp placeholder="Descripción" value={traitDesc} onChange={e => setTraitDesc(e.target.value)} />
          <Button variant="ghost" onClick={addTrait} disabled={!traitName.trim()}><PlusCircle size={14} /></Button>
        </div>
      </div>

      <div className={`${styles.formActions} ${styles.fullWidth}`} style={{ gridColumn: '1 / -1' }}>
        <Button variant="primary" onClick={() => onSave({ ...f, id: f.label.toLowerCase().replace(/\s+/g,'_') })} disabled={!f.label.trim() || !f.desc.trim() || saving}>
          {saving ? <Loader2 size={14} className={styles.spin} /> : <PlusCircle size={14} />}
          Guardar raza
        </Button>
      </div>
    </div>
  )
}

// ── Item cards ────────────────────────────────────────────────────────────────

function ItemCard({ name, subtitle, onDelete }: { name: string; subtitle: string; onDelete: () => void }) {
  return (
    <div className={styles.item}>
      <div className={styles.itemInfo}>
        <span className={styles.itemName}>{name}</span>
        <span className={styles.itemSub}>{subtitle}</span>
      </div>
      <button className={styles.removeBtn} onClick={onDelete} title="Eliminar"><Trash2 size={14} /></button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function Homebrew() {
  const { fetch, spells, feats, skills, classes, races, add, remove } = useHomebrewStore()
  const [activeTab, setActiveTab] = useState<HomebrewType>('spell')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch() }, [fetch])

  const handleSave = async (data: object) => {
    setSaving(true)
    await add(activeTab, data)
    setSaving(false)
    setShowForm(false)
  }

  const tabs = {
    spell:  { items: spells,  count: spells.length },
    feat:   { items: feats,   count: feats.length },
    skill:  { items: skills,  count: skills.length },
    class:  { items: classes, count: classes.length },
    race:   { items: races,   count: races.length },
  }

  const itemSubtitle = (type: HomebrewType, item: Record<string, unknown>) => {
    if (type === 'spell') return `Nv.${item.level} · ${item.school} · ${item.type}`
    if (type === 'feat')  return `${item.type}${item.prerequisite ? ` · Req: ${item.prerequisite}` : ''}`
    if (type === 'skill') return `${item.ability}${item.isClassSkill ? ' · habilidad de clase' : ''}`
    if (type === 'class') return `d${item.hitDie} · BAB ${item.baseAttackBonus}`
    if (type === 'race')  return `${item.size} · vel. ${item.speed}`
    return ''
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Homebrew</h1>
          <p className={styles.subtitle}>Crea conjuros, dotes, habilidades, clases y razas personalizadas</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(v => !v)}>
          <PlusCircle size={16} />
          {showForm ? 'Cancelar' : 'Nuevo'}
        </Button>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab(id); setShowForm(false) }}
          >
            <Icon size={15} />
            {label}
            {tabs[id].count > 0 && <span className={styles.badge}>{tabs[id].count}</span>}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <Card padding="md">
          <div className={styles.formHeader}>
            <button className={styles.collapseBtn} onClick={() => setShowForm(false)}>
              <ChevronUp size={16} /> Ocultar formulario
            </button>
          </div>
          {activeTab === 'spell' && <SpellForm onSave={handleSave} saving={saving} />}
          {activeTab === 'feat'  && <FeatForm  onSave={handleSave} saving={saving} />}
          {activeTab === 'skill' && <SkillForm onSave={handleSave} saving={saving} />}
          {activeTab === 'class' && <ClassForm onSave={handleSave} saving={saving} />}
          {activeTab === 'race'  && <RaceForm  onSave={handleSave} saving={saving} />}
        </Card>
      )}

      {/* Items list */}
      <Card padding="md">
        {!showForm && (
          <button className={styles.addRowBtn} onClick={() => setShowForm(true)}>
            <ChevronDown size={14} /> Añadir nuevo homebrew
          </button>
        )}
        {tabs[activeTab].items.length === 0 ? (
          <p className={styles.empty}>No hay contenido homebrew en esta categoría.</p>
        ) : (
          <div className={styles.list}>
            {(tabs[activeTab].items as unknown as Record<string, unknown>[]).map(item => (
              <ItemCard
                key={item.id as string}
                name={(item.name || item.label) as string}
                subtitle={itemSubtitle(activeTab, item)}
                onDelete={() => remove(item.id as string, activeTab)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
