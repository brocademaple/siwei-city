import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();

const assets = [
  ['src/assets/art/hero-city-panorama.png', 'src/assets/art/optimized/hero-city-panorama.webp', 78],
  ['src/assets/art/scenes/action-harbor-panorama.png', 'src/assets/art/optimized/scenes/action-harbor-panorama.webp', 78],
  ['src/assets/art/scenes/city-world-panorama.png', 'src/assets/art/optimized/scenes/city-world-panorama.webp', 78],
  ['src/assets/art/scenes/contemplation-garden-panorama.png', 'src/assets/art/optimized/scenes/contemplation-garden-panorama.webp', 78],
  ['src/assets/art/scenes/council-chamber-panorama.png', 'src/assets/art/optimized/scenes/council-chamber-panorama.webp', 78],
  ['src/assets/art/scenes/grand-library-panorama.png', 'src/assets/art/optimized/scenes/grand-library-panorama.webp', 78],
  ['src/assets/art/scenes/hypothesis-harbor-panorama.png', 'src/assets/art/optimized/scenes/hypothesis-harbor-panorama.webp', 78],
  ['src/assets/art/scenes/lighthouse-watchtower-panorama.png', 'src/assets/art/optimized/scenes/lighthouse-watchtower-panorama.webp', 78],
  ['src/assets/art/scenes/memory-cemetery-panorama.png', 'src/assets/art/optimized/scenes/memory-cemetery-panorama.webp', 78],
  ['src/assets/art/scenes/residential-quarter-panorama.png', 'src/assets/art/optimized/scenes/residential-quarter-panorama.webp', 78],
  ['src/assets/art/characters/archive-keeper.png', 'src/assets/art/optimized/characters/archive-keeper.webp', 82],
  ['src/assets/art/characters/city-inspector.png', 'src/assets/art/optimized/characters/city-inspector.webp', 82],
  ['src/assets/art/characters/report-editor.png', 'src/assets/art/optimized/characters/report-editor.webp', 82],
  ['src/assets/art/characters/resident-boundary-skeptic.png', 'src/assets/art/optimized/characters/resident-boundary-skeptic.webp', 82],
  ['src/assets/art/characters/resident-evidence-cartographer.png', 'src/assets/art/optimized/characters/resident-evidence-cartographer.webp', 82],
  ['src/assets/art/characters/resident-executor.png', 'src/assets/art/optimized/characters/resident-executor.webp', 82],
  ['src/assets/art/characters/resident-field-ethnographer.png', 'src/assets/art/optimized/characters/resident-field-ethnographer.webp', 82],
  ['src/assets/art/characters/resident-momentum-executor.png', 'src/assets/art/optimized/characters/resident-momentum-executor.webp', 82],
  ['src/assets/art/characters/resident-practitioner.png', 'src/assets/art/optimized/characters/resident-practitioner.webp', 82],
  ['src/assets/art/characters/resident-researcher.png', 'src/assets/art/optimized/characters/resident-researcher.webp', 82],
  ['src/assets/art/characters/resident-skeptic.png', 'src/assets/art/optimized/characters/resident-skeptic.webp', 82],
  ['src/assets/art/characters/systems-inspector.png', 'src/assets/art/optimized/characters/systems-inspector.webp', 82],
];

for (const [source, target, quality] of assets) {
  const outputPath = join(root, target);
  mkdirSync(dirname(outputPath), { recursive: true });
  await sharp(join(root, source))
    .webp({ quality, effort: 5 })
    .toFile(outputPath);
  console.log(`optimized ${target}`);
}
