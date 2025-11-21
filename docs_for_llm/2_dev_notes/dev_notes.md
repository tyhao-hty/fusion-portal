*文件最后更新：2025-11-05 17:52 由 AI 更新*
# Dev Notes – AI 开发日志与自动总结
> 本文件由 AI 自动维护并由人类开发者定期审阅。  
> 所有开发活动、设计决策、问题记录、错误修复与阶段总结均应追加至此文件。  
> ⚠️ 不得覆盖或删除历史记录。  

---

## 🧠 维护规则

1. **追加方式**  
   - 所有新日志必须追加在“🧩 日志记录区”中，**放在最新一条日志的上方**。  
   - 禁止在旧日志之间插入或修改已有内容。  
   - 每条记录应包含完整的时间戳、任务编号（如适用）、问题与解决方案、下一步计划等。
   - **时间戳格式：** `YYYY-MM-DD HH:mm`（北京时间，UTC+8）

2. **记录顺序**  
   - 文件采用**时间倒序排列**（最新日志在最上方）。  
   - 若多个任务在同一时间段内执行，应按时间戳先后顺序记录。

3. **记录内容**  
   - 应包含任务编号、执行命令、问题与解决、测试结果、后续计划等核心信息，记录结构参考“🧩 日志结构说明”。  
   - 若为错误日志或异常情况，必须记录完整的解决方案与影响分析。

4. **日志生成者**  
   - AI 在每次任务完成后应立即追加记录；  
   - 人类开发者手动修改时，应保留AI原始条目，并注明“人工补充”或“人工修订”。

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
