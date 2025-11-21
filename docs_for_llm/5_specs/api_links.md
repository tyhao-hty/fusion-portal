# API 规格 – `/api/links`

- **最后更新**：2025-11-05（对齐 `docs/api/links.md`）
- **状态**：β（阶段二开发中）
- **鉴权**：无（公开只读）
- **基础路径**：`/api/links`
- **返回格式**：`application/json`
- **服务归属**：Express + Prisma（后端）

## 响应结构
```json
{
  "data": [
    {
      "slug": "international-programs",
      "title": "国际组织与项目",
      "sortOrder": 3,
      "groups": [
        {
          "slug": "global-initiatives",
          "title": null,
          "sortOrder": 2,
          "links": [
            {
              "slug": "iter",
              "name": "ITER 国际热核聚变实验堆",
              "url": "https://www.iter.org/",
              "description": "...",
              "sortOrder": 4
            }
          ]
        }
      ]
    }
  ],
  "meta": {
    "sectionCount": 6,
    "groupCount": 12,
    "linkCount": 52
  }
}
```

字段要点：
- `data[].slug` / `groups[].slug` / `links[].slug`：对应 Prisma 中的唯一标识（源自原 JSON `id`）。
- `title` 可为 `null` 以兼容未命名分组。
- `sortOrder` 依据原数组索引反向生成，数字越大排序越靠前。
- `meta` 提供统计数据，供前端展示或监控。

## 错误响应
统一由全局 `errorHandler` 返回，当前接口不接收查询参数：
- `500 Internal Server Error`：数据库/Prisma 异常等。

## 相关资源
- 模型：`backend/prisma/schema.prisma` → `LinkSection`、`LinkGroup`、`Link`
- 路由：`backend/src/routes/links.js`（挂载于 `/api/links`）
- 种子脚本：`backend/prisma/seeds/migrate_links.js`
- 数据源：`frontend/public/data/links.json`
- 前端消费：`frontend/app/site/links/LinksDirectory.tsx`（SSR page.tsx + client 组件）
