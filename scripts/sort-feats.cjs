const fs = require('fs');

function escapeJsonString(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

const content = fs.readFileSync('src/data/feats.ts', 'utf8');

// Find FEATS array
const match = content.match(/FEATS: Feat\[\] = \[/);
const startIdx = content.indexOf(match[0]) + match[0].length;

// Find end by brace counting
let braceCount = 0;
let endIdx = 0;
for (let i = startIdx; i < content.length; i++) {
  if (content[i] === '{') braceCount++;
  if (content[i] === '}') braceCount--;
  if (content[i] === ']' && braceCount === 0) {
    endIdx = i;
    break;
  }
}

const arrayContent = content.substring(startIdx, endIdx);
const featStrings = arrayContent.split('},\r\n  {');

const feats = [];
for (let i = 0; i < featStrings.length; i++) {
  let featStr = featStrings[i];
  if (i > 0) featStr = '{' + featStr;
  if (i < featStrings.length - 1) featStr = featStr + '}';
  
  const idMatch = featStr.match(/"id":\s*"([^"]+)"/);
  const nameMatch = featStr.match(/"name":\s*"([^"]+)"/);
  const typeMatch = featStr.match(/"type":\s*\[([^\]]+)\]/);
  const prereqMatch = featStr.match(/"prerequisite":\s*"([^"]*)"/);
  const benefitMatch = featStr.match(/"benefit":\s*"([^"]*)"/);
  const normalMatch = featStr.match(/"normal":\s*"([^"]*)"/);
  const specialMatch = featStr.match(/"special":\s*"([^"]*)"/);
  const sourceMatch = featStr.match(/"source":\s*"([^"]*)"/);
  
  if (idMatch && nameMatch) {
    feats.push({
      id: idMatch[1],
      name: nameMatch[1],
      type: typeMatch ? typeMatch[1].split(',').map(t => t.trim().replace(/"/g, '')) : [],
      prerequisite: prereqMatch ? (prereqMatch[1] || null) : null,
      benefit: benefitMatch ? (benefitMatch[1] || '') : '',
      normal: normalMatch ? (normalMatch[1] || null) : null,
      special: specialMatch ? (specialMatch[1] || null) : null,
      source: sourceMatch ? (sourceMatch[1] || null) : null
    });
  }
}

console.log('Parsed', feats.length, 'feats');

// Sort alphabetically by name
feats.sort((a, b) => a.name.localeCompare(b.name, 'es'));

console.log('Sorted. First 5:', feats.slice(0, 5).map(f => f.name));

// Reconstruct the file - use proper JSON serialization
const header = content.substring(0, startIdx);
const footer = content.substring(endIdx);

const sortedFeatsStr = feats.map((feat, i) => {
  const typeStr = feat.type.map(t => `"${t}"`).join(', ');
  let fields = [];
  fields.push(`"id": "${escapeJsonString(feat.id)}"`);
  fields.push(`"name": "${escapeJsonString(feat.name)}"`);
  fields.push(`"type": [\r\n      ${typeStr}\r\n    ]`);
  if (feat.prerequisite) fields.push(`"prerequisite": "${escapeJsonString(feat.prerequisite)}"`);
  fields.push(`"benefit": "${escapeJsonString(feat.benefit)}"`);
  if (feat.normal) fields.push(`"normal": "${escapeJsonString(feat.normal)}"`);
  if (feat.special) fields.push(`"special": "${escapeJsonString(feat.special)}"`);
  if (feat.source) fields.push(`"source": "${escapeJsonString(feat.source)}"`);
  
  let str = '  {\r\n    ' + fields.join(',\r\n    ') + '\r\n  }';
  if (i < feats.length - 1) str += ',';
  return str;
}).join('\r\n');

const newContent = header + '\r\n' + sortedFeatsStr + '\r\n' + footer;

fs.writeFileSync('src/data/feats.ts', newContent);
console.log('Written sorted feats to src/data/feats.ts');
