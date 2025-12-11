# Payload CMS 架构设计方案（Schema V2）
2025-12-11 19:58:49 CST

> 适用范围：Fusion Portal 项目中 Payload CMS 的内容模型（schema）、角色与权限、迁移与 API 兼容策略设计。  
> 目标：为 `payload.config.ts` 与迁移脚本提供稳定蓝图，不直接包含 TypeScript 实现。

## 0. 设计目标与范围
- 明确各 Collection 的字段与关系（Articles、Papers、Timeline、Links、Tags 等）。
- 设计 Users / Members 分离的角色体系，支持草稿/审核/发布工作流。
- 定义 RichText + content_html 的存储与兼容策略。
- 提供从 Prisma → Payload 的迁移与 API 兼容思路（不含具体代码）。

## 1. 全局设计原则（Global Strategy）
- **Headless CMS Native**：以 Payload 最佳实践为准，旧 Prisma 仅作为迁移输入。
- **用户体系分离**：Users（CMS 后台）与 Members（前台用户）隔离认证。
- **富文本与兼容**：正文用 Lexical JSON；保存时生成 `content_html` 供旧/过渡前端使用，并集中做 XSS 白名单。
- **媒体统一管理**：独立 Media 集合；封面/PDF/图标等统一走 Media，支持本地与云存储切换。
- **统一标签体系**：合并 Category / Tag / PaperTag 为 Tags，使用 `type` 区分并保留排序/描述。
- **工作流与发布**：启用 drafts + `_status`，按角色控制发布权限。
- **可扩展链接管理**：LinkSection / LinkGroup / Link 三集合，避免大数组瓶颈。
- **可回滚与兼容**：保留 feature flag（如 `DATA_SOURCE=express|payload`），前端 API 先保持与 Express 兼容。

## 2. 角色与权限体系（Users & Roles）
### 2.1 CMS Users（/admin 登录）
- Collection：`users`，启用 auth（email+password）。
- 字段：`email`(unique, required)、`password`(managed by Payload)、`name`、`roles`(string[])。
- 角色（可多选）：
  - `admin`：系统/用户/内容全权限，可分配角色。
  - `publisher`：可发布/下线，编辑全部内容；不可管理用户。
  - `editor`：可编辑全部草稿，不可发布。
  - `author`：可创建/编辑自己的草稿，不可发布。
### 2.2 Members（前台用户骨架）
- Collection：`members`（暂不接入 /admin UI 或可隐藏）。
- 字段建议：`email`(unique)、`password`(按需)、`displayName`、`status`(active/banned)、`roles`(member/moderator)。
- 与 Users 认证隔离；未来用于评论/论坛/收藏等。

## 3. 集合设计（Collections Schema）
### 3.1 Media
- Slug：`media`；用途：图片/PDF 统一管理。
- 字段：`alt`(required)、`caption`(optional)；保留 Payload 内部 `filename` 等。
- 派生尺寸：`thumbnail`(~300px)、`feature`(~1024px)。
- 存储：开发本地，生产 S3/R2（`@payloadcms/plugin-cloud-storage`）。
- 访问：公开可读；写/删仅 editor/publisher/admin。

### 3.2 Tags（统一标签）
- Slug：`tags`。
- 字段：`name`(unique, required)、`slug`(unique, auto from name)、`type`(enum: category | article_tag | paper_tag)、`sortOrder`(default 0)、`description`(optional)。
- 用法：Articles 的 `category`=type:category（单选）；Articles 的 `tags`=type:article_tag（多选）；Papers 的 `tags`=type:paper_tag（多选）。

### 3.3 Articles
- Slug：`articles`；启用 drafts+versions。
- 字段：
  - `title`(required)、`slug`(unique, auto from title, overridable)。
  - `excerpt`(textarea)。
  - `coverImage`(relation -> media)。
- `content`(Lexical RichText)。
- `content_html`(hidden text，beforeChange 由 content 生成并做 XSS 过滤)。
- `readingTime`(number，hook 按字数估算)。
- `publishedAt`(datetime，首发填充)。
- `category`(relation -> tags, filter type=category, single)。
- `tags`(relation -> tags, filter type=article_tag, many)。
- `author`(relation -> users，默认当前用户)。
- `timelineYear`(number，可选，保留旧筛选需求)。
- 访问（示例）：
  - 匿名：仅 `_status=published`。
  - author：读自己 draft + 所有 published；写自己 draft；不可发布。
  - editor：读写全部 draft；不可发布。
  - publisher：读写全部；可改 `_status` draft↔published，更新 `publishedAt`。
  - admin：无约束。
- 作者字段保护：`author` 仅 admin 可修改；editor/publisher 不得更改作者归属；作者本人仅在创建时设置 author，之后不可自行更改。
- 时间轴字段：`timelineYear` 为兼容旧前端/快速筛选的过渡字段；长期推荐仅维护 TimelineEvents，待前端完成切换后可考虑废弃 `timelineYear`。
- Hooks：`beforeChange` 生成 `content_html`、`readingTime`，首发时填 `publishedAt`；如需 afterRead 虚拟字段可再加。
- SEO：建议接入 `@payloadcms/plugin-seo`，默认值使用 `title`/`excerpt`/`coverImage`。

