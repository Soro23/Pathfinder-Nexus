/**
 * Caché en memoria para resultados de consultas de solo lectura (catálogo SRD).
 * El contenido es inmutable durante la sesión, así que cachear por clave de
 * consulta es seguro y no necesita invalidación ni TTL.
 */
const cache = new Map<string, unknown>()

export function getCached<T>(key: string): T | undefined {
  return cache.has(key) ? (cache.get(key) as T) : undefined
}

export function setCached<T>(key: string, data: T): void {
  cache.set(key, data)
}

/**
 * Ejecuta `fetcher` con soporte de caché y cancelación. Si `key` ya está en
 * caché, resuelve al instante sin red. Si la señal se aborta antes de que
 * `fetcher` resuelva, el resultado se descarta (no se cachea ni se aplica).
 */
export async function fetchWithCache<T>(
  key: string,
  signal: AbortSignal,
  fetcher: (signal: AbortSignal) => Promise<T>
): Promise<T | undefined> {
  const cached = getCached<T>(key)
  if (cached !== undefined) return cached

  const result = await fetcher(signal)
  if (signal.aborted) return undefined

  setCached(key, result)
  return result
}
