# T003 – 文章数据库加载与渲染

## 概述
实现文章内容从数据库的动态加载与渲染，支持 Markdown 编辑、分页展示、搜索过滤，并与前端/后台协同，形成统一的内容发布流程。

- **优先级**：🧩 中
- **当前状态**：✅ 已完成
- **关联系统**：Express API、Prisma、Next.js 文章页、后台编辑器（T002）

## 目标
1. 后端提供文章列表/详情 API，支持分页、排序、搜索；
2. 前端文章列表页与详情页读取 API 数据，渲染 Markdown/富文本；
3. 与 T002/T009 协同，确保文章内容在后台更新后实时反映至前端。

## 现状
- 后端 `/articles` 列表/详情支持分页、搜索、过滤、排序，Prisma 模型包含 slug/摘要/封面/状态/发布时间/阅读时长/分类/标签等字段。
- 前端 `/articles` 搜索+分页渲染，详情页 Markdown 展示、元信息与样式对齐站点。  
- 冒烟（Step5）已完成：默认加载、搜索空态、分页（含 Admin）、详情/404 正常；`status=all` 目前对外开放，如需收紧需新任务。

### 子任务拆分（执行用）
- `T003_step1_schema_alignment.md`：需求与数据模型对齐，定稿字段、分类/标签/审核流程。
- `T003_step2_backend_api.md`：Prisma 迁移与列表/详情 API 扩展（分页/搜索/过滤+meta）。
- `T003_step3_docs_validation.md`：参数校验、错误处理、API 文档补全。
- `T003_step4_frontend_pages.md`：前端列表/详情页对接新 API、状态与 Markdown 渲染。
- `T003_step5_smoke_validation.md`：冒烟清单与收尾记录、回滚策略。

### 进度摘记
- 2025-12-02：完成 Step 1 模型/流程对齐，确定多标签 + 可选单分类 + 状态枚举方案，Prisma 草案见 `T003_step1_schema_alignment.md`。
- 2025-12-02：Step 2 完成——`prisma/schema.prisma` 已引入 slug/摘要/封面/状态/发布时间/阅读时长/分类/标签等字段并完成迁移；`/articles` 列表/详情支持分页/过滤/排序/slug 详情。
- 2025-12-02：Step 3 完成文档补充——新增 `docs_for_llm/5_specs/api_articles.md`，列出列表/详情参数、示例与错误码；`status=all` 传参重测通过，其余参数仍需冒烟验证。
- 2025-12-02：Step 4 实装——新增文章列表/详情页（搜索+分页、Markdown 渲染、meta 展示），公共类型与数据层（`lib/articles.ts`）；尚缺分类/标签/年份过滤控件与运行验证。
- 2025-12-02：Step 3 验证中发现 `status=all` 请求被覆盖为 `published` 待排查；Markdown 样式基础版本上线。
- 2025-12-02：Step 4/5 完成并归档；列表保留搜索+分页，筛选控件暂不开发；`status=all` 当前公开可见，如需权限收紧需新任务处理。

### 权限与可见性约定（结论）
- 前台 Dashboard 默认展示 `status=published`；后台 Admin 取 `status=all` 并可修改状态（PUT `/articles/:id`）。  
- 创建接口未传 `slug` 自动生成；首次发布自动补 `publishedAt`。  
- `status=all` 当前对外开放，如需收紧（仅登录/仅管理员）需新开任务引入鉴权开关。

## 依赖
- T002 中的文章编辑器与分类/标签设计；
- 数据库迁移与部署流程；
- CDN 或缓存策略（若使用 ISR/SSR）需与前端架构协同。
- 2025-11-05 同步：等待 T002 明确分类/标签/时间线关联字段，文章详情需暴露与 `/site/history` 时间线一致的年份/标签元数据。渲染层需求：
  - 列表接口响应应包含 `category`, `tags`, `publishedAt`, `excerpt`, `coverImageUrl`, `timelineYear`，供 `/site` 与 `/site/history` 共享 UI。
  - 详情页需返回 Markdown + `readingTime`、`lastEditedAt`，并暴露关联的 `timelineEvent`（若存在）。
  - 搜索/过滤应支持：关键词、分类、标签、年份（匹配 `timelineYear`），默认按 `publishedAt` desc。

## 验收标准（已满足）
- API 支持分页 + 搜索并通过示例测试/冒烟验证；
- 前端文章页面渲染 Markdown，UI 与站点风格对齐；
- 搜索与分页功能响应及时，并提供空态/错误态；
- 冒烟覆盖创建展示流程，无阻塞问题；筛选控件暂未实现（不在当前范围）。

---

### 状态校验（2025-12-02 18:40 CST）
- Step 1/2/3 已完成并归档（模型与迁移、API 扩展、文档+验证）；任务整体仍“进行中”，待 Step 4/5 完成。
- 已确认 `status=all` 仅鉴权用户可用，前端默认 `published`。
- 待完成功能：  
  - （可选）列表页筛选控件设计；如需收紧 `status=all` 再加鉴权开关（需新任务处理）。  
  - 详情页：Markdown 主题已增强，可按需要微调。  
  - Step 4/5 已归档；列表当前仅搜索+分页，筛选控件暂不开发。  
