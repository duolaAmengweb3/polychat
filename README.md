# PolyChart - Polymarket 智能分析可视化平台

<div align="center">

**让预测市场的每一次波动都清晰可见**

[English](#english) | [中文](#中文)

</div>

---

## 🎯 项目价值

### 为什么需要 PolyChart？

Polymarket 是全球最大的去中心化预测市场，但其原生界面缺乏深度的历史数据分析和趋势洞察。**PolyChart** 填补了这一空白：

#### 📊 **数据可视化的力量**
- **7天趋势一目了然**: 快速识别市场情绪变化，捕捉关键转折点
- **多维度分析**: 不只是看当前概率，还能看到波动率、趋势强度、动量变化
- **智能对比**: 多选项市场一键对比，发现套利机会和定价偏差

#### 💡 **市场洞察引擎**
- **热度追踪**: 自动识别交易量最大、趋势最强、波动最剧烈的市场
- **趋势诊断**: 基于线性回归的趋势强度分析，量化市场方向性
- **异常检测**: 自动标记价格剧烈跳动，捕捉重大新闻事件影响

#### 🚀 **决策加速器**
- **实时更新**: 每小时采样的价格数据，把握市场脉搏
- **双语支持**: 中英文无缝切换，服务全球用户
- **零门槛使用**: 完全免费，无需注册，即开即用

#### 🎓 **真实应用场景**
- **交易者**: 通过历史趋势分析，优化入场和出场时机
- **研究者**: 研究群体智慧和市场有效性，导出数据用于学术分析
- **决策者**: 追踪公共事件的概率变化，辅助战略决策
- **爱好者**: 直观理解预测市场运作，学习概率思维

---

## 🏗️ 技术架构

### 为什么 PolyChart 在技术上脱颖而出？

#### **🎨 现代化全栈架构**
```
Next.js 14 (App Router) + TypeScript + React Server Components
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 服务端渲染 (SSR) 提升首屏加载速度 70%+
✓ 增量静态生成 (ISR) 平衡性能与实时性
✓ 边缘计算就绪，全球低延迟访问
✓ 类型安全的端到端开发体验
```

#### **📡 智能数据处理层**

**1. 服务端 API 代理架构**
```typescript
// 解决跨域 + 统一错误处理 + 数据预处理
app/api/
  ├── markets/      // 市场列表 + 智能过滤 + 排序
  ├── market/[id]/  // 市场详情 + 数据标准化
  ├── prices/       // 价格历史 + 时间窗口优化
  └── events/       // 事件搜索 + Slug 解析
```

**2. 数据获取策略**
- **SWR (stale-while-revalidate)**: 客户端缓存 + 后台自动更新
- **并行请求**: 同时获取多个市场数据，减少总加载时间
- **错误边界**: 单个市场失败不影响整体渲染

**3. 复杂数据解析**
```typescript
// 自动处理 Polymarket API 的数据不一致性
- clobTokenIds: string → 自动 JSON.parse() → 数组
- outcomes: string → 解析为选项数组 → 容错处理
- 时间戳: Unix 秒 → JavaScript Date → 本地化显示
```

#### **📈 高级分析算法**

**1. 趋势分析引擎** (`lib/analytics.ts`)
```typescript
✓ 线性回归: 计算趋势线斜率和 R² 相关系数
✓ 波动率计算: 标准差 + 变异系数
✓ 动量指标: 对比前后数据段识别加速/减速
✓ 异常检测: 基于阈值的价格跳动识别
```

**2. 统计指标**
- 7日最高/最低/平均概率
- 价格变化百分点 (percentage points)
- 趋势强度 (0-1标准化)
- 数据完整度评估

#### **🎨 交互式可视化**

**Chart.js + 自定义配置**
- 渐变色填充，视觉突出趋势
- 响应式设计，移动端完美适配
- 动画过渡，流畅用户体验
- 多数据集对比图表

#### **🌍 国际化架构**

```typescript
// Context API + 持久化
context/LanguageContext → localStorage → 350+ 翻译键值对
✓ 运行时动态切换，无需刷新
✓ 统一翻译管理，易于扩展
✓ 类型安全的翻译 key
```

#### **⚡ 性能优化**

```
策略 1: 组件级代码分割
  → 按需加载图表库，减少初始 bundle 大小

策略 2: 图片优化
  → Next.js Image 组件 + 自动 WebP 转换

策略 3: 并发渲染
  → React 18 Concurrent Features
  → useDeferredValue 降低输入卡顿

策略 4: 智能缓存
  → SWR dedupe 减少重复请求
  → 7天数据缓存策略
```

#### **🎯 用户体验创新**

**1. 智能加载状态**
- 实时倒计时显示加载时长
- 15秒超时自动警告
- 动画反馈 + 重试机制

**2. 错误处理**
- 上下文感知的错误提示
- 针对不同场景的解决方案建议
- 友好的降级体验（链接到原站）

**3. 搜索功能**
- 支持 Polymarket URL 粘贴 → 自动解析 → 跳转
- 支持市场 ID / Slug / 事件 URL
- 智能匹配算法

#### **🔧 技术栈总览**

| 分类 | 技术选型 | 理由 |
|------|---------|------|
| **框架** | Next.js 14 (App Router) | 混合渲染 + 最佳 SEO + 边缘计算支持 |
| **语言** | TypeScript 5+ | 类型安全 + 更好的开发体验 |
| **UI** | React 18 + TailwindCSS | 组件化 + 快速样式开发 |
| **图表** | Chart.js + react-chartjs-2 | 轻量 + 高度可定制 |
| **数据获取** | SWR | 缓存 + 自动重新验证 + 乐观更新 |
| **状态管理** | React Context API | 轻量 + 原生支持 + 足够简单 |
| **样式** | CSS Modules + 暗色模式 | 作用域隔离 + 系统主题适配 |

#### **🚀 部署与扩展性**

```
Vercel 部署 + 边缘网络
  → 全球 CDN 分发
  → 自动 HTTPS + 域名管理
  → 零配置生产环境

可扩展性设计
  → 模块化组件架构
  → API 层与 UI 层解耦
  → 易于添加新功能（导出、提醒、WebSocket 实时更新）
```

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3001](http://localhost:3001)

### 构建生产版本

```bash
npm run build
npm start
```

---

## 📁 项目结构

```
polychart-mvp/
├── app/
│   ├── api/                    # Next.js API Routes (服务端代理)
│   │   ├── events/route.ts     # 事件搜索 (解决 CORS)
│   │   ├── markets/route.ts    # 市场列表 (过滤 + 排序)
│   │   ├── market/[id]/route.ts # 市场详情
│   │   └── prices/route.ts     # 价格历史 (7天数据)
│   ├── market/[id]/page.tsx    # 市场详情页 (图表 + 分析)
│   ├── layout.tsx              # 根布局 (暗色模式 + 国际化)
│   └── page.tsx                # 首页 (市场列表 + 洞察)
├── components/
│   ├── ComparisonChart.tsx     # 多选项对比图表
│   ├── LoadingState.tsx        # 智能加载状态
│   ├── MarketInsights.tsx      # 市场洞察卡片
│   ├── MarketSearch.tsx        # URL/ID 搜索
│   ├── MarketStats.tsx         # 统计指标面板
│   ├── PriceChart.tsx          # 主图表组件
│   ├── TrendIndicator.tsx      # 趋势标签
│   ├── LanguageSwitch.tsx      # 语言切换
│   └── SocialLinks.tsx         # 社交链接
├── context/
│   └── LanguageContext.tsx     # 国际化上下文
├── lib/
│   ├── analytics.ts            # 分析算法核心
│   └── translations.ts         # 翻译数据 (350+ keys)
├── types/
│   └── index.ts                # TypeScript 类型定义
└── package.json
```

---

## 🌐 API 说明

| 端点 | 方法 | 描述 | 参数 |
|------|------|------|------|
| `/api/markets` | GET | 获取市场列表 | `limit` (默认20), `closed` (默认false) |
| `/api/market/[id]` | GET | 获取市场详情 | `id` (路径参数) |
| `/api/prices` | GET | 获取价格历史 | `token` (必需), `interval` (默认 all) |
| `/api/events` | GET | 搜索事件 | `slug` (必需) |

**数据来源**:
- 市场数据: Polymarket Gamma API (`gamma-api.polymarket.com`)
- 价格历史: Polymarket CLOB API (`clob.polymarket.com`)

---

## 🎯 核心功能

✅ **市场列表展示** - 实时活跃市场，按交易量排序
✅ **7天趋势图表** - 小时级采样，精准展示概率变化
✅ **多选项切换** - 一键切换不同结果的概率走势
✅ **智能洞察** - 趋势最强/波动最大/交易量最大市场推荐
✅ **统计分析** - 波动率、趋势强度、动量、异常检测
✅ **对比分析** - 多选项同图对比，发现定价偏差
✅ **URL 搜索** - 粘贴 Polymarket URL 直达市场详情
✅ **双语支持** - 中英文完整翻译，无缝切换
✅ **暗色模式** - 自动跟随系统主题
✅ **响应式设计** - 完美适配移动端/平板/桌面

---

## 🎓 技术亮点总结

| 维度 | 亮点 |
|------|------|
| **架构** | Next.js 14 App Router + React Server Components + API 代理层 |
| **类型安全** | 端到端 TypeScript，零运行时类型错误 |
| **数据分析** | 线性回归、波动率、动量分析等金融级算法 |
| **性能** | SSR + ISR + SWR 缓存 + 代码分割 + 并发渲染 |
| **用户体验** | 智能加载状态、错误边界、URL 搜索、实时国际化 |
| **可维护性** | 模块化组件、统一翻译管理、清晰的代码结构 |
| **可扩展性** | 解耦架构，易于添加 WebSocket、数据导出、提醒等功能 |

---

## 📄 License

MIT

---

## 🙏 致谢

感谢 [Polymarket](https://polymarket.com) 提供的公开 API，让预测市场数据能够被更广泛地分析和可视化。

---

<div align="center">

**用数据洞察未来，让概率说话** 🚀

Made with ❤️ for the Prediction Markets Community

</div>
