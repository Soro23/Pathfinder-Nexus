import { useState } from 'react'
import { Search, BookOpenText, ArrowLeft } from 'lucide-react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useSrdSearch, fetchSrdPage, type SrdPage } from '../hooks/useSrdSearch'
import { repairMisplacedBold, cleanupUnparsedTableArtifacts } from '../lib/markdown'

// El snippet que devuelve el RPC de búsqueda es un fragmento del Markdown original
// (con `**negrita**` de origen) más el resaltado de coincidencias que añade Postgres
// con `<b>`. Sin pasar por `marked`, el `**` de origen se mostraba literal — solo se
// sanitizaban las etiquetas `<b>` del resaltado, nunca se interpretaba el Markdown.
function renderSnippet(snippet: string): string {
  const html = marked.parse(repairMisplacedBold(snippet), { async: false, breaks: true }) as string
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: ['b', 'strong', 'em', 'p'] })
}
import styles from './SrdSearch.module.css'

export function SrdSearch() {
  const [query, setQuery] = useState('')
  const { results, loading, error } = useSrdSearch(query)

  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [page, setPage] = useState<SrdPage | null>(null)
  const [pageLoading, setPageLoading] = useState(false)

  const openPage = (path: string) => {
    setSelectedPath(path)
    setPage(null)
    setPageLoading(true)
    fetchSrdPage(path).then((p) => {
      setPage(p ?? null)
      setPageLoading(false)
    })
  }

  const backToResults = () => {
    setSelectedPath(null)
    setPage(null)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <BookOpenText size={28} className={styles.headerIcon} />
        <div>
          <h1>Buscador de reglas</h1>
          <p className={styles.subtitle}>Busca en el SRD completo de Pathfinder</p>
        </div>
      </header>

      {selectedPath ? (
        <>
          <button className={styles.backBtn} onClick={backToResults}>
            <ArrowLeft size={16} /> Volver a resultados
          </button>

          {pageLoading ? (
            <div className={styles.loaderContainer}>
              <div className={styles.loader} />
              <p>Cargando página...</p>
            </div>
          ) : page ? (
            <>
              <h2 className={styles.pageTitle}>{page.title}</h2>
              <div
                className={styles.pageContent}
                dangerouslySetInnerHTML={{
                  __html: cleanupUnparsedTableArtifacts(
                    DOMPurify.sanitize(
                      marked.parse(repairMisplacedBold(page.content), { async: false, breaks: true }) as string
                    )
                  ),
                }}
              />
            </>
          ) : (
            <p className={styles.hint}>No se pudo cargar la página.</p>
          )}
        </>
      ) : (
        <>
          <div className={styles.searchBar}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Ej: ataque de oportunidad, hechizar persona, garra..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
            />
            {query && (
              <button className={styles.searchClear} onClick={() => setQuery('')}>×</button>
            )}
          </div>

          {!query.trim() && (
            <p className={styles.hint}>Escribe para buscar en las páginas del SRD en español.</p>
          )}

          {query.trim() && loading && <p className={styles.hint}>Buscando...</p>}
          {query.trim() && !loading && error && <p className={styles.hint}>{error}</p>}
          {query.trim() && !loading && !error && results.length === 0 && (
            <p className={styles.hint}>Sin resultados para «{query}».</p>
          )}

          <div className={styles.resultsList}>
            {results.map((r) => (
              <button key={r.path} type="button" className={styles.resultCard} onClick={() => openPage(r.path)}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultTitle}>{r.title}</span>
                  {r.section && <span className={styles.resultSection}>{r.section}</span>}
                </div>
                <div
                  className={styles.resultSnippet}
                  dangerouslySetInnerHTML={{ __html: renderSnippet(r.snippet) }}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
