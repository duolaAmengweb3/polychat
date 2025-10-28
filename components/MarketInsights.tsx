'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Market, PricePoint } from '@/types';
import { analyzeMarket, MarketAnalytics } from '@/lib/analytics';
import { useLanguage } from '@/context/LanguageContext';
import TrendIndicator from './TrendIndicator';
import LoadingState from './LoadingState';

interface MarketWithAnalytics extends Market {
  analytics?: MarketAnalytics;
  loading?: boolean;
}

interface MarketInsightsProps {
  markets: Market[];
}

export default function MarketInsights({ markets }: MarketInsightsProps) {
  const [analyzedMarkets, setAnalyzedMarkets] = useState<MarketWithAnalytics[]>([]);
  const [activeTab, setActiveTab] = useState<'trending' | 'volatile' | 'volume'>('trending');

  // 获取市场数据并分析
  useEffect(() => {
    const analyzeMarkets = async () => {
      const analyzed: MarketWithAnalytics[] = await Promise.all(
        markets.slice(0, 10).map(async (market) => {
          try {
            // 解析token IDs
            let tokenIds: string[] = [];
            if (typeof market.clobTokenIds === 'string') {
              tokenIds = JSON.parse(market.clobTokenIds);
            } else if (Array.isArray(market.clobTokenIds)) {
              tokenIds = market.clobTokenIds;
            }

            if (tokenIds.length === 0) {
              return { ...market, loading: false };
            }

            // 获取第一个token的价格数据
            const response = await fetch(`/api/prices?token=${tokenIds[0]}`);
            const priceData: PricePoint[] = await response.json();

            if (priceData && priceData.length > 0) {
              const analytics = analyzeMarket(priceData);
              return { ...market, analytics, loading: false };
            }

            return { ...market, loading: false };
          } catch (error) {
            console.error(`Error analyzing market ${market.id}:`, error);
            return { ...market, loading: false };
          }
        })
      );

      setAnalyzedMarkets(analyzed);
    };

    if (markets.length > 0) {
      analyzeMarkets();
    }
  }, [markets]);

  // 过滤和排序市场
  const getFilteredMarkets = () => {
    const marketsWithAnalytics = analyzedMarkets.filter(m => m.analytics);

    switch (activeTab) {
      case 'trending':
        // 按趋势强度排序
        return marketsWithAnalytics
          .sort((a, b) => (b.analytics?.trendStrength || 0) - (a.analytics?.trendStrength || 0))
          .slice(0, 6);

      case 'volatile':
        // 按波动率排序
        return marketsWithAnalytics
          .sort((a, b) => (b.analytics?.volatility || 0) - (a.analytics?.volatility || 0))
          .slice(0, 6);

      case 'volume':
        // 按交易量排序
        return marketsWithAnalytics
          .sort((a, b) => (b.volume24hr || 0) - (a.volume24hr || 0))
          .slice(0, 6);

      default:
        return marketsWithAnalytics.slice(0, 6);
    }
  };

  const filteredMarkets = getFilteredMarkets();

  const { t } = useLanguage();

  if (analyzedMarkets.length === 0) {
    return (
      <LoadingState
        message={t('analyzing')}
        timeout={20000}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>🔥</span>
          <span>{t('marketInsights')}</span>
        </h2>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'trending'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-slate-600'
          }`}
        >
          {t('trendStrongest')}
        </button>
        <button
          onClick={() => setActiveTab('volatile')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'volatile'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-slate-600'
          }`}
        >
          {t('volatileMost')}
        </button>
        <button
          onClick={() => setActiveTab('volume')}
          className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
            activeTab === 'volume'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-slate-600'
          }`}
        >
          {t('volumeMost')}
        </button>
      </div>

      {/* 市场列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMarkets.map((market) => {
          const analytics = market.analytics!;
          const isPositiveChange = analytics.priceChangePercent >= 0;

          return (
            <Link
              key={market.id}
              href={`/market/${market.id}`}
              className="group block bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-500"
            >
              {/* 市场标题 */}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm">
                {market.question}
              </h3>

              {/* 趋势标签 */}
              <div className="mb-3">
                <TrendIndicator analytics={analytics} compact />
              </div>

              {/* 统计指标 */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {/* 当前概率 */}
                <div className="bg-white dark:bg-slate-800 rounded p-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('current')}</div>
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {(analytics.currentPrice * 100).toFixed(1)}%
                  </div>
                </div>

                {/* 7天变化 */}
                <div className="bg-white dark:bg-slate-800 rounded p-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('change7d')}</div>
                  <div className={`text-lg font-bold ${isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositiveChange ? '+' : ''}{analytics.priceChange7d.toFixed(1)}pp
                  </div>
                </div>
              </div>

              {/* 底部信息 */}
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  {activeTab === 'volatile' && (
                    <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded">
                      波动率 {(analytics.volatility * 100).toFixed(1)}%
                    </span>
                  )}
                  {activeTab === 'volume' && market.volume24hr && (
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                      ${(market.volume24hr / 1000).toFixed(1)}K
                    </span>
                  )}
                  {activeTab === 'trending' && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                      强度 {(analytics.trendStrength * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <span className="text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                  {t('viewDetails')} →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 说明 */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <div className="font-medium mb-2">💡 {t('insightsHelp')}</div>
          <ul className="space-y-1 text-xs">
            <li>• <strong>{t('trendStrongest')}</strong>: {t('insightsTrending')}</li>
            <li>• <strong>{t('volatileMost')}</strong>: {t('insightsVolatile')}</li>
            <li>• <strong>{t('volumeMost')}</strong>: {t('insightsVolume')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
