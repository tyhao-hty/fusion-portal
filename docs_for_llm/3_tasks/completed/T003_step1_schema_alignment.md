# T003 / Step 1 – 需求与模型对齐

## 目标
明确文章数据模型与发布流程，保证与 T002 后台一致，为后续 API/前端改造提供定稿字段与约束。

## 主要产出
- 定稿字段清单：`title`, `slug`, `excerpt`, `coverImageUrl`, `content (Markdown)`, `publishedAt`, `updatedAt`, `readingTime`, `category`, `tags[]`, `timelineYear`, 可选 `timelineEvent` 关联。
- 分类/标签/审核流程决策：单分类 + 多标签策略，发布/草稿状态，与后台审核流一致。
- 回滚策略：若暂无法改 Schema，保留现有字段并记录差异。

## 执行步骤
1. 盘点当前 Prisma `Article` 模型与现有 API 字段，列出缺口。
2. 与 T002 约定分类/标签策略、审核发布流程、可选 timeline 关联。
3. 生成字段对齐清单与决策说明，记录在 `T003_article_render.md` 与本文件。
4. 若需要迁移，拟定 Prisma 迁移草案（字段、索引、默认值），为 Step 2 使用。
5. 更新依赖文档：`docs_for_llm/3_tasks/README.md`、`dev_notes.md`，标记对齐结论与风险。

---

## 现状盘点（2025-12-02）
- Prisma `Article` 仅含 `id`, `title`, `content`, `authorId`, `createdAt`, `timelineEvents`（关联自 TimelineEvent.relatedArticleId）。缺失 slug、摘要、封面、发布时间、更新时间、阅读时长、分类/标签、状态、年份。
- 后端 `/articles` 路由：列表返回全量、无分页/过滤/元数据；详情按 `id` 获取；创建/更新仅接收 `title/content`。
- T002 规划（2025-11-05）已提出：`publishedAt`, `excerpt`(<=160), `coverImageUrl`, `categoryId`, `status`(`draft/review/published`), `timelineYear`，分类/标签 CRUD，允许关联 `TimelineEvent.relatedArticleId`。
- T009 对齐提案补充：多标签 + 可选单分类，新增 `readingTime`、`updatedAt @updatedAt`、`slug` 唯一、`timelineYear`(Int?)，列表/详情 API 需要 meta 与过滤。

## 对齐结论
- 字段/约束（Prisma）  
  - `slug` String @unique（供前台/SEO 使用）；`title` String。  
  - `excerpt` String?（<=160 字，前端校验），`coverImageUrl` String?。  
  - `content` String（Markdown 原文）；`readingTime` Int?（分钟，可存计算值）。  
  - `status` Enum：`draft`/`review`/`published`（默认 draft）。  
  - `publishedAt` DateTime?（draft 可 null；published 必填）；`createdAt` DateTime @default(now())；`updatedAt` DateTime @updatedAt。  
  - `timelineYear` Int?（用于 `/site/history` 筛选联动）；保留 `timelineEvents` 反向关联。  
  - 关联：`categoryId` 可选单分类；`tags` 多对多。`authorId` 保留，前端可读出 `author { id,email }`。
- 分类/标签模型  
  - `Category { id, slug @unique, name, description?, sortOrder @default(0), createdAt, updatedAt }`，Article 可选 `categoryId`。  
  - `Tag { id, slug @unique, name @unique, createdAt, updatedAt }`，Article 与 Tag 采用隐式多对多（Prisma 自动建联结表）。  
  - 排序索引：`Category.sortOrder`，`Tag.name`。
- 审核/发布流程（与 T002 对齐）  
  - 作者创建为 `draft`，可提交 `review`；管理员/编辑可设为 `published`。  
  - `publishedAt` 仅在 `published` 状态要求非空；`timelineYear` 可选。  
  - 允许在后台选择关联时间线事件（写入 TimelineEvent.relatedArticleId）。
- API 期望（为 Step 2 指引）  
  - 列表支持 `page/pageSize/sort/q/category/tags/year`，返回 meta。  
  - 详情按 `slug`（首选）或 `id` 获取，返回 Markdown、readingTime、tags/category/timelineYear、author。

## Prisma 迁移草案（供 Step 2 使用）
```prisma
model Article {
  id             Int             @id @default(autoincrement())
  slug           String          @unique
  title          String
  excerpt        String?
  coverImageUrl  String?
  content        String
  status         ArticleStatus   @default(draft)
  publishedAt    DateTime?
  updatedAt      DateTime        @updatedAt
  readingTime    Int?
  timelineYear   Int?
  authorId       Int
  author         User            @relation(fields: [authorId], references: [id])
  categoryId     Int?
  category       Category?       @relation(fields: [categoryId], references: [id])
  tags           Tag[]           @relation("ArticleTags")
  timelineEvents TimelineEvent[]
  createdAt      DateTime        @default(now())

  @@index([publishedAt, id])
  @@index([timelineYear])
}

model Category {
  id          Int       @id @default(autoincrement())
  slug        String    @unique
  name        String    @unique
  description String?
  sortOrder   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  articles    Article[]

  @@index([sortOrder, id])
}

model Tag {
  id        Int       @id @default(autoincrement())
  slug      String    @unique
  name      String    @unique
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  articles  Article[] @relation("ArticleTags")

  @@index([name])
}

enum ArticleStatus {
  draft
  review
  published
}
```

## 风险与回滚
- 若当前环境无法迁移：保留现有 Article 模型与 API，前端继续使用最小字段；记录差异并在上线前补迁移。  
- 兼容策略：API 暂缺字段时，前端可降级隐藏对应信息；publishedAt/slug 为空时按 id 回退。  
- 数据安全：迁移需设默认值（slug/ publishedAt 可暂允许 null），避免破坏既有记录。

## 变更记录
- 2025-12-02：采用隐式多对多（Article↔Tag），不再需要显式 `ArticleTag` 模型。

## 更新记录
- 2025-12-02：完成 Schema/流程对齐，确认多标签+单分类+状态枚举方案；为 Step 2 提供 Prisma 草案与 API 指引。
