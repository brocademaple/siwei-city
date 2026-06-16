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
};
