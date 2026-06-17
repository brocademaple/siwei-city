import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const checks = [
  ['src/lib/cityBuildings.ts', ['council', 'library', 'residential', 'hypothesisHarbor', 'actionHarbor', 'contemplationGarden', 'memoryCemetery', 'lighthouse']],
  ['src/components/HomeWorldMap.tsx', ['进入冲突议会', 'world-marker-brief', 'onResetSession']],
  ['src/components/CouncilStage.tsx', ['召集居民发言', '先采纳右侧发言', '查看卷轴报告']],
  ['src/lib/traceRunDocs.ts', ['latest-two-chain-runs.json', '居民回应', '采纳动作', '巡城结果', '下一步行动']],
  ['src/components/ArchivePanel.tsx', ['公开思维链路留痕', '阅读最近链路', "doc.kind === 'trace'", "setShelf('traces')"]],
  ['src/styles.css', ['.home-shell .service-drawer.open', 'calc(100vw - 24px)', '.trace-entry-card']],
  ['dist/index.html', ['/siwei-city/v2/', 'pages-home-hero.webp', 'pages-home-hero-scroll.mp4', 'data-scroll-video', 'hero-scroll-stage', '思维城邦 2.0', '2.0 的页面逻辑', '场景素材', '人物素材', '设计思路']],
  ['dist/v1/index.html', ['/siwei-city/v2/', 'Version 1.0 Iteration Log', '美术资产与编排思路']],
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
}

const traceData = JSON.parse(readFileSync(join(root, 'docs/trace-runs/latest-two-chain-runs.json'), 'utf8'));
if (!Array.isArray(traceData.traces) || traceData.traces.length !== 2) {
  throw new Error('Smoke test expected docs/trace-runs/latest-two-chain-runs.json to contain exactly two traces');
}

for (const trace of traceData.traces) {
  for (const field of ['id', 'topic', 'mode', 'outputName', 'audience', 'keyAssumption']) {
    if (!trace[field]) {
      throw new Error(`Smoke test missing trace field "${field}"`);
    }
  }
  if (!Array.isArray(trace.chain) || trace.chain.length < 6) {
    throw new Error(`Smoke test expected a complete chain for trace: ${trace.id}`);
  }
  if (!Array.isArray(trace.turns) || !trace.turns.some((turn) => turn.accepted)) {
    throw new Error(`Smoke test expected accepted resident turns for trace: ${trace.id}`);
  }
  if (!trace.review?.beforeAcceptance || !trace.review?.afterAcceptance) {
    throw new Error(`Smoke test expected review checkpoints for trace: ${trace.id}`);
  }
  if (!trace.finalOutputs?.reportSummary || !trace.finalOutputs?.nextAction) {
    throw new Error(`Smoke test expected final outputs for trace: ${trace.id}`);
  }
}

assertIncludes('dist/index.html', '/siwei-city/v2/');
assertIncludes('dist/index.html', '当前主版本');
assertIncludes('dist/index.html', '2.0 的页面逻辑');
assertIncludes('dist/index.html', '人物素材');
assertIncludes('dist/index.html', '冲突议会');
assertNotIncludes('dist/index.html', '/siwei-city/v1/');
assertNotIncludes('dist/index.html', '版本展厅');
assertNotIncludes('dist/index.html', 'window.location.replace');
assertIncludes('dist/v1/index.html', '/siwei-city/v2/');
assertIncludes('dist/v1/index.html', '/siwei-city/');

const v2Bundle = readBundle('dist/v2/assets');
for (const needle of ['公开思维链路留痕', '阅读最近链路', '我想做一个面向独居女性的夜间安全产品', '我想判断一个 AI 简历工具值不值得做']) {
  if (!v2Bundle.includes(needle)) {
    throw new Error(`Smoke test missing "${needle}" in dist/v2/assets bundle`);
  }
}

for (const needle of ['1.0 回顾', '/v1/']) {
  if (v2Bundle.includes(needle)) {
    throw new Error(`Smoke test unexpectedly found "${needle}" in dist/v2/assets bundle`);
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

function assertNotIncludes(file, needle) {
  const filePath = join(root, file);
  if (!existsSync(filePath)) {
    throw new Error(`Smoke test missing file: ${file}`);
  }
  const body = readFileSync(filePath, 'utf8');
  if (body.includes(needle)) {
    throw new Error(`Smoke test unexpectedly found "${needle}" in ${file}`);
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
