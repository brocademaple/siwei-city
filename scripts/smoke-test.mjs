import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const checks = [
  ['src/lib/cityBuildings.ts', ['council', 'library', 'residential', 'hypothesisHarbor', 'actionHarbor', 'contemplationGarden', 'memoryCemetery', 'lighthouse']],
  ['src/components/HomeWorldMap.tsx', ['进入冲突议会', 'world-marker-brief', 'onResetSession']],
  ['src/components/CouncilStage.tsx', ['召集居民发言', '先采纳右侧发言', '查看卷轴报告']],
  ['src/lib/traceRunDocs.ts', ['latest-two-chain-runs.json', '居民回应', '采纳动作', '巡城结果', '下一步行动']],
  ['src/components/ArchivePanel.tsx', ['链路留痕', "doc.kind === 'trace'"]],
  ['dist/index.html', ['/siwei-city/v1/', '/siwei-city/v2/', 'version-assets']],
  ['dist/v1/index.html', ['/siwei-city/v2/', 'Version 1.0']],
  ['dist/v2/index.html', ['/siwei-city/v2/assets/']],
];

const currentDocLinks = [
  'docs/current/siwei-city-mvp-manual.md',
  'docs/current/project-status-prd.md',
  'docs/current/siwei-city-worldbuilding.md',
  'docs/current/roundtable-mechanism.md',
  'docs/current/version-history.md',
];

const legacyDocNames = [
  'art-character-plan',
  'art-direction',
  'case-study',
  'mvp-flow-and-art-direction',
  'product-engineering-brief',
  'product-mvp-decisions',
  'product-narrative',
  'project-orientation',
  'project-status-prd',
  'roundtable-mechanism',
  'siwei-city-mvp-manual',
  'siwei-city-worldbuilding',
  'upgrade-test-report',
  'version-history',
];

for (const [file, needles] of checks) {
  const filePath = join(root, file);
  if (!existsSync(filePath)) {
    throw new Error(`Smoke test missing file: ${file}`);
  }
  const body = readFileSync(filePath, 'utf8');
  for (const needle of needles) {
    if (!body.includes(needle)) {
      throw new Error(`Smoke test missing "${needle}" in ${file}`);
    }
  }
}

for (const docLink of currentDocLinks) {
  assertIncludes('README.md', docLink);
  assertIncludes('dist/index.html', `blob/main/${docLink}`);
}

assertIncludes('dist/index.html', '/siwei-city/v1/');
assertIncludes('dist/index.html', '/siwei-city/v2/');
assertIncludes('dist/v1/index.html', '/siwei-city/v2/');
assertIncludes('dist/v1/index.html', '/siwei-city/');

const v2Bundle = readBundle('dist/v2/assets');
for (const needle of ['版本展厅', '1.0 回顾', '/siwei-city', '/v1/', '链路留痕', '我想做一个面向独居女性的夜间安全产品', '我想判断一个 AI 简历工具值不值得做']) {
  if (!v2Bundle.includes(needle)) {
    throw new Error(`Smoke test missing "${needle}" in dist/v2/assets bundle`);
  }
}

const legacyDocLinks = legacyDocNames.map((name) => `docs/${name}.md`);
const staleDocHits = scanTextFiles([
  'README.md',
  'index.html',
  'vite.config.ts',
  'package.json',
  '.github/workflows/deploy-pages.yml',
  'src',
  'scripts',
  'docs',
  'dist/index.html',
  'dist/v1/index.html',
]).flatMap((file) => {
  const body = readFileSync(join(root, file), 'utf8');
  return legacyDocLinks
    .filter((legacyLink) => body.includes(legacyLink))
    .map((legacyLink) => `${file}: ${legacyLink}`);
});

if (staleDocHits.length) {
  throw new Error(`Smoke test found stale docs/*.md links:\n${staleDocHits.join('\n')}`);
}

console.log('Siwei City smoke test passed.');

function assertIncludes(file, needle) {
  const filePath = join(root, file);
  if (!existsSync(filePath)) {
    throw new Error(`Smoke test missing file: ${file}`);
  }
  const body = readFileSync(filePath, 'utf8');
  if (!body.includes(needle)) {
    throw new Error(`Smoke test missing "${needle}" in ${file}`);
  }
}

function readBundle(relativeDir) {
  return scanTextFiles([relativeDir])
    .filter((file) => file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.html'))
    .map((file) => readFileSync(join(root, file), 'utf8'))
    .join('\n');
}

function scanTextFiles(entries) {
  return entries.flatMap((entry) => {
    const path = join(root, entry);
    if (!existsSync(path)) return [];
    const stats = statSync(path);
    if (stats.isDirectory()) {
      return readdirSync(path).flatMap((name) => scanTextFiles([`${entry}/${name}`]));
    }
    return isTextFile(entry) ? [entry] : [];
  });
}

function isTextFile(file) {
  return /\.(css|html|js|json|md|mjs|ts|tsx|yml)$/.test(file);
}
