import type { ResidentId } from '../types';

export type TriageStatus = 'keep' | 'modify' | 'drop';

export interface SeatPersona {
  seatCode: string;
  seatTitle: string;
  schoolName: string;
  residentId: ResidentId;
  residentName: string;
  inquisitionRule: string;
  triageCriterion: string;
  districtCoords: { x: number; y: number };
}

export interface IdeaTokenTriage {
  id: string;
  code: string;
  title: string;
  originalProposal: string;
  status: TriageStatus;
  modifiedProposal?: string;
  dropReason?: string;
  keepAction?: string;
  evidenceIds: string[];
  memoryRefs: string[];
  seatClashes: {
    seatCode: string;
    seatTitle: string;
    verdict: '支撑' | '重铸' | '驳回';
    statement: string;
    citedEvidence: string[];
  }[];
}

export interface SynthesisScrollReport {
  scrollCode: string;
  consensusBase: string;
  claimStrength: '仅达「相关」（待验证卡 Q1 未回填基线）' | '已锁「因果」（实验组与基线齐备）';
  seatContributions: {
    seatTitle: string;
    coreContribution: string;
    tensionPoint: string;
    evidenceIds: string[];
  }[];
  branchPaths: {
    pathCode: 'PATH A' | 'PATH B';
    name: string;
    premise: string;
    opportunityCost: string;
    killSwitch: string;
    recommended: boolean;
  }[];
}

export interface RecallNodeItem {
  id: string;
  nodeType: 'NODE I · 开局按 Preset 自动召回' | 'NODE II · 对质卡壳时历史裁定召回';
  triggerCondition: string;
  cardKind: '已定前提' | '待验证坑点' | '历史裁定';
  title: string;
  summary: string;
  sourceRef: string;
  boundToTokenId?: string;
}

export interface DistilledPersonaSeal {
  id: string;
  sealCode: string;
  name: string;
  school: string;
  residentId: ResidentId;
  inquisitionPrompt: string;
  originRound: string;
  mountedInPresets: string[];
}

export interface DistilledSkillTablet {
  id: string;
  tabletCode: string;
  name: string;
  checkQuestions: string[];
  applicableScene: string;
  originEvidence: string;
  mountedInPresets: string[];
}

export interface HarnessPreset {
  id: string;
  code: string;
  name: string;
  shortName: string;
  badge: string;
  summary: string;
  globalRule: string;
  seats: [SeatPersona, SeatPersona, SeatPersona];
  tokens: IdeaTokenTriage[];
  synthesis: SynthesisScrollReport;
  recallNodes: RecallNodeItem[];
}

export const initialDistilledPersonas: DistilledPersonaSeal[] = [
  {
    id: 'persona-linfan-causality',
    sealCode: 'SEAL-01',
    name: '林凡式留存理由追问印',
    school: '实践巷 · 场景检验学派',
    residentId: 'practitioner',
    inquisitionPrompt:
      '先追问「用户愿意把组件长期留在手机桌面的真实社交理由」，禁止拿皮肤换新带来的短期点击率冒充长期留存因果。',
    originRound: '提炼自「试用期小组件安装率 +10%」E3 × E6 交锋',
    mountedInPresets: ['preset-retention-causal', 'preset-radical-razor'],
  },
  {
    id: 'persona-baseline-gatekeeper',
    sealCode: 'SEAL-02',
    name: '口径守门人 · 存量漏斗甄别印',
    school: '怀疑庭 · 反方质询学派',
    residentId: 'skeptic',
    inquisitionPrompt:
      '凡引述历史漏斗数据（如 8 月安装 5560 / 移除 3278），必须核查是否混入存量自然波动，基线未锁前一律将主张强度压回「相关」。',
    originRound: '提炼自「Desktop Friend 存量漏斗反例」E4 × E5 交锋',
    mountedInPresets: ['preset-retention-causal', 'preset-competitor-funnel'],
  },
  {
    id: 'persona-localization-skeptic',
    sealCode: 'SEAL-03',
    name: '跨文化语伴摩擦质询印',
    school: '考据院 · 田野民族志学派',
    residentId: 'fieldEthnographer',
    inquisitionPrompt:
      '追问熟人打卡机制搬到陌生跨国语伴场景时的时差断签焦虑与社交尴尬，拒绝照搬单机背单词连胜模型。',
    originRound: '提炼自「竞品连胜组件拆解」E1 × E2 交锋',
    mountedInPresets: ['preset-competitor-funnel'],
  },
];

