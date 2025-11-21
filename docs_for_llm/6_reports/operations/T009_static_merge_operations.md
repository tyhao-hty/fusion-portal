## 监控与运维要求
- 生产环境接入错误监控（如 Sentry）与日志系统，监控指标包括 API 错误率 > 1%、慢查询、前端错误采样、关键页面停留/跳出率。
- 部署脚本需在 `NODE_ENV=production` 时初始化监控 SDK，并验证告警通道（如测试触发一次故障）。
- 与运维协调数据库慢查询日志与报警策略，定期检查 `timelineEvent` 查询性能。

## 部署与回滚建议
- 部署流程：依次执行 `npm run prisma:migrate`、`npm run seed:timeline -- --dry-run`、`npm run seed:timeline`；前端运行 `npm run build` 并确认 rewrites 生效。
- 回滚策略：保留 `frontend/public/` 旧版页面，必要时切换导航至旧版 `/index.html` / `/history.html` 并停止 `/api/timeline` 调用；数据库可使用 JSON 备份重新导入。
- 配置校验：上线前确认 `NEXT_PUBLIC_API_URL`、监控 DSN、数据库凭据、Sentry/慢查询告警阈值，部署后记录性能对比。
- 详细步骤参考《docs/deployment_handbook.md》，其中列出了环境变量、构建命令、联动验证与回滚操作手册。

## 依赖与环境约束
- 在 `package.json` 声明 `engines`（Node ≥ 18、npm ≥ 9），并锁定关键依赖版本（例如 `@types/node` 使用确定版本）。
- 前端新增 `swr` 依赖，用于时间线分页/重试逻辑；相关组件需保持一致的 fetcher 接口。
- 已提交基础 ESLint 配置（extends `next/core-web-vitals`），后续如需新增规则/插件请同步更新脚本与 CI；`npm run lint` 已通过，当前存在 TypeScript 版本提示（5.9.3 超出 @typescript-eslint 官方支持范围），如需升级需同步更新 linter 生态或锁定 TypeScript 版本。
- CI 环境需遵循相同的 Node/npm 版本，避免迁移脚本或 Next.js 构建出现不一致。
