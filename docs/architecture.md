# 架构概览

本文档记录核聚变门户网站的前端架构、数据契约与页面交互关系。未来对脚本或数据结构的任何改动，均需同步更新此文档以保持一致。

## 1. JavaScript 模块职责与依赖

- **components/common.js**
  - 作用：页面级通用初始化。负责通过 `fetch` 注入 `header.html`、`footer.html`，初始化移动端导航、平滑滚动、页脚年份与滚动状态样式。
  - 依赖：原生 `fetch`、`CustomEvent`、`IntersectionObserver`、`matchMedia`；依赖页面提供的 `data-component` 占位符。
  - 调用链：在每个页面尾部以 `<script src="components/common.js" defer></script>` 引入，`DOMContentLoaded` 时运行。
- **components/meta.js**
  - 作用：合并每页声明在 `window.__PAGE_META__` 上的元数据，拉取 `components/head.html` 模板渲染 `<head>` 标签，失败时回退到动态创建 `meta` 标签。
  - 依赖：原生 `fetch`、`URL`、`document.head`；依赖页面在加载前设置 `window.__PAGE_META__`。
- **页面内联脚本**
  - `history.html`：分页加载 `data/timeline.json`，使用 `IntersectionObserver` 提供懒加载和入场动画；维护加载状态、按钮交互与空状态提示。
  - `links.html`：载入并缓存 `data/links.json`，构建分区 DOM，支持分页、搜索过滤、统计信息与懒加载；重用 `IntersectionObserver` 做渐显动画。
  - `papers.html`：读取 `data/papers.json` 并按标签映射到页面预设的 `data-paper-slot` 容器；实现关键字搜索、动画展示与错误兜底。
  - 依赖共同点：均依赖 `fetch`、`IntersectionObserver`、DOM API；使用 `styles.css` 中的类名与布局结构。

## 2. 数据文件结构定义

- **data/timeline.json**
  - 类型：`Array<TimelineItem>`
  - 字段：`id` (string，唯一标识)、`year` (string，显示用年份)、`title` (string，事件标题)、`description` (string，事件描述)。
  - 示例：
    ```json
    {
      "id": "timeline-1983",
      "year": "1983年",
      "title": "JET装置建成",
      "description": "欧洲联合环JET在英国建成投运..."
    }
    ```
- **data/links.json**
  - 类型：`Array<LinkSection>`
  - 字段：
    - `id` (string)：分类唯一标识；
    - `title` (string)：分类标题；
    - `groups` (Array<Group>)：同类资源分组。
  - Group 字段：`id` (string)、`title` (string|null，允许为 `null` 表示不显示子标题)、`items` (Array<LinkItem>)。
  - LinkItem 字段：`id`、`name`、`url`、`description` 均为 string。
  - 示例（截取）：
    ```json
    {
      "id": "research-institutes",
      "title": "主要研究机构",
      "groups": [
        {
          "id": "research-us",
          "title": "美国",
          "items": [
            {
              "id": "pppl",
              "name": "PPPL 普林斯顿等离子体物理实验室",
              "url": "https://www.pppl.gov/",
              "description": "美国能源部下属实验室..."
            }
          ]
        }
      ]
    }
    ```
- **data/papers.json**
  - 类型：`Array<Paper>`
  - 字段：`id` (string)、`title` (string)、`authors` (string)、`year` (number)、`venue` (string)、`url` (string)、`tags` (Array<string>，用于与页面槽位匹配)、`abstract` (string)。
  - 示例：
    ```json
    {
      "id": "paper-023",
      "title": "Fusion Energy Output Greater than the Kinetic Energy...",
      "authors": "A. B. Zylstra et al.",
      "year": 2024,
      "venue": "Physical Review Letters",
      "url": "https://doi.org/10.1103/PhysRevLett.129.165002",
      "tags": ["最新研究进展", "前沿研究"],
      "abstract": "NIF在2022年突破基础上的进一步改进..."
    }
    ```

## 3. 页面交互与组件加载关系

- 所有页面在 `<body>` 中包含 `<div data-component="header"></div>` 与 `<div data-component="footer"></div>` 占位符，由 `common.js` 异步替换为 `header.html` 与 `footer.html`。
- 每个页面头部脚本块设定 `window.__PAGE_META__`，用于 `meta.js` 在运行时注入 SEO 元数据。
- 专题页面逻辑：
  - `history.html` 仅与 `timeline.json` 交互，通过“加载更多”和滚动哨兵控制分页；导航与页脚加载完全依赖 `common.js`。
  - `links.html` 根据 `links.json` 动态生成分区和卡片，并在搜索时回写统计信息；与 `common.js` 的 smooth-scroll 协作保证页内导航体验一致。
  - `papers.html` 通过 `tags` 与 `data-paper-slot` 属性对齐，缺少匹配标签时写入警告日志。
- 静态内容页（如 `science.html`、`technology.html`、`business.html`、`theory.html` 等）仅依赖 `meta.js` 与 `common.js` 注入的组件，不含额外逻辑。

## 4. 后台管理系统模块说明

- **文件路径**
  - `admin.html`：后台界面骨架，包含固定导航、数据容器、操作面板、模态框与提示区域。
  - `admin.js`：核心逻辑模块（ES6 模块），负责数据加载、渲染、表单生成、导入导出与提示反馈。
  - `styles-admin.css`：后台界面专属样式，复用主站色板并提供响应式布局、模态、表格与卡片风格。
- **模块职责**
  - 解析 `data/schema.md`，提取各 JSON 文件的字段定义以动态生成表单；
  - 依据当前选项卡 (`timeline`/`links`/`papers`) 渲染表格与卡片视图，提供编辑、删除、分页操作；
  - 维护内存态数据（`dataState`），并通过 toast 反馈关键操作结果；
  - 支持 JSON 导入（覆盖内存数据）、导出（下载文件）与 localStorage 持久化。
- **数据流**
  1. 初始化时优先读取 localStorage 缓存；若无则 `fetch` 对应 `data/*.json` 文件；
  2. 根据 schema 信息构建字段列表，渲染桌面端表格与移动端卡片；
  3. 新增/编辑时打开模态框，表单提交后更新内存数据并标记来源为“当前会话（未保存）”；
  4. “保存到 localStorage” 将数据序列化存入浏览器缓存；“重新加载”会清除缓存并回退至静态文件；
  5. 导入/导出操作均在前端完成，无须服务器参与。
- **localStorage 键命名**
  - 使用前缀 `fusionSite.admin.`，后接数据集标识：`timeline`、`links`、`papers`。
  - 例如时间线数据的完整键为 `fusionSite.admin.timeline`；刷新或导入后需重新保存以覆盖旧值。

## 5. 更新约定

- 若增删 JS 模块、调整初始化顺序或引入第三方库，需更新 **第 1 节** 描述的职责与依赖。
- 如修改 JSON 架构、字段命名或解析方式，需同步更新 **第 2 节** 的结构定义与示例。
- 页面组件加载流程、数据绑定方式或交互手势发生变化时，请刷新 **第 3 节** 的说明。
- 新增页面或重构现有页面后，确认该文档涵盖新的组件与数据流，以避免知识漂移。
- 后台管理系统扩展（例如新增数据集、调整表单生成逻辑）时，请同步更新 **第 4 节**，并确保 `data/schema.md` 字段说明准确。
