import { modeLabel } from '../lib/modes';
import type { ArchiveDoc, DiscussionMode, IdeaNode, ReviewFinding, RoundtableTurn, Route, ServicePanel } from '../types';

interface ProcessPanelProps {
  topic: string;
  mode: DiscussionMode;
  ideas: IdeaNode[];
  routes: Route[];
  turns: RoundtableTurn[];
  findings: ReviewFinding[];
  docs: ArchiveDoc[];
  onPanelChange: (panel: ServicePanel) => void;
  onOpenDoc: (id: string) => void;
}

export function ProcessPanel({
  topic,
  mode,
  ideas,
  routes,
  turns,
  findings,
  docs,
  onPanelChange,
  onOpenDoc,
}: ProcessPanelProps) {
  const acceptedTurns = turns.filter((turn) => turn.accepted);
  const reportDoc = docs.find((doc) => doc.id === 'archive-report');
  const actionDoc = docs.find((doc) => doc.id === 'archive-action');

  return (
    <section className="process-panel" aria-label="议题讨论全过程">
      <div className="process-hero">
        <span className="section-title">全过程看板</span>
        <h2>这个议题已经跑完一轮</h2>
        <p>{topic}</p>
      </div>

      <div className="process-metrics" aria-label="全过程统计">
        <span>
          <strong>{modeLabel(mode)}</strong>
          模式
        </span>
        <span>
          <strong>{ideas.length}</strong>
          建筑
        </span>
        <span>
          <strong>{routes.length}</strong>
          道路
        </span>
        <span>
          <strong>{acceptedTurns.length}</strong>
          已采纳
        </span>
      </div>

      <ol className="process-timeline">
        <li>
          <i>1</i>
          <div>
            <strong>输入议题</strong>
            <p>议题送入冲突议会，并选择 {modeLabel(mode)}。</p>
          </div>
        </li>
        <li>
          <i>2</i>
          <div>
            <strong>开局推演</strong>
            <p>系统生成问题、假设、证据、反驳、行动五类初始建筑，并铺出第一批关系道路。</p>
          </div>
        </li>
        <li>
          <i>3</i>
          <div>
            <strong>居民圆桌</strong>
            <p>{acceptedTurns.length} 条居民来函已采纳入城，地图新增对应观点建筑。</p>
            <div className="mini-list">
              {acceptedTurns.map((turn) => (
                <span key={turn.id}>
                  {turn.role}：{turn.title}
                </span>
              ))}
            </div>
            <button type="button" onClick={() => onPanelChange('roundtable')}>
              查看圆桌记录
            </button>
          </div>
        </li>
        <li>
          <i>4</i>
          <div>
            <strong>巡城检查</strong>
            <p>{findings.length > 0 ? `发现 ${findings.length} 个结构缺口，已列成修缮令。` : '当前没有明显结构断点。'}</p>
            <div className="mini-list">
              {findings.length === 0 ? <span>城邦脉络清晰</span> : findings.map((finding) => <span key={finding.id}>{finding.title}</span>)}
            </div>
            <button type="button" onClick={() => onPanelChange('inspector')}>
              查看修缮令
            </button>
          </div>
        </li>
        <li>
          <i>5</i>
          <div>
            <strong>卷轴产出</strong>
            <p>本轮讨论已经沉淀为报告、行动计划、圆桌记录和修缮记录。</p>
            <div className="process-actions">
              {reportDoc && (
                <button
                  type="button"
                  onClick={() => {
                    onPanelChange('archive');
                    onOpenDoc(reportDoc.id);
                  }}
                >
                  打开报告
                </button>
              )}
              {actionDoc && (
                <button
                  type="button"
                  onClick={() => {
                    onPanelChange('archive');
                    onOpenDoc(actionDoc.id);
                  }}
                >
                  打开行动计划
                </button>
              )}
            </div>
          </div>
        </li>
      </ol>
    </section>
  );
}
