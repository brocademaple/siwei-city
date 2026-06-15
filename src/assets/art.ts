import heroCity from './art/hero-city-panorama.png';
import councilChamber from './art/scenes/council-chamber-panorama.png';

import archiveKeeper from './art/characters/archive-keeper.png';
import cityInspector from './art/characters/city-inspector.png';
import residentExecutor from './art/characters/resident-executor.png';
import residentPractitioner from './art/characters/resident-practitioner.png';
import residentResearcher from './art/characters/resident-researcher.png';
import residentSkeptic from './art/characters/resident-skeptic.png';

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
    councilChamber,
  },
  characters: {
    proposer: archiveKeeper,
    researcher: residentResearcher,
    skeptic: residentSkeptic,
    practitioner: residentPractitioner,
    executor: residentExecutor,
    inspector: cityInspector,
    archive: archiveKeeper,
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
