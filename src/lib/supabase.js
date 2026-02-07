import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// Database schema for reference
/*
CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plate_size TEXT NOT NULL CHECK (plate_size IN ('small', 'medium', 'large')),
  model_url TEXT,
  qr_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dishes_user_id ON dishes(user_id);

-- Enable Row Level Security
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own dishes
CREATE POLICY "Users can view own dishes"
  ON dishes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dishes"
  ON dishes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dishes"
  ON dishes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dishes"
  ON dishes FOR DELETE
  USING (auth.uid() = user_id);
*/
