import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

loadDotEnv('.env');
loadDotEnv('.env.local');

const proxyUrl = resolveProxyUrl(readArg('--url') ?? process.env.VITE_MIMO_PROXY_URL ?? '/api/mimo/chat');

const messages = [
  {
    role: 'system',
    content: '你是思维城邦的联调探针。只输出 JSON，不要 markdown。',
  },
  {
    role: 'user',
    content: JSON.stringify({
      task: '返回最小可验证结构',
      outputShape: {
        ideas: [{ title: 'string', body: 'string', type: 'question', districtId: 'questions', authorRole: '研究者' }],
        turns: [{ role: '研究者', title: 'string', body: 'string', type: 'question', districtId: 'questions', relation: '延伸', respondsTo: 'probe' }],
      },
    }),
  },
];

const successPayload = await postJson(proxyUrl, { messages });
if (!successPayload.ok) {
  printFailure('真实 Mimo 路径请求失败', successPayload);
  process.exit(1);
}

const payload = successPayload.body;
const content = payload?.choices?.[0]?.message?.content;
assert(typeof content === 'string' && content.trim(), 'choices[0].message.content 缺失或为空');

const parsedContent = parseJson(content, 'choices[0].message.content 不是合法 JSON');
assert(Array.isArray(parsedContent.ideas), 'content.ideas 必须是数组');
assert(Array.isArray(parsedContent.turns), 'content.turns 必须是数组');

const usage = payload?.usage ?? {};
const promptTokens = readNumber(usage.prompt_tokens);
const completionTokens = readNumber(usage.completion_tokens);
const totalTokens = readNumber(usage.total_tokens);
assert(promptTokens !== undefined, 'usage.prompt_tokens 缺失');
assert(completionTokens !== undefined, 'usage.completion_tokens 缺失');
assert(totalTokens !== undefined, 'usage.total_tokens 缺失');

const diagnostics = payload?.diagnostics ?? {};
const estimatedCostCny = readNumber(diagnostics.cost?.estimatedCostCny);
assert(diagnostics.usage?.source === 'provider', 'diagnostics.usage.source 应为 provider');
assert(estimatedCostCny !== undefined, 'diagnostics.cost.estimatedCostCny 缺失');

const errorPayload = await postJson(proxyUrl, { messages: [] });
assert(!errorPayload.ok, '空 messages 请求应返回错误状态');
assert(errorPayload.body?.error?.type === 'validation_error', '错误结构缺少 error.type=validation_error');
assert(typeof errorPayload.body?.error?.message === 'string', '错误结构缺少 error.message');
assert(typeof errorPayload.body?.error?.status === 'number', '错误结构缺少 error.status');
assert(typeof errorPayload.body?.error?.retryable === 'boolean', '错误结构缺少 error.retryable');

console.log('Mimo proxy verification passed.');
console.log(
  JSON.stringify(
    {
      proxyUrl,
      model: diagnostics.model ?? payload.model ?? process.env.MIMO_MODEL,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostCny,
      priceInputCnyPer1K: diagnostics.cost?.inputPriceCnyPer1K ?? Number(process.env.VITE_MIMO_INPUT_PRICE_CNY_PER_1K ?? 0),
      priceOutputCnyPer1K: diagnostics.cost?.outputPriceCnyPer1K ?? Number(process.env.VITE_MIMO_OUTPUT_PRICE_CNY_PER_1K ?? 0),
      checkedErrorType: errorPayload.body.error.type,
    },
    null,
    2,
  ),
);

function readArg(name) {
  const prefix = `${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function resolveProxyUrl(value) {
  if (/^https?:\/\//.test(value)) return value;
  const normalizedPath = value.startsWith('/') ? value : `/${value}`;
  return `http://localhost:5173${normalizedPath}`;
}

async function postJson(url, body) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      body: text ? parseJson(text, `代理返回非 JSON：${text.slice(0, 160)}`) : {},
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      body: {
        error: {
          type: 'local_connection_error',
          message: error instanceof Error ? error.message : 'Unknown local connection error',
          status: 0,
          retryable: true,
        },
      },
    };
  }
}

function loadDotEnv(file) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) return;
  const body = readFileSync(path, 'utf8');
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

function parseJson(text, message) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(message);
  }
}

function readNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Mimo verification failed: ${message}`);
  }
}

function printFailure(title, result) {
  console.error(title);
  console.error(
    JSON.stringify(
      {
        proxyUrl,
        status: result.status,
        error: result.body?.error ?? result.body,
        hint: result.status === 0 ? '请先运行 npm run dev，或用 --url 指向已部署的 /api/mimo/chat。' : undefined,
      },
      null,
      2,
    ),
  );
}
