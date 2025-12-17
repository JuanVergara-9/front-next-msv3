/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    viewTransition: true,
  },
};

module.exports = nextConfig;
