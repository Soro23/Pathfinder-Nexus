import { create } from 'zustand'

interface PageTransitionStore {
  /** true mientras la página actual está plegándose antes de navegar de verdad. */
  isExiting: boolean
  /** Ruta a la que se está navegando — el menú la resalta como activa de inmediato,
   * antes de que la navegación real ocurra, para que el clic se sienta instantáneo. */
  pendingPath: string | null
  setExiting: (value: boolean) => void
  setPendingPath: (path: string | null) => void
}

export const usePageTransitionStore = create<PageTransitionStore>((set) => ({
  isExiting: false,
  pendingPath: null,
  setExiting: (value) => set({ isExiting: value }),
  setPendingPath: (path) => set({ pendingPath: path }),
}))
