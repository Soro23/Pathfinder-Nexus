const { readFileSync, writeFileSync } = require('fs')

const content = readFileSync('./src/data/archetypes.ts', 'utf-8')

const result = []

const archetypeRegex = /\n\s*\{\n\s*id:\s*'([^']+)',\n\s*classId:\s*'([^']+)',\n\s*name:\s*'([^']+)',\n\s*description:\s*'([^']+)',\n\s*replaces:\s*\[([\s\S]*?)\],\n\s*features:\s*\[([\s\S]*?)\](?:,\n\s*classSkillsAdded:\s*\[([\s\S]*?)\])?(?:,\n\s*classSkillsRemoved:\s*\[([\s\S]*?)\])?(?:,\n\s*spellsPerDayOverride:[^}]+\})?\n\s*\}/g

let match
while ((match = archetypeRegex.exec(content)) !== null) {
  const replaces = parseArray(match[5])
  const features = parseArray(match[6])
  const classSkillsAdded = parseStringArray(match[7])
  const classSkillsRemoved = parseStringArray(match[8])
  
  result.push({
    id: match[1],
    class_id: match[2],
    name: match[3],
    description: match[4],
    replaces,
    features,
    class_skills_added: classSkillsAdded,
    class_skills_removed: classSkillsRemoved,
    spells_per_day_override: null
  })
}

function parseArray(str) {
  if (!str.trim()) return []
  const items = []
  const itemRegex = /\n\s*\{\n\s*featureName:\s*'([^']+)',\n\s*atLevel:\s*(\d+),\n\s*type:\s*'([^']+)'/g
  const itemRegex2 = /\n\s*\{\n\s*name:\s*'([^']+)',\n\s*level:\s*(\d+),\n\s*description:\s*'([^']+)'/g
  
  let m
  while ((m = itemRegex.exec(str)) !== null) {
    items.push({
      featureName: m[1],
      atLevel: parseInt(m[2]),
      type: m[3]
    })
  }
  while ((m = itemRegex2.exec(str)) !== null) {
    items.push({
      name: m[1],
      level: parseInt(m[2]),
      description: m[3]
    })
  }
  
  return items
}

function parseStringArray(str) {
  if (!str) return null
  const items = str.match(/'([^']+)'/g)
  if (!items) return null
  return items.map(s => s.replace(/'/g, ''))
}

console.log(`Found ${result.length} archetypes`)

if (result.length > 0) {
  console.log('First archetype:', JSON.stringify(result[0], null, 2))
  writeFileSync('./archetypes-data.json', JSON.stringify(result, null, 2))
} else {
  console.log('No archetypes found!')
}
