## 性能基线与监控指引（2025-11-05 更新）
- **首屏性能**：在构建完成后使用 Lighthouse（桌面+移动）记录 `/site` 与 `/site/history` 的 FCP/LCP/CLS；若指标劣于旧版 `/index.html` 5% 以上，需回溯 CSS/脚本差异。
- **时间线接口**：部署阶段运行 `curl -w "%{time_total}"` 或 Postman 采样 `/api/timeline?page=1&limit=8`、`/api/timeline?page=3`，确保 P95 < 400 ms；出现波动时回滚至 JSON 源并开启 Prisma 慢查询日志。
- **无限滚动稳定性**：通过 Playwright “加载更多里程碑” 场景确认分页按钮状态、IntersectionObserver 自动加载均可恢复；若网络抖动导致 `hasNext` 状态错误，使用 SWR `mutate` 强制刷新并在监控中加入前端报错采样。
- **回退路径**：每次部署后验证 `/science.html`、`/theory.html` 等静态页在 200 ms 内返回并加载 `components/common.js`，确保旧站兜底链路可用。
