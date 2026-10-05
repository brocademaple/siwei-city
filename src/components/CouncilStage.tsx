import { useEffect, useRef, useState } from 'react';
import { art } from '../assets/art';
import { councilResidentIds, getResidentProfile } from '../lib/residents';
import { getDiscussionMode, modeLabel } from '../lib/modes';
import { argumentMoveLabel, gapTypeLabel, protocolLabel } from '../lib/protocols';
import { discussionGenerationDetail, discussionGenerationLabel } from '../lib/discussionRecords';
import type { ArchiveDoc, DiscussionMode, DiscussionRecord, DiscussionRecordStatus, ResidentId, ReviewFinding, RoundtableTurn } from '../types';

type CouncilTab = 'transcript' | 'structure' | 'summary';

interface CouncilStageProps {
  topic: string;
  mode: DiscussionMode;
  turns: RoundtableTurn[];
  findings: ReviewFinding[];
  docs: ArchiveDoc[];
  activeResidentId: ResidentId | null;
  discussionStarted: boolean;
  discussionRunning: boolean;
  activeRecord: DiscussionRecord | null;
  composerMode: 'new' | 'followup' | null;
  onActiveResidentChange: (id: ResidentId) => void;
  onStartOpening: (topic: string) => void;
  onCancelComposer: () => void;
  onPrepareFollowUp: () => void;
  onPrepareNewDiscussion: () => void;
  onAcceptTurn: (turn: RoundtableTurn) => void;
  onRecordStatusChange: (status: DiscussionRecordStatus) => void;
  onOpenLibrary: () => void;
  onBackToCity: () => void;
}

