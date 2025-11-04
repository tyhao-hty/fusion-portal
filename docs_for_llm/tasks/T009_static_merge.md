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
- [x] 输出 `app/(site)/layout.tsx` 与 `Header`/`Footer` React 组件草案，对应现有导航行为；
- [x] 定义 `GET /timeline` API 契约（结构、分页、错误码），与后端确认实现方式；
- [x] 设计 `TimelineEvent` Prisma 模型字段/索引及与 `Article` 的潜在关联；
- [x] 提炼 `styles.css` 必需变量/动画，形成样式迁移指南；
- [x] 定义阶段一验收标准（UI 一致性、数据校验、回退机制），准备评审。

### 路由与兼容策略
- 过渡期使用 `/site` 子路径承载新版页面（`app/site/layout.tsx`, `app/site/page.tsx`, `app/site/history/page.tsx`），旧站仍可通过 `/index.html` 访问。
- 在 `next.config.js` 中配置 rewrites（文档中需列出完整清单）：
  ```js
  module.exports = {
    async rewrites() {
      return [
        { source: '/index.html', destination: '/site' },
        { source: '/history.html', destination: '/site/history' },
      ];
    },
  };
  ```
- 部署前在文档中提供 rewrites/redirects 清单，并设置 `<link rel="canonical">` 指向 `/site/...`，防止 SEO 重复。新版稳定后再执行 301 重定向并下线旧 HTML；其他尚未迁移的页面继续使用原静态文件。
- 将现代应用页面迁移到 `app/(dashboard)/` 路由分组，避免根布局重复渲染两个导航体系。

### 前端布局与组件草案
- 目录结构：在 `app/(site)/` 下新增 `layout.tsx` 作为公共布局，内部引入 `SiteHeader`, `SiteFooter`, `SiteMeta` 组件；页面文件包括 `page.tsx`（首页）与 `history/page.tsx`（发展历程），其余页面未来按需增补。
- 组件职责：
  - `SiteHeader`：以 React 还原 `components/header.html`，保留数据属性用于移动端菜单切换，导航链接根据登录态（`UserContext`）显示写作/管理入口。
  - `SiteFooter`：渲染版权、快速链接与动态年份；年份逻辑改写为 React `useEffect`。
  - `buildSiteMetadata`：在页面/server 组件中构造 Next Metadata，统一 title/description/OG，替换原 `meta.js` 动态注入方式。
- 行为保持：
  - 移动端菜单：复用 `common.js` 的交互逻辑，在 React 中通过 `useEffect` 绑定/解绑监听，或拆分出 `useMobileNav` hook。
  - 平滑滚动与跳转：使用 `framer-motion` 之类库非必须，初期保留原 `scrollIntoView` 实现。
  - 旧站入口：导航保留 `href="/index.html"` 等链接，直到全部页面迁移完成。
  - 历史页数据：使用 SWR + useSWRInfinite 管理分页加载、错误重试与 IntersectionObserver 自动加载。

### `GET /timeline` API 契约（草案）
| 项目 | 说明 |
|------|------|
| 方法 | `GET` |
| 路径 | `/api/timeline` |
| 查询参数 | `page` (默认 1), `limit` (默认 8, 上限 20), `order` (`asc`/`desc`), `year` (可选，年份或关键词) |
| 成功响应 | `200 OK`，主体：`{ data: TimelineEvent[], meta: { page, limit, total, totalPages, order, hasNext } }` |
| 失败响应 | `400 Bad Request`（参数非法），`500 Internal Server Error`（数据库异常）；统一返回 `{ error: { code, message }, message }` |
| 认证 | 阶段一为公共只读，不需认证；后台写操作由 T002 负责 (`POST/PUT/DELETE /timeline`) |
| 缓存建议 | API 可加 `Cache-Control: max-age=60`；前端配合 SWR/RTK Query 带有 60 秒缓存 |

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

### 样式迁移指南（节选）
1. **基础变量**：保留 `:root` 中的色彩、字体变量（`--color-primary`, `--color-surface`, `--shadow-soft`），在 `app/(site)/globals.css` 中引入，未来可映射至 Tailwind `theme.extend`.
2. **网格布局**：`modules-grid`, `timeline`, `company-grid` 等类初期作为全局样式导入；后续可拆成 CSS Modules：`modules-grid` → `SiteModules.module.css`.
3. **动画效果**：`module-card`、`timeline-item` 使用的 `opacity/transform` 过渡改写为 CSS 自定义属性 + React `useEffect`；可选使用 IntersectionObserver hook 统一处理。
4. **可访问性样式**：保留 `.skip-link`, `.nav-menu--open`, `.back-button` 等辅助类，迁移时重点确保焦点可见性与对比度。
- **阶段化策略**：
  1. 完整复制 `styles.css` 为 `app/site/styles-legacy.css`，全局引用，确保像素一致。
  2. 编制 CSS 变量映射表，逐步迁移通用变量至 `globals.css`。
  3. 按模块拆分为 CSS Modules/Tailwind，移除对应的 legacy 片段，保持单一来源。

