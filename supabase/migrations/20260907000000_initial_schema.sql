-- Migration: Initial Schema for Gratitude Journal
CREATE TABLE IF NOT EXISTS diaries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  sticker TEXT NOT NULL,
  gratitude_items JSONB DEFAULT '[]'::jsonb,
  content TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  linked_bucket_id TEXT,
  linked_bucket_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bucket_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  target_date TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  end_time TEXT,
  location TEXT,
  description TEXT,
  color TEXT DEFAULT '#E07A5F',
  is_completed BOOLEAN DEFAULT FALSE,
  is_google_synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY  Allow public read-write for diaries ON diaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY Allow public read-write for bucket_items ON bucket_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY Allow public read-write for events ON events FOR ALL USING (true) WITH CHECK (true);
