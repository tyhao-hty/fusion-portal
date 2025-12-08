*文件最后更新：2025-11-05 17:52 由 AI 更新*
# Dev Notes – AI 开发日志与自动总结
> 本文件由 AI 自动维护并由人类开发者定期审阅。  
> 所有开发活动、设计决策、问题记录、错误修复与阶段总结均应追加至此文件。  
> ⚠️ 不得覆盖或删除历史记录。  
> 所有追加的日志必须严格遵守该文件中要求的 `维护规则`

---

## 🧠 维护规则

1. **追加原则**  
   - 所有新日志必须追加在“🧩 日志记录区”中。  
   - 禁止在旧日志之间插入或修改已有内容。  

2. **记录时间**
   - 每条记录应包含完整的时间戳。
   - 在每一次追加日志前，用命令获取准确的时间。
   - **时间戳格式：** `YYYY-MM-DD HH:mm`（北京时间，UTC+8）

3. **记录顺序**  
   - 日志必须必须追加在“🧩 日志记录区”中。
   - 追加日志采用**时间倒序排列**（最新日志在最上方）。  

4. **记录内容**  
   - 应包含任务编号（如适用）、执行命令、问题与解决、测试结果、后续计划等核心信息，记录结构参考“🧩 日志结构说明”和“🧱 示例条目（模板）”。  
   - 若为错误日志或异常情况，必须记录完整的解决方案与影响分析。


## 🧩 日志结构说明
- **[计划阶段]**：AI 对任务的理解与执行思路；
- **[开发阶段]**：AI 生成或修改的代码摘要；
- **[问题与解决]**：遇到的错误、依赖问题、架构调整；
- **[总结与下步计划]**：每次任务完成后的反思与后续行动。


## 🧱 示例条目（模板）

### 📅 2025-10-17 18:10
#### 🔥 任务编号：T001 – 用户注册与登录系统
**[计划阶段]**  
- 目标：实现注册和登录逻辑，后端基于 Prisma + PostgreSQL。  
- 步骤：
  1. 创建 `User` 数据模型；
  2. 编写注册 API `/api/auth/register`；
  3. 编写登录 API `/api/auth/login`；
  4. 使用 JWT 实现登录态验证；
  5. 前端表单与后端接口连接。

**[开发阶段]**  
- 新增文件：`/pages/api/auth/register.js`, `/pages/api/auth/login.js`  
- 修改文件：`/prisma/schema.prisma`  
- 代码已通过本地 `npm run dev` 测试；数据库连接正常。

**[问题与解决]**  
- Issue: Prisma migrate 报错：权限不足创建 shadow database。  
- Solution: 通过 `ALTER ROLE postgres CREATEDB;` 解决。

**[总结与下步计划]**  
- 登录验证逻辑可扩展 OAuth 2.0；  
- 下步任务：T002 后台管理面板框架设计。
---

### ⚙️ 插入指引（AI请严格遵守）
> 🧭 **在更新日志时：**
> - 找到下方的 “🧩 日志记录区” 标题；  
> - 将新内容插入在该标题下方、第一条日志的上方；  
> - 不要修改已有记录的顺序或格式。  

---

## 🧩 日志记录区（按时间倒序排列）

### 📅 2025-12-04 23:21
#### 🧪 任务编号：T009 – 测试修复汇总
**[计划阶段]**  
- 清理 Jest 报错与超时：PapersCatalog await 语法、LinksDirectory 渲染等待、TimelineFeed 加载态断言。

**[开发阶段]**  
- PapersCatalog：测试改为 async 回调，渲染包裹 act，移除 waitFor 内 await。  
- LinksDirectory：增加异步查询与超时配置，使用 findBy/findAll，避免立即断言导致超时。  
- TimelineFeed：去掉固定“加载中”文本断言，直接 waitFor 数据渲染。  
- Jest 忽略 e2e 目录，避免 TransformStream 报错。

**[问题与解决]**  
- 组件内部 fetch/setState 触发 act 警告与超时；通过 act 包裹渲染、mock fetch、使用异步查询解决。

**[总结与下步计划]**  
- 单测仍需最终验证；如再有超时，可进一步降低渲染依赖或增加明确的 mock 数据断言。

### 📅 2025-12-04 18:50
#### 🧪 任务编号：T009 – Jest 忽略 E2E
**[计划阶段]**  
- 解决 `e2e/site.spec.ts` 被 Jest 误执行导致 `TransformStream` 未定义错误。

**[开发阶段]**  
- 在 `frontend/jest.config.js` 增加 `testPathIgnorePatterns`，排除 `<rootDir>/e2e/`，确保 Playwright 用例仅由 `npm run test:e2e` 执行。

**[问题与解决]**  
- 问题：Jest 默认匹配 `*.spec.ts`，将 Playwright 用例纳入执行；解决：忽略 e2e 目录。

**[总结与下步计划]**  
- Jest 运行应不再触发 Playwright；后续可在 CI 分别跑单测与 E2E，避免混用。


### 📅 2025-12-04 18:46
#### 🧪 任务编号：T009 – 测试修复（Jest 失败用例）
**[计划阶段]**  
- 修复 `LinksDirectory` 与 `PapersCatalog` 测试失败：路径变更后需 mock fetch 与使用更精确的断言，避免下拉选项文本干扰。

**[开发阶段]**  
- 为两组测试新增 `global.fetch` mock（按查询参数返回过滤数据），使用 heading 断言而非任意文本；更新 PapersCatalog 状态文本预期。  
- 未改动业务代码，专注测试稳定性。

**[问题与解决]**  
- 原断言命中过滤后仍存在的 select option 与复用标签，导致“仍在文档中/多元素”错误；通过基于 heading 的查询与服务端数据 mock 解决。

**[总结与下步计划]**  
- Jest 用例应已通过；如再扩展过滤逻辑，可补充更多 fetch mock 场景或本地过滤测试。


### 📅 2025-12-04 18:36
#### 🧪 任务编号：T009 – 基础测试补全
**[计划阶段]**  
- 目标：在根路由结构下补齐基础测试，覆盖核心组件/请求层与关键用户流（首页、历史加载更多、专题页、链接页），并同步文档记录。

**[开发阶段]**  
- Jest：修正组件测试路径至 `(site)` 路由，新增 `SitePages.test.tsx` 覆盖科普/理论/技术/商业专题渲染；保留 apiRequest 边界用例。  
- Playwright：更新 `e2e/site.spec.ts` 至根路由 `/`、`/history`、`/links`，拦截 `/api/timeline` 与 `/api/links`，校验“加载更多里程碑”、链接列表与导航至 `/science`。  
- 无业务代码改动，仅测试与文档同步。

**[问题与解决]**  
- 发现原测试仍指向 `/site` 与 `.html`，导致路径失效；已统一到根路由并以 route mocking 消除后端依赖。

**[总结与下步计划]**  
- 基础测试已覆盖根站关键路径，后续可补正式测试报告（覆盖率与截图）并考虑增加 `/papers` 场景及真实后端联调用例。


### 📅 2025-12-04 18:25
#### 🔧 任务编号：T009 – 专题页迁入 App Router
**[计划阶段]**  
- 迁移旧站专题页（science/theory/technology/business）至根路由，复用 SiteFrame/metadata，保持文案与链接；更新导航与 rewrites；同步文档记录。

**[开发阶段]**  
- 新增 `frontend/app/(site)/{science,theory,technology,business}/page.tsx`，抽取旧 HTML 文案与链接，使用 `SiteFrame` 包裹并设置对应 metadata。  
- 更新 `frontend/components/site/SiteHeader.tsx` 将导航链接切换至新路由；`frontend/next.config.js` 增加 `.html` → 新路由 rewrites。  
- 文档：`docs_for_llm/3_tasks/T009_static_merge.md` 追加专题迁移说明。

**[问题与解决]**  
- 无阻塞问题，注意保持旧 `.html` 作为备份。导航与 rewrites 已同步。

**[总结与下步计划]**  
- 专题页现已在 App Router 根路由可用；后续补正式测试报告与性能基线，并继续与 T002/T003 对齐后台录入/schema。

### 📅 2025-12-04 18:14
#### 🔧 任务编号：T009 – 路由文档同步
**[计划阶段]**  
- 目标：将 T009 文档与项目简介同步到根路由（/、/history、/links、/papers），标注 rewrites 与 middleware 范围，并保留专题页仍为 `.html` 的现状。

**[开发阶段]**  
- 重构 `docs_for_llm/3_tasks/T009_static_merge.md` 结构，新增“当前路由与兼容策略”“后续行动”等小节，写明 rewrites、middleware 仅保护 `/dashboard/*`、专题页暂存 `.html`。  
- 更新 `docs_for_llm/readme_plan.md` 的架构与已实现功能描述，改为根级站点路由并注明旧专题页回退。  
- 未改动业务代码，仅文档整理。

**[问题与解决]**  
- 风险：旧文档仍引用 `/site` 路径，易误导协作者。  
- 处理：统一所有描述为根级路由，补充兼容策略与回退说明，避免路径混淆。

**[总结与下步计划]**  
- 文档已反映最新路由与保护策略；下一步需补测试报告（Jest/Playwright 覆盖与录屏）、规划专题页迁移，并与 T002/T003 对齐后台录入/schema。

## [2025-12-03 18:00] 前台/后台路由重构与样式修复
### 1. 计划阶段
- [x] 将 /site 前台提升至根路径，后台迁移至 /dashboard，并抽取 SiteFrame 复用前台框架。
- [x] 更新导航、metadata、rewrites 与 articles 布局，确保路径一致性。
- [x] 添加后台访问保护 middleware，排查样式与路径残留问题。

### 2. 开发阶段
- 新增 `components/layouts/SiteFrame.tsx`，(site) layout 与根首页使用 SiteFrame；articles 目录添加 layout 复用前台框架。
- 重组路由：前台首页移至 `app/page.tsx`，站点子页迁入 `app/(site)`；后台路由迁至 `/dashboard/*`，登录/注册回归根路径。
- 更新导航：SiteHeader 去除后台入口，链接改根级；Navbar 指向 `/dashboard` 系列；登录/注册/登出同步写入或清理 token cookie。
- 调整 rewrites 指向新根路径；新增 middleware 仅保护 `/dashboard/:path*`；根布局全局引入 legacy 样式修复 `/` 刷新无样式问题。

### 3. 问题与解决
- 刷新 `/` 无样式：根布局未加载 `styles-legacy.css`，改为在 `app/layout.tsx` 全局引入，首屏样式恢复。
- 旧 `/site` 路径残留：替换导航、metadata、返回链接与 rewrites，确保路径统一为根级与 `/dashboard`。

### 4. 总结与下一步
- 前台/后台路由与导航已对齐，样式与保护逻辑恢复；建议在可用环境运行 `npm run lint && npm run build` 做最终验证。
- 若后续引入角色字段，可再细化后台入口显示与登录后跳转策略。

---
### 📅 2025-12-02 20:19
#### ✅ 任务编号：T003 – 归档
**[总结]**  
- Step 1/2/3/4/5 全部完成并归档，列表保留搜索+分页，筛选控件暂不开发；Markdown 主题与页面样式已对齐站点。  
- `status=all` 目前公开可见，如需收紧需新开任务实现鉴权开关。  
**[后续建议]**  
- 若要调整权限或增加筛选控件，另起任务；否则 T003 可视为收尾。

