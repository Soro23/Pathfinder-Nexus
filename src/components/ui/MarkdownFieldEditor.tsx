import { useState } from 'react'
import { Pencil, Save, AlertTriangle, CheckCircle } from 'lucide-react'
import { Drawer } from './Drawer'
import { MarkdownSplitEditor } from './MarkdownSplitEditor'
import styles from './MarkdownFieldEditor.module.css'

interface MarkdownFieldEditorProps {
  label: string
  value: string
  onSave: (newValue: string) => Promise<void>
  onSaved?: (newValue: string) => void
}

// Editor de un único campo Markdown del schema v1: muestra un fragmento del
// valor actual con un botón "Editar" que abre un Drawer a pantalla completa
// (textarea + vista previa lado a lado). Parametrizado por value/onSave para
// no repetir este componente una vez por cada tabla/columna de v1 — quien lo
// usa decide dónde persiste el valor (ver src/lib/adminV1.ts).
export function MarkdownFieldEditor({ label, value, onSave, onSaved }: MarkdownFieldEditorProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function openEditor() {
    setDraft(value)
    setSaved(false)
    setError('')
    setOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await onSave(draft)
      setSaved(true)
      onSaved?.(draft)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.fieldPreviewRow}>
      <div className={styles.fieldPreviewHeader}>
        <span className={styles.fieldPreviewLabel}>{label}</span>
        <button type="button" className={styles.editBtn} onClick={openEditor}>
          <Pencil size={14} /> Editar
        </button>
      </div>
      <p className={styles.fieldPreviewText}>
        {value ? (value.length > 160 ? `${value.slice(0, 160)}…` : value) : '(vacío)'}
      </p>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        panelClassName={styles.fullscreenPanel}
        footer={
          <div className={styles.footerRow}>
            {error && (
              <span className={styles.errorAlert}>
                <AlertTriangle size={16} /> {error}
              </span>
            )}
            {saved && !error && (
              <span className={styles.successBanner}>
                <CheckCircle size={16} /> Guardado.
              </span>
            )}
            <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? <span className={styles.spinner} /> : <><Save size={16} /> Guardar</>}
            </button>
          </div>
        }
      >
        <MarkdownSplitEditor value={draft} onChange={(v) => { setDraft(v); setSaved(false) }} />
      </Drawer>
    </div>
  )
}
