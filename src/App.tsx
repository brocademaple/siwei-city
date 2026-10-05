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
import { createDiscussionRecord as buildDiscussionRecord, refreshPendingDiscussionRecord } from './lib/discussionRecords';
import { nextIdeaPosition } from './lib/layout';
import { createOpeningDraft } from './lib/opening';
import { buildReviewFindings } from './lib/review';
import { runFindingAgent, runOpeningAgents, runStructuredImport } from './lib/agents/agentRuntime';
import { getDistrictBlueprint } from './lib/districtBlueprints';
import { getCityBuilding } from './lib/cityBuildings';
import { councilResidentIds, getResidentProfile, residentProfiles } from './lib/residents';
import { sampleCases } from './lib/sampleCases';
import {
  archiveCity,
  clearLocalSnapshot,
  fetchCurrentCity,
  fetchSavedCities,
  loadLocalSavedCities,
  loadLocalSnapshot,
  putCurrentCity,
  restoreSavedCity,
  saveLocalSavedCities,
  saveLocalSnapshot,
} from './lib/storage/cityStorage';
import {
  createDiscussionRecord as persistDiscussionRecord,
  fetchDiscussionRecords,
  loadLocalDiscussionRecords,
  saveLocalDiscussionRecords,
  setDiscussionRecordStatus,
  updateDiscussionRecord,
} from './lib/storage/discussionRecordStorage';
import type { ArchiveDoc, BuildingSceneId, CitySnapshot, DiscussionMode, DiscussionRecord, DiscussionRecordStatus, IdeaNode, ResidentId, ReviewFinding, RoleContribution, RoundtableTurn, Route, RouteRelation, SavedCity, SceneView, ServicePanel, StructuredIdeaCandidate, UsageLedger } from './types';

const GUIDE_STORAGE_KEY = 'siwei-city-guide-complete';

type CouncilComposer =
  | { kind: 'new' }
  | { kind: 'followup'; parentRecordId: string }
  | null;

const initialLedger: UsageLedger = {
  engine: '本地模板',
  status: 'idle',
  calls: 0,
  inputTokens: 0,
  outputTokens: 0,
  estimatedCostCny: 0,
};

