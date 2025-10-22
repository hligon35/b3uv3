import { writeFile, mkdir, readFile, access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'out');
const customDomain = process.env.CUSTOM_DOMAIN;

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

async function ensureCNAME() {
  // Prefer a committed CNAME file at repo root, else use CUSTOM_DOMAIN env if provided
  const rootCnamePath = join(process.cwd(), 'CNAME');
  const outCnamePath = join(outDir, 'CNAME');
  try {
    await access(rootCnamePath, fsConstants.F_OK);
    const content = (await readFile(rootCnamePath, 'utf8')).trim();
    if (content) {
      await writeFile(outCnamePath, content, 'utf8');
      console.log(`Copied CNAME from repo root to out/: ${content}`);
      return;
    }
  } catch {}

  if (customDomain) {
    try {
      await writeFile(outCnamePath, String(customDomain).trim(), 'utf8');
      console.log(`Wrote out/CNAME for domain from env: ${customDomain}`);
      return;
    } catch (err) {
      console.error('Failed to write CNAME from env:', err);
      process.exitCode = 1;
    }
  }
  console.log('No CNAME found in repo root and CUSTOM_DOMAIN not set; skipping CNAME generation.');
}

await ensureNoJekyll();
await ensureCNAME();
