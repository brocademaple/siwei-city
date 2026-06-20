import { useEffect, useRef, useState } from 'react';
import { art } from '../assets/art';
import { cityBuildings } from '../lib/cityBuildings';
import type { BuildingSceneId, IdeaNode, ReviewFinding, Route, RoundtableTurn } from '../types';

const MIN_MAP_SCALE = 0.78;
const MAX_MAP_SCALE = 1.85;

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
  restoredSession: _restoredSession,
  onOpenBuilding,
  onOpenScribe,
  onResetSession: _onResetSession,
}: HomeWorldMapProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(() => initialMapOffset());
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const acceptedTurns = turns.filter((turn) => turn.accepted).length;
  const firstRoundComplete = acceptedTurns > 0;
  const homeAssets = art.homeOnboarding;
  const progressSummary = firstRoundComplete
    ? `${ideas.length} 观点 · ${routes.length} 关系 · ${acceptedTurns} 采纳${findings.length > 0 ? ` · ${findings.length} 修缮` : ''}`
    : '待开局 · 首轮后解锁后续建筑';

  function getMapMetrics() {
    const shell = shellRef.current;
    const canvas = canvasRef.current;
    if (!shell || !canvas) return null;
    return {
      shellWidth: shell.clientWidth,
      shellHeight: shell.clientHeight,
      canvasWidth: canvas.offsetWidth,
      canvasHeight: canvas.offsetHeight,
      canvasLeft: canvas.offsetLeft,
      canvasTop: canvas.offsetTop,
    };
  }

  function getCoverScale() {
    const metrics = getMapMetrics();
    if (!metrics || metrics.canvasWidth === 0 || metrics.canvasHeight === 0) return MIN_MAP_SCALE;
    return Math.max(MIN_MAP_SCALE, metrics.shellWidth / metrics.canvasWidth, metrics.shellHeight / metrics.canvasHeight);
  }

  function clampOffset(nextOffset: { x: number; y: number }, nextScale = scale) {
    const metrics = getMapMetrics();
    if (!metrics) return nextOffset;

    const scaledWidth = metrics.canvasWidth * nextScale;
    const scaledHeight = metrics.canvasHeight * nextScale;
    const canvasCenterX = metrics.canvasLeft + metrics.canvasWidth / 2;
    const canvasCenterY = metrics.canvasTop + metrics.canvasHeight / 2;
    const minX = metrics.shellWidth - canvasCenterX - scaledWidth / 2;
    const maxX = -canvasCenterX + scaledWidth / 2;
    const minY = metrics.shellHeight - canvasCenterY - scaledHeight / 2;
    const maxY = -canvasCenterY + scaledHeight / 2;

    return {
      x: minX > maxX ? metrics.shellWidth / 2 - canvasCenterX : clamp(nextOffset.x, minX, maxX),
      y: minY > maxY ? metrics.shellHeight / 2 - canvasCenterY : clamp(nextOffset.y, minY, maxY),
    };
  }

  function updateScale(delta: number) {
    setScale((current) => {
      const nextScale = Math.min(MAX_MAP_SCALE, Math.max(getCoverScale(), Number((current + delta).toFixed(2))));
      setOffset((currentOffset) => clampOffset(currentOffset, nextScale));
      return nextScale;
    });
  }

  function resetView() {
    const nextScale = Math.max(1, getCoverScale());
    setScale(nextScale);
    setOffset(clampOffset(initialMapOffset(), nextScale));
  }

  useEffect(() => {
    function handleResize() {
      setScale((currentScale) => {
        const nextScale = Math.max(currentScale, getCoverScale());
        setOffset((currentOffset) => clampOffset(currentOffset, nextScale));
        return nextScale;
      });
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <main className="home-world" data-guide="map">
      <div className="home-world-canvas-shell" ref={shellRef}>
        <div
          className="home-world-canvas"
          ref={canvasRef}
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
            setOffset(
              clampOffset({
                x: drag.offsetX + event.clientX - drag.x,
                y: drag.offsetY + event.clientY - drag.y,
              }),
            );
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
          <img className="home-council-arrow" src={homeAssets.arrowCouncil} alt="" aria-hidden="true" />
          {cityBuildings.map((building) => (
            <button
              className={`world-marker tone-${building.markerTone} ${building.id === 'council' ? 'primary' : ''}`}
              key={building.id}
              style={{
                left: `${building.mapX}%`,
                top: `${building.mapY}%`,
                backgroundImage: `url(${building.id === 'council' ? homeAssets.markerCardPrimary : homeAssets.markerCard})`,
              }}
              type="button"
              aria-label={`${building.name}：${building.tagline}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onOpenBuilding(building.id);
              }}
            >
              {building.id === 'council' && (
                <>
                  <img className="world-marker-halo" src={homeAssets.buildingHalo} alt="" aria-hidden="true" />
                  <img className="world-marker-recommended" src={homeAssets.labelRecommended} alt="推荐起点" />
                </>
              )}
              <img className="world-marker-label" src={homeAssets.markerLabels[building.id]} alt={building.name} />
              <small>{building.tagline}</small>
            </button>
          ))}
        </div>
      </div>

      <section className="home-entry-card" aria-label="城邦入口" style={{ backgroundImage: `url(${homeAssets.topicPanel})` }}>
        <img className="home-card-label" src={homeAssets.labelCurrentTopic} alt="当前议题" />
        <h2>{topic}</h2>
        <div className="home-entry-actions">
          <button
            className="home-art-button primary-action"
            style={{ backgroundImage: `url(${homeAssets.primaryButton})` }}
            type="button"
            onClick={() => onOpenBuilding('council')}
          >
            <span>从冲突议会开始</span>
          </button>
          <button
            className="home-art-button secondary-action"
            style={{ backgroundImage: `url(${homeAssets.secondaryButton})` }}
            type="button"
            onClick={onOpenScribe}
          >
            <span>换一个议题</span>
          </button>
        </div>
      </section>

      <section className="home-deposit-card" aria-label="本轮进度" style={{ backgroundImage: `url(${homeAssets.progressPanel})` }}>
        <img className="home-card-label" src={homeAssets.labelProgress} alt="本轮进度" />
        <strong className="home-deposit-status">{progressSummary}</strong>
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function initialMapOffset() {
  if (typeof window === 'undefined') return { x: 0, y: 0 };
  return window.innerWidth <= 720 ? { x: -220, y: 0 } : { x: 0, y: 0 };
}
