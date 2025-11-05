# 测试证据 – T009 静态站内容融合

> 最近更新：2025-11-05  
> 维护人：AI 协作者（基于最新执行结果）

---

## 1. 单元测试
| 执行时间 (UTC+8) | 命令 | 结果 | 说明 |
| --- | --- | --- | --- |
| 2025-11-05 10:39 | `cd frontend && npm run test -- --coverage --runInBand TimelineFeed` | ✅ | 覆盖加载/错误/空态/手动加载/IntersectionObserver，`TimelineFeed.tsx` 语句覆盖率 97.5%。 |
| 2025-11-05 13:02 | `cd frontend && npm run test -- --runInBand api` | ✅ | 新增 `__tests__/api.test.ts`，验证 `apiRequest` 成功与错误分支。 |
| 2025-11-05 15:28 | `cd frontend && npm run lint` | ✅ | `/site/papers`、`/site/links` 迁移后通过 ESLint/TypeScript 检查。 |
| 2025-11-05 16:38 | `cd backend && npm run test` | ✅ | Vitest + Supertest 覆盖 `/api/timeline`、新增 `/api/papers` 与 `/api/links` 测试，全量通过。 |
| 2025-11-05 16:41 | `cd frontend && npm run test -- --runInBand papers LinksDirectory` | ✅ | `PapersCatalog` 与 `LinksDirectory` 搜索/分页行为测试通过，无 act 警告。 |

> 需要更新时，请附上最新执行时间与关键覆盖率数据。

---

## 2. E2E 测试
| 执行时间 (UTC+8) | 命令 | 浏览器 | 结果 | 备注 |
| --- | --- | --- | --- | --- |
| 2025-11-05 12:10 | `cd frontend && PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npm run test:e2e` | Chromium | ✅ (36.9s) | 覆盖 `/site` 渲染、加载更多、旧站 fallback。 |
| 2025-11-05 15:30 | 手动验证 | Chromium (手动) | ✅ | 部署前后端后在浏览器验证 `/site/papers`、`/site/links` 搜索、分组与外链行为正常。 |

### 证据
- Playwright 报告归档：`docs/tests/playwright-20251105/index.html`（源自 `frontend/playwright-report/`，Chromium 36.9s 运行）。

---

## 3. 数据脚本与迁移日志
| 执行时间 (UTC+8) | 命令 | 结果 | 摘要日志 |
| --- | --- | --- | --- |
| 2025-11-05 13:30 | `cd backend && npm run seed:timeline` | ✅ | `backend/prisma/seeds/logs/timeline-migrate-2025-11-05T05-30-18-999Z.json`（记录数 14，checksum 一致）。 |
| 2025-11-05 14:47 | `cd backend && npm run seed:papers -- --dry-run` | ✅ | `backend/prisma/seeds/logs/papers-dry-run-2025-11-05T06-47-50-988Z.json`（25 条记录，24 个标签，未写入数据库）。 |
| 2025-11-05 14:53 | `cd backend && npm run seed:papers` | ✅ | `backend/prisma/seeds/logs/papers-migrate-2025-11-05T06-53-37-913Z.json`（完成写入 25 条论文、24 个标签，checksum 记录）。 |

---

## 4. 待补证据
- Lighthouse 桌面/移动报告（计划于 2025-11-05，受本地环境端口限制待外部执行）。
- `/api/timeline` 延迟采样数据（同端口/数据库限制，尚未完成）。
- `cd backend && npm run seed:links -- --dry-run` / `npm run seed:links`（待执行并归档日志）。

---
