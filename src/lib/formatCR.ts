// Única fuente de formato de CR (Nivel de Desafío) de toda la app.
// El valor numérico (columna `cr`, NUMERIC en Supabase) sigue usándose tal cual
// para ordenar y filtrar; esta función solo se encarga de la presentación.

const FRACTIONAL_CR: Array<{ value: number; label: string }> = [
  { value: 0.5, label: '1/2' },
  { value: 0.33, label: '1/3' },
  { value: 0.25, label: '1/4' },
  { value: 0.17, label: '1/6' },
  { value: 0.13, label: '1/8' },
]

const TOLERANCE = 0.01
const EPSILON = 1e-9 // margen para errores de precisión de coma flotante (ej. 0.51 - 0.5 !== 0.01 exacto)

/**
 * Formatea un Challenge Rating para mostrarlo en la UI.
 * - Fraccionarios conocidos (con tolerancia ±0.01, por redondeos de BD): "1/2", "1/3", "1/4", "1/6", "1/8".
 * - Enteros: sin decimales ("5").
 * - null/undefined/NaN: "—".
 */
export function formatCR(cr: number | null | undefined): string {
  if (cr == null || Number.isNaN(cr)) return '—'

  const fractional = FRACTIONAL_CR.find(f => Math.abs(cr - f.value) <= TOLERANCE + EPSILON)
  if (fractional) return fractional.label

  return String(Math.round(cr))
}
