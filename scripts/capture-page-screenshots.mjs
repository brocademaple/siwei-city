import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const args = parseArgs(process.argv.slice(2));
const appUrl = args.url ?? process.env.SCREENSHOT_URL ?? 'http://127.0.0.1:5173/';
const outDir = path.resolve(rootDir, args.out ?? 'output/playwright/current-pages');
const width = Number(args.width ?? 1440);
const height = Number(args.height ?? 1200);
const chromePath =
  args.chrome ??
  process.env.CHROME_PATH ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const pages = [
  { name: '01_home_world_map_default', description: '主页世界地图：默认状态', action: async () => {} },
  { name: '02_home_world_map_scribe_open', description: '主页世界地图：展开议题设置', action: async (page) => page.clickText('换一个议题') },
  { name: '03_council_stage_initial', description: '冲突议会：初始状态', action: async (page) => page.clickText('送入冲突议会') },
  { name: '04_council_stage_complete_demo', description: '冲突议会：完成本轮演示后', action: async (page) => page.clickText('完成本轮演示') },
  { name: '05_home_service_drawer_01_walkthrough', description: '主页服务抽屉：全过程', action: async (page) => page.clickText('返回城邦') },
  { name: '06_home_service_drawer_02_roundtable', description: '主页服务抽屉：居民席位', action: async (page) => page.clickText('居民席位') },
  { name: '07_home_service_drawer_03_inspector', description: '主页服务抽屉：巡城官塔', action: async (page) => page.clickText('巡城官塔') },
  { name: '08_home_service_drawer_04_archive', description: '主页服务抽屉：卷轴馆', action: async (page) => page.clickText('卷轴馆') },
  { name: '09_building_01_grand_library', description: '建筑页：大图书馆', action: async (page) => page.closeDrawerThenOpenBuilding('大图书馆') },
  { name: '10_building_02_residential_quarter', description: '建筑页：居民区', action: async (page) => page.openBuilding('居民区') },
  { name: '11_building_03_hypothesis_harbor', description: '建筑页：假设码头', action: async (page) => page.openBuilding('假设码头') },
  { name: '12_building_04_action_harbor', description: '建筑页：行动码头', action: async (page) => page.openBuilding('行动码头') },
  { name: '13_building_05_contemplation_garden', description: '建筑页：沉思庭院', action: async (page) => page.openBuilding('沉思庭院') },
  { name: '14_building_06_memory_cemetery', description: '建筑页：记忆墓园 / 废案馆', action: async (page) => page.openBuilding('记忆墓园') },
  { name: '15_building_07_lighthouse_watchtower', description: '建筑页：灯塔 / 巡城塔', action: async (page) => page.openBuilding('灯塔') },
];

async function main() {
  if (!existsSync(chromePath)) {
    throw new Error(`Chrome executable was not found: ${chromePath}`);
  }

  const response = await fetch(appUrl).catch((error) => {
    throw new Error(`Could not reach ${appUrl}. Start the app first with: npm run dev -- --host 127.0.0.1\n${error.message}`);
  });
  if (!response.ok) {
    throw new Error(`Could not reach ${appUrl}. HTTP ${response.status}`);
  }

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const chrome = await launchChrome();
  const page = await ChromePage.connect(chrome.pageWsUrl);
  const manifest = [];

  try {
    await page.setupViewport(width, height);
    await page.navigate(appUrl);
    await page.waitForApp();
    await page.waitForSettled();
    await captureItem(page, manifest, {
      name: '00_onboarding_guide_initial_overlay',
      description: '首次打开：新手指引首屏浮层',
    });
    await page.evaluate(`
      (() => {
        localStorage.setItem('siwei-city-guide-complete', 'true');
        localStorage.removeItem('siwei-city-session-v2');
        localStorage.removeItem('siwei-city-history-v1');
      })()
    `);
    await page.navigate(withCacheBust(appUrl));
    await page.waitForApp();

    for (const item of pages) {
      await item.action(page);
      await page.waitForSettled();
      await captureItem(page, manifest, item);

      if (item.name.startsWith('09_building_') || item.name.startsWith('10_building_') || item.name.startsWith('11_building_') || item.name.startsWith('12_building_') || item.name.startsWith('13_building_') || item.name.startsWith('14_building_')) {
        await page.clickText('返回城邦');
        await page.waitForSettled();
      }
    }

    await writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    await writeFile(path.join(outDir, 'README.md'), buildReadme(manifest));
    console.log(`Captured ${manifest.length} screenshots in ${outDir}`);
  } finally {
    await page.close().catch(() => {});
    await stopChrome(chrome.process);
    await rm(chrome.userDataDir, { recursive: true, force: true }).catch(() => {});
  }
}

