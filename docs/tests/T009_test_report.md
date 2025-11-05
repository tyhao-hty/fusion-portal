# 测试证据 – T009 静态站内容融合

> 最近更新：2025-11-05  
> 维护人：AI 协作者（基于最新执行结果）

---

## 1. 单元测试
| 执行时间 (UTC+8) | 命令 | 结果 | 说明 |
| --- | --- | --- | --- |
| 2025-11-05 10:39 | `cd frontend && npm run test -- --coverage --runInBand TimelineFeed` | ✅ | 覆盖加载/错误/空态/手动加载/IntersectionObserver，`TimelineFeed.tsx` 语句覆盖率 97.5%。 |
| 2025-11-05 13:02 | `cd frontend && npm run test -- --runInBand api` | ✅ | 新增 `__tests__/api.test.ts`，验证 `apiRequest` 成功与错误分支。 |
| 2025-11-04 16:59 | `cd backend && npm run test` | ✅ | Vitest + Supertest 覆盖 `/api/timeline` 分页、筛选与参数异常。 |

> 需要更新时，请附上最新执行时间与关键覆盖率数据。

---

## 2. E2E 测试
| 执行时间 (UTC+8) | 命令 | 浏览器 | 结果 | 备注 |
| --- | --- | --- | --- | --- |
| 2025-11-05 12:10 | `cd frontend && PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npm run test:e2e` | Chromium | ✅ (36.9s) | 覆盖 `/site` 渲染、加载更多、旧站 fallback。 |

### 证据
- Playwright 报告（本地生成）：`frontend/playwright-report/index.html`。建议归档至 `docs/tests/playwright-20251105/` 并在评审前提供访问方式。

---

## 3. 数据脚本与迁移日志
| 执行时间 (UTC+8) | 命令 | 结果 | 摘要日志 |
| --- | --- | --- | --- |
| 2025-11-05 13:30 | `cd backend && npm run seed:timeline` | ✅ | `backend/prisma/seeds/logs/timeline-migrate-2025-11-05T05-30-18-999Z.json`（记录数 14，checksum 一致）。 |

---

## 4. 待补证据
- Lighthouse 桌面/移动报告（计划于 2025-11-06）。
- `/api/timeline` 延迟采样数据。
- E2E 报告归档链接或截图。

---

> 本文档用于阶段评审与交接，请在新增测试时同步更新表格，并将原始报告存放于 `docs/performance/`、`docs/tests/` 等目录。*** End Patch
