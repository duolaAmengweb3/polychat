'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface LargeOrder {
  id: string;
  time: string;
  side: 'buy' | 'sell';
  outcome: string;
  price: number;
  amount: number;
  maker?: string;
}

interface LargeOrdersMonitorProps {
  tokenId?: string;
  minOrderSize?: number;
}

export default function LargeOrdersMonitor({ tokenId, minOrderSize = 1000 }: LargeOrdersMonitorProps) {
  const { language } = useLanguage();
  const [orders, setOrders] = useState<LargeOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [threshold, setThreshold] = useState(minOrderSize);

  const t = {
    title: language === 'zh' ? '大单监控' : 'Large Orders Monitor',
    threshold: language === 'zh' ? '监控门槛' : 'Threshold',
    time: language === 'zh' ? '时间' : 'Time',
    side: language === 'zh' ? '方向' : 'Side',
    outcome: language === 'zh' ? '选项' : 'Outcome',
    price: language === 'zh' ? '价格' : 'Price',
    amount: language === 'zh' ? '金额' : 'Amount',
    buy: language === 'zh' ? '买入' : 'BUY',
    sell: language === 'zh' ? '卖出' : 'SELL',
    loading: language === 'zh' ? '加载大单数据...' : 'Loading large orders...',
    noOrders: language === 'zh' ? '暂无大单交易' : 'No large orders',
    last24h: language === 'zh' ? '近24小时' : 'Last 24H',
    buyVolume: language === 'zh' ? '大单买入' : 'Large Buys',
    sellVolume: language === 'zh' ? '大单卖出' : 'Large Sells',
    netFlow: language === 'zh' ? '净流入' : 'Net Flow',
    mockNote: language === 'zh'
      ? '需要 CLOB API Key 获取真实交易数据'
      : 'Requires CLOB API Key for real trade data',
  };

  useEffect(() => {
    // 由于 CLOB trades API 需要认证，这里生成模拟数据演示 UI
    const generateMockOrders = () => {
      const mockOrders: LargeOrder[] = [];
      const now = Date.now();

      for (let i = 0; i < 15; i++) {
        const isBuy = Math.random() > 0.45;
        mockOrders.push({
          id: `order-${i}`,
          time: new Date(now - Math.random() * 86400000).toISOString(),
          side: isBuy ? 'buy' : 'sell',
          outcome: Math.random() > 0.5 ? 'Yes' : 'No',
          price: 0.1 + Math.random() * 0.8,
          amount: threshold + Math.random() * threshold * 4,
        });
      }

      return mockOrders.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    };

    setIsLoading(true);
    setTimeout(() => {
      setOrders(generateMockOrders());
      setIsLoading(false);
    }, 500);
  }, [tokenId, threshold]);

  // 计算统计数据
  const buyOrders = orders.filter(o => o.side === 'buy');
  const sellOrders = orders.filter(o => o.side === 'sell');
  const totalBuyVolume = buyOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalSellVolume = sellOrders.reduce((sum, o) => sum + o.amount, 0);
  const netFlow = totalBuyVolume - totalSellVolume;

  const formatTime = (isoTime: string) => {
    const date = new Date(isoTime);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    }
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>📊</span> {t.title}
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
          <span>📊</span> {t.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{t.threshold}:</span>
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-sm"
          >
            <option value={500}>$500+</option>
            <option value={1000}>$1,000+</option>
            <option value={5000}>$5,000+</option>
            <option value={10000}>$10,000+</option>
          </select>
        </div>
      </div>

      {/* 模拟数据提示 */}
      <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
          <span>ℹ️</span> {t.mockNote}
        </p>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <div className="text-xs text-green-600 dark:text-green-400 mb-1">{t.buyVolume}</div>
          <div className="text-lg font-bold text-green-700 dark:text-green-300">
            ${totalBuyVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-green-500">{buyOrders.length} orders</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
          <div className="text-xs text-red-600 dark:text-red-400 mb-1">{t.sellVolume}</div>
          <div className="text-lg font-bold text-red-700 dark:text-red-300">
            ${totalSellVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-red-500">{sellOrders.length} orders</div>
        </div>
        <div className={`rounded-lg p-3 text-center ${
          netFlow >= 0
            ? 'bg-green-50 dark:bg-green-900/20'
            : 'bg-red-50 dark:bg-red-900/20'
        }`}>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t.netFlow}</div>
          <div className={`text-lg font-bold ${
            netFlow >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
          }`}>
            {netFlow >= 0 ? '+' : ''}${netFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className={`text-xs ${netFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {netFlow >= 0 ? '↑ 净流入' : '↓ 净流出'}
          </div>
        </div>
      </div>

      {/* 大单列表 */}
      {orders.length > 0 ? (
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white dark:bg-slate-800">
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-2 font-medium">{t.time}</th>
                <th className="pb-2 font-medium">{t.side}</th>
                <th className="pb-2 font-medium">{t.outcome}</th>
                <th className="pb-2 font-medium text-right">{t.price}</th>
                <th className="pb-2 font-medium text-right">{t.amount}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                >
                  <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">
                    {formatTime(order.time)}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      order.side === 'buy'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {order.side === 'buy' ? t.buy : t.sell}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      order.outcome === 'Yes'
                        ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {order.outcome}
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono">
                    {(order.price * 100).toFixed(1)}%
                  </td>
                  <td className="py-2 text-right font-medium">
                    ${order.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {t.noOrders}
        </div>
      )}
    </div>
  );
}
