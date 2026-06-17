import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const artRoot = join(root, 'src', 'assets', 'art', 'optimized');
const outPath = join(artRoot, 'pages-home-hero.webp');

const width = 3200;
const height = 1600;

const scenes = [
  ['scenes/city-world-panorama.webp', 430, 112, 1740, 760, 56],
  ['scenes/council-chamber-panorama.webp', 2100, 92, 790, 360, 44],
  ['scenes/grand-library-panorama.webp', 196, 120, 620, 300, 40],
  ['scenes/action-harbor-panorama.webp', 2360, 450, 620, 300, 40],
  ['scenes/hypothesis-harbor-panorama.webp', 150, 430, 560, 290, 38],
  ['scenes/residential-quarter-panorama.webp', 2500, 790, 520, 280, 36],
  ['scenes/contemplation-garden-panorama.webp', 300, 760, 560, 290, 38],
  ['scenes/lighthouse-watchtower-panorama.webp', 1980, 820, 600, 300, 38],
  ['scenes/memory-cemetery-panorama.webp', 900, 830, 650, 300, 40],
  ['hero-city-panorama.webp', 1450, 880, 650, 300, 40],
];

const characters = [
  'characters/resident-researcher.webp',
  'characters/resident-skeptic.webp',
  'characters/resident-executor.webp',
  'characters/resident-practitioner.webp',
  'characters/resident-evidence-cartographer.webp',
  'characters/resident-boundary-skeptic.webp',
  'characters/resident-field-ethnographer.webp',
  'characters/resident-momentum-executor.webp',
  'characters/archive-keeper.webp',
  'characters/city-inspector.webp',
  'characters/systems-inspector.webp',
  'characters/report-editor.webp',
];

mkdirSync(dirname(outPath), { recursive: true });

const composites = [
  { input: Buffer.from(backgroundSvg()), left: 0, top: 0 },
];

for (const [source, left, top, cardWidth, cardHeight, radius] of scenes) {
  composites.push({
    input: await framedImage(join(artRoot, source), cardWidth, cardHeight, radius, 'cover'),
    left,
    top,
  });
}

const characterStartX = 150;
const characterTop = 1160;
const characterGap = 18;
const characterCardWidth = 230;
const characterCardHeight = 330;

for (const [index, source] of characters.entries()) {
  composites.push({
    input: await characterCard(join(artRoot, source), characterCardWidth, characterCardHeight),
    left: characterStartX + index * (characterCardWidth + characterGap),
    top: characterTop + (index % 2) * 16,
  });
}

composites.push({ input: Buffer.from(foregroundSvg()), left: 0, top: 0 });

await sharp({
  create: {
    width,
    height,
    channels: 4,
    background: '#211812',
  },
})
  .composite(composites)
  .webp({ quality: 88, effort: 6 })
  .toFile(outPath);

console.log(`Pages home hero written to ${outPath}`);

async function framedImage(source, targetWidth, targetHeight, radius, fit) {
  const image = await sharp(source)
    .resize(targetWidth, targetHeight, { fit, position: 'centre' })
    .modulate({ saturation: 0.96, brightness: 0.94 })
    .toBuffer();

  const rounded = await sharp(image)
    .ensureAlpha()
    .composite([{ input: Buffer.from(roundMask(targetWidth, targetHeight, radius)), blend: 'dest-in' }])
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: targetWidth,
      height: targetHeight,
      channels: 4,
      background: 'transparent',
    },
  })
    .composite([
      { input: rounded, left: 0, top: 0 },
      { input: Buffer.from(cardStroke(targetWidth, targetHeight, radius)), left: 0, top: 0 },
    ])
    .png()
    .toBuffer();
}

async function characterCard(source, targetWidth, targetHeight) {
  const innerWidth = targetWidth - 28;
  const innerHeight = targetHeight - 38;
  const portrait = await sharp(source)
    .resize(innerWidth, innerHeight, { fit: 'contain', background: 'transparent' })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: targetWidth,
      height: targetHeight,
      channels: 4,
      background: 'transparent',
    },
  })
    .composite([
      { input: Buffer.from(characterCardSvg(targetWidth, targetHeight)), left: 0, top: 0 },
      { input: portrait, left: 14, top: 22 },
    ])
    .png()
    .toBuffer();
}

function backgroundSvg() {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sun" cx="50%" cy="4%" r="78%">
        <stop offset="0%" stop-color="#f2d99b" stop-opacity="0.36"/>
        <stop offset="45%" stop-color="#604329" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#1b120c" stop-opacity="0.94"/>
      </radialGradient>
      <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3b2a1d"/>
        <stop offset="48%" stop-color="#211812"/>
        <stop offset="100%" stop-color="#120d09"/>
      </linearGradient>
      <pattern id="grain" width="11" height="11" patternUnits="userSpaceOnUse">
        <path d="M0 10L10 0" stroke="#f6dfaa" stroke-opacity="0.035" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#base)"/>
    <rect width="100%" height="100%" fill="url(#sun)"/>
    <rect width="100%" height="100%" fill="url(#grain)"/>
    <path d="M120 1140 C780 930 1110 1090 1660 970 C2260 840 2650 980 3110 780 L3200 1600 L0 1600 Z" fill="#0f0a07" opacity="0.38"/>
  </svg>`;
}

function foregroundSvg() {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.18"/>
        <stop offset="48%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.48"/>
      </linearGradient>
      <radialGradient id="focus" cx="50%" cy="34%" r="52%">
        <stop offset="0%" stop-color="#fff3cb" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#fff3cb" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#shade)"/>
    <rect width="100%" height="100%" fill="url(#focus)"/>
    <rect x="100" y="72" width="3000" height="1440" rx="78" fill="none" stroke="#f7dfaa" stroke-opacity="0.18" stroke-width="2"/>
  </svg>`;
}

function characterCardSvg(cardWidth, cardHeight) {
  return `<svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff9e6" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#d9bc77" stop-opacity="0.64"/>
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="${cardWidth - 2}" height="${cardHeight - 2}" rx="28" fill="url(#paper)" stroke="#f7dfaa" stroke-opacity="0.38" stroke-width="2"/>
    <rect x="14" y="18" width="${cardWidth - 28}" height="${cardHeight - 38}" rx="22" fill="#2b1d13" opacity="0.12"/>
  </svg>`;
}

function cardStroke(cardWidth, cardHeight, radius) {
  return `<svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="${cardWidth - 2}" height="${cardHeight - 2}" rx="${radius}" fill="none" stroke="#f7dfaa" stroke-opacity="0.36" stroke-width="2"/>
  </svg>`;
}

function roundMask(cardWidth, cardHeight, radius) {
  return `<svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${cardWidth}" height="${cardHeight}" rx="${radius}" fill="white"/>
  </svg>`;
}
