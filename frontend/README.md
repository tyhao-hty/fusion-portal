# Fusion Portal 前端

基于 Next.js 14 + TypeScript + Tailwind CSS 的核聚变门户新版前端骨架。该项目保留 `public/` 目录下的现有静态资源，并在 `app/` 目录中开启应用路由以支持未来的动态页面。

## 快速开始

```bash
cd frontend
npm install
npm run dev
```

启动后访问 [http://localhost:3000](http://localhost:3000) 查看页面，首页会展示新版导航，同时提供跳转至旧版静态站点的链接。

## 技术栈

- Next.js 14（App Router）
- React 18
- TypeScript 5
- Tailwind CSS 3

## 项目结构

```
frontend/
├── app/                # 应用路由入口（layout.tsx、page.tsx、全局样式）
├── components/         # 可复用的 UI 组件
├── public/             # 现有静态资源（已保留）
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
