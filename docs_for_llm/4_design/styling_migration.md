### 样式迁移指南（节选）
1. **基础变量**：保留 `:root` 中的色彩、字体变量（`--color-primary`, `--color-surface`, `--shadow-soft`），在 `(site)` 布局全局引入，未来可映射至 Tailwind `theme.extend`。
2. **网格布局**：`modules-grid`, `timeline`, `company-grid` 等类初期作为全局样式导入；后续可拆成 CSS Modules：`modules-grid` → `SiteModules.module.css`。
3. **动画效果**：`module-card`、`timeline-item` 使用的 `opacity/transform` 过渡可改写为 CSS 自定义属性 + React `useEffect`；可选使用 IntersectionObserver hook 统一处理。
4. **可访问性样式**：保留 `.skip-link`, `.nav-menu--open`, `.back-button` 等辅助类，迁移时重点确保焦点可见性与对比度。
- **阶段化策略**：
  1. 通过 `app/(site)/styles-legacy.cjs` 全局导入 legacy 样式，保证现有页面视觉一致。
  2. 编制 CSS 变量映射表，逐步迁移通用变量至现代样式（Tailwind/模块化）。
  3. 按模块拆分为 CSS Modules/Tailwind，移除对应的 legacy 片段，保持单一来源。