export function CouncilStage({
  topic,
  mode,
  turns,
  findings,
  docs,
  activeResidentId,
  discussionStarted,
  discussionRunning,
  activeRecord,
  composerMode,
  onActiveResidentChange,
  onStartOpening,
  onCancelComposer,
  onPrepareFollowUp,
  onPrepareNewDiscussion,
  onAcceptTurn,
  onRecordStatusChange,
  onOpenLibrary,
  onBackToCity,
}: CouncilStageProps) {
  const [topicDraft, setTopicDraft] = useState(topic);
  const [activeTab, setActiveTab] = useState<CouncilTab>('transcript');
  const [followingLatest, setFollowingLatest] = useState(true);
  const recordBodyRef = useRef<HTMLDivElement>(null);
  const closeoutRef = useRef<HTMLElement>(null);
  const turnRefs = useRef<Record<string, HTMLElement | null>>({});
  const completedRecordRef = useRef<string | null>(null);
  const acceptedTurns = turns.filter((turn) => turn.accepted);
  const actionTurns = turns.filter((turn) => turn.type === 'action' || turn.argumentMove === 'action');
  const reportDoc = docs.find((doc) => doc.kind === 'report');
  const nextStep = discussionRunning ? getDiscussionMode(mode).steps[turns.length] : undefined;
  const cleanTopic = topicDraft.trim();
  const showingComposer = composerMode !== null;
  const showingCloseout = !discussionRunning && Boolean(activeRecord);

  useEffect(() => setTopicDraft(topic), [topic]);

  useEffect(() => {
    if (composerMode === 'new') setTopicDraft('');
    if (composerMode === 'followup') setTopicDraft(topic);
  }, [composerMode, topic]);

  useEffect(() => {
    const body = recordBodyRef.current;
    if (!body || !discussionStarted || !followingLatest || activeTab !== 'transcript') return;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    body.scrollTo({ top: body.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [activeTab, discussionStarted, followingLatest, turns.length]);

  useEffect(() => {
    if (!activeRecord || discussionRunning || completedRecordRef.current === activeRecord.id) return;
    completedRecordRef.current = activeRecord.id;
    setActiveTab('summary');
    window.setTimeout(() => closeoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }, [activeRecord, discussionRunning]);

  function focusTurn(turn: RoundtableTurn) {
    setActiveTab('transcript');
    setFollowingLatest(false);
    window.setTimeout(() => turnRefs.current[turn.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  function handleSeatClick(id: ResidentId) {
    onActiveResidentChange(id);
    const profile = getResidentProfile(id);
    const firstTurn = turns.find((turn) => turn.role === profile.roleName);
    if (firstTurn) focusTurn(firstTurn);
  }

  function handleStart(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cleanTopic || discussionRunning) return;
    setActiveTab('transcript');
    setFollowingLatest(true);
    onStartOpening(cleanTopic);
  }

  return (
    <main className="council-stage" style={{ backgroundImage: `linear-gradient(180deg, rgba(32, 22, 16, 0.08), rgba(32, 22, 16, 0.58)), url(${art.scenes.councilChamber})` }} data-guide="map">
      <div className="council-vignette" />
      <header className="council-topbar">
        <button className="hud-button ghost" type="button" onClick={onBackToCity}>← 返回城邦</button>
        <span className="hud-plaque">议会厅</span>
        <button className="hud-button" type="button" onClick={onOpenLibrary}>大图书馆</button>
      </header>

      <section className="council-table council-scroll council-workspace" aria-label="议会讨论">
        {showingComposer || !discussionStarted ? (
          <form className="council-topic-form council-opening-form" onSubmit={handleStart}>
            <label htmlFor="council-topic">{composerMode === 'followup' ? '围绕本题继续追问什么？' : '这轮想讨论什么？'}</label>
            <textarea id="council-topic" value={topicDraft} onChange={(event) => setTopicDraft(event.target.value)} placeholder={composerMode === 'followup' ? '保留原议题，或写下一个更具体的追问' : '写下一个选择、判断，或你暂时想不明白的问题'} rows={4} />
            <div className="scroll-composer-actions">
              {showingComposer ? <button className="topic-example" type="button" onClick={onCancelComposer}>回到本轮结束</button> : <button className="topic-example" type="button" onClick={() => setTopicDraft('AI 时代，个人应该如何重建自己的知识管理系统？')}>填入示例</button>}
              <button className="council-start-button" type="submit" disabled={!cleanTopic || discussionRunning}>{composerMode === 'followup' ? '开始追问' : '开始讨论'}</button>
            </div>
          </form>
        ) : (
          <>
            <header className="council-record-head">
              <div>
                <h1>{topic}</h1>
                <span>{modeLabel(mode)} · {discussionRunning ? `第 ${turns.length + 1} 席正在发言` : activeRecord ? recordStatusText(activeRecord.status) : '整理记录中'}</span>
              </div>
              {activeTab === 'transcript' && !followingLatest && <button className="record-follow-button" type="button" onClick={() => setFollowingLatest(true)}>回到最新</button>}
            </header>
            <div className="council-tabs" role="tablist" aria-label="讨论内容">
              {tabButton('transcript', '发言记录', activeTab, setActiveTab)}
              {tabButton('structure', '议论结构', activeTab, setActiveTab)}
              {tabButton('summary', '总结与行动', activeTab, setActiveTab)}
            </div>

            {activeTab === 'transcript' && (
              <div className="scroll-record-body" ref={recordBodyRef} onWheel={() => setFollowingLatest(false)} onTouchMove={() => setFollowingLatest(false)} onKeyDown={() => setFollowingLatest(false)} aria-live="polite">
                {turns.length === 0 ? <article className="scroll-empty"><strong>正在召集第一席</strong></article> : turns.map((turn, index) => (
                  <article className={index === turns.length - 1 ? 'scroll-entry latest' : 'scroll-entry'} key={turn.id} ref={(node) => { turnRefs.current[turn.id] = node; }}>
                    <header><span>{roleTitle(turn.role)}</span><small className={turn.source === 'AI 生成' ? 'turn-source ai' : 'turn-source local'}>{turn.source ?? '本地模板'} · {turn.accepted ? '已纳入结论' : '讨论发言'}</small></header>
                    <strong>{turn.title}</strong>
                    <p>{turn.body}</p>
                    <footer><span>回应：{turn.respondsTo ?? '核心问题'}</span><span>方式：{discussionMethod(turn)}</span></footer>
                    {!turn.accepted && !discussionRunning && <button className="turn-accept-button" type="button" onClick={() => onAcceptTurn(turn)}>纳入结论</button>}
                  </article>
                ))}
                {nextStep && <article className="scroll-waiting">正在等待{roleTitle(nextStep.role)}：{nextStep.title}</article>}
              </div>
            )}

            {activeTab === 'structure' && (
              <div className="argument-structure">
                <p className="structure-intro">每个节点都是一次明确的回应。点击可回到原始发言。</p>
                {turns.map((turn, index) => (
                  <button className="argument-link" key={turn.id} type="button" onClick={() => focusTurn(turn)}>
                    <span>{index + 1}</span>
                    <div><strong>{roleTitle(turn.role)}</strong><p>{turn.respondsTo ?? '核心问题'} → {discussionMethod(turn)}</p></div>
                    <em>{turn.title}</em>
                  </button>
                ))}
                {turns.length === 0 && <article className="scroll-empty"><strong>等待第一条关系</strong></article>}
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="discussion-summary">
                {showingCloseout && activeRecord && (
                  <section className="round-closeout" ref={closeoutRef} aria-label="本轮结束">
                    <header>
                      <span>本轮结束</span>
                      <strong>{recordStatusText(activeRecord.status)}</strong>
                      <p>讨论已自动暂存至大图书馆。确认后将冻结报告、行动与过程三份记录。</p>
                    </header>
                    <div className="round-closeout-grid">
                      <div><span>本轮结果</span><strong>{actionTurns[0]?.title ?? turns.at(-1)?.title ?? reportDoc?.title ?? '尚未形成结论'}</strong><p>{summaryBody(activeRecord.summary, actionTurns[0]?.title ?? turns.at(-1)?.title)}</p><small>{turns.length} 席发言 · 已纳入结论 {acceptedTurns.length} 条 · {activeRecord.actionCount} 项行动</small></div>
                      <div><span>记录状态</span><strong>{discussionGenerationLabel(activeRecord.generation)}</strong><p>{discussionGenerationDetail(activeRecord.generation)}</p></div>
                    </div>
                    <div className="round-closeout-section"><span>行动方案</span>{actionTurns.length ? actionTurns.map((turn) => <article key={turn.id}><strong>{turn.title}</strong><p>{turn.body}</p></article>) : <p>当前还没有行动方案。</p>}</div>
                    <div className="round-closeout-section"><span>仍需补齐</span>{findings.length ? findings.map((finding) => <p key={finding.id}>{finding.repairAction}（{gapTypeLabel(finding.gapType)}）</p>) : <p>当前没有明显结构缺口。</p>}</div>
                    <div className="round-closeout-actions">
                      <div className="record-resolution-actions">
                        {activeRecord.status === 'pending' && <><button type="button" onClick={() => onRecordStatusChange('rejected')}>否决记录</button><button className="primary-action" type="button" onClick={() => onRecordStatusChange('confirmed')}>确认记录</button></>}
                        {activeRecord.status === 'confirmed' && <span>已确认，馆藏内容已冻结。</span>}
                        {activeRecord.status === 'rejected' && <span>已否决，仍可在图书馆的已否决筛选中回看。</span>}
                      </div>
                      <div className="round-next-actions">
                        <button type="button" onClick={onOpenLibrary}>查看大图书馆</button>
                        <button type="button" onClick={onBackToCity}>结束本轮，返回城邦</button>
                        <button type="button" onClick={onPrepareFollowUp}>围绕本题追问</button>
                        <button className="primary-action" type="button" onClick={onPrepareNewDiscussion}>发起新议题</button>
                      </div>
                    </div>
                  </section>
                )}
                {!showingCloseout && <section><span>综合结论</span><strong>{actionTurns[0]?.title ?? turns.at(-1)?.title ?? reportDoc?.title ?? '等待讨论完成后整理。'}</strong><p>所有角色完成发言后，会自动生成一张待确认记录，并进入本轮结束区。</p></section>}
              </div>
            )}
          </>
        )}
      </section>

      <nav className="council-seats" aria-label="议会席位">
        {councilResidentIds.map((id) => {
          const profile = getResidentProfile(id);
          const count = turns.filter((turn) => turn.role === profile.roleName).length;
          return <button className={activeResidentId === id ? 'council-seat active' : 'council-seat'} key={id} type="button" onClick={() => handleSeatClick(id)}>
            <img src={art.characters[profile.assetKey]} alt="" /><span><strong>{profile.title}</strong><small>{count > 0 ? `${count} 条发言` : seatRoleLabel(profile.roleName)}</small></span>
          </button>;
        })}
      </nav>
    </main>
  );
}

function tabButton(value: CouncilTab, label: string, active: CouncilTab, onChange: (value: CouncilTab) => void) {
  return <button className={value === active ? 'active' : ''} key={value} type="button" role="tab" aria-selected={value === active} onClick={() => onChange(value)}>{label}</button>;
}

function roleTitle(role: RoundtableTurn['role']) {
  return councilResidentIds.map((id) => getResidentProfile(id)).find((item) => item.roleName === role)?.title ?? role;
}

function seatRoleLabel(role: ReturnType<typeof getResidentProfile>['roleName']) {
  if (role === '研究者') return '材料与证据';
  if (role === '怀疑者') return '反方质询';
  if (role === '实践者') return '场景检验';
  if (role === '执行者') return '行动收束';
  if (role === '巡城官') return '结构检查';
  return '记录整理';
}

function discussionMethod(turn: RoundtableTurn) {
  const moves: Record<string, string> = { 定义: '厘清定义', 追问: '追问前提', 证据: '补充证据', 反例: '检验反例', 类比: '场景类比', 利害: '比较利害', 行动: '收束行动', 修辞改写: '调整表达' };
  return moves[argumentMoveLabel(turn.argumentMove)] ?? `${protocolLabel(turn.protocol)} · ${argumentMoveLabel(turn.argumentMove)}`;
}

function recordStatusText(status: DiscussionRecordStatus) {
  if (status === 'confirmed') return '本轮记录已确认';
  if (status === 'rejected') return '本轮记录已否决';
  return '本轮记录待确认';
}

function summaryBody(summary: string, title?: string) {
  return title && summary.startsWith(`${title}：`) ? summary.slice(title.length + 1) : summary;
}
