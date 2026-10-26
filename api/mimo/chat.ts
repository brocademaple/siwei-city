const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://brocademaple.github.io',
]);

export default async function handler(request: any, response: any) {
  const origin = request.headers.origin ?? '';
  if (allowedOrigins.has(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json(buildError('validation_error', 'Method not allowed', 405, false));
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.MIMO_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || process.env.MIMO_BASE_URL || 'https://api.deepseek.com/v1';
  const configuredModel = process.env.DEEPSEEK_MODEL || process.env.MIMO_MODEL || 'deepseek-chat';

  if (!apiKey) {
    response.status(501).json(buildError('config_error', 'DEEPSEEK_API_KEY is not configured', 501, false));
    return;
  }

  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    const validationError = validateRequestBody(body);
    if (validationError) {
      response.status(400).json(buildError('validation_error', validationError, 400, false));
      return;
    }

    const endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
    const isPublicDeepSeek = baseUrl.includes('api.deepseek.com');
    let usedModel = configuredModel;

    let upstream = await callUpstream(endpoint, apiKey, usedModel, body.messages, !isPublicDeepSeek);
    let payload = await readJson(upstream);

    if (!upstream.ok && (upstream.status === 400 || upstream.status === 404 || upstream.status === 422) && usedModel !== 'deepseek-chat') {
      usedModel = 'deepseek-chat';
      upstream = await callUpstream(endpoint, apiKey, usedModel, body.messages, false);
      payload = await readJson(upstream);
    }

    if (!upstream.ok) {
      response.status(upstream.status).json(
        buildError(
          'upstream_error',
          getUpstreamErrorMessage(payload) ?? 'DeepSeek gateway request failed',
          upstream.status,
          upstream.status === 408 || upstream.status === 429 || upstream.status >= 500,
          payload,
        ),
      );
      return;
    }

    response.status(200).json(withDiagnostics(payload, usedModel));
  } catch (error) {
    response
      .status(500)
      .json(buildError('network_error', error instanceof Error ? error.message : 'Unknown DeepSeek gateway proxy error', 500, true));
  }
}

async function callUpstream(endpoint: string, apiKey: string, model: string, messages: unknown[], includeThinkingDisabled: boolean) {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.72,
      response_format: { type: 'json_object' },
      ...(includeThinkingDisabled ? { thinking: { type: 'disabled' } } : {}),
      messages,
    }),
  });
}

function validateRequestBody(body: any) {
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return 'Request body must include a non-empty messages array';
  }
  const invalidMessage = body.messages.find((message: any) => !message || typeof message.role !== 'string' || typeof message.content !== 'string');
  return invalidMessage ? 'Every message must include string role and content fields' : undefined;
}

async function readJson(upstream: Response) {
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

function withDiagnostics(payload: any, model: string) {
  const usage = payload?.usage ?? {};
  const promptTokens = readTokenCount(usage.prompt_tokens);
  const completionTokens = readTokenCount(usage.completion_tokens);
  const totalTokens = readTokenCount(usage.total_tokens) ?? (promptTokens !== undefined && completionTokens !== undefined ? promptTokens + completionTokens : undefined);
  const usageWarnings = [
    promptTokens === undefined ? 'missing prompt_tokens' : undefined,
    completionTokens === undefined ? 'missing completion_tokens' : undefined,
    totalTokens === undefined ? 'missing total_tokens' : undefined,
  ].filter(Boolean);
  const inputPrice = Number(
    process.env.DEEPSEEK_INPUT_PRICE_CNY_PER_1K ??
      process.env.VITE_DEEPSEEK_INPUT_PRICE_CNY_PER_1K ??
      process.env.MIMO_INPUT_PRICE_CNY_PER_1K ??
      process.env.VITE_MIMO_INPUT_PRICE_CNY_PER_1K ??
      0,
  );
  const outputPrice = Number(
    process.env.DEEPSEEK_OUTPUT_PRICE_CNY_PER_1K ??
      process.env.VITE_DEEPSEEK_OUTPUT_PRICE_CNY_PER_1K ??
      process.env.MIMO_OUTPUT_PRICE_CNY_PER_1K ??
      process.env.VITE_MIMO_OUTPUT_PRICE_CNY_PER_1K ??
      0,
  );
  const estimatedCostCny =
    promptTokens === undefined || completionTokens === undefined
      ? undefined
      : Number(((promptTokens / 1000) * inputPrice + (completionTokens / 1000) * outputPrice).toFixed(4));

  return {
    ...payload,
    diagnostics: {
      provider: 'deepseek',
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
