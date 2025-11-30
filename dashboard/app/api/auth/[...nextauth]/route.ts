/**
 * NextAuth API Route Handler
 * 
 * Handles all NextAuth authentication routes:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/session
 * - /api/auth/callback/*
 * 
 * Reviewed by: Lieutenant Worf (Security) & Commander Data (Implementation)
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;

