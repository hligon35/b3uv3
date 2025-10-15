import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const ghpages = require('gh-pages');

const outDir = join(process.cwd(), 'out');

ghpages.publish(
  outDir,
  {
    branch: 'gh-pages',
    message: 'Deploy to GitHub Pages',
    dotfiles: true, // include .nojekyll
    history: false,
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
