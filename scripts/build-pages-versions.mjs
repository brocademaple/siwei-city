import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');
const assetDir = join(distDir, 'version-assets');
const githubBase = '/siwei-city';

const assets = {
  v1Hero: 'hero-city-panorama.png',
  v2Hero: 'city-world-panorama.png',
  council: 'council-chamber-panorama.png',
  library: 'building-library.png',
  councilBuilding: 'building-council.png',
  harbor: 'building-harbor-gate.png',
  cloister: 'district-cloister.png',
  archive: 'district-archive.png',
};

rmSync(distDir, { recursive: true, force: true });
mkdirSync(assetDir, { recursive: true });

copyAsset('src/assets/art/hero-city-panorama.png', assets.v1Hero);
copyAsset('src/assets/art/scenes/city-world-panorama.png', assets.v2Hero);
copyAsset('src/assets/art/scenes/council-chamber-panorama.png', assets.council);
copyAsset('src/assets/art/buildings/building-library.png', assets.library);
copyAsset('src/assets/art/buildings/building-council.png', assets.councilBuilding);
copyAsset('src/assets/art/buildings/building-harbor-gate.png', assets.harbor);
copyAsset('src/assets/art/districts/district-cloister.png', assets.cloister);
copyAsset('src/assets/art/districts/district-archive.png', assets.archive);

execFileSync('npx', ['vite', 'build', '--mode', 'github-pages', '--outDir', 'dist/v2', '--emptyOutDir', 'false'], {
  cwd: root,
  stdio: 'inherit',
});

writeHtml('index.html', renderHomePage());
writeHtml('v1/index.html', renderV1Page());

function copyAsset(source, targetName) {
  copyFileSync(join(root, source), join(assetDir, targetName));
}

function writeHtml(relativePath, html) {
  const filePath = join(distDir, relativePath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html);
}

function assetPath(name) {
  return `${githubBase}/version-assets/${name}`;
}

function pageShell({ title, body }) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#211812" />
    <meta name="description" content="思维城邦 Siwei City 版本展厅：保留 1.0 迭代回顾，并进入 2.0 古希腊城邦议会主舞台。" />
    <title>${title}</title>
    <style>${sharedCss()}</style>
  </head>
  <body>
    ${body}
  </body>