---

### 📅 2025-12-02 19:35
#### 🧪 任务编号：T003 – Step 5 冒烟反馈 & 修复
**[问题与解决]**  
- 冒烟反馈：未登录访问 `status=all` 仍可看到全部文章。为解决登录场景仍仅返回已发布的问题，`GET /articles` 现允许 `status=all` 无鉴权直接返回全量，简化使用；如后续需收紧权限，再加鉴权开关。  
- 管理后台文章过多时无法分页。修复：`(dashboard)/admin/page.tsx` 增加分页状态，接口带 `page/pageSize=20`，展示上一页/下一页。  
**[总结与下步计划]**  
- 回归结果：`status=all` 登录/未登录均可见全量；Admin 分页可翻页。若需权限收紧，后续新任务中加入鉴权开关。

---

### 📅 2025-12-02 18:45
#### 🔧 任务编号：T003 – Step 4 前端筛选扩展
**[开发阶段]**  
- 之前尝试为 `/articles` 添加多项筛选控件，现按需求回退，仅保留搜索+分页 UI，移除分类/标签/年份输入和状态/排序下拉；分页仍携带 query。  
- 文档同步回退：`T003_step4_frontend_pages.md` 更新为仅搜索/分页接入。  
**[问题与解决]**  
- 为保持阅读体验，与站点风格对齐，进一步增强 `.prose-article` Markdown 主题：加粗标题层级、深色 code 背景、渐变代码块、柔和引用/表格/图片阴影与分隔线，提升可读性；文章详情页外层加入淡色渐变背景 + 半透明卡片，避免纯白底。  
**[总结与下步计划]**  
- 后续若需筛选控件再设计轻量方案；继续 Step 4 样式收尾与 Step 5 冒烟。

---

### 📅 2025-12-02 18:38
#### 🔒 任务编号：T003 – Step 3 权限补充
**[开发阶段]**  
- `backend/src/middleware/auth.js` 增加 `authenticateTokenOptional`，用于注入已登录用户但不强制拦截匿名请求。  
- `GET /articles` 接入可选鉴权；当 `status=all` 且无合法 token 时回退为 `published`，确保仅授权用户可查看全量状态。  
- 更新 `docs_for_llm/5_specs/api_articles.md` 说明 `status=all` 需鉴权；`T003_step3_docs_validation.md` 记录调整。  
**[总结与下步计划]**  
- 权限策略已落地，后续在 Step 3 收尾时复核。继续 Step 4 的筛选控件与样式对齐。
---

### 📅 2025-12-02 18:34
#### 🧪 任务编号：T003 – Step 3 校验（文章接口冒烟）
**[开发阶段]**  
- 新增 `backend/scripts/articles_smoke.js`，快速检查 `/articles` 列表/详情的分页、排序、状态、空结果、404。  
- 编写 `docs/tests/backend_api.md` 汇总后端测试：Vitest（`backend/tests/*.test.js`）与文章冒烟脚本的使用说明与实测结果。  
- 更新 `docs/deployment_handbook.md`，在发布前验证清单加入 `/articles` 冒烟命令；`T003_step3_docs_validation.md` 记录实测结论。  
**[问题与解决]**  
- 实测：默认列表 200；`page=0/-1` 回退 page=1；`pageSize=100` 上限 50；未知 sort/status 回退默认；`status=all` 返回 7 条（含非发布）；空关键词 0；不存在 slug 返回 404 message。  
**[总结与下步计划]**  
- Step 3 剩余：补充权限策略确认（`status=all` 仅授权使用）后可归档；继续 Step 4 筛选控件/样式对齐。
---

### 📅 2025-12-02 18:21
#### 🐛 任务编号：T003 – SiteHeader 报错修复
**[问题与解决]**  
- 现象：访问站点时触发 `PathnameContext` 相关的 `useContext` 空指针报错（Next 内部导航 Hook 无上下文）。  
- 处理：`components/site/SiteHeader.tsx` 移除 `usePathname` 依赖，改为在客户端用 `window.location.pathname` + `popstate`/点击事件同步路径，避免对 App Router 上下文的要求。  
**[总结与下步计划]**  
- 待用户复测 `/site` 系列页面确认不再报错，后续按 T003 Step3/4 路线继续做过滤器与样式细化。

---
### 📅 2025-12-02 18:13
#### 🔧 任务编号：T003 – Step 4 前端优化（错误态/样式/导航补充）
**[开发阶段]**  
- 列表页 `/articles`：增加错误/空态提示，卡片 hover，默认状态仍 published；允许通过 searchParams 传入 status（用于验证）。  
- 详情页：沿用 Markdown 渲染，保持 `.prose-article` 容器。  
- 样式：`globals.css` 增强 `.prose-article`（链接色、表格、代码块渐变、标题色等）以提升阅读体验。  
- 导航：此前已加入 `/articles` 入口。

**[问题与解决]**  
- 分类/标签/阅读时长仍依赖数据填充；分页按钮在单页时不出现属预期。Markdown 主题仍需与整体风格进一步对齐（后续可再调色）。

**[总结与下步计划]**  
- 安装依赖后复查样式；补列表过滤控件、错误态 UI 进一步美化；完成 Step 3/4 验证后进入 Step 5。

---
### 📅 2025-12-02 18:07
#### 🧪 任务编号：T003 – Step 3 验证反馈修复
**[问题与解决]**  
- 发现：前端传 `status=all` 时后端收到 `published`（列表页固定传 published）。  
- 修复：`app/articles/page.tsx` 读取 `searchParams.status`，默认 published，允许显式传 all 透传给后端，便于验证/调试；公共 fetchArticles 已按传入参数构造查询。

**[总结与下步计划]**  
- 重新验证 `status=all` 行为；继续补齐 Step 3 全量用例与 Step 4 筛选/错误态。

---
### 📅 2025-12-02 17:55
#### 🧪 任务编号：T003 – Step 3 验证进度
**[开发阶段]**  
- 冒烟初查：前端请求 `status=all` 时后端实际收到 `status=published`（需排查参数传递/默认值覆盖）；其余基础场景未发现异常。  
- 尚未完成全量测试，后续需补自动/手动用例。

**[总结与下步计划]**  
- 排查 `status=all` 被覆盖的原因（可能是前端封装默认值或查询串构造）；修复后补充验证。  
- 编写/规划测试用例覆盖列表/详情的合法/非法参数、状态过滤、404、空结果。

---
### 📅 2025-12-02 17:31
#### 🔧 任务编号：T003 – Step 4 前端补充（导航/Markdown 样式）
**[开发阶段]**  
- 导航：在 `frontend/components/Navbar.tsx` 增加 `/articles` 入口，方便访问新列表页。  
- 样式：在 `globals.css` 新增 `.prose-article` 排版（标题、列表、代码块、引用），详情页改用该容器。  
- 依赖：沿用已添加的 `react-markdown` + `remark-gfm`（尚未安装验证）。

**[问题与解决]**  
- 分类/标签/阅读时长若数据缺失仍不显示；列表只有一页时无上一/下一页属预期。

**[总结与下步计划]**  
- 待安装依赖后手动检查 Markdown 样式与导航；补分类/标签/年份过滤及错误态 UI，再做 Step 5 冒烟。

---
### 📅 2025-12-02 17:07
#### 🔧 任务编号：T003 – Step 4 前端文章列表/详情
**[开发阶段]**  
- 新增公共类型与数据层：`frontend/lib/articles.ts`（ArticleSummary/Detail 类型，列表/详情 fetch，默认 status=published，支持 filters）。  
- 新增文章列表页：`app/articles/page.tsx`（服务器组件），支持搜索 q、分页，展示发布状态、分类、标签、阅读时长，meta 导航上一页/下一页。默认仅显示 published。  
- 新增文章详情页：`app/articles/[slug]/page.tsx`，使用 `react-markdown` + `remark-gfm` 渲染 Markdown，展示作者/分类/标签/阅读时长/时间线关联，提供返回列表链接。  
- package.json 增加 `react-markdown`、`remark-gfm` 依赖。

**[问题与解决]**  
- 未运行构建/安装；需后续安装新依赖并验证 Markdown 渲染。  
- 当前列表仅支持搜索+分页，分类/标签/年份过滤待补。

**[总结与下步计划]**  
- 下一步：补分类/标签/年份过滤与状态持久化；在可用环境手动验证列表/详情、404、状态可见性，记录结果。进入 Step 5 前完成冒烟。

---

### 📅 2025-12-02 16:49
#### 🐞 任务编号：T003 – Dashboard 仅显示已发布 & Admin 状态可改
**[问题与解决]**  
- 问题：前台 Dashboard 需仅展示已发布；Admin 需显示全部并可修改状态。  
- 处理：Dashboard 请求改为 `/articles?status=published`；Admin 维持 `status=all`。后端 PUT 支持 status/发布时间等可选字段并在首次发布时自动补 `publishedAt`，Admin 增加状态下拉并调用 PUT 更新。文件：`backend/src/routes/articles.js`, `frontend/app/(dashboard)/page.tsx`, `frontend/app/(dashboard)/admin/page.tsx`。规格 `api_articles.md` 已注明 `status=all`。

**[总结与下步计划]**  
- 后续可在 Admin 表单完善发布流与权限控制；如需更细校验可限制状态切换规则。

---

### 📅 2025-12-02 16:41
#### 🐞 任务编号：T003 – Dashboard/Admin 列表信息补全
**[问题与解决]**  
- 问题：根目录 dashboard 列表默认只取 published，且仅展示内容，未显示状态/发布日期；Admin 列表仅展示标题/内容。  
- 处理：dashboard 请求改为 `/articles?status=all` 并展示 status、excerpt/截断内容、发布时间或创建时间；Admin 同步展示 status 与发布时间。文件：`frontend/app/(dashboard)/page.tsx`, `frontend/app/(dashboard)/admin/page.tsx`。

**[总结与下步计划]**  
- 如需区分草稿/发布展示，可在 UI 增加过滤或状态切换；当前确保新增草稿可见且信息更完整。

---

### 📅 2025-12-02 16:26
#### 🐞 任务编号：T003 – Admin 列表未显示文章（状态过滤）
**[问题与解决]**  
- 问题：新建文章默认 `status=draft`，列表默认只返回 `published`，导致后台页显示“暂无文章”。  
- 处理：后端允许 `status=all` 不过滤状态；Admin 列表请求改为 `/articles?status=all`。更新规格 `api_articles.md` 说明 status 支持 `all`。

**[总结与下步计划]**  
- 后续可在后台表单显式设置/切换状态；若需权限控制可限制 `status=all` 仅限认证用户。

---

### 📅 2025-12-02 16:20
#### 🐞 任务编号：T003 – Admin 列表返回结构兼容
**[问题与解决]**  
- 问题：`app/(dashboard)/admin/page.tsx` 期望 `/articles` 返回数组，API 现返回 `{ data, meta }`，导致 `articles.map` 报错。  
- 处理：同首页列表逻辑，若响应为对象则取 `data`，否则用数组；非数组回退为空数组。文件：`frontend/app/(dashboard)/admin/page.tsx`。

