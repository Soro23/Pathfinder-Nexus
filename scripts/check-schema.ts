import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

// Query information_schema for columns of the spells table
const { data, error } = await supabase
  .rpc('get_columns', { table_name: 'spells' })
  .select()

if (error) {
  // Fallback: try information_schema directly via raw query isn't available with anon key
  // Try inserting with known possible columns
  console.log('RPC error:', error.message)

  // Try a known column insert to detect schema
  const tests = ['id', 'name', 'spell_name', 'title', 'data', 'spell_data']
  for (const col of tests) {
    const row: Record<string, string> = {}
    row[col] = 'test'
    const { error: e } = await supabase.from('spells').insert(row as never)
    const msg = e?.message ?? 'SUCCESS'
    console.log(`Column "${col}": ${msg}`)
  }
} else {
  console.log('Columns:', data)
}
