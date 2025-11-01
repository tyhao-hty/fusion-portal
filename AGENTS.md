# Repository Guidelines

## Project Structure & Module Organization
Pages under the root (`index.html`, `history.html`, etc.) consume shared partials from `components/` and data sources in `data/`. JavaScript helpers in `components/common.js` inject the header, footer, and per-page metadata; keep reusable UI in this folder. Global styling lives in `styles.css`, while images belong in `assets/`. Add new JSON-driven content in `data/` so it can be rendered consistently across pages.

## Build, Test, and Development Commands
This project is a static site; no build step is required. Use a lightweight server for local preview, for example:
```bash
python3 -m http.server 8080
```
Run the command from the repository root and visit `http://localhost:8080`. Refresh the page after modifying HTML, CSS, JSON, or components to confirm changes loaded.

## Coding Style & Naming Conventions
Match existing formatting: 4-space indentation in HTML/CSS and 2 spaces in JavaScript. Favor semantic HTML tags, descriptive class names (e.g., `module-card`), and lower-case, hyphenated filenames. Reuse the component loader by targeting placeholders with `data-component` attributes. Keep copy in simplified Chinese to align with current content, and ensure metadata strings defined in `components/meta.js` stay synchronized with page titles.

## Testing Guidelines
Automated tests are not configured; rely on manual verification. After updates, open the browser console to confirm component fetches succeed and no accessibility warnings appear. Exercise critical flows: navigation toggle on mobile breakpoints, smooth scrolling for in-page anchors, and dynamic year rendering in the footer. Validate JSON edits with a linter or `python -m json.tool data/<file>.json` to avoid malformed data.

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
- 文档最后更新：2025-10-31