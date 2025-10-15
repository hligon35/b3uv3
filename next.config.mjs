/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  // Export a fully static site (no Node.js server required)
  output: 'export',
  // Needed for GitHub Pages since it serves under /<repo> by default
  basePath: isProd ? '/b3uv3' : '',
  assetPrefix: isProd ? '/b3uv3/' : undefined,
  // Ensure /about/ maps to about/index.html for static hosting
  trailingSlash: true,
  images: {
    // Disable Next.js image optimization for static export
    unoptimized: true,
    // Keep remote domains list in case <img> or future usage references them
    domains: ["placehold.co", "picsum.photos"],
  },
};

export default nextConfig;