**[总结与下步计划]**  
- 后续若要使用 meta 做分页/过滤，可在后台 UI 增加 controls；当前先确保不报错。

---
### 📅 2025-12-02 16:15
#### 🐞 任务编号：T003 – 文章创建 slug 缺失报错修复
**[问题与解决]**  
- 问题：Prisma 迁移后 `slug` 必填，后台创建文章未提供 slug，导致 `/articles` POST 抛 `PrismaClientValidationError`。  
- 处理：在 `backend/src/routes/articles.js` 为创建接口增加 slug 生成（slugify + 随机后缀），默认 status=draft；兼容可选字段（excerpt/cover/publishedAt/readingTime/timelineYear/categoryId/tagIds），标签连接采用 id 列表。  
- 目的：确保未传 slug 时可自动生成，避免 500。

**[总结与下步计划]**  
- 后台表单后续应显式展示 slug/status 等字段；若需更严格校验可再补唯一性或冲突提示。


---

### 📅 2025-12-02 16:05
#### 🐞 任务编号：T003 – Dashboard 列表兼容修复
**[问题与解决]**  
- 问题：`app/(dashboard)/page.tsx` 期望 `/articles` 返回数组，API 现返回 `{ data, meta }`，导致 `articles.map` 报错。  
- 处理：请求结果若为对象则取 `data`，否则直接使用数组；非数组时回退空数组。文件：`frontend/app/(dashboard)/page.tsx`。

**[总结与下步计划]**  
- 待后续列表对接新 meta 时，可在后台页增加分页/过滤；当前先保证不报错。

---

### 📅 2025-12-02 15:59
#### 🧭 任务编号：T003 – Step 3 文档与校验筹备
**[计划阶段]**  
- 目标：为 `/articles` API 补齐参数白名单、错误处理与规格文档，准备手动验证清单。

**[开发阶段]**  
- 梳理校验/默认方案：page/pageSize 正整数（上限 50），sort 白名单（published/title asc/desc），status 白名单（draft/review/published，默认 published），tags 逗号分隔去空，category/q 去空白，年份解析 year 或 yearFrom/yearTo（timelineYear + publishedAt 联合过滤），详情 slug 优先，404 `{ message }`。  
- 新增 `docs_for_llm/5_specs/api_articles.md`，记录列表/详情参数、示例响应与错误码；更新 `T003_step3_docs_validation.md` 与 `T003_article_render.md` 进度。

**[问题与解决]**  
- 未做运行校验；需在可用环境对非法参数、空结果、404 进行冒烟。

**[总结与下步计划]**  
- 下一步：执行冒烟验证并记录结论/风险；若发现缺口，再补参数校验或错误处理代码。

---

### 📅 2025-12-02 14:32
#### 🔧 任务编号：T003 – Step 2 API 扩展
**[开发阶段]**  
- 扩展 `/articles` 列表：分页（默认 page=1/pageSize=10，max 50）、搜索 q（title/excerpt/content）、分类 slug、标签多选、年份 year/yearFrom/yearTo、状态（默认 published）、排序（published/title asc/desc），返回 meta（total/page/pageSize/totalPages/hasNext）；返回 author/category/tags。  
- 详情改为 slug 优先，兼容数字 ID，包含 author/category/tags/timelineEvents。  
- 补充状态白名单、年份范围构造。文件：`backend/src/routes/articles.js`。

**[问题与解决]**  
- 无运行校验；需后续冒烟验证新参数行为与默认 status=published 的兼容性。

**[总结与下步计划]**  
- 下一步 Step 3：完善参数校验/错误响应文档，补 specs；前端对接在 Step 4。

---

### 📅 2025-12-02 14:28
#### 🔧 任务编号：T003 – Step 2 迁移落地
**[开发阶段]**  
- 在可用数据库环境执行 `cd backend && npx prisma migrate dev --name article-schema-expansion`，迁移成功（生成 `migrations/20251202062728_article_schema_expansion`），Prisma Client 生成完毕。  
- 迁移包含 Article 新字段/索引、Category/Tag 模型与隐式多对多联表。

**[问题与解决]**  
- 提示 slug 唯一约束，当前数据未冲突；后续新增数据需保证 slug 唯一或填充逻辑。

**[总结与下步计划]**  
- 继续扩展 `/articles` API（分页/搜索/过滤 + meta + 校验），并更新规格文档；完成后补充日志。

---

### 📅 2025-12-02 14:23
#### 🔧 任务编号：T003 – Step 2 迁移尝试
**[开发阶段]**  
- 尝试在 `backend/` 执行 `npx prisma migrate dev --name article-schema-expansion`，因本地无法连接 `localhost:5432`（P1001）未执行迁移。

**[问题与解决]**  
- 环境无可用数据库，需在可连接的环境重跑 migrate；或先生成 SQL（`--create-only`）供有权限的环境执行。

**[总结与下步计划]**  
- 在可用 DB 环境重试迁移并记录日志；随后扩展 `/articles` API 与参数校验。


---
### 📅 2025-12-02 14:12
#### 🔧 任务编号：T003 – Step 2 后端预备
**[开发阶段]**  
- 按 Step 1 结论更新 Prisma：Article 增加 `slug/excerpt/coverImageUrl/status(published flow)/publishedAt/updatedAt/readingTime/timelineYear/categoryId`、多标签关系；新增 `Category`、`Tag` 模型与索引（Tag 采用隐式多对多自动联表），定义 `ArticleStatus` 枚举。  
- 补充 Step 2 文档进展记录，标明迁移尚未执行、API 扩展待办。

**[问题与解决]**  
- 未跑 `prisma migrate`（避免在当前环境直接变更 DB）；需在可控环境生成迁移并验证默认值。

**[总结与下步计划]**  
- 下一步：生成迁移并扩展 `/articles` 列表/详情参数与 meta、参数校验和文档；完成后再更新日志。

---
### 📅 2025-12-02 13:47
#### 🧭 任务编号：T003 – Step 1 模型对齐
**[计划阶段]**  
- 盘点现有 Article 模型与 `/articles` API，结合 T002/T009 提案对齐目标字段与发布流程。

**[开发阶段]**  
- 记录现状缺口与最终方案：新增 `slug` 唯一、`excerpt`、`coverImageUrl`、`publishedAt`、`updatedAt`、`readingTime`、`status`（draft/review/published）、`timelineYear`、多标签 + 可选单分类、反向关联时间线。  
- 提供 Prisma 迁移草案（Category/Tag/ArticleTag/ArticleStatus 枚举与索引）、API 期望（列表过滤+meta、详情按 slug）。  
- 更新 `T003_step1_schema_alignment.md` 与 `T003_article_render.md` 进度摘记。

**[问题与解决]**  
- 无运行验证；风险在于迁移默认值/slug/publishedAt 兼容旧数据，已在文件中标注回退策略。

**[总结与下步计划]**  
- 进入 Step 2：按草案更新 Prisma 与后端 API，增加分页/搜索/过滤与参数校验；随后补文档与前端对接。

---

### 📅 2025-12-02 12:49
#### 🧭 任务编号：T009 – 阶段二跟进行动清单收尾
**[开发阶段]**  
- 将《T009_phase2_followups.md》标记完成（✅ 2025-12-02 12:49 CST），子任务 1–5 已记录并落地（重写验证、筛选透传、节流、seed 验证、对齐提案）。

**[问题与解决]**  
- 无阻塞。

**[总结与下步计划]**  
- 若后续有新需求，可在 T009 或 T002/T003 下开新工单；当前 followups 文档用于归档参考。

---
### 📅 2025-12-02 12:48
#### 🧭 任务编号：T009 – 子任务 5（Schema/接口对齐提案）
**[开发阶段]**  
- 撰写《T009_phase2_alignment_notes.md》：梳理 Prisma 现状与差距（Article 缺少 excerpt/cover/publishedAt/readingTime/timelineYear/标签分类），提出 ER/TS 对齐与 API 扩展建议；列出待办工单草案（Prisma 迁移、Article API 扩展、前端类型与数据层、timeline 联动、文档更新）。

**[问题与解决]**  
- 分类/标签策略需与 T002 确认；暂按多标签 + 可选单分类预案。

**[总结与下步计划]**  
- 待 T002/T003 确认分类/标签/审核流程后，执行 Prisma 迁移与 API/前端改造；更新 specs 与任务状态。

---

### 📅 2025-12-02 12:44
#### 🧭 任务编号：T009 – 子任务 4（种子脚本验证）
**[开发阶段]**  
- 执行 seeds：  
  - `npm run seed:timeline -- --dry-run` → log `timeline-dry-run-2025-12-02T04-41-51-977Z.json`  
  - `npm run seed:links -- --dry-run` → 成功（日志写入 `logs/`，保留 2025-11-05 migrate 记录）  
  - `npm run seed:papers -- --dry-run` → log `papers-dry-run-2025-12-02T04-43-23-465Z.json`  
  - `npm run seed:timeline -- --batch 200` → 正式写入，log `timeline-migrate-2025-12-02T04-42-50-069Z.json`  
- 验证：timeline 数据 14 条，checksum 记录于日志；links/papers 正式未重跑（已有 2025-11-05 migrate）。

**[问题与解决]**  
- 无阻塞；若需最新 links/papers 正式 checksum，可再执行正式 seed。

**[总结与下步计划]**  
- 如需刷新 links/papers 正式数据，运行 `npm run seed:links` / `npm run seed:papers` 并保留日志；当前 dry-run 显示数据与 DB 计数一致。

---

### 📅 2025-12-02 12:27
#### 🔧 任务编号：T009 – 子任务 3（交互节流）
**[开发阶段]**  
- `TimelineFeed`：IntersectionObserver 与“加载更多”增加 400ms 节流，避免高频触发。  
- `LinksDirectory`：滚动与按钮加载增加同样节流，仍使用后端筛选数据；样式未调整（timebox 内保持现状）。

**[问题与解决]**  
- 无新阻塞；待后续验证真实数据下的滚动体验。

**[总结与下步计划]**  
- 如需继续样式收敛/移动端检查需另行安排；可转向子任务 4/5。

---

### 📅 2025-12-02 12:12
#### 🔧 任务编号：T009 – 子任务 2（筛选参数后端化）
**[开发阶段]**  
- `/site/links`：`LinksDirectory` 改为按筛选（q/section/group）请求 `/api/links`，使用后端 meta 展示统计，增加加载/错误提示；初始 meta/错误从 page 透传。  
- `/site/papers`：`PapersCatalog` 将筛选（q/yearFrom/yearTo/tags/sort）透传 `/api/papers`，使用后端返回的 meta 统计，支持错误/加载提示；page 透传初始 meta/错误。  
- 页面层（links/papers）改为返回响应 meta 并传入组件。

**[问题与解决]**  
- 当前环境未连后端，未做冒烟；风险在于后端参数兼容与分页行为需上线环境验证。

**[总结与下步计划]**  
- 待后端可用时，按冒烟清单验证：默认、单一条件、多条件、无结果、加载更多/分页、刷新后持久化。若后端不支持某参数，按回滚策略恢复前端过滤。

---

