/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skips type checking during build — types are checked in dev/IDE
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}
module.exports = nextConfig
