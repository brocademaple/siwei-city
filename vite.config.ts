import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode.startsWith('github-pages') ? '/siwei-city/v2/' : '/',
  plugins: [react(), aiGatewayDevProxy(mode), cityStorageDevProxy()],
}));

function aiGatewayDevProxy(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    name: 'siwei-city-ai-gateway-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/mimo/chat', async (request, response) => {
        if (request.method === 'OPTIONS') {
          response.statusCode = 204;
          response.end();
          return;
        }

        if (request.method !== 'POST') {
          sendJson(response, 405, buildError('validation_error', 'Method not allowed', 405, false));
          return;
        }

        const apiKey = env.MIMO_API_KEY;
        const baseUrl = env.MIMO_BASE_URL ?? 'https://ops-ai-gateway.yc345.tv/v1';
        const model = env.MIMO_MODEL ?? 'deepseek-v4-flash';

        if (!apiKey || apiKey.includes('replace-with')) {
          sendJson(response, 501, buildError('config_error', 'MIMO_API_KEY is not configured in .env.local', 501, false));
          return;
        }

        try {
          const body = JSON.parse(await readRequestBody(request));
          const validationError = validateMimoRequestBody(body);
          if (validationError) {
            sendJson(response, 400, buildError('validation_error', validationError, 400, false));
            return;
          }

          const upstream = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              temperature: 0.72,
              response_format: { type: 'json_object' },
              messages: body.messages,
            }),
          });
          const payload = await readUpstreamJson(upstream);
          if (!upstream.ok) {
            sendJson(
              response,
              upstream.status,
              buildError(
                'upstream_error',
                getUpstreamErrorMessage(payload) ?? 'AI gateway request failed',
                upstream.status,
                upstream.status === 408 || upstream.status === 429 || upstream.status >= 500,
                payload,
              ),
            );
            return;
          }
          sendJson(response, 200, withAiGatewayDiagnostics(payload, model, env));
        } catch (error) {
          sendJson(response, 500, buildError('network_error', error instanceof Error ? error.message : 'Unknown AI gateway proxy error', 500, true));
        }
      });
    },
  };
}

