## 路线图
1. ✅ **内容清单与分层**：梳理 `index`、`history`、`links`、`papers`、`science`、`technology`、`business` 页面及其依赖组件/数据。
2. 🔄 **前端适配方案**：在 `app/(site)/` 建立对应路由，抽象 Header/Footer，暂时引入原 `styles.css`，逐步拆分为 Tailwind/模块化样式；以 React 元数据组件替换 `meta.js`。
3. 🔄 **数据迁移设计**：将 `data/timeline.json` → `TimelineEvent`、`data/papers.json` → `Paper`/`PaperTag`、`data/links.json` → `LinkSection`/`LinkGroup`/`Link`，其余叙述内容暂保留 Markdown/静态。
4. 🔄 **逐步替换策略**：阶段一复刻首页/时间线并接入只读 API；阶段二迁移论文/链接并实现后台录入；阶段三迁移专题页面为 Markdown 驱动内容。
5. 🔄 **运营与 SEO 考量**：保持 URL 结构与导航，设置 301/静态导入，生成新 sitemap 与结构化数据；迁移期间监控 SEO 指标。

## 阶段交付里程碑
- **阶段一（待排期）**：交付 `app/(site)/layout.tsx`、`app/(site)/page.tsx`、`app/(site)/history/page.tsx`，并完成 `GET /timeline` API 设计及 Prisma schema 草图。
- **阶段二（依赖后台扩展）**：交付 `GET /papers`、`GET /links` API 和后台录入表单，实现 `Paper`、`PaperTag`、`LinkSection` 等模型迁移。
- **阶段三（长期）**：将科普/理论/技术/商业页面迁移为 Markdown 驱动内容，接入未来 CMS 或 Git 驱动发布流程，下线旧版入口。

## 阶段一准备清单
- [x] 输出 `app/(site)/layout.tsx` 与 `Header`/`Footer` React 组件草案，对应现有导航行为；
- [x] 定义 `GET /timeline` API 契约（结构、分页、错误码），与后端确认实现方式；
- [x] 设计 `TimelineEvent` Prisma 模型字段/索引及与 `Article` 的潜在关联；
- [x] 提炼 `styles.css` 必需变量/动画，形成样式迁移指南；
- [x] 定义阶段一验收标准（UI 一致性、数据校验、回退机制），准备评审。

### 路由与兼容策略
- 过渡期使用 `/site` 子路径承载新版页面（`app/site/layout.tsx`, `app/site/page.tsx`, `app/site/history/page.tsx`），旧站仍可通过 `/index.html` 访问。
- 在 `next.config.js` 中配置 rewrites（文档中需列出完整清单）：
  ```js
  module.exports = {
    async rewrites() {
      return [
        { source: '/index.html', destination: '/site' },
        { source: '/history.html', destination: '/site/history' },
      ];
    },
  };
  ```
- 部署前在文档中提供 rewrites/redirects 清单，并设置 `<link rel="canonical">` 指向 `/site/...`，防止 SEO 重复。新版稳定后再执行 301 重定向并下线旧 HTML；其他尚未迁移的页面继续使用原静态文件。
- 将现代应用页面迁移到 `app/(dashboard)/` 路由分组，避免根布局重复渲染两个导航体系。
