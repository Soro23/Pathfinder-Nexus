import { supabase } from './supabase'

// Guardado genérico para cualquier campo de texto del schema `v1` desde el
// editor de Admin — evita repetir `supabase.schema('v1').from(table).update(...)`
// una vez por cada combinación tabla/columna (dotes, habilidades, clases,
// características, mecánicas de elección por clase...).
export async function updateV1Field(
  table: string,
  id: string | number,
  column: string,
  value: string
): Promise<void> {
  const { error } = await supabase.schema('v1').from(table).update({ [column]: value }).eq('id', id)
  if (error) throw error
}