function cityStorageDevProxy(): Plugin {
  const current = new Map<string, any>();
  const history = new Map<string, any[]>();
  const records = new Map<string, any[]>();
  return {
    name: 'siwei-city-storage-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/cities', async (request, response) => {
        if (request.method === 'OPTIONS') {
          response.statusCode = 204;
          response.end();
          return;
        }

        const url = new URL(request.url ?? '/', 'http://localhost');
        const path = url.pathname.replace(/\/$/, '');
        const body = request.method === 'GET' ? {} : JSON.parse(await readRequestBody(request));
        const clientId = readClientId(url, body);

        if (path === '/records' && request.method === 'GET') {
          sendJson(response, 200, { records: records.get(clientId) ?? [], storage: 'sql-api-memory' });
          return;
        }

        if (path === '/records' && request.method === 'POST') {
          const validationError = validateDiscussionRecord(body.record);
          if (validationError) {
            sendJson(response, 400, buildError('city_storage_error', validationError, 400, false));
            return;
          }
          const record = { ...body.record, storageSource: 'sql-api' };
          const nextRecords = [record, ...(records.get(clientId) ?? []).filter((item) => item.id !== record.id)].slice(0, 48);
          records.set(clientId, nextRecords);
          sendJson(response, 200, { record, records: nextRecords, storage: 'sql-api-memory' });
          return;
        }

        const recordMatch = path.match(/^\/records\/([^/]+)$/);
        if (recordMatch && request.method === 'PUT') {
          const validationError = validateDiscussionRecord(body.record);
          if (validationError || body.record.id !== decodeURIComponent(recordMatch[1])) {
            sendJson(response, 400, buildError('city_storage_error', validationError ?? 'Record id mismatch', 400, false));
            return;
          }
          const record = { ...body.record, storageSource: 'sql-api' };
          const nextRecords = [record, ...(records.get(clientId) ?? []).filter((item) => item.id !== record.id)].slice(0, 48);
          records.set(clientId, nextRecords);
          sendJson(response, 200, { record, records: nextRecords, storage: 'sql-api-memory' });
          return;
        }

        if (path === '/current' && request.method === 'GET') {
          sendJson(response, 200, { snapshot: current.get(clientId) ?? null, storage: 'sql-api-memory' });
          return;
        }

        if (path === '/current' && request.method === 'PUT') {
          const validationError = validateCitySnapshot(body.snapshot);
          if (validationError) {
            sendJson(response, 400, buildError('city_storage_error', validationError, 400, false));
            return;
          }
          const snapshot = { ...body.snapshot, savedAt: new Date().toISOString(), storageSource: 'sql-api' };
          current.set(clientId, snapshot);
          sendJson(response, 200, { snapshot, storage: 'sql-api-memory' });
          return;
        }

        if (path === '' && request.method === 'GET') {
          sendJson(response, 200, { cities: history.get(clientId) ?? [], storage: 'sql-api-memory' });
          return;
        }

        if (path === '/archive' && request.method === 'POST') {
          const validationError = validateCitySnapshot(body.snapshot);
          if (validationError) {
            sendJson(response, 400, buildError('city_storage_error', validationError, 400, false));
            return;
          }
          const city = snapshotToSavedCity(body.snapshot);
          const cities = [city, ...(history.get(clientId) ?? [])].slice(0, 24);
          history.set(clientId, cities);
          current.set(clientId, { ...body.snapshot, savedAt: city.savedAt, storageSource: 'sql-api' });
          sendJson(response, 200, { city, cities, storage: 'sql-api-memory' });
          return;
        }

        const restoreMatch = path.match(/^\/([^/]+)\/restore$/);
        if (restoreMatch && request.method === 'POST') {
          const city = (history.get(clientId) ?? []).find((item) => item.id === decodeURIComponent(restoreMatch[1]));
          if (!city) {
            sendJson(response, 404, buildError('city_storage_error', 'City not found', 404, false));
            return;
          }
          const snapshot = savedCityToSnapshot(city);
          current.set(clientId, snapshot);
          sendJson(response, 200, { snapshot, storage: 'sql-api-memory' });
          return;
        }

        const cityMatch = path.match(/^\/([^/]+)$/);
        if (cityMatch && request.method === 'GET') {
          const city = (history.get(clientId) ?? []).find((item) => item.id === decodeURIComponent(cityMatch[1]));
          if (!city) {
            sendJson(response, 404, buildError('city_storage_error', 'City not found', 404, false));
            return;
          }
          sendJson(response, 200, { city, storage: 'sql-api-memory' });
          return;
        }

        sendJson(response, 405, buildError('validation_error', 'Method not allowed', 405, false));
      });
    },
  };
}

function validateMimoRequestBody(body: any) {
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return 'Request body must include a non-empty messages array';
  }
  const invalidMessage = body.messages.find((message: any) => !message || typeof message.role !== 'string' || typeof message.content !== 'string');
  return invalidMessage ? 'Every message must include string role and content fields' : undefined;
}

function readClientId(url: URL, body: any) {
  const clientId = url.searchParams.get('clientId') ?? body?.clientId;
  return typeof clientId === 'string' && clientId.trim() ? clientId.trim() : 'local-demo';
}

function validateCitySnapshot(snapshot: any) {
  if (!snapshot || typeof snapshot.currentTopic !== 'string') return 'snapshot.currentTopic is required';
  if (!Array.isArray(snapshot.ideas)) return 'snapshot.ideas must be an array';
  if (!Array.isArray(snapshot.routes)) return 'snapshot.routes must be an array';
  if (!Array.isArray(snapshot.turns)) return 'snapshot.turns must be an array';
  return undefined;
}

