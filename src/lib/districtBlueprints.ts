export interface DistrictBlueprint {
  districtId: string;
  moduleName: string;
  purpose: string;
  secondaryPage: string;
  interaction: string;
  artDirection: string;
  assetIdeas: string[];
}

export const districtBlueprints: DistrictBlueprint[] = [
  {
    districtId: 'questions',
    moduleName: '立题与问题澄清',
    purpose: '把用户的一团困惑压成可进入议会讨论的议题，并保留原始语境。',
    secondaryPage: '议题设置内页：原始问题、核心问题、讨论目标、未澄清边界。',
    interaction: '用户编辑问题后，可选择探索、决策或行动模式；系统生成进入议会前的开题铭文。',
    artDirection: '开阔广场、讲坛、石碑、公告栏和围观居民，突出“问题被公开立案”。',
    assetIdeas: ['广场全景背景', '立题讲坛建筑', '问题石碑图标', '主持人半身像'],
  },
  {
    districtId: 'evidence',
    moduleName: '证据与来源管理',
    purpose: '承载研究者和证据制图师，用来存放案例、引用、指标和可验证观察。',
    secondaryPage: '证据档案内页：证据等级、来源、支持的判断、缺失证据清单。',
    interaction: '点击证据可看到它支持哪条观点；也可以请求研究者补一条更强证据。',
    artDirection: '卷柜、星盘、索引抽屉、发光地图线，强调可追溯和可复查。',
    assetIdeas: ['档案馆内景', '证据卷柜', '星盘书桌', '证据等级徽章'],
  },
  {
    districtId: 'hypothesis',
    moduleName: '假设生成与试炼',
    purpose: '承载假设研究者、现场实践者，把模糊直觉锻造成可验证判断。',
    secondaryPage: '假设工坊内页：假设列表、适用条件、待验证信号、相关场景。',
    interaction: '用户选择一条假设后，可让实践者拆出真实使用场景，或送入议会被反驳。',
    artDirection: '工坊、蓝图桌、齿轮、半成品模型，体现“判断还在打造中”。',
    assetIdeas: ['工坊内景', '蓝图桌', '假设模型小建筑', '验证火印'],
  },
  {
    districtId: 'action',
    moduleName: '行动实验与回流',
    purpose: '承载执行者，把讨论结果压成最小行动、完成条件和回看指标。',
    secondaryPage: '行动码头内页：下一步任务、责任人、截止时间、回流证据。',
    interaction: '从卷轴报告中生成行动契约；完成后把结果回流为新证据或反例。',
    artDirection: '码头、航线、货箱、返航灯塔，表达“把想法开出去再带证据回来”。',
    assetIdeas: ['码头内景', '航线地图', '任务货箱', '返航记录牌'],
  },
  {
    districtId: 'garden',
    moduleName: '反思与边界条件',
    purpose: '承载怀疑者和边界怀疑者，暂存反例、失败条件和慢想问题。',
    secondaryPage: '沉思庭院内页：反例池、边界条件、沉默相关方、待回应风险。',
    interaction: '用户可把某条判断送到庭院，请怀疑者指出最强反例或失败边界。',
    artDirection: '修道院庭院、回廊、阴影座椅、反证卷轴，氛围安静但带审议感。',
    assetIdeas: ['庭院内景', '反证卷轴架', '边界石门', '怀疑者席位'],
  },
  {
    districtId: 'archive',
    moduleName: '卷轴报告与历史城邦',
    purpose: '承载卷轴官，把议会碰撞沉淀成报告、行动计划和可回看的历史版本。',
    secondaryPage: '卷轴馆内页：本轮报告、圆桌记录、修缮记录、历史城邦列表。',
    interaction: '用户可复制 Markdown、下载报告，或把本轮封存成历史城邦快照。',
    artDirection: '高耸书库、卷轴墙、索引牌、蜡封台，强调可带走和可复盘。',
    assetIdeas: ['卷轴馆内景', '报告编辑台', '历史城邦档案墙', '蜡封下载按钮'],
  },
];

export function getDistrictBlueprint(districtId: string) {
  return districtBlueprints.find((item) => item.districtId === districtId) ?? null;
}
