# 思维城邦 PRD 开发可用性差距审查

日期：2026-07-10
审查对象：`docs/current/siwei-city-prd-2026-07-09.xml`
当前个人飞书文档：https://my.feishu.cn/docx/ZJibdjskaojKC3x2gMcc9uZJnGz

## 1. 本次使用的 PRD / Spec Skill

| Skill | 状态 | 用途 | 结论 |
|---|---:|---|---|
| `prd-development` | 已安装到 `~/.agents/skills/prd-development` | 传统 PRD 工作流：问题、用户、战略、方案、指标、用户故事、依赖风险、开放问题 | 作为本次主审查框架 |
| `to-spec` | 已安装到 `~/.agents/skills/to-spec` | 把上下文合成为工程规格：问题、方案、用户故事、实现决策、测试决策、范围外 | 用于检查工程交接是否足够 |
| `lark-structured-docs` | 已存在 | 飞书结构化文档风格：表格、图表、分栏、前置结论 | 当前 PRD 已较好满足这种风格 |
| `github/awesome-copilot@prd` | 搜索到，未安装成功 | GitHub PRD skill | 安装过程 clone 超时，已中止 |

说明：新安装的 skill 已落盘，但通常需要重启 Codex 才会出现在全局 Skills 列表；本次已直接读取本地 `SKILL.md` 用于审查。

## 2. 总体判断

当前 PRD 更像“基于已实现情况整理的产品/工程现状说明”，对接手项目、理解模块边界、知道下一步工程方向很有帮助。

如果要成为传统意义上可指导开发排期、评审、验收的 PRD，还缺三类东西：

1. **产品判断依据不足**：用户问题、用户画像、场景证据、为什么现在做这些功能，都还偏主观判断。
2. **需求可执行性不足**：功能需求有 P0/P1/P2，但没有拆成可排期的 epic/story、状态流、异常场景、逐条验收标准。
3. **上线成功口径不足**：当前有验证命令，但缺产品成功指标、埋点、guardrail、版本里程碑、owner 和开放问题截止时间。

## 3. 按传统 PRD 模板的差距表

| 标准章节 | 当前 PRD 状态 | 差距 | 对开发的影响 | 建议补齐 |
|---|---|---|---|---|
| 文档信息与变更记录 | 缺失 | 没有 author、reviewer、版本、更新时间、审批状态 | 后续多人协作时不知道哪版可执行 | 增加文档信息、版本历史、review owner |
| Executive Summary | 部分具备 | 开头 callout 有定位和结论，但不是“为谁解决什么问题、带来什么量化影响”的一句话 | 评审时难快速判断目标是否收敛 | 改成“为 X 用户解决 Y 问题，带来 Z 指标变化” |
| Problem Statement | 部分具备 | 有产品定位，但缺“谁有这个痛点、痛在哪里、证据是什么” | 容易把实现当需求，后续功能优先级缺依据 | 加“用户问题 + 证据 + 当前替代方案 + 痛点强度” |
| Target Users & Personas | 部分具备 | 有用户类型表，但没有 primary persona、JTBD、当前行为、使用频率 | 工程和设计难判断默认路径、空状态、复杂度取舍 | 补 1 个主 persona、2 个次级 persona、JTBD |
| Strategic Context | 缺失 | 缺为什么现在做、和个人 side project 目标/商业化/作品集目标的关系 | Roadmap 容易按兴趣扩散 | 增加 why now、目标约束、竞品/替代品 |
| Solution Overview | 已具备 | 主流程图和核心原则清晰 | 这部分可保留 | 增加 release slice：MVP、Beta、后续 |
| Success Metrics | 缺失 | 没有产品指标、行为指标、质量指标、guardrail | 上线后无法判断“做成了没有” | 定义北极星、激活指标、产出率、留存/复访、质量 guardrail |
| User Stories & Requirements | 部分具备 | 功能需求表有用户故事和验收口径，但粒度仍偏大，缺 Given/When/Then、异常和边界 | 开发可做，但测试和排期会反复追问 | 按 epic 拆 story，每条 3-6 条 AC |
| Data / API Requirements | 已具备 | 数据对象和 API 形状比较清楚，但缺字段级约束、错误码、权限、迁移策略 | 后端实现时仍需补 spec | 增加字段 required/optional、错误状态、数据生命周期 |
| Non-functional Requirements | 部分具备 | 有发布/验证，但缺性能、可访问性、浏览器兼容、隐私、安全 | 上线质量风险靠开发临时判断 | 增加 NFR 表：性能、容错、安全、隐私、可用性 |
| Dependencies & Risks | 部分具备 | 有当前风险，但缺 owner、触发条件、缓解动作、Cagan 四风险分类 | 风险不会自然收敛 | 改成风险登记表：value/usability/feasibility/viability |
| Out of Scope | 部分具备 | “产品边界”有范围，但没有“本 release 不做什么以及原因” | 容易 scope creep | 拆出独立 Out of Scope |
| Open Questions | 部分具备 | 有待确认问题，但缺 owner、deadline、状态 | 无法变成行动项 | 加 owner/deadline/status |
| Testing Decisions | 部分具备 | 有命令，但缺测试策略和测试分层 | QA/开发不知道哪些行为必须锁住 | 增加单元、集成、E2E、人工验收矩阵 |
| Implementation Decisions | 部分具备 | 已列模块和证据路径，但缺“已定方案 vs 待定方案” | 后续重构或接手可能误改核心取舍 | 增加实现决策日志 |

