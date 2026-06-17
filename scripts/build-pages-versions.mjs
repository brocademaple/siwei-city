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
  v2HeroWebp: 'city-world-panorama.webp',
  council: 'council-chamber-panorama.png',
  councilWebp: 'council-chamber-panorama.webp',
  libraryWebp: 'grand-library-panorama.webp',
  actionHarborWebp: 'action-harbor-panorama.webp',
  lighthouseWebp: 'lighthouse-watchtower-panorama.webp',
  researcherWebp: 'resident-researcher.webp',
  skepticWebp: 'resident-skeptic.webp',
  executorWebp: 'resident-executor.webp',
  inspectorWebp: 'city-inspector.webp',
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
copyAsset('src/assets/art/optimized/scenes/city-world-panorama.webp', assets.v2HeroWebp);
copyAsset('src/assets/art/scenes/council-chamber-panorama.png', assets.council);
copyAsset('src/assets/art/optimized/scenes/council-chamber-panorama.webp', assets.councilWebp);
copyAsset('src/assets/art/optimized/scenes/grand-library-panorama.webp', assets.libraryWebp);
copyAsset('src/assets/art/optimized/scenes/action-harbor-panorama.webp', assets.actionHarborWebp);
copyAsset('src/assets/art/optimized/scenes/lighthouse-watchtower-panorama.webp', assets.lighthouseWebp);
copyAsset('src/assets/art/optimized/characters/resident-researcher.webp', assets.researcherWebp);
copyAsset('src/assets/art/optimized/characters/resident-skeptic.webp', assets.skepticWebp);
copyAsset('src/assets/art/optimized/characters/resident-executor.webp', assets.executorWebp);
copyAsset('src/assets/art/optimized/characters/city-inspector.webp', assets.inspectorWebp);
copyAsset('src/assets/art/buildings/building-library.png', assets.library);
copyAsset('src/assets/art/buildings/building-council.png', assets.councilBuilding);
copyAsset('src/assets/art/buildings/building-harbor-gate.png', assets.harbor);
copyAsset('src/assets/art/districts/district-cloister.png', assets.cloister);
copyAsset('src/assets/art/districts/district-archive.png', assets.archive);

execFileSync('npx', ['vite', 'build', '--mode', 'github-pages', '--outDir', 'dist/v2', '--emptyOutDir', 'false'], {
  cwd: root,
  stdio: 'inherit',
});

writeHtml('index.html', renderDefaultV2Page());
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

function pageShell({ title, description, body }) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#211812" />
    <meta name="description" content="${description}" />
    <title>${title}</title>
    <style>${sharedCss()}</style>
  </head>
  <body>
    ${body}
  </body>
