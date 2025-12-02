# API 文档 – `/api/timeline`

> 状态：稳定（v1）  
> 最后更新：2025-11-21  
> 维护人：后端团队（Express + Prisma）

---

## 1. 概述
时间线接口提供核聚变发展历程的分页数据，供新版 `/site/history` 页面使用。数据源来自 `TimelineEvent` 表（由 `frontend/public/data/timeline.json` 迁移而来），支持按年份区间、关键词筛选与自定义排序。

- **基础路径**：`/api/timeline`
- **鉴权**：无（公开只读）
- **返回格式**：`application/json`

---

## 2. 查询参数
| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` | number | `1` | 页码，从 1 开始。 |
| `limit`/`pageSize` | number | `8` | 每页条数，最大 `50`。 |
| `order`/`sort` | string | `desc` | 排序方向，`asc` 或 `desc`。 |
| `year` | string | — | 年份筛选：纯数字时按 `yearValue` 精确匹配；非数字时模糊匹配 `yearLabel`（例如“1970年代”）。 |
| `yearFrom` | number | — | 起始年份（含）；与 `yearTo` 组合使用时必须 `yearFrom <= yearTo`。 |
| `yearTo` | number | — | 结束年份（含）。 |
| `q`/`search` | string | — | 关键词，模糊匹配 `title`/`description`。 |

> 当 `limit` 超过 50 时将被截断；小于 1 时回退到 1。  
> 未提供或提供非法值时使用默认值。

---

## 3. 成功响应
```json
{
  "data": [
    {
      "id": 1,
      "slug": "timeline-1920s",
      "yearLabel": "1920年代",
      "yearValue": 1920,
      "title": "理论基础奠定",
      "description": "亚瑟·爱丁顿提出恒星能量来源于核聚变反应。",
      "sortOrder": 120,
      "createdAt": "2025-05-01T10:00:00.000Z",
      "updatedAt": "2025-05-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 8,
    "pageSize": 8,
    "total": 120,
    "totalPages": 15,
    "order": "desc",
    "hasNext": true,
    "hasMore": true
  }
}
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `data[i].slug` | 与原 JSON `id` 对应，唯一标识。 |
| `data[i].yearLabel` / `yearValue` | 展示用年份与数值化年份（若无法解析则为 `null`）。 |
| `data[i].sortOrder` | 排序权重（越大越靠前），来源于 JSON 索引。 |
| `meta.hasNext` / `hasMore` | 是否存在下一页。 |

---

## 4. 错误响应
| 状态码 | 场景 | 示例 |
| --- | --- | --- |
| `400` | 查询参数非法（如 `yearFrom > yearTo`） | `{ "message": "Invalid year range: yearFrom must be less than or equal to yearTo", "error": { "code": 400, "message": "Bad Request" } }` |
| `500` | 服务器内部错误（Prisma/数据库异常） | `{ "message": "Internal Server Error", "error": { "code": 500, "message": "Internal Server Error" } }` |

> 所有错误均经过全局 `errorHandler` 处理，保持 `message` 与 `error.code`、`error.message` 字段一致。

---

## 5. 示例请求
```bash
curl "http://localhost:4000/api/timeline?page=2&limit=6&order=asc"

curl "http://localhost:4000/api/timeline?year=ITER"
```

---

## 6. 监控与性能
- **关键指标**：HTTP 成功率、P95 延迟（目标 < 400 ms）、分页 `hasNext` 正确率。
- **日志对齐**：部署后运行 `npm run seed:timeline -- --dry-run` 生成迁移摘要，确保数据库记录与 JSON 同步。
- **常见问题**：
  - 返回空列表 → 检查 `year` 参数是否为预期格式。
  - `hasNext` 异常 → 确认 `limit` 未超出 20，或数据库记录数是否小于当前页范围。

---

## 7. 相关资源
- Prisma 模型：`backend/prisma/schema.prisma` → `TimelineEvent`
- 迁移脚本：`backend/prisma/seeds/migrate_timeline.js`
- 前端消费组件：`frontend/app/site/history/TimelineFeed.tsx`

> 若需新增字段或筛选条件，请同步更新 Prisma 模型、迁移脚本、此文档以及 Playwright/Jest 测试。
