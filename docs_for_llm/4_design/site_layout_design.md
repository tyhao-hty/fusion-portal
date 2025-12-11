### 前端布局与组件概览（现状）
- 目录结构：`app/(site)/layout.tsx` 作为公共布局，引入 `SiteHeader`、`SiteFooter`、元数据构建；页面覆盖 `/`、`/history`、`/links`、`/papers`、`/science`、`/theory`、`/technology`、`/business` 等根路由。
- 组件职责：
  - `SiteHeader`：React 实现的站点导航（无登录/写作/管理切换），包含移动端菜单与平滑滚动行为。
  - `SiteFooter`：渲染版权、快速链接与动态年份。
  - `buildSiteMetadata`：在页面/server 组件中构造 Next Metadata，统一 title/description/OG，替换早期脚本注入方式。
- 行为保持：
  - 移动端菜单：在组件内通过 `useEffect` 绑定/解绑监听，保留平滑滚动。
  - 数据加载：历史页使用 SWR + `useSWRInfinite` 处理分页、错误重试与 IntersectionObserver 自动加载。
