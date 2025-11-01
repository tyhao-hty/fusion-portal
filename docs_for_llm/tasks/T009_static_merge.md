# T009 – 静态站内容融合

## 概述
将 `frontend/public/` 中的静态核聚变门户页面迁移到 Next.js 前端与 Express/Prisma 后端架构下，实现统一的组件体系、数据来源与 SEO 策略，同时保留可回退的旧版站点。

- **优先级**：🔥 高
- **当前状态**：🛠 进行中
- **相关模块**：Next.js App Router、Prisma、Express API、旧版静态资源

## 目标
1. 复用现有内容与交互，逐步替换为 React 组件与受控数据源；
2. 为时间线、论文、链接等数据型页面补充后端模型与 API；
3. 保持 SEO 与用户体验不下降，并确保可回滚到 `_legacy-static` 备份。

## 路线图
1. ✅ **内容清单与分层**：梳理 `index`、`history`、`links`、`papers`、`science`、`technology`、`business` 页面及其依赖组件/数据。
2. 🔄 **前端适配方案**：在 `app/(site)/` 建立对应路由，抽象 Header/Footer，暂时引入原 `styles.css`，逐步拆分为 Tailwind/模块化样式；以 React 元数据组件替换 `meta.js`。
3. 🔄 **数据迁移设计**：将 `data/timeline.json` → `TimelineEvent`、`data/papers.json` → `Paper`/`PaperTag`、`data/links.json` → `LinkSection`/`LinkGroup`/`Link`，其余叙述内容暂保留 Markdown/静态。
4. 🔄 **逐步替换策略**：阶段一复刻首页/时间线并接入只读 API；阶段二迁移论文/链接并实现后台录入；阶段三迁移专题页面为 Markdown 驱动内容。
5. 🔄 **运营与 SEO 考量**：保持 URL 结构与导航，设置 301/静态导入，生成新 sitemap 与结构化数据；迁移期间监控 SEO 指标。

## 阶段交付里程碑
- **阶段一（待排期）**：交付 `app/(site)/layout.tsx`、`app/(site)/page.tsx`、`app/(site)/history/page.tsx`，并完成 `GET /timeline` API 设计及 Prisma schema 草图。
- **阶段二（依赖后台扩展）**：交付 `GET /papers`、`GET /links` API 和后台录入表单，实现 `Paper`、`PaperTag`、`LinkSection` 等模型迁移。
- **阶段三（长期）**：将科普/理论/技术/商业页面迁移为 Markdown 驱动内容，接入未来 CMS 或 Git 驱动发布流程，下线旧版入口。

## 阶段一准备清单
- [ ] 输出 `app/(site)/layout.tsx` 与 `Header`/`Footer` React 组件草案，对应现有导航行为；
- [ ] 定义 `GET /timeline` API 契约（结构、分页、错误码），与后端确认实现方式；
- [ ] 设计 `TimelineEvent` Prisma 模型字段/索引及与 `Article` 的潜在关联；
- [ ] 提炼 `styles.css` 必需变量/动画，形成样式迁移指南；
- [ ] 定义阶段一验收标准（UI 一致性、数据校验、回退机制），准备评审。

## 数据迁移建议
- `timeline.json` → `TimelineEvent`（字段：`id`、`slug`、`year_label`、`title`、`description`、`sort_order`、时间戳）；
- `papers.json` → `Paper`、`PaperTag`、`PaperTagRelation`（支持多标签、年份检索、链接）；
- `links.json` → `LinkSection`、`LinkGroup`、`Link`（支持分组排序与描述）。

其余纯内容页面可暂存 Markdown/静态文件，后续与 CMS 方案一并规划。

## 依赖与风险
- 依赖 T002 后台管理扩展提供数据录入能力；
- 需与后端确认数据库 schema 与迁移安排；
- 在未完成阶段一前不建议直接替换生产站点，保留 `_legacy-static` 作为回退。

