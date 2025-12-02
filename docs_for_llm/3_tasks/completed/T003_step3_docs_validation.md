# T003 / Step 3 – 后端校验与文档完善

## 目标
为新接口补充校验、错误处理与文档，确保参数安全、行为可预期，并便于前端/运维对接。

## 主要产出
- 参数校验与默认值：页码/页大小范围、sort 白名单、tags/category/year 格式校验、缺省值策略。
- 统一错误响应与日志记录（如 400 参数错误、404 未找到）。
- API 文档更新：示例请求/响应、字段说明、错误码。

## 执行步骤
1. 在后端为列表/详情接口加入参数校验与防御性默认值；对无效参数返回 400，记录错误上下文。
2. 确认空结果与 404 的响应格式，与前端期望一致。
3. 更新/新增 API 文档（docs/api 或 README 片段），补充示例与字段说明。
4. 若可运行，做快速冒烟：合法/非法参数、404 路径；无法运行则完成静态检查与代码审阅。
5. 在 `T003_article_render.md` 更新进度，`dev_notes.md` 记录验证结果与待办。

---

## 当前状态（2025-12-02）
- 参数校验逻辑（需补充/确认）：  
  - `page`/`pageSize`：正整数，pageSize 上限 50，缺省 1/10。  
  - `sort` 白名单：`published_desc`(默认)、`published_asc`、`title_asc`、`title_desc`。  
  - `status` 白名单：`draft`/`review`/`published`，默认 `published`；`all` 表示不过滤（需鉴权约束）。  
  - `tags`：逗号分隔，过滤空值；`category`/`q` 字符串去空白。  
  - 年份：`year` 或 `yearFrom/yearTo` 解析为数字；构造 timelineYear/publishedAt 联合过滤。  
  - 详情：slug 优先，兼容数字 ID；404 返回 `{ message }`。
- 文档：已新增 `docs_for_llm/5_specs/api_articles.md`，包含列表/详情参数、示例与错误码说明（`status` 支持 `all` 表示不过滤状态，推荐仅授权使用）。  
- 验证待办：针对合法/非法参数、空结果、404 进行手测或静态检查；记录结果与回滚策略。需确认 `status=all`/PUT 状态变更的权限策略。

## 待办
- 手动验证（合法/非法参数、404、空结果）并记录结论；确认权限策略是否需限制 `status=all`。  
- 若无新增代码改动，验证完成后可归档到 `completed/`。

## 验证进展备注
- 2025-12-02：初次验证发现前端请求 `status=all` 时后端接收为 `published`（列表页固定传默认值）；已调整前端列表支持传入 status，重测确认 `/articles?status=all` 后端已收到 `all`。其他基础场景暂未发现异常，仍需补完用例：非法分页参数、未知 sort/status、空结果、404。
- 2025-12-02：运行 `backend/scripts/articles_smoke.js`（API_BASE_URL=本地）验证：默认 200；`page=0/-1` 回退 page=1；`pageSize=100`  capped=50；未知 sort/status 回退默认；`status=all` 返回 7 条（含非发布）；空关键词 0；不存在 slug 返回 404 message。
- 2025-12-02：后端已限制 `status=all` 需带合法 token（匿名请求回退为 `published`），`GET /articles` 添加可选鉴权以注入 user。
