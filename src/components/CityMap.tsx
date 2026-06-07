import type { CSSProperties } from 'react';
import { art } from '../assets/art';
import { contributionKey } from '../lib/contribution';
import { typeLabel } from '../lib/layout';
import type { District, IdeaNode, RoleContribution, Route, RouteRelation, ServicePanel } from '../types';
import { MapPopover } from './MapPopover';

interface CityMapProps {
  districts: District[];
  ideas: IdeaNode[];
  routes: Route[];
  selectedIdeaId: string | null;
  routeDraftFromId: string | null;
  activeIdea: IdeaNode | null;
  previewContribution: RoleContribution | null;
  relation: RouteRelation;
  acceptedContributionKeys: string[];
  recentAcceptedIdeaId: string | null;
  onSelectIdea: (id: string) => void;
  onStartRoute: (id: string) => void;
  onCompleteRoute: (id: string) => void;
  onRelationChange: (relation: RouteRelation) => void;
  onClosePopover: () => void;
  onAcceptContribution: (contribution: RoleContribution) => void;
  onOpenService: (panel: ServicePanel) => void;
}

export function CityMap({
  districts,
  ideas,
  routes,
  selectedIdeaId,
  routeDraftFromId,
  activeIdea,
  previewContribution,
  relation,
  acceptedContributionKeys,
  recentAcceptedIdeaId,
  onSelectIdea,
  onStartRoute,
  onCompleteRoute,
  onRelationChange,
  onClosePopover,
  onAcceptContribution,
  onOpenService,
}: CityMapProps) {
  return (
    <main
      className={previewContribution ? 'city-stage previewing-contribution' : 'city-stage'}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(42, 28, 18, 0.03), rgba(42, 28, 18, 0.46)), url(${art.heroCity})`,
      }}
      data-guide="map"
    >
      <div className="map-vignette" />
      <div className="district-layer" aria-hidden="true">
        {districts
          .filter((district) => district.showOnMap !== false)
          .map((district) => (
            <div
              className="district-marker"
              key={district.id}
              style={{ left: `${district.labelX ?? district.x}%`, top: `${district.labelY ?? district.y}%` }}
            >
              <strong>{district.name}</strong>
              <span className="district-tooltip">{district.role}</span>
            </div>
          ))}
      </div>

      <svg className="route-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {routes.map((route) => {
          const from = ideas.find((idea) => idea.id === route.fromId);
          const to = ideas.find((idea) => idea.id === route.toId);
          if (!from || !to) return null;
          const isActive = selectedIdeaId === from.id || selectedIdeaId === to.id || routeDraftFromId === from.id || routeDraftFromId === to.id;
          return (
            <g className={isActive ? 'route active-route' : 'route'} key={route.id}>
              <path
                className={`route-path relation-${relationClass(route.relation)}`}
                d={`M ${from.x} ${from.y} C ${(from.x + to.x) / 2} ${from.y - 6}, ${(from.x + to.x) / 2} ${to.y + 6}, ${to.x} ${to.y}`}
              />
              <text className="route-label" x={(from.x + to.x) / 2} y={(from.y + to.y) / 2}>
                {route.relation}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="idea-layer" data-guide="buildings">
        <button className="service-building service-residents" type="button" onClick={() => onOpenService('roundtable')}>
          <img src={art.buildings[10]} alt="" />
          <span>居民席位</span>
          <small>圆桌讨论</small>
        </button>
        <button className="service-building service-inspector" type="button" onClick={() => onOpenService('inspector')}>
          <img src={art.buildings[4]} alt="" />
          <span>巡城官塔</span>
          <small>修缮令</small>
        </button>
        <button className="service-building service-archive" type="button" onClick={() => onOpenService('archive')}>
          <img src={art.buildings[1]} alt="" />
          <span>卷轴馆</span>
          <small>报告归档</small>
        </button>
        {ideas.map((idea) => {
          const selected = selectedIdeaId === idea.id;
          const routeSource = routeDraftFromId === idea.id;
          const side = idea.labelSide ?? (idea.x > 72 ? 'left' : 'right');
          const offsetX = idea.labelOffsetX ?? (side === 'left' ? -8 : 8);
          const offsetY = idea.labelOffsetY ?? 0;
          const style = {
            left: `${idea.x}%`,
            top: `${idea.y}%`,
            '--label-x': `${offsetX * 8}px`,
            '--label-y': `${offsetY * 8}px`,
          } as CSSProperties;

          return (
            <button
              className={[
                'idea-building',
                `idea-${idea.type}`,
                `label-${side}`,
                `prominence-${idea.prominence ?? 'normal'}`,
                selected ? 'selected' : '',
                routeSource ? 'route-source' : '',
                recentAcceptedIdeaId === idea.id ? 'just-accepted' : '',
              ].join(' ')}
              key={idea.id}
              style={style}
              type="button"
              onClick={() => onSelectIdea(idea.id)}
              onDoubleClick={() => onStartRoute(idea.id)}
              data-guide={idea.id === ideas[0]?.id ? 'first-building' : undefined}
            >
              <span className="building-hitbox">
                <img className="building-figure" src={art.buildings[idea.sprite % art.buildings.length]} alt="" />
              </span>
              <span className="building-anchor" />
              <span className="idea-plaque">
                <small>
                  {typeLabel(idea.type)} · {idea.authorRole}
                </small>
                <strong>{idea.title}</strong>
              </span>
            </button>
          );
        })}
      </div>

      {(activeIdea || previewContribution) && (
        <MapPopover
          districts={districts}
          ideas={ideas}
          routes={routes}
          idea={activeIdea}
          previewContribution={previewContribution}
          accepted={previewContribution ? acceptedContributionKeys.includes(contributionKey(previewContribution)) : false}
          relation={relation}
          routeDraftFromId={routeDraftFromId}
          onRelationChange={onRelationChange}
          onStartRoute={onStartRoute}
          onCompleteRoute={onCompleteRoute}
          onClose={onClosePopover}
          onAcceptContribution={onAcceptContribution}
        />
      )}
    </main>
  );
}

function relationClass(relation: Route['relation']) {
  const map: Record<Route['relation'], string> = {
    支持: 'support',
    冲突: 'conflict',
    依赖: 'depend',
    延伸: 'extend',
    回流: 'return',
  };
  return map[relation];
}
