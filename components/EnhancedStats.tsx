'use client';

import { useLanguage } from '@/context/LanguageContext';

interface MarketData {
  lastTradePrice?: number;
  bestBid?: number;
  bestAsk?: number;
  spread?: number;
  oneDayPriceChange?: number;
  oneWeekPriceChange?: number;
  oneMonthPriceChange?: number;
  volume24hr?: number;
  volume1wk?: number;
  volume1mo?: number;
  liquidity?: number;
  liquidityClob?: number;
  competitive?: number;
}

interface EnhancedStatsProps {
  market: MarketData;
  midpoint?: number | null;
  currentSpread?: number | null;
}

export default function EnhancedStats({ market, midpoint, currentSpread }: EnhancedStatsProps) {
  const { language } = useLanguage();

  const t = {
    title: language === 'zh' ? '增强市场指标' : 'Enhanced Market Stats',
    realTimePrice: language === 'zh' ? '实时价格' : 'Real-time Price',
    lastTrade: language === 'zh' ? '最新成交' : 'Last Trade',
    midpoint: language === 'zh' ? '中间价' : 'Midpoint',
    bestBid: language === 'zh' ? '最优买价' : 'Best Bid',
    bestAsk: language === 'zh' ? '最优卖价' : 'Best Ask',
    spread: language === 'zh' ? '买卖价差' : 'Spread',
    priceChanges: language === 'zh' ? '价格变动' : 'Price Changes',
    day1: language === 'zh' ? '24小时' : '24H',
    week1: language === 'zh' ? '7天' : '7D',
    month1: language === 'zh' ? '30天' : '30D',
    volume: language === 'zh' ? '交易量' : 'Volume',
    liquidity: language === 'zh' ? '流动性' : 'Liquidity',
    totalLiquidity: language === 'zh' ? '总流动性' : 'Total Liquidity',
    clobLiquidity: language === 'zh' ? 'CLOB流动性' : 'CLOB Liquidity',
    competitiveness: language === 'zh' ? '市场竞争度' : 'Competitiveness',
    high: language === 'zh' ? '高' : 'High',
    medium: language === 'zh' ? '中' : 'Medium',
    low: language === 'zh' ? '低' : 'Low',
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '-';
    return (price * 100).toFixed(1) + '%';
  };

  const formatChange = (change?: number) => {
    if (change === undefined || change === null) return '-';
    const percent = (change * 100).toFixed(1);
    const isPositive = change > 0;
    const isNegative = change < 0;
    return (
      <span className={`font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : isNegative ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
        {isPositive ? '+' : ''}{percent}%
      </span>
    );
  };

  const formatVolume = (vol?: number) => {
    if (vol === undefined || vol === null) return '-';
    if (vol >= 1000000) return '$' + (vol / 1000000).toFixed(2) + 'M';
    if (vol >= 1000) return '$' + (vol / 1000).toFixed(1) + 'K';
    return '$' + vol.toFixed(0);
  };

  const getCompetitivenessLevel = (comp?: number) => {
    if (!comp) return { label: '-', color: 'gray' };
    if (comp >= 0.8) return { label: t.high, color: 'green' };
    if (comp >= 0.5) return { label: t.medium, color: 'yellow' };
    return { label: t.low, color: 'red' };
  };

  const competitiveness = getCompetitivenessLevel(market.competitive);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">{t.title}</h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {/* 实时价格区块 */}
        <div className="space-y-2 md:space-y-4">
          <h4 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t.realTimePrice}
          </h4>
          <div className="space-y-2 md:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t.lastTrade}</span>
              <span className="font-bold text-base md:text-lg text-gray-900 dark:text-white">
                {formatPrice(market.lastTradePrice)}
              </span>
            </div>
            {midpoint && (
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t.midpoint}</span>
                <span className="font-medium text-sm md:text-base text-purple-600 dark:text-purple-400">
                  {(midpoint * 100).toFixed(1)}%
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-green-600 dark:text-green-400">{t.bestBid}</span>
              <span className="font-medium text-sm md:text-base">{formatPrice(market.bestBid)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-red-600 dark:text-red-400">{t.bestAsk}</span>
              <span className="font-medium text-sm md:text-base">{formatPrice(market.bestAsk)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t.spread}</span>
              <span className="font-medium text-sm md:text-base text-blue-600 dark:text-blue-400">
                {currentSpread ? (currentSpread * 100).toFixed(1) + '%' : formatPrice(market.spread)}
              </span>
            </div>
          </div>
        </div>

        {/* 价格变动区块 */}
        <div className="space-y-2 md:space-y-4">
          <h4 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t.priceChanges}
          </h4>
          <div className="space-y-2 md:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t.day1}</span>
              {formatChange(market.oneDayPriceChange)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t.week1}</span>
              {formatChange(market.oneWeekPriceChange)}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t.month1}</span>
              {formatChange(market.oneMonthPriceChange)}
            </div>
          </div>
        </div>

        {/* 交易量区块 */}
        <div className="space-y-2 md:space-y-4">
          <h4 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t.volume}
          </h4>
          <div className="space-y-2 md:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t.day1}</span>
              <span className="font-medium text-sm md:text-base text-gray-900 dark:text-white">
                {formatVolume(market.volume24hr)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t.week1}</span>
              <span className="font-medium text-sm md:text-base text-gray-900 dark:text-white">
                {formatVolume(market.volume1wk)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t.month1}</span>
              <span className="font-medium text-sm md:text-base text-gray-900 dark:text-white">
                {formatVolume(market.volume1mo)}
              </span>
            </div>
          </div>
        </div>

        {/* 流动性区块 */}
        <div className="space-y-2 md:space-y-4">
          <h4 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t.liquidity}
          </h4>
          <div className="space-y-2 md:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t.totalLiquidity}</span>
              <span className="font-medium text-sm md:text-base text-gray-900 dark:text-white">
                {formatVolume(market.liquidity ? parseFloat(market.liquidity as any) : undefined)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t.clobLiquidity}</span>
              <span className="font-medium text-sm md:text-base text-gray-900 dark:text-white">
                {formatVolume(market.liquidityClob)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t.competitiveness}</span>
              <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs font-medium ${
                competitiveness.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                competitiveness.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                competitiveness.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {competitiveness.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
