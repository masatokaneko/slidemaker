/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['vercel.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig 