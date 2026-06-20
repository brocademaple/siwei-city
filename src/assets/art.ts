import heroCity from './art/optimized/hero-city-panorama.webp';
import cityWorld from './art/optimized/scenes/city-world-panorama.webp';
import actionHarbor from './art/optimized/scenes/action-harbor-panorama.webp';
import contemplationGarden from './art/optimized/scenes/contemplation-garden-panorama.webp';
import councilChamber from './art/optimized/scenes/council-chamber-panorama.webp';
import grandLibrary from './art/optimized/scenes/grand-library-panorama.webp';
import hypothesisHarbor from './art/optimized/scenes/hypothesis-harbor-panorama.webp';
import lighthouseWatchtower from './art/optimized/scenes/lighthouse-watchtower-panorama.webp';
import memoryCemetery from './art/optimized/scenes/memory-cemetery-panorama.webp';
import residentialQuarter from './art/optimized/scenes/residential-quarter-panorama.webp';

import archiveKeeper from './art/optimized/characters/archive-keeper.webp';
import cityInspector from './art/optimized/characters/city-inspector.webp';
import residentExecutor from './art/optimized/characters/resident-executor.webp';
import residentPractitioner from './art/optimized/characters/resident-practitioner.webp';
import residentResearcher from './art/optimized/characters/resident-researcher.webp';
import residentSkeptic from './art/optimized/characters/resident-skeptic.webp';
import residentBoundarySkeptic from './art/optimized/characters/resident-boundary-skeptic.webp';
import residentEvidenceCartographer from './art/optimized/characters/resident-evidence-cartographer.webp';
import residentFieldEthnographer from './art/optimized/characters/resident-field-ethnographer.webp';
import residentMomentumExecutor from './art/optimized/characters/resident-momentum-executor.webp';
import reportEditor from './art/optimized/characters/report-editor.webp';
import systemsInspector from './art/optimized/characters/systems-inspector.webp';

import buildingArch from './art/buildings/building-arch.png';
import buildingBellTower from './art/buildings/building-bell-tower.png';
import buildingBridgeShrine from './art/buildings/building-bridge-shrine.png';
import buildingCloisterGate from './art/buildings/building-cloister-gate.png';
import buildingCouncil from './art/buildings/building-council.png';
import buildingHarborGate from './art/buildings/building-harbor-gate.png';
import buildingLectern from './art/buildings/building-lectern.png';
import buildingLibrary from './art/buildings/building-library.png';
import buildingObservatory from './art/buildings/building-observatory.png';
import buildingStele from './art/buildings/building-stele.png';
import buildingTemple from './art/buildings/building-temple.png';
import buildingWorkshop from './art/buildings/building-workshop.png';

import textureBronze from './art/textures/texture-bronze.png';
import textureMap from './art/textures/texture-map.png';
import textureParchment from './art/textures/texture-parchment.png';
import textureSeal from './art/textures/texture-seal.png';
import textureStone from './art/textures/texture-stone.png';
import textureVellum from './art/textures/texture-vellum.png';

