import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SpellRecord {
  id: string;
  name: string;
  school: string;
  subschool: string | null;
  descriptor: string | null;
  level: number;
  type: string;
  class_lists: string | null;
  casting_time: string | null;
  range: string | null;
  target: string | null;
  area: string | null;
  effect: string | null;
  duration: string | null;
  saving_throw: string | null;
  spell_resistance: string | null;
  description: string | null;
  material: string | null;
  arcane_focus: string | null;
  divine_focus: boolean;
  costly_components: boolean;
}

function toId(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function extractLevel(classListsStr: string): number {
  const matches = classListsStr.matchAll(/\b(\d+)\s*(?:,|$)/g);
  const levels: number[] = [];
  for (const m of matches) {
    levels.push(parseInt(m[1], 10));
  }
  // Also match patterns like "cleric 2, ..."
  const levelMatches = classListsStr.matchAll(/\s(\d+)(?:\s*,|\s*$)/g);
  for (const m of levelMatches) {
    levels.push(parseInt(m[1], 10));
  }
  if (levels.length === 0) return 9;
  return Math.min(...levels);
}

function parseClassLevels(classStr: string): Record<string, number> {
  const result: Record<string, number> = {};
  // Split by comma, each entry is "class N" or "class/class N"
  const parts = classStr.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    const m = trimmed.match(/^(.+?)\s+(\d+)$/);
    if (m) {
      const classes = m[1].split('/').map(c => c.trim().toLowerCase());
      const lvl = parseInt(m[2], 10);
      for (const cls of classes) {
        result[cls] = lvl;
      }
    }
  }
  return result;
}

function determineType(classMap: Record<string, number>): string {
  const divineClasses = ['cleric', 'druid', 'paladin', 'ranger', 'inquisitor', 'oracle', 'shaman', 'hunter', 'warpriest', 'antipaladin', 'adept'];
  const arcaneClasses = ['sorcerer', 'wizard', 'bard', 'magus', 'alchemist', 'witch', 'psychic', 'bloodrager', 'summoner', 'unchained summoner', 'arcanist', 'skald', 'investigator'];
  const hasDivine = divineClasses.some(cls => cls in classMap);
  const hasArcane = arcaneClasses.some(cls => cls in classMap);
  if (hasDivine && hasArcane) return 'both';
  if (hasDivine) return 'divine';
  return 'arcane';
}

function extractComponents(compLine: string) {
  const material = compLine.includes(' M') || compLine.includes(',M') ? extractMaterial(compLine) : null;
  const arcane_focus = compLine.includes(' F') && !compLine.includes('DF') ? extractFocus(compLine) : null;
  const divine_focus = /\bDF\b/.test(compLine) || /M\/DF/.test(compLine);
  // costly_components: material component with gp value
  const costly_components = /\d+\s*gp/.test(compLine) || /worth/.test(compLine);
  return { material, arcane_focus, divine_focus, costly_components };
}

function extractMaterial(compLine: string): string | null {
  // M (description) or M/DF (description)
  const m = compLine.match(/[M](?:\/DF)?\s*\(([^)]+)\)/);
  return m ? m[1].trim() : null;
}

function extractFocus(compLine: string): string | null {
  const m = compLine.match(/\bF\b\s*\(([^)]+)\)/);
  return m ? m[1].trim() : null;
}

