## 依赖与风险
- 依赖 T002 后台管理扩展提供数据录入能力；
- 需与后端确认数据库 schema 与迁移安排；
- 在未完成阶段一前不建议直接替换生产站点，保留 `_legacy-static` 作为回退。

### 风险评估表（2025-11-05 更新）
| 风险项 | 影响 | 应对措施 | 状态 |
| --- | --- | --- | --- |
| `/api/timeline` 服务不可用 | 历史页空白、分页失败，影响核心功能 | SWR 自动重试 + 提示旧站链接；部署前执行 `npm run seed:timeline -- --dry-run` 验证；监控 API 5xx | 监控中 |
| 时间线数据与 JSON 不一致 | 文案/排序出错，历史页展示异常 | 迁移后对比 `timeline.json` 校验 checksum；Prisma seed 输出差异报告 | 预防中 |
| IntersectionObserver 在低端设备异常 | 无限滚动停滞，用户需手动刷新 | 保留“加载更多里程碑”按钮；Playwright 覆盖手动触发场景 | 可接受 |
| 静态兜底链路失效 | 旧站 fallback 不可用，无法回滚 | 每次部署执行 Playwright “旧站回退” 场景；部署手册中保留 `public/*.html` 复制流程 | 监控中 |
| TypeScript/Lint 工具链升级不兼容 | 构建失败或 ESLint 报错 | 锁定 TypeScript ~5.4（已在 `frontend/package.json` 采用 `~5.4.5`），升级前在 `AGENTS.md`、`T009` 文档同步流程 | 受控 |
