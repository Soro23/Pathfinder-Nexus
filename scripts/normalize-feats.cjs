const https = require('https');

const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldXZma2prdGl2dGhucGd4eHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5OTM1MjUsImV4cCI6MjA4OTU2OTUyNX0.BT9af6UQ4cB5ae4NlU22UZZUZC2JToZVCUh0MVBM74E';

function fetchFeats() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ieuvfkjktivthnpgxxqj.supabase.co',
      path: '/rest/v1/feats?select=id',
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

function deleteFeat(id) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ieuvfkjktivthnpgxxqj.supabase.co',
      path: '/rest/v1/feats?id=eq.' + id,
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(true);
        else reject(new Error(`Status ${res.statusCode}: ${data}`));
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function updateFeat(oldId, newId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ieuvfkjktivthnpgxxqj.supabase.co',
      path: '/rest/v1/feats?id=eq.' + oldId,
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(true);
        else reject(new Error(`Status ${res.statusCode}: ${data}`));
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify({ id: newId }));
    req.end();
  });
}

async function main() {
  console.log('Obteniendo feats de Supabase...');
  const feats = await fetchFeats();
  console.log('  Total feats: ' + feats.length);

  const allIds = feats.map(f => f.id);
  const withDash = allIds.filter(id => id.includes('-'));
  const withUnderscore = allIds.filter(id => id.includes('_'));

  // Find underscore IDs that have a dash version (candidates to delete)
  const toDelete = [];
  const toNormalize = [];

  for (const id of withUnderscore) {
    const dashVersion = id.replace(/_/g, '-');
    if (withDash.includes(dashVersion)) {
      toDelete.push(id);
    } else {
      // Unique underscore - normalize to use underscore consistently
      toNormalize.push(id);
    }
  }

  // All dash versions will be normalized
  for (const id of withDash) {
    toNormalize.push(id);
  }

  console.log('\n--- Paso 1: Eliminar feats duplicados con _ ---');
  console.log('  A eliminar: ' + toDelete.length);

  let deleted = 0;
  for (const id of toDelete) {
    try {
      await deleteFeat(id);
      deleted++;
      if (deleted % 20 === 0) console.log('  Eliminado ' + deleted + '/' + toDelete.length);
    } catch (e) {
      console.error('  Error eliminando ' + id + ': ' + e.message);
    }
  }
  console.log('  Eliminados ' + deleted + ' feats');

  console.log('\n--- Paso 2: Normalizar todos los IDs a underscore ---');
  console.log('  A normalizar: ' + toNormalize.length);

  let normalized = 0;
  for (const id of toNormalize) {
    const newId = id.replace(/-/g, '_');
    if (newId !== id) {
      try {
        await updateFeat(id, newId);
        normalized++;
        if (normalized % 50 === 0) console.log('  Normalizado ' + normalized + '/' + toNormalize.length);
      } catch (e) {
        console.error('  Error normalizando ' + id + ': ' + e.message);
      }
    }
  }
  console.log('  Normalizados ' + normalized + ' feats');

  // Verify
  const finalFeats = await fetchFeats();
  console.log('\n--- Resultado final ---');
  console.log('  Total feats: ' + finalFeats.length);
  
  const finalWithDash = finalFeats.filter(f => f.id.includes('-'));
  const finalWithUnderscore = finalFeats.filter(f => f.id.includes('_'));
  console.log('  Con dash: ' + finalWithDash.length);
  console.log('  Con underscore: ' + finalWithUnderscore.length);
  console.log('  TODOS NORMALIZADOS: ' + (finalWithDash.length === 0 ? 'SI ✓' : 'NO ✗'));
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
