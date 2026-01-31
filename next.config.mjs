/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  // If serving under https://<user>.github.io/b3uv3 (no custom domain), use basePath.
  // If using a custom domain, ensure GITHUB_PAGES is not set so these are empty.
  basePath: '/b3uv3',
  assetPrefix: '/b3uv3/',
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
