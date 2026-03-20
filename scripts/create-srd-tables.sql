-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ability TEXT NOT NULL,
  is_class_skill BOOLEAN DEFAULT false,
  has_armor_check_penalty BOOLEAN DEFAULT false,
  description TEXT
);

-- Feats
CREATE TABLE IF NOT EXISTS feats (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  prerequisite TEXT,
  benefit TEXT NOT NULL,
  normal TEXT,
  special TEXT,
  effects JSONB
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  hit_die INTEGER NOT NULL,
  base_attack_bonus TEXT NOT NULL,
  fortitude_save TEXT NOT NULL,
  reflex_save TEXT NOT NULL,
  will_save TEXT NOT NULL,
  skill_points_per_level INTEGER NOT NULL,
  class_skills JSONB,
  features JSONB,
  alignment JSONB,
  description TEXT,
  magic_type TEXT,
  caster_ability TEXT,
  starting_gold_dice TEXT,
  spells_per_day JSONB
);

-- Races
CREATE TABLE IF NOT EXISTS races (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  size TEXT NOT NULL,
  speed INTEGER NOT NULL,
  bonuses JSONB,
  bonus_desc TEXT,
  favored_class TEXT,
  traits JSONB,
  subraces JSONB,
  desc TEXT
);

-- Enable RLS (optional — adjust policies as needed)
-- ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "read all" ON skills FOR SELECT USING (true);
-- ALTER TABLE feats ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "read all" ON feats FOR SELECT USING (true);
-- ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "read all" ON classes FOR SELECT USING (true);
-- ALTER TABLE races ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "read all" ON races FOR SELECT USING (true);
