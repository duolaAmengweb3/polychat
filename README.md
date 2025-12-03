# PolyChart - Polymarket 智能分析可视化平台

**聚焦功能与技术实现，帮助你更快洞察预测市场**

---

**核心功能**
- 市场列表与筛选，聚焦活跃与未过期市场
- 价格历史与趋势分析，支持 7 天小时级采样
- 多选项切换与对比，发现定价偏差与套利机会
- 智能洞察：趋势强度、波动率、动量、异常检测
- 交互式图表与响应式设计，移动端友好
- 中英文切换与暗色模式，良好用户体验

---

**技术实现**
- 框架与语言：`Next.js 14`（App Router）+ `TypeScript` + `React 18`
- 数据层：服务端 API 代理解决跨域，统一错误处理与数据标准化
- 客户端数据：`SWR` 缓存与后台重新验证，失败降级不阻塞页面渲染
- 分析算法：`lib/analytics.ts` 提供线性回归、波动率、动量与异常识别
- 可视化：`Chart.js` + `react-chartjs-2` 自定义主题与渐变样式
- 国际化：`context/LanguageContext.tsx`，运行时切换与持久化存储

---

**目录结构**
```
app/
  api/                # 服务端代理与聚合
  market/[id]/        # 市场详情页
  layout.tsx          # 根布局与主题/i18n
  page.tsx            # 首页与市场列表
components/           # 图表、洞察、搜索等组件
lib/                  # 分析算法与翻译数据
context/              # 语言上下文
types/                # 类型定义
```

---

**API 概览**
- `GET /api/markets` 获取市场列表（支持过滤与排序）
- `GET /api/market/[id]` 获取市场详情
- `GET /api/prices?token=...` 获取价格历史（按窗口聚合）
- `GET /api/orderbook?token=...` 获取订单簿数据
- `GET /api/market-stats?token=...` 获取价差/中间价等统计

数据来源：`gamma-api.polymarket.com` 与 `clob.polymarket.com`

---

**开发与运行**
- 前置要求：`Node.js >= 18`
- 安装依赖：`npm install`
- 开发启动：`npm run dev`
- 生产构建：`npm run build`，启动：`npm start`

---

**安全与隐私**
- 仓库不包含任何密钥或私有配置，不提交 `.env` 等敏感文件
- 可选的数据源（如链上分析）通过环境变量配置，例如 `DUNE_API_KEY`
- 请在本地或部署平台安全配置环境变量，避免明文写入代码与文档

---

**License**
- MIT

---

感谢 Polymarket 提供的公开 API 支撑数据分析。
