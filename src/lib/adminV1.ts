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

// v1.class_levels no tiene un id propio embebido en CLASS_SELECT — se
// referencia por su clave real (class_id, level).
export async function updateClassLevel(
  classId: string,
  level: number,
  patch: { bab: number; fort: number; ref: number; will: number; special_es: string | null }
): Promise<void> {
  const { data, error } = await supabase
    .schema('v1')
    .from('class_levels')
    .update(patch)
    .eq('class_id', classId)
    .eq('level', level)
    .select('level')
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error(`No se guardó el nivel ${level} (permiso o política RLS insuficiente)`)
  }
}

// v1.class_skills es una tabla intermedia sin id propio (class_id, skill_id) —
// marcar/desmarcar una habilidad de clase es insertar o borrar la fila del par,
// no un UPDATE de columna.
export async function setClassSkill(classId: string, skillId: string, isClassSkill: boolean): Promise<void> {
  if (isClassSkill) {
    const { error } = await supabase.schema('v1').from('class_skills').insert({ class_id: classId, skill_id: skillId })
    if (error) throw error
    return
  }
  const { data, error } = await supabase
    .schema('v1')
    .from('class_skills')
    .delete()
    .eq('class_id', classId)
    .eq('skill_id', skillId)
    .select('class_id')
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('No se pudo quitar la habilidad de clase (permiso o política RLS insuficiente)')
  }
}
