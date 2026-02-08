/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',       // enables static HTML export
  trailingSlash: true,    // ensures folder/index.html structure
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,    // required for static export
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://muhammadfaizan-practice-7.onrender.com',
  },
};

export default nextConfig;