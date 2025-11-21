# T009 – 静态站内容融合（SLIM）

## 概述 / Overview
将 `frontend/public/` 中的静态核聚变门户页面迁移到 Next.js 前端与 Express/Prisma 后端架构下，实现统一的组件体系、数据来源与 SEO 策略，同时保留可回退的旧版站点。

- **优先级**：🔥 高
- **当前状态**：🛠 进行中
- **相关模块**：Next.js App Router、Prisma、Express API、旧版静态资源

## 目标 / Goals
1. 复用现有内容与交互，逐步替换为 React 组件与受控数据源；
2. 为时间线、论文、链接等数据型页面补充后端模型与 API；
3. 保持 SEO 与用户体验不下降，并确保可回滚到 `_legacy-static` 备份。

## 路线图 / Roadmap
1. ✅ **内容清单与分层**：梳理 `index`、`history`、`links`、`papers`、`science`、`technology`、`business` 页面及其依赖组件/数据。
2. 🔄 **前端适配方案**：在 `app/(site)/` 建立对应路由，抽象 Header/Footer，暂时引入原 `styles.css`，逐步拆分为 Tailwind/模块化样式；以 React 元数据组件替换 `meta.js`。
3. 🔄 **数据迁移设计**：将 `data/timeline.json` → `TimelineEvent`、`data/papers.json` → `Paper`/`PaperTag`、`data/links.json` → `LinkSection`/`LinkGroup`/`Link`，其余叙述内容暂保留 Markdown/静态。
4. 🔄 **逐步替换策略**：阶段一复刻首页/时间线并接入只读 API；阶段二迁移论文/链接并实现后台录入；阶段三迁移专题页面为 Markdown 驱动内容。
5. 🔄 **运营与 SEO 考量**：保持 URL 结构与导航，设置 301/静态导入，生成新 sitemap 与结构化数据；迁移期间监控 SEO 指标。

## 阶段交付里程碑
- **阶段一（待排期）**：交付 `app/(site)/layout.tsx`、`app/(site)/page.tsx`、`app/(site)/history/page.tsx`，并完成 `GET /timeline` API 设计及 Prisma schema 草图。
- **阶段二（依赖后台扩展）**：交付 `GET /papers`、`GET /links` API 和后台录入表单，实现 `Paper`、`PaperTag`、`LinkSection` 等模型迁移。
- **阶段三（长期）**：将科普/理论/技术/商业页面迁移为 Markdown 驱动内容，接入未来 CMS 或 Git 驱动发布流程，下线旧版入口。

## 当前阶段状态
- **整体进度**：阶段一功能已进入收尾（截至 2025-11-05）。新版 `/site`、`/site/history` 与 `/api/timeline` 联调稳定，单元测试（TimelineFeed）与 Playwright 场景（首页渲染、加载更多、旧站 fallback）通过，部署/回滚/性能基线文档已补齐。
- **质量现状**：前端组件覆盖率 97.5%，E2E 运行耗时 36.9s；回滚与性能基线形成可执行手册。`seed:links`/`seed:papers` 已执行并产生日志；`utils/api.ts` 单测与最新 Lighthouse、API 延迟采样仍缺。
- **风险余量**：TypeScript 锁定 `~5.4.5`，需关注 `@typescript-eslint` 升级；时间线数据与后台模型联动仍待 T002/T003 对齐；性能/延迟数据未在可用环境采集，需尽快补测。

## 下一步计划
1. **数据与脚本**：复核并重新记录 `npm run seed:timeline -- --dry-run`/正式执行日志，与 2025-11-05 版本比对 checksum；确保存档路径与 `dev_notes.md` 一致。
2. **测试与指标**：补充 `frontend/utils/api.ts` 单测；在可运行服务的环境采集 `/site`、`/site/history`、`/site/links`、`/site/papers` 的 Lighthouse/延迟数据，并同步 `docs/performance_report.md` 与 `docs_for_llm/6_reports/performance/T009_static_merge_performance.md`。
3. **交付整理**：将最新测试证据（Jest/Playwright/seed 日志）归档到 `docs/tests/T009_test_report.md`，并保留报告链接/截图以备评审。
4. **阶段二衔接**：与 T002/T003 确认文章/时间线/链接/论文模型的后台录入流程与 schema 对齐，明确阶段二的 PRD/里程碑后更新本任务文件。

## 关联任务 / Dependencies
- 与 T002 后台管理面板共享：`TimelineEvent` 与未来 `Article`/`Category`/`Tag` 关联规则，明确时间线事件是否引用文章 ID、后台如何管理里程碑文案。
- 与 T003 文章加载渲染共享：文章元数据（发布时间、标签、文章类型）应与时间线展示保持一致；Markdown 渲染完成后需确认 `/site` 页面是否直接消费同一 API 或使用缓存层。
- 依赖 T002 后台管理扩展提供数据录入能力；
- 需与后端确认数据库 schema 与迁移安排；
- 在未完成阶段一前不建议直接替换生产站点，保留 `_legacy-static` 作为回退。

## 交付物清单（不含技术方案）
- [x] 前后端代码实现（含 `/site` 页面与 `/api/timeline` 路由）
- [x] 数据迁移脚本与执行日志（含验证输出）——最新日志见 `backend/prisma/seeds/logs/timeline-migrate-2025-11-05T05-30-18-999Z.json`
- [x] API 文档（Swagger/Postman 或 Markdown 说明）——见《docs/api/timeline.md》
- [ ] 测试报告（单元/集成覆盖率、E2E 录屏）——计划覆盖 `/api/timeline` 接口（分页/筛选/错误）、TimelineFeed 无限滚动组件、以及“访问首页→发展历史→加载更多”关键用户流程
- [x] 部署手册（含 rewrites、环境变量、监控接入步骤）——见《docs/deployment_handbook.md》
- [x] 回滚预案与验证流程——见《docs/rollback_plan.md》
- [x] 性能对比报告（首屏、API 响应）——见《docs/performance_report.md》
- [x] 风险评估表（含监控与告警配置）——见上表

---

### 状态校验（2025-11-21 13:53 CST）
- 本文件为精简版任务描述，详细历史记录与技术方案见 `../tasks/T009_static_merge_original.md`。
- 当前状态保持“进行中”，与 `Tasks Overview` 和 `dev_notes.md` 一致；最新进展停留在 2025-11-05。
- 后续更新（测试报告、性能数据、阶段交付确认）需追加于此并同步 `dev_notes.md` 与目录索引。