### 3.4 Papers
- Slug：`papers`；可启用 drafts。
- 字段：`title`、`slug`、`authors`(array of {name, affiliation?})、`year`、`venue`、`url`、`pdf`(relation -> media，过滤 mimetype=pdf)、`abstract`、`tags`(relation -> tags, type=paper_tag)。
- 访问：与 Articles 类似（匿名仅 published；发布权限限 publisher/admin）。

### 3.5 TimelineEvents
- Slug：`timeline-events`。
- 字段：`yearLabel`(string)、`date`(date，用于排序，可由旧 `yearValue` 推导)、`sortOrder`(number, default 0)、`title`、`description`(textarea)、`relatedArticle`(relation -> articles)。
- 排序建议：`date DESC, sortOrder ASC, createdAt DESC`。

### 3.6 LinkSection / LinkGroup / Link
- 3.6.1 LinkSection（`link-sections`）：`title`、`slug`、`description?`、`sortOrder`。
- 3.6.2 LinkGroup（`link-groups`）：`title?`、`slug`、`section`(relation -> link-sections)、`description?`、`sortOrder`。
- 3.6.3 Link（`links`）：`name`、`slug?`(unique)、
  `url`、`description?`、`section`(relation -> link-sections，冗余便于查询)、`group`(relation -> link-groups)、`icon`(relation -> media)、`sortOrder`。
- Hooks：在 Link `beforeChange` 中，若 `group.section` 存在则自动写入 `link.section`；若 `link.section` 与 `group.section` 不一致，以 `group.section` 为准，保持冗余一致。

### 3.7 Members（骨架）
- Slug：`members`；字段见 2.2；当前阶段可隐藏列表/编辑 UI。
- 认证：暂不启用公开注册；可先关闭 auth 或仅保留登录能力，待评论/论坛方案确定后再开放注册端点，避免暴露未控入口。

## 4. RichText 与 content_html 策略
- 存储：`content` 使用 Lexical JSON。
- 兼容：`content_html` 隐藏字段，仅由 Hook 生成。
- Hook 逻辑（概念）：在 `beforeChange/beforeValidate` 中将 Lexical JSON → HTML（统一序列化器），通过白名单过滤后写入 `content_html`，拒绝直接输入。

## 5. 访问控制与审批工作流
- 核心规则（以 Articles 为例）：
  - 匿名：只读 `_status=published`。
  - author：仅操作自己的 draft，不可发布。
  - editor：编辑全部 draft，不可发布。
  - publisher：可发布/下线，编辑全部。
  - admin：无限制。
- 审批流：author 创建 draft → editor 审核/调整（仍 draft） → publisher 发布（更新 `_status`=published, `publishedAt`）→ 如需下线由 publisher/admin 改回 draft。

## 6. 数据迁移策略（Prisma → Payload）
- 映射记录：推荐 `migration_map.json` 或 migrationLogs 集合，记录 old_id/slug/url ↔ new_id 状态。
- 顺序建议：Users → Media → Tags → Articles → Papers → TimelineEvents → Links。
- 字段映射要点：
  - Users：旧 `role` → 新 `roles`（如 "admin" → ["admin"]）。
  - Media：按 `coverImageUrl`/PDF URL 下载上传，记录映射；失败留待人工。
  - Tags：Category → type=category；Tag → type=article_tag；PaperTag → type=paper_tag，保留 `sortOrder/description`。
  - Articles：Markdown → Lexical + HTML；cover 映射 Media；`status` draft/review→draft，published→published 并填 `publishedAt`；`category`/`tags` 通过映射表；保留 `timelineYear`。
  - Papers：authors 解析为数组；URL 为 PDF 则优先迁入 `pdf`，原链接可保留；tags 映射为 type=paper_tag。
  - TimelineEvents：`yearLabel`/`yearValue` → `yearLabel` + `date`（取该年/季度任意日）；`sortOrder` 直传；关联 Article 通过 slug/ID 映射。
  - Links：Section/Group/Link 三层直译；Link 写入 `group` 与冗余 `section`。
- 验证：dry-run + spot-check；记录冲突（slug 重复、下载失败）并允许重跑。

## 7. API 兼容性与 BFF 设计
- 在 Next Route Handlers 构建新 API（如 `/api/articles`），从 Payload 读取，返回结构尽量兼容旧 Express。
- 兼容示例（Articles）：返回 `coverImageUrl` 使用 Media 的 feature 尺寸 URL；`content` 返回 `content_html`；`tags`/`category` 用 name 映射为数组/字符串。
- Feature flag：`DATA_SOURCE=express|payload` 控制读源，便于灰度切换与回滚。

## 8. 后续工作与开放问题
- 需在 `payload.config.ts` 实现 access 函数与 hooks（RichText→HTML、readingTime、冗余 section 同步等）。
- 需准备统一的 Lexical→HTML 渲染器与 XSS 白名单策略。
- Members 的具体字段/权限待评论/论坛设计时扩展。
- 完成迁移并切换数据源后，计划下线 Express 与 Prisma schema（保留回滚窗口）。

## 9. 附录：Articles 字段兼容映射（示例）
- `title` → `title`
- `slug` → `slug`
- `excerpt` → `excerpt`
- `coverImage.feature.url` → `coverImageUrl`
- `content_html` → `content`
- `category.name` → `category`
- `tags[].name` → `tags[]`
- `publishedAt` → `publishedAt`
- `_status` → `status`
