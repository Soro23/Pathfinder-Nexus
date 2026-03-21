import { useState, useRef, useEffect } from 'react'
import styles from './SearchSelect.module.css'

export interface SearchSelectOption {
  value: string
  label: string
}

interface Props {
  label?: string
  value: string
  onChange: (label: string) => void
  options: SearchSelectOption[]
  placeholder?: string
}

export function SearchSelect({ label, value, onChange, options, placeholder = 'Buscar...' }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  const handleSelect = (opt: SearchSelectOption) => {
    onChange(opt.label)
    setQuery('')
    setOpen(false)
  }

  const handleClear = () => {
    onChange('')
    setQuery('')
  }

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={open ? query : value}
          placeholder={value ? value : placeholder}
          onFocus={() => { setOpen(true); setQuery('') }}
          onChange={(e) => setQuery(e.target.value)}
        />
        {value && !open && (
          <button className={styles.clearBtn} onMouseDown={(e) => { e.preventDefault(); handleClear() }} tabIndex={-1}>×</button>
        )}
      </div>
      {open && (
        <div className={styles.dropdown}>
          {filtered.length === 0 ? (
            <div className={styles.noResults}>Sin resultados</div>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.option} ${opt.label === value ? styles.optionSelected : ''}`}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(opt) }}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
