/**
 * Custom Authentication API
 * 
 * Handles custom email/password authentication via Supabase
 * Includes user whitelist check (no new user creation)
 * 
 * Reviewed by: Lieutenant Worf (Security) & Commander Data (Implementation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

// User whitelist (authorized emails)
// In production, this should be stored in Supabase and checked via RLS
const AUTHORIZED_USERS = process.env.AUTHORIZED_USERS?.split(',') || [];

async function checkUserWhitelist(email: string): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('⚠️  Supabase not configured, using environment whitelist');
    return AUTHORIZED_USERS.includes(email.toLowerCase());
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Check if user exists in authorized_users table (if it exists)
    const { data, error } = await supabase
      .from('authorized_users')
      .select('email')
      .eq('email', email.toLowerCase())
      .eq('active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking whitelist:', error);
      // Fallback to environment variable whitelist
      return AUTHORIZED_USERS.includes(email.toLowerCase());
    }

    // If user found in database, they're authorized
    if (data) {
      return true;
    }

    // Fallback to environment variable whitelist
    return AUTHORIZED_USERS.includes(email.toLowerCase());
  } catch (error) {
    console.error('Whitelist check failed:', error);
    // Fallback to environment variable whitelist
    return AUTHORIZED_USERS.includes(email.toLowerCase());
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check user whitelist (no new user creation)
    const isAuthorized = await checkUserWhitelist(email);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Access denied. This account is not authorized.' },
        { status: 403 }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        { error: 'Authentication service not configured' },
        { status: 500 }
      );
    }

    // Authenticate with Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Return success (session will be handled by NextAuth or custom session management)
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: data.session,
    });
  } catch (error: any) {
    console.error('Custom sign in error:', error);
    return NextResponse.json(
      { error: 'An error occurred during authentication' },
      { status: 500 }
    );
  }
}

