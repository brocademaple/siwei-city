# 美术资产与视觉配置

## 视觉定位

思维城邦的视觉关键词是：

- 城邦
- 修道院学院
- 议题推理地图
- 羊皮纸与青铜
- 希腊罗马式建筑
- 游戏式 UI 资产

界面不使用普通 SaaS 卡片堆叠作为主视觉，而是用 panorama 背景、建筑节点、道路关系和印章纹理建立产品记忆点。

## 当前资产清单

### 主视觉

![城邦 panorama](../../src/assets/art/hero-city-panorama.png)

用途：

- 应用主工作区背景。
- GitHub README 和产品介绍的第一视觉。
- 表达“把思考组织成城邦”的核心隐喻。

### 观点建筑

| 建筑 | 文件 |
| --- | --- |
| 神殿 | `src/assets/art/buildings/building-temple.png` |
| 图书馆 | `src/assets/art/buildings/building-library.png` |
| 议会 | `src/assets/art/buildings/building-council.png` |
| 工坊 | `src/assets/art/buildings/building-workshop.png` |
| 钟塔 | `src/assets/art/buildings/building-bell-tower.png` |
| 港门 | `src/assets/art/buildings/building-harbor-gate.png` |
| 拱门 | `src/assets/art/buildings/building-arch.png` |
| 石碑 | `src/assets/art/buildings/building-stele.png` |
| 讲台 | `src/assets/art/buildings/building-lectern.png` |
| 回廊门 | `src/assets/art/buildings/building-cloister-gate.png` |
| 观测台 | `src/assets/art/buildings/building-observatory.png` |
| 桥边神龛 | `src/assets/art/buildings/building-bridge-shrine.png` |

建筑在产品中的含义：

- 每座建筑对应一条观点、判断、证据、反驳或行动。
- 建筑不是装饰图标，而是地图上的主要交互对象。
- 用户点击建筑后，在地图内查看“铭文”和铺设道路。

### 城区资产

| 城区 | 文件 | 功能含义 |
| --- | --- | --- |
| 问题广场 | `src/assets/art/districts/district-agora.png` | 把模糊困惑改写成可讨论问题 |
| 证据档案馆 | `src/assets/art/districts/district-archive.png` | 收集观察、案例和经验 |
| 假设工坊 | `src/assets/art/districts/district-workshop.png` | 形成可验证判断 |
| 冲突议会 | `src/assets/art/districts/district-council.png` | 处理反驳和风险 |
| 行动码头 | `src/assets/art/districts/district-harbor.png` | 把思考变成实验和回流 |
| 沉思庭院 | `src/assets/art/districts/district-cloister.png` | 暂存未连接灵感 |

### 场景 Panorama

| 场景 | 文件 | 用途 |
| --- | --- | --- |
| 城邦主页 | `src/assets/art/scenes/city-world-panorama.png` | 古希腊城邦世界地图，8 个建筑入口 |
| 议会大厅 | `src/assets/art/scenes/council-chamber-panorama.png` | 观点碰撞、采纳、巡城、卷轴 |
| 大图书馆 | `src/assets/art/scenes/grand-library-panorama.png` | 议会记录、报告、历史版本 |
| 居民区 | `src/assets/art/scenes/residential-quarter-panorama.png` | 居民 prompt、日常 talk、灵感涌现 |
| 假设码头 | `src/assets/art/scenes/hypothesis-harbor-panorama.png` | 候选问题筛选 |
| 行动码头 | `src/assets/art/scenes/action-harbor-panorama.png` | 行动远航和阶段性结果 |
| 沉思庭院 | `src/assets/art/scenes/contemplation-garden-panorama.png` | 慢问题和夜间札记 |
| 记忆墓园 / 废案馆 | `src/assets/art/scenes/memory-cemetery-panorama.png` | 失败行动、过期判断、放弃假设 |
| 灯塔 / 巡城塔 | `src/assets/art/scenes/lighthouse-watchtower-panorama.png` | 未闭环诊断和修缮令 |

