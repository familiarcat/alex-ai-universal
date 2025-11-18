"use client";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alex AI Universal - Sign In Page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Team Alpha: Lieutenant Worf (Security) + Counselor Troi (UX)
// Universal Styling: Counselor Troi's UX Memories Applied
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const error = searchParams?.get("error");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl,
        redirect: true,
      });
    } catch (err) {
      console.error("Sign in error:", err);
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

          {/* Error Display */}
          {error && (
            <div style={{
              marginBottom: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)'
            }}>
              <p style={{
                color: '#dc2626',
                fontSize: 'var(--font-sm)'
              }}>
                {error === "OAuthSignin"
                  ? "Error connecting to authentication provider"
                  : error === "OAuthCallback"
                  ? "Error during authentication"
                  : error === "OAuthCreateAccount"
                  ? "Could not create account"
                  : error === "EmailCreateAccount"
                  ? "Could not create email account"
                  : error === "Callback"
                  ? "Authentication callback error"
                  : error === "OAuthAccountNotLinked"
                  ? "Account already exists with different provider"
                  : error === "EmailSignin"
                  ? "Email sign in error"
                  : error === "CredentialsSignin"
                  ? "Invalid credentials"
                  : error === "SessionRequired"
                  ? "Please sign in to continue"
                  : "Authentication error. Please try again."}
              </p>
            </div>
          )}

          {/* Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-md)',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              background: isLoading ? 'var(--card-alt)' : 'var(--card)',
              border: 'var(--border)',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 600,
              color: 'var(--text)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              boxShadow: 'var(--shadow-md)',
              transition: 'all var(--transition-base)',
              minHeight: '44px' // Touch target (Dr. Crusher's recommendation)
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'var(--card-alt)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'var(--card)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }
            }}
          >
            {isLoading ? (
              <div style={{
                width: 'var(--icon-md)',
                height: 'var(--icon-md)',
                border: '3px solid var(--text-muted)',
                borderTopColor: 'var(--accent)',
                borderRadius: 'var(--radius-full)',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <>
                <Icon size="md">
                  <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%' }}>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                  <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                </Icon>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

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
                lineHeight: 1.6
              }}>
                <strong style={{ color: 'var(--text)' }}>Secured by Lieutenant Worf.</strong>
                <br />
                Your authentication is protected with NextAuth.js and Google OAuth.
                We never store your password.
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
          <a href="/terms" style={{
            color: 'var(--accent)',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" style={{
            color: 'var(--accent)',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}>
            Privacy Policy
          </a>
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

