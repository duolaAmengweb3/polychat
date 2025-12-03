'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import PriceChart from '@/components/PriceChart';
import MarketStats from '@/components/MarketStats';
import TrendIndicator from '@/components/TrendIndicator';
import ComparisonChart from '@/components/ComparisonChart';
import LoadingState from '@/components/LoadingState';
import OrderbookChart from '@/components/OrderbookChart';
import EnhancedStats from '@/components/EnhancedStats';
import MarketMakerRewards from '@/components/MarketMakerRewards';
import CandlestickChart from '@/components/CandlestickChart';
import WhaleTracker from '@/components/WhaleTracker';
import LargeOrdersMonitor from '@/components/LargeOrdersMonitor';
import { Market, PricePoint, ChartDataPoint } from '@/types';
import { analyzeMarket, MarketAnalytics } from '@/lib/analytics';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitch from '@/components/LanguageSwitch';
import SocialLinks from '@/components/SocialLinks';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MarketPage() {
  const params = useParams();
  const router = useRouter();
  const marketId = params.id as string;
  const { t, language } = useLanguage();

  const [selectedToken, setSelectedToken] = useState<string>('');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [analytics, setAnalytics] = useState<MarketAnalytics | null>(null);
  const [allOutcomesData, setAllOutcomesData] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // 获取市场详情
  const { data: market, error: marketError } = useSWR<Market & {
    conditionId?: string;
    clobRewards?: any[];
    rewardsMinSize?: number;
    rewardsMaxSpread?: number;
    lastTradePrice?: number;
    bestBid?: number;
    bestAsk?: number;
    spread?: number;
    oneDayPriceChange?: number;
    oneWeekPriceChange?: number;
    oneMonthPriceChange?: number;
    volume1wk?: number;
    volume1mo?: number;
    liquidity?: number;
    liquidityClob?: number;
    competitive?: number;
  }>(
    `/api/market/${marketId}`,
    fetcher
  );

  // 获取价格历史
  const { data: priceHistory, error: priceError } = useSWR<PricePoint[]>(
    selectedToken ? `/api/prices?token=${selectedToken}` : null,
    fetcher
  );

  // 获取订单簿数据
  const { data: orderbookData, isLoading: orderbookLoading } = useSWR(
    selectedToken ? `/api/orderbook?token=${selectedToken}` : null,
    fetcher,
    { refreshInterval: 10000 } // 10秒刷新一次
  );

  // 获取实时市场统计
  const { data: marketStatsData } = useSWR(
    selectedToken ? `/api/market-stats?token=${selectedToken}` : null,
    fetcher,
    { refreshInterval: 5000 } // 5秒刷新一次
  );

  // 处理价格数据
  useEffect(() => {
    if (priceHistory && Array.isArray(priceHistory)) {
      const points: ChartDataPoint[] = priceHistory.map((p: PricePoint) => ({
        time: new Date(p.t * 1000).toISOString(),
        price: p.p,
      }));
      setChartData(points);

      // 计算分析指标
      const marketAnalytics = analyzeMarket(priceHistory);
      setAnalytics(marketAnalytics);
    }
  }, [priceHistory]);

  // 获取所有 outcomes 的数据用于对比
  useEffect(() => {
    const fetchAllOutcomes = async () => {
      if (!market || !market.clobTokenIds) return;

      let tokenIds: string[] = [];
      try {
        if (typeof market.clobTokenIds === 'string') {
          tokenIds = JSON.parse(market.clobTokenIds);
        } else if (Array.isArray(market.clobTokenIds)) {
          tokenIds = market.clobTokenIds;
        }
      } catch (e) {
        return;
      }

      if (tokenIds.length <= 1) return;

      // 解析 outcomes
      let outcomes: string[] = [];
      try {
        if (market.outcomes) {
          outcomes = JSON.parse(market.outcomes);
        }
      } catch (e) {
        outcomes = tokenIds.map((_, i) => `Option ${i + 1}`);
      }

      // 获取所有 token 的数据
      const allData = await Promise.all(
        tokenIds.map(async (tokenId, index) => {
          try {
            const response = await fetch(`/api/prices?token=${tokenId}`);
            const data: PricePoint[] = await response.json();
            const chartPoints: ChartDataPoint[] = data.map((p: PricePoint) => ({
              time: new Date(p.t * 1000).toISOString(),
              price: p.p,
            }));
            return {
              outcome: outcomes[index] || `Option ${index + 1}`,
              data: chartPoints,
            };
          } catch (error) {
            return null;
          }
        })
      );

      setAllOutcomesData(allData.filter(d => d !== null && d.data.length > 0));
    };

    fetchAllOutcomes();
  }, [market]);

  // 当市场数据加载后，自动选择第一个token
  useEffect(() => {
    if (market && market.clobTokenIds && !selectedToken) {
      // 解析tokenIds
      let parsedTokens: string[] = [];
      try {
        if (typeof market.clobTokenIds === 'string') {
          parsedTokens = JSON.parse(market.clobTokenIds);
        } else if (Array.isArray(market.clobTokenIds)) {
          parsedTokens = market.clobTokenIds;
        }
      } catch (e) {
        parsedTokens = [];
      }

      if (parsedTokens.length > 0) {
        setSelectedToken(parsedTokens[0]);
      }
    }
  }, [market, selectedToken]);

  if (marketError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{t('loadingMarketFailed')}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {t('backToHome')}
          </button>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // 解析outcomes
  let outcomes: string[] = [];
  try {
    if (market.outcomes) {
      outcomes = JSON.parse(market.outcomes);
    }
  } catch (e) {
    outcomes = ['Yes', 'No'];
  }

  // 解析clobTokenIds (可能是字符串或数组)
  let tokenIds: string[] = [];
  try {
    if (market.clobTokenIds) {
      if (typeof market.clobTokenIds === 'string') {
        tokenIds = JSON.parse(market.clobTokenIds);
      } else if (Array.isArray(market.clobTokenIds)) {
        tokenIds = market.clobTokenIds;
      }
    }
  } catch (e) {
    console.error('Failed to parse clobTokenIds:', e);
    tokenIds = [];
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Top Bar with Social Links and Language Switch */}
      <div className="flex items-center justify-between mb-6">
        <SocialLinks />
        <LanguageSwitch />
      </div>

      {/* Back Button */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/')}
          className="mb-4 text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-2"
        >
          ← {t('backToMarkets')}
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            {market.question}
          </h1>

          {market.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base line-clamp-3">
              {market.description}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">{t('status')}:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  market.active
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {market.active ? t('active') : t('ended')}
              </span>
            </div>

            {market.endDate && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">{t('endDate')}:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(market.endDate).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US')}
                </span>
              </div>
            )}

            {market.volume24hr !== undefined && market.volume24hr > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">{t('volume24h')}:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  ${market.volume24hr.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 做市商奖励 */}
      {market.clobRewards && market.clobRewards.length > 0 && (
        <div className="mb-6">
          <MarketMakerRewards
            rewards={market.clobRewards}
            rewardsMinSize={market.rewardsMinSize}
            rewardsMaxSpread={market.rewardsMaxSpread}
          />
        </div>
      )}

      {/* 增强市场统计 */}
      <div className="mb-6">
        <EnhancedStats
          market={market}
          midpoint={marketStatsData?.midpoint}
          currentSpread={marketStatsData?.spread}
        />
      </div>

      {/* Outcome Selector */}
      {tokenIds && tokenIds.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('selectOutcome')}
            </label>
            {allOutcomesData.length > 1 && (
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="text-sm px-4 py-2 rounded-lg font-medium transition-all bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
              >
                {showComparison ? (language === 'zh' ? '📊 单独查看' : '📊 Single View') : (language === 'zh' ? '📊 对比所有选项' : '📊 Compare All')}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {tokenIds.map((tokenId, index) => (
              <button
                key={tokenId}
                onClick={() => {
                  setSelectedToken(tokenId);
                  setShowComparison(false);
                }}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all ${
                  selectedToken === tokenId
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-slate-700'
                }`}
              >
                {outcomes[index] || `${t('option')} ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 对比图表 */}
      {showComparison && allOutcomesData.length > 1 && (
        <div className="mb-6">
          <ComparisonChart
            title={language === 'zh' ? '所有选项对比分析' : 'All Options Comparison'}
            outcomes={allOutcomesData}
          />
        </div>
      )}

      {/* 所有图表和分析组件 */}
      {!showComparison && selectedToken && (
        <div className="space-y-6">
          {/* 趋势图 */}
          {chartData.length > 0 ? (
            <>
              <PriceChart
                data={chartData}
                title={t('trendTitle')}
                outcome={outcomes[tokenIds.indexOf(selectedToken)] || 'Unknown'}
              />
              {analytics && (
                <>
                  <MarketStats analytics={analytics} />
                  <TrendIndicator analytics={analytics} />
                </>
              )}
            </>
          ) : priceError ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <p className="text-yellow-700 dark:text-yellow-400 font-semibold mb-3 text-center">
                {t('noHistoryData')}
              </p>
            </div>
          ) : (
            <LoadingState
              message={t('loadingChart')}
              onRetry={() => window.location.reload()}
            />
          )}

          {/* K线图 */}
          <CandlestickChart
            tokenId={selectedToken}
            title={language === 'zh' ? 'K线图分析' : 'Candlestick Analysis'}
          />

          {/* 订单簿深度 */}
          <OrderbookChart
            data={orderbookData}
            isLoading={orderbookLoading}
          />

          {/* 巨鲸追踪和大单监控 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WhaleTracker
              conditionId={market.conditionId}
              marketId={marketId}
            />
            <LargeOrdersMonitor
              tokenId={selectedToken}
              minOrderSize={1000}
            />
          </div>
        </div>
      )}

      {(!tokenIds || tokenIds.length === 0) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-700 dark:text-yellow-400 font-semibold mb-2">
            {t('noOutcomeData')}
          </p>
          <p className="text-yellow-600 dark:text-yellow-500 text-sm">
            {t('marketIncomplete')}
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t('browseOtherMarkets')}
          </button>
        </div>
      )}

      {/* Polymarket 链接 */}
      <div className="mt-8 text-center">
        <a
          href={`https://polymarket.com/event/${market?.slug || market?.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          {language === 'zh' ? '在 Polymarket 交易' : 'Trade on Polymarket'} →
        </a>
      </div>

      {/* Info */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>{t('dataUpdatedAt')}: {new Date().toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')}</p>
        <p className="mt-2">{t('past7Days')}</p>
      </div>
    </div>
  );
}
