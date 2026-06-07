# 思维城邦 MVP 流程与美术角色规划

## 当前版本真实流程

当前版本本质上是一个“议题推理地图 + 行动收束 + 报告材料”的 MVP：

1. 用户在左侧“立题台”输入一个模糊议题，或贴入一堆零散想法。
2. 点击“开局推演”，系统本地生成五类首批观点建筑：问题、假设、证据缺口、反驳、行动。
3. 用户可以点击建筑，在地图内查看铭文，也就是观点正文。
4. 用户可以在弹窗里铺设道路，为两个观点建立支持、冲突、依赖、延伸、回流关系。
5. 左侧建筑工坊可以新建自己的观点，提交后进入对应城区，成为地图上的新建筑。
6. 右侧居民动态提供多角色 agent 建议。点击只预览，只有点“采纳入城”才会转成新建筑。
7. 右侧巡城日志基于当前地图关系做诊断，提示缺证据假设、未处理反驳、孤立观点、未闭环行动。

## 当前 UI 中的可理解性落点

这轮把 MVP 链条直接放进了两个位置：

- 左侧 `MvpPath`：作为常驻“游戏式任务线”，用八步说明用户下一步该点哪里、做什么、会得到什么。
- 新手 `GuideOverlay`：首次进入自动展示，用磨砂遮罩解释同一条链条，并把“城邦术语”翻译成实际功能。

用户应能从界面直接读出闭环：

> 模糊议题 / 零散想法 -> 开局推演 -> 观点建筑 -> 居民建议预览 -> 采纳入城 -> 铺设道路 -> 巡城官令 -> 下一步行动 / 报告材料

这条链条的关键产品约束是：居民建议只预览，不直接改地图；只有用户主动“采纳入城”才生成建筑。

## 当前流程的问题

当前体验的问题不是“没有功能”，而是 MVP 链条还没有被产品化：

- 用户不知道第一步应该做什么：输入议题、点建筑、看居民动态还是巡城日志。
- 城邦术语有氛围，但功能映射还不够强。
- 右侧日志还是偏普通列表，缺少“角色在城邦中活动”的感觉。
- 巡检结果是诊断，但还没有转化成明确的下一步任务。
- “采纳建议 -> 形成观点 -> 连接道路 -> 巡检 -> 生成下一步行动”这条闭环还没有被强调。

## 建议的 MVP 主链条

首版 MVP 现在定义为：

> 把一个模糊议题或一堆零散想法，转化成一张可被多角色讨论、可被巡检的思考地图，并收束成一个下一步行动和一份可导出的讨论报告材料。

主链条应该是：

1. 立题：用户输入一个模糊议题，或贴入一堆零散想法。
2. 开局：点击“开局推演”，系统自动生成 1 个核心问题、1 个假设、1 个证据缺口、1 个反驳、1 个行动草案。
3. 集思：居民动态给出多角色建议，但只预览，不自动改变地图。
4. 采纳：用户选择一条建议“采纳入城”，它变成观点建筑。
5. 铺路：用户或系统建议观点之间的关系。
6. 巡城：系统只提示缺证据、未回应反驳、行动未闭环等问题，不自动修改地图。
7. 收束：系统给出“下一步最小行动”，同时保留可导出报告需要的议题、观点、道路和巡检记录。

## 术语到功能映射

| 城邦术语 | 实际功能 |
| --- | --- |
| 城邦议题 | 当前讨论的核心问题 |
| 立题台 | 输入模糊议题并启动本轮推演 |
| 零散想法 | 可作为另一种启动材料，后续应支持多条导入 |
| 开局推演 | 自动生成第一批问题、假设、证据缺口、反驳和行动 |
| 建筑 | 一条观点、判断、证据、反驳或行动 |
| 铭文 | 观点正文 |
| 建筑工坊 | 新建观点 |
| 居民动态 | 多角色 agent 建议流 |
| 居民席位 | 后续地图内的 agent 入口，承载持续辩论和分工协作 |
| 采纳入城 | 把建议转为正式观点建筑 |
| 铺设道路 | 建立观点关系 |
| 巡城日志 | 系统诊断与下一步提示 |
| 巡城官塔 | 后续地图内的系统诊断入口，点击展开修缮令 |
| 回流 | 行动产生证据并反哺判断 |
| 收束报告 | 把议题、观点、道路、巡检问题和下一步行动整理成可导出材料 |

## 本轮轻量 UI 调整

