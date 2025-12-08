Documentation Rules（文档规范）

本文件定义文件命名规范与文档书写风格规范。
所有 AI 与开发者在创建或修改文档时必须遵循这些规则。

1. 文件命名规则（File Naming Rules）
1.1 通用规则

必须使用 kebab-case 或 snake_case（小写 + 连字符/下划线）。

禁止使用空格。

禁止使用中文文件名。

文件名必须具有明确语义。

1.2 任务文件（Task Files）

必须存放于：docs_for_llm/3_tasks/

文件命名格式：

Txxx_description.md


示例：

T001_static_migration.md
T023_fix_history_page_render.md


要求：

三位数字递增

description 必须简短且准确

1.3 设计文档（Design Docs）

存放于：docs_for_llm/4_design/

文件命名格式：

feature_or_topic_description.md


示例：

static_migration_plan.md
dashboard_permission_design.md

1.4 规范文档（Specs）

存放于：docs_for_llm/5_specs/

文件命名格式推荐：

api_contracts.md
prisma_schema_reference.md
validation_rules.md

1.5 报告文档（Reports）

存放于：docs_for_llm/6_reports/

文件命名建议：

performance_report_2025Q1.md
testing_summary_phase1.md
risk_review_static_merge.md

2. 文档书写规范（Writing Guidelines）
2.1 Markdown 基础规则

必须使用标准 Markdown（CommonMark）。

标题层级必须清晰：

# 一级标题
## 二级标题
### 三级标题


文本行长建议 ≤ 120 字符。

代码必须使用 fenced code block，例如：

```ts
const x = 1;
```


内容必须清晰分段，禁止长段落堆叠。

2.2 风格要求（Style Requirements）

语气：清晰、简洁、中性、专业。

所有技术术语必须使用英文（如 API, Schema, Controller）。

避免模糊表达，如“差不多”“大概”“可能”。

所有列表必须保持层级结构。

2.3 文档结构示例（Recommended Structure）

适用于设计、报告、方案类文档：

# Title
## Background
## Purpose
## Scope
## Design / Approach
## Risks
## Alternatives
## Next Steps


适用于任务文档：

# Txxx – Title
## Goal
## Scope
## Constraints
## Milestones
## Status

2.4 TOC（目录）使用规则

任务文件（3_tasks）禁止添加 TOC。

Specs / Design 文档可根据需要添加 TOC。

Rules 文档通常不需要 TOC。

2.5 时间戳要求

所有 AI 写入的文档必须包含时间戳（北京时间），例如：

2025-12-08 16:35:12 CST


结束。