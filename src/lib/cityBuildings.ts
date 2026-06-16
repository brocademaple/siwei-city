import type { BuildingSceneId, ResidentId } from '../types';

export interface CityBuilding {
  id: BuildingSceneId;
  name: string;
  shortName: string;
  sceneAssetKey:
    | 'actionHarbor'
    | 'councilChamber'
    | 'contemplationGarden'
    | 'grandLibrary'
    | 'hypothesisHarbor'
    | 'lighthouseWatchtower'
    | 'memoryCemetery'
    | 'residentialQuarter';
  mapX: number;
  mapY: number;
  markerTone: 'lapis' | 'bronze' | 'olive' | 'terracotta' | 'violet';
  tagline: string;
  mvpRole: string;
  entryCopy: string;
  primaryAction: string;
  emptyTitle: string;
  emptyBody: string;
  exampleItems: string[];
  linkedResidents?: ResidentId[];
}

export const cityBuildings: CityBuilding[] = [
  {
    id: 'council',
    name: '冲突议会',
    shortName: '议会',
    sceneAssetKey: 'councilChamber',
    mapX: 55,
    mapY: 58,
    markerTone: 'lapis',
    tagline: '开始一轮思维碰撞',
    mvpRole: '把一个议题交给不同居民发言、反驳、采纳，形成本轮核心判断。',
    entryCopy: '点这里进入核心体验：召开圆桌、读居民发言、采纳有用观点。',
    primaryAction: '进入议会大厅',
    emptyTitle: '议会桌正在等第一轮问题',
    emptyBody: '输入议题后，从这里召开第一轮圆桌。其他建筑的沉淀都从议会结果延伸出来。',
    exampleItems: ['召开第一轮圆桌', '采纳关键观点', '把结果送往图书馆、码头和巡城塔'],
    linkedResidents: ['evidenceCartographer', 'skeptic', 'practitioner', 'momentumExecutor'],
  },
  {
    id: 'library',
    name: '大图书馆',
    shortName: '图书馆',
    sceneAssetKey: 'grandLibrary',
    mapX: 37,
    mapY: 38,
    markerTone: 'bronze',
    tagline: '归档议会记录',
    mvpRole: '保存本轮讨论报告、行动契约、圆桌记录和历史版本。',
    entryCopy: '讨论完成后，到这里查看可以带走的报告和历史卷轴。',
    primaryAction: '查看本轮卷轴',
    emptyTitle: '还没有新的议会卷轴',
    emptyBody: '先从冲突议会跑完一轮，图书馆会归档本轮报告、行动计划和圆桌记录。',
    exampleItems: ['本轮讨论报告', '下一步行动计划', '居民圆桌记录'],
    linkedResidents: ['archive', 'reportEditor'],
  },
  {
    id: 'residential',
    name: '居民区',
    shortName: '居民区',
    sceneAssetKey: 'residentialQuarter',
    mapX: 67,
    mapY: 31,
    markerTone: 'olive',
    tagline: '查看居民人格与日常 talk',
    mvpRole: '展示居民角色、人设、prompt 和日常灵感，解释谁会在议会里怎样发言。',
    entryCopy: '想知道每位居民为什么这样说话，就先到居民区看他们的职责和提示词。',
    primaryAction: '浏览居民图鉴',
    emptyTitle: '居民正在街巷里交换碎片想法',
    emptyBody: '第一版先展示居民人设与 prompt。后续日常 talk 会从这里自然流出候选议题。',
    exampleItems: ['证据制图师：补证据地形', '边界怀疑者：测试失败边界', '推进执行官：拆最小行动'],
    linkedResidents: ['evidenceCartographer', 'boundarySkeptic', 'fieldEthnographer', 'momentumExecutor'],
  },
  {
    id: 'hypothesisHarbor',
    name: '假设码头',
    shortName: '假设码头',
    sceneAssetKey: 'hypothesisHarbor',
    mapX: 30,
    mapY: 72,
    markerTone: 'olive',
    tagline: '筛选可上会议题',
    mvpRole: '从居民日常交流中捞出值得进入议会的问题，并判断是否需要正式开题。',
    entryCopy: '这里处理还没上桌的候选问题：哪些值得被送进冲突议会？',
    primaryAction: '查看候选议题',
    emptyTitle: '码头还没有新的候选问题',
    emptyBody: '当前版本先展示筛选规则；居民区日常 talk 成熟后，会把高权重问题送到这里。',
    exampleItems: ['真实阻力足够具体', '有可反驳假设', '能导向一次行动或判断'],
    linkedResidents: ['fieldEthnographer', 'boundarySkeptic'],
  },
  {
    id: 'actionHarbor',
    name: '行动码头',
    shortName: '行动码头',
    sceneAssetKey: 'actionHarbor',
    mapX: 23,
    mapY: 84,
    markerTone: 'terracotta',
    tagline: '让命题远航',
    mvpRole: '承接议会中已完成的命题，把它们变成行动航线，并等待阶段性结果返航。',
    entryCopy: '当议会收束出最小行动后，它会从这里出海，带回新的证据。',
    primaryAction: '查看行动航线',
    emptyTitle: '还没有可以出航的行动',
    emptyBody: '采纳执行者的行动建议后，这里会显示行动契约、回看指标和返航结果。',
    exampleItems: ['24-72 小时小实验', '返航证据', '是否继续、转向或归档'],
    linkedResidents: ['executor', 'momentumExecutor'],
  },
  {
    id: 'contemplationGarden',
    name: '沉思庭院',
    shortName: '庭院',
    sceneAssetKey: 'contemplationGarden',
    mapX: 75,
    mapY: 55,
    markerTone: 'olive',
    tagline: '安放慢问题',
    mvpRole: '暂存想不清、未连接、需要慢慢发酵的问题，形成夜间札记。',
    entryCopy: '不适合立刻上议会的问题先放在这里，等待更多材料和偶然连接。',
    primaryAction: '查看夜间札记',
    emptyTitle: '庭院里还没有夜间札记',
    emptyBody: '当某个问题暂时无法闭环，但又不该丢掉，它会被放到这里慢慢发酵。',
    exampleItems: ['一时无法判断的矛盾', '缺上下文的直觉', '暂不适合行动的长期问题'],
    linkedResidents: ['skeptic', 'boundarySkeptic'],
  },
  {
    id: 'memoryCemetery',
    name: '记忆墓园 / 废案馆',
    shortName: '废案馆',
    sceneAssetKey: 'memoryCemetery',
    mapX: 86,
    mapY: 74,
    markerTone: 'violet',
    tagline: '安放失败与过期判断',
    mvpRole: '保存被放弃的假设、失败行动、过期判断，让错误也能成为城市记忆。',
    entryCopy: '当行动返航失败，或判断过期，它们会进入这里，不再挤占当前主线。',
    primaryAction: '查看废案记录',
    emptyTitle: '还没有被正式废弃的命题',
    emptyBody: '失败不是删除。后续每次远航归来，过期判断和失败行动会在这里留下墓志铭。',
    exampleItems: ['失败行动', '过期判断', '被反证击穿的假设'],
    linkedResidents: ['skeptic', 'systemsInspector'],
  },
  {
    id: 'lighthouse',
    name: '灯塔 / 巡城塔',
    shortName: '巡城塔',
    sceneAssetKey: 'lighthouseWatchtower',
    mapX: 14,
    mapY: 52,
    markerTone: 'lapis',
    tagline: '诊断未闭环结构',
    mvpRole: '检查长期未闭环议题、未回流行动和结构缺口，并给出修缮令。',
    entryCopy: '如果不知道下一步该修哪里，就到巡城塔看系统诊断。',
    primaryAction: '查看巡城诊断',
    emptyTitle: '巡城塔暂未发现严重断点',
    emptyBody: '跑完议会后，这里会把缺证据、未处理反驳、未回流行动列成修缮令。',
    exampleItems: ['哪条假设缺证据', '哪条行动未返航', '哪条反驳没有被回应'],
    linkedResidents: ['inspector', 'systemsInspector'],
  },
];

export function getCityBuilding(id: BuildingSceneId) {
  return cityBuildings.find((building) => building.id === id) ?? cityBuildings[0];
}
