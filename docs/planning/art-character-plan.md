# 思维城邦居民与巡城官美术接入规划

## 目标

本文件只规划“居民动态 / 巡城官”专属美术素材与接入方案，不生成图片，不改动当前代码实现。

用户已确认的产品方向：

- 右侧形态逐步改为地图上的“居民席位 / 巡城官塔”，点击才展开。
- 保留角色头像，但不再让右侧列表成为主要视觉中心。
- agent 作用是持续辩论和分工协作：研究者找证据，怀疑者找反例，执行者给行动，实践者给落地经验。
- 巡城日志首版只提示问题，不自动修复、不一键生成任务。
- 所有最终素材必须无绿幕，必须存储在代码仓库内，前端只引用 `src/assets/art/` 下的正式成品。

## 已确认的交互决策

这些决策应作为后续 UI 和素材接入的硬约束：

1. `居民动态` 不再被设计成常驻右侧列表。最终形态是 panorama 地图上的 `居民席位`，用户点击席位后才展开角色建议。
2. `巡城日志` 不再被设计成常驻右侧诊断列表。最终形态是 panorama 地图上的 `巡城官塔`，用户点击塔后才展开巡检提示。
3. 角色头像要保留，但头像属于席位展开层、建议来函和采纳状态，不应占据主地图的长期视觉中心。
4. 居民/agent 不是一次性“给四条建议”的按钮，而是持续辩论和分工协作的角色系统：
   - 实践者：把观点落到真实工作流和使用场景。
   - 研究者：寻找证据、案例、引用和可验证材料。
   - 怀疑者：提出反例、风险和未处理冲突。
   - 执行者：把讨论收束成下一步行动。
5. 巡城官首版只提示问题，不自动修复，不自动生成新观点或新任务。它的职责是让用户看见结构缺口，例如缺证据、未回应反驳、孤立观点、行动未闭环。

## 明确不做

- 不把居民动态做成普通消息流、评论区或通知列表。
- 不让点击居民建议直接新增观点建筑。
- 不让巡城官一键替用户修复整个地图。
- 不把角色头像做成现代客服头像或社交媒体头像。
- 不把居民席位、巡城官塔做得像普通观点建筑，避免用户误解它们也是一条观点。

## 美术隐喻

居民不是普通评论列表，而是城邦里持续参与议题的“席位”。巡城官不是错误列表，而是站在城邦高处检查结构缺口的“监察塔”。

对应关系：

| 城邦对象 | 实际功能 | 交互定位 |
| --- | --- | --- |
| 居民席位 | 多角色 agent 建议入口 | 地图上的可点击席位，展开后查看角色来函 |
| 四类居民头像 | agent 身份与分工 | 角色建议、预览弹窗、已采纳状态 |
| 巡城官塔 | 系统诊断入口 | 地图上的可点击塔，展开后查看问题提示 |
| 修缮令图标 | 巡检问题类型 | 缺证据、未反驳、孤立观点、行动未闭环 |
| 采纳入城印章 | 把建议转成正式观点 | 只在用户确认采纳后出现 |

## 资产目录规划

新增正式目录：

```text
src/assets/art/characters/
src/assets/art/civic/
src/assets/art/ornaments/
```

建议文件：

```text
src/assets/art/civic/resident-seats.png
src/assets/art/civic/inspector-tower.png

src/assets/art/characters/resident-practitioner.png
src/assets/art/characters/resident-researcher.png
src/assets/art/characters/resident-skeptic.png
src/assets/art/characters/resident-executor.png
src/assets/art/characters/city-inspector.png

src/assets/art/ornaments/edict-evidence-gap.png
src/assets/art/ornaments/edict-counter-missing.png
src/assets/art/ornaments/edict-isolated-node.png
src/assets/art/ornaments/edict-action-open-loop.png
src/assets/art/ornaments/seal-accepted.png
```

可选 raw 源目录：

```text
src/assets/raw/characters/
```

`raw` 目录只放临时母图或待处理图，必须被 `.gitignore` 忽略，不能被前端引用。

## 素材生成规格

通用要求：

- 透明 PNG 或 WebP，背景透明。
- 不使用绿幕，不出现纯绿色背景、绿色描边或 chroma spill。
- 图片内不放中文或英文文字。
- 风格统一：希腊罗马城邦、修道院、学院、羊皮纸、青金石蓝、青铜、暖石材。
- 视角统一：轻微等距/isometric，适合作为游戏 UI 资产。
- 光源统一：柔和日光，边缘清晰，适合叠在 panorama 上。

