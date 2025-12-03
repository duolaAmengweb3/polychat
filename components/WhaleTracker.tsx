'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface WhaleData {
  rank: number;
  address: string;
  position: string;
  amount: number;
  percentage: string;
  pnl: string;
  winRate: string;
  isSmartMoney: boolean;
  lastActivity: string;
}

interface WhaleTrackerProps {
  conditionId?: string;
  marketId?: string;
}

export default function WhaleTracker({ conditionId, marketId }: WhaleTrackerProps) {
  const { language } = useLanguage();
  const [whales, setWhales] = useState<WhaleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockData, setIsMockData] = useState(false);

  const t = {
    title: language === 'zh' ? '巨鲸持仓追踪' : 'Whale Tracker',
    smartMoney: language === 'zh' ? '聪明钱' : 'Smart Money',
    rank: language === 'zh' ? '排名' : 'Rank',
    address: language === 'zh' ? '地址' : 'Address',
    position: language === 'zh' ? '持仓方向' : 'Position',
    amount: language === 'zh' ? '持仓金额' : 'Amount',
    share: language === 'zh' ? '占比' : 'Share',
    pnl: language === 'zh' ? '盈亏' : 'PnL',
    winRate: language === 'zh' ? '历史胜率' : 'Win Rate',
    lastActive: language === 'zh' ? '最近活动' : 'Last Active',
    loading: language === 'zh' ? '加载巨鲸数据...' : 'Loading whale data...',
    noData: language === 'zh' ? '暂无巨鲸数据' : 'No whale data available',
    mockDataNote: language === 'zh'
      ? '当前显示模拟数据。配置 DUNE_API_KEY 以获取真实链上数据。'
      : 'Showing mock data. Configure DUNE_API_KEY for real on-chain data.',
    yes: language === 'zh' ? '是' : 'Yes',
    no: language === 'zh' ? '否' : 'No',
    whaleDistribution: language === 'zh' ? '巨鲸持仓分布' : 'Whale Distribution',
    totalWhalePosition: language === 'zh' ? '巨鲸总持仓' : 'Total Whale Position',
    smartMoneySignal: language === 'zh' ? '聪明钱信号' : 'Smart Money Signal',
    bullish: language === 'zh' ? '看涨' : 'Bullish',
    bearish: language === 'zh' ? '看跌' : 'Bearish',
    neutral: language === 'zh' ? '中性' : 'Neutral',
  };

  useEffect(() => {
    const fetchWhaleData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (conditionId) params.append('condition', conditionId);
        if (marketId) params.append('market', marketId);

        const response = await fetch(`/api/whales?${params.toString()}`);
        const data = await response.json();

        setWhales(data.data || []);
        setIsMockData(data.source === 'mock');
      } catch (error) {
        console.error('Error fetching whale data:', error);
        setWhales([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWhaleData();
  }, [conditionId, marketId]);

  // 计算统计数据
  const yesWhales = whales.filter(w => w.position === 'Yes');
  const noWhales = whales.filter(w => w.position === 'No');
  const totalYesAmount = yesWhales.reduce((sum, w) => sum + w.amount, 0);
  const totalNoAmount = noWhales.reduce((sum, w) => sum + w.amount, 0);
  const totalAmount = totalYesAmount + totalNoAmount;

  const smartMoneyWhales = whales.filter(w => w.isSmartMoney);
  const smartMoneyYes = smartMoneyWhales.filter(w => w.position === 'Yes').length;
  const smartMoneyNo = smartMoneyWhales.filter(w => w.position === 'No').length;

  const getSmartMoneySignal = () => {
    if (smartMoneyYes > smartMoneyNo) return { label: t.bullish, color: 'green' };
    if (smartMoneyNo > smartMoneyYes) return { label: t.bearish, color: 'red' };
    return { label: t.neutral, color: 'gray' };
  };

  const signal = getSmartMoneySignal();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🐋</span> {t.title}
        </h3>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-500">{t.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span>🐋</span> {t.title}
        </h3>
        {smartMoneyWhales.length > 0 && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            signal.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            signal.color === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            <span>🧠</span> {t.smartMoneySignal}: {signal.label}
          </div>
        )}
      </div>

      {/* 模拟数据提示 */}
      {isMockData && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <span>⚠️</span> {t.mockDataNote}
          </p>
        </div>
      )}

      {/* 统计概览 */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2 md:p-4 text-center">
          <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">{t.totalWhalePosition}</div>
          <div className="text-sm md:text-xl font-bold text-gray-900 dark:text-white">
            ${(totalAmount / 1000).toFixed(0)}K
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 md:p-4 text-center">
          <div className="text-xs md:text-sm text-green-600 dark:text-green-400 mb-1">{t.yes}</div>
          <div className="text-sm md:text-xl font-bold text-green-700 dark:text-green-300">
            {totalAmount > 0 ? ((totalYesAmount / totalAmount) * 100).toFixed(0) : 0}%
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 md:p-4 text-center">
          <div className="text-xs md:text-sm text-red-600 dark:text-red-400 mb-1">{t.no}</div>
          <div className="text-xl font-bold text-red-700 dark:text-red-300">
            {totalAmount > 0 ? ((totalNoAmount / totalAmount) * 100).toFixed(0) : 0}%
          </div>
        </div>
      </div>

      {/* 持仓分布条 */}
      {totalAmount > 0 && (
        <div className="mb-6">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t.whaleDistribution}</div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
            <div
              className="bg-green-500 h-full transition-all duration-500"
              style={{ width: `${(totalYesAmount / totalAmount) * 100}%` }}
            />
            <div
              className="bg-red-500 h-full transition-all duration-500"
              style={{ width: `${(totalNoAmount / totalAmount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 巨鲸列表 - 移动端简化显示 */}
      {whales.length > 0 ? (
        <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
          <table className="w-full text-xs md:text-sm min-w-[300px]">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium hidden md:table-cell">{t.address}</th>
                <th className="pb-2 font-medium">{t.position}</th>
                <th className="pb-2 font-medium text-right">{t.amount}</th>
                <th className="pb-2 font-medium text-right hidden sm:table-cell">{t.winRate}</th>
              </tr>
            </thead>
            <tbody>
              {whales.slice(0, 5).map((whale) => (
                <tr key={whale.address} className="border-b border-gray-100 dark:border-gray-700/50">
                  <td className="py-2 md:py-3">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{whale.rank}</span>
                      {whale.isSmartMoney && (
                        <span className="text-purple-600">🧠</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 md:py-3 font-mono text-xs hidden md:table-cell">{whale.address}</td>
                  <td className="py-2 md:py-3">
                    <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs font-medium ${
                      whale.position === 'Yes'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {whale.position}
                    </span>
                  </td>
                  <td className="py-2 md:py-3 text-right font-medium">${(whale.amount/1000).toFixed(0)}K</td>
                  <td className="py-2 md:py-3 text-right hidden sm:table-cell">
                    <span className={parseFloat(whale.winRate) >= 60 ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}>
                      {whale.winRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 text-sm">
          {t.noData}
        </div>
      )}
    </div>
  );
}