### 纹理资产

| 纹理 | 文件 | 用途 |
| --- | --- | --- |
| 羊皮纸 | `src/assets/art/textures/texture-parchment.png` | 面板背景 |
| 蜡封 | `src/assets/art/textures/texture-seal.png` | 临时角色头像、印章 |
| 青铜 | `src/assets/art/textures/texture-bronze.png` | 强调色和装饰质感 |
| 地图纸 | `src/assets/art/textures/texture-map.png` | 地图/卷轴氛围 |
| 石纹 | `src/assets/art/textures/texture-stone.png` | 建筑和边界质感 |
| 仿古纸 | `src/assets/art/textures/texture-vellum.png` | 文档感背景 |

## 资产质量规则

当前项目提供了素材检测命令：

```bash
npm run check:assets
```

规则：

- 正式 UI 只引用 `src/assets/art/`。
- 2.0 应用优先引用 `src/assets/art/optimized/` 下的 WebP 产物；PNG 原图保留为源资产和 1.0 展厅素材。
- `src/assets/generated/` 可保留生成记录和切片来源，但不作为 UI 直接引用。
- 可见资产不得残留明显绿幕。
- 图片中不放中文文字，中文由 HTML 渲染，保证可维护和可访问性。

## 已使用的提示词方向

### 城邦主视觉

```text
isometric Greek Roman monastery academy city of thought, warm parchment atmosphere,
lapis blue and bronze accents, panoramic city map, no text, polished game UI background,
clear districts, architectural landmarks, soft daylight, readable composition
```

### 建筑资产

```text
isometric building sprite sheet for a Greek Roman monastery academy city of thought,
temple, library, council hall, workshop, bell tower, harbor gate, arch, stele, lectern,
cloister gate, observatory, bridge shrine, transparent background, no text,
warm parchment, lapis blue, bronze accents, polished game UI assets
```

### UI 纹理

```text
game UI texture sheet, parchment, vellum, bronze, wax seal, stone, old map paper,
warm hand-painted material textures, no text, no letters, no symbols,
usable as frontend panel backgrounds and ornaments
```

## 下一批推荐资产

### 居民角色

目标：替换当前临时 seal 头像，让 agent 建议更像城邦居民来函。

推荐文件：

- `src/assets/art/characters/resident-practitioner.png`
- `src/assets/art/characters/resident-researcher.png`
- `src/assets/art/characters/resident-skeptic.png`
- `src/assets/art/characters/resident-executor.png`

提示词：

```text
isometric portrait token set, four advisor characters for a Greek Roman monastery academy city of thought,
practitioner with work ledger and brass tools, researcher with astrolabe and scrolls,
skeptic with dark red cloak and counterargument tablet, executor with harbor route map and task seal,
transparent background, no text, no green screen, coherent warm parchment and lapis palette,
polished game UI portrait assets
```

### 巡城官

目标：把“巡城官令”从普通诊断列表升级为角色化系统反馈。

推荐文件：

- `src/assets/art/characters/city-inspector.png`
- `src/assets/art/ornaments/edict-warning.png`
- `src/assets/art/ornaments/edict-repair.png`
- `src/assets/art/ornaments/edict-closed-loop.png`

提示词：

```text
isometric city inspector character for a Greek Roman monastery academy city of thought,
archivist and civic magistrate hybrid, holding city blueprint, wax sealed scrolls,
bronze inspection badge, transparent background, no text, no green screen,
warm parchment, lapis blue, bronze accents, polished game UI asset
```

## GitHub 展示建议

README 和 Pages 应重点展示：

- panorama 主视觉。
- 地图式交互截图。
- 建筑资产和角色资产规划。
- “地图 + 行动 + 报告”的产品闭环。
- 生成式素材进入产品前的质量控制流程。
