import { useMemo, useState } from 'react'
import { ChevronRight, ChevronDown, GitBranch, ChevronsDown, ChevronsUp } from 'lucide-react'
import styles from './Feats.module.css'
import demoStyles from './FeatsV1Example.module.css'
import { normalizeFeatName, type FeatRef } from './featsV1PrerequisiteLinks'

interface TreeNodeProps {
  feat: FeatRef
  requiredBy: Map<string, string[]>
  featsById: Map<string, FeatRef>
  onSelectFeat: (id: string) => void
  depth: number
  collapsedIds: Set<string>
  onToggle: (id: string) => void
  filterActive: boolean
  matchesSelf: Set<string>
  containsMatch: Map<string, boolean>
}

// Una dote con más de un prerrequisito-dote puede aparecer bajo más de una raíz
// (es un grafo dirigido acíclico, no un árbol estricto) — no se deduplica.
// Expandido/colapsado vive en FeatsV1Tree (collapsedIds) en vez de estado local
// por nodo, para poder plegar/desplegar todo desde un único botón.
function TreeNode({
  feat, requiredBy, featsById, onSelectFeat, depth, collapsedIds, onToggle,
  filterActive, matchesSelf, containsMatch,
}: TreeNodeProps) {
  const allChildIds = requiredBy.get(feat.id) ?? []
  // Con filtro activo solo se muestran las ramas que llevan a una coincidencia,
  // y esas ramas van forzadas a expandidas para que la coincidencia sea visible
  // sin tener que desplegar a mano nivel por nivel.
  const childIds = filterActive ? allChildIds.filter((id) => containsMatch.get(id)) : allChildIds
  const hasChildren = childIds.length > 0
  const expanded = filterActive ? hasChildren : hasChildren && !collapsedIds.has(feat.id)
  const isMatch = filterActive && matchesSelf.has(feat.id)

  return (
    <div className={demoStyles.treeNode} style={depth > 0 ? { marginLeft: 'var(--space-4)' } : undefined}>
      <div className={demoStyles.treeNodeRow}>
        {hasChildren ? (
          <button
            type="button"
            className={demoStyles.treeToggle}
            onClick={() => onToggle(feat.id)}
            aria-label={expanded ? 'Colapsar' : 'Expandir'}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className={demoStyles.treeToggleSpacer} />
        )}
        <button
          type="button"
          className={`${demoStyles.treeNodeName} ${isMatch ? demoStyles.treeNodeMatch : ''}`}
          onClick={() => onSelectFeat(feat.id)}
        >
          {feat.name_es}
        </button>
      </div>

      {expanded && hasChildren && (
        <div className={demoStyles.treeChildren}>
          {childIds.map((childId) => {
            const child = featsById.get(childId)
            if (!child) return null
            return (
              <TreeNode
                key={childId}
                feat={child}
                requiredBy={requiredBy}
                featsById={featsById}
                onSelectFeat={onSelectFeat}
                depth={depth + 1}
                collapsedIds={collapsedIds}
                onToggle={onToggle}
                filterActive={filterActive}
                matchesSelf={matchesSelf}
                containsMatch={containsMatch}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// Recorre el bosque (roots → requiredBy) y devuelve los ids de todas las dotes
// que tienen hijos, en cualquier nivel — es lo que "Plegar todo" necesita marcar
// como colapsado. Con Set de visitados por si el grafo tuviera algún ciclo.
function collectExpandableIds(roots: FeatRef[], requiredBy: Map<string, string[]>): string[] {
  const ids: string[] = []
  const visited = new Set<string>()

  function walk(id: string) {
    if (visited.has(id)) return
    visited.add(id)
    const children = requiredBy.get(id) ?? []
    if (children.length > 0) {
      ids.push(id)
      for (const childId of children) walk(childId)
    }
  }

  for (const root of roots) walk(root.id)
  return ids
}

// Para cada dote del bosque: ¿coincide ella misma con el filtro, o alguna de sus
// descendientes (a cualquier profundidad)? Necesario para poder buscar dotes
// anidadas, no solo raíces — antes el filtro solo miraba `roots`.
function computeMatches(
  roots: FeatRef[],
  requiredBy: Map<string, string[]>,
  featsById: Map<string, FeatRef>,
  filter: string
): { matchesSelf: Set<string>; containsMatch: Map<string, boolean> } {
  const matchesSelf = new Set<string>()
  const containsMatch = new Map<string, boolean>()
  const normalizedFilter = normalizeFeatName(filter)
  const visiting = new Set<string>()

  function resolve(id: string): boolean {
    const cached = containsMatch.get(id)
    if (cached !== undefined) return cached
    if (visiting.has(id)) return false // ciclo defensivo

    visiting.add(id)
    const feat = featsById.get(id)
    const self = !!feat && normalizeFeatName(feat.name_es).includes(normalizedFilter)
    if (self) matchesSelf.add(id)

    let any = self
    for (const childId of requiredBy.get(id) ?? []) {
      if (resolve(childId)) any = true
    }

    visiting.delete(id)
    containsMatch.set(id, any)
    return any
  }

  for (const root of roots) resolve(root.id)
  return { matchesSelf, containsMatch }
}

interface FeatsV1TreeProps {
  roots: FeatRef[]
  requiredBy: Map<string, string[]>
  featsById: Map<string, FeatRef>
  onSelectFeat: (id: string) => void
}

export function FeatsV1Tree({ roots, requiredBy, featsById, onSelectFeat }: FeatsV1TreeProps) {
  const [filter, setFilter] = useState('')
  // Vacío = todo expandido (comportamiento por defecto pedido).
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())

  const trimmedFilter = filter.trim()
  const filterActive = trimmedFilter.length > 0

  const { matchesSelf, containsMatch } = useMemo(
    () => (filterActive ? computeMatches(roots, requiredBy, featsById, trimmedFilter) : { matchesSelf: new Set<string>(), containsMatch: new Map<string, boolean>() }),
    [filterActive, trimmedFilter, roots, requiredBy, featsById]
  )

  const filteredRoots = filterActive ? roots.filter((r) => containsMatch.get(r.id)) : roots

  const handleToggle = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleExpandAll = () => setCollapsedIds(new Set())
  const handleCollapseAll = () => setCollapsedIds(new Set(collectExpandableIds(roots, requiredBy)))

  return (
    <div className={demoStyles.treeSection}>
      <div className={demoStyles.treeSectionHeader}>
        <div className={demoStyles.treeSectionTitle}>
          <GitBranch size={16} />
          <span>Árbol de dotes ({roots.length} cadenas)</span>
        </div>
        <div className={demoStyles.treeSectionActions}>
          <button type="button" className={demoStyles.treeActionBtn} onClick={handleExpandAll}>
            <ChevronsDown size={14} />
            Desplegar todo
          </button>
          <button type="button" className={demoStyles.treeActionBtn} onClick={handleCollapseAll}>
            <ChevronsUp size={14} />
            Plegar todo
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Filtrar dotes en el árbol (a cualquier nivel)..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className={`${styles.searchInput} ${demoStyles.treeFilterInput}`}
      />

      {roots.length === 0 ? (
        <p className={styles.subtitle}>Calculando el índice de dependencias entre dotes...</p>
      ) : (
        <div className={demoStyles.treeList}>
          {filteredRoots.map((root) => (
            <TreeNode
              key={root.id}
              feat={root}
              requiredBy={requiredBy}
              featsById={featsById}
              onSelectFeat={onSelectFeat}
              depth={0}
              collapsedIds={collapsedIds}
              onToggle={handleToggle}
              filterActive={filterActive}
              matchesSelf={matchesSelf}
              containsMatch={containsMatch}
            />
          ))}
          {filteredRoots.length === 0 && (
            <p className={styles.subtitle}>Ninguna dote coincide con "{filter}".</p>
          )}
        </div>
      )}
    </div>
  )
}
