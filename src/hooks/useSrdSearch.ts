import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchWithCache } from '../lib/queryCache'
import { useDebouncedValue } from './useDebouncedValue'

export interface SrdSearchResult {
  path: string
  title: string
  section: string | null
  snippet: string
  rank: number
}

export interface SrdPage {
  title: string
  content: string
}

const LANG = 'es'

export function useSrdSearch(query: string) {
  const [results, setResults] = useState<SrdSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const debouncedQuery = useDebouncedValue(query, 300)

  useEffect(() => {
    abortRef.current?.abort()

    if (!debouncedQuery.trim()) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError(null)

    fetchWithCache(`srd-search:${LANG}:${debouncedQuery}`, controller.signal, async (signal) => {
      const { data, error: rpcError } = await supabase
        .rpc('search_srd', { q: debouncedQuery, in_lang: LANG, max_results: 20 })
        .abortSignal(signal)
      if (rpcError) throw rpcError
      return (data ?? []) as unknown as SrdSearchResult[]
    })
      .then((data) => {
        if (!data || controller.signal.aborted) return
        setResults(data)
      })
      .catch((e) => {
        if (controller.signal.aborted) return
        setError(e instanceof Error ? e.message : 'Error buscando en el SRD')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [debouncedQuery])

  return { results, loading, error }
}

/** Ficha completa de una página del SRD (Markdown), cacheada por ser contenido de solo lectura. */
export async function fetchSrdPage(path: string): Promise<SrdPage | undefined> {
  const cacheKey = `srd-page:${LANG}:${path}`
  const controller = new AbortController()
  return fetchWithCache(cacheKey, controller.signal, async (signal) => {
    const { data, error } = await supabase
      .from('srd_pages')
      .select('title,content')
      .eq('lang', LANG)
      .eq('path', path)
      .abortSignal(signal)
      .single()
    if (error) throw error
    const row = data as unknown as Record<string, unknown> | null
    return { title: (row?.title as string) ?? '', content: (row?.content as string) ?? '' }
  })
}