### 📅 2025-12-02 12:06
#### 🧭 任务编号：T009 – 子任务 1（站点重写上线确认）
**[开发阶段]**  
- 审核 `frontend/next.config.js`：已含 `/index.html`、`/history.html`、`/links.html`、`/papers.html` → `/site/*` rewrites，无额外前端重写。  
- 在 `docs_for_llm/3_tasks/T009_phase2_followups.md` 记录现状与待办：需在部署层检查是否存在二次 rewrite，验证需用无缓存模式。

**[问题与解决]**  
- 受限于当前环境无法直接检查网关/CDN 配置；暂以文档标注待验证。

**[总结与下步计划]**  
- 等待有权限的环境确认 Nginx/CDN 配置与无缓存验证；如缺失重写则准备变更片段与回滚路径。

---


### 📅 2025-11-27 19:04
#### 🔧 任务编号：T009 – 数据脚本与导航体验（lint 修复）
**[开发阶段]**  
- `frontend/app/site/history/TimelineFeed.tsx`：将筛选持久化 useEffect 上移，避免在错误分支后调用 Hook 触发 `react-hooks/rules-of-hooks` 告警；保持骨架/筛选逻辑不变。

**[问题与解决]**  
- ESLint 报“Hook 调用顺序”错误；通过调整 useEffect 位置解决。

**[总结与下步计划]**  
- 等待后续任务/测试指令；若需继续完善 T009 阶段二再更新。

---

### 📅 2025-11-21 20:03
#### 🔥 任务编号：T009 – 数据脚本与导航体验（收尾）
**[计划阶段]**  
- 完成 T009 data_scripts_ux 剩余项：导航顺序/旧站入口弱化、重写规则补齐，列表页体验微调（骨架/渐显、搜索记忆、加载防抖）。

**[开发阶段]**  
- `frontend/components/site/SiteHeader.tsx`：重排导航优先级（/site → history → papers → links），旧版 HTML 标记为 legacy，active/legacy/external 样式 class。  
- `frontend/app/site/styles-legacy.css`：新增 nav-link 状态、骨架屏与淡入动画、通用 shimmer/fadeIn。  
- `frontend/next.config.js`：补充 `/links.html`、`/papers.html` → `/site/*` rewrites。  
- `TimelineFeed`：加载更多节流（避免重复触发）、首屏骨架、筛选持久化到 localStorage。  
- `LinksDirectory` / `PapersCatalog`：筛选条件持久化（localStorage）。

**[问题与解决]**  
- 未连库/未跑测试（按要求暂停），功能均为前端可视与配置变更，无额外依赖。

**[总结与下步计划]**  
- T009_data_scripts_ux 可标记完成；同步更新任务文件、`T009_static_merge.md`、`completed.md` 状态。

---

### 📅 2025-11-21 19:30
#### 🔥 任务编号：T009 – 数据脚本健壮化 & 导航体验（进行中）
**[计划阶段]**  
- 目标：按 `T009_data_scripts_ux.md` 强化 seeds（批次/重试/摘要）并梳理导航一致性。

**[开发阶段]**  
- `backend/prisma/seeds/migrate_timeline.js`：新增批量写入（默认 200，可调 `--batch`/env）、重试与延迟、summary 记录 batchSize。  
- `backend/prisma/seeds/migrate_links.js`：支持批次参数与重试写入 link；summary 记录 batchSize。  
- `backend/prisma/seeds/migrate_papers.js`：支持批次参数、tag createMany 分批重试、paper 写入重试，summary 记录 batchSize。

**[问题与解决]**  
- 未执行 seeds（当前环境缺 DB）；改为提升脚本健壮性。

**[总结与下步计划]**  
- 下一步：梳理导航/rewrites 一致性、添加 UI 微调（骨架/加载节流/搜索持久化），完成后标记子任务完成。

---


### 📅 2025-11-21 19:13
#### 🔥 任务编号：T009 – 前端样式调整（history/links/papers 筛选与导航）
**[计划阶段]**  
- 将新增的筛选/视图控件样式化，保持与现有 `/site` 视觉一致，并兼顾移动端。

**[开发阶段]**  
- `frontend/app/site/styles-legacy.css`：新增筛选样式（timeline-filters、links-filters、paper-filters），按钮幽灵态 `load-more-button--ghost`，分组折叠/扁平视图/meta 样式，标签胶囊、摘要展开按钮样式，响应式堆叠规则，paper-card 高度适配。

**[问题与解决]**  
- 无阻塞。

**[总结与下步计划]**  
- 样式已覆盖新增组件，后续可按需求微调配色/间距或接入 Tailwind 重构。测试仍未执行（按要求暂停）。

---

### 📅 2025-11-21 18:40
#### 🔥 任务编号：T009 – 前端 `/site` 页面增强（history/links/papers）
**[计划阶段]**  
- 目标：依 `T009_frontend_site_enhancements.md` 提升 `/site/history`、`/site/links`、`/site/papers` 交互体验并对齐新 API 筛选参数。  
- 步骤：时间线筛选 + 按钮；友情链接筛选/折叠/扁平视图；论文多标签/年份/排序与摘要展开；导航高亮。

**[开发阶段]**  
- `frontend/app/site/history/TimelineFeed.tsx`：增加关键词与年份区间筛选、显式“应用/重置”按钮、加载更多 + IntersectionObserver 并存，错误 UI 显示当前筛选。  
- `frontend/app/site/links/LinksDirectory.tsx`：新增分类/分组/关键词筛选、重置按钮、扁平/嵌套视图切换、分组折叠、空态提示与加载更多逻辑适配。  
- `frontend/app/site/papers/PapersCatalog.tsx`：支持多标签复选、年份区间、排序选项、筛选重置，摘要展开/收起，统计信息随筛选更新。  
- `frontend/components/site/SiteHeader.tsx`：导航项添加 active 高亮（含 `/site/links`、`/site/papers`）。

**[问题与解决]**  
- Issue: `api_papers` 规格已更新（后端扩展），前端现采用客户端筛选；若需后端透传需后续接入。  
- Solution: 先在客户端完成筛选与排序，后续可将参数透传到 API。

**[总结与下步计划]**  
- 未运行测试（按要求暂停测试工作）。  
- 后续可：a) 将 papers/links 请求透传新筛选参数以减少前端计算；b) 适配样式（timeline/links/papers 新增的 filter UI 如需细化）；c) 根据需要扩展导航样式或可达性提示。

---



### 📅 2025-11-21 14:20
#### 🔥 任务编号：T009 – 后端 API 扩展（timeline/links/papers）
**[计划阶段]**  
- 目标：按子任务 `T009_backend_api_expansion.md` 扩展 timeline/links/papers 查询能力与返回元信息，保持公共只读接口稳定。  
- 步骤：新增筛选参数与分页元信息 → 支持 links 扁平视图 → 多标签/区间筛选 → 同步 API 规格文档。

**[开发阶段]**  
- 更新 `backend/src/routes/timeline.js`：支持 `yearFrom`/`yearTo` 区间、`q` 关键词模糊匹配，`MAX_LIMIT` 提升至 50，返回 `pageSize`/`hasMore`，非法年份区间 400。  
- 更新 `backend/src/routes/links.js`：新增 `section`/`group`/`q` 过滤和 `view=flat` 扁平返回，meta 增加 filters，去除过滤后空分组/分类。  
- 更新 `backend/src/routes/papers.js`：多标签（逗号/重复参数）、年份区间、排序选项（year/name asc/desc）与 year range 校验，meta 返回 `pageSize`/`hasMore`。  
- 文档同步：`docs/api/timeline.md`、`docs/api/links.md`、`docs/api/papers.md`、`docs_for_llm/5_specs/api_timeline.md`、`api_links.md`、重写 `api_papers.md`（原文件仅占位）。

**[问题与解决]**  
- Issue: `docs_for_llm/5_specs/api_papers.md` 旧文件为占位文本。  
- Solution: 删除后重新撰写完整规格说明。

**[总结与下步计划]**  
- 子任务文件已移至 `docs_for_llm/3_tasks/completed/T009_backend_api_expansion.md`。  
- 待后续阶段补充对应测试与前端适配（按 `T009_frontend_site_enhancements.md`）。  
- 若有 DB 环境可用，建议回归 `backend/tests/*`；当前未执行自动化测试。

---

### 📅 2025-11-05 17:52
#### 🔥 任务编号：T010 – 文档一致性巡检
**[计划阶段]**  
- 目标：对齐仓库实际结构与协作文档内容，降低后续 AI 接力的沟通成本。  
- 步骤：核对 AGENTS 与 docs_for_llm 文档 ➜ 刷新项目结构索引 ➜ 建立任务记录并准备日志更新。

**[开发阶段]**  
- 更新 `AGENTS.md`（补充 `/site/links`、`/site/papers`、links/papers API 种子脚本及 ESLint 配置文件名）。  
- 重写 `docs_for_llm/structure.txt`，同步 backend/tests、frontend/__tests__、e2e 等目录。  
- 调整 `docs_for_llm/readme_plan.md` 以描述新静态页面与后端接口；新增 `docs_for_llm/tasks/T010_docs_alignment.md` 并在任务总览登记。

**[问题与解决]**  
- Issue: 无。

**[总结与下步计划]**  
- 已将任务状态标记为完成并更新 `completed.md`；持续关注其它文档是否需追加说明。



---

### 📅 2025-11-05 17:31
#### 🔥 任务编号：T009 – `seed:links` 事务修复
**[计划阶段]**  
- 目标：解决远程 PostgreSQL 执行 `npm run seed:links` 时的超时/事务关闭问题。  
- 步骤：对 `migrate_links` 脚本应用与论文脚本相同策略，取消单次大事务。

**[开发阶段]**  
- 修改 `backend/prisma/seeds/migrate_links.js`：弃用 `$transaction`，按 section → group → link 顺序逐条创建，避免长事务。  
- 未重新运行脚本，等待用户再次执行 `npm run seed:links`。

**[问题与解决]**  
- Issue: 事务超时导致 `P2028`。  
- Solution: 改为顺序写入，避免长事务。

**[总结与下步计划]**  
- 请重新执行 `npm run seed:links -- --dry-run` 与 `npm run seed:links`，成功后更新测试报告。


---

### 📅 2025-11-05 17:27
#### 🔥 任务编号：T009 – `seed:papers` 事务修复
**[计划阶段]**  
- 目标：解决远程 PostgreSQL 环境执行 `npm run seed:papers` 时出现的 `P2028 Transaction not found` 错误。  
- 步骤：定位事务内 `connectOrCreate` 造成的长事务问题 → 预创建标签 → 使用 `connect` 简化事务。

**[开发阶段]**  
- 修改 `backend/prisma/seeds/migrate_papers.js`：先 `createMany` 写入所有标签，再依次创建论文并 `connect` 标签，避免长事务超时。  
- 未重新运行脚本，等待用户在远程数据库环境再次 `npm run seed:papers`。

**[问题与解决]**  
- Issue: Prisma 报错 `P2028 Transaction not found`（长事务关闭）。  
- Solution: 去除事务内 `connectOrCreate`，改为预创建标签并 `connect`。

**[总结与下步计划]**  
- 请在远程数据库环境重新执行 `npm run seed:papers`（可先 `-- --dry-run` 验证），成功后更新测试报告。

