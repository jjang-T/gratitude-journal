import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseSettings } from '../types';

const SETTINGS_KEY = 'haru_gratitude_supabase_settings';

export function getSupabaseSettings(): SupabaseSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load Supabase settings', e);
  }
  return {
    supabaseUrl: '',
    supabaseAnonKey: '',
    syncEnabled: false,
  };
}

export function saveSupabaseSettings(settings: SupabaseSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

let cachedClient: SupabaseClient | null = null;
let lastSettingsStr = '';

export function getSupabaseClient(): SupabaseClient | null {
  const settings = getSupabaseSettings();
  if (!settings.syncEnabled || !settings.supabaseUrl || !settings.supabaseAnonKey) {
    return null;
  }
  const currentStr = `${settings.supabaseUrl}_${settings.supabaseAnonKey}`;
  if (cachedClient && lastSettingsStr === currentStr) {
    return cachedClient;
  }
  try {
    cachedClient = createClient(settings.supabaseUrl, settings.supabaseAnonKey);
    lastSettingsStr = currentStr;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  if (!url || !key) {
    return { success: false, message: 'URL과 Anon Key를 모두 입력해주세요.' };
  }
  try {
    const client = createClient(url, key);
    const { error } = await client.from('diaries').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "diaries" does not exist')) {
        return {
          success: true,
          message: '연결 성공! (단, diaries 테이블 생성이 필요합니다. 아래 SQL 스크립트를 실행해주세요.)',
        };
      }
      return { success: false, message: `연결 실패: ${error.message}` };
    }
    return { success: true, message: 'Supabase 클라우드 데이터베이스에 성공적으로 연결되었습니다!' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `연결 에러: ${message}` };
  }
}

// SQL Schema for user's Supabase dashboard
export const SUPABASE_SQL_SCHEMA = `-- 감사일기 및 버킷리스트 테이블 생성 스크립트
-- Supabase 대시보드 -> SQL Editor에 붙여넣고 Run을 눌러주세요.

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

-- RLS (Row Level Security) 설정
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for diaries" ON diaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for bucket_items" ON bucket_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for events" ON events FOR ALL USING (true) WITH CHECK (true);
`;
