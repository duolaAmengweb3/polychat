'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useLanguage } from '@/context/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface OrderbookData {
  bids: { price: number; size: number; cumulative: number }[];
  asks: { price: number; size: number; cumulative: number }[];
  stats: {
    totalBidSize: number;
    totalAskSize: number;
    buyPressure: number;
    sellPressure: number;
    bidLevels: number;
    askLevels: number;
  };
}

interface OrderbookChartProps {
  data: OrderbookData | null;
  isLoading?: boolean;
}

export default function OrderbookChart({ data, isLoading }: OrderbookChartProps) {
  const { language } = useLanguage();

  const t = {
    title: language === 'zh' ? '订单簿深度' : 'Order Book Depth',
    buyOrders: language === 'zh' ? '买单' : 'Bids',
    sellOrders: language === 'zh' ? '卖单' : 'Asks',
    price: language === 'zh' ? '价格' : 'Price',
    cumulative: language === 'zh' ? '累计深度' : 'Cumulative',
    buyPressure: language === 'zh' ? '买方压力' : 'Buy Pressure',
    sellPressure: language === 'zh' ? '卖方压力' : 'Sell Pressure',
    totalBids: language === 'zh' ? '总买单量' : 'Total Bids',
    totalAsks: language === 'zh' ? '总卖单量' : 'Total Asks',
    loading: language === 'zh' ? '加载订单簿...' : 'Loading orderbook...',
    noData: language === 'zh' ? '暂无订单簿数据' : 'No orderbook data',
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.title}</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-500">{t.loading}</span>
        </div>
      </div>
    );
  }

  if (!data || !data.bids || !data.asks) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          {t.noData}
        </div>
      </div>
    );
  }

  // 准备图表数据
  const bidData = data.bids.slice(-20); // 取最近20个价格档位
  const askData = data.asks.slice(0, 20);

  // 合并价格点
  const allPrices = [
    ...bidData.map(b => b.price),
    ...askData.map(a => a.price),
  ].sort((a, b) => a - b);

  const chartData = {
    labels: allPrices.map(p => (p * 100).toFixed(0) + '%'),
    datasets: [
      {
        label: t.buyOrders,
        data: allPrices.map(price => {
          const bid = bidData.find(b => b.price === price);
          return bid ? bid.cumulative : null;
        }),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true,
        tension: 0.1,
        spanGaps: false,
      },
      {
        label: t.sellOrders,
        data: allPrices.map(price => {
          const ask = askData.find(a => a.price === price);
          return ask ? ask.cumulative : null;
        }),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        fill: true,
        tension: 0.1,
        spanGaps: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: $${context.raw?.toLocaleString() || 0}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: t.price,
        },
      },
      y: {
        title: {
          display: true,
          text: t.cumulative + ' ($)',
        },
        ticks: {
          callback: (value: any) => '$' + (value / 1000).toFixed(0) + 'K',
        },
      },
    },
  };

  const buyPressurePercent = (data.stats.buyPressure * 100).toFixed(1);
  const sellPressurePercent = (data.stats.sellPressure * 100).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.title}</h3>

      {/* 买卖压力条 */}
      <div className="mb-4 md:mb-6">
        <div className="flex justify-between text-xs md:text-sm mb-2">
          <span className="text-green-600 dark:text-green-400 font-medium">
            {t.buyPressure}: {buyPressurePercent}%
          </span>
          <span className="text-red-600 dark:text-red-400 font-medium">
            {t.sellPressure}: {sellPressurePercent}%
          </span>
        </div>
        <div className="h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
          <div
            className="bg-green-500 h-full transition-all duration-500"
            style={{ width: `${buyPressurePercent}%` }}
          />
          <div
            className="bg-red-500 h-full transition-all duration-500"
            style={{ width: `${sellPressurePercent}%` }}
          />
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 md:p-3">
          <div className="text-xs md:text-sm text-green-600 dark:text-green-400">{t.totalBids}</div>
          <div className="text-base md:text-xl font-bold text-green-700 dark:text-green-300">
            ${(data.stats.totalBidSize / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-green-500">{data.stats.bidLevels} levels</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 md:p-3">
          <div className="text-xs md:text-sm text-red-600 dark:text-red-400">{t.totalAsks}</div>
          <div className="text-base md:text-xl font-bold text-red-700 dark:text-red-300">
            ${(data.stats.totalAskSize / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-red-500">{data.stats.askLevels} levels</div>
        </div>
      </div>

      {/* 深度图 */}
      <div className="h-48 md:h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
