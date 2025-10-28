import { PricePoint, ChartDataPoint } from '@/types';

/**
 * 市场分析工具库
 * 基于7天历史数据的各类统计分析函数
 */

export interface MarketAnalytics {
  // 基础统计
  priceChange7d: number;        // 7天价格变化 (百分点)
  priceChangePercent: number;   // 7天涨跌幅 (%)
  volatility: number;           // 波动率 (标准差)
  avgPrice: number;             // 平均价格
  maxPrice: number;             // 最高价
  minPrice: number;             // 最低价
  currentPrice: number;         // 当前价格

  // 趋势分析
  trend: 'strong_up' | 'up' | 'stable' | 'down' | 'strong_down';
  trendStrength: number;        // 趋势强度 (0-1)
  trendDescription: string;     // 趋势描述

  // 高级指标
  momentum: number;             // 动量指标
  volatilityLevel: 'low' | 'medium' | 'high' | 'extreme';
  sharpChanges: number;         // 急剧变化次数
  priceRange: number;           // 价格区间幅度

  // 数据质量
  dataPoints: number;           // 数据点数量
  dataQuality: 'good' | 'fair' | 'poor';
}

/**
 * 计算基础统计指标
 */
function calculateBasicStats(prices: number[]) {
  if (prices.length === 0) {
    return { avg: 0, max: 0, min: 0, std: 0 };
  }

  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const max = Math.max(...prices);
  const min = Math.min(...prices);

  // 计算标准差
  const variance = prices.reduce((sum, price) => {
    return sum + Math.pow(price - avg, 2);
  }, 0) / prices.length;
  const std = Math.sqrt(variance);

  return { avg, max, min, std };
}

/**
 * 检测趋势方向和强度
 * 使用线性回归计算趋势线斜率
 */
function detectTrend(prices: number[]): {
  direction: MarketAnalytics['trend'],
  strength: number,
  description: string
} {
  if (prices.length < 2) {
    return { direction: 'stable', strength: 0, description: '数据不足' };
  }

  // 简单线性回归
  const n = prices.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = prices.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * prices[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const strength = Math.abs(slope);

  // 归一化强度 (0-1)
  const normalizedStrength = Math.min(strength * 100, 1);

  let direction: MarketAnalytics['trend'];
  let description: string;

  if (slope > 0.005) {
    direction = slope > 0.015 ? 'strong_up' : 'up';
    description = slope > 0.015 ? '强劲上涨' : '温和上涨';
  } else if (slope < -0.005) {
    direction = slope < -0.015 ? 'strong_down' : 'down';
    description = slope < -0.015 ? '强劲下跌' : '温和下跌';
  } else {
    direction = 'stable';
    description = '横盘震荡';
  }

  return { direction, strength: normalizedStrength, description };
}

/**
 * 计算动量指标
 * 比较最近1/4数据与之前数据的平均价格差
 */
function calculateMomentum(prices: number[]): number {
  if (prices.length < 4) return 0;

  const quarter = Math.floor(prices.length / 4);
  const recentPrices = prices.slice(-quarter);
  const earlierPrices = prices.slice(0, quarter);

  const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
  const earlierAvg = earlierPrices.reduce((a, b) => a + b, 0) / earlierPrices.length;

  return recentAvg - earlierAvg;
}

/**
 * 检测急剧价格变化
 * 统计超过平均波动2倍的价格跳动次数
 */
function detectSharpChanges(prices: number[]): number {
  if (prices.length < 2) return 0;

  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(Math.abs(prices[i] - prices[i - 1]));
  }

  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  const threshold = avgChange * 2;

  return changes.filter(change => change > threshold).length;
}

/**
 * 评估数据质量
 */
function assessDataQuality(dataPoints: number, timeSpan: number): MarketAnalytics['dataQuality'] {
  // timeSpan in hours, 7 days = 168 hours
  const expectedPoints = timeSpan; // 每小时一个数据点
  const coverage = dataPoints / expectedPoints;

  if (coverage > 0.7) return 'good';
  if (coverage > 0.3) return 'fair';
  return 'poor';
}

