-- Items
CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    item_type item_type_enum NOT NULL,
    subtype TEXT,
    slot TEXT,
    price_gp NUMERIC,
    weight NUMERIC,
    magical BOOLEAN DEFAULT false,
    cursed BOOLEAN DEFAULT false,
    consumable BOOLEAN DEFAULT false,
    caster_level INTEGER,
    description TEXT,
    source TEXT,
    data JSONB DEFAULT '{}'::jsonb
);
-- Item Stats
CREATE TABLE IF NOT EXISTS item_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    stat_key TEXT NOT NULL,
    stat_value NUMERIC NOT NULL,
    bonus_type TEXT,
    context TEXT
);
-- Optional indexes
CREATE INDEX IF NOT EXISTS idx_items_item_type ON items(item_type);
CREATE INDEX IF NOT EXISTS idx_items_slot ON items(slot);
CREATE INDEX IF NOT EXISTS idx_item_stats_item_id ON item_stats(item_id);
CREATE INDEX IF NOT EXISTS idx_item_stats_stat_key ON item_stats(stat_key);
-- Enable RLS (optional — adjust policies as needed)
-- ALTER TABLE items ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "read all" ON items FOR SELECT USING (true);
-- ALTER TABLE item_stats ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "read all" ON item_stats FOR SELECT USING (true);