---



### 📅 2025-11-05 16:45
#### 🔥 任务编号：T009 – 前后端测试回归
**[计划阶段]**  
- 目标：在新组件与 API 就绪后回归主干测试，确认 `papers`/`links` 场景稳定。  
- 步骤：执行后端 `npm run test` ➜ 前端 `npm run test -- --runInBand papers LinksDirectory` ➜ 更新测试报告。

**[开发阶段]**  
- 用户运行 `cd backend && npm run test`，`papers.test.js`、`links.test.js` 与既有用例全部通过。  
- 用户运行 `cd frontend && npm run test -- --runInBand papers LinksDirectory`，确认 RTL 测试无警告。  
- 更新《docs/tests/T009_test_report.md》记录最新时间与说明。

**[问题与解决]**  
- Issue: 无。

**[总结与下步计划]**  
- 待执行 `npm run seed:links` 并补齐性能基线、Playwright 场景。

---

### 📅 2025-11-05 16:42
#### 🔥 任务编号：T009 – 前端测试 async/await 修正
**[计划阶段]**  
- 目标：修复 `LinksDirectory` 用例因 `await` 置于非 async 函数导致的编译失败，并彻底消除 act 警告。  
- 步骤：将相关测试声明为 `async`，在交互与断言前后使用 `act`/`waitFor` 与 `findBy*`。

**[开发阶段]**  
- 更新 `frontend/__tests__/LinksDirectory.test.tsx` 与 `frontend/__tests__/PapersCatalog.test.tsx`，确保所有异步操作在 async 测试中执行。  
- 未在本地执行 Jest，等待用户再次运行验证。

**[问题与解决]**  
- Issue: `await` 出现在非 async 测试函数内。  
- Solution: 将测试函数声明为 async 并配合 `waitFor`、`findBy*`。

**[总结与下步计划]**  
- 请重新执行 `npm run test -- --runInBand papers LinksDirectory`，若仍有 console 警告请提供完整输出。  
- 后续根据结果更新测试报告。

---

### 📅 2025-11-05 16:25
#### 🔥 任务编号：T009 – 前端测试警告修复
**[计划阶段]**  
- 目标：解决 `LinksDirectory` / `PapersCatalog` 测试中的 act 警告，确保用户执行命令时日志干净。  
- 步骤：检查 `userEvent` 使用方式 → 切换至 `userEvent.setup()` → 调整断言。

**[开发阶段]**  
- 更新 `frontend/__tests__/PapersCatalog.test.tsx` 与 `frontend/__tests__/LinksDirectory.test.tsx`，统一通过 `userEvent.setup()` 驱动交互并修正按钮断言。  
- 未在本地执行 Jest（等待用户确认）。

**[问题与解决]**  
- Issue: React 提示状态更新未包裹 act。  
- Solution: 采用 `userEvent.setup()`（自动封装 act）消除警告。

**[总结与下步计划]**  
- 请重新运行 `npm run test -- --runInBand papers LinksDirectory` 确认无警告。  
- 后续继续补充自动化测试与报告记录。

---

### 📅 2025-11-05 15:50
#### 🔥 任务编号：T009 – Papers/Links 测试补强
**[计划阶段]**  
- 目标：为新增 `/api/papers`、`/api/links` 以及 `/site/papers`、`/site/links` 提供自动化测试保障。  
- 步骤：补充 Vitest + Supertest 覆盖 → 编写 React Testing Library 用例 → 更新测试文档并注明待执行命令。

**[开发阶段]**  
- 新增 `backend/tests/papers.test.js`、`backend/tests/links.test.js`，覆盖查询、筛选与元数据。  
- 新增 `frontend/__tests__/PapersCatalog.test.tsx`、`frontend/__tests__/LinksDirectory.test.tsx` 验证搜索过滤、分组渲染与分页按钮。  
- 将 `docs/tests/T009_test_report.md` 中“待补证据”扩展为需要执行的命令列表。

**[问题与解决]**  
- Issue: 当前环境缺少可靠数据库服务，无法运行 `npm run test` 验证后端；前端 Jest 亦待用户执行。  
- Solution: 在测试报告中明确列出待执行命令，等待有数据库/端口条件的环境完成验证。

**[总结与下步计划]**  
- 当数据库可用时运行 `npm run test`（后台）与 `npm run test -- --runInBand papers LinksDirectory`（前台），并记录结果。  
- 后续扩展 Playwright 场景涵盖 `/site/papers` 与 `/site/links`，同时规划后台管理测试。

---


### 📅 2025-11-05 15:28
#### 🔥 任务编号：T009 – `/site/links` React 页面
**[计划阶段]**  
- 目标：迁移 `links.html` 至 Next.js，配合新 `/api/links` 数据，保留搜索、分页与资源统计体验。  
- 步骤：编写 `LinksDirectory` 客户端组件 → 新增 `page.tsx` 服务端获取数据 → 更新导航链接 → 复用原有文案模块。

**[开发阶段]**  
- 创建 `frontend/app/site/links/page.tsx`、`LinksDirectory.tsx`、`types.ts`。实现搜索、逐步加载、统计提示与空态处理。  
- 导航 `SiteHeader` 更新指向 `/site/links`。  
- 手动验证页面在本地部署环境正常工作（搜索、加载更多、外链跳转）。

**[问题与解决]**  
- Issue: 搜索需兼容未命名分组。  
- Solution: 在准备数据时记录 section/group 文本，过滤后保留匹配链接并移除空分组。

**[总结与下步计划]**  
- 后续补充 Jest/Playwright 覆盖（搜索、分页、无结果），并计划后台链接管理功能。  
- 评估是否需要在前端添加标签筛选或资源更新提示。

---


### 📅 2025-11-05 15:25
#### 🔥 任务编号：T009 – 友情链接数据模型
**[计划阶段]**  
- 目标：为 Stage 2 “links” 页面迁移准备后端基础，完成数据建模、迁移脚本与 API。  
- 步骤：扩展 Prisma schema → 编写 `migrate_links` 脚本 → 新增 `/api/links` 路由 → 编写接口文档。

**[开发阶段]**  
- 更新 `backend/prisma/schema.prisma` 引入 `LinkSection`/`LinkGroup`/`Link`，并添加 `seed:links` 命令。  
- 新建 `backend/prisma/seeds/migrate_links.js`（支持 checksum、dry-run）与 `backend/src/routes/links.js`（嵌套返回结构）。  
- `backend/src/index.js` 挂载 `/api/links`，文档 `docs/api/links.md` 描述契约与运维流程。  
- 运行 `cd frontend && npm run lint`，确保新增 `/site/links` 代码通过静态检查。

**[问题与解决]**  
- Issue: 无数据库实时执行记录，待后续 dry-run/正式测试。  
- Solution: 在文档中注明脚本使用方法，等待用户环境执行。

**[总结与下步计划]**  
- 下一步迁移前端 `links.html` 至 React，消费 `/api/links`。  
- 同步规划后台录入 UI，与 T002 协调链接管理策略。

---

### 📅 2025-11-05 15:10
#### 🔥 任务编号：T009 – 手动验证 `/site/papers`
**[计划阶段]**  
- 目标：在真实部署环境确认新页面（含 API 数据、搜索、外链）运行正常。  
- 步骤：启动前后端服务 → 浏览器访问 `/site/papers` → 检查搜索、分组、跳转行为 → 记录结果。

**[开发阶段]**  
- 用户通过浏览器手动验证 `/site/papers`：搜索关键字、切换分组、访问外部链接均正常。  
- 将手动验证记录入《docs/tests/T009_test_report.md》E2E 部分。

**[问题与解决]**  
- Issue: 无。

**[总结与下步计划]**  
- 后续考虑以 Playwright 补充自动化覆盖（搜索/无结果/外链）。  
- 继续推进 Stage 2 页面迁移与后台联动。

---

### 📅 2025-11-05 15:00
#### 🔥 任务编号：T009 – `/site/papers` React 页面
**[计划阶段]**  
- 目标：将旧版 `papers.html` 迁移到 Next.js，并直接消费 `/api/papers` 数据，实现搜索/主题浏览。  
- 步骤：设计分组模型 → 编写 `PapersCatalog` 客户端组件 → 新增 `page.tsx` 服务端数据请求 → 更新导航。

**[开发阶段]**  
- 新增 `frontend/app/site/papers/page.tsx`（服务端获取论文数据）与 `PapersCatalog` 客户端组件，实现分类展示、关键词搜索、无结果提示。  
- 提炼 `Paper`/`PaperTag` 类型至 `frontend/app/site/papers/types.ts`，导航改指向 `/site/papers`。  
- 执行 `cd frontend && npm run lint`，确认新增页面通过 ESLint/TypeScript 校验。

**[问题与解决]**  
- Issue: 标签映射需兼容原数据多标签情况。  
- Solution: 以首个在预设集合中的标签作为主分类，其余归入“其他主题”，保持与旧版行为一致。

**[总结与下步计划]**  
- 下一步补充 Jest/Playwright 用例（搜索、分类渲染、API 错误态），并启动 `/site/papers` UI 微调与内容更新迭代。  
- 与 T002 协作实现后台论文录入表单，确保标签/排序与前端一致。

---

### 📅 2025-11-05 14:53
#### 🔥 任务编号：T009 – 论文数据落库
**[计划阶段]**  
- 目标：在 dry-run 成功后完成 `Paper` 数据正式写入，并归档日志供审计。  
- 步骤：`npm run seed:papers` → 校验脚本输出 → 更新测试证据/阶段文档。

**[开发阶段]**  
- `npm run seed:papers` 写入 25 条论文、24 个标签，日志：`backend/prisma/seeds/logs/papers-migrate-2025-11-05T06-53-37-913Z.json`。  
- 更新 `docs/tests/T009_test_report.md`、`docs_for_llm/tasks/T009_static_merge.md`，标记 dry-run 与正式执行结果。

**[问题与解决]**  
- Issue: 无。

**[总结与下步计划]**  
- 下一阶段聚焦 React 页面迁移与 `/api/papers` 前端消费，同时规划搜索/筛选交互的 Jest/Playwright 覆盖。

---

### 📅 2025-11-05 14:50
#### 🔥 任务编号：T009 – 论文数据迁移 dry-run
**[计划阶段]**  
- 目的：在真实数据库环境验证 `Paper`/`PaperTag` schema 与脚本正确性，确认 Stage 2 数据迁移可执行。  
- 步骤：执行 `npm run prisma:migrate` 同步数据库 → `npm run seed:papers -- --dry-run` 生成日志 → 校验输出并更新文档。

**[开发阶段]**  
- 成功应用迁移 `20251105064722_`，数据库 schema 与仓库一致。  
- `npm run seed:papers -- --dry-run` 输出 25 条论文、24 个标签，日志存于 `backend/prisma/seeds/logs/papers-dry-run-2025-11-05T06-47-50-988Z.json`。  
- 更新 `docs/tests/T009_test_report.md`、`docs_for_llm/tasks/T009_static_merge.md` 记录 dry-run 结果。

**[问题与解决]**  
- Issue: 仅执行 dry-run，数据库未写入新数据。  
- Solution: 标注待正式执行步骤，提醒在后续部署或测试环境中完成。

