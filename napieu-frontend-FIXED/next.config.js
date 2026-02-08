/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',       // enables static HTML export
  trailingSlash: true,    // ensures folder/index.html structure for Netlify
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
};

export default nextConfig;
