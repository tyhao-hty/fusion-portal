### Prisma `TimelineEvent` 模型草案
```prisma
model Article {
  id             Int             @id @default(autoincrement())
  title          String
  content        String
  authorId       Int
  author         User            @relation(fields: [authorId], references: [id])
  createdAt      DateTime        @default(now())
  timelineEvents TimelineEvent[]
}

model TimelineEvent {
  id          Int       @id @default(autoincrement())
  slug        String    @unique           // 对应原 JSON 的 id（如 timeline-1991）
  yearLabel   String                     // 展示用文案，如 “1991年”
  yearValue   Int?                        // 便于排序/查询（可解析 “YYYY”）
  title       String
  description String
  sortOrder   Int       @default(0)      // 自定义排序，越大越靠前
  relatedArticleId Int?
  relatedArticle   Article? @relation(fields: [relatedArticleId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```
- 索引：`@@index([sortOrder, id], map: "idx_timeline_order")`、`@@index([yearValue], map: "idx_timeline_year")`。
- 迁移策略：导入现有 JSON 时按 `year` 推导 `yearValue`（仅数字部分），`sortOrder` 根据原数组顺序递减。
- 迁移脚本：在 `backend/prisma/seeds/migrate_timeline.js` 读取 JSON、验证字段（slug 唯一、year 数值化、描述非空），执行 `validateMigration({ expectedCount, checksumMatch, sampleRecordIntegrity })` 校验后在事务内批量写入。
- 所有写操作包裹在事务中，失败自动回滚并保留原 JSON 备份。

## 数据迁移建议
- `timeline.json` → `TimelineEvent`（字段：`id`、`slug`、`year_label`、`title`、`description`、`sort_order`、时间戳）；
- `papers.json` → `Paper`、`PaperTag`、`PaperTagRelation`（支持多标签、年份检索、链接）；
- `links.json` → `LinkSection`、`LinkGroup`、`Link`（支持分组排序与描述）。

- **2025-11-05**：初步完成论文数据链路 —— 新增 Prisma 模型 `Paper`/`PaperTag`、迁移脚本 `npm run seed:papers`，并上线 `/api/papers`（分页、年份/标签/关键词筛选）。dry-run 日志：`backend/prisma/seeds/logs/papers-dry-run-2025-11-05T06-47-50-988Z.json`；正式写入日志：`backend/prisma/seeds/logs/papers-migrate-2025-11-05T06-53-37-913Z.json`（25 条论文、24 标签）。后续任务：前端页面重构与后台录入流程。
- **2025-11-05**：设计并实现 `LinkSection`/`LinkGroup`/`Link` 模型与迁移脚本 `npm run seed:links`，开放 `/api/links`（返回嵌套结构+统计元数据），为 `/site/links` 迁移做准备。
