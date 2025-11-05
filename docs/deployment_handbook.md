# 部署手册 – 核聚变门户（T009 更新）

> 版本：2025-11-05  
> 适用范围：Next.js 前端（`frontend/`）+ Express/Prisma 后端（`backend/`）联合部署  
> 维护人：AI 协作者（最新更新），审核人：郝天一

---

## 1. 环境准备
- **运行环境**：Node.js ≥ 18，npm ≥ 9，PostgreSQL ≥ 14。
- **必要变量**：
  | 变量 | 说明 | 示例 |
  | --- | --- | --- |
  | `DATABASE_URL` | Prisma 连接字符串 | `postgres://fusion:password@db:5432/fusion` |
  | `JWT_SECRET` | 后端认证密钥 | 随机 32 字符 |
  | `NEXT_PUBLIC_API_URL` | 前端访问后端的根路径 | `https://api.fusion.example.com` |
  | `SENTRY_DSN` | （可选）前后端错误监控地址 | `https://***@sentry.io/123` |
  | `PLAYWRIGHT_BROWSERS_PATH` | （本地 E2E）浏览器缓存路径 | `.playwright-browsers` |
- **依赖安装**：
  ```bash
  cd backend && npm install
  cd ../frontend && npm install
  ```

## 2. 部署流程
1. **数据库迁移与数据校验**
   ```bash
   cd backend
   npm run prisma:migrate
   npm run seed:timeline -- --dry-run   # 校验 JSON 与数据库模型一致性
   npm run seed:timeline                # 确认后写入真实数据
   ```
2. **后端构建与启动**
   ```bash
   npm run build         # 如有打包步骤
   npm run start
   ```
   - 监听健康检查：`GET /healthz`（返回 `200 { status: 'ok' }`）。
   - 观察日志：超 1% 5xx 或 Prisma 慢查询需警戒。
3. **前端构建**
   ```bash
   cd ../frontend
   npm run lint
   npm run build
   ```
4. **前端部署/启动**
   ```bash
   npm run start -- --hostname 0.0.0.0 --port 3000
   ```
   - 部署平台（Vercel/容器）需确保上方环境变量已注入。

## 3. 发布前验证清单
- `/site`：导航、模块卡片、移动端折叠菜单、跳转到旧站静态页。
- `/site/history`：
  - 首屏加载展示里程碑列表；
  - “加载更多里程碑”按钮状态正常（禁用时展示“已经到底啦”）；
  - 网络失败时显示错误提示 + “重试”按钮。
- `/api/timeline`：
  - `page=1&limit=8` 返回 8 条以内数据；
  - `page` 越界时返回 `hasNext: false`；
  - 关键字筛选（`keyword=ITER`）返回包含关键词的记录。
- **旧站兜底**：访问 `/science.html`、`/theory.html`，确认 `components/common.js` 加载成功、返回首页链接可用。
- **自动化测试**：
  ```bash
  cd frontend
  PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npm run test:e2e
  npm run test -- --runInBand TimelineFeed
  cd ../backend && npm run test
  ```

## 4. 监控与告警
- **后端**：接入 Sentry/Prometheus，关注 `/api/timeline` 错误率、P95 响应时延。
- **前端**：开启 Sentry 或 Vercel Web Vitals，监控 `/site`、`/site/history` FCP/LCP。
- **回退指标**：当 `/api/timeline` 连续 5 分钟失败率 > 5% 或 P95 > 1s 时，触发自动告警，准备切换到旧站静态页面。

## 5. 回滚流程
1. **前端回滚**
   - 切换部署到上一次稳定版本；
   - 或在 Nginx/网关中将 `/site`、`/site/history` 重写回 `public/index.html`、`public/history.html`。
2. **后端回滚**
   - 使用 `prisma migrate resolve --rolled-back <migration_id>` 标记失败迁移；
   - 从 JSON 备份或数据库快照恢复 `timelineEvent` 数据；
   - 重新运行 `npm run seed:timeline`.
3. **验证**
   - 手动访问旧站页面，确认内容加载正常；
   - 监控指标恢复后再计划二次发布。

## 6. 附录
- **Playwright 调试**：
  ```bash
  cd frontend
  PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npx playwright test --debug
  ```
- **常见问题**：
  - *EACCES/EPERM 绑定端口失败*：在受限环境下使用自托管 Playwright 时，可改用本地机器运行 `npm run test:e2e`。
  - *TypeScript ESLint 告警*：保持 TypeScript 版本在 `~5.4`，升级需同步调整 `typescript-eslint` 系列依赖并更新 `AGENTS.md`。

---

> 文档变更需同步 `docs_for_llm/tasks/T009_static_merge.md` 与 `docs_for_llm/dev_notes.md`，确保 AI 协作者了解最新发布流程。