</html>`;
}

function renderDefaultV2Page() {
  return pageShell({
    title: '思维城邦 2.0：美术资产与设计思路',
    description: '思维城邦 Siwei City 2.0 GitHub Pages 展示页：展示新的城邦场景、居民角色、美术素材和产品设计思路。',
    body: `
      <main class="page-shell v2-showcase">
        <nav class="top-nav">
          <strong>思维城邦 2.0</strong>
        </nav>

        <section class="hero split-hero">
          <div class="hero-copy">
            <span class="eyebrow">当前主版本</span>
            <h1>思维城邦 2.0</h1>
            <p>把模糊议题推进到议会讨论、采纳入城、巡城诊断和卷轴归档。</p>
            <div class="hero-actions">
              <a class="primary" href="${githubBase}/v2/">进入 2.0 应用</a>
              <a class="secondary" href="https://github.com/brocademaple/siwei-city/blob/main/docs/current/art-direction.md">阅读美术说明</a>
            </div>
          </div>
          <figure class="hero-art showcase-hero-art">
            <img src="${assetPath(assets.v2HeroWebp)}" alt="思维城邦 2.0 世界地图主视觉" />
          </figure>
        </section>

        <section class="design-panel">
          <h2>2.0 的页面逻辑</h2>
          <p>首页只承担展示和进入当前版本的职责。真正的产品体验从世界地图进入冲突议会，再回到行动和归档。</p>
          <div class="path-ribbon">
            <span>世界地图</span>
            <span>冲突议会</span>
            <span>居民圆桌</span>
            <span>巡城诊断</span>
            <span>行动码头</span>
            <span>大图书馆</span>
          </div>
        </section>

        <section class="scene-board">
          <figure class="scene-feature">
            <img src="${assetPath(assets.councilWebp)}" alt="冲突议会场景" />
            <figcaption>
              <strong>冲突议会</strong>
              <span>把反驳、证据、行动和采纳集中到主舞台，降低首次使用的路径压力。</span>
            </figcaption>
          </figure>
          <div class="scene-stack">
            <figure>
              <img src="${assetPath(assets.libraryWebp)}" alt="大图书馆归档场景" />
              <figcaption>大图书馆承接报告、链路留痕和历史城邦。</figcaption>
            </figure>
            <figure>
              <img src="${assetPath(assets.actionHarborWebp)}" alt="行动码头场景" />
              <figcaption>行动码头把讨论结果推向实验和回流。</figcaption>
            </figure>
          </div>
        </section>

        <section class="asset-board">
          <h2>新的美术素材</h2>
          <p>2.0 新增场景 panorama 和居民角色，让产品从地图工具升级为有舞台、有席位、有职责分工的思考世界。</p>
          <div class="asset-grid character-grid">
            <figure><img src="${assetPath(assets.researcherWebp)}" alt="研究者居民角色" /><figcaption>研究者</figcaption></figure>
            <figure><img src="${assetPath(assets.skepticWebp)}" alt="怀疑者居民角色" /><figcaption>怀疑者</figcaption></figure>
            <figure><img src="${assetPath(assets.executorWebp)}" alt="执行者居民角色" /><figcaption>执行者</figcaption></figure>
            <figure><img src="${assetPath(assets.inspectorWebp)}" alt="巡城官角色" /><figcaption>巡城官</figcaption></figure>
          </div>
        </section>

        <section class="worldview">
          <h2>设计思路</h2>
          <div class="principle-grid">
            <article>
              <h3>世界地图先行</h3>
              <p>2.0 首页展示 8 个明确建筑入口，让用户先理解城邦职责，再进入具体讨论。</p>
            </article>
            <article>
              <h3>议会成为主舞台</h3>
              <p>居民发言、采纳、修缮令和卷轴报告集中发生，避免多个面板同时争夺注意力。</p>
            </article>
            <article>
              <h3>素材服务机制</h3>
              <p>建筑、场景和角色不是装饰，它们分别对应议题路径、工作流节点和 agent 职责。</p>
            </article>
          </div>
          <a class="text-link" href="https://github.com/brocademaple/siwei-city/blob/main/docs/current/version-history.md">阅读版本历史</a>
        </section>
      </main>
    `,
  });
}

function renderV1Page() {
  return pageShell({
    title: '思维城邦 1.0 迭代日志',
    description: '思维城邦 Siwei City 1.0 迭代日志：记录旧版美术资产、地图编排思路和升级到 2.0 的原因，正式项目默认进入 2.0 当前应用。',
    body: `
      <main class="page-shell">
        <nav class="top-nav">
          <a href="${githubBase}/">返回默认入口</a>
          <a href="${githubBase}/v2/">进入 2.0</a>
        </nav>
        <section class="hero">
          <div class="hero-copy">
            <span class="eyebrow">Version 1.0 Iteration Log</span>
            <h1>1.0：观点建筑地图</h1>
            <p>这页只作为 GitHub Pages 里的迭代记录保留，用来说明早期美术资产、地图编排和产品假设。正式项目入口已经收敛到 2.0。</p>
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
            <h2>形成地图编排</h2>
            <p>旧版采用 panorama 主视觉、建筑切片、城区底纹和道路关系来组织信息：建筑承载观点，城区暗示职能，道路解释观点之间为什么相连。</p>
          </article>
          <article>
            <span>03</span>
            <h2>保留角色雏形</h2>
            <p>研究者、实践者、怀疑者、执行者作为早期 agent 来函入口出现。它们还没有完整人格和席位，但已经验证了多视角碰撞的必要性。</p>
          </article>
          <article>
            <span>04</span>
            <h2>暴露升级问题</h2>
            <p>随着建筑和卡片增多，主页变得拥挤，用户很难知道第一步该做什么。2.0 因此把主页改成世界地图，把核心操作集中到冲突议会。</p>
          </article>
        </section>

        <section class="asset-board">
          <h2>美术资产与编排思路</h2>
          <p>旧素材不进入正式应用主线，但会作为版本迭代证据保留在 Pages 日志里，方便回看早期视觉方向和信息组织方式。</p>
          <div class="asset-grid">
            <figure><img src="${assetPath(assets.councilBuilding)}" alt="旧版议会建筑" /><figcaption>观点建筑</figcaption></figure>
            <figure><img src="${assetPath(assets.library)}" alt="旧版图书馆建筑" /><figcaption>归档隐喻</figcaption></figure>
            <figure><img src="${assetPath(assets.harbor)}" alt="旧版码头建筑" /><figcaption>行动码头</figcaption></figure>
            <figure><img src="${assetPath(assets.archive)}" alt="旧版档案城区" /><figcaption>证据档案</figcaption></figure>
          </div>
        </section>

        <section class="worldview">
          <span class="eyebrow">Why 2.0</span>
          <h2>从迭代记录回到正式项目</h2>
          <p>1.0 的结论是“空间化有记忆点，但入口负担太重”。2.0 继承城邦隐喻，把正式体验改为更直接的路径：首页只回答点哪里开始，议会只回答下一步做什么，其他建筑只回答闭环职责。</p>
          <div class="hero-actions">
            <a class="primary" href="${githubBase}/v2/">进入 2.0</a>
            <a class="secondary" href="${githubBase}/">返回默认入口</a>
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
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
    }
    .top-nav strong {
      margin-right: auto;
      color: rgba(255, 250, 232, 0.92);
      font-size: 15px;
      letter-spacing: 0;
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
    .design-panel,
    .scene-board,
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
    .version-card img,
    .scene-board img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .design-panel {
      display: grid;
      gap: 16px;
      padding: clamp(20px, 4vw, 38px);
    }
    .path-ribbon {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 8px;
    }
    .path-ribbon span {
      display: grid;
      min-height: 48px;
      place-items: center;
      padding: 8px;
      border: 1px solid rgba(40, 91, 130, 0.22);
      border-radius: 10px;
      background: rgba(255, 253, 242, 0.52);
      color: #3d2b1d;
      font-size: 14px;
      font-weight: 900;
      text-align: center;
    }
    .scene-board {
      display: grid;
      grid-template-columns: 1.25fr 0.75fr;
      gap: 14px;
      padding: 14px;
    }
    .scene-board figure {
      min-height: 0;
      margin: 0;
      overflow: hidden;
      border-radius: 12px;
      background: rgba(255, 253, 242, 0.5);
    }
    .scene-feature {
      display: grid;
      grid-template-rows: minmax(320px, 1fr) auto;
    }
    .scene-stack {
      display: grid;
      gap: 14px;
    }
    .scene-stack figure {
      display: grid;
      grid-template-rows: 190px auto;
    }
    .scene-board figcaption {
      display: grid;
      gap: 6px;
      padding: 14px;
      color: #57412b;
      font-size: 14px;
      font-weight: 800;
      line-height: 1.55;
      text-align: left;
    }
    .scene-board figcaption strong {
      color: var(--ink);
      font-size: 18px;
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
    .character-grid img {
      height: 178px;
    }
    .principle-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.95fr 0.95fr;
      gap: 12px;
    }
    .principle-grid article {
      display: grid;
      gap: 8px;
      padding: 18px;
      border-radius: 12px;
      background: rgba(255, 253, 242, 0.5);
    }
    .principle-grid h3 {
      margin: 0;
      color: var(--ink);
      font-size: 20px;
      line-height: 1.2;
    }
    .principle-grid p {
      font-size: 15px;
      line-height: 1.64;
    }
    .text-link {
      width: fit-content;
      color: var(--lapis);
      font-weight: 900;
      text-decoration-thickness: 2px;
      text-underline-offset: 4px;
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
      .asset-grid,
      .path-ribbon,
      .scene-board,
      .principle-grid {
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
