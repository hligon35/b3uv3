/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
// When deploying to GitHub Pages under a repository path (no custom domain),
// set GITHUB_PAGES=true to prefix routes and assets with "/b3uv3".
// For a custom domain, leave GITHUB_PAGES unset or "false" so basePath is empty.
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  reactStrictMode: true,
  // Export a fully static site only for GitHub Pages
  ...(isProd && isGithubPages ? { output: 'export' } : {}),
  // If serving under https://<user>.github.io/b3uv3 (no custom domain), use basePath.
  // If using a custom domain, ensure GITHUB_PAGES is not set so these are empty.
  basePath: isProd && isGithubPages ? '/b3uv3' : '',
  assetPrefix: isProd && isGithubPages ? '/b3uv3/' : undefined,
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
