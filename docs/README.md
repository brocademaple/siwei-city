# 思维城邦文档索引

更新时间：2026-07-05

这份索引负责把项目内部文档、文化背景资料和可复跑记录放到同一张地图里。需要理解项目时，先从这里进入；需要核对外部资料时，去 `current/reference-sources.md`；需要理解当前产品机制时，去 `current/project-orientation.md`。

## 建议阅读顺序

1. [当前接手说明](current/project-orientation.md)：最快掌握产品入口、主流程、数据结构和关键文件。
2. [图文 MVP 说明书](current/siwei-city-mvp-manual.md)：理解用户如何跑完一轮议题讨论。
3. [世界观设定](current/siwei-city-worldbuilding.md)：理解城邦、建筑、居民和远航行动的隐喻边界。
4. [居民圆桌机制设计](current/roundtable-mechanism.md)：理解多角色发言、回应对象、采纳和道路关系。
5. [文化背景研究](current/cultural-debate-background.md)：理解古希腊对话与先秦争鸣怎样转译为讨论协议。
6. [参考资料来源索引](current/reference-sources.md)：核对外部原典、文本库、引用等级和后续精引注意事项。
7. [SQL 存储设计](current/sql-storage-design.md)：理解当前会话和历史城邦如何从 localStorage 迁移到 SQL。
8. [真实 Agent 与 SQL 存储实现说明](current/agent-runtime-and-storage.md)：理解当前 AI agent runtime、schema 校验和 SQL API 适配边界。
9. [知识管理议题讨论工作流示例](current/example-case-knowledge-management-workflow.md)：用一个例题说明正式讨论前后会产出什么。

## 当前文档

- [Open-source landscape and project audit (2026-10-05)](current/open-source-review-2026-10-05.md)：英文调研、最新进度、发布证据和后续验收门；[个人飞书文档](https://my.feishu.cn/docx/H5kmdCrCVoHtjcxwWYoct6EZnQg)。

| 文档 | 作用 | 何时使用 |
| --- | --- | --- |
| [project-orientation.md](current/project-orientation.md) | 项目接手说明 | 隔一段时间回来、交给别人继续开发、快速定位代码 |
| [siwei-city-mvp-manual.md](current/siwei-city-mvp-manual.md) | 图文 MVP 说明书 | 讲清楚一轮完整讨论怎样跑通 |
| [project-status-prd.md](current/project-status-prd.md) | 当前 PRD 与进度 | 看需求状态、后续优先级和已知约束 |
| [product-engineering-brief.md](current/product-engineering-brief.md) | 产品工程简报 | 从工程视角理解产品目标和实现重点 |
| [siwei-city-worldbuilding.md](current/siwei-city-worldbuilding.md) | 世界观设定 | 写产品文案、美术 prompt、建筑职责和隐喻边界 |
| [roundtable-mechanism.md](current/roundtable-mechanism.md) | 居民圆桌机制 | 改多 agent 流程、发言结构、采纳和道路关系 |
| [cultural-debate-background.md](current/cultural-debate-background.md) | 古希腊与先秦讨论传统研究 | 设计讨论协议、角色发言方式和巡城诊断 |
| [reference-sources.md](current/reference-sources.md) | 外部资料与文档来源索引 | 核对引用、找原典、判断哪些材料可直接引用 |
| [sql-storage-design.md](current/sql-storage-design.md) | SQL 存储设计 | 规范当前会话、历史城邦、观点、道路、圆桌和卷轴的数据持久化 |
| [agent-runtime-and-storage.md](current/agent-runtime-and-storage.md) | 真实 Agent 与 SQL 存储实现说明 | 查看 agent runtime、schema 校验、API 存储和当前边界 |
| [example-case-knowledge-management-workflow.md](current/example-case-knowledge-management-workflow.md) | 知识管理议题讨论工作流示例 | 用一个例题说明系统最终应该产出什么 |
| [art-direction.md](current/art-direction.md) | 美术方向 | 生成或调整视觉资产、统一场景和角色风格 |
| [version-history.md](current/version-history.md) | 版本历史 | 看 1.0 到 2.0 的变化和保留边界 |

## 规划文档

| 文档 | 作用 |
| --- | --- |
| [planning/product-mvp-decisions.md](planning/product-mvp-decisions.md) | MVP 决策、范围和后续讨论方向 |
| [planning/art-character-plan.md](planning/art-character-plan.md) | 居民角色、美术方向和长期角色扩展 |

## 可复跑记录

| 文档 | 作用 |
| --- | --- |
| [trace-runs/README.md](trace-runs/README.md) | 思维链路留痕说明和复跑命令 |
| [trace-runs/latest-two-chain-runs.md](trace-runs/latest-two-chain-runs.md) | 当前最新两条公开链路记录 |
| [trace-runs/latest-two-chain-runs.json](trace-runs/latest-two-chain-runs.json) | 当前最新两条链路的结构化数据 |

复跑命令：

```bash
npm run trace:thinking
```

## 1.0 归档

| 文档 | 作用 |
| --- | --- |
| [archive-v1/product-narrative.md](archive-v1/product-narrative.md) | 旧版产品叙事 |
| [archive-v1/mvp-flow-and-art-direction.md](archive-v1/mvp-flow-and-art-direction.md) | 旧版 MVP 流程和美术方向 |
| [archive-v1/case-study.md](archive-v1/case-study.md) | 旧版 case study |
| [archive-v1/upgrade-test-report.md](archive-v1/upgrade-test-report.md) | 旧版升级测试报告 |

1.0 文档只保留历史和素材价值。当前产品判断以 `docs/current/` 为准。

## 资料维护规则

- 外部原典、文本库、二手资料统一登记到 [current/reference-sources.md](current/reference-sources.md)。
- 世界观和机制文档可以引用外部资料的思想结构，但不要在正文里堆长引文。
- 如果要在 README、官网、报告或公开材料中逐字引用古文或译文，先回到来源索引核对可引用等级。
- 墨子相关章节本轮只作为方向性资料；需要精确引用《非攻》《公输》《小取》时，应先用稳定底本复核。
- 当前机制、代码路径和运行命令以当前仓库为准；旧版 archive 不能覆盖 current 文档。
