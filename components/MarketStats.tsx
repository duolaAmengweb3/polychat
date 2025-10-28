'use client';

import { MarketAnalytics } from '@/lib/analytics';
import { useLanguage } from '@/context/LanguageContext';
import { getVolatilityLabel, getTrendLabel, getDataQualityLabel } from '@/lib/analyticsI18n';

interface MarketStatsProps {
  analytics: MarketAnalytics;
}

export default function MarketStats({ analytics }: MarketStatsProps) {
  const { t, language } = useLanguage();
  const {
    currentPrice,
    priceChangePercent,
    priceChange7d,
    volatility,
    volatilityLevel,
    avgPrice,
    maxPrice,
    minPrice,
    trend,
    momentum,
    sharpChanges,
    dataPoints,
    dataQuality
  } = analytics;

  // 趋势图标和颜色
  const trendConfig = {
    strong_up: { icon: '📈', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    up: { icon: '↗️', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    stable: { icon: '➡️', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/50' },
    down: { icon: '↘️', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
    strong_down: { icon: '📉', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
  };

  const trendStyle = trendConfig[trend];
  const isPositiveChange = priceChangePercent >= 0;

  const volLabel = getVolatilityLabel(volatilityLevel, language);
  const trendLabel = getTrendLabel(trend, language);
  const qualityLabel = getDataQualityLabel(dataQuality, language);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <span>📊</span>
        <span>{t('marketStats')}</span>
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 当前概率 */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('currentProb')}</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {(currentPrice * 100).toFixed(1)}%
          </div>
        </div>

        {/* 7天涨跌 */}
        <div className={`rounded-lg p-4 ${isPositiveChange ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20' : 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'}`}>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('priceChange')}</div>
          <div className={`text-2xl font-bold ${isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositiveChange ? '+' : ''}{priceChange7d.toFixed(1)}pp
          </div>
          <div className={`text-xs ${isPositiveChange ? 'text-green-700 dark:text-green-500' : 'text-red-700 dark:text-red-500'}`}>
            {isPositiveChange ? '+' : ''}{priceChangePercent.toFixed(2)}%
          </div>
        </div>

        {/* 趋势 */}
        <div className={`rounded-lg p-4 ${trendStyle.bg}`}>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('trend')}</div>
          <div className={`text-xl font-bold ${trendStyle.color} flex items-center gap-2`}>
            <span>{trendStyle.icon}</span>
            <span className="text-lg">{trendLabel}</span>
          </div>
        </div>

        {/* 波动率 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('volatility')}</div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {volLabel}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-500 mt-1">
            σ = {(volatility * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* 详细指标 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* 平均价格 */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('avgProb')}</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {(avgPrice * 100).toFixed(1)}%
          </div>
        </div>

        {/* 最高价格 */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('highest7d')}</div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            {(maxPrice * 100).toFixed(1)}%
          </div>
        </div>

        {/* 最低价格 */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('lowest7d')}</div>
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
            {(minPrice * 100).toFixed(1)}%
          </div>
        </div>

        {/* 价格区间 */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('priceRange')}</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {((maxPrice - minPrice) * 100).toFixed(1)}pp
          </div>
        </div>

        {/* 动量指标 */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('momentum')}</div>
          <div className={`text-lg font-semibold ${momentum > 0 ? 'text-green-600 dark:text-green-400' : momentum < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {momentum > 0 ? '+' : ''}{(momentum * 100).toFixed(2)}pp
          </div>
        </div>

        {/* 急剧变化 */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('sharpChanges')}</div>
          <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
            {sharpChanges} {t('times')}
          </div>
        </div>
      </div>

      {/* 数据质量指示 */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span>{t('dataPoints_count')}: {dataPoints}</span>
          <span className={`px-2 py-1 rounded ${
            dataQuality === 'good' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            dataQuality === 'fair' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {qualityLabel}
          </span>
        </div>
        <div className="text-gray-400 dark:text-gray-500">
          {t('based7Days')}
        </div>
      </div>
    </div>
  );
}
