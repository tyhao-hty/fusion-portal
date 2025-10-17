# 数据文件结构说明

本文档描述 `data/` 目录下 JSON 文件的字段约定、类型与示例。更新数据时请同步维护此文件，确保前端脚本与数据契约保持一致。后台管理系统（`admin.html`）会解析本文件以生成动态编辑表单，字段顺序与命名需保持准确。

## timeline.json

- **用途**：为 `history.html` 页面时间线模块提供数据。
- **数据类型**：`Array<TimelineItem>`
- **字段定义**：
  - `id` (`string`)：时间线条目的唯一 ID（例如 `timeline-2022`）。
  - `year` (`string`)：显示在时间线轴上的年份或年代，支持文本格式（例如 `1920年代`）。
  - `title` (`string`)：事件标题。
  - `description` (`string`)：事件的详细描述，支持多句文本。
- **示例**：
  ```json
  {
    "id": "timeline-2022",
    "year": "2022年",
    "title": "NIF实现聚变点火",
    "description": "美国国家点火装置实验能量增益超过输入驱动能量，被视为聚变点火里程碑。"
  }
  ```

## links.json

- **用途**：为 `links.html` 页面资源导航模块提供分类、分组和卡片内容。
- **数据类型**：`Array<LinkSection>`
- **字段定义**：
  - `id` (`string`)：一级分类 ID。
  - `title` (`string`)：分类标题，页面中显示为 `<h1>`/`<h2>`。
  - `groups` (`Array<LinkGroup>`)：分类下的资源分组。
- **LinkGroup 字段**：
  - `id` (`string`)：分组 ID。
  - `title` (`string|null`)：分组标题；为 `null` 表示省略标题。
  - `items` (`Array<LinkItem>`)：资源列表。
- **LinkItem 字段**：
  - `id` (`string`)：资源 ID。
  - `name` (`string`)：资源名称。
  - `url` (`string`)：资源链接，需为完整 URL。
  - `description` (`string`)：资源简介，将显示在卡片中。
- **示例**：
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
            "description": "美国能源部下属实验室，托卡马克与仿星器研究的重要基地。"
          }
        ]
      }
    ]
  }
  ```

## papers.json

- **用途**：为 `papers.html` 页面论文列表提供内容，按标签映射到页面预设的 `data-paper-slot` 容器。
- **数据类型**：`Array<Paper>`
- **字段定义**：
  - `id` (`string`)：论文唯一 ID。
  - `title` (`string`)：论文标题。
  - `authors` (`string`)：作者列表，建议按原文格式填写。
  - `year` (`number`)：发表年份。
  - `venue` (`string`)：期刊、会议或出版物名称。
  - `url` (`string`)：原文链接，推荐使用 DOI 或官方地址。
  - `tags` (`Array<string>`)：分类标签；至少包含一个与页面 `data-paper-slot` 匹配的值。
  - `abstract` (`string`)：论文摘要或简要说明。
- **示例**：
  ```json
  {
    "id": "paper-024",
    "title": "Machine Learning Applications in Tokamak Experiments",
    "authors": "Julian Kates-Harbeck et al.",
    "year": 2019,
    "venue": "Nature",
    "url": "https://doi.org/10.1038/s41586-019-1115-6",
    "tags": ["最新研究进展", "前沿研究"],
    "abstract": "机器学习在托卡马克破裂预测等方面取得突破。"
  }
  ```

## 数据维护建议

- 确保 `id` 在各自文件内唯一，便于前端组件依赖。
- 保持 JSON 排版规范（双引号、无尾随逗号），提交前可运行 `python3 -m json.tool <file>` 校验。
- 后台管理系统会优先读取 `localStorage` 中的持久化结果，如需回退到原始数据，先在界面内“重新加载”并清空浏览器缓存。
- 更新数据文件后请同步检查 `docs/architecture.md` 与 `README.md`，并在提交信息或变更记录中标注所做调整。
