/** Evita romper la mini-sintaxis de `.or()` de PostgREST con comas/paréntesis del texto buscado. */
export function escapeForOrFilter(term: string): string {
  return term.replace(/[,()]/g, '')
}
