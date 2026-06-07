import { art } from '../assets/art';
import { relationOptions } from '../data/seed';
import { typeLabel } from '../lib/layout';
import type { District, IdeaNode, RoleContribution, Route, RouteRelation } from '../types';

interface MapPopoverProps {
  districts: District[];
  ideas: IdeaNode[];
  routes: Route[];
  idea: IdeaNode | null;
  previewContribution: RoleContribution | null;
  accepted: boolean;
  relation: RouteRelation;
  routeDraftFromId: string | null;
  onRelationChange: (relation: RouteRelation) => void;
  onStartRoute: (id: string) => void;
  onCompleteRoute: (id: string) => void;
  onClose: () => void;
  onAcceptContribution: (contribution: RoleContribution) => void;
}

export function MapPopover({
  districts,
  ideas,
  routes,
  idea,
  previewContribution,
  accepted,
  relation,
  routeDraftFromId,
  onRelationChange,
  onStartRoute,
  onCompleteRoute,
  onClose,
  onAcceptContribution,
}: MapPopoverProps) {
  if (previewContribution) {
    const district = districts.find((item) => item.id === previewContribution.districtId);
    return (
      <section className="map-popover preview-popover" data-guide="popover">
        <button className="popover-close" type="button" onClick={onClose} aria-label="关闭居民建议">
          ×
        </button>
        <span className="kicker">居民来函 · {previewContribution.role}</span>
        <h2>{previewContribution.title}</h2>
        <p>{previewContribution.body}</p>
        <div className="meta-row">
          <span>{typeLabel(previewContribution.type)}</span>
          <span>建议落入 {district?.name}</span>
        </div>
        <p className="term-hint">居民动态 = 多角色 agent 的建议流。点击只预览，不会自动改变地图。</p>
        <button
          className="primary-action"
          type="button"
          disabled={accepted}
          onClick={() => onAcceptContribution(previewContribution)}
        >
          {accepted ? '已入城邦' : '采纳入城'}
        </button>
        <small className="term-hint">采纳入城 = 把这条建议正式转成一座观点建筑。</small>
      </section>
    );
  }

  if (!idea) return null;

  const district = districts.find((item) => item.id === idea.districtId);
  const linkedRoutes = routes.filter((route) => route.fromId === idea.id || route.toId === idea.id);
  const routeSource = routeDraftFromId ? ideas.find((item) => item.id === routeDraftFromId) : null;
  const popoverLeft = Math.max(3, Math.min(68, idea.x + (idea.x > 56 ? -36 : 10)));
  const popoverTop = Math.max(4, Math.min(56, idea.y - 16));

  return (
    <section
      className={idea.x > 56 ? 'map-popover idea-popover pointer-right' : 'map-popover idea-popover pointer-left'}
      style={{ left: `${popoverLeft}%`, top: `${popoverTop}%` }}
      data-guide="popover"
    >
      <button className="popover-close" type="button" onClick={onClose} aria-label="关闭建筑详情">
        ×
      </button>
      <div className="popover-heading">
        <img src={art.buildings[idea.sprite % art.buildings.length]} alt="" />
        <div>
          <span className="kicker">{district?.name}</span>
          <h2>{idea.title}</h2>
        </div>
      </div>
      <p>{idea.body}</p>
      <div className="meta-row">
        <span>{typeLabel(idea.type)}</span>
        <span>{idea.authorRole}</span>
        <span>{idea.status === 'resolved' ? '已闭环' : idea.status === 'linked' ? '已连接' : '开放'}</span>
      </div>
      <p className="term-hint">铭文 = 观点正文；这里保留这座建筑真正要表达的判断。</p>

      <div className="road-forge">
        <div className="section-title">铺设道路</div>
        <small className="term-hint">铺设道路 = 建立观点之间的支持、冲突、依赖、延伸或回流关系。</small>
        <div className="relation-seals" aria-label="道路关系">
          {relationOptions.map((option) => (
            <button
              className={option === relation ? 'relation-seal active' : 'relation-seal'}
              key={option}
              type="button"
              onClick={() => onRelationChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {routeSource && routeSource.id !== idea.id ? (
          <button className="primary-action" type="button" onClick={() => onCompleteRoute(idea.id)}>
            铺到此处
          </button>
        ) : (
          <button className="secondary-action" type="button" onClick={() => onStartRoute(idea.id)}>
            设为起点
          </button>
        )}
        {routeSource && <p className="route-state">起点：{routeSource.title}</p>}
      </div>

      <div className="link-list">
        {linkedRoutes.length === 0 ? (
          <span className="muted">暂无道路</span>
        ) : (
          linkedRoutes.map((route) => {
            const otherId = route.fromId === idea.id ? route.toId : route.fromId;
            const other = ideas.find((item) => item.id === otherId);
            return (
              <span className="route-pill" key={route.id}>
                {route.relation} · {other?.title}
              </span>
            );
          })
        )}
      </div>
    </section>
  );
}