function escSql(str: string | null): string {
  if (str === null) return 'NULL';
  return "'" + str.replace(/'/g, "''") + "'";
}

function parseSpellBlock(block: string): SpellRecord | null {
  const lines = block.split('\n');
  if (lines.length < 2) return null;

  const name = lines[0].trim();
  if (!name) return null;

  const id = toId(name);
  const fullText = block;

  // Find the "### Descripción" section
  const descIdx = fullText.indexOf('### Descripción');
  if (descIdx === -1) return null;
  const descSection = fullText.slice(descIdx + '### Descripción'.length).trim();

  // School line: "School <school>[(<subschool>)] [<descriptor>]; Level <classes>"
  const schoolLineMatch = descSection.match(/^School\s+(.+?)(?:\nCASTING|\nCOMPONENTS)/m);
  let schoolLine = schoolLineMatch ? schoolLineMatch[1] : '';

  // Also try inline
  if (!schoolLine) {
    const m2 = descSection.match(/School\s+([^\n]+)/);
    schoolLine = m2 ? m2[1] : '';
  }

  // Parse school
  let school = '';
  let subschool: string | null = null;
  let descriptor: string | null = null;
  let classListsStr = '';

  if (schoolLine) {
    // Split at "; Level" to separate school from class list
    const semiIdx = schoolLine.indexOf('; Level');
    let schoolPart = semiIdx >= 0 ? schoolLine.slice(0, semiIdx).trim() : schoolLine.trim();
    if (semiIdx >= 0) {
      classListsStr = schoolLine.slice(semiIdx + '; Level'.length).trim();
    }

    // Extract subschool (parentheses)
    const subM = schoolPart.match(/\(([^)]+)\)/);
    if (subM) {
      subschool = subM[1].trim();
      schoolPart = schoolPart.replace(subM[0], '').trim();
    }

    // Extract descriptor (brackets)
    const descM = schoolPart.match(/\[([^\]]+)\]/);
    if (descM) {
      descriptor = descM[1].trim();
      schoolPart = schoolPart.replace(descM[0], '').trim();
    }

    school = schoolPart.replace(/^School\s+/i, '').trim();
  }

  // Class levels and type
  const classMap = classListsStr ? parseClassLevels(classListsStr) : {};
  const levelVal = classListsStr ? (() => {
    const vals = Object.values(classMap);
    return vals.length > 0 ? Math.min(...vals) : 9;
  })() : 9;
  const typeVal = determineType(classMap);

  // CASTING section
  const castingMatch = descSection.match(/CASTING\s*\n([\s\S]+?)(?:\nEFFECT|\nDESCRIPTION)/);
  const castingText = castingMatch ? castingMatch[1] : '';

  // Casting time — may be inline or have no space
  const ctMatch = castingText.match(/Casting Time\s+(.+?)(?:Components|$)/s);
  const casting_time = ctMatch ? ctMatch[1].replace(/\s+/g, ' ').trim() : null;

  // Components line
  const compMatch = castingText.match(/Components?\s+(.+?)$/m);
  const compLine = compMatch ? compMatch[1].trim() : '';
  const { material, arcane_focus, divine_focus, costly_components } = extractComponents(compLine);

  // EFFECT section
  const effectMatch = descSection.match(/EFFECT\s*\n([\s\S]+?)(?:\nDESCRIPTION)/);
  const effectText = effectMatch ? effectMatch[1] : '';

  // Range
  const rangeM = effectText.match(/Range\s+(.+?)(?:Target|Area\b|Effect\b|Duration|Saving|$)/s);
  const range = rangeM ? rangeM[1].replace(/\s+/g, ' ').trim() : null;

  // Target
  const targetM = effectText.match(/Target\s+(.+?)(?:Duration|Area\b|Effect\b|Saving|$)/s);
  const target = targetM ? targetM[1].replace(/\s+/g, ' ').trim() : null;

  // Area
  const areaM = effectText.match(/\bArea\b\s+(.+?)(?:Duration|Effect\b|Saving|$)/s);
  const area = areaM ? areaM[1].replace(/\s+/g, ' ').trim() : null;

  // Effect (the spell effect field, not EFFECT section)
  const effectFieldM = effectText.match(/\bEffect\b\s+(.+?)(?:Duration|Saving|$)/s);
  const effect = effectFieldM ? effectFieldM[1].replace(/\s+/g, ' ').trim() : null;

  // Duration
  const durationM = effectText.match(/Duration\s+(.+?)(?:Saving Throw|Spell Resistance|$)/s);
  const duration = durationM ? durationM[1].replace(/\s+/g, ' ').trim() : null;

  // Saving Throw
  const saveM = effectText.match(/Saving Throw\s+(.+?)(?:;?\s*Spell Resistance|$)/s);
  const saving_throw = saveM ? saveM[1].replace(/\s+/g, ' ').trim() : null;

  // Spell Resistance
  const srM = effectText.match(/Spell Resistance\s+(.+?)$/ms);
  const spell_resistance = srM ? srM[1].replace(/\s+/g, ' ').trim() : null;

  // Description text
  const descTextMatch = descSection.match(/DESCRIPTION\s*\n([\s\S]+?)(?:^---$|\n---\n|$)/m);
  const description = descTextMatch ? descTextMatch[1].trim() : null;

  return {
    id,
    name,
    school,
    subschool,
    descriptor,
    level: levelVal,
    type: typeVal,
    class_lists: classListsStr || null,
    casting_time,
    range,
    target,
    area,
    effect,
    duration,
    saving_throw,
    spell_resistance,
    description,
    material,
    arcane_focus,
    divine_focus,
    costly_components,
  };
}

