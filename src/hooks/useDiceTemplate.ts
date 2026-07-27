import { useState, useEffect } from 'react'

export interface DiceTemplate {
  id: string
  name: string
  dieColor: string
  // El borde/número necesita su propio color por tema: en oscuro el fondo de
  // página (--color-surface) es muy parecido al tono de tinta usado en claro
  // (y viceversa con el crema), así que cada plantilla fija ambos en vez de
  // derivarlos automáticamente del color del dado.
  edgeColorLight: string
  edgeColorDark: string
}

export const DICE_TEMPLATES: DiceTemplate[] = [
  { id: 'dorado', name: 'Dorado', dieColor: '#e0a850', edgeColorLight: '#141210', edgeColorDark: '#f0e6c8' },
  { id: 'carmesi', name: 'Carmesí', dieColor: '#7b001f', edgeColorLight: '#e0a850', edgeColorDark: '#f0e6c8' },
  { id: 'esmeralda', name: 'Esmeralda', dieColor: '#1f6b45', edgeColorLight: '#141210', edgeColorDark: '#f0e6c8' },
  { id: 'zafiro', name: 'Zafiro', dieColor: '#1e4d8c', edgeColorLight: '#e0a850', edgeColorDark: '#f0e6c8' },
  { id: 'obsidiana', name: 'Obsidiana', dieColor: '#2a2a2a', edgeColorLight: '#e0a850', edgeColorDark: '#f0e6c8' },
]

const STORAGE_KEY = 'pf-dice-template'

export function useDiceTemplate() {
  const [templateId, setTemplateId] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored && DICE_TEMPLATES.some((t) => t.id === stored) ? stored : DICE_TEMPLATES[0].id
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, templateId)
  }, [templateId])

  const template = DICE_TEMPLATES.find((t) => t.id === templateId) ?? DICE_TEMPLATES[0]

  return { template, templateId, setTemplateId, templates: DICE_TEMPLATES }
}
