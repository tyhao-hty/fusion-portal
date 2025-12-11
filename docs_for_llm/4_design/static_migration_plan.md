## 路线图
1. ✅ **内容清单与分层**：梳理 `history`、`links`、`papers`、`science`、`technology`、`business`、`theory` 页面及其依赖组件/数据。
2. 🔄 **前端适配方案**：`app/(site)/` 已承载根路由页面，使用 React Header/Footer 与元数据构建；保留 legacy 样式为全局导入，逐步拆分为 Tailwind/模块化样式。
3. 🔄 **数据迁移设计**：将 Express/Prisma 提供的数据模型（时间线/论文/链接/文章）映射到 Payload schema（如 `TimelineEvent`、`Paper`/`PaperTag`、`LinkSection`/`LinkGroup`/`Link` 等），其余叙述内容可暂保留 Markdown/静态。
4. 🔄 **逐步替换策略**：阶段一保持前端读取 Express API，验证 Payload schema 与数据迁移脚本；阶段二起逐模块切换到 Payload（Links/Papers/Timeline/Articles），每个模块完成 CRUD/权限验证后再切换前端数据源。
5. 🔄 **运营与 SEO 考量**：保持现有根路由 URL，不再提供 `*.html` rewrites；生成 sitemap 与结构化数据；切换数据源时保持响应结构兼容或通过 BFF 适配。

## 阶段交付里程碑
- **阶段一（进行中）**：前端根路由已落地；完成 Payload schema 设计及迁移脚本雏形，确认 `GET /timeline` 等接口的兼容输出。
- **阶段二（依赖后台扩展）**：交付 Payload 版的 Links/Papers 模块（schema + 数据迁移 + CRUD 验证），前端通过 BFF/Route Handler 切换到 Payload 数据源。
- **阶段三（长期）**：迁移 Articles/Users 等复杂模块，前端/后端统一基于 Payload；将科普/理论/技术/商业内容转为 Markdown/CMS 驱动，彻底下线 Express。

## 阶段一准备清单
- [x] 输出 `app/(site)/layout.tsx` 与 `Header`/`Footer` React 组件草案，对应现有导航行为；
- [x] 定义 `GET /timeline` API 契约（结构、分页、错误码），与后端确认实现方式；
- [x] 设计 `TimelineEvent` Prisma 模型字段/索引及与 `Article` 的潜在关联；
- [x] 提炼 `styles.css` 必需变量/动画，形成样式迁移指南；
- [x] 定义阶段一验收标准（UI 一致性、数据校验、回退机制），准备评审。

### 路由与兼容策略
- 页面直接使用根路由（`/history`、`/links`、`/papers` 等），无 `/site` 前缀与 `*.html` rewrites。
- 旧静态 HTML 保留在 `public/` 作为备份，不再提供跳转或兜底。
- 后续模块迁移到 Payload 时，通过 BFF/Route Handler 保持前端响应结构稳定，必要时逐模块切换数据源。
