import { useState } from 'react';
import { art } from '../assets/art';
import { requestGatewayJson } from '../lib/agents/gateway';
import type { EvidencePack } from '../data/evidencePacks';
import type {
  DistilledPersonaSeal,
  DistilledSkillTablet,
  HarnessPreset,
  IdeaTokenTriage,
  TriageStatus,
} from '../data/harnessData';
import type { MemoryCard, RecallCard, UsageLedger } from '../types';

interface HarnessSandboxStageProps {
  presets: HarnessPreset[];
  activePreset: HarnessPreset;
  onSelectPreset: (presetId: string) => void;
  onSaveCustomPreset: (preset: HarnessPreset) => void;
  evidencePack: EvidencePack;
  evidencePacks: EvidencePack[];
  onSelectEvidencePack: (id: string) => void;
  memoryRecall: RecallCard[];
  memoryCards: MemoryCard[];
  personas: DistilledPersonaSeal[];
  skills: DistilledSkillTablet[];
  onDistillPersona: (seal: DistilledPersonaSeal) => void;
  onDistillSkill: (tablet: DistilledSkillTablet) => void;
  onRunLiveEvidenceRound?: () => void;
  onUpdateLedger?: (ledger: UsageLedger) => void;
  discussionRunning?: boolean;
  ledger?: UsageLedger;
  onBackToCity: () => void;
  onOpenLibrary: () => void;
  focusMode?: 'sandbox' | 'scroll' | 'vault';
  onFocusModeChange?: (mode: 'sandbox' | 'scroll' | 'vault') => void;
}