## 4. 最影响开发指导的 P0 缺口

### P0-1：缺产品成功指标

当前 PRD 只能说明“系统能跑什么”，还不能说明“怎样算产品做对了”。

建议补充：

| 指标层级 | 建议指标 | 当前基线 | 目标 | 备注 |
|---|---|---:|---:|---|
| 北极星 | 每轮议题最终产出的可采纳观点/行动数 | 待测 | 待定 | 衡量是否沉淀判断结构 |
| 激活 | 新用户完成一次完整议会并打开卷轴报告的比例 | 待测 | 待定 | MVP 核心闭环 |
| 质量 | 用户采纳居民发言的比例 | 待测 | 待定 | 衡量 agent 建议质量 |
| 复访 | 7 日内恢复历史城邦或继续编辑的比例 | 待测 | 待定 | 衡量“城市可持续修建” |
| Guardrail | AI 失败后本地 fallback 比例、报告生成失败率 | 待测 | 低于阈值 | 避免只看产出不看稳定性 |

### P0-2：缺用户画像和场景证据

当前写了“个人创作者 / 产品经理或独立开发者 / 研究者”，但还没有主用户。

建议先定一个主 persona：

| Persona | 角色 | 场景 | 主要痛点 | 成功状态 |
|---|---|---|---|---|
| 独立产品创作者 | 正在做 side project 的产品/开发混合角色 | 把模糊产品想法变成可执行路线图 | 想法多、证据散、下一步行动不清晰 | 一轮讨论后得到结构地图、3 个可验证行动、可分享报告 |

### P0-3：需求没有拆到可开发 story

“一键完整讨论”“居民来函预览与采纳”“巡城官令”是能力名，不是完整开发任务。

建议每个 P0 拆成 story + AC，例如：

```gherkin
Story: 用户召开完整议会
As a 独立产品创作者
I want 一键生成初始地图和四类居民发言
So that 我可以快速从模糊议题进入可审阅的判断结构

Acceptance Criteria:
- Given 用户输入一个议题 When 点击“召开完整议会” Then 系统生成初始观点、道路和四类居民发言
- Given AI 网关不可用 When 用户召开议会 Then 系统使用本地 fallback 并在 usage 账簿中标记来源
- Given 议会生成完成 When 页面切换 Then 用户进入议会场景并能看到居民席位
- Given 任意生成步骤失败 When UI 展示结果 Then 用户能看到错误提示和可重试入口
```

### P0-4：缺状态机和异常流

当前主流程是 happy path。开发还需要知道 loading、partial success、retry、fallback、empty state、restore conflict 等状态。

建议补一张状态表：

| 流程 | 状态 | UI 行为 | 数据行为 | 错误处理 |
|---|---|---|---|---|
| 召开议会 | idle/loading/success/partial/error | 按钮禁用、进度、结果区 | 写 turns/ideas/routes | retry + fallback |
| 采纳来函 | preview/accepting/accepted/rejected/error | 采纳前不改图 | accepted=true 后入城 | 回滚新增节点 |
| 恢复历史 | loading/found/not_found/conflict/error | 显示恢复提示 | 替换当前 snapshot | 保留当前草稿提示 |

### P0-5：缺工程 owner / 里程碑 / 决策状态

当前路线图适合方向判断，但不够排期。

建议把路线图升级为：

| Milestone | 范围 | Owner | 入口/文件 | 验收 | 截止 |
|---|---|---|---|---|---|
| M0 演示稳定 | dev server、smoke、fallback | TBD | `scripts/*`, `api/mimo/chat.ts` | smoke 通过 | TBD |
| M1 持久化 | Postgres 驱动、迁移、恢复 | TBD | `api/_cityStore.ts`, `db/*` | 重启不丢数据 | TBD |
| M2 agent 质量 | 引用上下文、道路解释 | TBD | `src/lib/agents/*` | 报告能解释关系 | TBD |

## 5. 建议的 PRD 改版结构

建议下一版不是重写，而是在当前 PRD 上补强，结构如下：

1. 文档信息：author、reviewer、版本、状态、更新记录
2. Executive Summary：一句话说明用户、问题、方案、影响
3. Problem Statement：用户痛点、证据、当前替代方案
4. Target Users & JTBD：主 persona、次 persona、使用场景
5. Strategic Context：为什么现在做、目标、竞品/替代品
6. Solution Overview：保留当前主流程图和核心原则
7. Release Scope：MVP / Beta / Later
8. Success Metrics：primary、secondary、guardrail、埋点
9. Requirements：Epic -> Story -> Acceptance Criteria
10. Data & API Spec：字段约束、错误码、权限、迁移
11. Non-functional Requirements：性能、稳定性、隐私、安全、兼容性
12. Testing & Acceptance Plan：自动化、手工验收、发布门禁
13. Dependencies, Risks, Open Questions：owner、deadline、status
14. Appendix：现有实现证据路径、命令、参考文档

## 6. 推荐下一步

优先做一个“PRD v2 补强版”，不要先改产品实现。

最小补强范围：

1. 补 `Problem Statement + Persona + Success Metrics`，先把产品判断站稳。
2. 把 6 个 P0/P1 功能拆成 `Epic / Story / Acceptance Criteria`。
3. 增加状态机、异常流、测试矩阵、owner/deadline。
4. 再同步更新个人飞书文档。

这样改完之后，PRD 就能从“现状说明”升级成“开发指导文档”。
