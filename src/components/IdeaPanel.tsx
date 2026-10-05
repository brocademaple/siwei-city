import { FormEvent, useEffect, useState } from 'react';
import type { DiscussionMode, District, IdeaNode, RoleContribution, SceneView, StructuredIdeaCandidate, UsageLedger } from '../types';
import { discussionModes } from '../lib/modes';
import { LedgerBar } from './LedgerBar';
import { MvpPath } from './MvpPath';

interface IdeaPanelProps {
  topic: string;
  mode: DiscussionMode;
  ledger: UsageLedger;
  districts: District[];
  roleContributions: RoleContribution[];
  openingStarted: boolean;
  ideaCount: number;
  routeCount: number;
  turnCount: number;
  acceptedTurnCount: number;
  findingCount: number;
  onAddIdea: (draft: Pick<IdeaNode, 'title' | 'body' | 'type' | 'districtId' | 'authorRole'>) => void;
  onUseRoleContribution: (contribution: RoleContribution) => void;
  onStartOpening: (topic: string) => void;
  onRunComplete: (topic: string) => void;
  onPreviewImport: (rawText: string) => Promise<StructuredIdeaCandidate[]>;
  onConfirmImport: (candidates: StructuredIdeaCandidate[]) => void;
  sceneView: SceneView;
  onEnterCouncil: (topic: string) => void;
  onModeChange: (mode: DiscussionMode) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function IdeaPanel({
  topic,
  mode,
  ledger,
  districts,
  roleContributions,
  openingStarted,
  ideaCount,
  routeCount,
  turnCount,
  acceptedTurnCount,
  findingCount,
  onAddIdea,
  onUseRoleContribution,
  onStartOpening,
  onRunComplete,
  onPreviewImport,
  onConfirmImport,
  sceneView,
  onEnterCouncil,
  onModeChange,
  collapsed,
  onToggleCollapsed,
}: IdeaPanelProps) {
  const [topicDraft, setTopicDraft] = useState(topic);
  const [importDraft, setImportDraft] = useState('');
  const [importCandidates, setImportCandidates] = useState<StructuredIdeaCandidate[]>([]);
  const [importBusy, setImportBusy] = useState(false);
  const activeMode = discussionModes.find((item) => item.id === mode) ?? discussionModes[0];
  const showLedger = ledger.calls > 0 || ledger.status !== 'idle' || Boolean(ledger.lastError);
  const inCouncil = sceneView === 'council';
  const inCity = sceneView === 'city';

  useEffect(() => {
    setTopicDraft(topic);
  }, [topic]);

  function handleCompleteRun(event: FormEvent) {
    event.preventDefault();
    if (sceneView === 'city') {
      onEnterCouncil(topicDraft);
      return;
    }
    onRunComplete(topicDraft);
  }

  async function handlePreviewImport() {
    const clean = importDraft.trim();
    if (!clean) return;
    setImportBusy(true);
    const candidates = await onPreviewImport(clean);
    setImportCandidates(candidates);
    setImportBusy(false);
  }

  function handleConfirmImport() {
    onConfirmImport(importCandidates);
    setImportDraft('');
    setImportCandidates([]);
  }

  if (collapsed) {
    if (inCity) return null;

    return (
      <aside className="scribe-panel collapsed" aria-label="已收起的议题令牌">
        <button className="scribe-collapse-toggle" type="button" onClick={onToggleCollapsed} aria-label="展开议题令牌">
          展开
        </button>
        <div className="scribe-rail-title">
          <span>议题</span>
          <strong>本轮</strong>
        </div>
      </aside>
    );
  }

  if (!inCity) {
    return (
      <aside className="scribe-panel runtime-scribe" aria-label="议题令牌">
        <header className="scribe-header">
          <div className="scribe-header-row">
            <span className="kicker">议题令牌</span>
            <button className="scribe-collapse-toggle" type="button" onClick={onToggleCollapsed} aria-label="收起议题令牌">
              收起
            </button>
          </div>
          <h1>本轮议题</h1>
        </header>

        <section className="runtime-decree" aria-label="当前议题">
          <span className="section-title">{activeMode.label}</span>
          <strong>{topic}</strong>
          <p>{inCouncil ? '当前已在议会大厅。先看居民席位发言，再采纳有用观点入城。' : '当前在建筑二级页。这里负责查看沉淀，讨论仍回到冲突议会。'}</p>
          <div className="decree-meta" aria-label="本轮简况">
            <span>{ideaCount} 建筑</span>
            <span>{routeCount} 道路</span>
            <span>{acceptedTurnCount}/{turnCount} 采纳</span>
            <span>{findingCount} 修缮</span>
          </div>
          {!inCouncil && (
            <button className="primary-action" type="button" onClick={() => onEnterCouncil(topicDraft)}>
              回议会继续碰撞
            </button>
          )}
        </section>

        <MvpPath
          openingStarted={true}
          ideaCount={ideaCount}
          routeCount={routeCount}
          turnCount={turnCount}
          acceptedTurnCount={acceptedTurnCount}
          findingCount={findingCount}
        />

        <details className="advanced-court compact-court rewrite-court">
          <summary>
            <span className="section-title">改写议题</span>
            <strong>需要重开时再用</strong>
          </summary>
          <form className="rewrite-form" onSubmit={(event) => {
            event.preventDefault();
            onStartOpening(topicDraft);
          }}>
            <textarea
              value={topicDraft}
              onChange={(event) => setTopicDraft(event.target.value)}
              placeholder="改写本轮议题"
            />
            <button className="secondary-action" type="submit">
              以此题重召居民
            </button>
          </form>
        </details>
      </aside>
    );
  }

  return (
    <aside className="scribe-panel home-topic-settings" aria-label="议题设置">
      <header className="scribe-header">
        <div className="scribe-header-row">
          <span className="kicker">议题设置</span>
          <button className="scribe-collapse-toggle" type="button" onClick={onToggleCollapsed} aria-label="收起议题设置">
            收起
          </button>
        </div>
        <h1>送入冲突议会</h1>
        <p>调整本轮问题和议会开局方式，然后回到地图或进入议会。</p>
      </header>

      <form className="topic-scroll topic-forge" onSubmit={handleCompleteRun}>
        <label className="topic-field">
          <span>本轮议题</span>
          <textarea
            value={topicDraft}
            onChange={(event) => setTopicDraft(event.target.value)}
            placeholder="写下一个模糊议题"
          />
        </label>
        <span className="topic-mode-label">议会开局方式</span>
        <div className="mode-switch" aria-label="讨论模式">
          {discussionModes.map((item) => (
            <button className={item.id === mode ? 'active' : ''} key={item.id} type="button" onClick={() => onModeChange(item.id)}>
              <strong>{item.shortLabel}</strong>
              <b>{item.intent}</b>
            </button>
          ))}
        </div>
        <div className="topic-actions">
          <button className="primary-action" type="submit">
            送入冲突议会
          </button>
          <button className="secondary-action" type="button" onClick={onToggleCollapsed}>
            回到地图
          </button>
        </div>
      </form>

      {showLedger && <LedgerBar ledger={ledger} mode={mode} />}

      <details className="advanced-court compact-court import-court">
        <summary>
          <span className="section-title">结构化导入</span>
          <strong>一次粘贴多条想法</strong>
        </summary>
        <label className="topic-field">
          <span>多行笔记</span>
          <textarea
            value={importDraft}
            onChange={(event) => setImportDraft(event.target.value)}
            placeholder={'例：\n- 用户真正怕的是求助失败\n- 先访谈 5 位夜归女性\n- 风险是硬件很难高频使用'}
          />
        </label>
        <div className="topic-actions">
          <button className="secondary-action" type="button" onClick={handlePreviewImport} disabled={importBusy || !importDraft.trim()}>
            {importBusy ? '拆解中' : '预览导入'}
          </button>
          <button className="primary-action" type="button" onClick={handleConfirmImport} disabled={importCandidates.length === 0}>
            采纳入城
          </button>
        </div>
        {importCandidates.length > 0 && (
          <div className="import-preview-list" aria-label="导入预览">
            {importCandidates.map((candidate) => (
              <article className="import-preview-row" key={candidate.id}>
                <strong>{candidate.title}</strong>
                <p>{candidate.body}</p>
                <small>{candidate.type} · {candidate.authorRole} · {candidate.protocol ?? 'intent'} / {candidate.argumentMove ?? 'question'}</small>
              </article>
            ))}
          </div>
        )}
      </details>
    </aside>
  );
}
