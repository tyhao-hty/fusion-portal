# 架构概览

本文档记录核聚变门户网站的前端架构、数据契约与页面交互关系。未来对脚本或数据结构的任何改动，均需同步更新此文档以保持一致。

## 2025-12 架构状态（Next.js + Express/Prisma + Payload）
- 前端：Next.js 15（App Router，React 19），站点页面位于根路由（`/history`、`/links`、`/papers` 等），`(site)` 分组提供公共布局/样式，Payload Admin 通过 `(payload)` 提供 `/admin` 后台；不再存在 `(dashboard)`、登录/注册页面或 `*.html` rewrites。
- 后端：Express + Prisma + PostgreSQL（schema=public），当前仍提供文章/时间线/链接/论文接口与鉴权，作为现阶段数据源。
- CMS：Payload 3.67 已集成在前端框架，使用独立测试数据库（payload-test）；Prisma→Payload 的 Phase4 迁移已导入 users/tags/articles/papers/timeline/links，可作为候选可信内容源（待完成安全校验与数据抽查后再切换正式读源）；目标是逐步迁移业务到 Payload 并最终成为单一数据源。
- 静态站遗留：`frontend/public/` 保留静态资源备份，但不再作为页面兜底入口。
- 工具链：TypeScript 5.x，Jest/Playwright/Vitest 仍可用于前端/端到端覆盖；性能/测试报告存于 `docs/` 与 `docs_for_llm/6_reports/`。保持与 `docs/architecture.md` 同步为准。

## 1. 前端页面与组件

- `(site)` 分组：提供站点公共布局与样式（`SiteHeader`、`SiteFooter`、元数据构建），页面直接位于根路由：`/`、`/history`、`/links`、`/papers`、`/science`、`/theory`、`/technology`、`/business` 等。
- `(payload)` 分组：Payload Admin `/admin`，使用 Payload 自带布局。
- 公用导航：React 版 `SiteHeader` 提供静态导航链接（无登录/写作入口切换），移动端菜单和平滑滚动在组件内实现；Footer/Metadata 与站点页面共享。
- 样式：`styles-legacy.cjs` 在 `(site)` 布局中全局导入，逐步向 Tailwind/模块化样式演进。

## 2. 数据来源与 API

- 当前数据源：Express + Prisma（PostgreSQL public schema）提供文章、时间线、链接、论文等接口及鉴权。
- Payload：已集成但未接管业务数据，使用独立测试数据库（payload-test）。未来迁移后将作为单一数据源并替代 Express 接口。

## 3. 静态资源

- `frontend/public/` 保留静态资源与旧版 HTML 备份，但不再通过 rewrites 或前端逻辑引用。

## 4. 迁移与演进方向

- 短期：保持前端消费 Express API，逐模块设计 Payload schema 与迁移脚本，验证后切换到 Payload。
- 中期：前端 BFF/API Route 替代 Express，权限/认证迁移到 Payload；Prisma schema 退役为只读。
- 长期：Payload 作为单一数据源和权限中心，Express 后端下线。
