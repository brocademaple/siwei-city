# 思维城邦 Siwei City

![思维城邦主视觉](src/assets/art/hero-city-panorama.png)

思维城邦是一个把模糊议题转化为结构化思维地图的前端 MVP。它把观点做成建筑，把论证关系做成道路，把多角色建议做成居民来函，把结构诊断做成巡城官令，帮助用户把一次复杂思考收束成三类产物：一张地图、一个下一步行动、一份可导出的报告材料。

在线演示：<https://brocademaple.github.io/siwei-city/>

## 为什么做这个

AI 时代，信息生成和资料整理越来越便宜，但个人真正需要沉淀的并不是更多答案，而是：

- 问题如何演化。
- 判断依赖哪些证据。
- 哪些反驳还没处理。
- 哪个行动能带回新证据。
- 一轮讨论如何转化成可复用报告。

思维城邦用空间化界面把这些结构显性化，让用户不是“收藏 AI 答案”，而是在维护自己的判断系统。

默认测试议题：

> AI 时代，个人应该如何重建自己的知识管理系统？

## 当前完成度

这个仓库已经是可运行、可部署的前端原型：

- Vite + React + TypeScript 单页应用。
- panorama 城邦地图、观点建筑、道路关系和地图内弹窗。
- 立题台：输入模糊议题后生成问题、假设、证据缺口、反驳和行动。
- 建筑工坊：手动新增五类观点节点。
- 角色席位：实践者、研究者、怀疑者、执行者提供模拟 agent 建议；点击只预览，采纳后才入城。
- 巡城官令：诊断缺证据假设、未处理反驳、孤立观点和未闭环行动。
- 三种固定讨论模式：探索、决策、行动。
- 城邦账簿：展示本轮是否使用 AI、调用次数、token 和估算费用。
- 地图内服务建筑：居民席位、巡城官塔、卷轴馆。
- 卷轴馆 Markdown 导出：报告、行动计划、圆桌记录、巡城修缮记录。
- 卷轴馆案例馆藏：内置 4 个高质量演示议题，可一键载入城邦。
- 历史城邦：把不同议题保存为本地项目档案，支持回看。
- 新手指引和常驻 MVP 任务线。
- 自有美术资产接入，包含城市主视觉、建筑、城区和纹理。
- GitHub Pages 自动部署配置。

## 产品闭环

```text
输入材料
  -> 开局推演
  -> 观点建筑
  -> 居民建议
  -> 采纳入城
  -> 铺设道路
  -> 巡城官令
  -> 下一步行动 / 报告材料
```

核心设计原则：系统可以建议，但不自动替用户改地图。居民来函只预览，巡城官令只提示问题，最终判断权始终留给用户。

## 前端与设计亮点

- **空间化认知界面**：不做普通列表或卡片墙，而是用城邦地图表达推理结构。
- **地图内操作闭环**：点击建筑即可查看铭文、设置道路起点、建立关系。
- **角色化 AI 入口**：agent 不是聊天框，而是有职责分工的居民席位。
- **可解释巡检规则**：诊断逻辑独立在 `src/lib/review.ts`，后续可直接扩展测试。
- **生成式美术工程化**：正式素材集中在 `src/assets/art/`，并提供绿幕残留检测。
- **可部署交付**：GitHub Actions 自动构建并发布到 GitHub Pages。

## 美术资产

当前版本已接入三类正式资产：

| 类型 | 目录 | 用途 |
| --- | --- | --- |
| 城邦主视觉 | `src/assets/art/hero-city-panorama.png` | 应用主工作区背景和产品介绍第一视觉 |
| 建筑资产 | `src/assets/art/buildings/` | 地图上的观点节点 |
| 城区资产 | `src/assets/art/districts/` | 问题、证据、假设、冲突、行动等语义区域 |
| 纹理资产 | `src/assets/art/textures/` | 面板、印章、羊皮纸、青铜和地图质感 |

更多资产说明和提示词见：[docs/art-direction.md](docs/art-direction.md)。

## 项目阅读路径

