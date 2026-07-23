export interface PageTransitionState {
  isLoading: boolean
}

/** Sin animaciones de entrada/salida: el contenido se muestra en cuanto los datos están listos. */
export function usePageTransition(dataReady: boolean): PageTransitionState {
  return { isLoading: !dataReady }
}