export function HarnessSandboxStage({
  presets,
  activePreset,
  onSelectPreset,
  onSaveCustomPreset,
  evidencePack,
  evidencePacks,
  onSelectEvidencePack,
  memoryRecall,
  personas,
  skills,
  onDistillPersona,
  onDistillSkill,
  onRunLiveEvidenceRound,
  onUpdateLedger,
  discussionRunning = false,
  ledger,
  onBackToCity,
  onOpenLibrary,
  focusMode: externalFocusMode,
  onFocusModeChange,
}: HarnessSandboxStageProps) {
  const [internalFocusMode, setInternalFocusMode] = useState<'sandbox' | 'scroll' | 'vault'>('sandbox');
  const focusMode = externalFocusMode ?? internalFocusMode;
  const setFocusMode = (next: 'sandbox' | 'scroll' | 'vault') => {
    setInternalFocusMode(next);
    onFocusModeChange?.(next);
  };

  const [tokenOverrides, setTokenOverrides] = useState<Record<string, TriageStatus>>({});
  const [selectedTokenId, setSelectedTokenId] = useState<string>(activePreset.tokens[0]?.id ?? 'token-01');
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [customTokens, setCustomTokens] = useState<Record<string, IdeaTokenTriage[]>>({});
  const [triageRunningId, setTriageRunningId] = useState<string | null>(null);
  const [liveTriagedTokens, setLiveTriagedTokens] = useState<Record<string, Partial<IdeaTokenTriage>>>({});
  const [distillNotice, setDistillNotice] = useState<string | null>(null);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const mergedTokens: IdeaTokenTriage[] = [
    ...activePreset.tokens,
    ...(customTokens[activePreset.id] ?? []),
  ].map((token) => {
    const livePatch = liveTriagedTokens[`${activePreset.id}:${token.id}`];
    return {
      ...token,
      ...livePatch,
      status: tokenOverrides[`${activePreset.id}:${token.id}`] ?? livePatch?.status ?? token.status,
    };
  });

  const keepTokens = mergedTokens.filter((t) => t.status === 'keep');
  const modifyTokens = mergedTokens.filter((t) => t.status === 'modify');
  const dropTokens = mergedTokens.filter((t) => t.status === 'drop');
  const activeToken = mergedTokens.find((t) => t.id === selectedTokenId) ?? mergedTokens[0];

  function moveTokenStatus(tokenId: string, nextStatus: TriageStatus) {
    setTokenOverrides((prev) => ({
      ...prev,
      [`${activePreset.id}:${tokenId}`]: nextStatus,
    }));
  }

  async function handleLiveDeepSeekTriage(token: IdeaTokenTriage) {
    if (triageRunningId) return;
    setTriageRunningId(token.id);
    const packIds = evidencePack.items.map((item) => item.id);
    const result = await requestGatewayJson(
      [
        {
          role: 'system',
          content: [
            `你是思维城邦议会沙盘的 DeepSeek 裁判引擎，当前运行编排为 ${activePreset.code}《${activePreset.name}》。`,
            `全局铁律：${activePreset.globalRule}`,
            '请召集三席对输入点子筹码进行 Keep / Modify / Drop 分流，只输出合法 JSON，不输出 markdown。',
          ].join('\n'),
        },
        {
          role: 'user',
          content: JSON.stringify({
            topic: evidencePack.topic,
            token: { code: token.code, title: token.title, originalProposal: token.originalProposal },
            seats: activePreset.seats.map((s) => ({
              seatCode: s.seatCode,
              seatTitle: s.seatTitle,
              inquisitionRule: s.inquisitionRule,
              triageCriterion: s.triageCriterion,
            })),
            evidencePack: evidencePack.items.map(({ id, text, source }) => ({ id, text, source })),
            outputShape: {
              status: 'keep | modify | drop',
              keepAction: 'string (当 status=keep 时必填)',
              modifiedProposal: 'string (当 status=modify 时必填)',
              dropReason: 'string (当 status=drop 时必填)',
              evidenceIds: ['E1'],
              seatClashes: activePreset.seats.map((s) => ({
                seatCode: s.seatCode,
                seatTitle: s.seatTitle,
                verdict: '保留 | 重铸 | 砍除',
                statement: 'string (引用证据编号如 E1)',
                citedEvidence: ['E1'],
              })),
            },
          }),
        },
      ],
      `DeepSeek 筹码过筛·${token.code}`,
    );
    setTriageRunningId(null);
    onUpdateLedger?.(result.ledger);

    const parsed = result.json as Partial<IdeaTokenTriage> | undefined;
    if (result.ledger.status === 'ready' && parsed && (parsed.status === 'keep' || parsed.status === 'modify' || parsed.status === 'drop')) {
      const validEvidence = Array.isArray(parsed.evidenceIds)
        ? parsed.evidenceIds.filter((id): id is string => typeof id === 'string' && packIds.includes(id))
        : token.evidenceIds;
      setLiveTriagedTokens((prev) => ({
        ...prev,
        [`${activePreset.id}:${token.id}`]: {
          status: parsed.status,
          keepAction: typeof parsed.keepAction === 'string' ? parsed.keepAction : token.keepAction,
          modifiedProposal: typeof parsed.modifiedProposal === 'string' ? parsed.modifiedProposal : token.modifiedProposal,
          dropReason: typeof parsed.dropReason === 'string' ? parsed.dropReason : token.dropReason,
          evidenceIds: validEvidence.length ? validEvidence : token.evidenceIds,
          seatClashes: Array.isArray(parsed.seatClashes) && parsed.seatClashes.length ? parsed.seatClashes : token.seatClashes,
        },
      }));
      setDistillNotice(`火山方舟 DeepSeek (${result.ledger.model ?? 'deepseek-v4-1-flash-260910'} · prompt ${result.ledger.inputTokens} / completion ${result.ledger.outputTokens} tokens) 已完成筹码【${token.code} ${token.title}】三席实时过筛 → ${parsed.status.toUpperCase()}`);
    } else {
      setDistillNotice(result.ledger.lastError ?? 'DeepSeek 实时过筛未接通（请检查 .env.local 中的 DEEPSEEK_API_KEY），当前保留本地沙盘推演结果。');
    }
  }

  function handleAddToken(e: React.FormEvent) {
    e.preventDefault();
    const clean = newIdeaTitle.trim();
    if (!clean) return;
    const nextIdx = mergedTokens.length + 1;
    const newToken: IdeaTokenTriage = {
      id: `token-custom-${Date.now()}`,
      code: `IDEA-0${nextIdx}`,
      title: clean,
      originalProposal: clean,
      status: 'modify',
      modifiedProposal: `经「${activePreset.shortName}」三席初筛：需绑定固定语伴或补充 E5 基线验证后再入主干。`,
      evidenceIds: ['E1', 'E5'],
      memoryRefs: ['Q1'],
      seatClashes: [
        {
          seatCode: activePreset.seats[0].seatCode,
          seatTitle: activePreset.seats[0].seatTitle,
          verdict: '重铸',
          statement: `按本席规则（${activePreset.seats[0].inquisitionRule}），建议先收窄验证范围。`,
          citedEvidence: ['E1', 'E5'],
        },
      ],
    };
    setCustomTokens((prev) => ({
      ...prev,
      [activePreset.id]: [...(prev[activePreset.id] ?? []), newToken],
    }));
    setSelectedTokenId(newToken.id);
    setNewIdeaTitle('');
  }

  function handleQuickDistillPersona() {
    const seat = activePreset.seats[0];
    const newSeal: DistilledPersonaSeal = {
      id: `persona-${Date.now()}`,
      sealCode: `SEAL-0${personas.length + 1}`,
      name: `${seat.residentName.split('·')[0].trim()} · ${activePreset.shortName}追问印`,
      school: seat.schoolName,
      residentId: seat.residentId,
      inquisitionPrompt: seat.inquisitionRule,
      originRound: `提炼自「${evidencePack.topic}」(${activePreset.code})`,
      mountedInPresets: [activePreset.id],
    };
    onDistillPersona(newSeal);
    setDistillNotice(`已提炼居民追问印章【${newSeal.sealCode} ${newSeal.name}】并存入大图书馆木格档案匣`);
  }

  function handleQuickDistillSkill() {
    const newTablet: DistilledSkillTablet = {
      id: `skill-${Date.now()}`,
      tabletCode: `SKILL-0${skills.length + 1}`,
      name: `${activePreset.shortName} · 三槽过筛石刻简`,
      checkQuestions: [
        `1. 动机核验：${activePreset.seats[0].triageCriterion}`,
        `2. 口径核验：${activePreset.seats[1].triageCriterion}`,
        `3. 成本核验：${activePreset.seats[2].triageCriterion}`,
      ],
      applicableScene: `适用于「${evidencePack.tags.join(' / ')}」同类议题的开局过筛`,
      originEvidence: 'E1 · E3 · E4 · E5 · E6',
      mountedInPresets: [activePreset.id],
    };
    onDistillSkill(newTablet);
    setDistillNotice(`已提炼 Thinking Skill 石刻简【${newTablet.tabletCode} ${newTablet.name}】并存入大图书馆`);
  }

  function handleCreatePreset(e: React.FormEvent) {
    e.preventDefault();
    const clean = newPresetName.trim();
    if (!clean) return;
    const created: HarnessPreset = {
      ...activePreset,
      id: `preset-custom-${Date.now()}`,
      code: `PRESET ${presets.length + 1}`,
      name: `${clean} Preset`,
      shortName: clean,
      badge: '自定义编排 · 已挂载大图书馆印章',
    };
    onSaveCustomPreset(created);
    setNewPresetName('');
    setShowPresetModal(false);
  }

  return (
    <main className={`harness-sandbox-stage mode-${focusMode}`} data-guide="map">
      {/* 顶部：城邦微缩视窗 + Preset 铭牌卡槽 + 视图模式切换 */}
      <header className="sandbox-top-deck">
        <div className="sandbox-city-miniwindow" onClick={onBackToCity} role="button" tabIndex={0}>
          <img src={art.scenes.cityWorld} alt="城邦全景微缩窗" className="miniwindow-img" />
          <div className="miniwindow-meta">
            <span className="miniwindow-code">OVERWORLD ↔ SANDBOX</span>
            <strong>← 返回城邦全景地图</strong>
            <small>3 位学派居民已入议会厅</small>
          </div>
        </div>

        <div className="sandbox-preset-rack" role="tablist" aria-label="Preset 铭牌卡槽">
          <div className="rack-label">
            <span className="cinzel-tag">LOOP 1 · PRESET HARNESS</span>
            <b>议事编排铭牌槽（切换 Preset 调试同一议题）</b>
          </div>
          <div className="rack-slots">
            {presets.map((preset) => {
              const isSelected = preset.id === activePreset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`preset-plaque-slot${isSelected ? ' active' : ''}`}
                  onClick={() => {
                    onSelectPreset(preset.id);
                    setSelectedTokenId(preset.tokens[0]?.id ?? 'token-01');
                  }}
                >
                  <div className="plaque-top">
                    <span className="plaque-code">{preset.code}</span>
                    <i className="plaque-rivet" />
                  </div>
                  <strong className="plaque-title">{preset.shortName}</strong>
                  <small className="plaque-seats">
                    {preset.seats.map((s) => s.seatTitle.split('·')[0].trim()).join(' × ')}
                  </small>
                </button>
              );
            })}
            <button
              type="button"
              className="preset-plaque-slot add-slot"
              onClick={() => setShowPresetModal((v) => !v)}
            >
              <span className="plaque-code">+ NEW</span>
              <strong>新建/保存 Preset</strong>
              <small>固化当前席位与 Skill</small>
            </button>
          </div>
        </div>

        <div className="sandbox-mode-actions">
          <div className="mode-pill-group" role="group" aria-label="沙盘工作台视角">
            <button
              type="button"
              className={`stone-tab-btn${focusMode === 'sandbox' ? ' active' : ''}`}
              onClick={() => setFocusMode('sandbox')}
            >
              对质分流沙盘
            </button>
            <button
              type="button"
              className={`stone-tab-btn${focusMode === 'scroll' ? ' active' : ''}`}
              onClick={() => setFocusMode('scroll')}
            >
              多维推演长卷
            </button>
            <button
              type="button"
              className={`stone-tab-btn${focusMode === 'vault' ? ' active' : ''}`}
              onClick={() => setFocusMode('vault')}
            >
              大图书馆木匣
            </button>
          </div>
          <div className="top-utility-btns">
            <button type="button" className="terracotta-main-btn" onClick={onRunLiveEvidenceRound} disabled={discussionRunning}>
              {discussionRunning ? 'DeepSeek 推演中…' : 'DeepSeek 实时三席对质'}
            </button>
            <button type="button" className="aegean-ghost-btn" onClick={onOpenLibrary}>
              大图书馆内景 →
            </button>
          </div>
        </div>
      </header>

      {showPresetModal && (
        <form className="preset-create-bar" onSubmit={handleCreatePreset}>
          <span>将当前席位组合与挂载的 Skill 另存为新 Preset：</span>
          <input
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="输入新 Preset 名称，如：海外增长冷启动拷问"
          />
          <button type="submit">刻入铭牌槽</button>
          <button type="button" onClick={() => setShowPresetModal(false)}>取消</button>
        </form>
      )}

      {/* 议题石碑横幅 + 开局/对质双节点召回铜框 */}
      <section className="sandbox-topic-and-recall">
        <div className="topic-stele-box">
          <div className="stele-header">
            <span className="cinzel-tag">CURRENT PROPOSITION · 议题石刻</span>
            <select
              aria-label="切换证据包议题"
              value={evidencePack.id}
              onChange={(e) => onSelectEvidencePack(e.target.value)}
            >
              {evidencePacks.map((pack) => (
                <option key={pack.id} value={pack.id}>
                  {pack.topic}
                </option>
              ))}
            </select>
            {ledger && (
              <span className="stele-ledger-badge" title={ledger.lastError ?? '火山方舟 DeepSeek 网关 (/api/deepseek/chat)'}>
                引擎：{ledger.engine}
                {ledger.model ? ` (${ledger.model})` : ' · 火山方舟 DeepSeek'}
                {ledger.calls > 0 ? ` · ${ledger.calls} 次调用 (${ledger.inputTokens} in / ${ledger.outputTokens} out tokens)` : ''}
                {' · 证据包 E1–E6 已锁'}
              </span>
            )}
          </div>
          <h2 className="stele-topic-title">{evidencePack.topic}</h2>
          <p className="stele-global-rule">
            <b>{activePreset.code} 铁律：</b>
            {activePreset.globalRule}
          </p>
        </div>

        <div className="recall-bronze-strip" aria-label="大图书馆双节点主动召回">
          <div className="recall-strip-head">
            <span className="cinzel-tag">MEMORY RECALL · 大图书馆主动召回</span>
            <button type="button" className="link-btn" onClick={() => setFocusMode('vault')}>
              展开木格档案匣 ({ personas.length } 印章 / { skills.length } 石刻简) →
            </button>
          </div>
          <div className="recall-nodes-row">
            {activePreset.recallNodes.map((node) => (
              <div key={node.id} className={`recall-node-chip kind-${node.cardKind}`}>
                <span className="node-badge">{node.nodeType}</span>
                <strong>{node.title}</strong>
                <small>{node.summary}</small>
              </div>
            ))}
            {memoryRecall.slice(0, 1).map((card) => (
              <div key={card.id} className="recall-node-chip kind-live">
                <span className="node-badge">INDEXEDDB 实时记忆 · {card.id}</span>
                <strong>{card.text}</strong>
                <small>状态：{card.status} · 已绑定至当前沙盘</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {distillNotice && (
        <div className="sandbox-distill-toast" role="status">
          <span>{distillNotice}</span>
          <button type="button" onClick={() => setDistillNotice(null)}>知道了</button>
        </div>
      )}

      {/* 核心主桌面：根据 focusMode 呈现三栏全景或放大特定卷宗 */}
      <div className="sandbox-board-grid">
        {/* 左侧抽拉/常驻：大图书馆木格档案匣（双节点召回 + Persona印章 + Thinking Skill石刻简） */}
        <aside className={`library-wooden-vault${focusMode === 'vault' ? ' expanded' : ''}`} aria-label="大图书馆木格档案匣">
          <header className="vault-header">
            <div>
              <span className="cinzel-tag">LOOP 4 · GREAT LIBRARY VAULT</span>
              <h3>大图书馆 · 铜木格档案匣</h3>
            </div>
            <div className="vault-header-actions">
              <button type="button" className="vault-distill-btn" onClick={handleQuickDistillPersona}>
                + 提炼本局 Persona 印
              </button>
              <button type="button" className="vault-distill-btn" onClick={handleQuickDistillSkill}>
                + 提炼 Thinking Skill 简
              </button>
            </div>
          </header>

          <div className="vault-section">
            <div className="vault-section-title">
              <b>一、触发式双节点主动召回（何时调出大图书馆）</b>
              <span>拒絕盲目全量塞入</span>
            </div>
            <div className="vault-recall-cards">
              {activePreset.recallNodes.map((node) => (
                <article key={node.id} className="vault-card recall-card">
                  <div className="vault-card-top">
                    <span className="vault-node-pill">{node.nodeType}</span>
                    <em className="vault-card-kind">{node.cardKind}</em>
                  </div>
                  <h4>{node.title}</h4>
                  <p className="vault-trigger-line"><b>触发时机：</b>{node.triggerCondition}</p>
                  <p>{node.summary}</p>
                  <footer>
                    <small>{node.sourceRef}</small>
                  </footer>
                </article>
              ))}
            </div>
          </div>

          <div className="vault-section">
            <div className="vault-section-title">
              <b>二、城邦居民追问 Persona 印章（可挂载进 Preset）</b>
              <span>{personas.length} 枚铜印</span>
            </div>
            <div className="vault-seal-list">
              {personas.map((seal) => {
                const mounted = seal.mountedInPresets.includes(activePreset.id);
                return (
                  <article key={seal.id} className={`vault-card seal-card${mounted ? ' mounted' : ''}`}>
                    <div className="seal-card-head">
                      <img src={art.characters[seal.residentId]} alt={seal.name} className="seal-avatar" />
                      <div>
                        <span className="cinzel-code">{seal.sealCode} · {seal.school}</span>
                        <h4>{seal.name}</h4>
                      </div>
                      <span className={`mount-tag${mounted ? ' on' : ''}`}>
                        {mounted ? '当前 Preset 已挂载' : '可挂载'}
                      </span>
                    </div>
                    <p className="seal-prompt">「{seal.inquisitionPrompt}」</p>
                    <small className="seal-origin">{seal.originRound}</small>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="vault-section">
            <div className="vault-section-title">
              <b>三、Thinking Skill 石刻简（思考检查单）</b>
              <span>{skills.length} 卷石简</span>
            </div>
            <div className="vault-skill-list">
              {skills.map((tablet) => {
                const mounted = tablet.mountedInPresets.includes(activePreset.id);
                return (
                  <article key={tablet.id} className={`vault-card skill-tablet${mounted ? ' mounted' : ''}`}>
                    <div className="skill-tablet-head">
                      <span className="cinzel-code">{tablet.tabletCode} · 证据源 {tablet.originEvidence}</span>
                      <span className={`mount-tag${mounted ? ' on' : ''}`}>
                        {mounted ? '已注入本局' : '待挂载'}
                      </span>
                    </div>
                    <h4>{tablet.name}</h4>
                    <ul className="skill-questions">
                      {tablet.checkQuestions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                    <small className="skill-scene">{tablet.applicableScene}</small>
                  </article>
                );
              })}
            </div>
          </div>
        </aside>

        {/* 中央：俯视古典石刻博弈沙盘（桌沿席位铜印 + 桌心三道物理分流石槽） */}
        <section className="stone-sandbox-table" aria-label="俯视石刻博弈沙盘">
          {/* 沙盘桌沿：当前 Preset 召集的 3 枚学派居民席位铜印 */}
          <div className="table-rim-seats" aria-label="入席居民铜印铭牌">
            {activePreset.seats.map((seat) => (
              <article key={seat.seatCode} className="bronze-seat-seal">
                <div className="seat-seal-header">
                  <img src={art.characters[seat.residentId]} alt={seat.residentName} className="seat-seal-portrait" />
                  <div className="seat-seal-titles">
                    <span className="seat-code">{seat.seatCode} · {seat.schoolName}</span>
                    <strong>{seat.seatTitle}</strong>
                    <small>{seat.residentName}</small>
                  </div>
                </div>
                <p className="seat-rule"><b>追问铁律：</b>{seat.inquisitionRule}</p>
                <p className="seat-criterion"><b>过筛判准：</b>{seat.triageCriterion}</p>
              </article>
            ))}
          </div>

          {/* 桌心：三道物理石刻分流槽（保留 Keep / 重铸修正 Modify / 碎石弃槽 Drop） */}
          <div className="triage-grooves-arena">
            <div className="arena-title-bar">
              <div>
                <span className="cinzel-tag">LOOP 2 · IDEA TRIAGE GROOVES</span>
                <h3>桌心点子筹码过筛槽（保留 Keep / 重铸修正 Modify / 碎石弃槽 Drop）</h3>
              </div>
              <form className="add-token-form" onSubmit={handleAddToken}>
                <input
                  value={newIdeaTitle}
                  onChange={(e) => setNewIdeaTitle(e.target.value)}
                  placeholder="投入新点子陶片筹码（如：语音房桌面入口）…"
                />
                <button type="submit">+ 投筹入局</button>
              </form>
            </div>

            <div className="three-stone-grooves">
              {/* 槽 1：保留槽 Keep */}
              <div className="stone-groove groove-keep" role="region" aria-label="保留槽 Keep">
                <header className="groove-header">
                  <span className="groove-code">GROOVE I · KEEP</span>
                  <h4>【保留槽 · 主干】({keepTokens.length})</h4>
                  <small>经受住三席追问、支撑核心目标的唯一主干</small>
                </header>
                <div className="groove-tokens">
                  {keepTokens.map((token) => (
                    <article
                      key={token.id}
                      className={`ceramic-token token-keep${activeToken?.id === token.id ? ' selected' : ''}`}
                      onClick={() => setSelectedTokenId(token.id)}
                    >
                      <div className="token-top">
                        <span className="token-code">{token.code}</span>
                        <div className="token-citations">
                          {token.evidenceIds.map((eid) => (
                            <b key={eid} className="eid-badge">{eid}</b>
                          ))}
                          {token.memoryRefs.map((mid) => (
                            <b key={mid} className="mid-badge">{mid}</b>
                          ))}
                        </div>
                      </div>
                      <h5>{token.title}</h5>
                      <p className="token-proposal"><b>原方案：</b>{token.originalProposal}</p>
                      {token.keepAction && (
                        <div className="token-resolution keep-box">
                          <b>保留主干与验证动作：</b>
                          <p>{token.keepAction}</p>
                        </div>
                      )}
                      <footer className="token-triage-controls" onClick={(e) => e.stopPropagation()}>
                        <span>推入槽位：</span>
                        <button type="button" className="active">保留</button>
                        <button type="button" onClick={() => moveTokenStatus(token.id, 'modify')}>修正</button>
                        <button type="button" onClick={() => moveTokenStatus(token.id, 'drop')}>删减</button>
                      </footer>
                    </article>
                  ))}
                </div>
              </div>

              {/* 槽 2：重铸修正槽 Modify */}
              <div className="stone-groove groove-modify" role="region" aria-label="重铸修正槽 Modify">
                <header className="groove-header">
                  <span className="groove-code">GROOVE II · MODIFY</span>
                  <h4>【重铸修正槽 · 折中】({modifyTokens.length})</h4>
                  <small>方向合理但存有口径漏洞，吸收反驳后改写</small>
                </header>
                <div className="groove-tokens">
                  {modifyTokens.map((token) => (
                    <article
                      key={token.id}
                      className={`ceramic-token token-modify${activeToken?.id === token.id ? ' selected' : ''}`}
                      onClick={() => setSelectedTokenId(token.id)}
                    >
                      <div className="token-top">
                        <span className="token-code">{token.code}</span>
                        <div className="token-citations">
                          {token.evidenceIds.map((eid) => (
                            <b key={eid} className="eid-badge">{eid}</b>
                          ))}
                          {token.memoryRefs.map((mid) => (
                            <b key={mid} className="mid-badge">{mid}</b>
                          ))}
                        </div>
                      </div>
                      <h5>{token.title}</h5>
                      <p className="token-proposal"><b>原想法：</b>{token.originalProposal}</p>
                      <div className="token-resolution modify-box">
                        <b>重铸修正后方案：</b>
                        <p>{token.modifiedProposal ?? '吸收反例席质询后降级为基线对照或兜底态。'}</p>
                      </div>
                      <footer className="token-triage-controls" onClick={(e) => e.stopPropagation()}>
                        <span>推入槽位：</span>
                        <button type="button" onClick={() => moveTokenStatus(token.id, 'keep')}>保留</button>
                        <button type="button" className="active">修正</button>
                        <button type="button" onClick={() => moveTokenStatus(token.id, 'drop')}>删减</button>
                      </footer>
                    </article>
                  ))}
                </div>
              </div>

              {/* 槽 3：碎石弃槽 Drop */}
              <div className="stone-groove groove-drop" role="region" aria-label="碎石弃槽 Drop">
                <header className="groove-header">
                  <span className="groove-code">GROOVE III · DROP</span>
                  <h4>【碎石弃槽 · 删减】({dropTokens.length})</h4>
                  <small>伪需求、无出处或高代价枝节，附淘汰铁证</small>
                </header>
                <div className="groove-tokens">
                  {dropTokens.map((token) => (
                    <article
                      key={token.id}
                      className={`ceramic-token token-drop${activeToken?.id === token.id ? ' selected' : ''}`}
                      onClick={() => setSelectedTokenId(token.id)}
                    >
                      <div className="token-top">
                        <span className="token-code">{token.code}</span>
                        <div className="token-citations">
                          {token.evidenceIds.map((eid) => (
                            <b key={eid} className="eid-badge">{eid}</b>
                          ))}
                          {token.memoryRefs.map((mid) => (
                            <b key={mid} className="mid-badge">{mid}</b>
                          ))}
                        </div>
                      </div>
                      <h5>{token.title}</h5>
                      <p className="token-proposal"><b>原想法：</b>{token.originalProposal}</p>
                      <div className="token-resolution drop-box">
                        <b>砍除淘汰理由：</b>
                        <p>{token.dropReason ?? '缺乏真实证据支撑或混淆核心因果指标，予以砍除。'}</p>
                      </div>
                      <footer className="token-triage-controls" onClick={(e) => e.stopPropagation()}>
                        <span>推入槽位：</span>
                        <button type="button" onClick={() => moveTokenStatus(token.id, 'keep')}>保留</button>
                        <button type="button" onClick={() => moveTokenStatus(token.id, 'modify')}>修正</button>
                        <button type="button" className="active">删减</button>
                      </footer>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {/* 当前选中筹码的三席碰撞铭文台 + 证据包速查 */}
            {activeToken && (
              <div className="token-clash-inspector">
                <div className="clash-head">
                  <span className="cinzel-tag">TOKEN CLASH RECORD · 筹码交锋铭文</span>
                  <strong>当前检视筹码：{activeToken.code} 《{activeToken.title}》</strong>
                  <span className="clash-evidence-inline">
                    关联证据：{evidencePack.items.map((it) => `${it.id}:${it.text.slice(0, 12)}…`).join(' ｜ ')}
                  </span>
                  <button
                    type="button"
                    className="vault-distill-btn"
                    onClick={() => handleLiveDeepSeekTriage(activeToken)}
                    disabled={triageRunningId === activeToken.id}
                  >
                    {triageRunningId === activeToken.id ? 'DeepSeek 过筛中…' : '⚡ DeepSeek 实时过筛此筹码'}
                  </button>
                </div>
                <div className="clash-cards-row">
                  {activeToken.seatClashes.map((clash, idx) => (
                    <div key={idx} className={`clash-item verdict-${clash.verdict}`}>
                      <header>
                        <b>{clash.seatCode} · {clash.seatTitle}</b>
                        <span className="verdict-pill">{clash.verdict}</span>
                      </header>
                      <p>{clash.statement}</p>
                      <small>引用证据：{clash.citedEvidence.join('、')}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 右侧：羊皮长卷式多维综合推演报告（Synthesis Scroll） */}
        <aside className={`parchment-synthesis-scroll${focusMode === 'scroll' ? ' expanded' : ''}`} aria-label="多维综合推演报告">
          <div className="scroll-roller top-roller" aria-hidden="true" />
          <div className="scroll-parchment-body">
            <header className="scroll-header">
              <span className="cinzel-tag">LOOP 3 · SYNTHESIS SCROLL REPORT</span>
              <h3>羊皮长卷 · 多维综合推演报告</h3>
              <div className="scroll-meta-row">
                <span className="scroll-code">{activePreset.synthesis.scrollCode}</span>
                <span className="strength-badge">{activePreset.synthesis.claimStrength}</span>
              </div>
            </header>

            <section className="scroll-block">
              <h4>一、多维共识底座（拒绝一言堂）</h4>
              <p className="scroll-consensus">{activePreset.synthesis.consensusBase}</p>
            </section>

            <section className="scroll-block">
              <h4>二、各席核心视角贡献与张力对照</h4>
              <div className="scroll-seat-matrix">
                {activePreset.synthesis.seatContributions.map((sc, i) => (
                  <div key={i} className="matrix-row">
                    <div className="matrix-seat">
                      <b>{sc.seatTitle}</b>
                      <span className="matrix-eids">{sc.evidenceIds.join(' · ')}</span>
                    </div>
                    <p><b>视角贡献：</b>{sc.coreContribution}</p>
                    <p className="tension-line"><b>交锋张力：</b>{sc.tensionPoint}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="scroll-block">
              <h4>三、点子筹码过筛汇总（Keep / Modify / Drop）</h4>
              <ul className="scroll-triage-summary">
                <li className="summary-keep">
                  <b>【保留 Keep】({keepTokens.length})：</b>
                  {keepTokens.map((t) => `${t.code} ${t.title}`).join('；') || '无'}
                </li>
                <li className="summary-modify">
                  <b>【修正 Modify】({modifyTokens.length})：</b>
                  {modifyTokens.map((t) => `${t.code} ${t.title} → ${t.modifiedProposal?.slice(0, 38)}…`).join('；') || '无'}
                </li>
                <li className="summary-drop">
                  <b>【删减 Drop】({dropTokens.length})：</b>
                  {dropTokens.map((t) => `${t.code} ${t.title}（${t.dropReason?.slice(0, 34)}…）`).join('；') || '无'}
                </li>
              </ul>
            </section>

            <section className="scroll-block">
              <h4>四、条件分支推演（路径 A vs 路径 B）</h4>
              <div className="scroll-branches">
                {activePreset.synthesis.branchPaths.map((branch) => (
                  <article key={branch.pathCode} className={`branch-card${branch.recommended ? ' recommended' : ''}`}>
                    <header>
                      <span className="cinzel-code">{branch.pathCode}</span>
                      <strong>{branch.name}</strong>
                    </header>
                    <p><b>成立前提：</b>{branch.premise}</p>
                    <p><b>机会成本：</b>{branch.opportunityCost}</p>
                    <p className="kill-line"><b>止损红线：</b>{branch.killSwitch}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
          <div className="scroll-roller bottom-roller" aria-hidden="true" />
        </aside>
      </div>
    </main>
  );
}