- 左侧 `MvpPath` 已改成“游戏式任务线”，明确展示：输入材料 -> 开局推演 -> 观点建筑 -> 居民建议 -> 采纳入城 -> 铺设道路 -> 巡城官令 -> 收束产物。
- 新手 `GuideOverlay` 已纳入用户确认的产品方向：最终产物是地图 + 下一步行动 + 可导出报告材料；首次输入支持模糊议题或零散想法；agent 是持续辩论和分工协作；巡城官令首版只提示问题。
- 地图地点说明不再常驻占面积，改成轻量地名，hover 才显示解释。
- 指引遮罩降低模糊程度，避免把 panorama 看不清。

## 右侧角色美术规划

右侧不应该只是卡片列表，可以改成“城邦边栏角色舞台”。

### 资产目录建议

正式素材放入：

- `src/assets/art/characters/resident-practitioner.png`
- `src/assets/art/characters/resident-researcher.png`
- `src/assets/art/characters/resident-skeptic.png`
- `src/assets/art/characters/resident-executor.png`
- `src/assets/art/characters/city-inspector.png`
- `src/assets/art/ornaments/edict-warning.png`
- `src/assets/art/ornaments/edict-repair.png`
- `src/assets/art/ornaments/edict-closed-loop.png`

所有素材必须是无绿幕透明 PNG 或自然背景小幅插图，不允许前端引用 raw 生图。

### 居民动态

目标：表现多角色 agent 的建议正在进入城邦，但还没有正式变成建筑。

建议生成四个半身角色或徽章角色：

- 实践者：手持工作日志、卷轴和工具，偏绿色/铜色。
- 研究者：手持星盘、书卷、放大镜，偏蓝色/金色。
- 怀疑者：披深色斗篷、手持审议牌或反证卷轴，偏赭红/暗紫。
- 执行者：靠近码头、手持路线图和任务令，偏紫色/青铜。

展示方式：

- 每条居民动态前面不是普通 seal，而是角色头像或半身小像。
- 点击角色建议时，地图内弹出“居民来函”。
- 已采纳角色建议可盖一个“已入城邦”印章。

Prompt 方向：

> isometric portrait token set, four advisor characters for a Greek Roman monastery academy city of thought, practitioner with work ledger and brass tools, researcher with astrolabe and scrolls, skeptic with dark red cloak and counterargument tablet, executor with harbor route map and task seal, transparent background, no text, no green screen, coherent warm parchment and lapis palette, game UI portrait assets

### 巡城日志

目标：表现系统正在检查城邦结构，而不是普通错误列表。

建议生成一个“巡城官”形象：

- 修道院记录官 + 罗马监察官混合风格。
- 手持长卷、蜡封令牌、城市蓝图。
- 可有 3 种状态小图标：警示、修缮、闭环。

展示方式：

- 巡城日志标题区用巡城官半身像。
- 每条诊断是“修缮令”，带警示章。
- 点击修缮令定位到相关建筑，并打开建筑弹窗。

Prompt 方向：

> isometric city inspector character for a Greek Roman monastery academy city of thought, archivist and civic magistrate hybrid, holding city blueprint, wax sealed scrolls, bronze inspection badge, transparent background, no text, no green screen, warm parchment, lapis blue, bronze accents, polished game UI asset

### 接入后的界面语言

- 居民动态改名为“居民来函”，每条是角色发来的待采纳建议。
- 巡城日志改成“巡城官令”，每条是可点击修缮令。
- 右侧栏顶部放巡城官或四席居民小像，形成“角色席位”而不是普通列表。
- 地图弹窗预览建议时显示对应角色头像，强化“这是建议，不是正式建筑”。

### 当前代码接入点

当前界面已经预留了无图版本的结构：

- `ReviewPanel.tsx` 中的 `.role-court` 对应角色席位。
- `ReviewPanel.tsx` 中的 `.inspector-court` 对应巡城官令。
- `.role-avatar` 现在临时使用 seal，后续替换为 `characters/*`。
- `.role-court-header` 后续可放巡城官半身像或四席居民小像。
- `MapPopover.tsx` 的 `preview-popover` 后续可加入当前来函角色头像。

生成新素材后，应该先扩展 `src/assets/art.ts`，再替换 `ReviewPanel.tsx` 的头像映射，保持所有正式素材都在仓库内。

## 下一轮需要确认的问题

1. MVP 的核心结果应该是什么：一张结构化思维地图，还是一个明确的下一步行动？
2. 用户最先输入的是“模糊议题”，还是“已经有的一堆想法”？
3. agent 的作用是提出观点，还是扮演辩论席位持续互动？
4. 巡城日志应该只提示问题，还是直接生成修复建议？
5. 视觉上右侧应该保留边栏，还是改成地图内可展开的角色席位？
