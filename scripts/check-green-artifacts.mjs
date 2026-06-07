import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const artDir = join(root, 'src', 'assets', 'art');
const maxGreenRatio = 0.0025;
const failures = [];

for (const filePath of walk(artDir)) {
  if (!filePath.endsWith('.png') && !filePath.endsWith('.webp')) continue;
  const { data } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let opaque = 0;
  let brightGreen = 0;

  for (let offset = 0; offset < data.length; offset += 4) {
    const alpha = data[offset + 3];
    if (alpha <= 28) continue;
    opaque += 1;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    if (green > 190 && red < 80 && blue < 80 && green > red * 1.7 && green > blue * 1.7) {
      brightGreen += 1;
    }
  }

  const ratio = opaque === 0 ? 0 : brightGreen / opaque;
  if (ratio > maxGreenRatio) {
    failures.push(`${filePath} has ${(ratio * 100).toFixed(2)}% bright-green pixels`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Art asset green-screen check passed.');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
