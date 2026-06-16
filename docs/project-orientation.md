# 思维城邦接手说明

这份文档只解决一个问题：隔一段时间回来，怎样快速重新掌握这个项目。

## 一句话先抓住它

思维城邦是一个“议题讨论可视化”原型。用户输入一个模糊议题，先从城邦全貌进入议会内景；系统把讨论拆成问题、假设、证据、反驳、行动五类观点，再用居民席位、巡城检查和卷轴报告，把一轮思考变成能看、能改、能导出的结构。

最重要的体验目标不是聊天，而是让用户看到一次讨论怎样从一句话变成地图、关系和下一步。

## 你现在应该怎么操作

本地运行：

```bash
npm run dev
```

打开：

```text
http://127.0.0.1:5173/
```

最短体验路径：

1. 看左侧“当前议题”。
2. 保留默认问题，或自己改一句议题。
3. 点击“进入议会”。
4. 在议会内点击“召开完整议会”。
5. 看四位居民席位出现本轮发言。
6. 点击巡城官和卷轴官，看修缮令、报告和行动计划。
7. 返回城邦，看观点建筑、道路和角色 prompt 图鉴。

如果只想看开局草稿，可以点“只开局”。它只生成第一批建筑和圆桌候选，不会把整轮讨论自动跑完。

## 这个界面分成三层

### 左侧：立题台

左侧是用户的起点。它负责三件事：

- 写当前议题。
- 选择模式：探索、决策、行动。
- 进入议会、只开局，或在议会内跑完整讨论。

这里的设计原则是先让用户跑起来。高级编辑、手动建观点、居民预览都收在下方，避免一进来就被太多入口打断。

对应代码：

- `src/components/IdeaPanel.tsx`
- `src/App.tsx` 里的 `runCompleteDiscussion`

### 中间：城邦全貌

城邦全貌现在主要承担入口、图鉴和沉淀结果。点击不同建筑，会看到对应居民角色、常用发问方式、背后 prompt 摘要和输出结构。点击“冲突议会”会进入议会内景。

采纳后的观点仍会沉淀为地图建筑，路代表观点之间的关系。

五类观点分别是：

- question：问题
- hypothesis：假设
- evidence：证据
- counter：反驳
- action：行动

五类道路关系分别是：

- 支持
- 冲突
- 依赖
- 延伸
- 回流

用户点建筑时，可以看这座建筑的正文、来源、作者角色，也能把它作为道路起点。

对应代码：

- `src/components/CityMap.tsx`
- `src/components/MapPopover.tsx`
- `src/lib/layout.ts`
- `src/types.ts`

### 议会内景：主交互空间

议会内景是当前 MVP 的主舞台。这里有从完整居民池中选出的四位讨论居民、巡城官和卷轴官：

- 研究者：补证据、案例和验证指标。
- 怀疑者：找反例、风险和失败条件。
- 实践者：放回真实场景。
- 执行者：收束最小行动。
- 巡城官：检查结构缺口。
- 卷轴官：查看报告和行动计划。

完整居民池在 `src/lib/residents.ts`，每个功能角色都有不同性别呈现、性格人设、提示词摘要和输出契约。当前上桌代表是：

- 证据制图师：女性研究者。
- 反证怀疑者：男性怀疑者。
- 场景实践者：男性实践者。
- 推进执行官：女性执行者。
- 结构巡城官：男性巡城官。
- 报告编辑官：女性卷轴官。

城邦全貌里的角色图鉴会展示完整居民池。同一建筑可能有多位相关居民，可以在图鉴里切换查看他们背后的 prompt。

对应代码：

- `src/components/CouncilStage.tsx`
- `src/lib/residents.ts`
- `src/assets/art/scenes/`
- `src/assets/art/characters/`

### 右侧：城邦服务

右侧服务在城邦全貌中仍保留，作为历史、卷轴和旧流程的辅助入口；主要观点碰撞迁移到议会内景。

里面有四个服务：

- 全过程：把输入、开局、圆桌、巡检、卷轴产出串起来。
- 居民：查看多角色圆桌发言。
- 巡城：查看当前结构缺口。
- 卷轴：查看报告、行动计划、圆桌记录和修缮记录。

对应代码：

- `src/components/ServiceDrawer.tsx`
- `src/components/ProcessPanel.tsx`
- `src/components/ArchivePanel.tsx`
- `src/components/ReviewPanel.tsx`

## 一轮讨论到底发生了什么

现在的主流程是：

```text
用户输入议题
  -> 进入议会内景
  -> createOpeningDraft 生成开局观点、初始道路、圆桌发言
  -> runCompleteDiscussion 采纳所有圆桌发言
  -> 每条被采纳发言显示在对应居民席位和中央讨论桌
  -> 被采纳发言同步变成城邦地图建筑
  -> buildReviewFindings 检查结构缺口
  -> buildArchiveDocs 生成报告、行动计划、圆桌记录、修缮记录
```