function validateDiscussionRecord(record: any) {
  if (!record || typeof record.id !== 'string') return 'record.id is required';
  if (typeof record.topic !== 'string') return 'record.topic is required';
  if (!['pending', 'confirmed', 'rejected'].includes(record.status)) return 'record.status is invalid';
  if (!record.docs?.report || !record.docs?.action || !record.docs?.process) return 'record docs are required';
  if (record.parentRecordId !== undefined && typeof record.parentRecordId !== 'string') return 'record.parentRecordId is invalid';
  if (record.generation && !['ai', 'mixed', 'local'].includes(record.generation.kind)) return 'record.generation.kind is invalid';
  return undefined;
}

function snapshotToSavedCity(snapshot: any) {
  return {
    id: `city-${Date.now()}`,
    topic: snapshot.currentTopic,
    mode: snapshot.mode,
    ideas: snapshot.ideas,
    routes: snapshot.routes,
    turns: snapshot.turns,
    savedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    source: 'sql-api',
  };
}

function savedCityToSnapshot(city: any) {
  return {
    currentTopic: city.topic,
    mode: city.mode,
    ideas: city.ideas,
    routes: city.routes,
    turns: city.turns,
    acceptedContributionKeys: city.turns.filter((turn: any) => turn?.accepted).map((turn: any) => `${turn.role}:${turn.title}`),
    savedAt: city.savedAt,
    storageSource: 'sql-api',
  };
}

async function readUpstreamJson(upstream: Response) {
  const text = await upstream.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { rawText: text };
  }
}

function getUpstreamErrorMessage(payload: any) {
  if (typeof payload?.error === 'string') return payload.error;
  if (typeof payload?.error?.message === 'string') return payload.error.message;
  if (typeof payload?.message === 'string') return payload.message;
  return undefined;
}

function buildError(type: string, message: string, status: number, retryable: boolean, raw?: unknown) {
  return {
    error: {
      type,
      message,
      status,
      retryable,
    },
    ...(raw ? { raw } : {}),
  };
}

function withAiGatewayDiagnostics(payload: any, model: string, env: Record<string, string>) {
  const usage = payload?.usage ?? {};
  const promptTokens = readTokenCount(usage.prompt_tokens);
  const completionTokens = readTokenCount(usage.completion_tokens);
  const totalTokens = readTokenCount(usage.total_tokens) ?? (promptTokens !== undefined && completionTokens !== undefined ? promptTokens + completionTokens : undefined);
  const usageWarnings = [
    promptTokens === undefined ? 'missing prompt_tokens' : undefined,
    completionTokens === undefined ? 'missing completion_tokens' : undefined,
    totalTokens === undefined ? 'missing total_tokens' : undefined,
  ].filter(Boolean);
  const inputPrice = Number(env.MIMO_INPUT_PRICE_CNY_PER_1K ?? env.VITE_MIMO_INPUT_PRICE_CNY_PER_1K ?? 0);
  const outputPrice = Number(env.MIMO_OUTPUT_PRICE_CNY_PER_1K ?? env.VITE_MIMO_OUTPUT_PRICE_CNY_PER_1K ?? 0);
  const estimatedCostCny =
    promptTokens === undefined || completionTokens === undefined
      ? undefined
      : Number(((promptTokens / 1000) * inputPrice + (completionTokens / 1000) * outputPrice).toFixed(4));

  return {
    ...payload,
    diagnostics: {
      provider: 'ops-ai-gateway',
      model: payload?.model ?? model,
      usage: {
        source: usageWarnings.length ? 'missing_or_partial' : 'provider',
        promptTokens,
        completionTokens,
        totalTokens,
        warnings: usageWarnings,
      },
      cost: {
        inputPriceCnyPer1K: inputPrice,
        outputPriceCnyPer1K: outputPrice,
        estimatedCostCny,
      },
    },
  };
}

function readTokenCount(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function readRequestBody(request: import('node:http').IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => resolve(body || '{}'));
    request.on('error', reject);
  });
}

function sendJson(response: import('node:http').ServerResponse, statusCode: number, payload: unknown) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}
