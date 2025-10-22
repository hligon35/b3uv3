import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const ghpages = require('gh-pages');

const outDir = join(process.cwd(), 'out');
const repoEnv = process.env.GITHUB_REPOSITORY; // e.g. "owner/repo" in GitHub Actions
const repoUrl = repoEnv ? `https://github.com/${repoEnv}.git` : undefined;

// Default author to satisfy git identity on CI runners
const defaultUser = {
  name: process.env.GIT_AUTHOR_NAME || 'github-actions[bot]',
  email: process.env.GIT_AUTHOR_EMAIL || 'github-actions[bot]@users.noreply.github.com',
};

// Optional: set CUSTOM_DOMAIN to automatically create a CNAME file on the gh-pages branch
const customDomain = process.env.CUSTOM_DOMAIN;

ghpages.publish(
  outDir,
  {
    branch: 'gh-pages',
    message: 'Deploy to GitHub Pages',
    dotfiles: true, // include .nojekyll
    history: false,
    user: defaultUser,
    ...(customDomain ? { cname: customDomain } : {}),
    // If running in GitHub Actions, set repo explicitly (auth comes from checkout credentials)
    ...(repoUrl ? { repo: repoUrl } : {}),
  },
  (err) => {
    if (err) {
      console.error('Failed to publish to gh-pages:', err);
      process.exit(1);
    } else {
      console.log('Published to gh-pages branch successfully.');
    }
  }
);
