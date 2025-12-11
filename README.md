# Fusion Portal 项目说明

## 1. 项目简介
Fusion Portal 是面向科研人员、工程师与公众的核聚变中文知识门户，提供发展历程、理论与技术路线、论文索引、行业资源与未来 AI 辅助内容。目标是逐步演进为可持续的知识基础设施和内容管理平台。

## 2. 当前架构（2025-12）
- 前端（`frontend/`）：Next.js 15（App Router，React 19）。站点页面位于根路由（`/`、`/history`、`/links`、`/papers`、`/science`、`/theory`、`/technology`、`/business`），Payload Admin 通过 `(payload)` 挂载在 `/admin`。旧的 dashboard/login/register 与 `*.html` rewrites 已移除。
- 后端（`backend/`）：Express + Prisma + PostgreSQL（schema=public），当前仍提供文章、时间线、链接、论文及鉴权接口，是现役数据源。
- CMS（Payload 3.67）：已集成并使用独立测试库（payload-test），尚未接管业务数据；计划通过分阶段迁移成为单一数据与权限来源。
- 静态资源：`frontend/public/` 仅保留资产与旧 HTML 备份，不再参与路由。

## 3. 站点内容（现有与规划）
- 发展历史：时间线、里程碑、事件详情。
- 论文与文献：精选论文索引、标签分类、外链。
- 资源链接：机构、会议、教育资源等结构化导航。
- 科普/理论/技术/商业专题：面向不同层次的说明与对比。
- 文章与动态：后续将迁移到 Payload 后台统一管理。
- 未来扩展：评论/投稿、AI 摘要与问答、可视化与推荐。

## 4. 运行方式
- 前端：`cd frontend && npm install && npm run dev`（默认 3000）
- 后端：`cd backend && npm install && npm run dev`（默认 4000）
环境变量：需要为前端提供 Express API 基址（`NEXT_PUBLIC_API_URL`），为 Express/Prisma 与 Payload 分别提供数据库连接串（两套独立配置）。

## 5. 主要路由
- 站点：`/`、`/history`、`/links`、`/papers`、`/science`、`/theory`、`/technology`、`/business`
- 管理：`/admin`（Payload Admin）

## 6. 开发计划与迁移方向
- 近期：前端继续消费 Express/Prisma API，完善 Payload schema 设计与数据迁移脚本。
- 中期：按模块迁移到 Payload（Links → Papers → Timeline → Articles），使用 Next.js Route Handler/BFF 保持前端响应兼容；校验 CRUD 与权限后再切源。
- 远期：Payload 成为单一数据与权限中心，Express/Prisma 退役为只读直至下线；引入评论/投稿、AI 摘要/问答、推荐与可视化模块。

## 7. 目录速览
- `frontend/`：Next.js 前端与 Payload Admin
- `backend/`：Express + Prisma 后端
- `docs_for_llm/`：规则、任务、设计与计划文档
- `docs/`：通用文档与报告
- `frontend/public/`：静态资源备份（不参与路由）
