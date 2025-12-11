# Fusion Portal 前端

基于 Next.js 14 + TypeScript + Tailwind CSS 的核聚变门户前端。项目在 `app/(site)/` 下承载迁移后的站点页面（首页、发展历程、科普/理论/技术/商业等），后台管理由 Payload Admin 提供（`/admin`）。

## 快速开始

```bash
cd frontend
npm install
npm run dev
```

启动后访问 [http://localhost:3000](http://localhost:3000)：
- `/`：站点首页。
- `/history` / `/links` / `/papers` 等：站点内容页面。
- `/admin`：Payload Admin。

## 技术栈

- Next.js 14（App Router）
- React 18
- TypeScript 5
- Tailwind CSS 3
- SWR 2（历史时间线的分页加载与错误重试）

## 项目结构

```
frontend/
├── app/
│   └── (site)/         # 站点页面（历史/链接/论文/科普/理论/技术/商业等）
├── components/
│   └── site/           # 站点 Header/Footer/Metadata 组件
├── public/             # 静态资源（不再承载 HTML 回退）
├── package.json        # 项目依赖与脚本
├── tsconfig.json       # TypeScript 配置
├── tailwind.config.js  # Tailwind 配置
├── postcss.config.js   # PostCSS 配置
└── .env.local.example  # 环境变量示例
```

## Tailwind CSS

项目已通过 `npx tailwindcss init -p` 初始化，并在 `app/globals.css` 中启用基础指令：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

如需新增主题配置或插件，请修改 `tailwind.config.js`。

## 路由兼容与 rewrites

当前已移除旧版 `*.html` 重写，访问入口统一为 Next 路由和 `/admin`（Payload Admin）。