export const initialDistilledSkills: DistilledSkillTablet[] = [
  {
    id: 'skill-pseudo-demand-razor',
    tabletCode: 'SKILL-01',
    name: '伪需求砍刀三问石刻简',
    checkQuestions: [
      '1. 拿掉视觉换皮后，用户在第 7 天打开它的触发事件是否存在？',
      '2. 该方案在 Codex 历史纪要中有无真实认领记录（排查幽灵方案 E2）？',
      '3. 验证该点子是否需要新建双端重型状态同步？能否在 72 小时内用单向轻触达验真？',
    ],
    applicableScene: '适用于新功能立项、桌面小组件选型与增长实验排期过筛',
    originEvidence: 'E2 · E3 · E6',
    mountedInPresets: ['preset-retention-causal', 'preset-radical-razor'],
  },
  {
    id: 'skill-correlation-vs-causality',
    tabletCode: 'SKILL-02',
    name: '相关与因果切分石刻简',
    checkQuestions: [
      '1. 指标分子与分母是否混淆了「组件点击打开率」与「桌面添加安装率」（E3）？',
      '2. 现有数据来自受控 A/B 实验，还是无对照组的存量自然漏斗（E4）？',
      '3. 大图书馆中关联的待验证卡（Q1）是否已回填真实基线（E5）？',
    ],
    applicableScene: '适用于周会数据复盘、实验归因答辩与高管评审预演',
    originEvidence: 'E3 · E4 · E5 · Q1',
    mountedInPresets: ['preset-retention-causal', 'preset-competitor-funnel'],
  },
  {
    id: 'skill-mvp-single-bet',
    tabletCode: 'SKILL-03',
    name: '试用期单点押注止损简',
    checkQuestions: [
      '1. 如果两周内只许上线 1 个小组件，保留哪个能同时测出安装动机与固定语伴召回？',
      '2. 被砍掉的次优方案在什么数据阈值下才重新启封？',
    ],
    applicableScene: '适用于研发排期受限时的多方案二选一拍板',
    originEvidence: 'E1 · E4 · E6',
    mountedInPresets: ['preset-radical-razor'],
  },
];

