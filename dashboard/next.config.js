/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  // Use separate build directories for each port to avoid conflicts
  // Standard Next.js dev respects PORT env var for distDir
  distDir: process.env.PORT ? `.next-${process.env.PORT}` : '.next',
  // Silence multi-lockfile warning by pointing tracing root to repo root
  outputFileTracingRoot: path.join(__dirname, '..'),
  // Enable static exports for deployment (commented out for dev)
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Turbopack configuration for path aliases (La Forge's recommendation for Next.js 16)
  turbopack: {
    resolveAlias: {
      '@/scripts': path.join(__dirname, '..', 'scripts'),
    },
  },
  // API routes configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
      // Back-compat for old Observation Lounge route
      {
        source: '/observation-lounge',
        destination: '/reports/observation-lounge'
      },
      // Unified bridge routes to themed services
      {
        source: '/bridge/gallery/:path*',
        destination: 'http://localhost:3010/:path*'
      },
      {
        source: '/bridge/quiz/:path*',
        destination: 'http://localhost:3020/:path*'
      },
      {
        source: '/bridge/wizard/:path*',
        destination: 'http://localhost:3030/:path*'
      },
      {
        source: '/bridge/control/:path*',
        destination: 'http://localhost:3001/:path*'
      },
      // Projects (proxied under one URI)
      {
        source: '/bridge/projects/alpha/:path*',
        destination: 'http://localhost:3004/:path*'
      },
      {
        source: '/bridge/projects/beta/:path*',
        destination: 'http://localhost:3002/:path*'
      },
      {
        source: '/bridge/projects/gamma/:path*',
        destination: 'http://localhost:3003/:path*'
      }
      ,
      // Temporal Wake Story Builder (external project)
      {
        source: '/bridge/projects/temporal/:path*',
        destination: 'http://localhost:3006/:path*'
      }
    ];
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    N8N_URL: process.env.N8N_URL,
    N8N_API_KEY: process.env.N8N_API_KEY,
  },
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;