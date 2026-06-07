import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const generatedDir = join(root, 'src', 'assets', 'generated');
const artDir = join(root, 'src', 'assets', 'art');
const legacySlicesDir = join(generatedDir, 'slices');

const jobs = [
  {
    file: 'district-sheet.png',
    columns: 2,
    rows: 3,
    outDir: join(artDir, 'districts'),
    legacyDir: legacySlicesDir,
    names: ['district-agora', 'district-archive', 'district-workshop', 'district-council', 'district-harbor', 'district-cloister'],
  },
  {
    file: 'building-sprite-sheet.png',
    columns: 3,
    rows: 4,
    outDir: join(artDir, 'buildings'),
    legacyDir: legacySlicesDir,
    names: [
      'building-temple',
      'building-library',
      'building-council',
      'building-workshop',
      'building-bell-tower',
      'building-harbor-gate',
      'building-arch',
      'building-stele',
      'building-lectern',
      'building-cloister-gate',
      'building-observatory',
      'building-bridge-shrine',
    ],
    chromaKey: true,
  },
  {
    file: 'ui-texture-sheet.png',
    columns: 3,
    rows: 3,
    outDir: join(artDir, 'textures'),
    legacyDir: legacySlicesDir,
    names: ['texture-parchment', 'texture-stone', 'texture-bronze', 'texture-seal', 'texture-map', 'texture-mosaic', 'texture-road', 'texture-divider', 'texture-vellum'],
  },
];

for (const dir of [artDir, legacySlicesDir, ...jobs.map((job) => job.outDir)]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

await sharp(join(generatedDir, 'hero-city-panorama.png')).png().toFile(join(artDir, 'hero-city-panorama.png'));

for (const job of jobs) {
  const inputPath = join(generatedDir, job.file);
  const metadata = await sharp(inputPath).metadata();
  const cellWidth = Math.floor((metadata.width ?? 0) / job.columns);
  const cellHeight = Math.floor((metadata.height ?? 0) / job.rows);

  for (let index = 0; index < job.names.length; index += 1) {
    const left = (index % job.columns) * cellWidth;
    const top = Math.floor(index / job.columns) * cellHeight;
    let item = sharp(inputPath)
      .extract({ left, top, width: cellWidth, height: cellHeight })
      .ensureAlpha();

    if (job.chromaKey) {
      item = await removeGreenScreen(item);
    }

    const output = await item.png().toBuffer();
    await sharp(output).toFile(join(job.outDir, `${job.names[index]}.png`));
    await sharp(output).toFile(join(job.legacyDir, `${job.names[index]}.png`));
  }
}

console.log(`Art assets written to ${artDir}`);

async function removeGreenScreen(image) {
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  for (let offset = 0; offset < data.length; offset += 4) {
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];

    const isGreenScreen = green > 150 && red < 95 && blue < 95 && green > red * 1.65 && green > blue * 1.65;
    const isEdgeSpill = green > 105 && green > red * 1.28 && green > blue * 1.28 && red < 145 && blue < 145;

    if (isGreenScreen) {
      data[offset + 3] = 0;
      continue;
    }

    if (isEdgeSpill) {
      const neutral = Math.max(red, blue);
      data[offset + 1] = Math.round(neutral * 0.92 + green * 0.08);
      data[offset + 3] = Math.max(0, data[offset + 3] - 42);
    }
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  }).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 3 });
}
