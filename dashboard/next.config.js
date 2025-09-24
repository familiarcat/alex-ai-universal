/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development configuration - no static export
  env: {
    N8N_API_URL: process.env.N8N_API_URL || 'https://n8n.pbradygeorgen.com/api/v1',
    N8N_API_KEY: process.env.N8N_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
  // Development optimizations
  images: {
    unoptimized: true
  },
  // Enable API routes for development
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable static export for development
  experimental: {
    outputFileTracingRoot: undefined,
  }
};

module.exports = nextConfig;
