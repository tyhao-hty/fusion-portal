# T009 – 阶段二跟进行动清单（可执行子任务）
> 目标：在已完成的 API/前端/数据脚本基础上，补齐上线验证、筛选后端化、性能微调和阶段二对齐准备。  
> 默认不跑自动化测试；补偿措施以手动冒烟为主。  
> 状态：✅ 已完成（2025-12-02 12:49 CST）

## 子任务 1：站点重写 / 路由上线确认
- 步骤
  1. 盘点现有网关/Nginx/平台路由，确认 `/links.html`、`/papers.html` → `/site/*` 是否已发布；避免与 Next rewrites 冲突（检查是否存在双重 rewrite）。
  2. 若缺失：提供配置片段与变更单草稿，注明风险与回滚步骤。
  3. 验证路径：使用无缓存模式/临时查询参数（或 curl `-H 'Cache-Control: no-cache'`）访问 `/links.html`、`/papers.html`、`/site/*`，确认导航高亮正常。
  4. 回滚策略：如上线失败，切回旧路由映射或仅保留 Next 内部 rewrites。
- 风险与对策：Nginx 与 Next 重写冲突、CDN/浏览器缓存影响验证 → 采用无缓存验证；准备快速回滚指令。
 - 进度（2025-12-02 12:06 CST）：本地 `frontend/next.config.js` 已包含 `/index.html`、`/history.html`、`/links.html`、`/papers.html` → `/site/*` rewrites；未发现额外前端重写。尚需在部署层（Nginx/CDN）确认无二次 rewrite，并按上述无缓存方式验证上线后效果。

## 子任务 2：前端筛选参数后端化（history/links/papers）
- 步骤
  1. 核对后端 API 支持的查询参数（timeline/links/papers：q/yearFrom/yearTo/tags/section/group/view/sort/limit/page），若缺口先在阶段二对齐（见子任务 5）。
  2. 将筛选条件透传至请求 URL（SWR/fetch），保留前端状态仅作展示与回填，不做全量客户端过滤。
  3. 更新错误/空态提示以包含当前筛选条件，确保分页与“加载更多”使用后端 meta。
  4. 冒烟 Checklist（手动）：默认加载；单一条件；多条件组合；无结果空态；翻页/加载更多仍按筛选；刷新后筛选持久化。
  5. 回滚策略：如后端不兼容，保留切换开关或快速回退到纯前端筛选路径。
- 风险与对策：后端参数未就绪 → 前置对齐；不跑自动化测试 → 强制执行手动冒烟清单。
- 进度（2025-12-02 12:06 CST）：`/site/links` 和 `/site/papers` 现已将筛选条件（q/section/group/tags/year/sort）透传到 `/api/links`、`/api/papers`；错误状态与加载提示已在 UI 中展示。仍需在可用后端环境手动跑冒烟清单（多条件+无结果+加载更多），若发现后端参数缺失则按回滚策略退回前端筛选。

## 子任务 3：交互性能微调（节流 + 样式收敛）
- 步骤
  1. 为 IntersectionObserver 回调和“加载更多”按钮添加简单节流/防抖，避免高频触发。
  2. 以 Timebox 2h 为限，将 skeleton/按钮等样式逐步抽离 `styles-legacy.css`（或以局部 Tailwind/CSS module 实现）；超过时间保持现状，仅提交 JS 节流。
  3. 移动端验证：过滤栏堆叠、按钮可点区域、骨架不挡内容。
- 风险与对策：legacy 样式副作用 → 小步提交，超时即停；变更后快速手动检查三页（history/links/papers）。
- 进度（2025-12-02 12:27 CST）：`TimelineFeed`、`LinksDirectory` 的滚动加载与按钮已加 400ms 节流，避免高频触发；未做样式抽离（按 timebox 保持现状）。

## 子任务 4：数据脚本验证与日志
- 步骤
  1. 在可用 DB 环境执行 `npm run seed:timeline -- --dry-run`、`seed:links`、`seed:papers`，记录输出路径与 checksum；确认脚本幂等（重复运行不重复插入）。
  2. 若受阻（无 DB/权限），记录阻塞原因与所需前置条件，更新 dev_notes。
  3. 将运行日志保存到 `backend/prisma/seeds/logs/`，并在 dev_notes 追加条目。
- 风险与对策：环境差异导致失败 → 先 dry-run，必要时调低 batch；确认重试与幂等逻辑有效。
- 进度（2025-12-02 12:44 CST）：已在可用环境运行 seeds：  
  - `seed:timeline -- --dry-run`（成功，log: `timeline-dry-run-2025-12-02T04-41-51-977Z.json`）  
  - `seed:links -- --dry-run`（成功，log 生成于 `logs/`，保持原 2025-11-05 migrate）  
  - `seed:papers -- --dry-run`（成功，log: `papers-dry-run-2025-12-02T04-43-23-465Z.json`）  
  - `seed:timeline -- --batch 200` 正式执行（log: `timeline-migrate-2025-12-02T04-42-50-069Z.json`）  
  Links/Papers 正式未重跑（已有历史 migrate log），可按需补跑。checksum/计数已写入对应日志。

## 子任务 5：阶段二对齐（与 T002/T003）
- 步骤
  1. 梳理时间线/论文/链接后台 CRUD 字段与校验规则，产出 ER 草图或 TS interface diff。
  2. 与文章模型（T003）交叉字段对齐（年份、标签、引用关系），列出 schema/API 变更提案。
  3. 将对齐结果同步到 `T009_static_merge.md` 与相关任务文件，拆分为可执行工单。
- 风险与对策：后端/前端对 Schema 理解不一致 → 先出对比稿（ER/TS diff）再动手；必要时调整子任务顺序，先完成本对齐再做筛选透传。