### 居民席位

用途：地图上替代右侧“居民动态”的入口。点击后展开“居民来函”。

文件：

```text
src/assets/art/civic/resident-seats.png
```

Prompt：

```text
isometric civic advisor seats for a Greek Roman monastery academy city of thought, four small semicircular marble seats around a low mosaic table, scrolls, wax seals, astrolabe, brass tools, harbor route tablet, warm parchment and lapis blue accents, transparent background, no text, no letters, no green screen, no chroma key, polished game UI asset, clean silhouette, soft daylight
```

验收：

- 远看像一个“可点击席位”，不是一座普通观点建筑。
- 能容纳四个角色头像围绕它展开。
- 不与观点建筑混淆，不表达“某条观点”。

### 巡城官塔

用途：地图上替代“巡城日志”的入口。点击后展开“巡城官令”。

文件：

```text
src/assets/art/civic/inspector-tower.png
```

Prompt：

```text
isometric city inspector tower for a Greek Roman monastery academy city of thought, slim marble watchtower with bronze bell, blue civic banners, inspection balcony, scroll cases, wax seal emblem, warm stone, lapis blue and bronze accents, transparent background, no text, no letters, no green screen, no chroma key, polished game UI asset, clean silhouette, soft daylight
```

验收：

- 远看像“监察/巡检入口”，不是普通钟楼建筑。
- 适合放在 panorama 右上或右侧边缘，点击后展开诊断面板。
- 体量应小于主要观点建筑，避免抢走地图主视觉。

### 四类居民头像

用途：角色建议、居民席位展开层、地图内建议预览弹窗。

统一 prompt 前缀：

```text
isometric portrait token, bust character for a Greek Roman monastery academy city of thought, transparent background, no text, no letters, no green screen, no chroma key, warm parchment, lapis blue, bronze accents, polished game UI portrait, clean silhouette, soft daylight
```

实践者：

```text
practitioner advisor, holding a work ledger, small brass tools and a tied scroll, practical robe with green and bronze accents, calm grounded expression
```

文件：

```text
src/assets/art/characters/resident-practitioner.png
```

研究者：

```text
researcher advisor, holding an astrolabe, magnifying lens and open scrolls, scholarly robe with lapis blue and gold accents, focused analytical expression
```

文件：

```text
src/assets/art/characters/resident-researcher.png
```

怀疑者：

```text
skeptic advisor, holding a counterargument tablet and sealed evidence scroll, dark red and muted purple cloak, sharp but fair expression
```

文件：

```text
src/assets/art/characters/resident-skeptic.png
```

执行者：

```text
executor advisor, holding a harbor route map, task token and small bronze compass, violet and bronze accents, decisive action oriented expression
```

文件：

```text
src/assets/art/characters/resident-executor.png
```

验收：

- 四个头像一眼能区分身份。
- 统一构图、统一尺寸、统一光源。
- 缩小到 48px 仍能识别角色轮廓。
- 不能像现代客服头像，必须属于城邦世界观。

### 巡城官头像

用途：巡城官塔展开层、巡城官令标题、诊断提示。

文件：

```text
src/assets/art/characters/city-inspector.png
```

Prompt：

```text
isometric portrait token, city inspector character for a Greek Roman monastery academy city of thought, archivist and civic magistrate hybrid, holding city blueprint, wax sealed scrolls and bronze inspection badge, parchment robe with lapis blue trim, transparent background, no text, no letters, no green screen, no chroma key, polished game UI portrait, clean silhouette, soft daylight
```

验收：

- 看起来像“系统诊断者”，不是普通居民。
- 和四类居民头像同属一个系列，但权威感更强。
- 适合作为巡城官塔展开面板的主视觉。

### 修缮令图标

用途：巡城日志首版只提示问题，每个问题用一枚修缮令图标表达类型。

统一 prompt 前缀：

```text
small isometric parchment edict icon for a Greek Roman monastery academy city of thought, wax seal, bronze rim, transparent background, no text, no letters, no green screen, no chroma key, polished game UI icon, clean silhouette
```

缺证据：

```text
evidence gap symbol, small empty evidence shelf and question seal, red wax mark
```

文件：