class ChromePage {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();

    ws.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result ?? {});
        return;
      }

      const handlers = this.events.get(message.method) ?? [];
      handlers.forEach((handler) => handler(message.params ?? {}));
    });
  }

  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', () => reject(new Error(`Could not connect to ${wsUrl}`)), { once: true });
    });
    const page = new ChromePage(ws);
    await page.send('Page.enable');
    await page.send('Runtime.enable');
    return page;
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  once(method) {
    return new Promise((resolve) => {
      const handlers = this.events.get(method) ?? [];
      const handler = (params) => {
        this.events.set(method, handlers.filter((item) => item !== handler));
        resolve(params);
      };
      this.events.set(method, [...handlers, handler]);
    });
  }

  async setupViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
  }

  async navigate(url) {
    const loaded = this.once('Page.loadEventFired');
    await this.send('Page.navigate', { url });
    await loaded;
  }

  async waitForApp() {
    await this.waitForExpression('Boolean(document.querySelector(".app-shell"))');
  }

  async waitForSettled() {
    await this.waitForExpression('document.readyState === "complete"');
    await this.evaluate(`
      Promise.all(Array.from(document.images)
        .filter((img) => !img.complete)
        .map((img) => new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        })))
    `, { awaitPromise: true });
    await sleep(500);
  }

  async waitForExpression(expression, timeoutMs = 6000) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const result = await this.evaluate(expression);
      if (result.value) return;
      await sleep(100);
    }
    throw new Error(`Timed out waiting for expression: ${expression}`);
  }

  async evaluate(expression, options = {}) {
    const result = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: Boolean(options.awaitPromise),
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text ?? 'Runtime.evaluate failed');
    }
    return result.result ?? {};
  }

  async clickText(text) {
    const result = await this.evaluate(`
      (() => {
        const needle = ${JSON.stringify(text)};
        const candidates = Array.from(document.querySelectorAll('button, a, summary, [role="button"]'));
        const target = candidates.find((el) => {
          const label = [el.textContent, el.getAttribute('aria-label')]
            .filter(Boolean)
            .join(' ')
            .replace(/\\s+/g, ' ')
            .trim();
          return label.includes(needle);
        });
        if (!target) {
          return {
            ok: false,
            available: candidates.slice(0, 80).map((el) => (el.textContent || el.getAttribute('aria-label') || '').replace(/\\s+/g, ' ').trim()).filter(Boolean),
          };
        }
        target.scrollIntoView({ block: 'center', inline: 'center' });
        const rect = target.getBoundingClientRect();
        return {
          ok: true,
          label: (target.textContent || target.getAttribute('aria-label') || '').replace(/\\s+/g, ' ').trim(),
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      })()
    `);
    if (!result.value?.ok) {
      throw new Error(`Could not click text "${text}". Available controls: ${(result.value?.available ?? []).join(' | ')}`);
    }
    await this.clickAt(result.value.x, result.value.y);
  }

  async openBuilding(name) {
    const result = await this.evaluate(`
      (() => {
        const needle = ${JSON.stringify(name)};
        const markers = Array.from(document.querySelectorAll('.world-marker'));
        const markerLabel = (marker) =>
          [marker.textContent, marker.getAttribute('aria-label')]
            .filter(Boolean)
            .join(' ')
            .replace(/\\s+/g, ' ')
            .trim();
        const target = markers.find((marker) => markerLabel(marker).includes(needle));
        if (!target) {
          return {
            ok: false,
            available: markers.map(markerLabel),
          };
        }
        target.scrollIntoView({ block: 'center', inline: 'center' });
        const rect = target.getBoundingClientRect();
        return {
          ok: true,
          label: markerLabel(target),
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      })()
    `);
    if (!result.value?.ok) {
      throw new Error(`Could not open building "${name}". Available buildings: ${(result.value?.available ?? []).join(' | ')}`);
    }
    await this.clickAt(result.value.x, result.value.y);
  }

  async closeDrawerThenOpenBuilding(name) {
    const drawerOpen = await this.evaluate('Boolean(document.querySelector(".service-drawer.open"))');
    if (drawerOpen.value) {
      await this.clickText('收起');
      await this.waitForSettled();
    }
    await this.openBuilding(name);
  }

  async clickAt(x, y) {
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x,
      y,
      button: 'none',
      buttons: 0,
      pointerType: 'mouse',
    });
    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      buttons: 1,
      clickCount: 1,
      pointerType: 'mouse',
    });
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      buttons: 0,
      clickCount: 1,
      pointerType: 'mouse',
    });
  }

  async screenshot(filePath) {
    const metrics = await this.send('Page.getLayoutMetrics');
    const contentSize = metrics.contentSize ?? {};
    const screenshotWidth = Math.ceil(Math.max(contentSize.width ?? 0, width));
    const screenshotHeight = Math.ceil(Math.max(contentSize.height ?? 0, height));
    const { data } = await this.send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: true,
      clip: {
        x: 0,
        y: 0,
        width: screenshotWidth,
        height: screenshotHeight,
        scale: 1,
      },
    });
    await writeFile(filePath, Buffer.from(data, 'base64'));
  }

  async close() {
    if (this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING) return;
    this.ws.close();
    await Promise.race([
      new Promise((resolve) => this.ws.addEventListener('close', resolve, { once: true })),
      sleep(500),
    ]);
  }
}

