# 性能对比报告 – 静态站内容融合（T009）

> 版本：2025-11-05  
> 数据来源：Next.js `npm run build` 输出（Chromium Playwright 回归前）  
> 维护人：AI 协作者（最新更新），审核人：郝天一

---

## 1. 目标与范围
- 对比新版 `/site`、`/site/history` 与旧版 `/index.html`、`/history.html` 的首屏体验与资源体积。
- 关注首屏渲染（FCP/LCP）、交互性（TTI）、资源大小（JS/CSS/图像）以及 API 响应性能。
- 为后续优化提供数据基线，支持上线评估与回滚决策。

---

## 2. 最新构建指标（2025-11-05）
| 页面 | First Load JS | 备注 |
| --- | --- | --- |
| `/site` | 96.2 kB | 采用 App Router，页面主体静态渲染 |
| `/site/history` | 95.2 kB | 含 TimelineFeed，客户端请求 `/api/timeline` |
| `/`（仪表盘入口） | 89.3 kB | 未参与本次对比 |

> **Shared JS**：87.3 kB  
> **静态页面总数**：8（`/site`、`/site/history` 及后台登录等）
> **构建日志**：`docs/performance/build-20251105.log`（CI=1 输出，便于追踪编译耗时与后续 diff）。

### 提示
- Next.js 构建日志提示 `metadataBase` 未设置，默认使用 `http://localhost:3000`。上线前需在 `buildSiteMetadata` 中引入生产域名，避免社交分享 URL 错误。

---

## 3. Lighthouse 建议（待采集）
| 指标 | `/site` 目标值 | `/site/history` 目标值 | 旧站参考 | 结果 |
| --- | --- | --- | --- | --- |
| FCP | ≤ 1.8 s | ≤ 2.0 s | 2.1 s（桌面） | 待测 |
| LCP | ≤ 2.5 s | ≤ 3.0 s | 3.3 s（桌面） | 待测 |
| CLS | ≤ 0.10 | ≤ 0.10 | 0.12 | 待测 |
| TBT | ≤ 100 ms | ≤ 150 ms | 180 ms | 待测 |

> 请在 Chrome DevTools / PageSpeed Insights 分别运行桌面与移动测试，并更新本表。

---

## 4. 时间线 API 样本性能
| 请求 | 目标 | 2025-11-05 结果 | 备注 |
| --- | --- | --- | --- |
| `/api/timeline?page=1&limit=8` | P95 < 400 ms | 待测 | 建议使用 Postman 或 `curl -w "%{time_total}"` |
| `/api/timeline?page=3&limit=8` | 成功率 99% | 待测 | 覆盖 `hasNext` 变更场景 |

若监控中发现 P95 > 1 s，应及时启用回退方案并排查数据库索引/网络异常。

---

## 5. 测试步骤（建议每次发布前执行）
1. **构建数据记录**  
   ```bash
   cd frontend
   npm run build > build.log
   ```
   将 `build.log` 归档，记录静态页和共享 JS 大小。
2. **Lighthouse 测试**  
   - 桌面/移动各进行一次，保存 JSON/HTML 报告；  
   - 重点关注 LCP、CLS、TBT，验证是否优于旧站。
3. **API 采样**  
   ```bash
   curl -o /dev/null -s -w "time_total: %{time_total}\n" \
     "$NEXT_PUBLIC_API_URL/api/timeline?page=1&limit=8"
   ```
   连续采样 10 次，统计平均值/P95，写入报告。
4. **播放自动脚本**  
   - 执行 Playwright “加载更多里程碑” 场景，确认按钮状态与 IntersectionObserver 正常。

---

## 6.1 采集计划
| 检测项 | 负责人 | 工具 | 计划时间 | 状态/备注 |
| --- | --- | --- | --- | --- |
| Lighthouse – 桌面 `/site` | — | Chrome DevTools Lighthouse | 2025-11-05 | 阻塞：沙箱禁止监听端口，无法启动 Next dev/production 服务器。 |
| Lighthouse – 桌面 `/site/history` | — | Chrome DevTools Lighthouse | 2025-11-05 | 同上，待在可开放端口的环境补测。 |
| Lighthouse – 移动 `/site` | — | PageSpeed Insights (mobile) | 2025-11-05 | 阻塞：缺乏可访问 URL，等待外部环境。 |
| Lighthouse – 移动 `/site/history` | — | PageSpeed Insights (mobile) | 2025-11-05 | 阻塞：同上。 |
| `/api/timeline?page=1` 延迟采样 | — | `curl -w "%{time_total}"` | 2025-11-05 | 阻塞：Express 服务需数据库 + 端口，当前沙箱拒绝。 |
| `/api/timeline?page=3` 延迟采样 | — | `curl -w "%{time_total}"` | 2025-11-05 | 阻塞：同上。 |

> 待拥有可运行 Node 服务器与 PostgreSQL 的环境后，再次执行上述采集，并将原始 JSON/HTML 报告存入 `docs/performance/`（建议命名 `lighthouse-YYYYMMDD-<page>-<device>.json`）。

---

## 6. 优化建议与 TODO
- **短期**：配置 `metadataBase`，减少社交分享错误 URL；对 `/site/history` 进行图片懒加载压缩，降低首屏 JS/K。
- **中期**：将 TimelineFeed 的描述部分转为 server components，降低客户端渲染开销；引入 HTTP 缓存头减轻 API 压力。
- **长期**：引入 Web Vitals 监控（如 Vercel Analytics、Sentry Performance），持续跟踪实测 LCP/CLS。

---

> 本报告应在每次迭代后更新，若指标下降需在 T009 风险表中登记并制定优化计划。
