# Dev Notes – AI 开发日志与自动总结
> 本文件由 AI 自动维护与人类开发者共同审阅。  
> 所有开发活动、设计决策、问题记录、错误修复与计划总结均应追加至此文件末尾。  
> 不得覆盖历史内容。
> 时间戳格式：`YYYY-MM-DD HH:mm`（北京时间，UTC+8）
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
## 🧩 文件结构说明
- **[计划阶段]**：AI 对任务的理解与执行思路；
- **[开发阶段]**：AI 生成或修改的代码摘要；
- **[问题与解决]**：遇到的错误、依赖问题、架构调整；
- **[总结与下步计划]**：每次任务完成后的反思与后续行动。

---

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

## 🧠 AI 自动维护约定
1. 每次 AI 执行任务后，必须在此文件中追加记录；
2. 若遇到错误、依赖缺失或架构问题，应记录完整解决方案；
3. 文件采用时间倒序排列（最新记录放在最上方）；
4. 所有时间戳统一采用 UTC+8（北京时间）；
5. 不允许删除历史日志，仅可追加。

---

*文件最后更新：2025-11-03 15:12 由 AI 更新*
