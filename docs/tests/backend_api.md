# 后端测试与冒烟说明

## 范围
- 覆盖后端 API 的自动化单元/集成测试（Vitest + Supertest）。
- 提供文章接口的快速冒烟脚本，适合上线前或数据变更后验证。

## 自动化测试（Vitest）
- 位置：`backend/tests/`
  - `timeline.test.js`：`/api/timeline` 分页、年份筛选、非法参数回退。
  - `links.test.js`：`/api/links` 嵌套结构与统计元数据。
  - `papers.test.js`：`/api/papers` 关键词搜索、标签筛选。
- 运行：
  ```bash
  cd backend
  npm run test
  ```

## 文章接口冒烟脚本
- 位置：`backend/scripts/articles_smoke.js`
- 用途：快速检查 `/articles` 列表/详情的核心场景（分页/排序/状态/空结果/404），无须登录。
- 环境：需要后端服务已启动；可通过 `API_BASE_URL` 覆盖默认 `http://localhost:4000`。
- 运行：
  ```bash
  API_BASE_URL=http://localhost:4000 node backend/scripts/articles_smoke.js
  ```
- 当前实测结果（2025-12-02，本地样本数据）：
  - 默认列表 200，total=3；
  - `page=0/-1` 回退为 page=1；
  - `pageSize=100` 被上限 50；
  - 未知 `sort`/`status` 回退默认；
  - `status=all` 返回 7 条（含非发布状态）；
  - 空关键词返回 0，404 详情返回 `{ message: "文章不存在" }`。
