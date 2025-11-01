# Fusion Portal Backend

基于 Express、Prisma、PostgreSQL 与 JWT 的后端服务，提供用户认证与文章管理接口。

## 准备工作
0. 安装PostgreSql，并创建用户和数据库
   ```
   CREATE USER fusion_user WITH PASSWORD 'StrongPassword123';
   CREATE DATABASE fusion_portal OWNER fusion_user;
   GRANT ALL PRIVILEGES ON DATABASE fusion_portal TO fusion_user;
   ```
1. 确保本地或远程可用的 PostgreSQL，并在 `backend/.env` 中配置：
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/fusion_portal"
   JWT_SECRET="your_secret_key"
   PORT=4000
   ```
2. 安装依赖：
   ```bash
   cd backend
   npm install
   ```
3. 同步数据库结构并生成 Prisma 客户端：
   ```bash
   npx prisma migrate dev --name init
   ```

## 启动服务

```bash
npm run dev
```

访问 [http://localhost:4000](http://localhost:4000) 应返回 `Fusion Portal API running`。

## 可用脚本

| 命令                 | 说明                    |
| -------------------- | ----------------------- |
| `npm run dev`        | 启动开发服务器          |
| `npm run start`      | 以生产模式启动服务      |
| `npm run prisma:generate` | 重新生成 Prisma 客户端 |
| `npm run prisma:migrate`  | 运行 `prisma migrate dev` |

## API 速览

- `POST /auth/register`：注册账号，返回 JWT。
- `POST /auth/login`：登录并返回 JWT。
- `GET /articles`：获取所有文章。
- `GET /articles/:id`：获取指定文章。
- `POST /articles`：创建文章（需 `Authorization: Bearer <token>`）。
- `PUT /articles/:id`：更新文章（作者或管理员）。
- `DELETE /articles/:id`：删除文章（作者或管理员）。

## 错误处理与日志

- 请求链路中的异常会由全局错误处理中间件捕获并统一返回 `message` 字段。
- 使用 `morgan` 输出访问日志，便于调试与审计。

## 开发提示

- `src/middleware/auth.js` 会解析 `Authorization` 头部的 Bearer Token 并注入 `req.user`。
- Prisma 客户端在 `src/prisma/client.js` 中统一实例化，可在项目收尾阶段调用 `prisma.$disconnect()`。
- 扩展数据模型后需执行 `npx prisma migrate dev` 以推送新的数据库结构。
