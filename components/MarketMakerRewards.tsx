'use client';

import { useLanguage } from '@/context/LanguageContext';

interface ClobReward {
  id: string;
  conditionId: string;
  assetAddress: string;
  rewardsAmount: number;
  rewardsDailyRate: number;
  startDate: string;
  endDate: string;
}

interface MarketMakerRewardsProps {
  rewards?: ClobReward[];
  rewardsMinSize?: number;
  rewardsMaxSpread?: number;
}

export default function MarketMakerRewards({ rewards, rewardsMinSize, rewardsMaxSpread }: MarketMakerRewardsProps) {
  const { language } = useLanguage();

  const t = {
    title: language === 'zh' ? '做市商奖励' : 'Market Maker Rewards',
    dailyReward: language === 'zh' ? '每日奖励' : 'Daily Reward',
    minOrderSize: language === 'zh' ? '最小订单量' : 'Min Order Size',
    maxSpread: language === 'zh' ? '最大价差' : 'Max Spread',
    startDate: language === 'zh' ? '开始日期' : 'Start Date',
    endDate: language === 'zh' ? '结束日期' : 'End Date',
    active: language === 'zh' ? '进行中' : 'Active',
    noRewards: language === 'zh' ? '此市场暂无做市奖励' : 'No maker rewards for this market',
    tip: language === 'zh'
      ? '满足最小订单量和最大价差要求，即可获得做市奖励'
      : 'Meet min order size and max spread requirements to earn rewards',
  };

  if (!rewards || rewards.length === 0) {
    return null;
  }

  const activeReward = rewards.find(r => {
    const now = new Date();
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    return now >= start && now <= end && r.rewardsDailyRate > 0;
  });

  if (!activeReward) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl shadow-lg p-6 border border-amber-200 dark:border-amber-800">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💰</span>
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">{t.title}</h3>
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
          {t.active}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* 每日奖励 */}
        <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4">
          <div className="text-sm text-amber-700 dark:text-amber-300 mb-1">{t.dailyReward}</div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            ${activeReward.rewardsDailyRate}
            <span className="text-sm font-normal text-amber-600 dark:text-amber-400">/day</span>
          </div>
        </div>

        {/* 最小订单量 */}
        {rewardsMinSize && (
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4">
            <div className="text-sm text-amber-700 dark:text-amber-300 mb-1">{t.minOrderSize}</div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              ${rewardsMinSize}
            </div>
          </div>
        )}

        {/* 最大价差 */}
        {rewardsMaxSpread && (
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-4">
            <div className="text-sm text-amber-700 dark:text-amber-300 mb-1">{t.maxSpread}</div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {rewardsMaxSpread}%
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
        <span>💡</span>
        {t.tip}
      </p>
    </div>
  );
}
