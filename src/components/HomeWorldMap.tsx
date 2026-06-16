import { useRef, useState } from 'react';
import { art } from '../assets/art';
import { cityBuildings } from '../lib/cityBuildings';
import type { BuildingSceneId, IdeaNode, ReviewFinding, Route, RoundtableTurn } from '../types';

interface HomeWorldMapProps {
  topic: string;
  ideas: IdeaNode[];
  routes: Route[];
  turns: RoundtableTurn[];
  findings: ReviewFinding[];
  restoredSession: boolean;
  onOpenBuilding: (id: BuildingSceneId) => void;
  onOpenScribe: () => void;
  onResetSession: () => void;
}

export function HomeWorldMap({
  topic,
  ideas,
  routes,
  turns,
  findings,
  restoredSession,
  onOpenBuilding,
  onOpenScribe,
  onResetSession,
}: HomeWorldMapProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(() => initialMapOffset());
  const [activeBuildingId, setActiveBuildingId] = useState<BuildingSceneId>('council');
  const dragRef = useRef<{ pointerId: number; x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const acceptedTurns = turns.filter((turn) => turn.accepted).length;
  const activeBuilding = cityBuildings.find((building) => building.id === activeBuildingId) ?? cityBuildings[0];

  function updateScale(delta: number) {
    setScale((current) => Math.min(1.85, Math.max(0.78, Number((current + delta).toFixed(2)))));
  }

  function resetView() {
    setScale(1);
    setOffset(initialMapOffset());
  }

  return (
    <main className="home-world" data-guide="map">
      <div className="home-world-canvas-shell">
        <div
          className="home-world-canvas"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(30, 19, 12, 0.04), rgba(30, 19, 12, 0.22)), url(${art.scenes.cityWorld})`,
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
          }}
          onWheel={(event) => {
            if (!event.ctrlKey && !event.metaKey) return;
            event.preventDefault();
            updateScale(event.deltaY > 0 ? -0.08 : 0.08);
          }}
          onPointerDown={(event) => {
            dragRef.current = {
              pointerId: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              offsetX: offset.x,
              offsetY: offset.y,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag || drag.pointerId !== event.pointerId) return;
            setOffset({
              x: drag.offsetX + event.clientX - drag.x,
              y: drag.offsetY + event.clientY - drag.y,
            });
          }}
          onPointerUp={(event) => {
            if (dragRef.current?.pointerId === event.pointerId) {
              dragRef.current = null;
            }
          }}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
        >
          {cityBuildings.map((building) => (
            <button
              className={`world-marker tone-${building.markerTone} ${building.id === 'council' ? 'primary' : ''}`}
              key={building.id}
              style={{ left: `${building.mapX}%`, top: `${building.mapY}%` }}
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onFocus={() => setActiveBuildingId(building.id)}
              onMouseEnter={() => setActiveBuildingId(building.id)}
              onClick={(event) => {
                event.stopPropagation();
                onOpenBuilding(building.id);
              }}
            >
              <span>{building.shortName}</span>
              <strong>{building.name}</strong>
              <small>{building.tagline}</small>
            </button>
          ))}
        </div>
      </div>

      <section className={`world-marker-brief tone-${activeBuilding.markerTone}`} aria-live="polite">
        <span>{activeBuilding.id === 'council' ? '推荐起点' : '城邦建筑'}</span>
        <strong>{activeBuilding.name}</strong>
        <p>{activeBuilding.mvpRole}</p>
        <button type="button" onClick={() => onOpenBuilding(activeBuilding.id)}>
          进入{activeBuilding.shortName}
        </button>
      </section>

      <section className="home-entry-card" aria-label="城邦入口">
        <span>当前议题</span>
        <h2>{topic}</h2>
        <p>从冲突议会开始一轮圆桌。其他建筑负责归档、诊断、行动和长期记忆。</p>
        {restoredSession && (
          <div className="home-session-note" role="status">
            <strong>已恢复上次城邦</strong>
            <button type="button" onClick={onResetSession}>
              新开一轮
            </button>
          </div>
        )}
        <div className="home-entry-actions">
          <button className="primary-action" type="button" onClick={() => onOpenBuilding('council')}>
            进入冲突议会
          </button>
          <button className="secondary-action" type="button" onClick={onOpenScribe}>
            修改议题
          </button>
        </div>
      </section>

      <section className="home-deposit-card" aria-label="本轮沉淀">
        <span>本轮沉淀</span>
        <strong>{ideas.length} 个观点 · {routes.length} 条关系 · {acceptedTurns} 条采纳</strong>
        <p>{findings.length > 0 ? `巡城塔发现 ${findings.length} 条修缮令。` : '先进入议会，完成第一轮碰撞。'}</p>
      </section>

      <div className="world-zoom-controls" aria-label="地图缩放">
        <button type="button" onClick={() => updateScale(-0.1)} aria-label="缩小地图">
          -
        </button>
        <button type="button" onClick={resetView}>
          {Math.round(scale * 100)}%
        </button>
        <button type="button" onClick={() => updateScale(0.1)} aria-label="放大地图">
          +
        </button>
      </div>
    </main>
  );
}

function initialMapOffset() {
  if (typeof window === 'undefined') return { x: 0, y: 0 };
  return window.innerWidth <= 720 ? { x: -220, y: 0 } : { x: 0, y: 0 };
}
