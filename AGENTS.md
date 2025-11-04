# Repository Guidelines

## Project Structure & Module Organization
- 前端：`frontend/` 基于 Next.js 14（App Router）+ TypeScript + Tailwind。互动页面集中在 `app/(dashboard)/`；迁移后的静态站点位于 `app/site/`（`/site`、`/site/history`），共享 `components/site/` 的 Header/Footer/Metadata。
- 后端：`backend/` 基于 Express + Prisma + PostgreSQL，提供认证、文章 CRUD、时间线接口 `/api/timeline` 及数据迁移脚本。
- 静态资源：旧版 HTML/CSS/JS 保留在 `frontend/public/`（部署使用）与 `frontend/_legacy-static/`（回退备份）；数据文件仍在 `public/data/*.json`。
- 样式：新组件优先使用 Tailwind + CSS Modules；旧样式暂维护于 `styles-legacy.css` 并逐步拆分。

## Build, Test, and Development Commands
- 后端：`cd backend && npm install && npm run dev`；如首次运行需执行 `npm run prisma:migrate` 与 `npm run seed:timeline`（可加 `-- --dry-run` 验证）。
- 前端：`cd frontend && npm install && npm run dev`，`NEXT_PUBLIC_API_URL` 指向后端地址；构建使用 `npm run build`/`npm run start`。
- Rewrites：Next.js 将 `/index.html` ➜ `/site`、`/history.html` ➜ `/site/history`。上线时再补充 301 重定向并下线旧 HTML。

## Coding Style & Naming Conventions
- TypeScript/TSX 使用 2 空格缩进；项目已提供 `.eslintrc.json`（extends `next/core-web-vitals`），调整规则或插件时同步更新文档与 `package.json`。
- React 组件采用 PascalCase 命名，后端文件/函数使用 camelCase。
- 文案与元数据保持简体中文，通过 `buildSiteMetadata` 统一生成。
- 修改任务或协作说明时同步更新 `docs_for_llm`。

## Testing Guidelines
- 当前以手动验证为主：启动前后端，测试 `/site` 首页、`/site/history` 无限滚动、后台登录/文章管理流程。
- 数据脚本：更新 `public/data/timeline.json` 后运行 `npm run seed:timeline` 并检查输出。
- 自动化测试规划（待落实）：
  - 后端：使用 Vitest/Supertest 为 `/api/timeline` 编写分页、筛选、错误场景单测。
  - 前端：使用 React Testing Library 测试 `TimelineFeed` 的加载、错误、无限滚动行为。
  - E2E：使用 Playwright 覆盖“首页 → 发展历史 → 加载更多”关键流程。详见 `docs_for_llm/tasks/T009_static_merge.md`。

## Commit & Pull Request Guidelines
The repository currently lacks tracked history; adopt short, descriptive Conventional Commit messages such as `feat: extend timeline data` or `fix: repair smooth scroll focus`. For pull requests, include a concise summary of the change, affected pages or data files, validation steps (manual checks performed), and screenshots or screen recordings when visual updates are made. Link to any relevant issues or TODO items to maintain traceability.

## Content & Data Updates
When expanding factual sections, cite reputable sources and update related entries across pages (e.g., ensure `history.html` additions align with `data/timeline.json`). Keep JSON arrays chronologically ordered and prefer ISO-style dates (`YYYY-MM`) for new timeline markers. Review copy for tone consistency and terminology before publishing.


## 🤖 AI 协作规则与上下文约定

本文档用于指导所有 LLM（如 ChatGPT、Codex、Dify Agent 等）在参与本项目时的工作方式。

---

### 🧩 1. 项目上下文文件夹

AI 可访问以下文件夹以理解项目整体：

/docs_for_llm/
├─ readme_plan.md # 项目简介与总体目标
├─ tasks/ # 任务文档目录：README、各任务说明与完成记录
├─ dev_notes.md # AI 工作日志与自动总结
├─ project_structure.txt # 项目目录结构



AI 应始终从上述文件中获取上下文信息。  
当开发者提出新任务时，AI 需要：
1. **更新**或**创建** `tasks/` 下的相关任务文件（例如 `README.md`、`Txxx_*.md`）；
2. 将自己的思考、改动记录写入 `dev_notes.md`；
3. 不要删除已有内容，只能追加；
4. 对于涉及多文件修改的功能，应先提出实现方案，再生成具体代码。

---

### ⚙️ 2. 工作流程建议

AI 应遵循以下开发循环：

1. **分析阶段**  
   阅读 `readme_plan.md` 与 `project_structure.txt`，明确目标。  
2. **规划阶段**  
   在 `tasks/README.md` 或对应任务文档中记录当前任务的开发计划。  
3. **开发阶段**  
   生成代码前，描述修改文件与逻辑意图。  
4. **总结阶段**  
   在 `dev_notes.md` 中追加本次开发日志。

---

### 🧠 3. AI 自我约束与维护任务

- AI 应视 `docs_for_llm` 为自己的“记忆区”；
- 若发现该文件夹内容不一致、冗余或缺失，应主动提出修正建议；
- 对于不确定的设计决策，应先询问人类开发者，不擅自改动核心结构；
- 所有自动生成文件应采用 Markdown 格式并保持结构清晰。

---

### 📜 4. 项目精神与长期方向

本项目旨在构建一个面向公众的 **核聚变科学与工程知识门户**，  
AI 在参与开发时应：
- 保持内容科学、严谨、通俗；
- 避免虚构或误导性信息；
- 注重用户体验与技术可扩展性；
- 为后续 AI + 科研集成留出接口（如问答API、知识库索引、仿真结果展示等）。

---

### ✅ 5. 版本与协作者

- 主开发者：郝天一（Tianyi Hao）
- AI 协作者：ChatGPT / Codex / Dify Agent
- 文档最后更新：2025-11-03