export const defaultHarnessPresets: HarnessPreset[] = [
  {
    id: 'preset-retention-causal',
    code: 'PRESET I',
    name: '产品立项与留存因果 Preset',
    shortName: '立项与留存因果',
    badge: '默认主推 · 严控因果口径',
    summary: '召集「真实动机席 × 最小验证成本席 × 留存因果席」，专治把换皮打开率当安装率、把存量漏斗当实验因果。',
    globalRule: '待验证卡【Q1】未回填安装率基线前，全席主张强度最高只许定为「相关」，严禁断言「已锁定 +10% 因果」。',
    seats: [
      {
        seatCode: 'SEAT I',
        seatTitle: '真实动机席 · 林凡派',
        schoolName: '实践巷 · 场景检验学派',
        residentId: 'practitioner',
        residentName: '林凡 · 场景检验员',
        inquisitionRule: '追问用户把组件长期留在桌面的真实关系理由（E6），剔除靠新鲜感换皮的伪留存（E3）。',
        triageCriterion: '无固定语伴互动锚点的点子一律降级或淘汰。',
        districtCoords: { x: 66, y: 31 },
      },
      {
        seatCode: 'SEAT II',
        seatTitle: '留存因果席 · 口径守门人',
        schoolName: '怀疑庭 · 反方质询学派',
        residentId: 'skeptic',
        residentName: '赫拉克 · 反方质询者',
        inquisitionRule: '严格切分「打开率 +1.4pp（E3）」与「安装率 +10%」，揭穿存量漏斗（E4）充当实验证据的漏洞。',
        triageCriterion: '基线未锁（E5）或口径混淆的方案必须推入重铸槽补齐实验设计。',
        districtCoords: { x: 42, y: 69 },
      },
      {
        seatCode: 'SEAT III',
        seatTitle: '最小验证成本席 · 航线官',
        schoolName: '执行港 · 行动推进学派',
        residentId: 'executor',
        residentName: '墨卡托 · 行动执行者',
        inquisitionRule: '核算试用期单点押注的排期与卸载折损（E4 移除 3278），只放行 2 周内可闭环验真的单组件。',
        triageCriterion: '跨端改动过重或缺乏已认领文档依据（E2）的直接推入碎石弃槽。',
        districtCoords: { x: 25, y: 76 },
      },
    ],
    tokens: [
      {
        id: 'token-01',
        code: 'IDEA-01',
        title: '关系好友 2.0（绑定单个固定语伴桌面贴纸）',
        originalProposal: '一期直接做固定语伴双人桌面组件，展示对方最近一条纠错/语音状态，点击直达会话。',
        status: 'keep',
        keepAction: '锁死「仅对近 7 天互发 ≥3 条消息的固定语伴」弹出桌面安装引导，对比对照组 14 天净留存安装率（回应 Q1）。',
        evidenceIds: ['E1', 'E6'],
        memoryRefs: ['Q1', 'R1'],
        seatClashes: [
          {
            seatCode: 'SEAT I',
            seatTitle: '真实动机席',
            verdict: '支撑',
            statement: '契合 E1 留存倾向指定固定语伴，且正面回答 E6「愿意长期留在桌面的理由」——用户看重的是具体的人。',
            citedEvidence: ['E1', 'E6'],
          },
          {
            seatCode: 'SEAT II',
            seatTitle: '留存因果席',
            verdict: '支撑',
            statement: '受【Q1】与 E5 约束，当前只主张「固定语伴触达与安装留存相关」，待锁死基线后可做 cleanest 归因。',
            citedEvidence: ['E1', 'E5'],
          },
          {
            seatCode: 'SEAT III',
            seatTitle: '最小验证成本席',
            verdict: '支撑',
            statement: '复用一期已收敛的关系好友 2.0 协议（E1），无需全量改造动态流，两周内可上线单点 A/B 实验。',
            citedEvidence: ['E1'],
          },
        ],
      },
      {
        id: 'token-02',
        code: 'IDEA-02',
        title: 'Desktop Friend 1.0 泛好友桌面轮播（直接扩量）',
        originalProposal: '直接把现有 Desktop Friend 1.0 入口铺开，靠随机展示好友在线状态拉升 +10% 安装率。',
        status: 'modify',
        modifiedProposal: '停止泛好友盲推，重铸为「高移除率止损对照组」：先在 E4（安装 5560 / 移除 3278）人群中排查 59% 移除原因，并收窄为关系好友 2.0 的对比基线。',
        evidenceIds: ['E4', 'E5', 'E6'],
        memoryRefs: ['Q1'],
        seatClashes: [
          {
            seatCode: 'SEAT II',
            seatTitle: '留存因果席',
            verdict: '重铸',
            statement: 'E4 的「安装 5560 / 打开 3464 / 移除 3278」属于 8 月存量自然漏斗，绝非受控实验，且移除率高达 59%，盲目扩量只会放大卸载。',
            citedEvidence: ['E4', 'E5'],
          },
          {
            seatCode: 'SEAT I',
            seatTitle: '真实动机席',
            verdict: '重铸',
            statement: '泛好友轮播缺乏强关系牵引，印证 E6「缺留在桌面的理由」，必须收窄到亲密语伴并作为基线对照。',
            citedEvidence: ['E4', 'E6'],
          },
        ],
      },
      {
        id: 'token-03',
        code: 'IDEA-03',
        title: '关注动态收窄版（仅推送互关语伴的高优贴文）',
        originalProposal: '在桌面组件展示关注流动态，拉动用户从桌面高频点进信息流。',
        status: 'modify',
        modifiedProposal: '砍掉泛关注流展示，合并进「关系好友 2.0」作为无未读消息时的静默兜底卡（仅当固定语伴发帖时轻闪提示）。',
        evidenceIds: ['E1', 'E3'],
        memoryRefs: ['R1'],
        seatClashes: [
          {
            seatCode: 'SEAT III',
            seatTitle: '最小验证成本席',
            verdict: '重铸',
            statement: '试用期同时独立做「关系好友 2.0」与「关注动态」会稀释流量并拉长排期，合并为兜底状态最省工时。',
            citedEvidence: ['E1'],
          },
          {
            seatCode: 'SEAT II',
            seatTitle: '留存因果席',
            verdict: '重铸',
            statement: 'E3 证明单纯刺激点击（打开率 +1.4pp）对次留无贡献，独立做动态组件无法讲清安装率 +10% 的因果。',
            citedEvidence: ['E3'],
          },
        ],
      },
      {
        id: 'token-04',
        code: 'IDEA-04',
        title: '连胜打卡换皮 & 「轮到你了」回合催促组件',
        originalProposal: '上线多套节日皮肤的连胜打卡组件，并加入「轮到你了」回合倒计时催促语伴回复。',
        status: 'drop',
        dropReason: 'E3 已证换皮仅提升打开率 +1.4pp 且次留为 0（混淆打开率与安装率）；E2 查明「轮到你了」在 Codex 纪要中无认领记录，属幽灵方案，立即砍除。',
        evidenceIds: ['E2', 'E3', 'E6'],
        memoryRefs: ['R1'],
        seatClashes: [
          {
            seatCode: 'SEAT II',
            seatTitle: '留存因果席',
            verdict: '驳回',
            statement: 'E3 铁证：换皮后打开率 +1.4pp、次留无变化，且打开率绝不等于安装率；E2 明确「轮到你了」无据可查。',
            citedEvidence: ['E2', 'E3'],
          },
          {
            seatCode: 'SEAT III',
            seatTitle: '最小验证成本席',
            verdict: '驳回',
            statement: '在试用期排期极紧的情况下投入皮肤美术与无出处功能，机会成本极高，全票推入碎石弃槽。',
            citedEvidence: ['E2', 'E3', 'E6'],
          },
        ],
      },
    ],
    synthesis: {
      scrollCode: 'SCROLL · PRESET-I · 2026-10-25',
      consensusBase:
        '三席一致裁定：在安装率基线与统计口径未锁死（E5、【Q1】）之前，任何组件都只能主张「与安装率留存相关」。试用期唯一保留主干为「关系好友 2.0（绑定固定语伴）」（E1、E6），将 Desktop Friend 1.0 存量漏斗（E4）转为止损对照，将关注动态收窄为静默兜底，彻底砍掉连胜换皮（E3）与无出处的「轮到你了」（E2）。',
      claimStrength: '仅达「相关」（待验证卡 Q1 未回填基线）',
      seatContributions: [
        {
          seatTitle: '真实动机席（林凡派）',
          coreContribution: '锚定 E6「留在桌面的真实理由是具体的人」，锁定固定语伴双人贴纸为主干。',
          tensionPoint: '曾担心单固定语伴覆盖面窄，后接受用「关注动态静默兜底」填补空窗。',
          evidenceIds: ['E1', 'E6'],
        },
        {
          seatTitle: '留存因果席（口径守门人）',
          coreContribution: '拦截 E3 换皮打开率伪证与 E4 存量自然漏斗，强制全报告把主张强度锁在「相关」。',
          tensionPoint: '拒绝在 E5 基线缺失时签署任何「+10% 必达」军令状，要求先跑 72 小时分母校准。',
          evidenceIds: ['E3', 'E4', 'E5'],
        },
        {
          seatTitle: '最小验证成本席（航线官）',
          coreContribution: '砍掉无文档认领的「轮到你了」（E2）与独立动态组件，收束为单组件 A/B 实验。',
          tensionPoint: '坚持两周试用期内只发一艘船，把 59% 移除率（3278/5560）设为红线止损指标。',
          evidenceIds: ['E1', 'E2', 'E4'],
        },
      ],
      branchPaths: [
        {
          pathCode: 'PATH A',
          name: '路径 A（主推）：单押「关系好友 2.0」+ 先锁安装率分母基线',
          premise: '数据侧在 48 小时内回填【Q1】安装率基线（分子=桌面净存留组件数，分母=满足固定语伴条件日活）。',
          opportunityCost: '放弃泛人群浅层曝光，首周绝对安装量增速温和，但能拿到干净的净留存因果。',
          killSwitch: '若 7 天移除率仍高于 35%（对比 E4 的 59%），立即回退并检查语伴跨时区静默时长。',
          recommended: true,
        },
        {
          pathCode: 'PATH B',
          name: '路径 B（备选）：Desktop Friend 1.0 存量挽留补丁 + 关注动态双发',
          premise: '当且仅当客户端无法在新包体内按时交付关系好友 2.0 双向绑定接口时启用。',
          opportunityCost: '双组件并行导致实验组流量对半切碎，无法向管理层单独证明任一组件对 +10% 的独立贡献。',
          killSwitch: '一旦次留变化低于 +0.5pp（复现 E3 换皮陷阱），立即冻结泛推入口。',
          recommended: false,
        },
      ],
    },
    recallNodes: [
      {
        id: 'recall-node-1',
        nodeType: 'NODE I · 开局按 Preset 自动召回',
        triggerCondition: '当激活「产品立项与留存因果 Preset」且议题命中 [小组件, 安装率, 因果] 时自动挂载',
        cardKind: '待验证坑点',
        title: '【Q1】当前小组件安装率基线未出、统计口径未锁死',
        summary: '开局硬约束：在数据侧回填 E5 基线前，主张席与综合报告只许定性为「相关」，严禁输出「已证明 +10% 因果」。',
        sourceRef: '大图书馆 · 待验证抽屉 Q1（关联 E5）',
        boundToTokenId: 'token-01',
      },
      {
        id: 'recall-node-2',
        nodeType: 'NODE I · 开局按 Preset 自动召回',
        triggerCondition: '当激活「产品立项与留存因果 Preset」时调出同类增长实验避坑前提',
        cardKind: '已定前提',
        title: '【R0】指标切分铁律：组件打开率 ≠ 桌面安装率，存量漏斗 ≠ A/B 实验',
        summary: '9/8 换皮实验仅带来打开率 +1.4pp 且次留无变化（E3）；8 月 Desktop Friend 5560 安装属存量漏斗（E4）。',
        sourceRef: '大图书馆 · 已定抽屉 R0（关联 E3/E4）',
        boundToTokenId: 'token-02',
      },
      {
        id: 'recall-node-3',
        nodeType: 'NODE II · 对质卡壳时历史裁定召回',
        triggerCondition: '当「关注动态」与「关系好友 2.0」争抢一期唯一研发槽位卡壳时触发',
        cardKind: '历史裁定',
        title: '【R1】一期组件收敛历史裁定：主干归关系好友 2.0，关注动态降为轻状态',
        summary: '调出飞书 wiki 历史收敛决议（E1）：留存倾向明确指定固定语伴，将关注动态折中降级为语伴静默时的兜底行。',
        sourceRef: '大图书馆 · 历史议事卷宗 E1 / R1',
        boundToTokenId: 'token-03',
      },
    ],
  },
  {
    id: 'preset-competitor-funnel',
    code: 'PRESET II',
    name: '竞品与商业化拆解 Preset',
    shortName: '竞品与漏斗拆解',
    badge: '转化漏斗 × 水土不服质询',
    summary: '召集「底层逻辑席 × 漏斗转化席 × 本土化反例席」，审视多邻国式连胜/桌面贴纸搬到跨国语伴社交时的漏斗损耗与水土不服。',
    globalRule: '凡借用外部竞品机制（连胜/贴纸），必须拆出「安装→首日打开→7日留桌→卸载移除」四阶漏斗，并指出跨时区语伴失联时的断签反例。',
    seats: [
      {
        seatCode: 'SEAT I',
        seatTitle: '底层逻辑席 · 证据制图师',
        schoolName: '考据院 · 证据地形学派',
        residentId: 'evidenceCartographer',
        residentName: '克莉奥 · 证据制图师',
        inquisitionRule: '拆解竞品桌面组件的核心驱动力：单机课程打卡靠惩罚焦虑，语伴社交靠真人回应期待（E1、E6）。',
        triageCriterion: '底层激励与双人互惠背离的方案一律重铸或剔除。',
        districtCoords: { x: 35, y: 40 },
      },
      {
        seatCode: 'SEAT II',
        seatTitle: '漏斗转化席 · 系统巡城官',
        schoolName: '冲突庭 · 结构监察学派',
        residentId: 'systemsInspector',
        residentName: '阿基米德 · 系统监察官',
        inquisitionRule: '紧盯 E4 漏斗断层（安装 5560 → 打开 3464 → 移除 3278），计算每增加一步授权或空白等待造成的卸载流失。',
        triageCriterion: '无法压降 59% 移除率的方案禁止进入保留槽。',
        districtCoords: { x: 52, y: 28 },
      },
      {
        seatCode: 'SEAT III',
        seatTitle: '本土化反例席 · 田野学者',
        schoolName: '考据院 · 田野民族志学派',
        residentId: 'fieldEthnographer',
        residentName: '希罗多德 · 田野观察员',
        inquisitionRule: '专挑跨国语伴 6–12 小时时差导致的「桌面组件长期空白/死寂」反例，戳破照搬熟人 IM 贴纸的幻想。',
        triageCriterion: '缺乏异步时差缓冲设计的方案必须推入重铸修正槽。',
        districtCoords: { x: 74, y: 55 },
      },
    ],
    tokens: [
      {
        id: 'token-01',
        code: 'IDEA-01',
        title: '关系好友 2.0（加入跨时区异步胶囊的关系组件）',
        originalProposal: '一期做固定语伴双人桌面组件，实时同步对方在线状态。',
        status: 'keep',
        keepAction: '保留固定语伴核心（E1、E6），并针对跨国时差加上「对方当地时间 + 昨日留声胶囊」，解决时差空窗导致的卸载（E4）。',
        evidenceIds: ['E1', 'E4', 'E6'],
        memoryRefs: ['Q1'],
        seatClashes: [
          {
            seatCode: 'SEAT I',
            seatTitle: '底层逻辑席',
            verdict: '支撑',
            statement: '语伴产品的北极星是真人连接（E1、E6），关系好友 2.0 抓住了竞品单机打卡无法复制的双人社交资产。',
            citedEvidence: ['E1', 'E6'],
          },
          {
            seatCode: 'SEAT III',
            seatTitle: '本土化反例席',
            verdict: '支撑',
            statement: '补入「对方时区与异步语音贴纸」后，成功化解欧美与东亚语伴昼夜颠倒造成的桌面死寂反例。',
            citedEvidence: ['E1', 'E4'],
          },
        ],
      },
      {
        id: 'token-02',
        code: 'IDEA-02',
        title: '关注动态收窄版（改造为漏斗中段「未绑定语伴」孵化器）',
        originalProposal: '在桌面展示泛关注流动态。',
        status: 'modify',
        modifiedProposal: '重铸为「漏斗前置孵化卡」：仅对尚未结成固定语伴的新试用期用户展示同语种高回复率语伴动态，一旦互关聊天即无缝升级为关系好友 2.0。',
        evidenceIds: ['E1', 'E4', 'E5'],
        memoryRefs: ['Q1'],
        seatClashes: [
          {
            seatCode: 'SEAT II',
            seatTitle: '漏斗转化席',
            verdict: '重铸',
            statement: 'E4 中 3278 人移除组件的头号原因是「还没交到固定好友，组件一片空白」，用收窄动态做前置孵化能堵住漏斗最大缺口。',
            citedEvidence: ['E1', 'E4'],
          },
        ],
      },
      {
        id: 'token-03',
        code: 'IDEA-03',
        title: '多邻国式单机连胜打卡组件（换皮复刻）',
        originalProposal: '照搬多邻国桌面火焰连胜组件，换上多套节日插画皮肤刺激日活。',
        status: 'drop',
        dropReason: '底层逻辑错位：用户来此是为了跨国真人交流而非单机刷题；E3 已证实换皮仅涨 +1.4pp 打开率且次留为 0，水土不服直接淘汰。',
        evidenceIds: ['E1', 'E3', 'E6'],
        memoryRefs: ['R0'],
        seatClashes: [
          {
            seatCode: 'SEAT I',
            seatTitle: '底层逻辑席',
            verdict: '驳回',
            statement: '单机连胜忽视了双人互动本质（E6），且 E3 证明皮肤刺激无法转化为留存或安装率。',
            citedEvidence: ['E3', 'E6'],
          },
        ],
      },
      {
        id: 'token-04',
        code: 'IDEA-04',
        title: 'Desktop Friend 1.0 原样全量强推 + 「轮到你了」弹窗',
        originalProposal: '对全体用户强弹 Desktop Friend 1.0 安装框，并加「轮到你了」红点催促。',
        status: 'drop',
        dropReason: 'E4 显示存量移除比高达 59%（3278/5560），未修复空窗期前强推等于制造负向口碑；且 E2 查无「轮到你了」方案依据。',
        evidenceIds: ['E2', 'E4', 'E5'],
        memoryRefs: ['Q1'],
        seatClashes: [
          {
            seatCode: 'SEAT II',
            seatTitle: '漏斗转化席',
            verdict: '驳回',
            statement: '在 59% 移除率（E4）和基线缺失（E5）状态下买量式强推，漏斗末端净留存几乎为零。',
            citedEvidence: ['E2', 'E4', 'E5'],
          },
        ],
      },
    ],
    synthesis: {
      scrollCode: 'SCROLL · PRESET-II · 2026-10-25',
      consensusBase:
        '从竞品机制与转化漏斗视角审视，单机连胜换皮（E3）在语伴社交场景严重水土不服；Desktop Friend 1.0 的高移除率（E4：3278/5560）暴露了「无固定语伴或跨时区失联时桌面空置」的漏斗断层。本 Preset 裁定：保留「带异步时区胶囊的关系好友 2.0」为主干，将「关注动态收窄版」重铸为未结对用户的漏斗前置孵化器。',
      claimStrength: '仅达「相关」（待验证卡 Q1 未回填基线）',
      seatContributions: [
        {
          seatTitle: '底层逻辑席（证据制图师）',
          coreContribution: '切分「单机打卡惩罚焦虑」与「双人语伴回应期待」，凭 E3 与 E6 彻底否决多邻国式换皮打卡。',
          tensionPoint: '要求所有保留方案必须能解释「第 14 天不卸载的社交资产沉淀」。',
          evidenceIds: ['E1', 'E3', 'E6'],
        },
        {
          seatTitle: '漏斗转化席（系统巡城官）',
          coreContribution: '拆解 E4 存量漏斗（5560 安装 → 3278 移除），定位「桌面空窗期」是头号流失黑洞。',
          tensionPoint: '主张把关注动态收窄版改造为「未结对用户」的过渡态，防止新客装完即拆。',
          evidenceIds: ['E4', 'E5'],
        },
        {
          seatTitle: '本土化反例席（田野学者）',
          coreContribution: '提出跨国语伴 6–12 小时时差反例，为关系好友 2.0 补上「当地时间 + 异步留声胶囊」规格。',
          tensionPoint: '坚决反对任何制造跨时区催促焦虑的红点机制（含无出处的 E2）。',
          evidenceIds: ['E1', 'E2'],
        },
      ],
      branchPaths: [
        {
          pathCode: 'PATH A',
          name: '路径 A（主推）：关系好友 2.0（异步时区版）+ 漏斗分层准入',
          premise: '按用户是否拥有活跃语伴分流：有固定语伴推关系好友 2.0，无固定语伴暂不强弹安装框（先在端内撮合）。',
          opportunityCost: '首周弹窗曝光基数缩减约 40%，但能把组件移除率从 59%（E4）压降至 25% 以内。',
          killSwitch: '若异步留声胶囊点击率低于 8%，退回极简最近一条消息展示。',
          recommended: true,
        },
        {
          pathCode: 'PATH B',
          name: '路径 B（备选）：未结对用户先推「关注动态收窄孵化卡」，结对后热切换',
          premise: '客户端支持同一个桌面 Widget 容器从「同语种高优动态」无缝热更新为「双人固定语伴」。',
          opportunityCost: '需额外开发 Widget 状态机热切换逻辑，增加约 4 人日客户端工时。',
          killSwitch: '若未结对用户从桌面动态转化出首次私聊的比例低于 3%，砍掉前置孵化态。',
          recommended: false,
        },
      ],
    },
    recallNodes: [
      {
        id: 'recall-node-201',
        nodeType: 'NODE I · 开局按 Preset 自动召回',
        triggerCondition: '当激活「竞品与商业化拆解 Preset」时自动调出漏斗口径与换皮实验卡片',
        cardKind: '已定前提',
        title: '【R0】换皮实验复盘：视觉换新只拉动短期点击（+1.4pp），不改变次日留存（E3）',
        summary: '反驳「靠多邻国式节日皮肤拉升安装率」的直接证据，避免重蹈 9/8 视觉换皮覆辙。',
        sourceRef: '大图书馆 · 已定抽屉 R0（9/8 召回实验飞书）',
        boundToTokenId: 'token-03',
      },
      {
        id: 'recall-node-202',
        nodeType: 'NODE II · 对质卡壳时历史裁定召回',
        triggerCondition: '当「漏斗转化席」质询 Desktop Friend 1.0 为何移除率高达 59%（3278/5560）时触发',
        cardKind: '待验证坑点',
        title: '【Q1】Desktop Friend 存量卸载归因与安装率基线待锁死（E4/E5）',
        summary: '提醒席位：5560/3464/3278 是 8 月存量自然漏斗，必须先补齐卸载分群（有无固定语伴）与安装率分母基线。',
        sourceRef: '大图书馆 · 待验证抽屉 Q1（8/31 DA 报告）',
        boundToTokenId: 'token-02',
      },
    ],
  },
  {
    id: 'preset-radical-razor',
    code: 'PRESET III',
    name: '方案发散与极简砍刀 Preset',
    shortName: '发散与极简砍刀',
    badge: '激进破局 × 砍除 75% 枝节',
    summary: '召集「激进破局席 × 跨界借用席 × 极简砍刀席」，先把桌面交互推到极致，再用奥卡姆剃刀砍掉一切非核心功能，只留 1 枚筹码过关。',
    globalRule: '极简铁律：保留槽（Keep）最多只准放行 1 枚筹码，且客户端新增接口不得超过 1 个；其余筹码非改即砍。',
    seats: [
      {
        seatCode: 'SEAT I',
        seatTitle: '激进破局席 · 边界质询者',
        schoolName: '怀疑庭 · 边界压力学派',
        residentId: 'boundarySkeptic',
        residentName: '第欧根尼 · 边界质询者',
        inquisitionRule: '推翻「把 App 页面缩成小卡片」的平庸思路，追问：如果桌面只允许显示 1 个字或 1 张语伴原声波纹，会是什么？（E6）',
        triageCriterion: '凡像是把端内列表硬塞进桌面的方案一律驳回。',
        districtCoords: { x: 46, y: 63 },
      },
      {
        seatCode: 'SEAT II',
        seatTitle: '跨界借用席 · 考据学者',
        schoolName: '考据院 · 跨界博物学派',
        residentId: 'researcher',
        residentName: '亚里士 · 证据研究者',
        inquisitionRule: '借用对讲机/传呼机「单键直通唯一挚友」的器物直觉，结合 E1 固定语伴倾向，剥离复杂信息流。',
        triageCriterion: '交互层级超过 1 次点击的方案必须重铸简化。',
        districtCoords: { x: 38, y: 36 },
      },
      {
        seatCode: 'SEAT III',
        seatTitle: '极简砍刀席 · 动量执行官',
        schoolName: '执行港 · 极简剃刀学派',
        residentId: 'momentumExecutor',
        residentName: '奥卡姆 · 动量执行官',
        inquisitionRule: '手持 E2（无依据方案）、E3（换皮无效）、E5（基线未锁）三把砍刀，凡增加研发排期却无因果增量的分支当场斩断。',
        triageCriterion: '保留槽严控只留 1 项，砍掉 75% 枝节以换取 72 小时极速上线验证。',
        districtCoords: { x: 22, y: 79 },
      },
    ],
    tokens: [
      {
        id: 'token-01',
        code: 'IDEA-01',
        title: '关系好友 2.0 · 极简「单一固定语伴传呼贴」',
        originalProposal: '一期做固定语伴双人桌面组件，包含头像、在线状态、签名、最近动态与快捷回复。',
        status: 'keep',
        keepAction: '砍剩「唯一固定语伴头像 + 最新 1 条未读语音/纠错字条」，点击直接进该语伴对话页；72 小时内上线测净安装留存（回应 E1、E6、Q1）。',
        evidenceIds: ['E1', 'E5', 'E6'],
        memoryRefs: ['Q1', 'R1'],
        seatClashes: [
          {
            seatCode: 'SEAT II',
            seatTitle: '跨界借用席',
            verdict: '支撑',
            statement: '浓缩为「单键传呼唯一语伴」，把 E6「留在桌面的理由」落到极致器物直觉上。',
            citedEvidence: ['E1', 'E6'],
          },
          {
            seatCode: 'SEAT III',
            seatTitle: '极简砍刀席',
            verdict: '支撑',
            statement: '砍去多余资料字段后，仅复用现有会话最后一条消息缓存，零新增后端表，符合 72 小时极简验证铁律。',
            citedEvidence: ['E1', 'E5'],
          },
        ],
      },
      {
        id: 'token-02',
        code: 'IDEA-02',
        title: '安装率基线与移除埋点探针（从 Desktop Friend 1.0 剥离）',
        originalProposal: '继续维护并迭代 Desktop Friend 1.0 泛好友组件。',
        status: 'modify',
        modifiedProposal: '冻结 Desktop Friend 1.0 一切 UI 改动，仅保留并加固其「安装 / 打开 / 移除（E4）」埋点探针，专门用于 48 小时内锁死 E5 安装率基线。',
        evidenceIds: ['E4', 'E5'],
        memoryRefs: ['Q1'],
        seatClashes: [
          {
            seatCode: 'SEAT III',
            seatTitle: '极简砍刀席',
            verdict: '重铸',
            statement: '旧组件 UI 不再投一分钟工时，但借它的存量漏斗（E4）快速把【Q1】缺失的基线口径锁死。',
            citedEvidence: ['E4', 'E5'],
          },
        ],
      },
      {
        id: 'token-03',
        code: 'IDEA-03',
        title: '关注动态桌面组件（含收窄版）',
        originalProposal: '在桌面提供关注流动态浏览或兜底卡片。',
        status: 'drop',
        dropReason: '极简砍刀裁定：把信息流搬上桌面属于把 App 列表硬塞进小框，既分散「固定语伴」单一变量归因，又增加双数据源维护成本，一期整根砍掉。',
        evidenceIds: ['E1', 'E3', 'E6'],
        memoryRefs: ['R1'],
        seatClashes: [
          {
            seatCode: 'SEAT I',
            seatTitle: '激进破局席',
            verdict: '驳回',
            statement: '用户不会在 2×2 桌面小格子里刷动态流，留着它只会稀释关系好友 2.0 的纯净度（E6）。',
            citedEvidence: ['E1', 'E6'],
          },
          {
            seatCode: 'SEAT III',
            seatTitle: '极简砍刀席',
            verdict: '驳回',
            statement: '为保证单一自变量实验干净度，连兜底态也一并砍除，未绑定固定语伴前不诱导安装。',
            citedEvidence: ['E1', 'E3'],
          },
        ],
      },
      {
        id: 'token-04',
        code: 'IDEA-04',
        title: '连胜打卡换皮 & 「轮到你了」催促组件',
        originalProposal: '做多套视觉皮肤连胜组件与「轮到你了」互动组件。',
        status: 'drop',
        dropReason: 'E2 查无出处 + E3 证明换皮对次留零作用，属典型功能膨胀噪音，首刀斩除。',
        evidenceIds: ['E2', 'E3'],
        memoryRefs: ['R0'],
        seatClashes: [
          {
            seatCode: 'SEAT III',
            seatTitle: '极简砍刀席',
            verdict: '驳回',
            statement: '无据可查的幽灵方案（E2）与已证伪的视觉换皮（E3），零秒淘汰。',
            citedEvidence: ['E2', 'E3'],
          },
        ],
      },
    ],
    synthesis: {
      scrollCode: 'SCROLL · PRESET-III · 2026-10-25',
      consensusBase:
        '极简砍刀 Preset 实行最严苛的「单筹码过关制」：砍掉连胜打卡换皮（E3）、砍掉无出处的「轮到你了」（E2）、连同关注动态组件也一并砍除，拒绝在 2×2 桌面格子里塞信息流。全局唯一保留「极简单一固定语伴传呼贴（关系好友 2.0 极简版）」（E1、E6），并将旧版 Desktop Friend 1.0 冻结为纯粹的基线埋点探针（E4、E5）。',
      claimStrength: '仅达「相关」（待验证卡 Q1 未回填基线）',
      seatContributions: [
        {
          seatTitle: '激进破局席（边界质询者）',
          coreContribution: '否决一切「把端内信息流缩进桌面」的妥协方案，要求桌面只呈现最不可替代的真人语伴触点（E6）。',
          tensionPoint: '成功说服全席连「关注动态兜底态」也一并砍掉，确保实验自变量绝对纯粹。',
          evidenceIds: ['E1', 'E6'],
        },
        {
          seatTitle: '跨界借用席（考据学者）',
          coreContribution: '引入「单键传呼唯一挚友」器物原型，把关系好友 2.0 瘦身为「1 个头像 + 1 条最新语音/纠错字条」。',
          tensionPoint: '要求端内选定固定语伴与添加桌面组件合成一步完成。',
          evidenceIds: ['E1'],
        },
        {
          seatTitle: '极简砍刀席（动量执行官）',
          coreContribution: '砍除 75% 候选枝节（E2、E3、动态流），将旧版 E4 漏斗冻结为纯基线探针，把排期压缩至 72 小时。',
          tensionPoint: '坚持「未锁死 E5 基线前不扩量、不加第 2 个字段」。',
          evidenceIds: ['E2', 'E3', 'E4', 'E5'],
        },
      ],
      branchPaths: [
        {
          pathCode: 'PATH A',
          name: '路径 A（主推）：72 小时极速上线「单一语伴传呼贴」+ 零新接口',
          premise: '直接读取本地最后一条固定语伴消息缓存渲染 Widget，同时用旧版探针在 48 小时内锁死【Q1】基线。',
          opportunityCost: '舍弃无固定语伴人群的桌面占位，换取最干净的单一变量因果检验与最低研发投入。',
          killSwitch: '上线 72 小时后若固定语伴人群净安装留存未优于旧版存量基线（E4）+8pp，立即复盘消息摘要吸引力。',
          recommended: true,
        },
        {
          pathCode: 'PATH B',
          name: '路径 B（备选）：先只发「基线探针包」锁死 E5，下周再发关系好友 2.0',
          premise: '若数据侧要求必须先有 7 天完整无干扰的 E5 分母基线才允许开启新实验时采用。',
          opportunityCost: '推迟一周拿到关系好友 2.0 实测数据，但实验统计学效力最高。',
          killSwitch: '基线采集满 5 天即刻切入关系好友 2.0 灰度。',
          recommended: false,
        },
      ],
    },
    recallNodes: [
      {
        id: 'recall-node-301',
        nodeType: 'NODE I · 开局按 Preset 自动召回',
        triggerCondition: '当激活「方案发散与极简砍刀 Preset」时自动挂载【伪需求砍刀三问简 SKILL-01】',
        cardKind: '已定前提',
        title: '【SKILL-01】伪需求砍刀三问：查第7天触发事件、查纪要出处（E2）、查72小时可验证性',
        summary: '开局直接用三把尺子扫平案头筹码，把无出处的「轮到你了」与换皮打卡当场划入碎石弃槽。',
        sourceRef: '大图书馆 · Thinking Skill 石刻简 SKILL-01',
        boundToTokenId: 'token-04',
      },
      {
        id: 'recall-node-302',
        nodeType: 'NODE II · 对质卡壳时历史裁定召回',
        triggerCondition: '当讨论是否保留「关注动态」作为副组件时触发',
        cardKind: '历史裁定',
        title: '【R1+E6】林凡原话与一期收敛裁定：不缺组件类型，缺愿意长期留在桌面的理由',
        summary: '协助极简砍刀席拍板：多塞一个次要动态组件不会增加留桌理由，反而污染固定语伴单一变量实验。',
        sourceRef: '大图书馆 · 居民追问印 SEAL-01 / E6',
        boundToTokenId: 'token-03',
      },
    ],
  },
];
