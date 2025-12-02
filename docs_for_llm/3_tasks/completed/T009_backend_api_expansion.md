# T009 – 后端 API 扩展计划（功能拆解） _已完成_
> 更新时间：2025-11-21 ；聚焦功能，不含测试/报告。

## 目标
- 为 timeline/links/papers 提供更丰富的筛选与分页元信息，同时加上输入防御与索引友好排序。

## 执行步骤
1) Timeline 过滤与元信息  
   - 在 `/api/timeline` 增加查询参数：`q`（关键词，模糊匹配 title/description）、`yearFrom`、`yearTo`。  
   - 返回 `meta`：`total`, `page`, `pageSize`, `hasMore`。  
   - 限制 `pageSize` 上限（如 50），缺省回退到配置值。
2) Links 过滤与视图  
   - 在 `/api/links` 支持 `section`, `group`, `q` 过滤，保持默认嵌套结构。  
   - 追加 `meta` 统计（section/group/link 数量；过滤后计数）。  
   - 预留 `view=flat` 可选参数，返回扁平数组（slug, name, url, description, section, group）。
3) Papers 多条件筛选  
   - 扩展 `/api/papers` 支持 `tags`（多值）、`yearFrom`/`yearTo`、`sort`（`year_desc` 默认，允许运动 name）。  
   - 返回 `meta` 同步分页信息与总数；限制 `pageSize` 上限。  
   - 确认查询使用索引字段（year, tags join）并标注索引需求。
4) 参数校验与限速  
   - 在路由层添加简单校验与上限（字符串长度、数字范围）；对无效参数返回 400。  
   - 保留现有错误结构，必要时在错误体增加 `hint`。
5) 文档同步（功能侧）  
   - 更新 `docs/api/timeline.md`、`docs/api/links.md`、`docs/api/papers.md` 追加参数/响应示例。  
   - 同步简版到 `docs_for_llm/5_specs/`。  
   - 在 `docs_for_llm/3_tasks/T009_static_merge.md` 标记“API 扩展”子任务状态。
