# 思维城邦 Siwei City

[English](README.md) | [简体中文](README.zh-CN.md)

思维城邦是一个把模糊议题转化为结构化思维地图的前端 MVP。它把观点做成建筑，把论证关系做成道路，把多角色建议做成居民来函，把结构诊断做成巡城官令，帮助用户把一次复杂思考收束成三类产物：一张地图、一个下一步行动、一份可导出的报告材料。

![思维城邦主视觉](src/assets/art/hero-city-panorama.png)

## 在线演示

- 2.0 默认入口：<https://brocademaple.github.io/siwei-city/>
- 2.0 显式路径：<https://brocademaple.github.io/siwei-city/v2/>
- 1.0 迭代日志：<https://brocademaple.github.io/siwei-city/v1/>

1.0 页面只在 GitHub Pages 中保留，用于记录早期美术资产和地图编排思路。

## 为什么做这个

AI 时代，信息生成和资料整理越来越便宜。个人真正需要沉淀的是判断结构：

- 问题如何演化。
- 判断依赖哪些证据。
- 哪些反驳还没处理。
- 哪个行动能带回新证据。
- 一轮讨论如何转化成可复用报告。

思维城邦用空间化界面把这些结构显性化。它关心的不是收藏更多 AI 答案，而是帮助用户维护自己的问题、假设、证据、反驳、行动和报告材料。

默认测试议题：

> AI 时代，个人应该如何重建自己的知识管理系统？

## 最短演示路径

1. 打开 2.0 演示。
2. 保留默认议题，或输入一句自己的模糊议题。
3. 进入冲突议会。
4. 召开完整议会。
5. 看四位居民如何把议题拆成问题、证据、反驳和行动。
6. 打开巡城官令，查看结构缺口。
7. 打开卷轴馆，复制或下载报告材料。
8. 刷新页面，确认城邦能从浏览器本地会话恢复。
9. 点击新开一轮，确认历史城邦仍然保留。

## 当前能力

### 思维工作台

- Vite + React + TypeScript 单页应用。
- 立题台支持输入议题，并选择探索、决策、行动三种讨论模式。
- 开局推演会生成问题、假设、证据缺口、反驳和行动。
- 新手指引和常驻 MVP 任务线帮助用户跑通第一轮。

### 冲突议会与居民

- 冲突议会是当前 MVP 的主交互空间。
- 实践者、研究者、怀疑者、执行者提供不同职责的居民建议。
- 居民来函先预览，用户采纳后才入城。
- 居民图鉴展示角色人设、prompt 摘要和输出结构。

### 城邦地图与道路

- panorama 城邦地图承载观点建筑、语义城区、道路关系和地图内弹窗。
- 建筑工坊支持手动新增五类观点节点。
- 建筑之间可以建立支持、冲突、依赖、延伸、回流五类道路。
- 居民席位、巡城官塔、卷轴馆以服务建筑的形式嵌入地图。

### 巡城与卷轴

- 巡城官令诊断缺证据假设、未处理反驳、孤立观点和未闭环行动。
- 卷轴馆支持 Markdown 导出：报告、行动计划、圆桌记录、巡城修缮记录。
- 案例馆藏内置 4 个高质量演示议题，可一键载入城邦。
- 已公开两条完整思维链路留痕，方便观察一轮讨论如何沉淀。

### 持久化与部署

- 当前会话会保存到浏览器 localStorage，刷新或重新打开同一浏览器时恢复。
- 新开一轮会清空当前轮次，回到干净起点。
- 历史城邦保存为本地项目档案，新开一轮不会清掉历史卷轴。
- 自有美术资产已接入，包括城市主视觉、建筑、城区、纹理、场景和居民角色。
- GitHub Actions 自动构建并发布到 GitHub Pages。

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

核心设计原则：系统可以建议、巡检和整理，但最终判断权始终留给用户。居民来函只预览变化，巡城官令只提示问题，地图是否改变由用户决定。

