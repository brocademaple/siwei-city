# 思维城邦真实思考内容接入计划

日期：2026-07-16

## 0. 当前判断

项目不是代码空壳：普通构建、Pages 构建和 smoke 在正确构建口径下都能跑通。真正空心的是“思考内容层”：历史文献和讨论传统已经被整理成资料台账与协议名称，但还没有成为可复用的数据、规则、发言约束和报告出处。

下一步不宜继续扩建筑或加 UI 入口，应该先做两件事：

1. 清掉 1.0 遗留叙事的主导权，让“观点建筑”退回为底层沉淀视图。
2. 建立“历史讨论方法 -> 协议规则 -> 居民发言 -> 巡城诊断 -> 卷轴报告”的内容主干。

## 1. 已收集资料

### 外部历史文献来源

来源台账在 `docs/current/reference-sources.md`，当前已经登记：

| 线索 | 已登记材料 | 当前用途 |
| --- | --- | --- |
| 古希腊 | Plato, Apology / Symposium；Aristotle, Rhetoric / Topics；Xenophon, Memorabilia | 公共追问、轮流演说、三类论辩场景、论题拆解、苏格拉底式反诘 |
| 先秦 | 《论语·先进》《孟子·滕文公上》《战国策·齐策》《墨子》《公孙龙子·白马论》《荀子·正名》《韩非子·说难》《庄子·天下》 | 问志开局、现实追问、类比游说、利害验证、名实校准、听众建模、保存分歧 |

资料状态：

- A 级来源已经可作为机制说明和出处说明。
- 《墨子》与《战国策》部分仍是 B 级，需要后续固定稳定底本或具体篇章。
- 目前资料适合做产品机制，不适合直接长段精引。

### 已形成的产品协议

`docs/current/cultural-debate-background.md` 已经把资料转成 5 个协议：

| 协议 | 来源线索 | 应落地的机制 |
| --- | --- | --- |
| 问志开局 | 《论语·先进》 | 先让居民说明会把议题带向哪里，用户选择主线 |
| 苏格拉底反诘 | Plato / Xenophon | 列前提、找矛盾、提出修正版主张 |
| 亚里士多德论题拆解 | Topics / Rhetoric | 区分定义、事实、价值、行动，检查证据类型和成立条件 |
| 先秦类比游说 | 《战国策》《韩非子·说难》 | 根据听众选择正面论证、低冲突类比或表达改写 |
| 名实校准 | 《公孙龙子》《荀子》 | 抽关键词、列多种定义、确认本轮采用定义 |

### 已进入代码的部分

当前已经有第一层结构：

- `src/types.ts`：有 `DiscussionProtocol`、`ArgumentMove`、`ReviewGapType`。
- `src/lib/protocols.ts`：有 5 个协议定义、动作标签、协议选择和巡城建议协议。
- `src/lib/opening.ts`：开局时会选择协议，并给圆桌发言写入 `protocol`、`argumentMove`、`protocolReason`。
- `src/lib/review.ts`：巡城 finding 已有 `gapType`、`suggestedProtocol`、`suggestedMove`。
- `src/lib/archive.ts`：卷轴报告会输出本轮协议、论证动作和巡城建议。
- `src/lib/agents/agentRuntime.ts`：真实 agent prompt 已要求结构化 JSON 返回协议和动作。
- `db/siwei-city-schema.sql`：SQL schema 已预留协议、论证动作和巡城缺口字段。
- `docs/trace-runs/`：已有公开链路留痕，可观察协议字段怎样随示例生成。

## 2. 现在的问题

### 问题 A：协议是标签，不是内容引擎

`src/lib/protocols.ts` 现在只有短标题、描述、使用场景和默认动作。缺少：

- 来源 ID，例如 `GRC-004` / `CHN-005`。
- 协议步骤，例如“列当前主张 -> 列已承认前提 -> 找冲突 -> 修正版主张”。
- 对居民的发言约束。
- 对报告的引用/出处输出规则。
- 失败时的降级规则，例如资料不足时不能假装有原典支持。