- 图文 MVP 说明书：[docs/siwei-city-mvp-manual.md](docs/siwei-city-mvp-manual.md)
- 重新接手说明：[docs/project-orientation.md](docs/project-orientation.md)
- 产品叙事页：[docs/product-narrative.md](docs/product-narrative.md)
- 居民圆桌机制设计：[docs/roundtable-mechanism.md](docs/roundtable-mechanism.md)
- 面试展示 Case Study：[docs/case-study.md](docs/case-study.md)
- 升级版测试报告：[docs/upgrade-test-report.md](docs/upgrade-test-report.md)
- 产品与工程说明：[docs/product-engineering-brief.md](docs/product-engineering-brief.md)
- 当前进度与 PRD：[docs/project-status-prd.md](docs/project-status-prd.md)
- MVP 产品决策记录：[docs/product-mvp-decisions.md](docs/product-mvp-decisions.md)
- 流程与美术规划：[docs/mvp-flow-and-art-direction.md](docs/mvp-flow-and-art-direction.md)
- 美术资产与提示词：[docs/art-direction.md](docs/art-direction.md)
- 两条思维链路留痕：[docs/trace-runs/README.md](docs/trace-runs/README.md)

## 快速运行

```bash
npm install
npm run dev
```

如果 PowerShell 拦截 `npm.ps1`，改用：

```bash
npm.cmd install
npm.cmd run dev
```

生产构建：

```bash
npm run build
```

GitHub Pages 构建：

```bash
npm run build:pages
```

素材检测：

```bash
npm run check:assets
```

生成两条完整思维链路留痕：

```bash
npm run trace:thinking
```

## Mimo API 代理

前端不会保存 Mimo API Key。真实 AI 推演通过 Vercel Serverless Function 代理：

```text
api/mimo/chat.ts
```

Vercel 环境变量：

```text
MIMO_API_KEY=你的 Mimo Key
MIMO_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
MIMO_MODEL=mimo-v2.5-pro
```

前端环境变量：

```text
VITE_MIMO_PROXY_URL=/api/mimo/chat
VITE_MIMO_INPUT_PRICE_CNY_PER_1K=0
VITE_MIMO_OUTPUT_PRICE_CNY_PER_1K=0
```

本地开发可以直接在 `.env.local` 中配置：

```text
MIMO_API_KEY=你的完整专属 API key
MIMO_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
MIMO_MODEL=mimo-v2.5-pro
VITE_MIMO_PROXY_URL=/api/mimo/chat
VITE_MIMO_INPUT_PRICE_CNY_PER_1K=0
VITE_MIMO_OUTPUT_PRICE_CNY_PER_1K=0
```

如果代理未配置，产品会自动回退到本地模板，并在“城邦账簿”中显示回退原因。

## 目录结构

```text
src/
  App.tsx                  # 应用状态和主流程编排
  components/              # 地图、弹窗、左侧面板、服务抽屉、卷轴馆、新手指引
  data/seed.ts             # 默认议题、城区、初始观点、早期角色建议
  lib/                     # 开局推演、讨论模式、AI 代理调用、归档、样例馆藏、巡检
  assets/art/              # 前端正式引用的美术资产
  assets/generated/        # 生成母图与切片记录
docs/
  product-narrative.md     # 一页产品叙事
  roundtable-mechanism.md  # 多 agent 圆桌机制
  case-study.md            # 面试展示 Case Study
  upgrade-test-report.md   # 升级版体验测试报告
  product-engineering-brief.md # 产品与工程说明
  project-status-prd.md    # 当前进度与 PRD 概览
  art-direction.md         # 美术资产、提示词和质量规则
scripts/
  slice-assets.mjs
  check-green-artifacts.mjs
.github/workflows/
  deploy-pages.yml         # GitHub Pages 自动部署
```

## 下一步规划

### P0：真实 Mimo 联调

用真实 Mimo API 校验 OpenAI-compatible 协议、usage 返回、错误结构和费用估算。

### P1：多轮居民互相引用

让每位居民必须引用上一轮发言或某座建筑，再生成回应和建议道路。

### P2：道路解释

给每条道路增加“为什么成立”的解释，提升推理透明度和报告质量。

### P3：专属服务建筑资产

为居民席位、巡城官塔、卷轴馆、蜡板任务卡生成更贴合世界观的新美术素材。

## 关键假设

- 首版先验证 Web 桌面端交互闭环，不做移动端和多人协作。
- 如果未配置 Mimo/Vercel，产品会清楚回退到本地模板。
- 用户保留最终判断权，系统只辅助发现结构和提出建议。
- 历史城邦先存在浏览器 localStorage，账号同步后续再做。
