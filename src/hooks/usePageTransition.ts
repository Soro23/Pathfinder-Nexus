import { useEffect, useRef, useState } from 'react'
import { usePageTransitionStore } from '../store/pageTransitionStore'

/** Debe coincidir con la duración de `.navEntering` en cada *.module.css de catálogo. */
const NAV_ENTER_MS = 800
/** Tiempo mínimo que se muestra el estado de carga, aunque los datos lleguen
 * al instante (páginas con catálogos estáticos) — si no, la transición pasa
 * demasiado rápido para notarse y da sensación de que no ha pasado nada. */
const MIN_LOADING_MS = 400

export interface PageTransitionState {
  /** La página se está plegando antes de navegar fuera — pliega filtros y contenido. */
  isExiting: boolean
  /** El panel de filtros debe reproducir su despliegue de entrada ahora. */
  isEntering: boolean
  /** Los datos ya están listos y el despliegue del panel ha terminado: se puede mostrar el contenido real. */
  showContent: boolean
  /** Aún no hay nada que mostrar (esperando datos, el mínimo visible, o el despliegue del panel). */
  isLoading: boolean
}

/**
 * Orquesta la secuencia de una página de catálogo al navegar:
 * 1. Mientras `isExiting` (fijado por Layout al hacer clic en el menú), pliega
 *    filtros y contenido antes de que la navegación real ocurra.
 * 2. Al montar, fuerza un mínimo de carga visible aunque `dataReady` sea true
 *    de inmediato (catálogos estáticos), para que se note que algo está pasando.
 * 3. Cuando los datos están listos, despliega el panel de filtros.
 * 4. Solo cuando ese despliegue termina, revela el contenido.
 */
export function usePageTransition(dataReady: boolean): PageTransitionState {
  const isExiting = usePageTransitionStore((s) => s.isExiting)
  const mountedAt = useRef(Date.now())
  const [minDelayDone, setMinDelayDone] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const elapsed = Date.now() - mountedAt.current
    const remaining = Math.max(0, MIN_LOADING_MS - elapsed)
    const timer = setTimeout(() => setMinDelayDone(true), remaining)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ready = dataReady && minDelayDone

  useEffect(() => {
    if (!ready) return
    const timer = setTimeout(() => setShowContent(true), NAV_ENTER_MS)
    return () => clearTimeout(timer)
  }, [ready])

  return {
    isExiting,
    isEntering: ready && !isExiting,
    showContent: showContent && !isExiting,
    isLoading: !ready || !showContent,
  }
}
