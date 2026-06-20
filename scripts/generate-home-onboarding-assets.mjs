import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../src/assets/art/home-onboarding');

await mkdir(outDir, { recursive: true });

const fontStack = 'Songti SC, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif';

function defs(id = 'asset') {
  return `
    <defs>
      <linearGradient id="${id}-vellum" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#fff8df"/>
        <stop offset="0.42" stop-color="#ead7a6"/>
        <stop offset="1" stop-color="#c8a86c"/>
      </linearGradient>
      <linearGradient id="${id}-bronze" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#f4dc96"/>
        <stop offset="0.48" stop-color="#a46d24"/>
        <stop offset="1" stop-color="#6d4317"/>
      </linearGradient>
      <radialGradient id="${id}-warm" cx="50%" cy="14%" r="78%">
        <stop offset="0" stop-color="#fff7cf" stop-opacity="0.78"/>
        <stop offset="0.58" stop-color="#dfc188" stop-opacity="0.22"/>
        <stop offset="1" stop-color="#5b3818" stop-opacity="0.18"/>
      </radialGradient>
      <filter id="${id}-paper" x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018 0.055" numOctaves="4" seed="18" result="noise"/>
        <feColorMatrix in="noise" type="saturate" values="0"/>
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 0.12"/>
        </feComponentTransfer>
        <feBlend in="SourceGraphic" mode="multiply"/>
      </filter>
      <filter id="${id}-shadow" x="-20%" y="-28%" width="140%" height="166%">
        <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#201308" flood-opacity="0.26"/>
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#fff2bf" flood-opacity="0.28"/>
      </filter>
      <filter id="${id}-glow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="10" result="blur"/>
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.98  0 0.78 0 0 0.65  0 0 0.28 0 0.22  0 0 0 1 0"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  `;
}

