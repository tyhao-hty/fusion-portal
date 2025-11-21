- **阶段二（依赖后台扩展）**：交付 `GET /papers`、`GET /links` API 和后台录入表单，实现 `Paper`、`PaperTag`、`LinkSection` 等模型迁移。

- **2025-11-05**：初步完成论文数据链路 —— 新增 Prisma 模型 `Paper`/`PaperTag`、迁移脚本 `npm run seed:papers`，并上线 `/api/papers`（分页、年份/标签/关键词筛选）。dry-run 日志：`backend/prisma/seeds/logs/papers-dry-run-2025-11-05T06-47-50-988Z.json`；正式写入日志：`backend/prisma/seeds/logs/papers-migrate-2025-11-05T06-53-37-913Z.json`（25 条论文、24 标签）。后续任务：前端页面重构与后台录入流程。