### 问题 B：历史文献没有进入数据模型

当前 `IdeaNode`、`RoundtableTurn`、`ReviewFinding` 都没有 `sourceIds`、`sourceGrade`、`protocolStep`、`claimKind` 等字段。于是卷轴报告只能说“本轮协议：名实”，不能说“这轮为什么采用名实校准，借用了哪条传统，执行到哪一步”。

### 问题 C：协议选择过于粗糙

当前选择逻辑主要靠关键词。比如议题里有“安全”“值得”就容易被归入 `naming`。这会导致很多不同议题都被同一种协议覆盖，看起来像有历史方法，实际还是模板。

### 问题 D：“观点建筑”仍在主叙事里

`README.zh-CN.md`、`docs/current/product-engineering-brief.md`、`docs/current/project-orientation.md`、`docs/current/siwei-city-mvp-manual.md`、`scripts/build-pages-versions.mjs` 里仍大量出现“观点建筑 / 建筑工坊 / 观点建筑地图”。其中有两类要分开处理：

| 类型 | 处理 |
| --- | --- |
| 底层模型 | 保留 `IdeaNode` / `Route`，它们仍适合表达一轮讨论的沉淀结果 |
| 用户主叙事 | 降权，不再把“观点建筑”作为 2.0 核心卖点；改成“议会协议、论证节点、讨论轨迹、卷轴出处” |

## 3. 建议的新内容架构

### 3.1 新增文献与协议数据层

建议新增：

```text
src/data/debateCanon.ts
```

核心对象：

```ts
type DebateSource = {
  id: 'GRC-001' | 'CHN-001' | string;
  tradition: 'greek' | 'pre-qin';
  title: string;
  sourceUrl: string;
  grade: 'A' | 'B' | 'C';
  mechanism: string;
  useForProtocols: DiscussionProtocol[];
  citationNote: string;
  needsVerification?: boolean;
};

type ProtocolRecipe = {
  id: DiscussionProtocol;
  sourceIds: string[];
  triggerSignals: string[];
  steps: {
    id: string;
    label: string;
    requiredMove: ArgumentMove;
    residentRole?: string;
    outputConstraint: string;
  }[];
  reportTemplate: string;
  guardrails: string[];
};
```

第一批只做 8 个来源和 5 个 recipe，不追求百科全书式完整。

### 3.2 扩展运行数据

建议扩展：

```ts
RoundtableTurn {
  sourceIds?: string[];
  protocolStepId?: string;
  claimKind?: 'definition' | 'fact' | 'value' | 'counter' | 'condition' | 'action' | 'rhetoric';
  evidenceStatus?: 'needs_source' | 'user_observation' | 'case_based' | 'source_backed';
}

ReviewFinding {
  sourceIds?: string[];
  missingStepId?: string;
}
```

这样每条发言不只是“研究者说了什么”，还能说明它承担协议里的哪一步。

### 3.3 升级协议选择

把 `selectOpeningProtocol(topic, mode)` 升级成 `buildProtocolPlan(topic, mode, context)`：

输出应包含：

- 推荐协议。
- 触发理由。
- 关联来源。
- 本轮需要执行的 3-4 个步骤。
- 哪些居民负责哪些步骤。
- 如果资料不足，报告里怎样标注。

### 3.4 升级 agent prompt

在 `src/lib/agents/agentRuntime.ts` 中，把 `expectedProtocol` / `expectedMove` 升级为完整 `protocolPlan`：

- system prompt 里告诉居民“你正在执行某协议的第 N 步”。
- user payload 附上 `sourceIds`、`steps`、`guardrails`。
- JSON schema 要求返回 `sourceIds` 和 `protocolStepId`。

### 3.5 升级卷轴报告

`src/lib/archive.ts` 的报告增加：

