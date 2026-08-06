import { renderMarkdown } from '../../lib/markdown'
import styles from './MarkdownSplitEditor.module.css'

interface MarkdownSplitEditorProps {
  value: string
  onChange: (value: string) => void
}

export function MarkdownSplitEditor({ value, onChange }: MarkdownSplitEditorProps) {
  return (
    <div className={styles.splitPane}>
      <textarea
        className={styles.splitTextarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck
        autoFocus
      />
      <div className={styles.splitPreview} dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
    </div>
  )
}
