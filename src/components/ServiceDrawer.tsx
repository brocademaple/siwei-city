import { ArchivePanel } from './ArchivePanel';
import { InfoHint } from './InfoHint';
import { ProcessPanel } from './ProcessPanel';
import type { ArchiveDoc, ReviewFinding, RoundtableTurn, SavedCity, ServicePanel } from '../types';
import type { DiscussionMode, IdeaNode, Route } from '../types';

interface ServiceDrawerProps {
  open: boolean;
  activePanel: ServicePanel;
  topic: string;
  mode: DiscussionMode;
  ideas: IdeaNode[];
  routes: Route[];
  turns: RoundtableTurn[];
  findings: ReviewFinding[];
  docs: ArchiveDoc[];
  savedCities: SavedCity[];
  activeDocId: string | null;
  onToggle: () => void;
  onPanelChange: (panel: ServicePanel) => void;
  onPreviewTurn: (turn: RoundtableTurn) => void;
  onFocusFinding: (finding: ReviewFinding) => void;
  onDiscussFinding: (finding: ReviewFinding) => void;
  onOpenDoc: (id: string) => void;
  onCloseDoc: () => void;
  onSaveCity: () => void;
  onLoadCity: (id: string) => void;
  onLoadSampleCase: (id: string) => void;
}

export function ServiceDrawer({
  open,
  activePanel,
  topic,
  mode,
  ideas,
  routes,
  turns,
  findings,
  docs,
  savedCities,
  activeDocId,
  onToggle,
  onPanelChange,
  onPreviewTurn,
  onFocusFinding,
  onDiscussFinding,
  onOpenDoc,
  onCloseDoc,
  onSaveCity,
  onLoadCity,
  onLoadSampleCase,
}: ServiceDrawerProps) {
  return (
    <aside className={open ? 'city-log service-drawer open' : 'city-log service-drawer'} data-guide="log">
      <button className="drawer-toggle" type="button" onClick={onToggle} aria-label={open ? '收起城邦服务' : '打开城邦服务'}>
        <span className="drawer-icon" aria-hidden="true">
          巡
        </span>
        <b>{open ? '收起' : '城邦服务'}</b>
        <small>居民 · 巡城 · 卷轴</small>
      </button>
      <div className="drawer-tabs">
        <button className={activePanel === 'walkthrough' ? 'active' : ''} type="button" onClick={() => onPanelChange('walkthrough')}>
          全过程
        </button>
        <button className={activePanel === 'roundtable' ? 'active' : ''} type="button" onClick={() => onPanelChange('roundtable')}>
          居民席位
        </button>
        <button className={activePanel === 'inspector' ? 'active' : ''} type="button" onClick={() => onPanelChange('inspector')}>
          巡城官塔
        </button>
        <button className={activePanel === 'archive' ? 'active' : ''} type="button" onClick={() => onPanelChange('archive')}>
          卷轴馆
        </button>
      </div>
      <div className="drawer-helper">
        <span>{helperCopy(activePanel).step}</span>
        <strong>{helperCopy(activePanel).title}</strong>
        <p>{helperCopy(activePanel).body}</p>
      </div>

      {activePanel === 'walkthrough' && (
        <ProcessPanel
          topic={topic}
          mode={mode}
          ideas={ideas}
          routes={routes}
          turns={turns}
          findings={findings}
          docs={docs}
          onPanelChange={onPanelChange}
          onOpenDoc={onOpenDoc}
        />
      )}

      {activePanel === 'roundtable' && (
        <section className="log-section role-court">
          <div className="role-court-header">
            <span className="service-seal">席</span>
            <span>
              <div className="section-title">
                居民圆桌 <InfoHint text="多 agent 回合记录。点击只预览，采纳后才会变成地图建筑。" />
              </div>
              <p className="term-hint">居民会回应上一轮讨论，但最终是否入城由你决定。</p>
            </span>
          </div>
          <div className="log-list">
            {turns.length === 0 && (
              <article className="log-entry calm">
                <span className="role-avatar text-avatar">席</span>
                <span>
                  <strong>还没有圆桌记录</strong>
                  <p>先在左侧点击“开始一轮推演”，系统会生成第一批居民来函。</p>
                </span>
              </article>
            )}
            {turns.map((turn) => (
              <button
                className={turn.accepted ? 'log-entry resident-entry accepted' : 'log-entry resident-entry'}
                key={turn.id}
                type="button"
                onClick={() => onPreviewTurn(turn)}
              >
                <span className="role-avatar text-avatar">{turn.role.slice(0, 1)}</span>
                <span>
                  <strong>{turn.role}</strong>
                  <p>{turn.title}</p>
                  <em>{turn.accepted ? '已入城邦' : `回应 ${turn.respondsTo ?? '议题'}`}</em>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {activePanel === 'inspector' && (
        <section className="log-section inspector-court">
          <div className="role-court-header">
            <span className="service-seal">塔</span>
            <span>
              <div className="section-title">
                巡城官令 <InfoHint text="系统只指出结构缺口，并给出下一步修缮动作，不会自动改图。" />
              </div>
              <p className="term-hint">点击定位建筑，也可以请居民围绕缺口继续讨论。</p>
            </span>
          </div>
          <div className="log-list">
            {findings.length === 0 ? (
              <article className="log-entry calm">
                <span className="role-avatar text-avatar">令</span>
                <span>
                  <strong>城邦脉络清晰</strong>
                  <p>当前没有明显断点。</p>
                </span>
              </article>
            ) : (
              findings.map((finding) => (
                <article className={`log-entry severity-${finding.severity}`} key={finding.id}>
                  <span className="role-avatar text-avatar">令</span>
                  <span>
                    <strong>{finding.title}</strong>
                    <p>{finding.detail}</p>
                    <p className="repair-action">{finding.repairAction}</p>
                    <div className="repair-actions">
                      <button type="button" onClick={() => onFocusFinding(finding)}>
                        定位建筑
                      </button>
                      <button type="button" onClick={() => onDiscussFinding(finding)}>
                        请{finding.suggestedRole}讨论
                      </button>
                    </div>
                  </span>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      {activePanel === 'archive' && (
        <ArchivePanel
          docs={docs}
          savedCities={savedCities}
          activeDocId={activeDocId}
          onOpenDoc={onOpenDoc}
          onCloseDoc={onCloseDoc}
          onSaveCity={onSaveCity}
          onLoadCity={onLoadCity}
          onLoadSampleCase={onLoadSampleCase}
        />
      )}
    </aside>
  );
}

function helperCopy(panel: ServicePanel) {
  const map: Record<ServicePanel, { step: string; title: string; body: string }> = {
    walkthrough: {
      step: '城邦令',
      title: '看本轮修城路线',
      body: '从立题、居民来函、巡城修缮到卷轴报告，按顺序检查本轮进展。',
    },
    roundtable: {
      step: '居民席',
      title: '读居民来函',
      body: '点一条来函先预览，觉得有用再采纳入城，地图才会新增建筑。',
    },
    inspector: {
      step: '巡城令',
      title: '查结构缺口',
      body: '巡城官指出缺证据、未回应反驳和未回流行动；按修缮令继续讨论。',
    },
    archive: {
      step: '卷轴馆',
      title: '带走报告',
      body: '这里沉淀报告、行动计划和圆桌记录，支持复制或下载 Markdown。',
    },
  };
  return map[panel];
}
