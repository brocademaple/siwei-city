import { useEffect, useRef, useState } from 'react';
import { art } from '../assets/art';
import type { HarnessPreset } from '../data/harnessData';
import { cityBuildings } from '../lib/cityBuildings';
import type { BuildingSceneId, IdeaNode, ReviewFinding, Route, RoundtableTurn } from '../types';
import { CityOverworldBar } from './CityOverworldBar';

const MIN_MAP_SCALE = 0.78;
const MAX_MAP_SCALE = 1.85;

interface HomeWorldMapProps {
  topic: string;
  ideas: IdeaNode[];
  routes: Route[];
  turns: RoundtableTurn[];
  findings: ReviewFinding[];
  restoredSession: boolean;
  presets: HarnessPreset[];
  activePreset: HarnessPreset;
  onSelectPreset: (presetId: string) => void;
  onOpenBuilding: (id: BuildingSceneId) => void;
  onOpenScribe: () => void;
  onResetSession: () => void;
}

export function HomeWorldMap({
  topic,
  ideas: _ideas,
  routes: _routes,
  turns: _turns,
  findings: _findings,
  restoredSession: _restoredSession,
  presets,
  activePreset,
  onSelectPreset,
  onOpenBuilding,
  onOpenScribe: _onOpenScribe,
  onResetSession: _onResetSession,
}: HomeWorldMapProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(() => initialMapOffset());
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const homeAssets = art.homeOnboarding;

  const keepCount = activePreset.tokens.filter((t) => t.status === 'keep').length;
  const modifyCount = activePreset.tokens.filter((t) => t.status === 'modify').length;
  const dropCount = activePreset.tokens.filter((t) => t.status === 'drop').length;

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
    <main className="home-world overworld-clean" data-guide="map">
      <CityOverworldBar
        presets={presets}
        activePreset={activePreset}
        onSelectPreset={onSelectPreset}
        onEnterCouncilSandbox={() => onOpenBuilding('council')}
        onEnterLibraryVault={() => onOpenBuilding('library')}
      />

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
          {/* SVG 集结路线：从各学派街区连向冲突议会厅 (55%, 58%) */}
          <svg className="overworld-convergence-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {activePreset.seats.map((seat) => (
              <g key={seat.seatCode}>
                <line
                  x1={seat.districtCoords.x}
                  y1={seat.districtCoords.y}
                  x2={55}
                  y2={58}
                  stroke="#B08D57"
                  strokeWidth="0.35"
                  strokeDasharray="1.2 0.8"
                />
                <circle cx={seat.districtCoords.x} cy={seat.districtCoords.y} r="0.9" fill="#A8432A" stroke="#FBFAF6" strokeWidth="0.25" />
              </g>
            ))}
          </svg>

          {/* 按当前 Preset 正在向议会厅集结的学派居民徽章 */}
          {activePreset.seats.map((seat) => (
            <div
              key={seat.seatCode}
              className="overworld-envoy-token"
              style={{
                left: `${seat.districtCoords.x}%`,
                top: `${seat.districtCoords.y}%`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenBuilding('council');
              }}
            >
              <img src={art.characters[seat.residentId]} alt={seat.residentName} />
              <div className="envoy-token-caption">
                <span>{seat.seatCode}</span>
                <b>{seat.seatTitle.split('·')[0].trim()}</b>
              </div>
            </div>
          ))}

          {cityBuildings.map((building) => {
            const isCouncil = building.id === 'council';
            const isLibrary = building.id === 'library';
            return (
              <button
                className={`world-marker tone-${building.markerTone} ${isCouncil ? 'primary' : ''} ${isLibrary ? 'library-highlight' : ''}`}
                key={building.id}
                style={{
                  left: `${building.mapX}%`,
                  top: `${building.mapY}%`,
                  backgroundImage: `url(${isCouncil ? homeAssets.markerCardPrimary : homeAssets.markerCard})`,
                }}
                type="button"
                aria-label={`${building.name}：${building.tagline}`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenBuilding(building.id);
                }}
              >
                {isCouncil && (
                  <>
                    <img className="world-marker-halo" src={homeAssets.buildingHalo} alt="" aria-hidden="true" />
                    <span className="marker-stone-badge">
                      室内石刻沙盘 · 保留 {keepCount} / 修正 {modifyCount} / 删减 {dropCount}
                    </span>
                  </>
                )}
                {isLibrary && (
                  <span className="marker-stone-badge bronze">
                    铜木格档案匣 · 3 印章 / 3 石刻简
                  </span>
                )}
                <img className="world-marker-label" src={homeAssets.markerLabels[building.id]} alt={building.name} />
                <small>{building.tagline}</small>
              </button>
            );
          })}
        </div>
      </div>

      {/* 底部极简石刻铭牌（取代旧版糊满画面的大表单框） */}
      <footer className="overworld-bottom-plaque" aria-label="当前推演议题石刻条">
        <div className="plaque-topic-info">
          <span className="cinzel-tag">ACTIVE PROPOSITION</span>
          <strong>{topic}</strong>
          <small>
            当前激活：{activePreset.code} 《{activePreset.shortName}》 · 筹码分流：{keepCount} 保留 / {modifyCount} 修正 / {dropCount} 删减
          </small>
        </div>
        <div className="plaque-cta-group">
          <button type="button" className="terracotta-main-btn" onClick={() => onOpenBuilding('council')}>
            进入议会厅 · 打开俯视石刻博弈沙盘 →
          </button>
        </div>
      </footer>

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