### 阶段一验收标准
- **UI & 交互**：React 页面与 `frontend/public` 对应页面在桌面/移动端的布局、动画、导航行为一致；移动端菜单与平滑滚动无回归。
- **数据准确性**：`/timeline` API 返回内容与原 JSON 数据一致，分页/排序可通过手动测试验证；前端加载、空态、错误态处置得当。
- **SEO & 元数据**：每页提供正确的 `<title>`、`description`、OG/Twitter 标签，并生成静态 `sitemap.xml` 条目。
- **回退机制**：部署后保留旧版路径（`/index.html` 等），发生异常时可切换至 `_legacy-static`；数据库迁移支持回滚脚本。
- **质量保障**：完成冒烟测试（Chrome/Safari/移动端），关键交互经 QA 或自测 checklist 确认并在 `dev_notes.md` 登记。

## 数据迁移建议
- `timeline.json` → `TimelineEvent`（字段：`id`、`slug`、`year_label`、`title`、`description`、`sort_order`、时间戳）；
- `papers.json` → `Paper`、`PaperTag`、`PaperTagRelation`（支持多标签、年份检索、链接）；
- `links.json` → `LinkSection`、`LinkGroup`、`Link`（支持分组排序与描述）。

其余纯内容页面可暂存 Markdown/静态文件，后续与 CMS 方案一并规划。

## 测试与验证计划
- **后端单测**：已补充 Vitest + Supertest 配置及 `tests/timeline.test.js` 示例，覆盖分页、排序和年份筛选（需在可联网环境执行 `cd backend && npm install && npm run prisma:migrate && npm run test`）。
- **前端组件测试（待实现）**：使用 React Testing Library 验证 `TimelineFeed` 的加载、空态、错误重试按钮与 IntersectionObserver 触发行为（待安装相关依赖后编写测试用例）。
- **E2E 测试（待实现）**：使用 Playwright 模拟 `访客 -> /site -> /site/history -> 加载更多` 流程，断言时间线数据展示与回退链接可用。
- **性能与可用性检查**：记录 `/site` 与旧版 `/index.html` 的首屏加载、API 响应时间，并关注 Lighthouse 基线。
- **监控校验**：与运维确认 Sentry/慢查询告警阈值，在部署前演练 API 故障回退（旧站切换/静态数据回退）。


## 监控与运维要求
- 生产环境接入错误监控（如 Sentry）与日志系统，监控指标包括 API 错误率 > 1%、慢查询、前端错误采样、关键页面停留/跳出率。
- 部署脚本需在 `NODE_ENV=production` 时初始化监控 SDK，并验证告警通道（如测试触发一次故障）。
- 与运维协调数据库慢查询日志与报警策略，定期检查 `timelineEvent` 查询性能。

## 部署与回滚建议
- 部署流程：依次执行 `npm run prisma:migrate`、`npm run seed:timeline -- --dry-run`、`npm run seed:timeline`；前端运行 `npm run build` 并确认 rewrites 生效。
- 回滚策略：保留 `frontend/public/` 旧版页面，必要时切换导航至旧版 `/index.html` / `/history.html` 并停止 `/api/timeline` 调用；数据库可使用 JSON 备份重新导入。
- 配置校验：上线前确认 `NEXT_PUBLIC_API_URL`、监控 DSN、数据库凭据、Sentry/慢查询告警阈值，部署后记录性能对比。

## 依赖与环境约束
- 在 `package.json` 声明 `engines`（Node ≥ 18、npm ≥ 9），并锁定关键依赖版本（例如 `@types/node` 使用确定版本）。
- 前端新增 `swr` 依赖，用于时间线分页/重试逻辑；相关组件需保持一致的 fetcher 接口。
- 已提交基础 ESLint 配置（extends `next/core-web-vitals`），后续如需新增规则/插件请同步更新脚本与 CI；`npm run lint` 已通过，当前存在 TypeScript 版本提示（5.9.3 超出 @typescript-eslint 官方支持范围），如需升级需同步更新 linter 生态或锁定 TypeScript 版本。
- CI 环境需遵循相同的 Node/npm 版本，避免迁移脚本或 Next.js 构建出现不一致。

## 依赖与风险
- 依赖 T002 后台管理扩展提供数据录入能力；
- 需与后端确认数据库 schema 与迁移安排；
- 在未完成阶段一前不建议直接替换生产站点，保留 `_legacy-static` 作为回退。

## 交付物清单
- [x] 前后端代码实现（含 `/site` 页面与 `/api/timeline` 路由）
- [ ] 数据迁移脚本与执行日志（含验证输出）
- [ ] API 文档（Swagger/Postman 或 Markdown 说明）
- [ ] 测试报告（单元/集成覆盖率、E2E 录屏）——计划覆盖 `/api/timeline` 接口（分页/筛选/错误）、TimelineFeed 无限滚动组件、以及“访问首页→发展历史→加载更多”关键用户流程
- [ ] 部署手册（含 rewrites、环境变量、监控接入步骤）——需要补充生产 rewrites/重定向及监控告警配置
- [ ] 回滚预案与验证流程
- [ ] 性能对比报告（首屏、API 响应）——上线前记录 `/site` 与旧版页面的加载对比
- [ ] 风险评估表（含监控与告警配置）——覆盖 API 失败回退方案与旧站切换路径
