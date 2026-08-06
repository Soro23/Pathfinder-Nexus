import { supabase } from './supabase'

// Guardado genérico para cualquier campo de texto del schema `v1` desde el
// editor de Admin — evita repetir `supabase.schema('v1').from(table).update(...)`
// una vez por cada combinación tabla/columna (dotes, habilidades, clases,
// características, mecánicas de elección por clase...).
//
// `.select('id')` es necesario para poder detectar un guardado silenciosamente
// bloqueado por RLS: sin él, PostgREST usa `Prefer: return=minimal` y un
// UPDATE que no matchea ninguna fila (porque la policy de escritura no
// autoriza esa fila) devuelve éxito con `data: null` y `error: null` — el
// cliente no tiene forma de distinguirlo de un guardado real. Pidiendo la
// fila de vuelta, un array vacío confirma que no se escribió nada.
export async function updateV1Field(
  table: string,
  id: string | number,
  column: string,
  value: string
): Promise<void> {
  const { data, error } = await supabase
    .schema('v1')
    .from(table)
    .update({ [column]: value })
    .eq('id', id)
    .select('id')
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error(`No se guardó ningún registro en v1.${table} (permiso o política RLS insuficiente)`)
  }
}
