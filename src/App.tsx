import { useEffect, useMemo, useState } from 'react';
import { BuildingScene } from './components/BuildingScene';
import { CouncilStage } from './components/CouncilStage';
import { GuideButton } from './components/GuideButton';
import { GuideOverlay } from './components/GuideOverlay';
import { HomeWorldMap } from './components/HomeWorldMap';
import { IdeaPanel } from './components/IdeaPanel';
import { ServiceDrawer } from './components/ServiceDrawer';
import { districts, initialIdeas, initialRoutes, roleContributions, topic } from './data/seed';
import { contributionKey } from './lib/contribution';
import { buildArchiveDocs } from './lib/archive';
import { nextIdeaPosition } from './lib/layout';
import { createOpeningDraft } from './lib/opening';
import { buildReviewFindings } from './lib/review';
import { requestAiDraft } from './lib/ai';
import { getDistrictBlueprint } from './lib/districtBlueprints';
import { getCityBuilding } from './lib/cityBuildings';
import { councilResidentIds, getResidentProfile, residentProfiles } from './lib/residents';
import { sampleCases } from './lib/sampleCases';
import type { ArchiveDoc, BuildingSceneId, DiscussionMode, IdeaNode, ResidentId, ReviewFinding, RoleContribution, RoundtableTurn, Route, RouteRelation, SavedCity, SceneView, ServicePanel, UsageLedger } from './types';

const GUIDE_STORAGE_KEY = 'siwei-city-guide-complete';
const APP_STATE_KEY = 'siwei-city-session-v2';
const CITY_HISTORY_KEY = 'siwei-city-history-v1';

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

