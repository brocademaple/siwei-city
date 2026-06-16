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
          sendJson(response, 405, { error: 'Method not allowed' });
          return;
        }

        const apiKey = env.MIMO_API_KEY;
        const baseUrl = env.MIMO_BASE_URL ?? 'https://token-plan-cn.xiaomimimo.com/v1';
        const model = env.MIMO_MODEL ?? 'mimo-v2.5-pro';

        if (!apiKey || apiKey.includes('replace-with')) {
          sendJson(response, 501, { error: 'MIMO_API_KEY is not configured in .env.local' });
          return;
        }

        try {
          const body = JSON.parse(await readRequestBody(request));
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
          const payload = await upstream.json();
          if (!upstream.ok) {
            sendJson(response, upstream.status, { error: payload.error?.message ?? 'Mimo request failed', raw: payload });
            return;
          }
          sendJson(response, 200, payload);
        } catch (error) {
          sendJson(response, 500, { error: error instanceof Error ? error.message : 'Unknown Mimo proxy error' });
        }
      });
    },
  };
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
