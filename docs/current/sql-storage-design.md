# 思维城邦 SQL 存储设计

更新时间：2026-07-08

## 目标

当前项目把当前会话和历史城邦放在浏览器 `localStorage`。这适合 MVP 演示，但不适合长期保存、跨设备同步、审计和后续账号系统。

下一步把存储规范为 SQL 模型，默认采用 PostgreSQL 兼容数据库。前端仍可保留 `localStorage`，但它只承担本地草稿、离线兜底和首次迁移缓存，不再作为正式数据源。

## 存储原则

- SQL 是正式数据源。
- `localStorage` 是本机缓存和未登录兜底。
- 一轮讨论叫一座 `city`，当前会话和历史城邦都是同一种实体，只是 `status` 不同。
- 地图上的观点、道路、圆桌发言、巡城官令和卷轴文档都要能单独查询。
- 同时保存完整 JSON 快照，方便恢复旧版本数据和调试迁移问题。
- AI 生成内容和本地模板内容都要记录 `source`，不能混成一类。

## 数据对象

| 当前前端对象 | SQL 表 | 说明 |
| --- | --- | --- |
| 当前会话 | `city_profiles` + `city_snapshots` | `status = current` |
| 历史城邦 | `city_profiles` + `city_snapshots` | `status = archived` |
| `IdeaNode` | `idea_nodes` | 地图上的观点建筑 |
| `Route` | `routes` | 建筑之间的道路关系 |
| `RoundtableTurn` | `roundtable_turns` | 居民圆桌发言，包括协议和论证动作 |
| `ReviewFinding` | `review_findings` | 巡城官令和修缮建议 |
| `ArchiveDoc` | `archive_docs` | 报告、行动计划、圆桌记录和修缮记录 |
| 浏览器实例 | `city_clients` | 未登录阶段用本地 client id 识别设备 |
| 同步操作 | `city_sync_events` | 用于幂等写入、排查同步问题 |

可执行 schema 在：

```text
db/siwei-city-schema.sql
```

## 当前会话和历史城邦的关系

不要再把“当前会话”和“历史城邦”设计成两套存储。

统一规则：

- 用户正在编辑的城邦：`city_profiles.status = current`
- 用户点击“封存当前城邦”：把当前城邦状态改为 `archived`，并写入一条 `manual_archive` snapshot。
- 用户点击“新开一轮”：创建新的 `current` city；旧 city 是否归档由用户决定。
- 用户打开历史城邦：读取 archived city 的规范化数据；如果要继续编辑，应复制为新的 current city，避免直接污染归档版本。

## API 形状

第一版后端 API 可以保持很薄：

```text
GET    /api/cities/current
PUT    /api/cities/current
POST   /api/cities/archive
GET    /api/cities
GET    /api/cities/:id
POST   /api/cities/:id/restore
```

推荐请求体使用当前前端接近的形状：

```json
{
  "city": {
    "id": "uuid-or-client-temp-id",
    "topic": "AI 时代，个人应该如何重建自己的知识管理系统？",
    "mode": "explore",
    "status": "current"
  },
  "ideas": [],
  "routes": [],
  "turns": [],
  "findings": [],
  "archiveDocs": [],
  "snapshot": {}
}
```

后端负责把数组拆进规范化表，同时把完整 `snapshot` 写入 `city_snapshots`。

## localStorage 迁移

当前有两个 key：

| key | 迁移目标 |
| --- | --- |
| `siwei-city-session-v2` | 一条 `current` city |
| `siwei-city-history-v1` | 多条 `archived` city |

迁移策略：

1. 应用启动时先请求 `GET /api/cities/current`。
2. 如果 SQL 里没有 current city，再检查 `localStorage`。
3. 如果本地有旧数据，展示“发现本地城邦，是否迁移到云端/数据库”。
4. 用户确认后调用 `PUT /api/cities/current`。
5. 迁移成功后保留本地缓存，但标记 `syncedAt`，避免重复导入。

## 写入时机

第一版不需要每个输入字符都写 SQL。

建议写入点：

- 开局推演完成。
- 用户采纳居民发言。
- 用户新增观点建筑。
- 用户铺设道路。
- 用户点击封存当前城邦。
- 用户打开历史城邦并复制为新城邦。

前端可以继续用 React state 保持即时体验，后台用 debounce 或显式动作同步。

## 边界

- 第一版不做多人同时编辑。
- 第一版不做复杂权限，只预留 `owner_id`。
- 第一版不强依赖登录；没有账号时用 `local_client_id` 保存。
- 第一版不要求完全离线同步，只保证本机缓存和服务端写入不互相覆盖。
- AI 调用日志不进入这些表；这里记录的是产品状态，不是模型调用审计。

## 验收标准

- 新建一轮讨论后，SQL 中能查询到 city、ideas、routes、turns。
- 采纳发言后，`roundtable_turns.accepted = true`，并新增对应 `idea_nodes` 和 `routes`。
- 巡城结果能写入 `review_findings`，包含 `gap_type`、`suggested_protocol`、`suggested_move`。
- 卷轴报告能写入 `archive_docs`。
- 刷新页面优先从 SQL 恢复；SQL 不可用时从本地缓存恢复。
- 历史城邦可以按更新时间列表查询并恢复。