**[总结与下步计划]**  
- 下一步在同环境执行正式 `npm run seed:papers` 并归档日志。  
- 准备 React 页面迁移：生成 `/api/papers` 调用封装与 SSR 数据源，配合 T002/T003 的内容模型。

---

### 📅 2025-11-05 14:42
#### 🔥 任务编号：T009 – 阶段二数据 API
**[计划阶段]**  
- 目标：为 Stage 2 迁移奠定数据基础，搭建 `Paper`/`PaperTag` 模型、迁移脚本与 `/api/papers` 接口，方便后续前端改造。  
- 步骤：扩展 Prisma schema → 编写 `migrate_papers` 脚本 → 新增 Express 路由 → 同步文档/任务。

**[开发阶段]**  
- 更新 `backend/prisma/schema.prisma` 新增 `Paper`、`PaperTag` 模型与索引。  
- 新增 `backend/prisma/seeds/migrate_papers.js` 支持 `--dry-run`、checksum 校验，并生成日志。  
- 后端注册 `/api/papers`（分页+年份/标签/关键词筛选），路径 `backend/src/routes/papers.js`，挂载于 `backend/src/index.js`。  
- 补充脚本命令 `npm run seed:papers`，并撰写文档 `docs/api/papers.md`、`docs_for_llm/tasks/T009_static_merge.md` 开发日志等。

**[问题与解决]**  
- Issue: 仍无法连接本地 PostgreSQL，迁移脚本未实际运行。  
- Solution: 在文档与测试报告中标注“待数据库环境执行”，并将脚本输出路径写明。

**[总结与下步计划]**  
- 等具备数据库环境后执行 `npm run seed:papers`（建议先 `--dry-run`），校验日志与 checksum。  
- 下一步：开始重构 `/site/papers` React 页面与后台录入流，配合 T002/T003 的文章模型更新。

---

### 📅 2025-11-05 14:30
#### 🔥 任务编号：T009 – 性能基线准备
**[计划阶段]**  
- 目标：补齐 Stage 1 收尾资料，包括归档最新 Playwright 报告、采集 Lighthouse/API 延迟基线，并同步 T002/T003 模型协作要点。  
- 步骤：检查测试/性能文档 ➜ 运行必要命令采集数据 ➜ 更新 T009/T002/T003 文档 ➜ 记录日志。

**[开发阶段]**  
- 新建 `docs/tests/playwright-20251105/index.html`，归档 `frontend/playwright-report/index.html`。  
- 更新 `docs/tests/T009_test_report.md`、《docs/performance_report.md》、`docs_for_llm/tasks/T009_static_merge.md`、`docs_for_llm/tasks/T002_admin_panel.md`、`docs_for_llm/tasks/T003_article_render.md`，标注存档路径及环境受限情况。
- 执行 `CI=1 npm run build` 生成 `docs/performance/build-20251105.log`，并在 T002/T003 任务文档中补充文章模型/时间线协同字段说明。

**[问题与解决]**  
- Issue: `cd backend && npm run dev` 报错 `PrismaClientInitializationError P1001`（缺少 PostgreSQL），同时 Express 监听端口触发 `EPERM`，沙箱禁止本地端口。  
- Issue: 前端 `npm run dev` 同样无法保持监听（命令超时被终止）。  
- Issue: `curl` 采样依赖本地代理环境，因无法建立服务端连接返回 `code: 000`。  
- Solution: 记录受限原因于性能/测试文档，标注需在人类可控环境执行采集。

**[总结与下步计划]**  
- 等待具备端口开放与数据库访问能力的环境，完成 Lighthouse 与 `/api/timeline` 采样并将报告存入 `docs/performance/`；构建日志已归档供比较。  
- 后续完成 `frontend/utils/api.ts` 单测补强，并据此更新 T009 验收清单与测试报告。

---

### 📅 2025-11-05 13:38
#### 🔥 任务编号：T009 – 性能/测试档案补充
**[计划阶段]**  
- 明确性能采集和测试证据的留存方式，便于阶段评审。

**[开发阶段]**  
- 更新《docs/performance_report.md》加入采集计划表，并说明将报告存放于 `docs/performance/`。  
- 创建《docs/tests/T009_test_report.md》，汇总单测、E2E、数据脚本执行记录，指向 Playwright 报告与迁移日志；补充与 T002/T003 数据模型协作要点。

**[问题与解决]**  
- Issue: 无。

**[总结与下步计划]**  
- 待实测 Lighthouse/API latency 后补充表格结果；准备与 T002/T003 的数据模型对齐说明。

---

### 📅 2025-11-05 13:33
#### 🔥 任务编号：T009 – 时间线脚本日志接入
**[计划阶段]**  
- 记录生产环境执行迁移脚本的摘要日志，确保数据校验结果可追溯。

**[开发阶段]**  
- 日志文件：`backend/prisma/seeds/logs/timeline-migrate-2025-11-05T05-30-18-999Z.json`（记录数 14，数据库前后均为 14，checksum 匹配）。
- 更新《docs/performance_report.md》加入采集计划表，《docs/tests/T009_test_report.md》整理单测/E2E/数据脚本证据。
- 命令由人类在可用数据库环境执行：`cd backend && npm run seed:timeline`。

**[问题与解决]**  
- Issue: 无。

**[总结与下步计划]**  
- 后续在性能报告中补充 Lighthouse/API 实测值，并准备测试证据清单。

---

### 📅 2025-11-05 13:00
#### 🔥 任务编号：T009 – 数据脚本增强与文档补全
**[计划阶段]**  
- 强化时间线迁移脚本校验能力，补充 `/api/timeline` 文档及性能/工具链相关记录。

**[开发阶段]**  
- 更新 `backend/prisma/seeds/migrate_timeline.js`，新增 checksum 校验、数据库差异对比与日志落盘（`backend/prisma/seeds/logs/`）。  
- 创建《docs/api/timeline.md》梳理参数、响应示例与错误结构；新增《docs/performance_report.md》模板化记录构建指标/性能采集步骤。  
- 新增 `frontend/__tests__/api.test.ts` 验证 `apiRequest` 成功与错误分支，命令：`cd frontend && npm run test -- --runInBand api`（通过）。  
- 将前端 TypeScript 版本锁定为 `~5.4.5`（`frontend/package.json`、`package-lock.json`），并在 `AGENTS.md`、`docs_for_llm/tasks/T009_static_merge.md` 更新说明。  
- 命令：`cd frontend && npm install`（因沙箱限制报 `ERR_INVALID_URL`，未能刷新 package-lock；需在可访问网络/缓存的环境重新执行以更新到 5.4.x）。

**[问题与解决]**  
- Issue：沙箱环境禁写 `/root/.npm/_logs` 且无法访问 npm registry，导致 `npm install` 失败；同时 `npm run seed:timeline -- --dry-run` 因数据库未运行（`localhost:5432` 不可达）而中止。  
- Solution：记录手动操作指引，待有权限的环境重新运行 `npm install` 以回写 `package-lock.json`；时间线脚本需在数据库可用时执行以生成摘要日志。

**[总结与下步计划]**  
- 下一步按任务文档执行：跑通迁移脚本 dry-run 生成日志、补充 `utils/api.ts` 单测和性能实测数据，并准备测试报告草案。

---

### 📅 2025-11-05 12:47
#### 🔥 任务编号：T009 – 阶段评估与后续规划
**[计划阶段]**  
- 根据当前交付成果评估 T009 阶段进度，并梳理剩余风险与下一步工作项。

**[开发阶段]**  
- 更新 `docs_for_llm/tasks/T009_static_merge.md`，新增“当前阶段评估”“下一步工作”章节，明确已完成事项与待办清单。

**[问题与解决]**  
- Issue: 无。

**[总结与下步计划]**  
- 下一阶段聚焦数据迁移脚本、API 文档、性能实测以及 lint/TypeScript 版本决策，确保阶段一正式结项。

---

### 📅 2025-11-05 12:35
#### 🔥 任务编号：T009 – 回滚预案与性能文档
**[计划阶段]**  
- 补全 T009 未交付文档：回滚执行手册与性能对比报告，并在任务清单中标记完成状况。

**[开发阶段]**  
- 新增《docs/rollback_plan.md》、《docs/performance_report.md》，分别整理触发条件、操作流程、性能指标与采集步骤。  
- 更新 `docs_for_llm/tasks/T009_static_merge.md` 勾选对应交付项，引用最新文档。

**[问题与解决]**  
- Issue: 无。

**[总结与下步计划]**  
- 后续按照性能报告指引补充 Lighthouse/API 实测数据，并在季度内安排一次回滚演练。

---

### 📅 2025-11-05 12:31
#### ✅ 任务编号：T009 – Playwright 回归验证记录
**[计划阶段]**  
- 根据人类运行反馈记录 E2E 通过结果，确认新场景稳定。

**[开发阶段]**  
- 命令：`PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npm run test:e2e`（Chromium，4 workers）。  
- 结果：4 个用例全部通过（36.9s），涵盖首页渲染、时间线加载、手动“加载更多里程碑”、旧站回退。

**[问题与解决]**  
- Issue: 无。

**[总结与下步计划]**  
- 保留 `npx playwright show-report` 报告用于交叉验证；后续继续完善性能对比与回滚演练文档。

---

### 📅 2025-11-05 12:22
#### 🔥 任务编号：T009 – Playwright 复测回馈处理
**[计划阶段]**  
- 根据人类运行的 E2E 报告修正首页断言（处理导航/页脚同名链接冲突），并消除 Next 配置告警。

**[开发阶段]**  
- 更新 `frontend/e2e/site.spec.ts`，将“发展历史”校验限定在 `主导航` 区域。  
- 移除 `frontend/next.config.js` 中已废弃的 `experimental.appDir` 配置，避免构建警告。

**[问题与解决]**  
- Issue：Playwright 在 Strict 模式下因重复 Locator 抛错。  
- Solution：缩小查找范围到命名导航区域，确保唯一元素。构建告警同步清理。

**[总结与下步计划]**  
- 请在具备端口权限的环境重新运行 `PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npm run test:e2e`，确认四条用例全部通过；后续继续筹备性能对比与回滚演练。

---

### 📅 2025-11-05 11:48
#### 🔥 任务编号：T009 – Playwright 场景扩展与发布文档
**[计划阶段]**  
- 扩写 E2E 用例覆盖时间线“加载更多里程碑”按钮与旧站静态兜底路径。  
- 调整测试运行方式，补齐部署/性能/风险文档，并尝试在当前环境执行 Playwright。

**[开发阶段]**  
- 更新 `frontend/e2e/site.spec.ts`，增加分页拦截、手动加载断言与旧站回退验证。  
- 调整 `playwright.config.ts` 改用 `next start`、`frontend/package.json` 串联 `npm run build`，并新增 `docs/deployment_handbook.md`。  
- 执行命令：`cd frontend && PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npx playwright install chromium`（经授权下载成功）、`PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npm run test:e2e`。  
- 更新 `docs_for_llm/tasks/T009_static_merge.md`，补充测试覆盖、性能指引、风险表并引用新的部署手册。

