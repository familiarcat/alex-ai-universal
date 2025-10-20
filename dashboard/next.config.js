/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for deployment (commented out for dev)
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
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