import { writeFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
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
  if (!customDomain) return;
  try {
    await writeFile(join(outDir, 'CNAME'), String(customDomain).trim());
    console.log(`Wrote out/CNAME for domain: ${customDomain}`);
  } catch (err) {
    console.error('Failed to write CNAME:', err);
    process.exitCode = 1;
  }
}

await ensureNoJekyll();
await ensureCNAME();
