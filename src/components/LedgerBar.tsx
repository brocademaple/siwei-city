import type { DiscussionMode, UsageLedger } from '../types';
import { modeLabel } from '../lib/modes';

interface LedgerBarProps {
  ledger: UsageLedger;
  mode: DiscussionMode;
}

export function LedgerBar({ ledger, mode }: LedgerBarProps) {
  return (
    <section className={`ledger-bar ledger-${ledger.status}`} aria-label="城邦账簿">
      <span>
        <strong>{ledger.engine}</strong>
        <small>{modeLabel(mode)}</small>
      </span>
      <span>调用 {ledger.calls}</span>
      <span>输入 {ledger.inputTokens}</span>
      <span>输出 {ledger.outputTokens}</span>
      <span>约 ¥{ledger.estimatedCostCny.toFixed(4)}</span>
      {ledger.lastError && <em title={ledger.lastError}>已回退：{ledger.lastError}</em>}
    </section>
  );
}
