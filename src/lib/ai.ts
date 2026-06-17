import { getDiscussionMode } from './modes';
import { councilResidentIds, getResidentProfile } from './residents';
import type { DiscussionMode, IdeaNode, RoundtableTurn, Route, UsageLedger } from '../types';

export interface AiDraft {
  ideas: Pick<IdeaNode, 'title' | 'body' | 'type' | 'districtId' | 'authorRole'>[];
  turns: Pick<RoundtableTurn, 'role' | 'title' | 'body' | 'type' | 'districtId' | 'relation' | 'respondsTo'>[];
}

export interface AiDraftResult {
  draft?: AiDraft;
  ledger: UsageLedger;
}

const proxyUrl = import.meta.env.VITE_MIMO_PROXY_URL ?? '/api/mimo/chat';
const inputPriceCny = Number(import.meta.env.VITE_MIMO_INPUT_PRICE_CNY_PER_1K ?? 0);
const outputPriceCny = Number(import.meta.env.VITE_MIMO_OUTPUT_PRICE_CNY_PER_1K ?? 0);

export async function requestAiDraft(topic: string, mode: DiscussionMode, ideas: IdeaNode[], routes: Route[]): Promise<AiDraftResult> {
  const config = getDiscussionMode(mode);
  const messages = [
    {
      role: 'system',
      content:
        `你是思维城邦议会的多 agent 调度器。只输出 JSON，不要 markdown。输出必须包含 ideas 和 turns 两个数组。ideas 是首批观点建筑；turns 是居民圆桌发言。所有内容使用中文，短而具体。居民角色设定：${councilResidentIds
          .map((id) => getResidentProfile(id))
          .filter((profile) => ['研究者', '怀疑者', '实践者', '执行者'].includes(profile.roleName))
          .map((profile) => `${profile.title}（${profile.roleName}）=${profile.promptBrief}`)
          .join('；')}`,
    },
    {
      role: 'user',
      content: JSON.stringify({
        topic,
        mode: config.label,
        modeDescription: config.description,
        modeSteps: config.steps,
        existingIdeas: ideas.map(({ id, title, type, authorRole }) => ({ id, title, type, authorRole })),
        existingRoutes: routes,
        outputShape: {
          ideas: [{ title: 'string', body: 'string', type: 'question|hypothesis|evidence|counter|action', districtId: 'questions|hypothesis|evidence|conflict|action', authorRole: '我|实践者|研究者|怀疑者|执行者' }],
          turns: [{ role: '实践者|研究者|怀疑者|执行者', title: 'string', body: 'string', type: 'question|hypothesis|evidence|counter|action', districtId: 'questions|hypothesis|evidence|conflict|action', relation: '支持|冲突|依赖|延伸|回流', respondsTo: 'string' }],
        },
      }),
    },
  ];

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    const text = await response.text();
    const payload = parseJsonResponse(text, 'Mimo 代理返回了非 JSON 内容');
    if (!response.ok) {
      throw new Error(formatProxyError(payload, response.status));
    }
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Mimo 返回成功状态，但 choices[0].message.content 为空，已使用本地模板。');
    }
    const parsed = parseJsonResponse(content, 'Mimo 返回内容不是合法 JSON，已使用本地模板。');
    const usageResult = readUsage(payload, messages, content);
    return {
      draft: parsed,
      ledger: {
        engine: 'AI 推演',
        status: 'ready',
        calls: 1,
        inputTokens: usageResult.inputTokens,
        outputTokens: usageResult.outputTokens,
        estimatedCostCny: usageResult.estimatedCostCny,
        usageSource: usageResult.source,
        usageWarning: usageResult.warning,
      },
    };
  } catch (error) {
    const message =
      error instanceof SyntaxError
        ? withFallbackSuffix(error.message)
        : error instanceof TypeError
          ? '无法连接 Mimo 代理，请确认 Vite dev server 或 Vercel function 可访问；已使用本地模板。'
          : error instanceof Error
            ? error.message
            : 'AI 推演不可用，已回退到本地模板。';
    return {
      ledger: {
        engine: '本地模板',
        status: 'fallback',
        calls: 1,
        inputTokens: estimateTokens(JSON.stringify(messages)),
        outputTokens: 0,
        estimatedCostCny: 0,
        usageSource: 'estimated',
        lastError: message,
      },
    };
  }
}

function withFallbackSuffix(message: string) {
  return message.includes('已使用本地模板') ? message : `${message}，已使用本地模板。`;
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
    const retryHint = error.retryable ? '稍后重试或检查 Mimo 服务状态' : '请检查 API Key、模型名和额度';
    return `Mimo 上游请求失败（${error.status ?? status}）：${error.message}。${retryHint}，已使用本地模板。`;
  }
  if (error?.type === 'network_error') return `Mimo 代理请求上游失败：${error.message}，已使用本地模板。`;
  return `Mimo proxy failed: ${status}，已使用本地模板。`;
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
    warning: hasProviderUsage ? undefined : 'Mimo 未返回完整 usage，账簿用本地字符估算 token 和费用。',
  };
}

function readTokenCount(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function estimateTokens(text: string) {
  return Math.ceil(text.length / 1.8);
}

function estimateCost(inputTokens: number, outputTokens: number) {
  return Number(((inputTokens / 1000) * inputPriceCny + (outputTokens / 1000) * outputPriceCny).toFixed(4));
}
