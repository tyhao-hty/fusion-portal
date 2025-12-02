# T009 – 阶段二对齐提案（T002/T003 共享）
> 目标：统一文章/时间线/论文/链接的字段、接口与后台录入需求，形成可执行的小工单。  
> 输出包括 ER/TS 对齐建议和待办列表。

## 现状梳理
- Prisma 模型（节选）
  - `Article`：`id`, `title`, `content`, `authorId`, `createdAt`；缺少 `excerpt`, `publishedAt`, `coverImageUrl`, `updatedAt`, `readingTime`, `timelineYear`, `tags/categories`。
  - `TimelineEvent`：已含 `slug`, `yearLabel`, `yearValue`, `title`, `description`, `sortOrder`, `relatedArticleId`。
  - `Paper`/`PaperTag`：基础字段齐全，支持多标签。
  - `LinkSection`/`LinkGroup`/`Link`：基础字段齐全。
- API 规格（docs_for_llm/5_specs）
  - `/api/timeline` 支持 `q/yearFrom/yearTo/order/page/limit`，返回 meta。
  - `/api/links` 支持 `section/group/q/view`，返回 meta。
  - `/api/papers` 支持 `page/limit/q/yearFrom/yearTo/tags/sort`，返回 meta。
  - `articles` 路由目前只返回全量列表/详情，无分页/搜索/元数据。

## TS/ER 对齐建议
1) Article 模型扩展（Prisma + TS）
   - 新字段：`excerpt` (String?)、`coverImageUrl` (String?)、`publishedAt` (DateTime)、`updatedAt` (@updatedAt)、`readingTime` (Int?，单位分钟)、`timelineYear` (Int?)。  
   - 关联：多对多 `tags`、可选 `categoryId`（单分类）或多分类表（视 T002 决策）；保留 `relatedTimelineEvents`（已有关联）。  
   - TS Interface（前端/API 响应）：对齐上述字段，并暴露 `author { id,email }`、`tags`、`category`。
2) Article API 扩展
   - `GET /articles`: `page`(default 1), `limit`(<=50), `q/search`, `category`, `tags`(逗号分隔), `year`/`yearFrom`/`yearTo`(匹配 timelineYear 或 publishedAt), `sort`(`published_desc` 默认，`published_asc`,`title_asc`,`title_desc`).  
   - 响应 `{ data, meta: { page, limit, total, totalPages, hasNext } }`，列表项至少包含 `id, slug?, title, excerpt, coverImageUrl, publishedAt, timelineYear, tags, category, author, readingTime`。
   - `GET /articles/:id`: 返回 Markdown `content`, `readingTime`, `lastEditedAt`, `tags`, `category`, `relatedTimelineEvents?`。
3) Timeline/Articles 对齐
   - Timeline 事件可选关联 Article；前端 `/site/history` 如需展示文章链接，可从 `relatedArticleId` 渲染。
   - Article 提供 `timelineYear` 以便 `/site/history` 复用或做联动筛选。
4) 前端契约
   - 为 T003 前端列表/详情定义 TS 类型（与 API 对齐），避免使用旧的简单 `Article` 形状。
   - 列表页需要分页/搜索/过滤元数据；详情页需要 Markdown + meta + tags。

## 待办小工单（建议拆分）
1) Prisma 迁移：Article 扩展字段 + Tag/Category 关系 + readingTime；生成 migration 并更新种子/默认值。
2) 后端 API：扩展 `articles` 路由的查询参数、meta 结构和详情返回；参数校验与上限约束。
3) 前端类型与数据层：定义 `ArticleListItem`/`ArticleDetail` TS 类型，更新获取逻辑（分页/搜索/过滤），准备 Markdown 渲染管线。
4) Timeline 联动：在 `/api/timeline` 增加可选 `includeArticle`（或前端追加渲染）以显示相关文章链接；文案对齐。
5) 文档与验收：更新 `docs_for_llm/5_specs/api_articles.md`（新增），`T003_article_render.md` 状态与验收标准；在 dev_notes 记录迁移与 API 变更。

## 依赖与风险
- 需与 T002 确认分类/标签方案（单分类 vs 多分类、多选标签、权限/审核流）；若未定，先按多标签 + 可选单分类实现。
- 迁移需谨慎设置默认值（例如 publishedAt 可默认 `now()` 或允许 null），避免破坏已有数据。
- Markdown 渲染需考虑 XSS 处理（remark/rehype 组合）——可在实施阶段细化。
