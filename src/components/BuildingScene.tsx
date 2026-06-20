import { useState } from 'react';
import { art } from '../assets/art';
import type { CityBuilding } from '../lib/cityBuildings';
import { residentProfiles } from '../lib/residents';
import type { ArchiveDoc, BuildingActionTarget, IdeaNode, ReviewFinding, Route, RoundtableTurn } from '../types';

interface BuildingSceneProps {
  building: CityBuilding;
  topic: string;
  ideas: IdeaNode[];
  routes: Route[];
  turns: RoundtableTurn[];
  findings: ReviewFinding[];
  docs: ArchiveDoc[];
  onBackToCity: () => void;
  onEnterCouncil: () => void;
  onRunComplete: () => void;
}

export function BuildingScene({
  building,
  topic,
  ideas,
  routes,
  turns,
  findings,
  docs,
  onBackToCity,
  onEnterCouncil,
  onRunComplete,
}: BuildingSceneProps) {
  const [activeTarget, setActiveTarget] = useState<BuildingActionTarget>(building.primaryActionTarget);
  const isCouncil = building.id === 'council';
  const primaryLabel = building.id === 'council' ? '召开完整议会' : building.primaryAction;

  return (
    <main
      className={`building-scene building-${building.id}${isCouncil ? '' : ' building-layout'}`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(28, 18, 10, 0.08), rgba(28, 18, 10, 0.58)), url(${art.scenes[building.sceneAssetKey]})`,
      }}
      data-guide="map"
    >
      <header className="building-topbar">
        <button type="button" onClick={onBackToCity}>
          ← 返回城邦
        </button>
        {isCouncil && <span>{building.name}</span>}
        <button type="button" onClick={onEnterCouncil}>
          去议会
        </button>
      </header>

      {isCouncil ? (
        <>
          <section className="building-hero-panel" style={{ backgroundImage: `url(${art.homeOnboarding.topicPanel})` }}>
            <BuildingPanelHead
              building={building}
              primaryLabel={primaryLabel}
              onPrimaryAction={onRunComplete}
              onEnterCouncil={onEnterCouncil}
            />
          </section>

          <section
            className={`building-state-panel target-${activeTarget}`}
            aria-label={`${building.name} 当前状态`}
            style={{ backgroundImage: `url(${art.homeOnboarding.progressPanel})` }}
          >
            <SceneContent
              building={building}
              topic={topic}
              ideas={ideas}
              routes={routes}
              turns={turns}
              findings={findings}
              docs={docs}
            />
          </section>
        </>
      ) : (
        <>
          <div className="building-visual-zone" aria-hidden="true" />
          <aside
            className={`building-functional-panel target-${activeTarget}`}
            aria-label={`${building.name} 当前状态`}
          >
            <BuildingPanelHead
              building={building}
              primaryLabel={primaryLabel}
              onPrimaryAction={() => setActiveTarget(building.primaryActionTarget)}
              onEnterCouncil={onEnterCouncil}
            />
            <div className="building-panel-body">
              <SceneContent
                building={building}
                topic={topic}
                ideas={ideas}
                routes={routes}
                turns={turns}
                findings={findings}
                docs={docs}
              />
            </div>
          </aside>
        </>
      )}
    </main>
  );
}

function BuildingPanelHead({
  building,
  primaryLabel,
  onPrimaryAction,
  onEnterCouncil,
}: {
  building: CityBuilding;
  primaryLabel: string;
  onPrimaryAction: () => void;
  onEnterCouncil: () => void;
}) {
  const isCouncil = building.id === 'council';

  return (
    <div className="building-panel-head">
      <span>{building.tagline}</span>
      <h2>{building.name}</h2>
      <p className="building-primary-copy">{building.entryCopy}</p>
      <details className="building-detail-toggle building-help-panel">
        <summary>查看这个建筑负责什么</summary>
        <p>{building.mvpRole}</p>
        <div className="building-examples">
          {building.exampleItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </details>
      <div className="building-actions">
        <button className="primary-action" type="button" onClick={onPrimaryAction}>
          {primaryLabel}
        </button>
        {!isCouncil && (
          <button className="secondary-action" type="button" onClick={onEnterCouncil}>
            去冲突议会
          </button>
        )}
      </div>
    </div>
  );
}

interface SceneContentProps {
  building: CityBuilding;
  topic: string;
  ideas: IdeaNode[];
  routes: Route[];
  turns: RoundtableTurn[];
  findings: ReviewFinding[];
  docs: ArchiveDoc[];
}

function SceneContent({ building, topic, ideas, routes, turns, findings, docs }: SceneContentProps) {
  const acceptedTurns = turns.filter((turn) => turn.accepted);
  const reportDoc = docs.find((doc) => doc.id === 'archive-report');
  const actionDoc = docs.find((doc) => doc.id === 'archive-action');
  const actionIdeas = ideas.filter((idea) => idea.type === 'action');

  if (building.id === 'library') {
    return (
      <>
        <SceneHeading title="馆藏卷轴" body={reportDoc ? '本轮记录已经可以在这里阅读和带走。' : building.emptyBody} />
        <div className="building-content-list building-list">
          {docs.length === 0 ? (
            <EmptyScene building={building} />
          ) : (
            docs.slice(0, 4).map((doc) => (
              <article className="building-doc-row building-doc-card building-content-row" key={doc.id}>
                <span>{doc.createdAt}</span>
                <strong>{doc.title}</strong>
                <p>{docKindLabel(doc.kind)} · {summarizeText(doc.body)}</p>
              </article>
            ))
          )}
        </div>
      </>
    );
  }

  if (building.id === 'residential') {
    return (
      <>
        <SceneHeading title="居民图鉴" body="这里解释居民为什么会在议会里采取不同认知姿态。" />
        <div className="building-content-list building-list">
          {residentProfiles.map((profile) => (
            <article className="building-content-row" key={profile.id}>
              <strong>{profile.title}</strong>
              <p>{profile.roleName} · {profile.promptBrief}</p>
              <em>{profile.outputContract}</em>
            </article>
          ))}
        </div>
      </>
    );
  }

  if (building.id === 'hypothesisHarbor') {
    return (
      <>
        <SceneHeading title="候选上会议题" body="这些问题还在码头称重，只有足够具体、可反驳、可行动时才送进议会。" />
        <div className="building-content-list building-list">
          <article className="building-content-row">
            <strong>{topic}</strong>
            <p>当前议题已经具备上会条件：它足够具体，可以被研究者、怀疑者、实践者和执行者轮流处理。</p>
          </article>
          {routes.slice(0, 3).map((route) => (
            <article className="building-content-row" key={route.id}>
              <strong>{route.relation} 关系</strong>
              <p>这条关系会决定候选议题是否需要更多证据、反驳或行动回流。</p>
            </article>
          ))}
        </div>
      </>
    );
  }

  if (building.id === 'actionHarbor') {
    return (
      <>
        <SceneHeading title="远航航线" body={actionIdeas.length > 0 ? '这些行动可以从码头出航，返航时带回阶段性结果。' : building.emptyBody} />
        <div className="building-content-list building-list">
          {actionIdeas.length === 0 ? (
            <EmptyScene building={building} />
          ) : (
            actionIdeas.map((idea) => (
              <article className="building-content-row" key={idea.id}>
                <strong>{idea.title}</strong>
                <p>{idea.body}</p>
              </article>
            ))
          )}
          {actionDoc && (
            <article className="building-doc-row building-content-row">
              <strong>{actionDoc.title}</strong>
              <p>{summarizeText(actionDoc.body)}</p>
            </article>
          )}
        </div>
      </>
    );
  }

  if (building.id === 'lighthouse') {
    return (
      <>
        <SceneHeading title="巡城诊断" body={findings.length > 0 ? `巡城塔发现 ${findings.length} 条结构缺口。` : building.emptyBody} />
        <div className="building-content-list building-list">
          {findings.length === 0 ? (
            <EmptyScene building={building} />
          ) : (
            findings.map((finding) => (
              <article className="building-content-row" key={finding.id}>
                <strong>{finding.title}</strong>
                <p>{finding.detail}</p>
                <em>{finding.repairAction}</em>
              </article>
            ))
          )}
        </div>
      </>
    );
  }

  if (building.id === 'memoryCemetery') {
    return (
      <>
        <SceneHeading title="废案墓志" body={building.emptyBody} />
        <div className="building-content-list building-list">
          <article className="building-content-row">
            <strong>过期判断会留在这里</strong>
            <p>后续每次行动返航，都可以把失败、误判和不再适用的结论迁入废案馆。</p>
          </article>
          <article className="building-content-row">
            <strong>当前仍在推进</strong>
            <p>本轮有 {acceptedTurns.length} 条已采纳观点，尚未正式进入废案记录。</p>
          </article>
        </div>
      </>
    );
  }

  if (building.id === 'contemplationGarden') {
    return (
      <>
        <SceneHeading title="夜间札记" body={building.emptyBody} />
        <div className="building-content-list building-list">
          {turns.length === 0 ? (
            <EmptyScene building={building} />
          ) : (
            turns.slice(0, 3).map((turn) => (
              <article className="building-content-row" key={turn.id}>
                <strong>{turn.role}留下的问题</strong>
                <p>
                  {turn.respondsTo ? `回应 ${turn.respondsTo}：` : ''}
                  {turn.title}
                </p>
              </article>
            ))
          )}
        </div>
      </>
    );
  }

  return <EmptyScene building={building} />;
}

function docKindLabel(kind: ArchiveDoc['kind']) {
  const labels: Record<ArchiveDoc['kind'], string> = {
    report: '讨论报告',
    action: '行动契约',
    roundtable: '圆桌记录',
    repair: '修缮令',
    narrative: '叙事文档',
    case: '案例记录',
    mechanism: '机制说明',
    trace: '链路追踪',
  };

  return labels[kind];
}

function summarizeText(source: string) {
  const plainText = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>#-]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plainText) {
    return '这份卷轴等待补充正文。';
  }

  return plainText.length > 86 ? `${plainText.slice(0, 86)}...` : plainText;
}

function SceneHeading({ title, body }: { title: string; body: string }) {
  return (
    <div className="building-state-heading">
      <span className="section-title">{title}</span>
      <p>{body}</p>
    </div>
  );
}

function EmptyScene({ building }: { building: CityBuilding }) {
  return (
    <article className="building-empty-card">
      <strong>{building.emptyTitle}</strong>
      <p>{building.emptyBody}</p>
    </article>
  );
}
