/**
 * Custom Authentication API (Legacy - Redirects to NextAuth)
 * 
 * This route is kept for backward compatibility but now redirects
 * to NextAuth's credentials provider which handles Supabase auth.
 * 
 * The sign-in page should use NextAuth's signIn() function directly.
 * 
 * Reviewed by: Lieutenant Worf (Security) & Commander Data (Implementation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Use NextAuth's signIn with credentials provider
    // This will handle Supabase auth and session creation
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return NextResponse.json(
        { error: result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
    });
  } catch (error: any) {
    console.error('Custom sign in error:', error);
    return NextResponse.json(
      { error: 'An error occurred during authentication' },
      { status: 500 }
    );
  }
}

