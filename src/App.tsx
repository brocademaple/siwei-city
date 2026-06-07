import { useEffect, useMemo, useState } from 'react';
import { CityMap } from './components/CityMap';
import { GuideButton } from './components/GuideButton';
import { GuideOverlay } from './components/GuideOverlay';
import { IdeaPanel } from './components/IdeaPanel';
import { ReviewPanel } from './components/ReviewPanel';
import { districts, initialIdeas, initialRoutes, roleContributions, topic } from './data/seed';
import { contributionKey } from './lib/contribution';
import { nextIdeaPosition } from './lib/layout';
import { createOpeningDraft } from './lib/opening';
import { buildReviewFindings } from './lib/review';
import type { IdeaNode, ReviewFinding, RoleContribution, Route, RouteRelation } from './types';

const GUIDE_STORAGE_KEY = 'siwei-city-guide-complete';

function App() {
  const [currentTopic, setCurrentTopic] = useState(topic);
  const [ideas, setIdeas] = useState<IdeaNode[]>(initialIdeas);
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(initialIdeas[0]?.id ?? null);
  const [activePopoverIdeaId, setActivePopoverIdeaId] = useState<string | null>(initialIdeas[0]?.id ?? null);
  const [previewContribution, setPreviewContribution] = useState<RoleContribution | null>(null);
  const [acceptedContributionKeys, setAcceptedContributionKeys] = useState<string[]>([]);
  const [routeDraftFromId, setRouteDraftFromId] = useState<string | null>(null);
  const [relation, setRelation] = useState<RouteRelation>('支持');
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideStep, setGuideStep] = useState(0);

  const findings = useMemo(() => buildReviewFindings(ideas, routes), [ideas, routes]);
  const activeIdea = ideas.find((idea) => idea.id === activePopoverIdeaId) ?? null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(GUIDE_STORAGE_KEY) !== 'true') {
      setGuideOpen(true);
      setGuideStep(0);
    }
  }, []);

  function addIdea(draft: Pick<IdeaNode, 'title' | 'body' | 'type' | 'districtId' | 'authorRole'>) {
    const district = districts.find((item) => item.id === draft.districtId) ?? districts[0];
    const districtIdeaCount = ideas.filter((idea) => idea.districtId === draft.districtId).length;
    const position = nextIdeaPosition(district, districtIdeaCount);
    const newIdea: IdeaNode = {
      ...draft,
      id: `idea-${Date.now()}`,
      status: 'open',
      sprite: ideas.length % 12,
      ...position,
    };
    setIdeas((current) => [...current, newIdea]);
    setSelectedIdeaId(newIdea.id);
    setActivePopoverIdeaId(newIdea.id);
    setPreviewContribution(null);
  }

  function previewResidentContribution(contribution: RoleContribution) {
    setPreviewContribution(contribution);
    setActivePopoverIdeaId(null);
    setRouteDraftFromId(null);
  }

  function acceptContribution(contribution: RoleContribution) {
    const key = contributionKey(contribution);
    if (acceptedContributionKeys.includes(key)) return;
    setAcceptedContributionKeys((current) => [...current, key]);
    addIdea({
      title: contribution.title,
      body: contribution.body,
      type: contribution.type,
      districtId: contribution.districtId,
      authorRole: contribution.role,
    });
  }

  function selectIdea(id: string) {
    if (routeDraftFromId && routeDraftFromId !== id) {
      completeRoute(id);
      return;
    }
    setSelectedIdeaId(id);
    setActivePopoverIdeaId(id);
    setPreviewContribution(null);
  }

  function startRoute(id: string) {
    setRouteDraftFromId(id);
    setSelectedIdeaId(id);
    setActivePopoverIdeaId(id);
    setPreviewContribution(null);
  }

  function completeRoute(targetId: string) {
    if (!routeDraftFromId || routeDraftFromId === targetId) return;
    const route: Route = {
      id: `route-${Date.now()}`,
      fromId: routeDraftFromId,
      toId: targetId,
      relation,
    };
    setRoutes((current) => [...current, route]);
    setIdeas((current) =>
      current.map((idea) =>
        idea.id === route.fromId || idea.id === route.toId
          ? { ...idea, status: relation === '回流' ? 'resolved' : 'linked' }
          : idea,
      ),
    );
    setRouteDraftFromId(null);
    setSelectedIdeaId(targetId);
    setActivePopoverIdeaId(targetId);
  }

  function focusFinding(finding: ReviewFinding) {
    const firstTarget = finding.targetIds[0];
    if (firstTarget) selectIdea(firstTarget);
  }

  function startOpening(rawTopic: string) {
    const opening = createOpeningDraft(rawTopic);
    setCurrentTopic(opening.topic);
    setIdeas(opening.ideas);
    setRoutes(opening.routes);
    setSelectedIdeaId(opening.ideas[0]?.id ?? null);
    setActivePopoverIdeaId(opening.ideas[0]?.id ?? null);
    setPreviewContribution(null);
    setAcceptedContributionKeys([]);
    setRouteDraftFromId(null);
    setRelation('支持');
  }

  function finishGuide() {
    setGuideOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(GUIDE_STORAGE_KEY, 'true');
    }
  }

  return (
    <div className="app-shell">
      <IdeaPanel
        topic={currentTopic}
        districts={districts}
        roleContributions={roleContributions}
        onAddIdea={addIdea}
        onUseRoleContribution={previewResidentContribution}
        onStartOpening={startOpening}
      />
      <div className="realm-column">
        <section className="map-workspace">
          <CityMap
            districts={districts}
            ideas={ideas}
            routes={routes}
            selectedIdeaId={selectedIdeaId}
            routeDraftFromId={routeDraftFromId}
            activeIdea={activeIdea}
            previewContribution={previewContribution}
            relation={relation}
            acceptedContributionKeys={acceptedContributionKeys}
            onSelectIdea={selectIdea}
            onStartRoute={startRoute}
            onCompleteRoute={completeRoute}
            onRelationChange={setRelation}
            onClosePopover={() => {
              setActivePopoverIdeaId(null);
              setPreviewContribution(null);
            }}
            onAcceptContribution={acceptContribution}
          />
          <ReviewPanel
            findings={findings}
            roleContributions={roleContributions}
            acceptedContributionKeys={acceptedContributionKeys}
            onFocusFinding={focusFinding}
            onPreviewContribution={previewResidentContribution}
          />
        </section>
      </div>
      <GuideButton
        onOpen={() => {
          setGuideStep(0);
          setGuideOpen(true);
        }}
      />
      {guideOpen && (
        <GuideOverlay
          step={guideStep}
          onStepChange={setGuideStep}
          onClose={() => setGuideOpen(false)}
          onFinish={finishGuide}
        />
      )}
    </div>
  );
}

export default App;
