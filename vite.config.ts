import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode.startsWith('github-pages') ? '/siwei-city/v2/' : '/',
  plugins: [react(), mimoDevProxy(mode)],
}));

function mimoDevProxy(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    name: 'siwei-city-mimo-dev-proxy',
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
        const baseUrl = env.MIMO_BASE_URL ?? 'https://token-plan-cn.xiaomimimo.com/v1';
        const model = env.MIMO_MODEL ?? 'mimo-v2.5-pro';

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
                getUpstreamErrorMessage(payload) ?? 'Mimo request failed',
                upstream.status,
                upstream.status === 408 || upstream.status === 429 || upstream.status >= 500,
                payload,
              ),
            );
            return;
          }
          sendJson(response, 200, withMimoDiagnostics(payload, model, env));
        } catch (error) {
          sendJson(response, 500, buildError('network_error', error instanceof Error ? error.message : 'Unknown Mimo proxy error', 500, true));
        }
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

function withMimoDiagnostics(payload: any, model: string, env: Record<string, string>) {
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
      provider: 'mimo',
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
