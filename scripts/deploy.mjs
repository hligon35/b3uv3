import { createRequire } from 'node:module';
import { join } from 'node:path';
import { readFile, access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';

const require = createRequire(import.meta.url);
const ghpages = require('gh-pages');

const outDir = join(process.cwd(), 'out');
const repoEnv = process.env.GITHUB_REPOSITORY; // e.g. "owner/repo" in GitHub Actions
// Support token-based auth in non-interactive CI (GH_TOKEN or GITHUB_TOKEN)
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || undefined;
let repoUrl;
if (repoEnv) {
  if (token) {
    // Use x-access-token form so git can authenticate over HTTPS in CI
    repoUrl = `https://x-access-token:${token}@github.com/${repoEnv}.git`;
  } else {
    repoUrl = `https://github.com/${repoEnv}.git`;
  }
} else {
  repoUrl = undefined;
}

// Default author to satisfy git identity on CI runners
const defaultUser = {
  name: process.env.GIT_AUTHOR_NAME || 'github-actions[bot]',
  email: process.env.GIT_AUTHOR_EMAIL || 'github-actions[bot]@users.noreply.github.com',
};

// Optional: set CUSTOM_DOMAIN or commit a CNAME file at repo root to create a CNAME on gh-pages
let customDomain = process.env.CUSTOM_DOMAIN;
if (!customDomain) {
  const rootCnamePath = join(process.cwd(), 'CNAME');
  try {
    await access(rootCnamePath, fsConstants.F_OK);
    const content = (await readFile(rootCnamePath, 'utf8')).trim();
    if (content) customDomain = content;
  } catch {}
}

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
