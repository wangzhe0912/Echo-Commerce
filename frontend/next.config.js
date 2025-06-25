/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com', 'web-ui-tester.bj.bcebos.com'],
  },
}

module.exports = nextConfig 