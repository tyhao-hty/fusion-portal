AI Edit Rules（AI 强制编辑规则）

本文件定义 AI 在编辑代码、文档或任务文件时必须遵守的强制性行为约束（Hard Constraints）。
违反任意规则均可能导致严重错误，AI 必须严格遵守。

1. 禁止编辑行为（Forbidden Actions）

AI MUST NOT delete any existing content.

包括代码、注释、文档、任务记录、历史文件。

AI MUST NOT overwrite entire files.

所有修改必须以补丁（diff 增量方式）提交。

AI MUST NOT modify project structure or core architecture, unless explicitly authorized.
禁止擅自移动或重命名：

app/ 路由与 layout

后端目录结构

Prisma Schema

docs_for_llm 目录结构

AI MUST NOT fabricate information

不得编造 API、Schema、科学数据

所有内容必须基于项目文件或任务说明

AI MUST NOT write to deprecated paths
如旧版 dev_notes.md。

2. 允许的编辑行为（Allowed Actions）

AI MAY append content to:

docs_for_llm/2_dev_notes/dev_notes.md（日志）

任务文件（3_tasks）

设计文件（4_design）

规范文件（5_specs）

报告文件（6_reports）

AI MAY create new files only when the task explicitly requires。

AI MUST provide a change plan before writing any code：

修改哪些文件

修改目的

涉及风险

必须等待用户批准

3. 日志规则（Dev Notes Rules）

所有日志必须写入：

docs_for_llm/2_dev_notes/dev_notes.md


日志必须追加到文件顶部。

必须包含北京时间时间戳。

必须包含以下四部分：

计划（Plan）

开发过程（Development）

问题与解决（Issues & Fixes）

下一步计划（Next Steps）

4. 编辑范围限制（Edit Scope Enforcement）

AI MUST clearly identify the scope before executing any task：

涉及单文件修改 → 可直接 diff

涉及多文件或架构影响 → 必须先方案后执行

涉及 Legacy（旧架构） → 必须确认任务是否允许修改该部分

涉及新架构（CMS / Next.js API） → 必须根据任务说明执行

AI 不得自行决定架构方向。

5. 高风险区域（High-Risk Areas）

以下文件/目录 AI 不得修改，除非任务明确授权：

app/layout.tsx（全局布局）

根级路由结构

Prisma Schema

Express 核心配置

docs_for_llm/ 目录结构

所有 Legacy 静态内容（只读）

6. 时间戳（Timestamp Requirement）

所有 AI 写入内容必须包含北京时间：

YYYY-MM-DD HH:mm:ss CST


结束。