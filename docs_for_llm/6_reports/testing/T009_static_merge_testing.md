## 测试与验证计划
- **后端单测**：已补充 Vitest + Supertest 配置及 `tests/timeline.test.js` 示例，覆盖分页、排序和年份筛选（可在联网环境执行 `cd backend && npm install && npm run prisma:migrate && npm run test`；最近一次运行于 2025-11-04 已通过）。
- **前端组件测试**：已添加 Jest + React Testing Library 脚手架（`jest.config.js`、`jest.setup.ts`、`__tests__/TimelineFeed.test.tsx`），覆盖加载、错误、空态、手动“加载更多里程碑”以及 IntersectionObserver 自动分页场景；使用 `npm run test -- --coverage --runInBand TimelineFeed` 在 Node 22 环境下可稳定通过，`TimelineFeed.tsx` 语句覆盖率 97.5%（`utils/api.ts` 仍待单测补齐）。
- **E2E 测试**：使用 Playwright 覆盖 `/site` 首页渲染、历史页“加载更多里程碑”交互（通过拦截 `/api/timeline` 实现分页验证）以及静态页面回退（`/site`→`/science.html`）。执行 `PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npm run test:e2e` 会先执行 `npm run build`，再以 `next start` 启动生产服务器；若运行环境禁止绑定本地端口，请改在开发者机器上执行并上传报告。截至 2025-11-05，Chromium 环境 4 个场景均通过（36.9s），可使用 `npx playwright show-report` 查看本地报告。
- 运行 Playwright 前需执行 `npx playwright install`，确保端口 3000 未占用；CI 环境可使用 `PLAYWRIGHT_BASE_URL` 指向部署服务。
- **时间线数据迁移校验**：执行 `cd backend && npm run seed:timeline -- --dry-run`，脚本将在控制台输出样例记录并将摘要写入 `backend/prisma/seeds/logs/`（包含文件校验和、数据库记录数量、缺失条目）。如需在 CI 中强制比对，可提供 `--checksum <expected>` 或设置环境变量 `TIMELINE_JSON_CHECKSUM`。运行前请确保 `DATABASE_URL` 指向可用的 PostgreSQL 实例。正式执行日志示例：`timeline-migrate-2025-11-05T05-30-18-999Z.json`。
- **性能与可用性检查**：记录 `/site` 与旧版 `/index.html` 的首屏加载、API 响应时间，并关注 Lighthouse 基线。
- **监控校验**：与运维确认 Sentry/慢查询告警阈值，在部署前演练 API 故障回退（旧站切换/静态数据回退）。

## 阶段一验收标准
- **UI & 交互**：React 页面与 `frontend/public` 对应页面在桌面/移动端的布局、动画、导航行为一致；移动端菜单与平滑滚动无回归。
- **数据准确性**：`/timeline` API 返回内容与原 JSON 数据一致，分页/排序可通过手动测试验证；前端加载、空态、错误态处置得当。
- **SEO & 元数据**：每页提供正确的 `<title>`、`description`、OG/Twitter 标签，并生成静态 `sitemap.xml` 条目。
- **回退机制**：部署后保留旧版路径（`/index.html` 等），发生异常时可切换至 `_legacy-static`；数据库迁移支持回滚脚本。
- **质量保障**：完成冒烟测试（Chrome/Safari/移动端），关键交互经 QA 或自测 checklist 确认并在 `dev_notes.md` 登记。