这条链路的入口在：

```text
src/App.tsx -> runCompleteDiscussion
```

如果你只看一个函数，就先看它。它把“跑通完整讨论”这件事串起来。

## 数据结构怎么理解

核心类型都在 `src/types.ts`。

最重要的几个：

- `IdeaNode`：地图上的一座观点建筑。
- `Route`：两座建筑之间的一条关系道路。
- `RoundtableTurn`：居民圆桌的一次发言。
- `ReviewFinding`：巡城检查发现的问题。
- `ArchiveDoc`：卷轴馆里可导出的文档。
- `UsageLedger`：本轮使用本地模板还是 AI 推演，以及调用成本。

理解顺序建议：

1. 先看 `IdeaNode` 和 `Route`。
2. 再看 `RoundtableTurn` 怎样被采纳成 `IdeaNode`。
3. 最后看 `ReviewFinding` 和 `ArchiveDoc` 怎样从当前地图派生出来。

## 几个关键文件

| 文件 | 作用 |
| --- | --- |
| `src/App.tsx` | 应用总编排，所有主要状态都在这里 |
| `src/types.ts` | 项目的核心数据模型 |
| `src/lib/opening.ts` | 根据议题生成开局观点、道路和圆桌发言 |
| `src/lib/review.ts` | 巡城规则，检查假设、反驳、孤立建筑和行动闭环 |
| `src/lib/archive.ts` | 把当前讨论生成报告、行动计划和记录 |
| `src/lib/ai.ts` | 调用 Mimo 代理，失败时回退本地模板 |
| `src/components/IdeaPanel.tsx` | 左侧立题台 |
| `src/components/CityMap.tsx` | 城邦总览、地图建筑和角色图鉴入口 |
| `src/components/CouncilStage.tsx` | 议会内景主舞台 |
| `src/components/ResidentCodexPanel.tsx` | 城邦建筑对应的居民 prompt 图鉴 |
| `src/lib/residents.ts` | 居民角色、prompt 摘要和输出结构 |
| `src/components/ServiceDrawer.tsx` | 右侧服务抽屉 |
| `src/components/ProcessPanel.tsx` | 全过程看板 |
| `src/styles.css` | 大部分视觉布局都在这里 |

## 当前项目最容易混乱的点

### 1. 本地模板和真实 AI 共存

如果没有配置完整 Mimo API key，项目依然可以跑通完整流程。此时数据来自本地模板，账簿会显示本地模板或回退状态。

真实 AI 入口在：

```text
api/mimo/chat.ts
src/lib/ai.ts
```

本地配置在：

```text
.env.local
```

### 2. 圆桌发言不等于地图建筑

`RoundtableTurn` 是居民发言，只有采纳后才会变成 `IdeaNode`。

现在“一键跑通完整讨论”会自动采纳整轮圆桌，所以你会看到地图上立刻多出建筑。

### 3. 巡城不是模型生成

巡城结果来自固定规则：

```text
src/lib/review.ts
```

它会检查：

- 假设有没有证据支撑。
- 反驳有没有进入关系网络。
- 有没有孤立建筑。
- 行动有没有回流证据。

### 4. 卷轴不是静态文档

卷轴馆里的报告、行动计划、圆桌记录、修缮记录，都会根据当前 `ideas`、`routes`、`turns`、`findings` 重新生成。

生成入口：

```text
src/lib/archive.ts -> buildArchiveDocs
```

## 如果你要继续改，先改哪里

如果目标是让用户更容易懂：

1. 先改 `ProcessPanel.tsx`，让全过程看板更像向导。
2. 再改 `IdeaPanel.tsx`，减少左侧第一屏信息。
3. 最后改 `ServiceDrawer.tsx`，调整四个服务的顺序和文案。

如果目标是让讨论更真实：

1. 先补 `.env.local` 的完整 Mimo key。
2. 再看 `src/lib/ai.ts` 的返回结构。
3. 然后把 `createOpeningDraft` 的本地模板换成真实 LLM 输出。

如果目标是让报告更能用：

1. 先改 `src/lib/archive.ts`。
2. 给每条道路补“为什么成立”。
3. 给行动计划补优先级、验证指标和回看时间。

## 当前可以放心依赖的东西

- 项目能本地运行。
- 没有真实 API key 也能完成一轮可视化讨论。
- 主要数据都在 React 状态里，刷新前会保存到 localStorage。
- 地图、圆桌、巡城、卷轴都围绕同一份 `ideas` 和 `routes` 派生。
- `npm run build` 是当前最直接的健康检查。

## 先记住这句话

这个项目的核心不是“问 AI 一个问题”，而是把一个议题变成一座能继续修、能复盘、能导出报告的思考城市。
