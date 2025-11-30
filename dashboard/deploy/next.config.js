/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    N8N_BASE_URL: process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com',
    N8N_API_KEY: process.env.N8N_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/alex-ai/:path*',
        destination: 'https://n8n.pbradygeorgen.com/api/v1/:path*',
      },
    ];
  },
  // AWS deployment optimizations
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
  // Enable static optimization for AWS
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;