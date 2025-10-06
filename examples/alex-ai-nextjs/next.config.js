/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      root: __dirname, // Explicitly set the root directory
    },
  },
  // Disable strict mode to avoid React 18 warnings
  reactStrictMode: false,
  // Enable SWC minification
  swcMinify: true,
  // Optimize for development
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig


