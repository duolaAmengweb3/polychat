'use client';

import { MarketAnalytics } from '@/lib/analytics';
import { useLanguage } from '@/context/LanguageContext';
import { getTrendLabel, getTrendDescription, getMomentumLabel, getSharpChangesLabel } from '@/lib/analyticsI18n';

interface TrendIndicatorProps {
  analytics: MarketAnalytics;
  compact?: boolean;
}

export default function TrendIndicator({ analytics, compact = false }: TrendIndicatorProps) {
  const { t, language } = useLanguage();
  const { trend, trendStrength, momentum, sharpChanges } = analytics;

  // 趋势配置
  const trendConfig = {
    strong_up: {
      gradient: 'from-green-500 to-emerald-600',
      icon: '🚀',
    },
    up: {
      gradient: 'from-green-400 to-green-500',
      icon: '📈',
    },
    stable: {
      gradient: 'from-gray-400 to-gray-500',
      icon: '➡️',
    },
    down: {
      gradient: 'from-orange-400 to-red-500',
      icon: '📉',
    },
    strong_down: {
      gradient: 'from-red-500 to-red-700',
      icon: '⚠️',
    }
  };

  const config = trendConfig[trend];
  const trendLabel = getTrendLabel(trend, language);
  const trendDesc = getTrendDescription(trend, language);

  // 紧凑模式（用于首页卡片）
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${config.gradient} text-white text-sm font-medium shadow-sm`}>
        <span>{config.icon}</span>
        <span>{trendLabel}</span>
      </div>
    );
  }

  const momentumLabel = getMomentumLabel(momentum, language);
  const jumpsLabel = getSharpChangesLabel(sharpChanges, language);

  // 完整模式（用于详情页）
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <span>📊</span>
        <span>{t('trendAnalysis')}</span>
      </h3>

      {/* 主趋势指示器 */}
      <div className={`bg-gradient-to-r ${config.gradient} rounded-xl p-6 text-white mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{config.icon}</span>
            <div>
              <div className="text-2xl font-bold">{trendLabel}</div>
              <div className="text-sm opacity-90 mt-1">{trendLabel}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">{t('trendStrength')}</div>
            <div className="text-3xl font-bold">{(trendStrength * 100).toFixed(0)}%</div>
          </div>
        </div>
        <div className="text-sm opacity-90 border-t border-white/20 pt-3">
          {trendDesc}
        </div>
      </div>

      {/* 趋势强度可视化 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('trendStrength')}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{(trendStrength * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.min(trendStrength * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* 详细指标 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 动量指标 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚡</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('recentMomentum')}</span>
          </div>
          <div className={`text-xl font-bold ${
            momentum > 0.05 ? 'text-green-600 dark:text-green-400' :
            momentum < -0.05 ? 'text-red-600 dark:text-red-400' :
            'text-gray-600 dark:text-gray-400'
          }`}>
            {momentumLabel}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-500 mt-1">
            {momentum > 0 ? '+' : ''}{(momentum * 100).toFixed(2)}pp
          </div>
        </div>

        {/* 价格跳动 */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚡</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('priceJumps')}</span>
          </div>
          <div className={`text-xl font-bold ${
            sharpChanges > 10 ? 'text-red-600 dark:text-red-400' :
            sharpChanges > 5 ? 'text-orange-600 dark:text-orange-400' :
            'text-green-600 dark:text-green-400'
          }`}>
            {jumpsLabel}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-500 mt-1">
            {sharpChanges} {t('times')} {language === 'zh' ? '大幅波动' : 'jumps'}
          </div>
        </div>
      </div>

      {/* 趋势说明 */}
      <div className="mt-6 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <div className="font-medium mb-2">{t('trendExplain')}</div>
          <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <li>• <strong>{t('trendStrength')}</strong>: {t('trendStrengthHelp')}</li>
            <li>• <strong>{t('recentMomentum')}</strong>: {t('momentumHelp')}</li>
            <li>• <strong>{t('sharpChanges')}</strong>: {t('jumpsHelp')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