function loadSavedCities(): SavedCity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CITY_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function App() {
  const persisted = useMemo(() => loadPersistedState(), []);
  const persistedCities = useMemo(() => loadSavedCities(), []);
  const [currentTopic, setCurrentTopic] = useState(persisted?.currentTopic ?? topic);
  const [mode, setMode] = useState<DiscussionMode>(persisted?.mode ?? 'explore');
  const [ledger, setLedger] = useState<UsageLedger>(initialLedger);
  const [ideas, setIdeas] = useState<IdeaNode[]>(persisted?.ideas ?? initialIdeas.map((idea) => ({ ...idea, source: '本地模板' })));
  const [routes, setRoutes] = useState<Route[]>(persisted?.routes ?? initialRoutes);
  const [turns, setTurns] = useState<RoundtableTurn[]>(persisted?.turns ?? createOpeningDraft(topic, 'explore').turns);
  const [savedCities, setSavedCities] = useState<SavedCity[]>(persistedCities);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [activePopoverIdeaId, setActivePopoverIdeaId] = useState<string | null>(null);
  const [previewContribution, setPreviewContribution] = useState<RoleContribution | null>(null);
  const [acceptedContributionKeys, setAcceptedContributionKeys] = useState<string[]>(persisted?.acceptedContributionKeys ?? []);
  const [recentAcceptedIdeaId, setRecentAcceptedIdeaId] = useState<string | null>(null);
  const [adoptionNotice, setAdoptionNotice] = useState<string | null>(null);
  const [routeDraftFromId, setRouteDraftFromId] = useState<string | null>(null);
  const [relation, setRelation] = useState<RouteRelation>('支持');
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ServicePanel>('roundtable');
  const [activeDocId, setActiveDocId] = useState<string | null>('archive-report');
  const [sceneView, setSceneView] = useState<SceneView>('city');
  const [activeResidentId, setActiveResidentId] = useState<ResidentId | null>(councilResidentIds[0]);
  const [activeCodexResidentId, setActiveCodexResidentId] = useState<ResidentId | null>(null);
  const [activeBlueprintDistrictId, setActiveBlueprintDistrictId] = useState<string | null>(null);
  const [scribeCollapsed, setScribeCollapsed] = useState(true);

  const findings = useMemo(() => buildReviewFindings(ideas, routes), [ideas, routes]);
  const activeIdea = ideas.find((idea) => idea.id === activePopoverIdeaId) ?? null;
  const archiveDocs: ArchiveDoc[] = useMemo(() => buildArchiveDocs(currentTopic, mode, ideas, routes, findings, turns), [currentTopic, mode, ideas, routes, findings, turns]);
  const acceptedTurnCount = useMemo(() => turns.filter((turn) => turn.accepted).length, [turns]);
  const openingStarted = ledger.calls > 0 || acceptedTurnCount > 0 || (persisted?.currentTopic && persisted.currentTopic !== topic);
  const activeCodexProfile = useMemo(() => (activeCodexResidentId ? getResidentProfile(activeCodexResidentId) : null), [activeCodexResidentId]);
  const activeBlueprintDistrict = useMemo(
    () => districts.find((district) => district.id === activeBlueprintDistrictId) ?? null,
    [activeBlueprintDistrictId],
  );
  const activeDistrictBlueprint = useMemo(
    () => (activeBlueprintDistrictId ? getDistrictBlueprint(activeBlueprintDistrictId) : null),
    [activeBlueprintDistrictId],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const state: PersistedState = { currentTopic, ideas, routes, mode, turns, acceptedContributionKeys };
    window.localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
  }, [currentTopic, ideas, routes, mode, turns, acceptedContributionKeys]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(CITY_HISTORY_KEY, JSON.stringify(savedCities));
  }, [savedCities]);

  useEffect(() => {
    if (!adoptionNotice) return;
    const timer = window.setTimeout(() => {
      setAdoptionNotice(null);
      setRecentAcceptedIdeaId(null);
    }, 3600);
    return () => window.clearTimeout(timer);
  }, [adoptionNotice]);

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
    setSceneView('city');
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
    setRecentAcceptedIdeaId(newIdea.id);
    setAdoptionNotice(`来函已入城：${newIdea.title}。建筑亮起，道路与卷轴记录已更新。`);
    setSelectedIdeaId(null);
    setActivePopoverIdeaId(null);
    setPreviewContribution(null);
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
    setSelectedIdeaId(null);
    setActivePopoverIdeaId(null);
    setPreviewContribution(null);
    setAcceptedContributionKeys([]);
    setRouteDraftFromId(null);
    setRelation('支持');
    setDrawerOpen(true);
    setActivePanel('roundtable');
    setActiveDocId('archive-report');
    setSceneView('council');
  }

  function runCompleteDiscussion(rawTopic: string) {
    const opening = createOpeningDraft(rawTopic, mode);
    const completeIdeas: IdeaNode[] = [...opening.ideas];
    const completeRoutes: Route[] = [...opening.routes];
    const acceptedTurns: RoundtableTurn[] = opening.turns.map((turn, index) => {
      const district = districts.find((item) => item.id === turn.districtId) ?? districts[0];
      const districtIdeaCount = completeIdeas.filter((idea) => idea.districtId === turn.districtId).length;
      const position = nextIdeaPosition(district, districtIdeaCount);
      const acceptedIdea: IdeaNode = {
        id: `idea-complete-${turn.id}`,
        title: turn.title,
        body: turn.body,
        type: turn.type,
        districtId: turn.districtId,
        authorRole: turn.role,
        status: turn.relation === '回流' ? 'resolved' : 'linked',
        sprite: (completeIdeas.length + index) % 12,
        source: turn.source ?? '本地模板',
        ...position,
      };
      completeIdeas.push(acceptedIdea);
      if (turn.targetIdeaId) {
        completeRoutes.push({
          id: `route-complete-${turn.id}`,
          fromId: turn.targetIdeaId,
          toId: acceptedIdea.id,
          relation: turn.relation,
        });
      }
      return { ...turn, accepted: true };
    });

    setLedger({
      ...initialLedger,
      engine: '本地模板',
      status: 'ready',
      calls: 1,
      inputTokens: Math.ceil(JSON.stringify({ topic: opening.topic, mode, turns: opening.turns }).length / 1.8),
    });
    setCurrentTopic(opening.topic);
    setIdeas(completeIdeas);
    setRoutes(completeRoutes);
    setTurns(acceptedTurns);
    setAcceptedContributionKeys(acceptedTurns.map((turn) => contributionKey(turn)));
    setSelectedIdeaId(null);
    setActivePopoverIdeaId(null);
    setPreviewContribution(null);
    setRouteDraftFromId(null);
    setRelation('支持');
    setDrawerOpen(true);
    setActivePanel('walkthrough');
    setActiveDocId('archive-report');
    setSceneView('council');
    setActiveResidentId('reportEditor');
    setAdoptionNotice(`完整讨论已跑通：${opening.topic}`);
  }

  function enterCouncil(rawTopic?: string, residentId?: ResidentId) {
    const cleanTopic = rawTopic?.trim();
    if (cleanTopic) setCurrentTopic(cleanTopic);
    setSceneView('council');
    const nextResidentId = residentId && councilResidentIds.includes(residentId) ? residentId : activeResidentId ?? councilResidentIds[0];
    setActiveResidentId(nextResidentId);
    setActiveBlueprintDistrictId(null);
    setActiveCodexResidentId(null);
    setPreviewContribution(null);
    setActivePopoverIdeaId(null);
  }

  function openBuildingScene(buildingId: BuildingSceneId) {
    if (buildingId === 'council') {
      enterCouncil();
      return;
    }
    setSceneView(buildingId);
    setActiveBlueprintDistrictId(null);
    setActiveCodexResidentId(null);
    setPreviewContribution(null);
    setActivePopoverIdeaId(null);
    setDrawerOpen(false);
  }

  function selectDistrictBlueprint(districtId: string) {
    if (districtId === 'conflict') {
      enterCouncil();
      return;
    }
    setActiveBlueprintDistrictId(districtId);
    setActiveCodexResidentId(null);
    setActivePopoverIdeaId(null);
    setPreviewContribution(null);
  }

  function saveCurrentCity() {
    const savedAt = new Date().toLocaleString('zh-CN', { hour12: false });
    const city: SavedCity = {
      id: `city-${Date.now()}`,
      topic: currentTopic,
      mode,
      ideas,
      routes,
      turns,
      savedAt,
    };
    setSavedCities((current) => [city, ...current].slice(0, 12));
    setAdoptionNotice(`城邦已封存：${currentTopic}`);
  }

  function loadSavedCity(id: string) {
    const city = savedCities.find((item) => item.id === id);
    if (!city) return;
    setCurrentTopic(city.topic);
    setMode(city.mode);
    setIdeas(city.ideas);
    setRoutes(city.routes);
    setTurns(city.turns);
    setSelectedIdeaId(null);
    setActivePopoverIdeaId(null);
    setPreviewContribution(null);
    setAcceptedContributionKeys(city.turns.filter((turn) => turn.accepted).map((turn) => contributionKey(turn)));
    setActivePanel('archive');
    setDrawerOpen(true);
    setActiveDocId('archive-report');
    setAdoptionNotice(`已打开历史城邦：${city.topic}`);
  }

  function loadSampleCase(id: string) {
    const sample = sampleCases.find((item) => item.id === id);
    if (!sample) return;
    const draft = createOpeningDraft(sample.topic, sample.recommendedMode);
    const sampleTurns = draft.turns.map((turn, index) => ({
      ...turn,
      title: index === 0 ? '先确认这个议题真正卡在哪里' : turn.title,
      body: `${sample.modeAngles[sample.recommendedMode]} ${turn.body}`,
      respondsTo: index === 0 ? '样例议题' : draft.turns[index - 1]?.role,
    }));
    setCurrentTopic(draft.topic);
    setMode(sample.recommendedMode);
    setLedger({ ...initialLedger, engine: '本地模板', status: 'ready' });
    setIdeas(draft.ideas);
    setRoutes(draft.routes);
    setTurns(sampleTurns);
    setSelectedIdeaId(null);
    setActivePopoverIdeaId(null);
    setPreviewContribution(null);
    setAcceptedContributionKeys([]);
    setActivePanel('archive');
    setDrawerOpen(true);
    setActiveDocId(`case-${sample.id}`);
    setAdoptionNotice(`已载入案例馆藏：${sample.title}`);
  }

  function openService(panel: ServicePanel) {
    setActivePanel(panel);
    setDrawerOpen(true);
    setPreviewContribution(null);
    setActivePopoverIdeaId(null);
  }

  function openArchiveDoc(id: string) {
    setActiveDocId(id);
    setActivePanel('archive');
    setDrawerOpen(true);
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
    <div className={[scribeCollapsed ? 'app-shell scribe-collapsed' : 'app-shell', sceneView === 'city' ? 'home-shell' : ''].join(' ')}>
      <IdeaPanel
        topic={currentTopic}
        mode={mode}
        ledger={ledger}
        districts={districts}
        roleContributions={roleContributions}
        openingStarted={Boolean(openingStarted)}
        ideaCount={ideas.length}
        routeCount={routes.length}
        turnCount={turns.length}
        acceptedTurnCount={acceptedTurnCount}
        findingCount={findings.length}
        onAddIdea={addIdea}
        onUseRoleContribution={previewResidentContribution}
        onStartOpening={startOpening}
        onRunComplete={runCompleteDiscussion}
        sceneView={sceneView}
        onEnterCouncil={enterCouncil}
        onModeChange={setMode}
        collapsed={scribeCollapsed}
        onToggleCollapsed={() => setScribeCollapsed((value) => !value)}
      />
      <div className="realm-column">
        <section className="map-workspace">
          {sceneView === 'city' ? (
            <HomeWorldMap
              topic={currentTopic}
              ideas={ideas}
              routes={routes}
              turns={turns}
              findings={findings}
              onOpenBuilding={openBuildingScene}
              onOpenScribe={() => setScribeCollapsed(false)}
            />
          ) : sceneView === 'council' ? (
            <CouncilStage
              topic={currentTopic}
              mode={mode}
              turns={turns}
              findings={findings}
              docs={archiveDocs}
              activeDocId={activeDocId}
              activeResidentId={activeResidentId}
              onActiveResidentChange={setActiveResidentId}
              onRunComplete={() => runCompleteDiscussion(currentTopic)}
              onStartOpening={() => startOpening(currentTopic)}
              onAcceptTurn={acceptContribution}
              onDiscussFinding={discussFinding}
              onOpenDoc={openArchiveDoc}
              onBackToCity={() => setSceneView('city')}
            />
          ) : (
            <BuildingScene
              building={getCityBuilding(sceneView)}
              topic={currentTopic}
              ideas={ideas}
              routes={routes}
              turns={turns}
              findings={findings}
              docs={archiveDocs}
              onBackToCity={() => setSceneView('city')}
              onEnterCouncil={() => enterCouncil()}
              onRunComplete={() => runCompleteDiscussion(currentTopic)}
            />
          )}
          {sceneView === 'city' && (
            <ServiceDrawer
            open={drawerOpen}
            activePanel={activePanel}
            topic={currentTopic}
            mode={mode}
            ideas={ideas}
            routes={routes}
            turns={turns}
            findings={findings}
            docs={archiveDocs}
            savedCities={savedCities}
            activeDocId={activeDocId}
            onToggle={() => setDrawerOpen((value) => !value)}
            onPanelChange={setActivePanel}
            onPreviewTurn={previewResidentContribution}
            onFocusFinding={focusFinding}
            onDiscussFinding={discussFinding}
            onOpenDoc={setActiveDocId}
            onCloseDoc={() => setActiveDocId(null)}
            onSaveCity={saveCurrentCity}
            onLoadCity={loadSavedCity}
            onLoadSampleCase={loadSampleCase}
          />
          )}
        </section>
      </div>
      {adoptionNotice && (
        <div className="adoption-ritual" role="status">
          <span>来函</span>
          <i>→</i>
          <span>预览</span>
          <i>→</i>
          <span>采纳入城</span>
          <strong>{adoptionNotice}</strong>
        </div>
      )}
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