async function launchChrome() {
  const userDataDir = path.join(outDir, '.chrome-profile');
  await rm(userDataDir, { recursive: true, force: true });
  await mkdir(userDataDir, { recursive: true });

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    `--window-size=${width},${height}`,
    'about:blank',
  ], {
    stdio: ['ignore', 'ignore', 'pipe'],
  });

  const pageWsUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out waiting for Chrome DevTools URL')), 10000);
    chrome.stderr.on('data', async (chunk) => {
      const text = String(chunk);
      const match = text.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:(\d+)\/devtools\/browser\/[^\s]+)/);
      if (!match) return;
      clearTimeout(timer);
      try {
        const port = match[2];
        const targets = await waitForTargets(port);
        const pageTarget = targets.find((target) => target.type === 'page');
        if (!pageTarget?.webSocketDebuggerUrl) {
          reject(new Error('Chrome started but no page target was found'));
          return;
        }
        resolve(pageTarget.webSocketDebuggerUrl);
      } catch (error) {
        reject(error);
      }
    });
    chrome.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Chrome exited before DevTools became available. Exit code: ${code}`));
    });
  });

  return { process: chrome, pageWsUrl, userDataDir };
}

async function waitForTargets(port) {
  const url = `http://127.0.0.1:${port}/json/list`;
  const startedAt = Date.now();
  while (Date.now() - startedAt < 5000) {
    const response = await fetch(url).catch(() => null);
    if (response?.ok) return response.json();
    await sleep(100);
  }
  throw new Error(`Timed out waiting for Chrome targets at ${url}`);
}

async function stopChrome(chromeProcess) {
  if (chromeProcess.exitCode !== null || chromeProcess.signalCode !== null) return;
  chromeProcess.kill('SIGTERM');
  const exited = await Promise.race([
    once(chromeProcess, 'exit').then(() => true),
    sleep(1200).then(() => false),
  ]);
  if (!exited && chromeProcess.exitCode === null && chromeProcess.signalCode === null) {
    chromeProcess.kill('SIGKILL');
    await Promise.race([
      once(chromeProcess, 'exit').catch(() => undefined),
      sleep(500),
    ]);
  }
}

function buildReadme(manifest) {
  const lines = [
    '# Current Page Screenshots',
    '',
    `Generated from: ${appUrl}`,
    `Viewport: ${width}x${height}`,
    '',
    'Scope: current navigable React app states, onboarding overlay steps, homepage service drawer tabs, council states, and building scenes. Screenshots use Chrome full-document capture at the configured viewport.',
    '',
    '| File | State |',
    '| --- | --- |',
    ...manifest.map((item) => `| [${item.file}](./${item.file}) | ${item.description} |`),
    '',
  ];
  return lines.join('\n');
}

async function captureItem(page, manifest, item) {
  const filename = `${item.name}.png`;
  await page.screenshot(path.join(outDir, filename));
  manifest.push({
    name: item.name,
    description: item.description,
    file: filename,
    url: appUrl,
    viewport: { width, height },
  });
}

function withCacheBust(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}captureScreenshots=${Date.now()}`;
}

function parseArgs(argv) {
  return argv.reduce((parsed, arg) => {
    if (!arg.startsWith('--')) return parsed;
    const [key, value = true] = arg.slice(2).split('=');
    parsed[key] = value;
    return parsed;
  }, {});
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