</html>`;
}

function renderHomePage() {
  return pageShell({
    title: '思维城邦版本展厅',
    body: `
      <main class="page-shell">
        <section class="hero split-hero">
          <div class="hero-copy">
            <span class="eyebrow">Siwei City Version Gallery</span>
            <h1>思维城邦</h1>
            <p>从 1.0 的“观点建筑地图”，推进到 2.0 的“古希腊城邦议会”。这里保留产品迭代痕迹，也给新版体验一个清晰入口。</p>
            <div class="hero-actions">
              <a class="primary" href="${githubBase}/v2/">进入 2.0 议会主舞台</a>
              <a class="secondary" href="${githubBase}/v1/">查看 1.0 迭代回顾</a>
            </div>
          </div>
          <figure class="hero-art">
            <img src="${assetPath(assets.v2Hero)}" alt="思维城邦 2.0 古希腊世界地图" />
          </figure>
        </section>

        <section class="version-grid" aria-label="版本入口">
          <article class="version-card">
            <span>Version 1.0</span>
            <h2>观点建筑地图</h2>
            <p>1.0 验证了核心隐喻：把问题、假设、证据、反驳和行动放进一张城邦地图，用建筑和道路记录思考过程。</p>
            <img src="${assetPath(assets.v1Hero)}" alt="思维城邦 1.0 panorama" />
            <a href="${githubBase}/v1/">进入 1.0 展厅</a>
          </article>
          <article class="version-card highlighted">
            <span>Version 2.0</span>
            <h2>议会主舞台</h2>
            <p>2.0 锁定 MVP 主线：从冲突议会开局，居民发言，用户采纳，巡城塔诊断，行动码头远航，大图书馆归档。</p>
            <img src="${assetPath(assets.council)}" alt="思维城邦 2.0 议会大厅" />
            <a href="${githubBase}/v2/">打开 2.0 应用</a>
          </article>
        </section>

        <section class="worldview">
          <span class="eyebrow">Worldbuilding as Product Design</span>
          <h2>世界观不是装饰，是产品结构</h2>
          <p>8 座建筑对应一次议题闭环的 8 个阶段：冲突议会、大图书馆、居民区、假设码头、行动码头、沉思庭院、记忆墓园 / 废案馆、灯塔 / 巡城塔。未想清楚的新建筑先留在 PRD 和世界观文档里，不挤进产品 UI。</p>
          <div class="pill-row">
            <a href="https://github.com/brocademaple/siwei-city/blob/main/docs/current/siwei-city-mvp-manual.md">MVP 说明书</a>
            <a href="https://github.com/brocademaple/siwei-city/blob/main/docs/current/siwei-city-worldbuilding.md">世界观文档</a>
            <a href="https://github.com/brocademaple/siwei-city/blob/main/docs/current/project-status-prd.md">当前 PRD</a>
            <a href="https://github.com/brocademaple/siwei-city/blob/main/docs/current/roundtable-mechanism.md">圆桌机制</a>
            <a href="https://github.com/brocademaple/siwei-city/blob/main/docs/current/version-history.md">版本历史</a>
          </div>
        </section>
      </main>
    `,
  });
}

function renderV1Page() {
  return pageShell({
    title: '思维城邦 1.0 迭代回顾',
    body: `
      <main class="page-shell">
        <nav class="top-nav">
          <a href="${githubBase}/">版本展厅</a>
          <a href="${githubBase}/v2/">进入 2.0</a>
        </nav>
        <section class="hero">
          <div class="hero-copy">
            <span class="eyebrow">Version 1.0 Archive</span>
            <h1>1.0：把观点变成建筑</h1>
            <p>这是思维城邦最早跑通的产品假设：复杂思考可以被空间化。问题、证据、假设、反驳和行动各自落成建筑，观点之间用道路连接。</p>
          </div>
          <figure class="hero-art">
            <img src="${assetPath(assets.v1Hero)}" alt="思维城邦 1.0 城邦地图" />
          </figure>
        </section>

        <section class="timeline">
          <article>
            <span>01</span>
            <h2>验证空间隐喻</h2>
            <p>1.0 的重点是证明“想法可以有位置”。用户点击建筑看铭文，双击或选择起点铺设支持、冲突、依赖、延伸、回流关系。</p>
          </article>
          <article>
            <span>02</span>
            <h2>保留角色雏形</h2>
            <p>研究者、实践者、怀疑者、执行者作为早期 agent 来函入口出现。它们还没有完整人格和席位，但已经验证了多视角碰撞的必要性。</p>
          </article>
          <article>
            <span>03</span>
            <h2>暴露升级问题</h2>
            <p>随着建筑和卡片增多，主页变得拥挤，用户很难知道第一步该做什么。2.0 因此把主页改成世界地图，把核心操作集中到冲突议会。</p>
          </article>
        </section>

        <section class="asset-board">
          <h2>1.0 保留资产</h2>
          <p>这些旧素材不删除，它们是产品迭代过程的一部分，也能继续服务说明书、案例展示和后续回顾页。</p>
          <div class="asset-grid">
            <figure><img src="${assetPath(assets.councilBuilding)}" alt="旧版议会建筑" /><figcaption>观点建筑</figcaption></figure>
            <figure><img src="${assetPath(assets.library)}" alt="旧版图书馆建筑" /><figcaption>归档隐喻</figcaption></figure>
            <figure><img src="${assetPath(assets.harbor)}" alt="旧版码头建筑" /><figcaption>行动码头</figcaption></figure>
            <figure><img src="${assetPath(assets.archive)}" alt="旧版档案城区" /><figcaption>证据档案</figcaption></figure>
          </div>
        </section>

        <section class="worldview">
          <span class="eyebrow">Why 2.0</span>
          <h2>从地图原型到议会主舞台</h2>
          <p>1.0 证明了“城邦地图”有表达力；2.0 进一步明确了可用路径：首页只回答点哪里开始，议会只回答下一步做什么，其他建筑只回答它在闭环中负责哪一段。</p>
          <div class="hero-actions">
            <a class="primary" href="${githubBase}/v2/">进入 2.0</a>
            <a class="secondary" href="${githubBase}/">回版本展厅</a>
          </div>
        </section>
      </main>
    `,
  });
}

function sharedCss() {
  return `
    :root {
      color-scheme: light;
      font-family: "Noto Serif SC", "Source Han Serif SC", "Microsoft YaHei", system-ui, sans-serif;
      color: #2f2319;
      background: #211812;
      --paper: rgba(255, 249, 229, 0.9);
      --lapis: #285b82;
      --bronze: #9a6d35;
      --olive: #567647;
      --ink: #2f2319;
      --muted: #6d5843;
      --shadow: 0 24px 64px rgba(23, 15, 8, 0.32);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-width: 320px;
      background:
        radial-gradient(circle at 50% 0%, rgba(219, 186, 119, 0.2), transparent 36rem),
        linear-gradient(135deg, #2a1e15, #17100b);
    }
    a { color: inherit; }
    .page-shell {
      display: grid;
      gap: 24px;
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      padding: 28px 0 42px;
    }
    .top-nav {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .top-nav a,
    .pill-row a {
      padding: 9px 13px;
      border: 1px solid rgba(255, 238, 188, 0.36);
      border-radius: 999px;
      background: rgba(255, 250, 232, 0.76);
      color: #3f2d1d;
      font-size: 13px;
      font-weight: 900;
      text-decoration: none;
    }
    .hero,
    .version-card,
    .worldview,
    .timeline article,
    .asset-board {
      border: 1px solid rgba(255, 238, 188, 0.38);
      border-radius: 16px;
      background:
        linear-gradient(180deg, rgba(255, 250, 232, 0.92), rgba(230, 206, 158, 0.82)),
        repeating-linear-gradient(135deg, rgba(96, 63, 29, 0.035), rgba(96, 63, 29, 0.035) 2px, transparent 2px, transparent 8px);
      box-shadow: var(--shadow);
      overflow: hidden;
    }
    .hero {
      display: grid;
      grid-template-columns: 0.88fr 1.12fr;
      min-height: 520px;
    }
    .split-hero {
      min-height: 580px;
    }
    .hero-copy {
      display: grid;
      align-content: center;
      gap: 16px;
      padding: clamp(24px, 5vw, 58px);
    }
    .eyebrow,
    .version-card span,
    .timeline span {
      color: var(--lapis);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0;
    }
    h1,
    h2,
    p {
      margin: 0;
    }
    h1 {
      color: var(--ink);
      font-size: clamp(42px, 8vw, 86px);
      line-height: 1.02;
    }
    h2 {
      color: var(--ink);
      font-size: clamp(24px, 3vw, 38px);
      line-height: 1.12;
    }
    p {
      color: var(--muted);
      font-size: 17px;
      line-height: 1.72;
    }
    .hero-actions,
    .pill-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 8px;
    }
    .hero-actions a,
    .version-card a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: 0 16px;
      border-radius: 10px;
      font-weight: 900;
      text-decoration: none;
    }
    .primary,
    .version-card a {
      background: linear-gradient(180deg, #ad7b3d, #805828);
      color: #fff5dd;
    }
    .secondary {
      border: 1px solid rgba(119, 83, 45, 0.28);
      background: rgba(255, 253, 242, 0.7);
      color: #5b4025;
    }
    .hero-art {
      position: relative;
      min-height: 360px;
      margin: 0;
      background: #211812;
    }
    .hero-art img,
    .version-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .version-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }
    .version-card {
      display: grid;
      gap: 13px;
      padding: 18px;
    }
    .version-card.highlighted {
      border-color: rgba(40, 91, 130, 0.42);
    }
    .version-card img {
      height: 260px;
      border-radius: 12px;
      border: 1px solid rgba(114, 76, 35, 0.22);
    }
    .worldview,
    .asset-board {
      display: grid;
      gap: 14px;
      padding: clamp(20px, 4vw, 40px);
    }
    .timeline {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .timeline article {
      display: grid;
      gap: 10px;
      padding: 22px;
    }
    .asset-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .asset-grid figure {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 14px;
      border-radius: 12px;
      background: rgba(255, 253, 242, 0.54);
      text-align: center;
    }
    .asset-grid img {
      width: 100%;
      height: 132px;
      object-fit: contain;
      filter: drop-shadow(0 14px 16px rgba(33, 22, 12, 0.2));
    }
    figcaption {
      color: #57412b;
      font-size: 13px;
      font-weight: 900;
    }
    @media (max-width: 820px) {
      .hero,
      .version-grid,
      .timeline,
      .asset-grid {
        grid-template-columns: 1fr;
      }
      .hero {
        min-height: auto;
      }
      .hero-art {
        min-height: 280px;
      }
    }
  `;
}
