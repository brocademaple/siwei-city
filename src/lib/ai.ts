import { runOpeningAgents, type AgentDraft, type AgentDraftResult } from './agents/agentRuntime';
import type { DiscussionMode, IdeaNode, Route, UsageLedger } from '../types';

export interface AiDraft extends AgentDraft {}

export interface AiDraftResult {
  draft?: AiDraft;
  ledger: UsageLedger;
}

export async function requestAiDraft(topic: string, mode: DiscussionMode, ideas: IdeaNode[], routes: Route[]): Promise<AiDraftResult> {
  const result: AgentDraftResult = await runOpeningAgents(topic, mode, ideas, routes);
  return {
    draft: result.draft,
    ledger: result.ledger,
  };
}
