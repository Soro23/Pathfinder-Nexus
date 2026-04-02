-- NPCs table
CREATE TABLE IF NOT EXISTS npcs (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  cr              NUMERIC NOT NULL,
  xp              INTEGER,
  race            TEXT,
  classes         TEXT,
  alignment       TEXT,
  size            TEXT,
  creature_type   TEXT,
  init            INTEGER DEFAULT 0,
  aura            TEXT,
  description     TEXT,
  senses          JSONB DEFAULT '{}',
  defense         JSONB DEFAULT '{}',
  offense         JSONB DEFAULT '{}',
  statistics      JSONB DEFAULT '{}',
  gear            TEXT[] DEFAULT '{}'
);

-- Example insert (Dwarf Warpriest CR 25)
-- INSERT INTO npcs (id, name, cr, xp, race, classes, alignment, size, creature_type, init, aura, description, senses, defense, offense, statistics, gear)
-- VALUES (
--   'dwarf-warpriest-15',
--   'Dwarf Warpriest 15',
--   25,
--   NULL,
--   'Dwarf',
--   'warpriest 15 (forgepriest)/furious guardian 5/champion 10',
--   'LG',
--   'Medium',
--   'humanoid (dwarf)',
--   14,
--   'Good',
--   '',
--   '{"darkvision": "60 ft.", "perception": "+29/+31"}',
--   '{"ac": 36, "touch_ac": 17, "flat_footed_ac": 34, "ac_details": "+14 armor, +5 deflection, +2 Dex, +5 natural; +4 dodge vs. giants", "hp": 307, "hp_formula": "15d8+5d10+160+50", "fort": 24, "ref": 17, "will": 23, "save_notes": "+2 racial vs. poison/spells/SLAs; +2 sacred vs. fear/emotion/charm/death", "defensive_abilities": "armor of earth, force of will, guarded thoughts, hard to kill, immortal, mythic saves, recuperation, sacred armor +3, to the death, unstoppable", "dr": "3/—", "resistances": "fire 10"}',
--   '{"speed": "20 ft.", "melee": "+5 hearthhammer +32/+27/+22/+17 (1d10+16, x3)", "ranged": "+4 reliable sonic boom musket +24 (1d8+4+1d6 sonic, x4)", "special_attacks": "backlash, blowback, burst through, flash of rage, juggernaut, legendary champion, mythic power 24/day, mythic rage, priceless blade (minor blessing), rage 26/day, sacred weapon +3 (2d6), sudden attack, surge +1d12, titan''s rage, unstoppable shot", "spell_like_abilities": "5/day—dimension door (60 ft.) (CL 20th)", "spells_prepared": "5th: ancestral memory, dispel evil, fabricate, righteous might; 4th: blessing of fervor, divine power, forceful strike, holy smite, warp metal; 3rd: badger''s ferocity, deadly juggernaut, keen edge, storm of blades, titanic anchoring, versatile weapon, wrathful mantle; 2nd: bear''s endurance, blessing of courage and life, heat metal, instant armor, spear of purity, shatter, stalwart resolve; 1st: burning disarm, detect evil, divine favor, jury-rig, magic weapon, protection from evil, weapons against evil; 0: detect magic, guidance, light, mending, resistance"}',
--   '{"str": 25, "dex": 18, "con": 26, "int": 18, "wis": 24, "cha": 18, "bab": 16, "cmb": 23, "cmd": 37, "cmd_notes": "41 vs. bull rush or trip on solid ground", "traits": "Faith in the One, Zest for Battle", "feats": "Blessed Hammer, Cleave, Cleave Through, Companion Figurine, Craft Magic Arms and Armor, EWP (firearms), Extra Rage, Flickering Step, Furious Spell, Great Cleave, Greater Weapon Focus (warhammer), Power Attack, Summon Guardian Spirit, Toughness, Weapon Focus (warhammer), Weapon Specialization (warhammer)", "skills_list": "Craft (jewelry) +46, Handle Animal +10, Intimidate +27, Knowledge (nobility) +11, Knowledge (planes) +24, Perception +29/+31, Sense Motive +28, Use Magic Device +27", "languages": "Celestial, Common, Dwarven, Elven, Sylvan", "sq": "adaptable guardian, blessings 15/day (Earth/Metal), chosen ally +2, creator''s bond, craftsman, fervor 14/day (5d6), forge mastery, formal training, industrious urbanite, legendary hero, mule''s strength, stonecunning"}',
--   ARRAY[
--     'amulet of natural armor +5 (50,000 gp)',
--     'anvil of the skyseeker (6,700 gp)',
--     'belt of physical perfection +6 (144,000 gp)',
--     'earthquake boots (67,500 gp)',
--     '+5 crusading denying adamantine full plate (116,500 gp)',
--     'cloak of quick reflexes +4/+5 (24,000 gp)',
--     '+5 hearthhammer (62,000 gp)',
--     '+4 reliable sonic boom musket (130,200 gp)',
--     'headband of mental superiority +6 (144,000 gp)',
--     'helm of fearsome mien (5,000 gp)',
--     'ring of protection +5 (50,000 gp)',
--     'rod of metal and mineral detection (10,500 gp)',
--     'set of 6 righteous medals (36,000 gp)',
--     'warpriest''s kit (16 gp)'
--   ]
-- );
