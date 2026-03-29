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

const KNOWN_CATEGORIES = new Set([
  'Combat', 'General', 'Metamagic', 'Item Creation', 'Teamwork', 
  'Critical', 'Style', 'Race', 'Story',
  'Monster', 'Item Mastery', 'Blood Hex', 'Story', 'Combat, Faction',
  'Combat, Style', 'Achievement', 'Betrayal, Teamwork', 'Conduit',
  'Grit', 'DTT', 'Meditation', 'Combat, Conduit', 'Combat, Critical',
  'Combat, Stare', 'Hero Point', 'Faction', 'Trick', 'Armor Style',
  'Combat, Performance', 'Combat, Monster', 'Armor Mastery',
  'Combat, Combination', 'Panache', 'Combat, Shield Mastery',
  'Combat, Panache', 'Familiar', 'Stare', 'Esoteric', 'Words of Power',
  'Coven', 'Damnation', 'Called Shot', 'Gathlain Court Title',
  'Alignment', 'Origin', 'Targeting, Weapon Mastery', 'Shield Style',
  'Combat, Shield Style', 'Combat, Targeting', 'Combat, Item Mastery',
  'Combat, Grit', 'Combat, Meditation', 'Combat, Teamwork', 'UW', 'UM', 'MC', 'BoA'
])

function extractCategoriesFromHTML(html) {
  if (!html) return ['general']
  
  const categories = []
  
  const match = html.match(/<h1 class="title">.*?\(([^)]+)\)<\/h1>/)
  if (match) {
    const catsStr = match[1]
    const cats = catsStr.split(',').map(c => c.trim())
    
    for (const cat of cats) {
      if (CATEGORY_MAP[cat]) {
        categories.push(CATEGORY_MAP[cat])
      } else if (cat.includes('Combat')) {
        if (!categories.includes('combat')) categories.push('combat')
      } else if (cat.includes('Style')) {
        if (!categories.includes('style')) categories.push('style')
      } else if (cat.includes('Teamwork')) {
        if (!categories.includes('teamwork')) categories.push('teamwork')
      } else if (cat.includes('Item')) {
        if (!categories.includes('item_creation')) categories.push('item_creation')
      }
    }
  }
  
  if (categories.length === 0) {
    categories.push('general')
  }
  
  return categories
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

const categoryStats = {}

const convertedFeats = feats.map((feat) => {
  const { prerequisite, benefit, normal, special } = extractFromHTML(feat.descripcion_html)
  const types = extractCategoriesFromHTML(feat.descripcion_html)
  
  types.forEach(t => {
    categoryStats[t] = (categoryStats[t] || 0) + 1
  })
  
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

console.log('Category distribution:', categoryStats)

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
console.log('Category stats:', categoryStats)
