import { useEffect, useMemo, useState } from 'react';
import { CityMap } from './components/CityMap';
import { GuideButton } from './components/GuideButton';
import { GuideOverlay } from './components/GuideOverlay';
import { IdeaPanel } from './components/IdeaPanel';
import { ServiceDrawer } from './components/ServiceDrawer';
import { districts, initialIdeas, initialRoutes, roleContributions, topic } from './data/seed';
import { contributionKey } from './lib/contribution';
import { buildArchiveDocs } from './lib/archive';
import { nextIdeaPosition } from './lib/layout';
import { createOpeningDraft } from './lib/opening';
import { buildReviewFindings } from './lib/review';
import { requestAiDraft } from './lib/ai';
import type { ArchiveDoc, DiscussionMode, IdeaNode, ReviewFinding, RoleContribution, RoundtableTurn, Route, RouteRelation, ServicePanel, UsageLedger } from './types';

const GUIDE_STORAGE_KEY = 'siwei-city-guide-complete';
const APP_STATE_KEY = 'siwei-city-session-v2';

const initialLedger: UsageLedger = {
  engine: '本地模板',
  status: 'idle',
  calls: 0,
  inputTokens: 0,
  outputTokens: 0,
  estimatedCostCny: 0,
};

interface PersistedState {
  currentTopic: string;
  ideas: IdeaNode[];
  routes: Route[];
  mode: DiscussionMode;
  turns: RoundtableTurn[];
  acceptedContributionKeys: string[];
}

