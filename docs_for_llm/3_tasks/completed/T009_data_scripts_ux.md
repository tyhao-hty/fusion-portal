# T009 – 数据脚本与导航体验计划（功能拆解）
> 更新时间：2025-11-21 ；聚焦功能，不含测试/报告。

## 目标
- 确保数据脚本可靠、导航一致性与基础体验优化，为后续内容迭代打好底层。

## 执行步骤（最新状态）
- [x] 数据脚本健壮化：timeline/links/papers seed 脚本支持批次参数（默认 200）、重试与延迟，summary 记录 batchSize；当前环境未连库未执行 seeds。  
- [x] 路由与导航一致性：`SiteHeader` 调整导航优先级并弱化旧版 HTML 入口（legacy 样式），`next.config.js` 补充 `/links.html`、`/papers.html` rewrites。  
- [x] UI/UX 微调：时间线首屏骨架 & 渐显动画，加载更多在请求中防重复；timeline/links/papers 的筛选条件持久化到 localStorage。  
- [x] 文档与对齐：状态同步 `T009_static_merge.md`、`dev_notes.md`；测试/报告按要求暂停，后续阶段统一补充。
