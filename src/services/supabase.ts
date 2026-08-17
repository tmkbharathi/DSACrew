import { createClient } from '@supabase/supabase-js';

// Read Supabase environment variables from Vite environment or process
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * SQL Schema script to run in Supabase SQL Editor if creating a Supabase backend:
 * 
 * CREATE TABLE rooms (
 *   id TEXT PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   code TEXT UNIQUE NOT NULL,
 *   description TEXT,
 *   creator_id TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   target_daily_goal INT DEFAULT 1,
 *   data JSONB NOT NULL
 * );
 * 
 * CREATE TABLE notifications (
 *   id TEXT PRIMARY KEY,
 *   room_id TEXT NOT NULL,
 *   data JSONB NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
 * ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
 */
