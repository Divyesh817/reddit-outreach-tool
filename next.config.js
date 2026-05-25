/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['snoowrap'],
  },
}

module.exports = nextConfig
