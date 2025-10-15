import { writeFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'out');

async function ensureNoJekyll() {
  try {
    // Ensure out directory exists (export should have created it already)
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, '.nojekyll'), '');
    console.log('Created out/.nojekyll');
  } catch (err) {
    console.error('Failed to create .nojekyll:', err);
    process.exitCode = 1;
  }
}

ensureNoJekyll();
