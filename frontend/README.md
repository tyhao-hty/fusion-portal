# Fusion Portal 前端

基于 Next.js 14 + TypeScript + Tailwind CSS 的核聚变门户前端。项目在 `app/(dashboard)/` 下维护现代交互式页面，同时在 `app/site/` 中承载迁移后的静态站点（首页、发展历程等），并保留 `public/` 目录的原始 HTML 作为回退。

## 快速开始

```bash
cd frontend
npm install
npm run dev
```

启动后访问 [http://localhost:3000](http://localhost:3000)：
- `/`：React 管理后台入口（保留原有文章列表、登录/注册等功能）。
- `/site`：迁移后的静态站首页；`/history.html` 自动重写到 `/site/history`。

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
│   ├── (dashboard)/    # 现代交互式页面（首页、登录、后台等）
│   └── site/           # 静态站迁移页面（保留 legacy 样式与交互）
├── components/
│   └── site/           # 静态站专用 Header/Footer/Metadata 组件
├── public/             # 原始静态资源 & 备份
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

`next.config.js` 配置了以下重写规则，确保旧版入口与新版页面共存：

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

上线前请根据迁移进度补全 redirect 计划，并更新 `tasks/T009_static_merge.md` 的清单。