```text
src/assets/art/ornaments/edict-evidence-gap.png
```

未处理反驳：

```text
unanswered counterargument symbol, crossed debate tablets and amber warning seal
```

文件：

```text
src/assets/art/ornaments/edict-counter-missing.png
```

孤立观点：

```text
isolated node symbol, single small marble column separated from broken road lines, green repair seal
```

文件：

```text
src/assets/art/ornaments/edict-isolated-node.png
```

行动未闭环：

```text
open action loop symbol, unfinished circular route and harbor task token, bronze repair seal
```

文件：

```text
src/assets/art/ornaments/edict-action-open-loop.png
```

采纳入城：

```text
accepted into city wax seal icon, bronze civic stamp, parchment backing, lapis accent, transparent background, no text, no letters, no green screen
```

文件：

```text
src/assets/art/ornaments/seal-accepted.png
```

## 代码接入点建议

本次不直接改代码，只记录后续接入点。

### 资产索引

建议新增或扩展：

```text
src/assets/art.ts
```

建议导出：

```ts
export const characterArt = {
  practitioner: residentPractitioner,
  researcher: residentResearcher,
  skeptic: residentSkeptic,
  executor: residentExecutor,
  inspector: cityInspector,
}

export const civicArt = {
  residentSeats,
  inspectorTower,
}

export const edictArt = {
  evidenceGap,
  counterMissing,
  isolatedNode,
  actionOpenLoop,
  accepted,
}
```

### 地图入口

建议在 `CityMap.tsx` 新增两类地图对象：

- `ResidentSeatMarker`：点击打开居民席位浮层。
- `InspectorTowerMarker`：点击打开巡城官令浮层。

两者应和观点建筑分层：

```text
背景层: hero-city-panorama
城区层: 轻量地名
观点层: idea buildings
城邦服务层: resident seats / inspector tower
弹窗层: role letters / inspector edicts / idea details
```

### 居民席位展开层

现有 `ReviewPanel.tsx` 里的居民建议数据可以保留，但视觉入口迁移到地图内。

建议组件：

```text
src/components/ResidentSeatPopover.tsx
```

职责：

- 展示四类角色头像。
- 展示“持续辩论 + 分工协作”的说明。
- 点击某个角色后展开该角色建议。
- “采纳入城”才调用新增观点逻辑。
- 已采纳的建议显示 `seal-accepted.png`。

### 巡城官塔展开层

建议组件：

```text
src/components/InspectorTowerPopover.tsx
```

职责：

- 展示巡城官头像。
- 展示当前巡检问题。
- 每条问题只提示，不自动修复。
- 点击问题只定位相关建筑或打开对应观点弹窗。

### 右侧栏过渡方案

如果短期仍保留右侧栏，建议改成“压缩日志抽屉”：

- 默认只显示两个入口：居民席位、巡城官塔。
- 具体内容不常驻展开。
- 点击入口时优先在地图内展开，而不是撑高右侧栏。

## 验收清单

素材验收：

- 所有正式素材位于 `src/assets/art/`。
- 前端不可引用 `src/assets/raw/`。
- 前端不可引用临时生成目录。
- 所有可见素材无绿幕、无纯绿色背景、无绿色边缘污染。
- 图片内没有文字。
- 角色头像、席位、巡城官塔、修缮令风格统一。

交互验收：

- 居民建议点击只预览，不自动新增观点。
- 只有“采纳入城”才生成新观点建筑。
- 巡城官令只提示问题，不自动修复。
- 居民席位和巡城官塔在地图上是服务入口，不会被误认为观点建筑。
- 点击席位/塔后在地图内展开浮层，主视觉仍停留在 panorama。

工程验收：

```text
npm.cmd run check:assets
npm.cmd run build
```

源码检查：

```text
rg -n "src/assets/raw|building-sprite-sheet|generated_images" src
rg -n "resident-seats|inspector-tower|resident-practitioner|city-inspector" src docs
```

第一条不应命中任何前端可见引用。第二条应能命中正式规划或接入代码。

## 后续生成顺序

1. 先生成 `resident-seats.png` 和 `inspector-tower.png`，验证地图入口是否成立。
2. 再生成四类居民头像，替换居民建议中的临时 seal。
3. 再生成巡城官头像和修缮令图标。
4. 最后把右侧栏内容迁移为地图内浮层，右侧只保留可折叠摘要或完全取消。
