import { getDiscussionMode } from './modes';
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
        '你是思维城邦的多 agent 调度器。只输出 JSON，不要 markdown。输出必须包含 ideas 和 turns 两个数组。ideas 是首批观点建筑；turns 是居民圆桌发言。所有内容使用中文，短而具体。',
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
    const payload = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new Error(payload.error ?? `Mimo proxy failed: ${response.status}`);
    }
    const content = payload.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    const usage = payload.usage ?? {};
    const inputTokens = Number(usage.prompt_tokens ?? estimateTokens(JSON.stringify(messages)));
    const outputTokens = Number(usage.completion_tokens ?? estimateTokens(content ?? ''));
    return {
      draft: parsed,
      ledger: {
        engine: 'AI 推演',
        status: 'ready',
        calls: 1,
        inputTokens,
        outputTokens,
        estimatedCostCny: estimateCost(inputTokens, outputTokens),
      },
    };
  } catch (error) {
    const message =
      error instanceof SyntaxError
        ? 'Mimo 代理未返回 JSON；当前可能还未部署 Vercel /api/mimo/chat，已使用本地模板。'
        : error instanceof TypeError
          ? 'Mimo 代理暂不可达；已使用本地模板。'
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
        lastError: message,
      },
    };
  }
}

function estimateTokens(text: string) {
  return Math.ceil(text.length / 1.8);
}

function estimateCost(inputTokens: number, outputTokens: number) {
  return Number(((inputTokens / 1000) * inputPriceCny + (outputTokens / 1000) * outputPriceCny).toFixed(4));
}
