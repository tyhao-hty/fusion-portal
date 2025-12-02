# API 规格 – `/api/papers`

- **最后更新**：2025-11-21（对齐 `docs/api/papers.md`）
- **状态**：β（阶段二开发中）
- **鉴权**：无（公开只读）
- **基础路径**：`/api/papers`
- **返回格式**：`application/json`
- **服务归属**：Express + Prisma（后端）

## 查询参数
- `page`（默认 1）、`limit`/`pageSize`（默认 10，上限 50）
- `year`：单一年份（数字：精确匹配 year；文本：模糊匹配 title/venue）
- `yearFrom`/`yearTo`：年份区间，需 `yearFrom <= yearTo`
- `tags`/`tag`/`tagSlug`：多标签筛选，逗号分隔或重复参数；匹配标签 `slug` 或 `name`
- `search`/`q`：关键词模糊匹配 `title`/`authors`/`abstract`/`venue`
- `sort`：`year_desc`（默认）、`year_asc`、`name_asc`、`name_desc`

> `limit` 超出上限会被截断；非法数字回退默认值。

## 成功响应
```json
{
  "data": [
    {
      "slug": "paper-007",
      "title": "Scaling of Energy Confinement...",
      "authors": "ITER Physics Expert Group",
      "year": 1999,
      "venue": "Nuclear Fusion",
      "url": "https://doi.org/...",
      "abstract": "...",
      "sortOrder": 8,
      "tags": [
        { "slug": "fusion", "name": "磁约束聚变" }
      ],
      "createdAt": "2025-11-05T06:30:00.000Z",
      "updatedAt": "2025-11-05T06:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "pageSize": 10,
    "total": 32,
    "totalPages": 4,
    "hasNext": true,
    "hasMore": true
  }
}
```

## 错误响应
- `400 Bad Request`：如 `yearFrom > yearTo`，返回 `{ message, error: { code: 400, message: "Bad Request" } }`
- `500 Internal Server Error`：数据库/Prisma 异常

## 相关资源
- 模型：`backend/prisma/schema.prisma` → `Paper`、`PaperTag`
- 路由：`backend/src/routes/papers.js`
- 种子脚本：`backend/prisma/seeds/migrate_papers.js`
- 数据源：`frontend/public/data/papers.json`
- 前端消费：`frontend/app/site/papers/PapersCatalog.tsx`
