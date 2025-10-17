# fusion-portal
# 项目说明 - 核聚变门户网站

## 1. 项目简介
核聚变门户网站旨在以中文为主，为科研人员、工程师与公众提供核聚变领域的系统化信息入口。站点汇集发展历程、理论知识、实验技术、商业进展与外部资源，并以交互式组件和搜索工具提升阅读体验。

## 2. 技术栈与依赖
- **前端技术**：原生 HTML5、CSS3、ES6+ JavaScript。
- **运行环境**：现代浏览器（需支持 `fetch`、`IntersectionObserver`、`matchMedia` 等 API）。
- **数据来源**：本地 JSON (`data/links.json`、`data/papers.json`、`data/timeline.json`)；无外部构建或打包依赖。

## 3. 文件结构与说明
```text
.
├── CHANGELOG.md                  # 变更记录（片段）
├── AGENTS.md                     # 贡献指南，面向自动化代理或新增贡献者
├── admin.html                    # 后台管理界面入口
├── admin.js                      # 后台管理系统逻辑（数据增删改查）
├── styles-admin.css              # 后台管理系统独立样式
├── assets/
│   └── og-default.png             # Open Graph 与社交分享默认配图
├── components/
│   ├── common.js                  # 通用脚本：头尾加载、导航交互、平滑滚动等
│   ├── footer.html                # 页脚模板，包含版权与导航
│   ├── head.html                  # `<head>` 模板，插入 SEO 与社交元数据
│   ├── header.html                # 顶部导航模板，含移动端折叠菜单
│   └── meta.js                    # 元数据注入逻辑，按页面配置动态生成标签
├── data/
│   ├── links.json                 # 资源导航数据，分组列出外部链接
│   ├── papers.json                # 论文列表与标签信息
│   ├── schema.md                  # 数据文件结构定义与示例
│   └── timeline.json              # 发展历程时间线数据
├── docs/
│   └── architecture.md            # 架构与模块说明（含后台系统）
├── history.html                   # 发展历史页：时间线动态加载、科学家介绍
├── index.html                     # 首页：模块概览与呼叫按钮
├── links.html                     # 相关链接页：支持搜索与懒加载
├── papers.html                    # 论文页：按标签渲染并支持关键词筛选
├── science.html                   # 科普知识页：入门级解读与外部资源
├── styles.css                     # 全站样式：布局、主题色、动画
├── technology.html                # 技术路线页：磁约束、惯性约束等对比
├── theory.html                    # 理论知识页：深入原理与判据
├── business.html                  # 商业化进展页：公司案例与市场趋势
├── todo.md                        # 历史计划列表（已全部完成）
└── README.md                      # 当前文档
```

## 4. 页面与模块逻辑
- **组件装配**：页面内的 `<div data-component="header/footer">` 由 `components/common.js` 使用 `fetch` 注入 `header.html` 与 `footer.html`，确保导航与版权统一管理。
- **元数据处理**：各页面在 `<head>` 先写入 `window.__PAGE_META__`，`meta.js` 会合并默认配置、渲染 `head.html` 模板并回填 `<title>`、OG/Twitter 标签，实现 SEO 与分享信息的动态同步。
- **交互脚本**：
  - `common.js` 管理移动端导航折叠、跳转平滑滚动、页脚年份自动更新以及滚动时的头部背景效果；
  - `history.html` 内联脚本读取 `data/timeline.json`，按分页渲染时间线卡片并配合 `IntersectionObserver` 做入场动画与懒加载；
  - `links.html` 载入 `data/links.json`，支持分类懒加载、搜索过滤与统计信息更新；
  - `papers.html` 载入 `data/papers.json`，按标签映射到对应容器并提供关键词搜索、逐条动画。
- **数据约定**：JSON 数据通过 `fetch` 本地读取，需与页面脚本约定的字段（如 `id`, `title`, `groups`, `tags`）保持一致。

## 5. 功能状态
- **已实现**：
  - 响应式页面框架与统一导航/页脚组件；
  - 首页模块入口、各专题内容页（科普、理论、技术、商业等）；
  - 时间线懒加载、资源导航搜索分页、论文列表筛选等交互功能；
  - 动态元数据与基础可访问性（跳转链接、ARIA 属性）；
  - 后台管理系统（`admin.html`）支持对 `data/` 目录 JSON 数据的查看、编辑、导入导出与 localStorage 暂存。
- **待优化/可扩展方向**：
  - 已添加后台管理系统，可在浏览器端直接编辑和导出 `data/` 目录数据；
  - 增设自动化测试或数据校验脚本，避免 JSON 手工错误；
  - 引入多语言支持或暗黑模式切换；
  - 将常用交互逻辑拆分为可复用模块并减少重复内联脚本；
  - 增加内容更新脚本（例如与外部 API 同步最新论文或新闻）。

## 6. 本地运行与部署
1. **本地预览**：
   ```bash
   cd /path/to/Fusion_Site
   python3 -m http.server 8080
   ```
   在浏览器访问 `http://localhost:8080`，修改文件后刷新即可查看效果。若需指定编码，可使用 `npx serve` 或任意静态服务器。
2. **部署建议**：将仓库部署到静态托管平台（如 GitHub Pages、Vercel、Netlify 或个人 Nginx）；确保静态服务器允许访问 `components/` 与 `data/` 目录以便 `fetch` 请求加载资源。
