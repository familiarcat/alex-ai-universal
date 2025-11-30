# Environment Variables Setup

Copy this template to create your `.env.local` file:

\`\`\`bash
# NextAuth.js (Required)
NEXTAUTH_SECRET=your-secret-key-here  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n (Required for Crew)
N8N_BASE_URL=https://n8n.pbradygeorgen.com
N8N_API_KEY=your-n8n-api-key

# Sentry (Optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_DSN=your-sentry-dsn
\`\`\`

See [WHEN_YOU_WAKE_UP.md](../WHEN_YOU_WAKE_UP.md) for detailed setup instructions.
