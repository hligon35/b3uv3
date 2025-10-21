import { resolve } from 'node:path';
import { Jimp } from 'jimp';
import jsQR from 'jsqr';

async function decode(filePath) {
  const abs = resolve(filePath);
  const image = await Jimp.read(abs);
  // Try original
  let { data, width, height } = image.bitmap;
  let result = jsQR(new Uint8ClampedArray(data.buffer), width, height);
  if (result?.data) return result.data;

  // Try grayscale
  const gray = image.clone().grayscale();
  ({ data, width, height } = gray.bitmap);
  result = jsQR(new Uint8ClampedArray(data.buffer), width, height);
  if (result?.data) return result.data;

  // Try inverted
  const inverted = image.clone().invert();
  ({ data, width, height } = inverted.bitmap);
  result = jsQR(new Uint8ClampedArray(data.buffer), width, height);
  return result?.data || null;
}

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('Usage: node scripts/decode-qr.mjs <image1> <image2> ...');
    process.exit(1);
  }
  for (const f of files) {
    try {
      const result = await decode(f);
      console.log(`${f}: ${result}`);
    } catch (e) {
      console.error(`${f}: Failed to decode -`, e?.message || e);
    }
  }
}

main();
