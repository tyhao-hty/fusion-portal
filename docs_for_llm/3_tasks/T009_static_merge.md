# T009 – 静态站内容融合（SLIM）

## 概述
将 `frontend/public/` 旧站迁入 Next.js + Express/Prisma 架构，复用内容与交互、统一数据来源与 SEO，并保留 `_legacy-static` 回退。

- **优先级**：🔥 高
- **当前状态**：🛠 进行中（阶段二衔接筹备）

## 当前路由与兼容策略
- 新版站点根路由：`/`（首页）、`/history`、`/links`、`/papers`，均使用 `SiteFrame` + `styles-legacy.css`。
- Rewrites：`/index.html`→`/`，`/history.html`→`/history`，`/links.html`→`/links`，`/papers.html`→`/papers`。
- Middleware：仅保护 `/dashboard/:path*`，前台根路由不做登录拦截。
- 旧专题页（`/science.html`、`/theory.html`、`/technology.html`、`/business.html`）仍为静态备份，尚未迁入 App Router。
- 数据来源：后端 `/api/timeline`（分页/筛选）、`/api/links`（nested/flat 视图）、`/api/papers`（分页/标签/排序）；`NEXT_PUBLIC_API_URL` 指向后端。

## 目标
1) 逐步将静态内容替换为受控 React 组件；2) 为时间线、论文、链接提供数据库+API 支撑；3) 保障 SEO/性能不回退并可随时回滚。

## 进度与状态
- 阶段一已交付：根级首页/历史/链接/论文页上线，SWR 无限滚动与筛选可用，rewrites/middleware 就绪，种子脚本已产生日志。
- 2025-12-04：科普/理论/技术/商业专题迁入根路由（/science、/theory、/technology、/business），旧 `.html` 作为备份保留，rewrites 已补。
- 2025-12-04：补充基础测试——Jest 覆盖新专题页渲染与核心组件路径，Playwright 覆盖根级首页/历史“加载更多”与链接页。
- 质量现状：TimelineFeed 组件测试覆盖率 97.5%，Playwright 基础场景已跑通；正式测试报告（含覆盖率/录屏）仍缺。
- 风险与注意：TypeScript 锁定 `~5.4.5`；专题页仍是 `.html`，需迁入前注意导航/SEO；`utils/api.ts` 等请求层缺单测。

## 路线图
- ✅ 阶段一：内容梳理 + 根路由落地（首页/历史/链接/论文），接通 `/api/timeline` + seeds。
- 🔄 阶段二：论文/链接/时间线后台录入 & schema 对齐，完善测试报告与性能基线。
- 🔄 阶段三：专题页（science/theory/technology/business）迁入 App Router，改用 Markdown/受控数据源并下线 `.html`。

## 交付物清单（不含技术方案）
- [x] 前后端代码实现（根路由页面 + `/api/timeline` 等接口）
- [x] 数据迁移脚本与执行日志——见 `backend/prisma/seeds/logs/timeline-migrate-2025-11-05T05-30-18-999Z.json`
- [x] API 文档——见《docs/api/timeline.md》
- [ ] 测试报告（单元/集成/E2E 覆盖率与录屏）
- [x] 部署手册——见《docs/deployment_handbook.md》
- [x] 回滚预案——见《docs/rollback_plan.md》
- [x] 性能对比报告——见《docs/performance_report.md》
- [x] 风险评估表——见上表

## 后续行动
- 衔接 T002/T003：确定 Timeline/Paper/Link 的后台录入流程、权限与 schema，对应跟进见 `completed/T009_phase2_followups.md` 与 `completed/T009_phase2_alignment_notes.md`。
- 产出正式测试报告：记录 Jest/Playwright 执行、覆盖率与关键截图，补 `utils/api.ts` 单测。
- 迁移专题页：将 `.html` 页面迁入 App Router，复用 `SiteFrame` 与 `buildSiteMetadata`，完成后更新 rewrites/导航说明。
- 重新采集根路由下的 Lighthouse/API 延迟数据，必要时更新性能基线与监控配置。

## 关联任务 / Dependencies
- 与 T002：后台录入、权限与 `TimelineEvent`/`Article`/`Category`/`Tag` 关联规则。
- 与 T003：文章元数据与时间线展示一致性；共享 API/缓存策略。
- 在完成专题页迁移前保留 `_legacy-static` 与 `.html` 作为回退。

### 状态校验（2025-12-10 11:20 CST）
- 文档已同步根级路由、rewrites 与 middleware 现状；详细历史记录见 `../tasks/T009_static_merge_original.md`。
- 阶段二/三保持“进行中”以供后续对齐与专题迁移；完成情况需同步 `dev_notes.md` 与目录索引。
