const fs = require('fs');
const https = require('https');

const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldXZma2prdGl2dGhucGd4eHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5OTM1MjUsImV4cCI6MjA4OTU2OTUyNX0.BT9af6UQ4cB5ae4NlU22UZZUZC2JToZVCUh0MVBM74E';

function readStaticFeats() {
  const content = fs.readFileSync('src/data/feats.ts', 'utf8');
  
  // Find FEATS array - use more specific pattern
  const match = content.match(/FEATS: Feat\[\] = \[/);
  if (!match) {
    console.error('Could not find FEATS array');
    return [];
  }
  
  const startIdx = content.indexOf(match[0]) + match[0].length;
  
  // Find the matching ] at the end by counting braces
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
  
  // Handle Windows line endings \r\n
  const featStrings = arrayContent.split('},\r\n  {');
  
  const feats = [];
  for (let i = 0; i < featStrings.length; i++) {
    let featStr = featStrings[i];
    
    if (i > 0) featStr = '{' + featStr;
    if (i < featStrings.length - 1) featStr = featStr + '}';
    
    const feat = parseFeat(featStr);
    if (feat) feats.push(feat);
  }
  
  return feats;
}

function parseFeat(text) {
  const idMatch = text.match(/"id":\s*"([^"]+)"/);
  const nameMatch = text.match(/"name":\s*"([^"]+)"/);
  if (!idMatch || !nameMatch) return null;
  
  const typeMatch = text.match(/"type":\s*\[([^\]]+)\]/);
  const type = typeMatch ? typeMatch[1].split(',').map(t => t.trim().replace(/"/g, '')) : [];
  
  const extractField = (fieldName) => {
    const match = text.match(`"${fieldName}":\\s*"([^"]*)"`);
    return match ? (match[1] || null) : null;
  };
  
  return {
    id: idMatch[1],
    name: nameMatch[1],
    type: type,
    prerequisite: extractField('prerequisite'),
    benefit: extractField('benefit') || '',
    normal: extractField('normal'),
    special: extractField('special')
  };
}

function fetchSupabaseFeats() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ieuvfkjktivthnpgxxqj.supabase.co',
      path: '/rest/v1/feats?select=id&limit=10000',
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const feats = JSON.parse(data);
          resolve(feats.map(f => f.id));
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

function insertFeats(feats) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(feats);
    
    const options = {
      hostname: 'ieuvfkjktivthnpgxxqj.supabase.co',
      path: '/rest/v1/feats',
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates'
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (responseData.trim()) {
            resolve(JSON.parse(responseData));
          } else {
            resolve([]);
          }
        } else {
          reject(new Error(`Status ${res.statusCode}: ${responseData}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Leyendo feats del archivo estatico...');
  const staticFeats = readStaticFeats();
  console.log(`  Encontrados ${staticFeats.length} feats en el archivo estatico`);
  
  console.log('Obteniendo IDs de Supabase...');
  const supabaseIds = await fetchSupabaseFeats();
  console.log(`  Encontrados ${supabaseIds.length} feats en Supabase`);
  
  const supabaseIdSet = new Set(supabaseIds);
  const missingFeats = staticFeats.filter(f => !supabaseIdSet.has(f.id));
  console.log(`  ${missingFeats.length} feats faltantes por subir`);
  
  if (missingFeats.length === 0) {
    console.log('Todos los feats ya estan en Supabase!');
    return;
  }
  
  const BATCH_SIZE = 50;
  let uploaded = 0;
  
  for (let i = 0; i < missingFeats.length; i += BATCH_SIZE) {
    const batch = missingFeats.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(missingFeats.length / BATCH_SIZE);
    
    console.log(`  Subiendo batch ${batchNum}/${totalBatches} (${batch.length} feats)...`);
    
    try {
      await insertFeats(batch);
      uploaded += batch.length;
      console.log(`  Batch ${batchNum} subido (${uploaded}/${missingFeats.length})`);
    } catch (e) {
      console.error(`  Error en batch ${batchNum}: ${e.message}`);
      // Continue with next batch instead of throwing
      continue;
    }
  }
  
  console.log(`\nSubidos ${uploaded} feats nuevos a Supabase!`);
  console.log(`  Total en Supabase: ${supabaseIds.length + uploaded}`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
