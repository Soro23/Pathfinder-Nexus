import fs from 'fs'
import path from 'path'

const CATEGORY_MAP = {
  'Combat': 'combat',
  'General': 'general',
  'Metamagic': 'metamagic',
  'Item Creation': 'item_creation',
  'Teamwork': 'teamwork',
  'Critical': 'critical',
  'Style': 'style',
  'Race': 'race',
  'Story': 'story'
}

function extractFromHTML(html) {
  if (!html) return { prerequisite: '', benefit: '', normal: '', special: '' }
  
  const result = { prerequisite: '', benefit: '', normal: '', special: '' }
  
  const prereqMatch = html.match(/<b>Prerequisites?<\/b>:\s*([^<]+)/i)
  if (prereqMatch) {
    result.prerequisite = prereqMatch[1].trim()
  }
  
  const benefitMatch = html.match(/<b>Benefit<\/b>:\s*([^<]+(?:<[^>]+>[^<]*)*)/i)
  if (benefitMatch) {
    let benefit = benefitMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    result.benefit = benefit
  }
  
  const normalMatch = html.match(/<b>Normal<\/b>:\s*([^<]+(?:<[^>]+>[^<]*)*)/i)
  if (normalMatch) {
    let normal = normalMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    result.normal = normal
  }
  
  const specialMatch = html.match(/<b>Special<\/b>:\s*([^<]+(?:<[^>]+>[^<]*)*)/i)
  if (specialMatch) {
    let special = specialMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    result.special = special
  }
  
  return result
}

function mapCategories(categories) {
  if (!categories || !Array.isArray(categories)) return ['general']
  
  const mapped = categories
    .map(cat => CATEGORY_MAP[cat])
    .filter(Boolean)
  
  return mapped.length > 0 ? mapped : ['general']
}

function escapeString(str) {
  if (!str) return ''
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
}

const jsonPath = path.join(process.cwd(), 'docs', 'tables', 'feats_pathfinder_1e.cleaned.json')
const outputPath = path.join(process.cwd(), 'src', 'data', 'feats.ts')

console.log('Reading JSON file...')
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
const feats = jsonData.dotes

console.log(`Processing ${feats.length} feats...`)

const convertedFeats = feats.map((feat) => {
  const { prerequisite, benefit, normal, special } = extractFromHTML(feat.descripcion_html)
  const types = mapCategories(feat.categorias)
  
  const source = Array.isArray(feat.fuente) ? feat.fuente.join(', ') : (feat.fuente || '')
  
  return {
    id: feat.id,
    name: feat.nombre || feat.nombre_original || feat.id,
    type: types,
    prerequisite: prerequisite || undefined,
    benefit: benefit || 'Sin descripción disponible.',
    normal: normal || undefined,
    special: special || undefined,
    source: source || undefined
  }
})

console.log('Generating TypeScript file...')

let tsContent = `import type { Modifier } from '../engine/types'

export type FeatType = 'combat' | 'general' | 'metamagic' | 'item_creation' | 'teamwork' | 'critical' | 'style' | 'race' | 'story'

export interface Feat {
  id: string
  name: string
  type: FeatType[]
  prerequisite?: string
  benefit: string
  normal?: string
  special?: string
  effects?: Modifier[]
  uses?: string[]
  notes?: string[]
  source?: string
}

export const FEATS: Feat[] = [
`

convertedFeats.forEach((feat) => {
  tsContent += `  {
    id: '${escapeString(feat.id)}',
    name: '${escapeString(feat.name)}',
    type: [${feat.type.map(t => `'${t}'`).join(', ')}],`
  
  if (feat.prerequisite) {
    tsContent += `
    prerequisite: '${escapeString(feat.prerequisite)}',`
  }
  
  tsContent += `
    benefit: '${escapeString(feat.benefit)}',`
  
  if (feat.normal) {
    tsContent += `
    normal: '${escapeString(feat.normal)}',`
  }
  
  if (feat.special) {
    tsContent += `
    special: '${escapeString(feat.special)}',`
  }
  
  if (feat.source) {
    tsContent += `
    source: '${escapeString(feat.source)}',`
  }
  
  tsContent += `
  },
`
})

tsContent += `]
`

fs.writeFileSync(outputPath, tsContent, 'utf-8')
console.log(`Done! Generated ${convertedFeats.length} feats in ${outputPath}`)