- 本轮讨论方法。
- 本轮采用来源。
- 关键名词定义。
- 未执行完的协议步骤。
- 哪些判断是原典启发，哪些是用户/AI 对当前议题的转译。

报告里的措辞要避免“复原历史”，改为“借用讨论方法”。

## 4. 陈旧逻辑清理清单

### P0：文案降权

先改用户会直接看到的叙事：

- `README.zh-CN.md`
- `README.md`
- `docs/current/product-engineering-brief.md`
- `docs/current/project-orientation.md`
- `docs/current/siwei-city-mvp-manual.md`

替换方向：

| 旧说法 | 新说法 |
| --- | --- |
| 把观点做成建筑 | 把讨论沉淀成可审阅的论证节点 |
| 观点建筑地图 | 议题地图 / 讨论沉淀图 |
| 建筑工坊 | 节点草稿 / 想法导入 |
| 采纳入城 | 采纳为本轮论证节点 |

### P1：代码命名暂缓大改

暂时保留 `IdeaNode`、`Route`、`district`，避免大面积重构。先从 UI copy 和 archive 文案改起。等内容主干稳定后，再考虑是否把用户文案中的“建筑”全部转成“节点/席位/卷轴”。

### P2：1.0 页面只保留为归档

`scripts/build-pages-versions.mjs` 中的 v1 页面可以保留，但 2.0 首页叙事要避免让读者觉得项目核心仍是“观点建筑地图”。v1 的标题继续叫“1.0：观点建筑地图”没问题，但不能影响 2.0 默认入口。

## 5. 推荐执行顺序

### Sprint 1：清旧叙事 + 建内容骨架

1. 扫描并修改当前文档/README 中的“观点建筑”主叙事。
2. 新增 `src/data/debateCanon.ts`，把 `reference-sources.md` 里的 A/B 级来源转成结构化数据。
3. 扩展 `src/lib/protocols.ts`，让协议定义从 label 变成 recipe。
4. 更新 `scripts/run-thinking-traces.mjs`，让两条 trace 分别覆盖不同协议，避免全部落到名实校准。
5. 跑：

```bash
npm run build
npm run build:pages
npm run test:smoke
npm run trace:thinking
```

### Sprint 2：让协议进入居民发言

1. 扩展 `RoundtableTurn` schema。
2. 更新 `src/lib/opening.ts` 和 `src/lib/agents/agentRuntime.ts`。
3. 让居民卡片显示“协议步骤 + 来源 chip”。
4. 巡城官令能指出“缺的是哪一步”，而不只是缺证据/缺行动。

### Sprint 3：让卷轴真正有出处

1. `src/lib/archive.ts` 增加“本轮讨论方法”和“来源说明”。
2. 报告导出时列出 `sourceIds` 和引用等级。
3. 对 B 级来源自动标注“方向性来源，精引前需复核”。
4. 为公开链路留痕增加 source coverage。

## 6. 验证口径

本次审阅时验证结果：

- `npm run build` 通过。
- `npm run build:pages` 通过。
- 先跑普通 build 再跑 `npm run test:smoke` 会失败，因为 smoke 检查 Pages 的 `/siwei-city/v2/` 路径。
- 跑完 `npm run build:pages` 后，`npm run test:smoke` 通过。
- `npm run trace:thinking` 可生成当前日期的 trace 文件和 latest 文件。

后续建议把 smoke 文档写清楚：它验证的是 Pages 构建产物，不是普通 Vite `dist/index.html`。

## 7. 关键假设

- “真正的思考性内容”优先指讨论协议、历史方法、发言约束、出处和报告解释，而不是新增更多视觉建筑。
- 1.0 的空间化模型仍有价值，但在 2.0 中应该退到沉淀层，主舞台交给冲突议会和协议化圆桌。
- 历史资料作为产品机制来源使用，先不做学术精引。
- 真实 AI 接入应在内容 schema 稳定后推进，否则模型只会把旧模板说得更像真的。
