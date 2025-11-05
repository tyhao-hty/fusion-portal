# API 文档 – `/api/papers`

> 状态：β（阶段二开发中）  
> 最后更新：2025-11-05  
> 维护人：后端团队（Express + Prisma）

---

## 1. 概述
论文接口提供核聚变关键论文的分页数据，服务于新版 `/site` 与待迁移的“papers”页面。数据来自 `Paper` 与 `PaperTag` 模型（由 `frontend/public/data/papers.json` 迁移），支持按年份、标签与关键词检索。

- **基础路径**：`/api/papers`
- **鉴权**：无（公开只读）
- **返回格式**：`application/json`

---

## 2. 查询参数
| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` | number | `1` | 页码，从 1 开始。 |
| `limit` | number | `10` | 每页条数，最大 `50`。兼容参数：`pageSize`。 |
| `year` | string | — | 年份筛选：纯数字时按整型年份匹配；其它字符串会模糊匹配 `title` 与 `venue`。 |
| `tag` | string | — | 标签筛选，支持 `PaperTag.slug` 或 `name`（区分度更高建议传 `slug`）。别名：`tagSlug`。 |
| `search` | string | — | 关键词搜索，模糊匹配标题、作者、摘要与期刊。别名：`q`。 |

> 当 `limit` 超过 50 时会被截断；小于 1 时回退到 1。  
> 所有模糊搜索均为大小写不敏感（Prisma `mode: 'insensitive'`）。

---

## 3. 成功响应
```json
{
  "data": [
    {
      "slug": "paper-007",
      "title": "Scaling of Energy Confinement and Density Limit in Tokamak Plasmas",
      "authors": "ITER Physics Expert Group",
      "year": 1999,
      "venue": "Nuclear Fusion",
      "url": "https://doi.org/10.1088/0029-5515/39/12/302",
      "abstract": "ITER物理基础的重要论文，建立了托卡马克约束标度律。",
      "sortOrder": 8,
      "tags": [
        { "slug": "x1lMq8W7AcsiVxY4n75aVhU4lHs", "name": "磁约束聚变" },
        { "slug": "2o1kN5Hs2wWJxi1nCk3382y0M9E", "name": "托卡马克" }
      ],
      "createdAt": "2025-11-05T06:30:00.000Z",
      "updatedAt": "2025-11-05T06:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 32,
    "totalPages": 4,
    "hasNext": true
  }
}
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `data[i].slug` | 与原 `papers.json` 的 `id` 一致，唯一标识。 |
| `data[i].tags[].slug` | 基于标签文本生成的稳定编码（Base64URL）；用于前端筛选。 |
| `data[i].sortOrder` | JSON 顺序反转后的索引，越大越靠前。 |
| `meta.hasNext` | 是否存在下一页。 |

---

## 4. 错误响应
| 状态码 | 场景 | 示例 |
| --- | --- | --- |
| `400` | 查询参数非法（保留给未来扩展） | `{ "message": "Invalid query", "error": { "code": 400, "message": "Invalid query" } }` |
| `500` | 服务器内部错误（数据库/Prisma 异常） | `{ "message": "Internal Server Error", "error": { "code": 500, "message": "Internal Server Error" } }` |

> 所有错误均交由全局 `errorHandler` 统一格式化。

---

## 5. 示例请求
```bash
# 获取 1990 年后的论文
curl "http://localhost:4000/api/papers?year=1990&limit=5"

# 根据标签筛选（slug 或原始名称均可）
curl "http://localhost:4000/api/papers?tag=磁约束聚变"

# 关键词搜索
curl "http://localhost:4000/api/papers?search=tokamak"
```

---

## 6. 迁移与运维
- 迁移脚本：`npm run seed:papers`（支持 `--dry-run`、`--data <path>`、`--checksum <sha256>` 参数，日志输出至 `backend/prisma/seeds/logs/`）。
- 日志命名：`papers-(dry-run|migrate)-YYYY-MM-DDTHH-mm-ss-SSSZ.json`。
- 运行前确保 PostgreSQL 可用，并已执行 `prisma migrate` 同步最新 schema。
- 若需新增字段，请同步更新 Prisma 模型、迁移脚本与本文档。

---

## 7. 相关资源
- Prisma 模型：`backend/prisma/schema.prisma` → `Paper`、`PaperTag`
- 迁移脚本：`backend/prisma/seeds/migrate_papers.js`
- 数据源（历史）：`frontend/public/data/papers.json`
- 待迁移前端页面：`frontend/public/papers.html`

> 阶段二目标包括：完成后台录入表单、前端 React 页面与 Playwright/Jest 测试覆盖；完成后请更新状态与测试证据。
