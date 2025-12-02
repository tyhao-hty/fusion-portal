### `GET /timeline` API 契约（草案）
| 项目 | 说明 |
|------|------|
| 方法 | `GET` |
| 路径 | `/api/timeline` |
| 查询参数 | `page` (默认 1), `limit`/`pageSize` (默认 8, 上限 50), `order`/`sort` (`asc`/`desc`), `year`（单年/文本匹配），`yearFrom`/`yearTo`（区间，需 yearFrom <= yearTo），`q`/`search`（关键词模糊匹配 title/description） |
| 成功响应 | `200 OK`，主体：`{ data: TimelineEvent[], meta: { page, limit, pageSize, total, totalPages, order, hasNext, hasMore } }` |
| 失败响应 | `400 Bad Request`（参数非法），`500 Internal Server Error`（数据库异常）；统一返回 `{ error: { code, message }, message }` |
| 认证 | 阶段一为公共只读，不需认证；后台写操作由 T002 负责 (`POST/PUT/DELETE /timeline`) |
| 缓存建议 | API 可加 `Cache-Control: max-age=60`；前端配合 SWR/RTK Query 带有 60 秒缓存 |