/**
 * 分析市场数据，返回完整的分析结果
 */
export function analyzeMarket(priceData: PricePoint[] | ChartDataPoint[]): MarketAnalytics {
  if (!priceData || priceData.length === 0) {
    return {
      priceChange7d: 0,
      priceChangePercent: 0,
      volatility: 0,
      avgPrice: 0,
      maxPrice: 0,
      minPrice: 0,
      currentPrice: 0,
      trend: 'stable',
      trendStrength: 0,
      trendDescription: '无数据',
      momentum: 0,
      volatilityLevel: 'low',
      sharpChanges: 0,
      priceRange: 0,
      dataPoints: 0,
      dataQuality: 'poor',
    };
  }

  // 提取价格数组
  const prices = priceData.map(p => 'p' in p ? p.p : p.price);

  // 基础统计
  const { avg, max, min, std } = calculateBasicStats(prices);
  const currentPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const priceChange7d = currentPrice - firstPrice;
  const priceChangePercent = firstPrice !== 0 ? (priceChange7d / firstPrice) * 100 : 0;

  // 趋势分析
  const { direction, strength, description } = detectTrend(prices);

  // 高级指标
  const momentum = calculateMomentum(prices);
  const sharpChanges = detectSharpChanges(prices);
  const priceRange = max - min;

  // 波动率等级
  let volatilityLevel: MarketAnalytics['volatilityLevel'];
  if (std < 0.05) volatilityLevel = 'low';
  else if (std < 0.10) volatilityLevel = 'medium';
  else if (std < 0.20) volatilityLevel = 'high';
  else volatilityLevel = 'extreme';

  // 数据质量评估 (假设7天 = 168小时)
  const dataQuality = assessDataQuality(priceData.length, 168);

  return {
    priceChange7d: priceChange7d * 100, // 转为百分点
    priceChangePercent,
    volatility: std,
    avgPrice: avg,
    maxPrice: max,
    minPrice: min,
    currentPrice,
    trend: direction,
    trendStrength: strength,
    trendDescription: description,
    momentum,
    volatilityLevel,
    sharpChanges,
    priceRange,
    dataPoints: priceData.length,
    dataQuality,
  };
}

/**
 * 比较多个市场的相关性
 * 返回皮尔逊相关系数 (-1到1)
 */
export function calculateCorrelation(prices1: number[], prices2: number[]): number {
  const n = Math.min(prices1.length, prices2.length);
  if (n < 2) return 0;

  const aligned1 = prices1.slice(0, n);
  const aligned2 = prices2.slice(0, n);

  const mean1 = aligned1.reduce((a, b) => a + b, 0) / n;
  const mean2 = aligned2.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let sum1Sq = 0;
  let sum2Sq = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = aligned1[i] - mean1;
    const diff2 = aligned2[i] - mean2;
    numerator += diff1 * diff2;
    sum1Sq += diff1 * diff1;
    sum2Sq += diff2 * diff2;
  }

  const denominator = Math.sqrt(sum1Sq * sum2Sq);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * 格式化分析结果为人类可读的文本
 */
export function formatAnalytics(analytics: MarketAnalytics) {
  const {
    priceChangePercent,
    volatilityLevel,
    trend,
    trendDescription,
    currentPrice,
    dataQuality
  } = analytics;

  const changeText = priceChangePercent > 0
    ? `上涨 ${priceChangePercent.toFixed(2)}%`
    : `下跌 ${Math.abs(priceChangePercent).toFixed(2)}%`;

  const volatilityText = {
    low: '低波动',
    medium: '中等波动',
    high: '高波动',
    extreme: '极端波动'
  }[volatilityLevel];

  const qualityText = {
    good: '数据完整',
    fair: '数据尚可',
    poor: '数据稀疏'
  }[dataQuality];

  return {
    changeText,
    volatilityText,
    trendText: trendDescription,
    qualityText,
    currentPriceText: `${(currentPrice * 100).toFixed(1)}%`
  };
}
