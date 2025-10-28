'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartDataPoint } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface OutcomeData {
  outcome: string;
  data: ChartDataPoint[];
  color: string;
}

interface ComparisonChartProps {
  title: string;
  outcomes: OutcomeData[];
}

// 预定义的颜色方案
const COLOR_SCHEMES = [
  { border: 'rgb(124, 58, 237)', bg: 'rgba(124, 58, 237, 0.1)' }, // purple
  { border: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.1)' },  // blue
  { border: 'rgb(16, 185, 129)', bg: 'rgba(16, 185, 129, 0.1)' },  // green
  { border: 'rgb(245, 158, 11)', bg: 'rgba(245, 158, 11, 0.1)' },  // amber
  { border: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.1)' },    // red
  { border: 'rgb(236, 72, 153)', bg: 'rgba(236, 72, 153, 0.1)' },  // pink
];

export default function ComparisonChart({ title, outcomes }: ComparisonChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const { t } = useLanguage();

  // 找到最长的数据集作为基准时间轴
  const longestDataset = outcomes.reduce((longest, current) =>
    current.data.length > longest.data.length ? current : longest
  , outcomes[0]);

  const labels = longestDataset.data.map((d) => {
    const date = new Date(d.time);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
    });
  });

  const datasets = outcomes.map((outcome, index) => {
    const colorScheme = COLOR_SCHEMES[index % COLOR_SCHEMES.length];
    return {
      label: outcome.outcome,
      data: outcome.data.map((d) => d.price * 100), // 转换为百分比
      borderColor: colorScheme.border,
      backgroundColor: colorScheme.bg,
      fill: true,
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 6,
      borderWidth: 2,
    };
  });

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2) + '%';
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value: any) {
            return value + '%';
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {t('comparing')} {outcomes.length} {t('options')}
        </div>
      </div>

      {/* 图表 */}
      <div className="h-[450px]">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>

      {/* 当前值对比 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {outcomes.map((outcome, index) => {
          const colorScheme = COLOR_SCHEMES[index % COLOR_SCHEMES.length];
          const currentPrice = outcome.data[outcome.data.length - 1]?.price || 0;
          const firstPrice = outcome.data[0]?.price || 0;
          const change = ((currentPrice - firstPrice) / firstPrice) * 100;

          return (
            <div
              key={outcome.outcome}
              className="border-2 rounded-lg p-3"
              style={{ borderColor: colorScheme.border }}
            >
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {outcome.outcome}
              </div>
              <div className="text-xl font-bold" style={{ color: colorScheme.border }}>
                {(currentPrice * 100).toFixed(1)}%
              </div>
              <div className={`text-xs mt-1 ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* 说明 */}
      <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
        <div className="text-xs text-blue-800 dark:text-blue-300">
          {t('comparisonHelp')}
        </div>
      </div>
    </div>
  );
}