function generateInsertBatch(spells: SpellRecord[]): string {
  const cols = [
    'id', 'name', 'school', 'subschool', 'descriptor', 'level', 'type',
    'class_lists', 'casting_time', 'range', 'target', 'area', 'effect', 'duration',
    'saving_throw', 'spell_resistance', 'description', 'material', 'arcane_focus',
    'divine_focus', 'costly_components'
  ];

  const rows = spells.map(s => {
    const vals = [
      escSql(s.id),
      escSql(s.name),
      escSql(s.school),
      escSql(s.subschool),
      escSql(s.descriptor),
      s.level.toString(),
      escSql(s.type),
      escSql(s.class_lists),
      escSql(s.casting_time),
      escSql(s.range),
      escSql(s.target),
      escSql(s.area),
      escSql(s.effect),
      escSql(s.duration),
      escSql(s.saving_throw),
      escSql(s.spell_resistance),
      escSql(s.description),
      escSql(s.material),
      escSql(s.arcane_focus),
      s.divine_focus ? 'true' : 'false',
      s.costly_components ? 'true' : 'false',
    ];
    return `  (${vals.join(', ')})`;
  }).join(',\n');

  const updateCols = cols.filter(c => c !== 'id').map(c => `${c} = EXCLUDED.${c}`).join(',\n    ');

  return `INSERT INTO spells (${cols.join(', ')})\nVALUES\n${rows}\nON CONFLICT (id) DO UPDATE SET\n    ${updateCols};`;
}

async function main() {
  const mdPath = path.join(__dirname, '..', 'docs', 'SPELL_LIST_EXTENDED.md');
  const content = fs.readFileSync(mdPath, 'utf-8');

  // Split by "\n## " to get individual spell blocks
  const rawBlocks = content.split(/\n## /);
  // First block is the header, skip it
  const spellBlocks = rawBlocks.slice(1);

  const spells: SpellRecord[] = [];
  const failed: string[] = [];

  for (const block of spellBlocks) {
    const spell = parseSpellBlock(block);
    if (spell && spell.school) {
      spells.push(spell);
    } else {
      const nameLine = block.split('\n')[0].trim();
      failed.push(nameLine);
    }
  }

  console.log(`Parsed ${spells.length} spells successfully`);
  if (failed.length > 0) {
    console.log(`Failed to parse ${failed.length} spells:`);
    failed.slice(0, 20).forEach(n => console.log('  -', n));
    if (failed.length > 20) console.log(`  ... and ${failed.length - 20} more`);
  }

  // Deduplicate by id, keeping first occurrence 
  const seen = new Set<string>();
  const uniqueSpells = spells.filter(s => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
  console.log(`After dedup:
  ${uniqueSpells.length} unique spells (removed  
  ${spells.length - uniqueSpells.length}
  duplicates)`);

  // Generate SQL in batches of 500
  const BATCH_SIZE = 500;
  const batches: SpellRecord[][] = [];
  for (let i = 0; i < uniqueSpells.length; i += BATCH_SIZE) {
    batches.push(uniqueSpells.slice(i, i + BATCH_SIZE));
  }

  if (batches.length === 1) {
    const sqlPath = path.join(__dirname, 'spells-seed-full.sql');
    fs.writeFileSync(sqlPath, generateInsertBatch(batches[0]), 'utf-8');
    console.log(`SQL written to scripts/spells-seed-full.sql`);
  } else {
    for (let i = 0; i < batches.length; i++) {
      const sqlPath = path.join(__dirname, `spells-seed-full-${i + 1}.sql`);
      fs.writeFileSync(sqlPath, generateInsertBatch(batches[i]), 'utf-8');
      console.log(`SQL batch ${i + 1}/${batches.length} written to scripts/spells-seed-full-${i + 1}.sql`);
    }
  }

  console.log(`\nDone! ${spells.length} spells → ${batches.length} SQL file(s)`);
}

main().catch(console.error);
