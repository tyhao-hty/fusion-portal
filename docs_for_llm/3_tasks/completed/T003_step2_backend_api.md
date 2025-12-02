# T003 / Step 2 – Prisma 迁移与后端 API 扩展

## 目标
补齐 Article 模型并扩展列表/详情 API，支持分页、搜索、分类/标签/年份过滤，返回富元信息。

## 主要产出
- Prisma 迁移：新增/修改字段（excerpt、coverImageUrl、publishedAt、readingTime、timelineYear、tags/category 关联等）。
- API 扩展：
  - `GET /articles`：`page`, `pageSize`, `sort`（默认 `publishedAt desc`）、`q`, `category`, `tags[]`, `year`，返回 `{ data, meta { total, page, pageSize } }`
  - `GET /articles/:slug`：返回 Markdown 内容、readingTime、tags/category、timelineYear、timelineEvent 关联（如有）。
- 参数校验与默认值，错误处理。

## 执行步骤
1. 基于 Step 1 结论更新 `prisma/schema.prisma`，生成迁移并应用至本地 DB。
2. 扩展 `articles` 控制器/服务：查询条件、排序、分页、meta 计算，详情包含 Markdown 与关联元数据。
3. 为查询参数增加验证（数值范围、数组大小、白名单 sort）。
4. 更新 API 文档/注释，列出示例请求与响应结构。
5. 本地冒烟（若无 DB 环境则静态检查）：确保接口路由可启动、类型检查通过；记录结果。
6. 记录变更与风险于 `dev_notes.md`，在 `T003_article_render.md` 标记进度。

---

## 进展记录（2025-12-02）
- 已更新 `backend/prisma/schema.prisma`：加入 `slug`, `excerpt`, `coverImageUrl`, `status`(enum)、`publishedAt`, `updatedAt`, `readingTime`, `timelineYear`、`categoryId`、多标签关系；新增 `Category`, `Tag` 模型及索引，Tag 采用隐式多对多（自动联结表）。
- 迁移执行：已在可用环境运行 `npx prisma migrate dev --name article-schema-expansion` 成功（生成 `migrations/20251202062728_article_schema_expansion/`），Prisma Client 已更新。
- 已扩展 `/articles` 路由：列表支持分页/搜索/分类/标签/年份/状态/排序并返回 meta；详情按 slug 优先且返回 author/category/tags/timelineEvents。
- 下一步：补充参数校验文档与错误响应示例（Step 3），前端对接在 Step 4。

## 归档说明
- 状态：✅ 已完成（迁移与 API 扩展落地）；后续文档与校验在 Step 3 处理。