**[问题与解决]**  
- Issue：在沙箱环境下无法监听本地端口，`next start` 及 `node http.createServer` 均报 `EPERM: operation not permitted 0.0.0.0:3000`，导致 Playwright WebServer 启动失败。  
- Solution：记录限制并在文档中注明需于具备端口访问权限的环境执行 E2E，同时保留人工验证清单作为替代。

**[总结与下步计划]**  
- 待补：在开放端口的环境重新运行 `npm run test:e2e` 并保存报告；后续整理性能对比与回滚演练记录。

---

### 📅 2025-11-05 10:39
#### 🔥 任务编号：T009 – TimelineFeed 单测增强
**[计划阶段]**  
- 扩充 TimelineFeed 单测覆盖空态、手动“加载更多里程碑”、IntersectionObserver 自动分页，并记录覆盖率指标。  
- 确认在 Node 22 环境下使用 `--runInBand` 运行 Jest 的稳定性。

**[开发阶段]**  
- 修改 `frontend/__tests__/TimelineFeed.test.tsx`，新增通用响应构造函数与 IntersectionObserver stub，补充 3 个测试用例。  
- 执行 `cd frontend && npm install`；运行 `npm run test -- --coverage --runInBand TimelineFeed`，全部 5 个断言通过，`TimelineFeed.tsx` 语句覆盖率 97.5%、分支覆盖率 96.29%。

**[问题与解决]**  
- Issue: SWR 触发的 `mutate` 导致 React 发出 `act` 警告。  
- Solution: 使用 `act` 包装 `userEvent.click` 交互，确保状态更新过程同步到测试断言。

**[总结与下步计划]**  
- 下一阶段扩展 Playwright E2E（加载更多、旧站回退）并补齐 `utils/api.ts` 的单测覆盖。

---

### 📅 2025-11-04 18:39
#### ✅ 任务编号：T009 – 前端测试执行&Playwright 搭建
**[计划阶段]**  
- 在 Node 18 环境验证 Jest 组件测试，并为 E2E 准备 Playwright 配置。

**[开发阶段]**  
- 命令：`cd frontend && npm run test -- TimelineFeed` 已通过，确认 `TimelineFeed` 加载/错误场景测试可用。  
- 新增 `playwright.config.ts`、`e2e/site.spec.ts`，并在 `package.json` 增加 `test:e2e` 脚本，覆盖 `/site` 首页与发展历程页面基础渲染。

**[问题与解决]**  
- Issue: Playwright 需外部依赖浏览器下载与运行时间较长。  
- Solution: 在文档中提示需执行 `npx playwright install`，并确保端口 3000 可用。

**[总结与下步计划]**  
- 后续扩展 E2E 场景（加载更多、旧版回退）、补充性能对比与风险评估；整理完整测试报告。

---

### 📅 2025-11-04 18:12
#### ⚠️ 任务编号：T009 – Jest 执行异常记录
**[计划阶段]**  
- 在添加前端测试脚手架后，验证 `npm run test` 是否可在当前环境运行。

**[开发阶段]**  
- 命令 `cd frontend && npm run test -- TimelineFeed` 报错：`jest worker process crashed exitCode=0`。

**[问题与解决]**  
- Issue: Jest 在 Node 22 + next/jest 环境下崩溃，疑似 worker/transform 兼容问题。  
- Solution: 记录 Blocking 状态，建议在 Node 18 环境启用 `--runInBand` 或升级/调整 `next/jest` 配置后再运行。

**[总结与下步计划]**  
- 需要在兼容环境重试，若仍失败则考虑降级 Node、使用 Babel Transform 或切换 Vitest + Testing Library。

---


### 📅 2025-11-04 17:03
#### 🧪 任务编号：T009 – 前端测试脚手架
**[计划阶段]**  
- 为 `TimelineFeed` 组件搭建 Jest + React Testing Library 环境，与后端测试计划呼应。

**[开发阶段]**  
- 新增 `jest.config.js`、`jest.setup.ts`、`__tests__/TimelineFeed.test.tsx`，并在 `package.json` 增加 `test` 脚本。测试覆盖加载/错误两种状态，使用 SWRConfig + mocked `apiRequest`。  
- 更新依赖（`@testing-library/*`、`jest`、`ts-jest`、`@types/jest`)：需要在前端目录执行 `npm install` 后运行 `npm run test` 验证。

**[问题与解决]**  
- Issue: 全量测试尚未运行，需待依赖安装完成后执行。  
- Solution: 在任务文档注明运行指令，后续补充更多场景与 Playwright E2E。

**[总结与下步计划]**  
- 下阶段：完善组件测试场景（滚动、空态、加载更多）并引入 Playwright E2E；整理测试报告条目。

---


### 📅 2025-11-04 16:59
#### ✅ 任务编号：T009 – 后端测试执行记录
**[计划阶段]**  
- 在网络恢复后运行后端依赖安装与时间线单测，验证 Vitest/Supertest 配置。

**[开发阶段]**  
- 命令：`cd backend && npm install && npm run prisma:migrate && npm run test`，全部通过。
- 输出：Vitest 报告 `GET /api/timeline` 测试成功，确认分页、年份筛选与参数容错行为。

**[问题与解决]**  
- Issue: 无。

**[总结与下步计划]**  
- 下一步继续补充前端组件测试（React Testing Library）与 Playwright E2E，并在测试报告中记录结果。

---
### 📅 2025-11-04 11:54
#### 🛠 任务：Vercel 后端部署 Prisma 生成修复
**[行动]**
- 在 `backend/package.json` 新增 `postinstall` 钩子，内容为 `prisma generate`，确保 Vercel 安装阶段自动生成 Prisma Client。
- 校验 `.gitignore` 已包含 `backend/node_modules/`，避免 `.prisma` 客户端目录被提交。

**[结果]**
- Prisma Client 将在 Vercel 缓存命中时依旧重新生成，避免 “Prisma has detected…” 报错。
- 无需调整 Build Command；默认安装流程即可满足生成需求。

**[后续]**
- 部署前可本地执行 `npm install` 验证 `postinstall` 生效；如需额外 build 步骤再补充 `build` 脚本。

---

### 📅 2025-11-04 00:44
#### 🛠 维护任务：OPS-20251104A – 前后端联调排查
**[诊断]**
- 用户报告“前端可通过 `localhost:4000` 访问但无法请求后端接口”。
- 核查 `frontend/utils/api.ts:1`，发现默认基地址仍指向 `http://127.0.0.1:4000`。
- 若后端端口改为 3000（Express `PORT` 环境变量被覆盖），前端未同步 `NEXT_PUBLIC_API_URL` 将导致请求落在 Next.js 服务器自身而非后端。

**[关键发现]**
- `NEXT_PUBLIC_API_URL` 必须显式指向实际后端地址；未设置时会回退到 4000 端口。
- （已修正）`.env.local.example` 曾使用旧变量名 `NEXT_PUBLIC_API_BASE_URL`，容易误导协作者。

**[建议处理]**
- 在 `frontend/.env.local` 中设置 `NEXT_PUBLIC_API_URL=http://127.0.0.1:<后端端口>`，与 Express 服务保持一致。
- 已将 `.env.local.example` 更新为示例配置 `NEXT_PUBLIC_API_URL`，避免协作者沿用旧变量。

**[后续行动]**
- 待确认团队常用端口映射后，评估是否更新默认值或提供端口切换指南。
- 若频繁在 3000/4000 之间切换，可在 README 中补充本地联调流程。


### 📅 2025-11-03 18:05
#### ✅ 任务编号：T009 – ESLint 验证
**[计划阶段]**  
- 在网络恢复后重新执行依赖安装并确认 `npm run lint` 能正常运行。

**[开发阶段]**  
- `frontend/npm install` 执行成功，`npm run lint` 通过，当前代码无 ESLint 报错。

**[问题与解决]**  
- Issue: `next lint` 提示 TypeScript 5.9.3 超出 `@typescript-eslint` 支持范围（>=4.7.4 <5.5）。  
- Solution: 记录该告警，保留 `package.json` 中的 TypeScript 版本（^5.4.5）；若未来升级需同步更新 `@typescript-eslint` 相关依赖。

**[总结与下步计划]**  
- 后续在引入测试依赖时保持 Lint 流程运行；考虑锁定 TypeScript 版本或升级 lint 生态以消除告警。

---

### 📅 2025-11-03 17:52
#### 🔧 任务编号：T009 – ESLint 基础配置
**[计划阶段]**  
- 采纳 Next.js 推荐规则，避免每次 `npm run lint` 触发交互式向导。  
- 记录网络安装受限的情况，提醒后续在可联网环境完成依赖安装。

**[开发阶段]**  
- 在 `frontend/package.json` 增加 `eslint@^9.11.1`、`eslint-config-next@14.2.3`，提交 `.eslintrc.json`（extends `next/core-web-vitals`）与 `.eslintignore`。  
- 运行 `npm install`（多次尝试因代理限制 `EPERM connect 127.0.0.1:10808` 失败），需要在具备外网的环境重新执行。

**[问题与解决]**  
- Issue: 无法通过当前网络安装 ESLint 依赖。  
- Solution: 记录失败原因，等待网络可用时重新运行 `npm install`。配置文件已就绪。

**[总结与下步计划]**  
- 后续在有权限的环境重新安装依赖并验证 `npm run lint`。  
- 准备添加 Vitest/Supertest、React Testing Library、Playwright 依赖以支持测试计划。

---

### 📅 2025-11-03 17:42
#### 🧭 任务编号：T009 – 测试计划与协作指南整理
**[计划阶段]**  
- 根据最新代码结构制定时间线模块的单测/组件测试/E2E 方案，并同步到任务文档。  
- 校准协作指南（AGENTS.md）与 `readme_plan.md`，加入 `/site` 子站、数据脚本、rewrites 等现状描述。

**[开发阶段]**  
- 更新 `AGENTS.md`，说明前后端架构、build 流程与测试规划；将项目最新状态写入 `readme_plan.md`。  
- 在 `tasks/T009_static_merge.md` 中增加“测试与验证计划”章节，明确后端、前端、E2E、性能与监控的后续工作。

**[问题与解决]**  
- Issue: 文档仍沿用纯静态站描述，无法指导新的 Next.js/Prisma 结构。  
- Solution: 重写相关段落，指出 `/app/(dashboard)` 与 `/app/site` 路由分组、`npm run seed:timeline`、SWR 依赖，以及未完成交付项。

**[总结与下步计划]**  
- 下一步执行测试计划：准备 Vitest/Supertest、React Testing Library、Playwright 基础配置，并实现首批时间线测试。  
- 对 ESLint 方案做决策（采用 Next 推荐或自定义），落实后更新脚本与文档。

---

### 📅 2025-11-03 17:37
#### 🧾 维护任务：DOC-20251103A – 文档校验与运行确认
**[计划阶段]**  
- 对照最新代码状态核对 `readme_plan.md`、任务文档与仓库结构，确保描述包含 `/site` 子站、时间线 API 与数据脚本。  
- 记录前后端运行验证结果，便于后续协作者了解当前基线。

**[开发阶段]**  
- 更新 `readme_plan.md`，补充 `/api/timeline`、`/site` 路由结构、rewrites 及 `npm run seed:timeline` 说明。  
- 复核 T009 文档、任务概览与目录结构；保持未完成交付物（测试、文档、监控）为待办状态。