import homeArrowCouncil from './art/home-onboarding/arrow-council.png';
import homeBuildingHalo from './art/home-onboarding/building-halo.png';
import homeCoachBubble from './art/home-onboarding/coach-bubble.png';
import homeCoachCopy from './art/home-onboarding/coach-copy.png';
import homeLabelCurrentTopic from './art/home-onboarding/label-current-topic.png';
import homeLabelGraveyard from './art/home-onboarding/label-graveyard.png';
import homeLabelLibrary from './art/home-onboarding/label-library.png';
import homeLabelLighthouse from './art/home-onboarding/label-lighthouse.png';
import homeLabelProgress from './art/home-onboarding/label-progress.png';
import homeLabelRecommended from './art/home-onboarding/label-recommended.png';
import homeLabelService from './art/home-onboarding/label-service.png';
import homeMarkerCard from './art/home-onboarding/marker-card.webp';
import homeMarkerCardPrimary from './art/home-onboarding/marker-card-primary.webp';
import homeMarkerLabelActionHarbor from './art/home-onboarding/marker-labels/marker-label-action-harbor.png';
import homeMarkerLabelContemplationGarden from './art/home-onboarding/marker-labels/marker-label-contemplation-garden.png';
import homeMarkerLabelCouncil from './art/home-onboarding/marker-labels/marker-label-council.png';
import homeMarkerLabelHypothesisHarbor from './art/home-onboarding/marker-labels/marker-label-hypothesis-harbor.png';
import homeMarkerLabelLibrary from './art/home-onboarding/marker-labels/marker-label-library.png';
import homeMarkerLabelLighthouse from './art/home-onboarding/marker-labels/marker-label-lighthouse.png';
import homeMarkerLabelMemoryCemetery from './art/home-onboarding/marker-labels/marker-label-memory-cemetery.png';
import homeMarkerLabelResidential from './art/home-onboarding/marker-labels/marker-label-residential.png';
import homePrimaryButton from './art/home-onboarding/primary-button.webp';
import homeProgressPanel from './art/home-onboarding/progress-panel.webp';
import homeSecondaryButton from './art/home-onboarding/secondary-button.webp';
import homeServiceRail from './art/home-onboarding/service-rail.webp';
import homeTopicPanel from './art/home-onboarding/topic-panel.webp';

export const art = {
  heroCity,
  scenes: {
    actionHarbor,
    cityWorld,
    contemplationGarden,
    councilChamber,
    grandLibrary,
    hypothesisHarbor,
    lighthouseWatchtower,
    memoryCemetery,
    residentialQuarter,
  },
  characters: {
    proposer: archiveKeeper,
    researcher: residentResearcher,
    skeptic: residentSkeptic,
    practitioner: residentPractitioner,
    executor: residentExecutor,
    inspector: cityInspector,
    archive: archiveKeeper,
    evidenceCartographer: residentEvidenceCartographer,
    boundarySkeptic: residentBoundarySkeptic,
    fieldEthnographer: residentFieldEthnographer,
    momentumExecutor: residentMomentumExecutor,
    systemsInspector,
    reportEditor,
  },
  buildings: [
    buildingTemple,
    buildingLibrary,
    buildingCouncil,
    buildingWorkshop,
    buildingBellTower,
    buildingHarborGate,
    buildingArch,
    buildingStele,
    buildingLectern,
    buildingCloisterGate,
    buildingObservatory,
    buildingBridgeShrine,
  ],
  textures: {
    bronze: textureBronze,
    map: textureMap,
    parchment: textureParchment,
    seal: textureSeal,
    stone: textureStone,
    vellum: textureVellum,
  },
  homeOnboarding: {
    arrowCouncil: homeArrowCouncil,
    buildingHalo: homeBuildingHalo,
    coachBubble: homeCoachBubble,
    coachCopy: homeCoachCopy,
    labelCurrentTopic: homeLabelCurrentTopic,
    labelGraveyard: homeLabelGraveyard,
    labelLibrary: homeLabelLibrary,
    labelLighthouse: homeLabelLighthouse,
    labelProgress: homeLabelProgress,
    labelRecommended: homeLabelRecommended,
    labelService: homeLabelService,
    markerCard: homeMarkerCard,
    markerCardPrimary: homeMarkerCardPrimary,
    markerLabels: {
      actionHarbor: homeMarkerLabelActionHarbor,
      contemplationGarden: homeMarkerLabelContemplationGarden,
      council: homeMarkerLabelCouncil,
      hypothesisHarbor: homeMarkerLabelHypothesisHarbor,
      library: homeMarkerLabelLibrary,
      lighthouse: homeMarkerLabelLighthouse,
      memoryCemetery: homeMarkerLabelMemoryCemetery,
      residential: homeMarkerLabelResidential,
    },
    primaryButton: homePrimaryButton,
    progressPanel: homeProgressPanel,
    secondaryButton: homeSecondaryButton,
    serviceRail: homeServiceRail,
    topicPanel: homeTopicPanel,
  },
};