function App() {
  const persisted = useMemo(() => loadLocalSnapshot(), []);
  const persistedCities = useMemo(() => loadLocalSavedCities(), []);
  const persistedDiscussionRecords = useMemo(() => loadLocalDiscussionRecords(), []);
  const [restoredSession, setRestoredSession] = useState(Boolean(persisted));
  const [currentTopic, setCurrentTopic] = useState(persisted?.currentTopic ?? topic);
  const [mode, setMode] = useState<DiscussionMode>(persisted?.mode ?? 'explore');
  const [ledger, setLedger] = useState<UsageLedger>(initialLedger);
  const [ideas, setIdeas] = useState<IdeaNode[]>(persisted?.ideas ?? initialIdeas.map((idea) => ({ ...idea, source: '本地模板' })));
  const [routes, setRoutes] = useState<Route[]>(persisted?.routes ?? initialRoutes);
  const [turns, setTurns] = useState<RoundtableTurn[]>(persisted?.turns ?? createOpeningDraft(topic, 'explore').turns);
  const [savedCities, setSavedCities] = useState<SavedCity[]>(persistedCities);
  const [discussionRecords, setDiscussionRecords] = useState<DiscussionRecord[]>(persistedDiscussionRecords);
  const [activeDiscussionRecordId, setActiveDiscussionRecordId] = useState<string | null>(persistedDiscussionRecords[0]?.id ?? null);
  const [councilComposer, setCouncilComposer] = useState<CouncilComposer>(null);
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
  const [storageReady, setStorageReady] = useState(false);

  const findings = useMemo(() => buildReviewFindings(ideas, routes), [ideas, routes]);
  const activeIdea = ideas.find((idea) => idea.id === activePopoverIdeaId) ?? null;
  const archiveDocs: ArchiveDoc[] = useMemo(() => buildArchiveDocs(currentTopic, mode, ideas, routes, findings, turns), [currentTopic, mode, ideas, routes, findings, turns]);
  const acceptedTurnCount = useMemo(() => turns.filter((turn) => turn.accepted).length, [turns]);
  const openingStarted =
    ledger.status === 'running' ||
    ledger.calls > 0 ||
    acceptedTurnCount > 0 ||
    Boolean(persisted?.currentTopic && persisted.currentTopic !== topic) ||
    discussionRecords.some((record) => record.id === activeDiscussionRecordId && record.topic === currentTopic);
  const activeCodexProfile = useMemo(() => (activeCodexResidentId ? getResidentProfile(activeCodexResidentId) : null), [activeCodexResidentId]);
  const activeBlueprintDistrict = useMemo(
    () => districts.find((district) => district.id === activeBlueprintDistrictId) ?? null,
    [activeBlueprintDistrictId],
  );
  const activeDistrictBlueprint = useMemo(
    () => (activeBlueprintDistrictId ? getDistrictBlueprint(activeBlueprintDistrictId) : null),
    [activeBlueprintDistrictId],
  );
  const activeDiscussionRecord = useMemo(
    () => discussionRecords.find((record) => record.id === activeDiscussionRecordId) ?? null,
    [activeDiscussionRecordId, discussionRecords],
  );

  useEffect(() => {
    let cancelled = false;
    async function hydrateFromSql() {
      const [currentResult, historyResult, recordsResult] = await Promise.all([fetchCurrentCity(), fetchSavedCities(), fetchDiscussionRecords()]);
      if (cancelled) return;
      if (historyResult.ok && historyResult.value) {
        setSavedCities(mergeSavedCities(historyResult.value, persistedCities));
      }
      if (recordsResult.ok && recordsResult.value) {
        const mergedRecords = mergeDiscussionRecords(recordsResult.value, persistedDiscussionRecords);
        setDiscussionRecords(mergedRecords);
        setActiveDiscussionRecordId((current) => current ?? mergedRecords[0]?.id ?? null);
      }
      if (currentResult.ok && currentResult.value) {
        applySnapshot(currentResult.value);
        setRestoredSession(true);
      }
      setStorageReady(true);
    }
    hydrateFromSql();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const snapshot = buildCurrentSnapshot(currentTopic, mode, ideas, routes, turns, acceptedContributionKeys);
    saveLocalSnapshot(snapshot);
    if (!storageReady) return;
    const timer = window.setTimeout(() => {
      putCurrentCity(snapshot);
    }, 550);
    return () => window.clearTimeout(timer);
  }, [currentTopic, ideas, routes, mode, turns, acceptedContributionKeys, storageReady]);

  useEffect(() => {
    saveLocalSavedCities(savedCities);
  }, [savedCities]);

  useEffect(() => {
    saveLocalDiscussionRecords(discussionRecords);
  }, [discussionRecords]);

  useEffect(() => {
    if (!activeDiscussionRecord || activeDiscussionRecord.status !== 'pending' || ledger.status === 'running') return;
    const snapshot = buildCurrentSnapshot(currentTopic, mode, ideas, routes, turns, acceptedContributionKeys);
    if (snapshotFingerprint(activeDiscussionRecord.snapshot) === snapshotFingerprint(snapshot)) return;
    const refreshed = refreshPendingDiscussionRecord(activeDiscussionRecord, snapshot, findings);
    setDiscussionRecords((current) => current.map((record) => (record.id === refreshed.id ? refreshed : record)));
    updateDiscussionRecord(refreshed);
  }, [acceptedContributionKeys, activeDiscussionRecord, currentTopic, findings, ideas, ledger.status, mode, routes, turns]);

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

  async function previewStructuredImport(rawText: string) {
    setLedger((current) => ({ ...current, status: 'running', engine: 'AI 推演', lastError: undefined }));
    const result = await runStructuredImport(rawText, currentTopic, mode, ideas);
    setLedger(result.ledger);
    return result.candidates;
  }

  function confirmStructuredImport(candidates: StructuredIdeaCandidate[]) {
    if (candidates.length === 0) return;
    const importedIdeas = candidates.map((candidate, index) => {
      const district = districts.find((item) => item.id === candidate.districtId) ?? districts[0];
      const districtIdeaCount =
        ideas.filter((idea) => idea.districtId === candidate.districtId).length +
        candidates.slice(0, index).filter((item) => item.districtId === candidate.districtId).length;
      const position = nextIdeaPosition(district, districtIdeaCount);
      return {
        id: `idea-import-${Date.now()}-${index + 1}`,
        title: candidate.title,
        body: candidate.body,
        type: candidate.type,
        districtId: candidate.districtId,
        authorRole: candidate.authorRole,
        status: 'open' as const,
        sprite: (ideas.length + index) % 12,
        source: candidate.source ?? 'AI 生成',
        ...position,
      };
    });
    setIdeas((current) => [...current, ...importedIdeas]);
    setSelectedIdeaId(importedIdeas[0]?.id ?? null);
    setActivePopoverIdeaId(importedIdeas[0]?.id ?? null);
    setPreviewContribution(null);
    setAdoptionNotice(`已导入 ${candidates.length} 条候选想法，进入地图等待继续连线和议会讨论。`);
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
    setAdoptionNotice(`已纳入本轮结论：${newIdea.title}。议题地图和行动线索已同步更新。`);
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

  function applySnapshot(snapshot: CitySnapshot) {
    setCurrentTopic(snapshot.currentTopic);
    setMode(snapshot.mode);
    setIdeas(snapshot.ideas);
    setRoutes(snapshot.routes);
    setTurns(snapshot.turns);
    setAcceptedContributionKeys(snapshot.acceptedContributionKeys ?? snapshot.turns.filter((turn) => turn.accepted).map((turn) => contributionKey(turn)));
    setSelectedIdeaId(null);
    setActivePopoverIdeaId(null);
    setPreviewContribution(null);
    setRouteDraftFromId(null);
    setRelation('支持');
  }

  function focusFinding(finding: ReviewFinding) {
    const firstTarget = finding.targetIds[0];
    if (firstTarget) selectIdea(firstTarget);
  }

  async function startOpening(rawTopic: string) {
    const parentRecordId = councilComposer?.kind === 'followup' ? councilComposer.parentRecordId : undefined;
    setLedger((current) => ({ ...current, status: 'running', engine: 'AI 推演', lastError: undefined }));
    setCouncilComposer(null);
    setCurrentTopic(rawTopic.trim() || currentTopic);
    setTurns([]);
    setAcceptedContributionKeys([]);
    setActiveDiscussionRecordId(null);
    setActiveResidentId(councilResidentIds[0]);
    setSceneView('council');
    const agentResult = await runOpeningAgents(rawTopic, mode, ideas, routes, (partialOpening) => {
      setCurrentTopic(partialOpening.topic);
      setIdeas(partialOpening.ideas);
      setRoutes(partialOpening.routes);
      setTurns(partialOpening.turns);
    });
    const opening = agentResult.opening;
    setLedger(agentResult.ledger);
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
    const snapshot = buildCurrentSnapshot(opening.topic, mode, opening.ideas, opening.routes, opening.turns, []);
    saveCompletedDiscussionRecord(snapshot, buildReviewFindings(opening.ideas, opening.routes), parentRecordId, agentResult.ledger);
    setDrawerOpen(true);
    setActivePanel('roundtable');
    setActiveDocId('archive-report');
    setSceneView('council');
    setScribeCollapsed(true);
  }

  async function runCompleteDiscussion(rawTopic: string) {
    setLedger((current) => ({ ...current, status: 'running', engine: 'AI 推演', lastError: undefined }));
    setActiveDiscussionRecordId(null);
    const agentResult = await runOpeningAgents(rawTopic, mode, ideas, routes);
    const opening = agentResult.opening;
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

    setLedger(agentResult.ledger);
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
    setScribeCollapsed(true);
    const snapshot = buildCurrentSnapshot(opening.topic, mode, completeIdeas, completeRoutes, acceptedTurns, acceptedTurns.map((turn) => contributionKey(turn)));
    saveCompletedDiscussionRecord(snapshot, buildReviewFindings(completeIdeas, completeRoutes), undefined, agentResult.ledger);
    setAdoptionNotice(`完整讨论已跑通：${opening.topic}`);
  }

  function saveCompletedDiscussionRecord(
    snapshot: CitySnapshot,
    recordFindings: ReviewFinding[],
    parentRecordId?: string,
    recordLedger?: UsageLedger,
  ) {
    const record = buildDiscussionRecord(snapshot, recordFindings, { parentRecordId, ledger: recordLedger });
    setDiscussionRecords((current) => [record, ...current.filter((item) => item.id !== record.id)].slice(0, 48));
    setActiveDiscussionRecordId(record.id);
    persistDiscussionRecord(record).then((result) => {
      if (!result.ok) setAdoptionNotice('本轮记录已暂存在本地；图书馆 API 暂不可用。');
    });
  }

  function changeDiscussionRecordStatus(status: DiscussionRecordStatus, id = activeDiscussionRecordId) {
    if (!id) return;
    const record = discussionRecords.find((item) => item.id === id);
    if (!record || record.status !== 'pending') return;
    const updated = setDiscussionRecordStatus(record, status);
    setDiscussionRecords((current) => current.map((item) => (item.id === id ? updated : item)));
    updateDiscussionRecord(updated).then((result) => {
      if (!result.ok) setAdoptionNotice('记录状态已更新到本地；图书馆 API 暂不可用。');
    });
  }

  function resetCurrentSession() {
    const opening = createOpeningDraft(topic, 'explore');
    setCurrentTopic(topic);
    setMode('explore');
    setLedger(initialLedger);
    setIdeas(initialIdeas.map((idea) => ({ ...idea, source: '本地模板' })));
    setRoutes(initialRoutes);
    setTurns(opening.turns);
    setSelectedIdeaId(null);
    setActivePopoverIdeaId(null);
    setPreviewContribution(null);
    setAcceptedContributionKeys([]);
    setRecentAcceptedIdeaId(null);
    setRouteDraftFromId(null);
    setRelation('支持');
    setCouncilComposer(null);
    setDrawerOpen(false);
    setActivePanel('roundtable');
    setActiveDocId('archive-report');
    setSceneView('city');
    setActiveResidentId(councilResidentIds[0]);
    setActiveCodexResidentId(null);
    setActiveBlueprintDistrictId(null);
    setScribeCollapsed(true);
    setRestoredSession(false);
    clearLocalSnapshot();
    setAdoptionNotice('已新开一轮：城邦回到干净起点，历史卷轴仍保留。');
  }

  function enterCouncil(rawTopic?: string, residentId?: ResidentId) {
    const cleanTopic = rawTopic?.trim();
    if (cleanTopic) setCurrentTopic(cleanTopic);
    setSceneView('council');
    setScribeCollapsed(true);
    const nextResidentId = residentId && councilResidentIds.includes(residentId) ? residentId : activeResidentId ?? councilResidentIds[0];
    setActiveResidentId(nextResidentId);
    setActiveBlueprintDistrictId(null);
    setActiveCodexResidentId(null);
    setPreviewContribution(null);
    setActivePopoverIdeaId(null);
  }

  function prepareNewDiscussion() {
    setCouncilComposer({ kind: 'new' });
    setSceneView('council');
    setScribeCollapsed(true);
  }

  function prepareFollowUpDiscussion() {
    if (!activeDiscussionRecord) return;
    setCouncilComposer({ kind: 'followup', parentRecordId: activeDiscussionRecord.id });
    setSceneView('council');
    setScribeCollapsed(true);
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

  async function saveCurrentCity() {
    const savedAt = new Date().toLocaleString('zh-CN', { hour12: false });
    const localCity: SavedCity = {
      id: `city-${Date.now()}`,
      topic: currentTopic,
      mode,
      ideas,
      routes,
      turns,
      savedAt,
    };
    const snapshot = buildCurrentSnapshot(currentTopic, mode, ideas, routes, turns, acceptedContributionKeys);
    const result = await archiveCity({ ...snapshot, savedAt });
    const city = result.ok && result.value ? result.value : localCity;
    setSavedCities((current) => mergeSavedCities([city], current).slice(0, 12));
    setAdoptionNotice(result.ok ? `城邦已封存到 SQL API：${currentTopic}` : `城邦已本地封存：${currentTopic}。SQL API 暂不可用。`);
  }

  async function loadSavedCity(id: string) {
    const restored = await restoreSavedCity(id);
    if (restored.ok && restored.value) {
      applySnapshot(restored.value);
      setActivePanel('archive');
      setDrawerOpen(true);
      setActiveDocId('archive-report');
      setAdoptionNotice(`已从 SQL API 打开历史城邦：${restored.value.currentTopic}`);
      return;
    }
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

  async function discussFinding(finding: ReviewFinding) {
    setLedger((current) => ({ ...current, status: 'running', engine: 'AI 推演', lastError: undefined }));
    const result = await runFindingAgent(finding, mode, currentTopic, ideas);
    const turn = result.turn;
    setLedger(result.ledger);
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
    <div
      className={[
        scribeCollapsed ? 'app-shell scribe-collapsed' : 'app-shell',
        sceneView === 'city' ? 'home-shell' : '',
        sceneView === 'library' ? 'library-shell' : '',
        guideOpen ? 'guide-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {sceneView !== 'library' && (
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
          onPreviewImport={previewStructuredImport}
          onConfirmImport={confirmStructuredImport}
          sceneView={sceneView}
          onEnterCouncil={enterCouncil}
          onModeChange={setMode}
          collapsed={scribeCollapsed}
          onToggleCollapsed={() => setScribeCollapsed((value) => !value)}
        />
      )}
      <div className="realm-column">
        <section className="map-workspace">
          {sceneView === 'city' ? (
            <HomeWorldMap
              topic={currentTopic}
              ideas={ideas}
              routes={routes}
              turns={turns}
            findings={findings}
              restoredSession={restoredSession}
              onOpenBuilding={openBuildingScene}
              onOpenScribe={() => setScribeCollapsed(false)}
              onResetSession={resetCurrentSession}
            />
          ) : sceneView === 'council' ? (
            <CouncilStage
              topic={currentTopic}
              mode={mode}
              turns={turns}
              findings={findings}
              docs={archiveDocs}
              activeResidentId={activeResidentId}
              discussionStarted={openingStarted}
              discussionRunning={ledger.status === 'running'}
              activeRecord={activeDiscussionRecord}
              composerMode={councilComposer?.kind ?? null}
              onActiveResidentChange={setActiveResidentId}
              onStartOpening={startOpening}
              onCancelComposer={() => setCouncilComposer(null)}
              onPrepareFollowUp={prepareFollowUpDiscussion}
              onPrepareNewDiscussion={prepareNewDiscussion}
              onAcceptTurn={acceptContribution}
              onRecordStatusChange={changeDiscussionRecordStatus}
              onOpenLibrary={() => openBuildingScene('library')}
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
              discussionRecords={discussionRecords}
              onDiscussionRecordStatusChange={changeDiscussionRecordStatus}
              onBackToCity={() => setSceneView('city')}
              onOpenBuilding={openBuildingScene}
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
            discussionRecords={discussionRecords}
            activeDocId={activeDocId}
            onToggle={() => setDrawerOpen((value) => !value)}
            onPanelChange={setActivePanel}
            onPreviewTurn={previewResidentContribution}
            onFocusFinding={focusFinding}
            onDiscussFinding={discussFinding}
            onOpenDoc={openArchiveDoc}
            onCloseDoc={() => setActiveDocId(null)}
            onSaveCity={saveCurrentCity}
            onLoadCity={loadSavedCity}
            onLoadSampleCase={loadSampleCase}
            onDiscussionRecordStatusChange={changeDiscussionRecordStatus}
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
          <span>纳入结论</span>
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
          onClose={finishGuide}
          onFinish={() => {
            finishGuide();
            enterCouncil();
          }}
        />
      )}
    </div>
  );
}

export default App;

function buildCurrentSnapshot(
  currentTopic: string,
  mode: DiscussionMode,
  ideas: IdeaNode[],
  routes: Route[],
  turns: RoundtableTurn[],
  acceptedContributionKeys: string[],
): CitySnapshot {
  return {
    currentTopic,
    mode,
    ideas,
    routes,
    turns,
    acceptedContributionKeys,
    savedAt: new Date().toISOString(),
    storageSource: 'localStorage',
  };
}

function mergeSavedCities(primary: SavedCity[], fallback: SavedCity[]) {
  const seen = new Set<string>();
  return [...primary, ...fallback].filter((city) => {
    if (seen.has(city.id)) return false;
    seen.add(city.id);
    return true;
  });
}

function mergeDiscussionRecords(primary: DiscussionRecord[], fallback: DiscussionRecord[]) {
  const seen = new Set<string>();
  return [...primary, ...fallback].filter((record) => {
    if (seen.has(record.id)) return false;
    seen.add(record.id);
    return true;
  });
}

function snapshotFingerprint(snapshot: CitySnapshot) {
  return JSON.stringify({
    currentTopic: snapshot.currentTopic,
    mode: snapshot.mode,
    ideas: snapshot.ideas,
    routes: snapshot.routes,
    turns: snapshot.turns,
    acceptedContributionKeys: snapshot.acceptedContributionKeys,
  });
}
