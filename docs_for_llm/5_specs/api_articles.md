# API Spec – Articles

## 列表 `GET /articles`
- **查询参数**
  - `page` number ≥1，默认 1
  - `pageSize` number ≥1，默认 10，最大 50
  - `q` string，模糊匹配 title/excerpt/content（不区分大小写）
  - `category` string，按分类 slug 过滤
  - `tags` string，逗号分隔的 tag slug 列表（至少一个）
- `status` string，`draft|review|published|all`，默认 `published`。`all` 仅在已鉴权请求下允许，否则回退为 `published`。
  - `year` number，匹配 timelineYear 或 publishedAt 所在年份
  - `yearFrom` number，起始年份（含），与 `yearTo` 组合成区间；也会作用于 publishedAt
  - `yearTo` number，结束年份（含），与 `yearFrom` 组合成区间；也会作用于 publishedAt
  - `sort` string，`published_desc`(默认) | `published_asc` | `title_asc` | `title_desc`
- **响应示例**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "fusion-basics",
      "title": "核聚变基础",
      "excerpt": "快速了解核聚变的原理与瓶颈……",
      "coverImageUrl": "https://cdn.example.com/covers/fusion.jpg",
      "status": "published",
      "publishedAt": "2025-12-01T06:00:00.000Z",
      "updatedAt": "2025-12-02T04:00:00.000Z",
      "readingTime": 6,
      "timelineYear": 2025,
      "author": { "id": 1, "email": "author@example.com" },
      "category": { "id": 2, "slug": "science", "name": "科普" },
      "tags": [
        { "id": 1, "slug": "fusion", "name": "核聚变" },
        { "id": 3, "slug": "tokamak", "name": "托卡马克" }
      ]
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5,
    "hasNext": true
  }
}
```
- **错误**
  - `400` 参数非法（如 page/pageSize 非法、sort/status 不在白名单、年份非数字）
  - `500` 服务端错误

## 详情 `GET /articles/:slugOrId`
- **路径参数**
  - `slugOrId`：优先按 slug 匹配，若为数字则兼容按 id。
- **响应示例**
```json
{
  "id": 1,
  "slug": "fusion-basics",
  "title": "核聚变基础",
  "excerpt": "快速了解核聚变的原理与瓶颈……",
  "coverImageUrl": "https://cdn.example.com/covers/fusion.jpg",
  "status": "published",
  "publishedAt": "2025-12-01T06:00:00.000Z",
  "updatedAt": "2025-12-02T04:00:00.000Z",
  "readingTime": 6,
  "timelineYear": 2025,
  "content": "# Markdown 内容...",
  "author": { "id": 1, "email": "author@example.com" },
  "category": { "id": 2, "slug": "science", "name": "科普" },
  "tags": [
    { "id": 1, "slug": "fusion", "name": "核聚变" },
    { "id": 3, "slug": "tokamak", "name": "托卡马克" }
  ],
  "timelineEvents": [
    { "id": 10, "slug": "timeline-2025-demo", "yearLabel": "2025年", "yearValue": 2025, "title": "里程碑" }
  ]
}
```
- **错误**
  - `404` 未找到
  - `400` 路径非法（极端情况）
  - `500` 服务端错误

## 校验与默认值
- `page/pageSize`：不足 1 时回退到默认；pageSize 超过 50 回退到 50。
- `status`/`sort`：非白名单时使用默认值。
- `tags`/`category`/`q`：移除空值与首尾空白。
- 年份过滤：`year` 精确匹配 timelineYear 或 publishedAt 年份；`yearFrom/yearTo` 组合成闭区间，作用于 timelineYear 和 publishedAt。
- 默认仅返回 `status=published`，除非显式传入其他状态（后续可按权限限制）。
