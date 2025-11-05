# 回滚预案 – 静态站内容融合（T009）

> 版本：2025-11-05  
> 维护人：AI 协作者（最新更新），审核人：郝天一

---

## 1. 触发条件
- `/site` 或 `/site/history` 出现无法渲染的严重错误（500/白屏）。
- `/api/timeline` 连续 5 分钟错误率 > 5% 或 P95 延迟 > 1 秒。
- 时间线数据与旧版 JSON 明显不一致（缺失里程碑、排序混乱）。
- 监控告警触发、用户反馈核心功能不可用。

一旦满足任一条件，应立即启动回滚流程，并同步产品/运营团队。

---

## 2. 回滚策略概览
| 影响范围 | 回滚动作 | 预计耗时 | 备注 |
| --- | --- | --- | --- |
| 前端 `/site`、`/site/history` | 将网关/rewrites 指回静态 HTML (`/index.html`, `/history.html`) | 5-10 分钟 | 拷贝最新静态文件至 CDN，清空缓存 |
| 时间线 API | 停用新版 `/api/timeline`，恢复旧 JSON 数据或缓存响应 | 10 分钟 | 前端 fallback 点击“查看旧版”提示 |
| 数据库 | 回滚 `TimelineEvent` 表至上一次快照 | 15-20 分钟 | 使用 `prisma migrate resolve` + JSON 备份 |

---

## 3. 前端回滚步骤
1. **切换 rewrites**  
   - 修改部署平台或网关规则：  
     ```
     /site           -> /index.html
     /site/history   -> /history.html
     ```
   - 若使用 Vercel，可暂时禁用 Next.js 应用，使静态目录接管。
2. **刷新缓存**  
   - 清除 CDN / Nginx 缓存，确保用户加载到旧版 HTML。
3. **验证**  
   - 手动访问 `/index.html`、`/history.html`，检查导航、脚本、时间线滚动正常。
   - 运行 `curl -I https://portal.example.com/index.html` 确认状态码 200。

---

## 4. 后端回滚步骤
1. **暂停写入**  
   - 若有后台生产写操作，请临时切断流量或将 API 置为只读模式。
2. **数据库恢复**  
   - 找到最近一次成功备份：`timeline_backup_YYYYMMDD.sql` 或 `timeline.json`.
   - 运行：
     ```bash
     psql $DATABASE_URL < timeline_backup_YYYYMMDD.sql
     ```
     或使用 `npm run seed:timeline -- --restore-from=path/to/timeline.json`.
3. **Prisma 状态校准**  
   - 若有未完成的迁移，执行：
     ```bash
     npx prisma migrate resolve --rolled-back <migration_id>
     ```
4. **服务恢复**  
   - 重启后端服务，观察日志是否仍有错误。

---

## 5. 通知与监控
1. **通知渠道**：Slack `#fusion-ops`、项目群邮件，说明回滚原因与预计恢复时间。
2. **监控观察**：关注 Sentry、Prometheus、前端 Web Vitals，确保错误率恢复正常。
3. **用户反馈**：通过客服或公告提示已切换至旧版页面，并预估恢复时间。

---

## 6. 恢复新版本
1. 修复导致回滚的问题（代码/数据/配置）。
2. 在预发环境重新执行：
   ```bash
   npm run prisma:migrate
   npm run seed:timeline -- --dry-run
   npm run build
   PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npm run test:e2e
   npm run test -- --runInBand TimelineFeed
   ```
3. 生成新的部署包，执行灰度发布：
   - 先放出 10% 流量，观察 30 分钟；
   - 无异常后恢复全部 rewrites 到 `/site`、`/site/history`。
4. 发布完成后更新监控告警阈值、记录复盘报告。

---

> 本文档应与《docs/deployment_handbook.md》一起使用，保持触发条件、操作流程和沟通模板的一致性。回滚演练建议每季度至少执行一次。*** End Patch*** End Patch to=functions.apply_patch code```json
