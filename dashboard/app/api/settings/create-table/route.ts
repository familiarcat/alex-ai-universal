/**
 * Create user_settings table in Supabase
 * 
 * One-time setup endpoint to create the table if it doesn't exist
 * 
 * Crew: Data (Database) + La Forge (Infrastructure)
 * 
 * ⚠️  SECURITY: This should be protected in production
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({
      error: 'Supabase not configured',
      hasUrl: !!SUPABASE_URL,
      hasServiceKey: !!SUPABASE_SERVICE_KEY
    }, { status: 400 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Create table SQL (from migration 002)
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id TEXT PRIMARY KEY DEFAULT 'default',
        global_theme TEXT DEFAULT 'midnight',
        preferences JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT valid_user_id CHECK (length(user_id) > 0),
        CONSTRAINT valid_theme CHECK (length(global_theme) > 0)
      );

      -- Enable RLS
      ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

      -- Create policies if they don't exist
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Public can read user settings'
        ) THEN
          CREATE POLICY "Public can read user settings"
            ON user_settings FOR SELECT USING (true);
        END IF;
      END $$;

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Public can upsert user settings'
        ) THEN
          CREATE POLICY "Public can upsert user settings"
            ON user_settings FOR INSERT WITH CHECK (true);
        END IF;
      END $$;

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Public can update user settings'
        ) THEN
          CREATE POLICY "Public can update user settings"
            ON user_settings FOR UPDATE USING (true) WITH CHECK (true);
        END IF;
      END $$;

      -- Create trigger function if it doesn't exist
      CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create trigger if it doesn't exist
      DROP TRIGGER IF EXISTS update_user_settings_timestamp ON user_settings;
      CREATE TRIGGER update_user_settings_timestamp
        BEFORE UPDATE ON user_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_user_settings_updated_at();

      -- Insert default settings if they don't exist
      INSERT INTO user_settings (user_id, global_theme, preferences)
      VALUES ('default', 'midnight', '{}'::jsonb)
      ON CONFLICT (user_id) DO NOTHING;
    `;

    // Execute via RPC (Supabase doesn't support direct SQL execution via client)
    // Instead, we'll use the REST API to run raw SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL }).catch(async () => {
      // RPC might not exist, try direct query approach
      // Since we can't execute DDL via the client, we'll just verify the table exists
      const { data: checkData, error: checkError } = await supabase
        .from('user_settings')
        .select('user_id')
        .limit(1);
      
      if (checkError && checkError.code === '42P01') {
        return { data: null, error: { message: 'Table does not exist. Please run the migration manually via Supabase dashboard or CLI.' } };
      }
      return { data: checkData, error: checkError };
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create table',
        message: error.message,
        hint: 'Please run the migration manually: supabase/migrations/002_create_user_settings_table.sql'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Table created or already exists',
      note: 'If table creation failed, run the migration manually via Supabase dashboard'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create table',
      message: error.message,
      hint: 'Please run the migration manually via Supabase dashboard or CLI'
    }, { status: 500 });
  }
}

