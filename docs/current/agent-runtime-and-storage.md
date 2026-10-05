# 真实 Agent 与 SQL 存储实现说明

## 当前已实现

- AI 网关调用已经下沉到 `src/lib/agents/gateway.ts`，统一负责 JSON 调用、usage 账簿和错误回退。
- `src/lib/agents/agentRuntime.ts` 已经接管开局议会、巡城修缮和结构化导入：
  - 开局地图 agent 生成首批观点建筑。
  - 研究者、怀疑者、实践者、执行者按角色逐条生成圆桌发言。
  - 巡城官令可以触发对应居民 agent 生成修缮来函。
  - 结构化导入 agent 可以把多行自然语言拆成候选观点建筑。
- `src/lib/agents/agentSchemas.ts` 固化了 AI 输出 schema。AI 返回必须先通过校验；不合格时会请求修复，修复仍失败才用本地模板。
- SQL 存储入口已经按 API 形状落地：
  - `GET /api/cities/current`
  - `PUT /api/cities/current`
  - `POST /api/cities/archive`
  - `GET /api/cities`
  - `GET /api/cities/:id`
  - `POST /api/cities/:id/restore`
- 前端通过 `src/lib/storage/cityStorage.ts` 使用这些接口。`localStorage` 现在是缓存、旧数据迁移来源和 API 失败兜底。

## 当前边界

- API 当前使用内存适配器 `sql-api-memory`，接口形状已经稳定，但还没有接真实 Postgres 驱动。
- 没有账号系统；当前用浏览器 client id 区分数据。开发环境里同一个 Vite server 进程内可以保存/恢复，重启服务后内存数据会丢。
- 真实多人协作还没做；`db/siwei-city-schema.sql` 已经预留事件和 owner/client 结构。
- 本地模板仍保留，用于 AI 网关失败、JSON 不合法、schema 校验失败和离线演示。

## 下一步接真实数据库

1. 选择 Postgres 提供方，配置 `DATABASE_URL`。
2. 用 `db/siwei-city-schema.sql` 初始化表。
3. 将 `api/_cityStore.ts` 从内存 Map 替换为 SQL 查询和 upsert。
4. 保持前端 `cityStorage.ts` 不变，只替换服务端驱动。