function svgFrame({ width, height, radius = 24, tab = false, pointer = false, slotLines = false }) {
  const id = `frame-${width}-${height}`;
  const bodyY = pointer ? 2 : 0;
  const bodyHeight = pointer ? height - 30 : height;
  const pointerPath = pointer
    ? `<path d="M${width * 0.42} ${height - 29} C${width * 0.49} ${height - 14} ${width * 0.56} ${height - 6} ${width * 0.66} ${height - 2} C${width * 0.56} ${height - 1} ${width * 0.49} ${height - 5} ${width * 0.43} ${height - 13} Z" fill="url(#${id}-vellum)" opacity="0.96" filter="url(#${id}-paper)"/>`
    : '';
  const lines = slotLines
    ? [0.28, 0.5, 0.72]
        .map(
          (y) =>
            `<rect x="${width * 0.2}" y="${height * y}" width="${width * 0.6}" height="1.8" rx="1" fill="#836032" opacity="0.28"/>`,
        )
        .join('')
    : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${defs(id)}
      <rect x="10" y="${bodyY + 10}" width="${width - 20}" height="${bodyHeight - 20}" rx="${radius}" fill="url(#${id}-vellum)" filter="url(#${id}-shadow)"/>
      <rect x="15" y="${bodyY + 15}" width="${width - 30}" height="${bodyHeight - 30}" rx="${Math.max(radius - 5, 8)}" fill="url(#${id}-warm)" opacity="0.66"/>
      <rect x="10" y="${bodyY + 10}" width="${width - 20}" height="${bodyHeight - 20}" rx="${radius}" fill="none" stroke="url(#${id}-bronze)" stroke-width="3.5" opacity="0.82"/>
      <rect x="22" y="${bodyY + 22}" width="${width - 44}" height="${bodyHeight - 44}" rx="${Math.max(radius - 12, 6)}" fill="none" stroke="#fff4bd" stroke-width="1.2" opacity="0.68"/>
      ${
        tab
          ? `<path d="M24 ${bodyY + 24} H148 C160 ${bodyY + 24} 166 ${bodyY + 30} 166 ${bodyY + 40} V64 C166 ${bodyY + 74} 160 ${bodyY + 80} 148 ${bodyY + 80} H24 Z" fill="#285b82" opacity="0.86"/>`
          : ''
      }
      ${lines}
      ${pointerPath}
    </svg>
  `;
}

function buttonSvg({ width, height, primary = false }) {
  const id = primary ? 'primary-button' : 'secondary-button';
  const fill = primary
    ? `<linearGradient id="${id}-fill" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#c89745"/><stop offset="0.58" stop-color="#8f5a20"/><stop offset="1" stop-color="#6b3d12"/></linearGradient>`
    : `<linearGradient id="${id}-fill" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff7cf"/><stop offset="0.62" stop-color="#ead6a1"/><stop offset="1" stop-color="#c8aa73"/></linearGradient>`;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        ${fill}
        <filter id="${id}-paper">
          <feTurbulence type="fractalNoise" baseFrequency="0.022 0.08" numOctaves="3" seed="${primary ? 9 : 14}" result="noise"/>
          <feComponentTransfer><feFuncA type="table" tableValues="0 0.12"/></feComponentTransfer>
          <feBlend in="SourceGraphic" mode="multiply"/>
        </filter>
        <filter id="${id}-shadow" x="-20%" y="-40%" width="140%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#1d1208" flood-opacity="${primary ? '0.28' : '0.16'}"/>
        </filter>
      </defs>
      <rect x="4" y="4" width="${width - 8}" height="${height - 8}" rx="${height / 2 - 4}" fill="url(#${id}-fill)" filter="url(#${id}-shadow)"/>
      <rect x="9" y="9" width="${width - 18}" height="${height - 18}" rx="${height / 2 - 9}" fill="none" stroke="${primary ? '#e6c879' : '#fff2bd'}" stroke-width="1.5" opacity="0.88"/>
      <rect x="4" y="4" width="${width - 8}" height="${height - 8}" rx="${height / 2 - 4}" fill="transparent" filter="url(#${id}-paper)"/>
    </svg>
  `;
}

function arrowSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="360" height="230" viewBox="0 0 360 230">
      <defs>
        <linearGradient id="arrow-line" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#fff4b8"/>
          <stop offset="0.5" stop-color="#dfb654"/>
          <stop offset="1" stop-color="#9b631e"/>
        </linearGradient>
        <filter id="arrow-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#ffe08a" flood-opacity="0.72"/>
          <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#2a1708" flood-opacity="0.22"/>
        </filter>
      </defs>
      <path d="M330 28 C255 36 224 80 191 115 C156 153 118 181 54 177" fill="none" stroke="url(#arrow-line)" stroke-width="6" stroke-linecap="round" filter="url(#arrow-glow)"/>
      <path d="M58 177 L91 158 L88 193 Z" fill="#d2a148" stroke="#fff0a9" stroke-width="2" filter="url(#arrow-glow)"/>
      <path d="M324 28 C254 37 222 82 190 115" fill="none" stroke="#fff8c9" stroke-width="1.5" stroke-linecap="round" opacity="0.66"/>
    </svg>
  `;
}

function haloSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="360" height="260" viewBox="0 0 360 260">
      <defs>
        <radialGradient id="halo-gold" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#fff5b7" stop-opacity="0"/>
          <stop offset="0.46" stop-color="#ffe795" stop-opacity="0.08"/>
          <stop offset="0.58" stop-color="#ffd56b" stop-opacity="0.72"/>
          <stop offset="0.66" stop-color="#c48729" stop-opacity="0.28"/>
          <stop offset="1" stop-color="#533011" stop-opacity="0"/>
        </radialGradient>
        <filter id="halo-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.4"/>
        </filter>
      </defs>
      <ellipse cx="180" cy="130" rx="128" ry="76" fill="url(#halo-gold)" filter="url(#halo-blur)"/>
      <ellipse cx="180" cy="130" rx="119" ry="68" fill="none" stroke="#fff1a7" stroke-width="4" opacity="0.84"/>
      <ellipse cx="180" cy="130" rx="145" ry="88" fill="none" stroke="#e2ad43" stroke-width="2" opacity="0.24"/>
    </svg>
  `;
}

function labelSvg(text, width, height, options = {}) {
  const { vertical = false, size = 28, fill = '#285b82', stroke = '#fff2bd', weight = 900 } = options;
  const chars = [...text];
  const content = vertical
    ? chars
        .map((char, index) => `<text x="${width / 2}" y="${54 + index * 43}" text-anchor="middle">${char}</text>`)
        .join('')
    : `<text x="${width / 2}" y="${height / 2 + size * 0.36}" text-anchor="middle">${text}</text>`;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <filter id="label-shadow" x="-20%" y="-40%" width="140%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.8" flood-color="#5d3f1e" flood-opacity="0.28"/>
        </filter>
      </defs>
      <g font-family="${fontStack}" font-size="${size}" font-weight="${weight}" letter-spacing="1.5" filter="url(#label-shadow)">
        <g stroke="${stroke}" stroke-width="2.6" stroke-linejoin="round" paint-order="stroke fill" fill="${fill}">
          ${content}
        </g>
      </g>
    </svg>
  `;
}

function coachTextSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="410" height="70" viewBox="0 0 410 70">
      <g font-family="${fontStack}" font-size="25" font-weight="900" letter-spacing="0.2" fill="#352416">
        <text x="205" y="30" text-anchor="middle">点亮冲突议会</text>
        <text x="205" y="60" text-anchor="middle" font-size="20" fill="#5a4026">完成第一轮默认讨论</text>
      </g>
    </svg>
  `;
}

async function writeAsset(name, svg, { format = 'png', quality = 88 } = {}) {
  const image = sharp(Buffer.from(svg));
  const target = path.join(outDir, name);
  await mkdir(path.dirname(target), { recursive: true });
  if (format === 'webp') {
    await image.webp({ quality, effort: 5 }).toFile(target);
  } else {
    await image.png({ compressionLevel: 9 }).toFile(target);
  }
}

await writeAsset('topic-panel.webp', svgFrame({ width: 720, height: 212, radius: 28 }), { format: 'webp' });
await writeAsset('marker-card.webp', svgFrame({ width: 244, height: 122, radius: 16 }), { format: 'webp' });
await writeAsset('marker-card-primary.webp', svgFrame({ width: 320, height: 142, radius: 20 }), { format: 'webp' });
await writeAsset('primary-button.webp', buttonSvg({ width: 360, height: 76, primary: true }), { format: 'webp' });
await writeAsset('secondary-button.webp', buttonSvg({ width: 300, height: 76 }), { format: 'webp' });
await writeAsset('progress-panel.webp', svgFrame({ width: 440, height: 136, radius: 20, tab: true }), { format: 'webp' });
await writeAsset('service-rail.webp', svgFrame({ width: 154, height: 300, radius: 24 }), { format: 'webp' });
await writeAsset('coach-bubble.png', svgFrame({ width: 460, height: 160, radius: 24, pointer: true }));
await writeAsset('arrow-council.png', arrowSvg());
await writeAsset('building-halo.png', haloSvg());
await writeAsset('label-current-topic.png', labelSvg('当前议题', 150, 42, { size: 25 }));
await writeAsset('label-progress.png', labelSvg('本轮进度', 150, 42, { size: 25 }));
await writeAsset('label-recommended.png', labelSvg('推荐起点', 132, 42, { size: 23, fill: '#f8edc6', stroke: '#285b82' }));
await writeAsset('label-service.png', labelSvg('城邦服务', 92, 250, { vertical: true, size: 34 }));
await writeAsset('label-library.png', labelSvg('图书馆', 112, 38, { size: 23, fill: '#6f4b1f' }));
await writeAsset('label-graveyard.png', labelSvg('废案馆', 112, 38, { size: 23, fill: '#72519a' }));
await writeAsset('label-lighthouse.png', labelSvg('巡城塔', 112, 38, { size: 23, fill: '#285b82' }));
await writeAsset('coach-copy.png', coachTextSvg());

const markerLabels = [
  ['marker-label-council.png', '冲突议会', 176, 44],
  ['marker-label-library.png', '大图书馆', 176, 44],
  ['marker-label-residential.png', '居民区', 148, 44],
  ['marker-label-hypothesis-harbor.png', '假设码头', 176, 44],
  ['marker-label-action-harbor.png', '行动码头', 176, 44],
  ['marker-label-contemplation-garden.png', '沉思庭院', 176, 44],
  ['marker-label-memory-cemetery.png', '废案馆', 148, 44],
  ['marker-label-lighthouse.png', '巡城塔', 148, 44],
];

for (const [name, text, width, height] of markerLabels) {
  await writeAsset(`marker-labels/${name}`, labelSvg(text, width, height, { size: 27 }));
}

console.log(`Generated home onboarding assets in ${outDir}`);
