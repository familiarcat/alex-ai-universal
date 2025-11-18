"use client";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alex AI Universal - Sign In Page (Redesigned)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Team Alpha: Lieutenant Worf (Security) + Counselor Troi (UX)
// Supports: Custom Auth (Supabase) + Google OAuth (Optional)
// Security: User whitelist, no new user creation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import Link from "next/link";

export default function SignIn() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const error = searchParams?.get("error");
  
  // Form state for custom auth
  // ⚠️ SECURITY: Auto-fill only in development (Worf's Security Violation #DEV-001)
  const isDevelopment = process.env.NODE_ENV === "development" || 
                        process.env.NEXT_PUBLIC_ENV === "development" ||
                        window.location.hostname === "localhost";
  
  const [email, setEmail] = useState(isDevelopment ? "admin@alex-ai.local" : "");
  const [password, setPassword] = useState(isDevelopment ? "admin" : "");
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"custom" | "google" | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check if Google OAuth is available
  const googleOAuthAvailable = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true";

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    setAuthMethod("google");
    
    try {
      await signIn("google", {
        callbackUrl,
        redirect: true,
      });
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setAuthError("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCustomSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    setAuthMethod("custom");

    try {
      // Call custom auth API
      const response = await fetch("/api/auth/custom-signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // If successful, redirect to dashboard
      router.push(callbackUrl);
    } catch (err: any) {
      console.error("Custom sign in error:", err);
      setAuthError(err.message || "Invalid email or password. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: 'var(--spacing-md)'
    }}>
      <div style={{
        maxWidth: '448px',
        width: '100%'
      }}>
        {/* Back to Landing */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-lg)',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: 'var(--font-sm)',
            transition: 'color var(--transition-base)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          ← Back to Home
        </Link>

        <div style={{
          background: 'var(--card)',
          border: 'var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-xl)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <div style={{
              fontSize: 'var(--font-3xl)',
              marginBottom: 'var(--spacing-md)'
            }}>
              <Icon size="2xl">🖖</Icon>
            </div>
            <h1 style={{
              fontSize: 'var(--font-2xl)',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 'var(--spacing-sm)'
            }}>
              Alex AI Universal
            </h1>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: 'var(--font-md)'
            }}>
              Sign in to access your dashboard
            </p>
          </div>

          {/* Security Warning - Development Auto-Fill (Worf's Security Violation #DEV-001) */}
          {isDevelopment && (
            <div style={{
              marginBottom: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--spacing-sm)'
              }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <p style={{
                    color: '#f59e0b',
                    fontSize: 'var(--font-sm)',
                    fontWeight: 600,
                    margin: 0,
                    marginBottom: '4px'
                  }}>
                    🛡️ Lieutenant Worf - Security Violation #DEV-001
                  </p>
                  <p style={{
                    color: 'rgba(251, 191, 36, 0.9)',
                    fontSize: 'var(--font-xs)',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    <strong>DEVELOPMENT ONLY:</strong> Credentials are auto-filled for convenience. 
                    This is a security violation and MUST be disabled before production deployment. 
                    Status: PENDING PRODUCTION SECURITY REVIEW.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {(error || authError) && (
            <div style={{
              marginBottom: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)'
            }}>
              <p style={{
                color: '#dc2626',
                fontSize: 'var(--font-sm)',
                margin: 0
              }}>
                {authError || (error === "CredentialsSignin"
                  ? "Invalid credentials. Please check your email and password."
                  : error === "OAuthSignin"
                  ? "Error connecting to authentication provider"
                  : error === "OAuthCallback"
                  ? "Error during authentication"
                  : error === "OAuthAccountNotLinked"
                  ? "Account not authorized. Please contact your administrator."
                  : error === "SessionRequired"
                  ? "Please sign in to continue"
                  : "Authentication error. Please try again.")}
              </p>
            </div>
          )}

          {/* Custom Auth Form */}
          <form onSubmit={handleCustomSignIn} style={{
            marginBottom: googleOAuthAvailable ? 'var(--spacing-lg)' : '0'
          }}>
            <div style={{
              marginBottom: 'var(--spacing-md)'
            }}>
              <label htmlFor="email" style={{
                display: 'block',
                marginBottom: 'var(--spacing-xs)',
                fontSize: 'var(--font-sm)',
                fontWeight: 600,
                color: 'var(--text)'
              }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: 'var(--card-alt)',
                  border: 'var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text)',
                  fontSize: 'var(--font-md)',
                  minHeight: '44px',
                  boxSizing: 'border-box'
                }}
                placeholder="admin@alex-ai.local"
              />
            </div>

            <div style={{
              marginBottom: 'var(--spacing-lg)'
            }}>
              <label htmlFor="password" style={{
                display: 'block',
                marginBottom: 'var(--spacing-xs)',
                fontSize: 'var(--font-sm)',
                fontWeight: 600,
                color: 'var(--text)'
              }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  background: 'var(--card-alt)',
                  border: 'var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text)',
                  fontSize: 'var(--font-md)',
                  minHeight: '44px',
                  boxSizing: 'border-box'
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading && authMethod === "custom"}
              style={{
                width: '100%',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                background: isLoading && authMethod === "custom" ? 'var(--card-alt)' : 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontWeight: 600,
                color: isLoading && authMethod === "custom" ? 'var(--text-muted)' : '#ffffff',
                cursor: isLoading && authMethod === "custom" ? 'not-allowed' : 'pointer',
                opacity: isLoading && authMethod === "custom" ? 0.5 : 1,
                minHeight: '44px',
                fontSize: 'var(--font-md)',
                transition: 'all var(--transition-base)'
              }}
            >
              {isLoading && authMethod === "custom" ? (
                <div style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider (if Google OAuth available) */}
          {googleOAuthAvailable && (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: 'var(--spacing-lg) 0',
                gap: 'var(--spacing-md)'
              }}>
                <div style={{
                  flex: 1,
                  height: '1px',
                  background: 'var(--border)'
                }} />
                <span style={{
                  fontSize: 'var(--font-sm)',
                  color: 'var(--text-muted)'
                }}>
                  OR
                </span>
                <div style={{
                  flex: 1,
                  height: '1px',
                  background: 'var(--border)'
                }} />
              </div>

              {/* Google OAuth Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading && authMethod === "google"}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--spacing-md)',
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  background: isLoading && authMethod === "google" ? 'var(--card-alt)' : 'var(--card)',
                  border: 'var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: 600,
                  color: 'var(--text)',
                  cursor: isLoading && authMethod === "google" ? 'not-allowed' : 'pointer',
                  opacity: isLoading && authMethod === "google" ? 0.5 : 1,
                  minHeight: '44px',
                  transition: 'all var(--transition-base)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading || authMethod !== "google") {
                    e.currentTarget.style.background = 'var(--card-alt)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading || authMethod !== "google") {
                    e.currentTarget.style.background = 'var(--card)';
                  }
                }}
              >
                {isLoading && authMethod === "google" ? (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '3px solid var(--text-muted)',
                    borderTopColor: 'var(--accent)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <>
                    <Icon size="md">
                      <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%' }}>
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </Icon>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Security Notice */}
          <div style={{
            marginTop: 'var(--spacing-xl)',
            paddingTop: 'var(--spacing-lg)',
            borderTop: 'var(--border)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--spacing-sm)'
            }}>
              <Icon size="md" ariaLabel="Security">
                🔒
              </Icon>
              <p style={{
                fontSize: 'var(--font-sm)',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                margin: 0
              }}>
                <strong style={{ color: 'var(--text)' }}>Secured by Lieutenant Worf.</strong>
                <br />
                Your authentication is protected. Access is restricted to authorized users only.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          marginTop: 'var(--spacing-lg)',
          fontSize: 'var(--font-sm)',
          color: 'var(--text-muted)'
        }}>
          By signing in, you agree to our{" "}
          <Link href="/terms" style={{
            color: 'var(--accent)',
            textDecoration: 'none'
          }}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" style={{
            color: 'var(--accent)',
            textDecoration: 'none'
          }}>
            Privacy Policy
          </Link>
        </p>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
