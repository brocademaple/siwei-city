import type { UsageLedger } from '../../types';

export interface GatewayMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GatewayJsonResult {
  json?: unknown;
  rawContent?: string;
  ledger: UsageLedger;
}

const proxyUrl = import.meta.env.VITE_MIMO_PROXY_URL ?? '/api/mimo/chat';
const inputPriceCny = Number(import.meta.env.VITE_MIMO_INPUT_PRICE_CNY_PER_1K ?? 0);
const outputPriceCny = Number(import.meta.env.VITE_MIMO_OUTPUT_PRICE_CNY_PER_1K ?? 0);

export async function requestGatewayJson(messages: GatewayMessage[], purpose: string): Promise<GatewayJsonResult> {
  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    const text = await response.text();
    const payload = parseJsonResponse(text, 'AI 网关代理返回了非 JSON 内容');
    if (!response.ok) {
      throw new Error(formatProxyError(payload, response.status));
    }

    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new Error(`${purpose} 返回成功，但 choices[0].message.content 为空。`);
    }

    const parsed = parseJsonResponse(content, `${purpose} 返回内容不是合法 JSON。`);
    const usageResult = readUsage(payload, messages, content);
    return {
      json: parsed,
      rawContent: content,
      ledger: {
        engine: 'AI 推演',
        status: 'ready',
        calls: 1,
        inputTokens: usageResult.inputTokens,
        outputTokens: usageResult.outputTokens,
        estimatedCostCny: usageResult.estimatedCostCny,
        usageSource: usageResult.source,
        usageWarning: usageResult.warning,
        model: readModel(payload?.diagnostics?.model) ?? readModel(payload?.model),
      },
    };
  } catch (error) {
    return {
      ledger: {
        engine: '本地模板',
        status: 'fallback',
        calls: 1,
        inputTokens: estimateTokens(JSON.stringify(messages)),
        outputTokens: 0,
        estimatedCostCny: 0,
        usageSource: 'estimated',
        lastError: toFallbackMessage(error),
      },
    };
  }
}

export function mergeLedgers(results: GatewayJsonResult[], fallbackMessage?: string): UsageLedger {
  const calls = results.reduce((sum, result) => sum + result.ledger.calls, 0);
  const inputTokens = results.reduce((sum, result) => sum + result.ledger.inputTokens, 0);
  const outputTokens = results.reduce((sum, result) => sum + result.ledger.outputTokens, 0);
  const estimatedCostCny = Number(results.reduce((sum, result) => sum + result.ledger.estimatedCostCny, 0).toFixed(4));
  const errors = results.map((result) => result.ledger.lastError).filter(Boolean);
  const hasAi = results.some((result) => result.ledger.engine === 'AI 推演' && result.ledger.status === 'ready');
  const hasFallback = results.some((result) => result.ledger.status === 'fallback');

  return {
    engine: hasAi ? 'AI 推演' : '本地模板',
    status: hasFallback && !hasAi ? 'fallback' : 'ready',
    calls,
    inputTokens,
    outputTokens,
    estimatedCostCny,
    usageSource: results.every((result) => result.ledger.usageSource === 'provider') ? 'provider' : 'estimated',
    usageWarning: hasFallback ? '部分 agent 未通过网关或校验，已用本地模板补齐。' : undefined,
    lastError: errors[0] ?? fallbackMessage,
    model: results.map((result) => result.ledger.model).find(Boolean),
  };
}

export function fallbackLedger(message: string, calls = 1): UsageLedger {
  return {
    engine: '本地模板',
    status: 'fallback',
    calls,
    inputTokens: 0,
    outputTokens: 0,
    estimatedCostCny: 0,
    usageSource: 'estimated',
    lastError: message,
  };
}

function toFallbackMessage(error: unknown) {
  if (error instanceof SyntaxError) return withFallbackSuffix(error.message);
  if (error instanceof TypeError) return '无法连接 AI 网关代理，已使用本地模板。';
  if (error instanceof Error) return withFallbackSuffix(error.message);
  return 'AI 推演不可用，已回退到本地模板。';
}

function withFallbackSuffix(message: string) {
  return message.includes('本地模板') ? message : `${message}，已使用本地模板。`;
}

function parseJsonResponse(text: string, fallbackMessage: string) {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new SyntaxError(fallbackMessage);
  }
}

function formatProxyError(payload: any, status: number) {
  const error = payload?.error;
  if (typeof error === 'string') return `${error}，已使用本地模板。`;
  if (error?.type === 'config_error') return `${error.message}。请在 .env.local 或 Vercel 中配置 MIMO_API_KEY，已使用本地模板。`;
  if (error?.type === 'validation_error') return `${error.message}，已使用本地模板。`;
  if (error?.type === 'upstream_error') {
    const retryHint = error.retryable ? '稍后重试或检查 AI 网关服务状态' : '请检查 API Key、模型名和额度';
    return `AI 网关上游请求失败（${error.status ?? status}）：${error.message}。${retryHint}，已使用本地模板。`;
  }
  if (error?.type === 'network_error') return `AI 网关代理请求上游失败：${error.message}，已使用本地模板。`;
  return `AI gateway proxy failed: ${status}，已使用本地模板。`;
}

function readUsage(payload: any, messages: unknown[], content: string) {
  const providerUsage = payload.usage ?? {};
  const diagnosticUsage = payload.diagnostics?.usage ?? {};
  const providerInputTokens = readTokenCount(providerUsage.prompt_tokens);
  const providerOutputTokens = readTokenCount(providerUsage.completion_tokens);
  const diagnosticInputTokens = readTokenCount(diagnosticUsage.promptTokens);
  const diagnosticOutputTokens = readTokenCount(diagnosticUsage.completionTokens);
  const inputTokens = providerInputTokens ?? diagnosticInputTokens ?? estimateTokens(JSON.stringify(messages));
  const outputTokens = providerOutputTokens ?? diagnosticOutputTokens ?? estimateTokens(content);
  const hasProviderUsage = providerInputTokens !== undefined && providerOutputTokens !== undefined;
  const proxyCost = readTokenCount(payload.diagnostics?.cost?.estimatedCostCny);

  return {
    inputTokens,
    outputTokens,
    estimatedCostCny: proxyCost ?? estimateCost(inputTokens, outputTokens),
    source: hasProviderUsage ? ('provider' as const) : ('estimated' as const),
    warning: hasProviderUsage ? undefined : 'AI 网关未返回完整 usage，账簿用本地字符估算 token 和费用。',
  };
}

function readTokenCount(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function readModel(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function estimateTokens(text: string) {
  return Math.ceil(text.length / 1.8);
}

function estimateCost(inputTokens: number, outputTokens: number) {
  return Number(((inputTokens / 1000) * inputPriceCny + (outputTokens / 1000) * outputPriceCny).toFixed(4));
}
