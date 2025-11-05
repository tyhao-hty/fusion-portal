# API 文档 – `/api/links`

> 状态：β（阶段二开发中）  
> 最后更新：2025-11-05  
> 维护人：后端团队（Express + Prisma）

---

## 1. 概述
友好链接接口提供核聚变相关组织、机构、资源的结构化数据，供新版 `/site/links` 页面展示。数据来自 `LinkSection` → `LinkGroup` → `Link` 三层模型（由 `frontend/public/data/links.json` 迁移），返回嵌套结构并包含统计元信息。

- **基础路径**：`/api/links`
- **鉴权**：无（公开只读）
- **返回格式**：`application/json`

---

## 2. 成功响应
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
              "description": "世界最大的核聚变实验项目，七方合作建设，目标实现 Q>10 的聚变反应。",
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

字段说明：

| 字段 | 说明 |
| --- | --- |
| `data[].slug` | 与原 JSON `id` 对应，唯一标识 section。 |
| `data[].groups[].title` | 允许为 `null`，对应 JSON 中未命名的小节。 |
| `sortOrder` | 根据原数组索引反序生成，越大越靠前。 |
| `meta` | 统计本次响应中的 section/group/link 数量，用于前端展示或监控。 |

---

## 3. 错误响应
| 状态码 | 场景 | 示例 |
| --- | --- | --- |
| `500` | 服务器内部错误（数据库/Prisma 异常） | `{ "message": "Internal Server Error", "error": { "code": 500, "message": "Internal Server Error" } }` |

> 当前接口不接收查询参数，所有错误均由全局 `errorHandler` 统一处理。

---

## 4. 示例请求
```bash
curl "http://localhost:4000/api/links"
```

---

## 5. 迁移与运维
- 迁移脚本：`npm run seed:links`（支持 `--dry-run`、`--data <path>`、`--checksum <sha256>`，日志写入 `backend/prisma/seeds/logs/links-*.json`）。
- 运行顺序建议：`seed:links -- --dry-run` 验证 → `seed:links` 正式写入。
- 若需调整排序，可修改 JSON 中的顺序并重新运行脚本（会覆盖全部记录）。

---

## 6. 相关资源
- 数据模型：`backend/prisma/schema.prisma` → `LinkSection`、`LinkGroup`、`Link`
- 迁移脚本：`backend/prisma/seeds/migrate_links.js`
- 数据源（历史）：`frontend/public/data/links.json`
- 待迁移前端页面：`frontend/public/links.html`

> 前端完成迁移后，请同步更新 Playwright/Jest 用例，确保页面渲染、外链跳转与搜索/过滤（如果引入）行为稳定。
