import { ArchivePanel } from './ArchivePanel';
import { InfoHint } from './InfoHint';
import type { ArchiveDoc, ReviewFinding, RoundtableTurn, SavedCity, ServicePanel } from '../types';

interface ServiceDrawerProps {
  open: boolean;
  activePanel: ServicePanel;
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
      <button className="drawer-toggle" type="button" onClick={onToggle}>
        {open ? '收起' : '城邦服务'}
      </button>
      <div className="drawer-tabs">
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
