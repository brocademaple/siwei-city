import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const appUrl = process.env.SCREENSHOT_URL ?? 'http://127.0.0.1:5178/';
const outDir = '/workspace/siwei-product/v2-harness';
const width = 1440;
const height = 900;
const chromePath = '/usr/bin/google-chrome';

async function main() {
  await mkdir(outDir, { recursive: true });
  const chrome = await launchChrome();
  const page = await ChromePage.connect(chrome.pageWsUrl);

  try {
    await page.setupViewport(width, height, 2);
    await page.navigate(appUrl);
    await page.waitForApp();
    await page.evaluate(`
      (() => {
        localStorage.setItem('siwei-city-guide-complete', 'true');
      })()
    `);
    await page.evaluate("window.location.reload()");
    await sleep(800);
    await page.waitForApp();
    await page.waitForSettled();

    // 00: 外层干净的城邦全景视图（居民按 Preset 向议会厅集结）
    await page.screenshot(path.join(outDir, '00-overworld-city-preset-convergence.png'));
    console.log('Saved 00-overworld-city-preset-convergence.png');

    // 进入议会厅 -> 室内俯视石刻博弈沙盘
    await page.clickText('踏入议会厅 · 石刻沙盘');
    await page.waitForSettled();

    // 01: 俯视石刻博弈沙盘主视图（PRESET I：立项与留存因果）
    await page.screenshot(path.join(outDir, '01-sandbox-preset-triage.png'));
    console.log('Saved 01-sandbox-preset-triage.png');

    // 02: 切换到另一套 Preset（PRESET III：发散与极简砍刀 Preset）
    await page.clickText('发散与极简砍刀');
    await page.waitForSettled();
    await page.screenshot(path.join(outDir, '02-preset-switch-comparison.png'));
    console.log('Saved 02-preset-switch-comparison.png');

    // 切回 PRESET I 并展开右侧羊皮长卷式「多维综合推演报告」
    await page.clickText('立项与留存因果');
    await page.waitForSettled();
    await page.clickText('多维推演长卷');
    await page.waitForSettled();
    await page.screenshot(path.join(outDir, '03-synthesis-scroll-report.png'));
    console.log('Saved 03-synthesis-scroll-report.png');

    // 04: 切换展开桌侧「大图书馆木格档案匣」（并点击提炼一枚新 Persona 印章展示交互）
    await page.clickText('大图书馆木匣');
    await page.waitForSettled();
    await page.clickText('+ 提炼本局 Persona 印');
    await page.waitForSettled();
    await page.screenshot(path.join(outDir, '04-library-persona-skill-vault.png'));
    console.log('Saved 04-library-persona-skill-vault.png');
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

  async setupViewport(w, h, dpr = 2) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: dpr,
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
      Promise.all([
        document.fonts ? document.fonts.ready : Promise.resolve(),
        ...Array.from(document.images)
          .filter((img) => !img.complete)
          .map((img) => new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          }))
      ])
    `, { awaitPromise: true });
    await sleep(600);
  }

  async waitForExpression(expression, timeoutMs = 8000) {
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
        const candidates = Array.from(document.querySelectorAll('button, a, summary, [role="button"], [role="tab"]'));
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
        target.click();
        return { ok: true };
      })()
    `);
    if (!result.value?.ok) {
      throw new Error(`Could not click text "${text}". Available: ${(result.value?.available ?? []).join(' | ')}`);
    }
  }

  async screenshot(filePath) {
    const { data } = await this.send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: false,
      clip: {
        x: 0,
        y: 0,
        width,
        height,
        scale: 1,
      },
    });
    await writeFile(filePath, Buffer.from(data, 'base64'));
  }

  async close() {
    if (this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING) return;
    this.ws.close();
  }
}

async function launchChrome() {
  const userDataDir = path.join(outDir, '.chrome-profile');
  await rm(userDataDir, { recursive: true, force: true });
  await mkdir(userDataDir, { recursive: true });

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
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
    const timer = setTimeout(() => reject(new Error('Timed out waiting for Chrome DevTools URL')), 12000);
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
  while (Date.now() - startedAt < 6000) {
    const response = await fetch(url).catch(() => null);
    if (response?.ok) return response.json();
    await sleep(100);
  }
  throw new Error(`Timed out waiting for Chrome targets at ${url}`);
}

async function stopChrome(chromeProcess) {
  if (chromeProcess.exitCode !== null || chromeProcess.signalCode !== null) return;
  chromeProcess.kill('SIGTERM');
  await Promise.race([
    once(chromeProcess, 'exit'),
    sleep(1500),
  ]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
