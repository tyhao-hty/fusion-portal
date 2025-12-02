# T003 / Step 4 – 前端列表与详情页

## 目标
接入扩展后的文章 API，完善列表与详情页的渲染、交互与状态处理，确保与 `/site` 生态一致。

## 主要产出
- 列表页：分页/搜索/分类/标签/年份过滤，加载态、空态、错误态，状态持久化（URL 或 localStorage）。
- 详情页：`app/articles/[slug]/page.tsx` 渲染 Markdown（remark/rehype）、封面/元信息/阅读时间，404/错误态处理。
- 公共类型/数据层更新，复用 Article 类型与 API 封装。

## 执行步骤
1. 更新前端数据层/类型，适配新 API 响应（meta、filters）。
2. 列表页接入后端过滤与分页；实现搜索、分类、标签、年份控件与状态持久化；处理加载/空/错/分页交互。
3. 新建文章详情页：服务端获取文章数据，渲染 Markdown，显示封面、作者/时间/标签、阅读时间，处理 404/错误态。
4. 确保导航/链接与 `/site` 入口一致，添加基础 SEO 元数据（title/description）。
5. 进行本地冒烟或静态检查，记录风险与待办。
6. 在 `T003_article_render.md` 标记完成情况，更新 `dev_notes.md`。

---

## 当前进展（2025-12-02）
- 已新增数据层与页面：`frontend/lib/articles.ts`、`app/articles/page.tsx`（搜索+分页，展示 meta）、`app/articles/[slug]/page.tsx`（Markdown 渲染、meta 展示）。  
- 依赖新增：`react-markdown`, `remark-gfm`。  
- 列表保留搜索+分页（过滤控件暂不开发，等待需求明确）；详情页使用增强版 `.prose-article` 主题，外层卡片+渐变背景提升与 `/site` 的一致性。  
- 待办：若后续需要筛选控件或权限收紧（`status=all`），新开任务处理；当前交付以样式对齐为主。
