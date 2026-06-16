import type { CSSProperties } from 'react';
import { art } from '../assets/art';
import { contributionKey } from '../lib/contribution';
import type { DistrictBlueprint } from '../lib/districtBlueprints';
import { typeLabel } from '../lib/layout';
import type { District, IdeaNode, ResidentId, ResidentProfile, RoleContribution, Route, RouteRelation } from '../types';
import { DistrictBlueprintPanel } from './DistrictBlueprintPanel';
import { MapPopover } from './MapPopover';
import { ResidentCodexPanel } from './ResidentCodexPanel';

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
  activeCodexProfile?: ResidentProfile | null;
  activeBlueprintDistrict?: District | null;
  activeDistrictBlueprint?: DistrictBlueprint | null;
  residentProfiles?: ResidentProfile[];
  onSelectResidentProfile?: (id: ResidentId) => void;
  onSelectDistrict?: (districtId: string) => void;
  onEnterCouncil?: () => void;
  onCloseCodex?: () => void;
  onCloseBlueprint?: () => void;
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
  activeCodexProfile,
  activeBlueprintDistrict,
  activeDistrictBlueprint,
  residentProfiles = [],
  onSelectResidentProfile,
  onSelectDistrict,
  onEnterCouncil,
  onCloseCodex,
  onCloseBlueprint,
}: CityMapProps) {
  function enterCouncilFromMap(event?: { preventDefault: () => void }) {
    event?.preventDefault();
    onEnterCouncil?.();
  }

  return (
    <main
      className={previewContribution ? 'city-stage previewing-contribution' : 'city-stage'}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(42, 28, 18, 0.03), rgba(42, 28, 18, 0.46)), url(${art.heroCity})`,
      }}
      data-guide="map"
    >
      <div className="map-vignette" />
      <button className="council-entry-banner" type="button" onPointerDown={enterCouncilFromMap} onClick={() => enterCouncilFromMap()}>
        <span>冲突议会</span>
        <strong>进入议会展开思维碰撞</strong>
      </button>
      <div className="district-layer" aria-label="城邦建筑图鉴">
        {districts
          .filter((district) => district.showOnMap !== false && district.id !== 'conflict')
          .map((district) => (
            <button
              className="district-marker"
              key={district.id}
              style={{ left: `${district.labelX ?? district.x}%`, top: `${district.labelY ?? district.y}%` }}
              type="button"
              onClick={() => onSelectDistrict?.(district.id)}
            >
              <strong>{district.name}</strong>
              <small>规划</small>
              <span className="district-tooltip">{district.role}</span>
            </button>
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

      {!activeIdea && !previewContribution && !activeCodexProfile && !activeBlueprintDistrict && (
        <section className="city-deposit-summary" aria-label="本轮城邦沉淀">
          <span>城邦沉淀</span>
          <strong>
            {ideas.length} 座观点小筑 · {routes.length} 条关系道路
          </strong>
          <p>小建筑只作记录，点击才展开正文；主要讨论从上方进入议会。</p>
        </section>
      )}

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

      <ResidentCodexPanel
        profile={activeCodexProfile ?? null}
        profiles={residentProfiles}
        onSelectProfile={(id) => onSelectResidentProfile?.(id)}
        onEnterCouncil={() => onEnterCouncil?.()}
        onClose={() => onCloseCodex?.()}
      />
      <DistrictBlueprintPanel
        district={activeBlueprintDistrict ?? null}
        blueprint={activeDistrictBlueprint ?? null}
        residents={residentProfiles}
        onSelectResident={(id) => onSelectResidentProfile?.(id)}
        onEnterCouncil={() => onEnterCouncil?.()}
        onClose={() => onCloseBlueprint?.()}
      />
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