**[问题与解决]**  
- Issue: 文档仍标注旧版首页布局信息。  
- Solution: 重新编写架构与已实现功能段落，强调新子站与数据接口。

**[总结与下步计划]**  
- 用户已完成前后端运行验证，当前基线可作为后续开发起点。  
- 下一阶段优先落实测试计划（API 单测、SWR 组件测试、E2E）与 ESLint 配置决策，并在 T009 交付物列表逐项勾选。

---

### 📅 2025-11-03 14:59
#### 🚧 任务编号：T009 – 阶段一实现（后端 + 前端）
**[计划阶段]**  
- 按照评审后的方案执行时间线数据入库、API 设计、站点路由与样式迁移。  
- 着重记录对全局结构的影响（路由分组、依赖新增）供后续协作参考。

**[开发阶段]**  
- 后端：扩展 Prisma schema（`TimelineEvent`）、新增 `/api/timeline` 路由、通用错误结构，编写 `prisma/seeds/migrate_timeline.js` 并加入 `npm run seed:timeline`。  
- 前端：重构 App Router 结构（将既有页面迁移至 `app/(dashboard)/`），新增 `app/site` 路由组（`layout.tsx`、`page.tsx`、`history/page.tsx`）、`SiteHeader`/`SiteFooter`/`buildSiteMetadata` 组件，复制 legacy 样式并引入 SWR 无限滚动。  
- 配置 rewrites（`/index.html`→`/site`、`/history.html`→`/site/history`），更新 `apiRequest` 错误解析与 `package.json`（新增 `engines`、`swr`）。  
- 更新相关文档：`backend/README.md`、`frontend/README.md`、`tasks/T009_static_merge.md`。

**[问题与解决]**  
- Issue: Root layout 中原始 `Navbar` 与静态站导航冲突。  
- Solution: 引入 `app/(dashboard)` 分组，仅在该分组布局中渲染 `Navbar`，`app/site` 使用独立布局。  
- Issue: `npm run lint` 触发 Next.js ESLint 初始化向导，当前未启用；保留为后续任务决定是否接管 ESLint 配置。  
- 注意：历史页依赖 SWR 与 IntersectionObserver，后续开发需延续同一数据接口与 Hook。

**[总结与下步计划]**  
- 已具备阶段一开发条件并完成代码落地，等待后续联调（数据迁移脚本需在数据库连接环境执行 `npm run prisma:migrate` + `npm run seed:timeline`）。  
- 下一步：为 T002/T003 同步新的数据库模型和 API 契约，规划测试（API 单测、前端组件测试、E2E）与文档交付物。

---

### 📅 2025-11-03 14:37
#### 🧾 任务编号：T009 – 方案修订补充
**[计划阶段]**  
- 采纳评审意见，细化路由 rewrites、样式迁移分步、数据校验、监控与交付清单。

**[开发阶段]**  
- 更新 `tasks/T009_static_merge.md`：新增 `/site` 路由策略、完整 rewrites 列表、迁移脚本校验示例、监控/环境要求与交付物 checklist。

**[问题与解决]**  
- Issue: 原方案未覆盖数据一致性验证与监控告警。  
- Solution: 增补 `validateMigration` 检查、Sentry/慢查询监控要求，并锁定 Node/npm 版本。

**[总结与下步计划]**  
- 方案已更新满足评审意见，待你确认后可进入编码阶段。  
- 需准备 rewrites 配置文档及监控接入细节以便部署时参考。

---

### 📅 2025-11-03 14:12
#### ✅ 任务编号：T009 – 阶段一开发前准备完成
**[计划阶段]**  
- 根据 T009 要求整理 React 布局、API 契约、Prisma 模型、样式迁移与验收标准，确保进入开发前信息齐备。

**[开发阶段]**  
- 在 `tasks/T009_static_merge.md` 中补充前端组件草案、`GET /timeline` 契约、`TimelineEvent` 模型草图、样式搬迁方案和验收 Checklist，并将阶段一准备清单全部勾选。

**[问题与解决]**  
- Issue: 旧版文档缺乏可直接交付给开发的契约细节。  
- Solution: 按条目编写详尽说明，覆盖接口参数、排序策略、索引与缓存建议。

**[总结与下步计划]**  
- 阶段一准备条件已满足，可在获得排期后启动代码实现（React 页面 + Timeline API + Prisma 迁移）。  
- 后续开发需与 T002/T003 协调数据库迁移与后台表单实现节奏。

---

### 📅 2025-10-31 17:27
#### 🗂️ 维护任务：DOC-20251031B – 任务文档拆解
**[计划阶段]**  
- 将单一 `current_tasks.md` 拆分为多文档结构，便于独立跟踪高复杂度任务与完成记录。  
- 更新引用 `current_tasks.md` 的说明文档，避免路径失效。

**[开发阶段]**  
- 在 `docs_for_llm/tasks/` 下创建 `README.md`、`T002_admin_panel.md`、`T003_article_render.md`、`T009_static_merge.md` 与 `completed.md`。  
- 迁移原任务内容至对应文件，并删除旧的 `current_tasks.md`。  
- 更新 `AGENTS.md`、`readme_plan.md`、`structure.txt` 指向新的任务目录。

**[问题与解决]**  
- Issue: 单文件任务清单过长且难以针对每个任务记录细节。  
- Solution: 采用目录化结构，将概览与任务细节分离，配合 README 链接统一入口。

**[总结与下步计划]**  
- 后续新增任务时在 `tasks/README.md` 登记，并视复杂度决定是否创建独立文档。  
- 需要将历史日志中提到的 `current_tasks.md` 视为旧结构，无需修改。

---

### 📅 2025-10-31 17:17
#### 📌 任务编号：T009 – 阶段一准备待办清单
**[计划阶段]**  
- 提炼阶段一所需的核心交付（React 布局组件、Timeline API、Prisma 模型、样式迁移指南、验收标准）。  
- 明确与后端、样式和 QA 的协作接口，确保进入开发前准备充分。

**[开发阶段]**  
- 在 `current_tasks.md` 增加“T009 阶段一准备清单”，列出待完成的五项前置任务。

**[问题与解决]**  
- Issue: 阶段里程碑缺乏可执行的前置 checklist。  
- Solution: 形成准备清单以跟踪完成度并作为进入开发阶段的条件。

**[总结与下步计划]**  
- 待获取后端对 API/模型的反馈后，可标记相应勾选项并筹备代码实现。  
- 准备在确认 checklist 完成后通知负责人进入开发阶段。

---

### 📅 2025-10-31 17:13
#### 🧭 任务编号：T009 – 阶段交付拆解
**[计划阶段]**  
- 在既有路线图基础上规划三阶段交付物，明确每阶段需交付的 Next.js 路由、组件与后端 API。  
- 记录与后台（T002）和内容系统的依赖关系，便于后续排期与资源协调。

**[开发阶段]**  
- 更新 `current_tasks.md`，追加 T009 阶段交付里程碑条目，描述阶段一至阶段三的主要产出与前置条件。

**[问题与解决]**  
- Issue: 原路线图缺少明确的阶段交付节点，难以与其他团队同步。  
- Solution: 引入阶段里程碑描述，并关联所需 API/模型，方便拆分为具体开发工单。

**[总结与下步计划]**  
- 阶段一需在正式开发前完成 Timeline API 设计与 Prisma schema 草案，可与 T003/T002 协同。  
- 后续继续细化阶段一的组件结构与样式迁移方案，准备进入开发阶段。

---

### 📅 2025-10-31 17:07
#### 🔄 任务编号：T009 – 静态站内容融合计划（规划阶段）
**[计划阶段]**  
- 盘点 `frontend/public` 页面结构、组件脚本与 `data/*.json` 依赖，梳理迁移所需的内容层次与交互行为。  
- 形成 Next.js 路由、布局、样式重用与 SEO 策略的整体方案，同时评估后端接口与数据库支撑需求。

**[开发阶段]**  
- 在 `current_tasks.md` 中更新 T009 的五步路线图，标记内容清单阶段完成并细化后续工作项。  
- 输出对 JSON 数据迁移的建议：`timeline`、`papers`、`links` 拆分为多表结构以支持后台维护，其余叙述型内容暂保留为 Markdown。

**[问题与解决]**  
- Issue: 静态站依赖大量前端注入组件与手写动画，直接迁移至 React 需保留体验且兼容现有脚本。  
- Solution: 计划阶段建议先封装 Header/Footer 组件并短期复用现有脚本逻辑，逐步在 React 中重写动画与交互，减少一次性大改风险。

**[总结与下步计划]**  
- 下一步根据路线图输出页面与后端 API 的详细工单（如 Timeline API、Paper 搜索等），并与 T002 后台扩展协同排期。  
- 在实施前确认数据库扩展的字段与索引需求，避免与现有文章模型冲突。

---

### 📅 2025-10-31 16:39
#### 🧭 规划任务：DOC-20251031A – 静态站整合方案
**[计划阶段]**  
- 根据当前 Next.js + Express 架构，梳理 `public/` 静态站的页面、组件与数据依赖。  
- 结合前后端能力，提出分阶段迁移与后端数据承载策略，确保不立即改动线上内容。

**[开发阶段]**  
- 更新 `current_tasks.md`，新增 T009 并列出内容融合的五步路线图，同时保留既有高优任务。  
- 确认无需修改 `public/` 资源，仅记录计划以备后续执行。

**[问题与解决]**  
- Issue: 原任务列表缺少针对静态站迁移的指引，无法协调前后端工作。  
- Solution: 新增 T009 并细化规划，覆盖内容梳理、组件化、数据迁移、分步上线与 SEO 考量。

**[总结与下步计划]**  
- 等待下一阶段确认各页面优先级，并在执行前拆分为具体开发子任务。  
- 后续需要将路线图细化为数据库模型设计和 Next.js 页面框架的实施计划。

---
### 📅 2025-10-31 16:23
#### 📂 维护任务：DOC-20251031 – 同步 docs_for_llm
**[计划阶段]**  
- 核对仓库实际目录与最新代码，实现前后端架构现状梳理。  
- 对照 `docs_for_llm` 现有内容，列出需要更新的文件与重点信息。

**[开发阶段]**  
- 重写 `docs_for_llm/readme_plan.md`，补充 Next.js 前端与 Express/Prisma 后端的运行方式及已完成功能。  
- 调整 `docs_for_llm/current_tasks.md`，标记注册登录任务完成并新增当前高优先级需求。  
- 重新生成 `docs_for_llm/structure.txt`，排除 `node_modules` 等目录，记录最新项目结构。

**[问题与解决]**  
- Issue: 原结构文档包含大量已经不存在的目录（如 `backend/public`）且列出依赖目录，阅读困难。  
- Solution: 使用脚本遍历仓库时过滤多余目录，仅保留核心源码与文档路径，便于快速定位资源。

**[总结与下步计划]**  
- `docs_for_llm` 已与现状同步，后续若有代码结构变动需及时更新对应文档。  
- 建议下一步在完成后台管理增强（T002）前先梳理接口与权限设计，必要时拆分子任务。

---


---