function loadPersistedState(): PersistedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(APP_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function App() {
  const persisted = useMemo(() => loadPersistedState(), []);
  const [currentTopic, setCurrentTopic] = useState(persisted?.currentTopic ?? topic);
  const [mode, setMode] = useState<DiscussionMode>(persisted?.mode ?? 'explore');
  const [ledger, setLedger] = useState<UsageLedger>(initialLedger);
  const [ideas, setIdeas] = useState<IdeaNode[]>(persisted?.ideas ?? initialIdeas.map((idea) => ({ ...idea, source: '本地模板' })));
  const [routes, setRoutes] = useState<Route[]>(persisted?.routes ?? initialRoutes);
  const [turns, setTurns] = useState<RoundtableTurn[]>(persisted?.turns ?? createOpeningDraft(topic, 'explore').turns);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>((persisted?.ideas ?? initialIdeas)[0]?.id ?? null);
  const [activePopoverIdeaId, setActivePopoverIdeaId] = useState<string | null>((persisted?.ideas ?? initialIdeas)[0]?.id ?? null);
  const [previewContribution, setPreviewContribution] = useState<RoleContribution | null>(null);
  const [acceptedContributionKeys, setAcceptedContributionKeys] = useState<string[]>(persisted?.acceptedContributionKeys ?? []);
  const [routeDraftFromId, setRouteDraftFromId] = useState<string | null>(null);
  const [relation, setRelation] = useState<RouteRelation>('支持');
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ServicePanel>('roundtable');
  const [activeDocId, setActiveDocId] = useState<string | null>('archive-report');

  const findings = useMemo(() => buildReviewFindings(ideas, routes), [ideas, routes]);
  const activeIdea = ideas.find((idea) => idea.id === activePopoverIdeaId) ?? null;
  const archiveDocs: ArchiveDoc[] = useMemo(() => buildArchiveDocs(currentTopic, mode, ideas, routes, findings, turns), [currentTopic, mode, ideas, routes, findings, turns]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const state: PersistedState = { currentTopic, ideas, routes, mode, turns, acceptedContributionKeys };
    window.localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
  }, [currentTopic, ideas, routes, mode, turns, acceptedContributionKeys]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(GUIDE_STORAGE_KEY) !== 'true') {
      setGuideOpen(true);
      setGuideStep(0);
    }
  }, []);

  function addIdea(draft: Pick<IdeaNode, 'title' | 'body' | 'type' | 'districtId' | 'authorRole'> & Partial<Pick<IdeaNode, 'source'>>) {
    const district = districts.find((item) => item.id === draft.districtId) ?? districts[0];
    const districtIdeaCount = ideas.filter((idea) => idea.districtId === draft.districtId).length;
    const position = nextIdeaPosition(district, districtIdeaCount);
    const newIdea: IdeaNode = {
      ...draft,
      id: `idea-${Date.now()}`,
      status: 'open',
      sprite: ideas.length % 12,
      source: draft.source ?? '用户手写',
      ...position,
    };
    setIdeas((current) => [...current, newIdea]);
    setSelectedIdeaId(newIdea.id);
    setActivePopoverIdeaId(newIdea.id);
    setPreviewContribution(null);
    return newIdea;
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
    const newIdea = addIdea({
      title: contribution.title,
      body: contribution.body,
      type: contribution.type,
      districtId: contribution.districtId,
      authorRole: contribution.role,
      source: contribution.source ?? '本地模板',
    });
    if ('id' in contribution) {
      const turn = contribution as RoundtableTurn;
      setTurns((current) => current.map((item) => (item.id === turn.id ? { ...item, accepted: true } : item)));
      if (turn.targetIdeaId) {
        setRoutes((current) => [
          ...current,
          {
            id: `route-${Date.now()}`,
            fromId: turn.targetIdeaId!,
            toId: newIdea.id,
            relation: turn.relation,
          },
        ]);
      }
    }
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

  async function startOpening(rawTopic: string) {
    const localOpening = createOpeningDraft(rawTopic, mode);
    setLedger((current) => ({ ...current, status: 'running', engine: 'AI 推演', lastError: undefined }));
    const aiResult = await requestAiDraft(localOpening.topic, mode, ideas, routes);
    const opening = applyAiDraft(localOpening, aiResult.draft);
    setLedger(aiResult.ledger);
    setCurrentTopic(opening.topic);
    setIdeas(opening.ideas);
    setRoutes(opening.routes);
    setTurns(opening.turns);
    setSelectedIdeaId(opening.ideas[0]?.id ?? null);
    setActivePopoverIdeaId(opening.ideas[0]?.id ?? null);
    setPreviewContribution(null);
    setAcceptedContributionKeys([]);
    setRouteDraftFromId(null);
    setRelation('支持');
    setDrawerOpen(true);
    setActivePanel('roundtable');
    setActiveDocId('archive-report');
  }

  function openService(panel: ServicePanel) {
    setActivePanel(panel);
    setDrawerOpen(true);
    setPreviewContribution(null);
    setActivePopoverIdeaId(null);
  }

  function discussFinding(finding: ReviewFinding) {
    const target = ideas.find((idea) => idea.id === finding.targetIds[0]);
    const turn: RoundtableTurn = {
      id: `turn-repair-${Date.now()}`,
      mode,
      role: finding.suggestedRole,
      title: `回应修缮令：${finding.title}`,
      body: `${finding.repairAction} 关联建筑：${target?.title ?? finding.detail}。这条来函先进入圆桌，等待你决定是否采纳入城。`,
      type: finding.id === 'open-actions' ? 'action' : finding.id === 'unsupported-hypotheses' ? 'evidence' : finding.id === 'unresolved-counters' ? 'counter' : 'hypothesis',
      districtId: finding.id === 'open-actions' ? 'action' : finding.id === 'unsupported-hypotheses' ? 'evidence' : finding.id === 'unresolved-counters' ? 'conflict' : 'hypothesis',
      relation: finding.id === 'unresolved-counters' ? '冲突' : finding.id === 'open-actions' ? '回流' : '支持',
      targetIdeaId: target?.id,
      source: ledger.engine === 'AI 推演' && ledger.status === 'ready' ? 'AI 生成' : '本地模板',
      respondsTo: '巡城官令',
    };
    setTurns((current) => [turn, ...current]);
    setActivePanel('roundtable');
    setDrawerOpen(true);
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
        mode={mode}
        ledger={ledger}
        districts={districts}
        roleContributions={roleContributions}
        onAddIdea={addIdea}
        onUseRoleContribution={previewResidentContribution}
        onStartOpening={startOpening}
        onModeChange={setMode}
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
            onOpenService={openService}
          />
          <ServiceDrawer
            open={drawerOpen}
            activePanel={activePanel}
            turns={turns}
            findings={findings}
            docs={archiveDocs}
            activeDocId={activeDocId}
            onToggle={() => setDrawerOpen((value) => !value)}
            onPanelChange={setActivePanel}
            onPreviewTurn={previewResidentContribution}
            onFocusFinding={focusFinding}
            onDiscussFinding={discussFinding}
            onOpenDoc={setActiveDocId}
            onCloseDoc={() => setActiveDocId(null)}
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

function applyAiDraft(localOpening: ReturnType<typeof createOpeningDraft>, aiDraft?: Awaited<ReturnType<typeof requestAiDraft>>['draft']) {
  if (!aiDraft) return localOpening;
  const aiIdeas = aiDraft.ideas?.slice(0, 5).map((draft, index) => ({
    ...localOpening.ideas[index],
    ...draft,
    id: localOpening.ideas[index]?.id ?? `idea-ai-${index}`,
    x: localOpening.ideas[index]?.x ?? 50,
    y: localOpening.ideas[index]?.y ?? 50,
    sprite: localOpening.ideas[index]?.sprite ?? index,
    status: localOpening.ideas[index]?.status ?? 'linked',
    source: 'AI 生成' as const,
  }));
  const ideas = aiIdeas?.length ? aiIdeas : localOpening.ideas;
  const turns = aiDraft.turns?.slice(0, 6).map((turn, index) => ({
    ...localOpening.turns[index % localOpening.turns.length],
    ...turn,
    id: `turn-ai-${index + 1}`,
    mode: localOpening.turns[index % localOpening.turns.length].mode,
    source: 'AI 生成' as const,
    targetIdeaId: localOpening.turns[index % localOpening.turns.length].targetIdeaId,
  }));
  return { ...localOpening, ideas, turns: turns?.length ? turns : localOpening.turns };
}