## 快速运行

```bash
npm install
npm run dev
```

打开：

```text
http://127.0.0.1:5173/
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

生成两条完整思维链路留痕：

```bash
npm run trace:thinking
```

## 验证命令

运行发布兜底 smoke test：

```bash
npm run test:smoke
```

验证 GitHub Pages 展厅和版本路径构建：

```bash
npm run build:pages
```

检查生成式美术资产是否残留明显绿幕像素：

```bash
npm run check:assets
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
MIMO_INPUT_PRICE_CNY_PER_1K=0
MIMO_OUTPUT_PRICE_CNY_PER_1K=0
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
MIMO_INPUT_PRICE_CNY_PER_1K=0
MIMO_OUTPUT_PRICE_CNY_PER_1K=0
VITE_MIMO_PROXY_URL=/api/mimo/chat
VITE_MIMO_INPUT_PRICE_CNY_PER_1K=0
VITE_MIMO_OUTPUT_PRICE_CNY_PER_1K=0
```

最小本地验证步骤：

```bash
npm run dev
```

另开一个终端：

```bash
npm run verify:mimo
```

如果 Vite 自动切到了其他端口，把终端里显示的地址传给脚本：

```bash
npm run verify:mimo -- --url=http://127.0.0.1:5174/api/mimo/chat
```

验证脚本会打本地 `/api/mimo/chat` 代理，确认三件事：

- 真实 Mimo 响应包含可解析的 `choices[0].message.content` JSON。
- `usage.prompt_tokens`、`usage.completion_tokens`、`usage.total_tokens` 完整返回。
- 本地校验错误返回稳定结构：`error.type/message/status/retryable`。

如果要验证已部署的 Vercel function：

```bash
npm run verify:mimo -- --url=https://你的域名/api/mimo/chat
```

如果代理未配置或上游不可用，产品会自动回退到本地模板，并在城邦账簿中显示可操作的回退原因。若 Mimo 没有返回完整 usage，产品仍会展示 AI 内容，但账簿会标记 `usage 估算`。

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
  current/                 # 2.0 当前说明书、PRD、世界观、机制说明
  archive-v1/              # 1.0 旧版产品、美术和测试材料归档
  planning/                # 后续建筑、居民日常 talk、长期 roadmap
  trace-runs/              # 两条思维链路留痕
scripts/
  slice-assets.mjs
  check-green-artifacts.mjs
  optimize-art-assets.mjs
  build-pages-versions.mjs
  smoke-test.mjs
.github/workflows/
  deploy-pages.yml         # GitHub Pages 自动部署
```

## 项目阅读路径

- 图文 MVP 说明书：[docs/current/siwei-city-mvp-manual.md](docs/current/siwei-city-mvp-manual.md)
- 当前进度与 PRD：[docs/current/project-status-prd.md](docs/current/project-status-prd.md)
- 世界观设定：[docs/current/siwei-city-worldbuilding.md](docs/current/siwei-city-worldbuilding.md)
- 居民圆桌机制设计：[docs/current/roundtable-mechanism.md](docs/current/roundtable-mechanism.md)
- 版本历史：[docs/current/version-history.md](docs/current/version-history.md)
- 美术方向：[docs/current/art-direction.md](docs/current/art-direction.md)
- 接手说明：[docs/current/project-orientation.md](docs/current/project-orientation.md)
- 1.0 旧版材料归档：[docs/archive-v1/](docs/archive-v1/)
- 后续规划与候选想法：[docs/planning/](docs/planning/)
- 两条思维链路留痕：[docs/trace-runs/README.md](docs/trace-runs/README.md)

## 下一步规划

### P0：真实 Mimo 联调

已补可复跑联调路径：`npm run verify:mimo` 会校验 OpenAI-compatible content、usage 返回、错误结构和费用估算。

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
- 当前会话和历史城邦先存在浏览器 localStorage，账号同步后续再做。
