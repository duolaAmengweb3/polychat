'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface PricePoint {
  t: number;
  p: number;
}

interface CandlestickChartProps {
  tokenId: string;
  title?: string;
}

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export default function CandlestickChart({ tokenId, title }: CandlestickChartProps) {
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d'>('1h');
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);

  const t = {
    title: language === 'zh' ? 'K线图' : 'Candlestick Chart',
    loading: language === 'zh' ? '加载K线数据...' : 'Loading candlestick data...',
    noData: language === 'zh' ? '暂无K线数据' : 'No candlestick data',
    open: language === 'zh' ? '开' : 'O',
    high: language === 'zh' ? '高' : 'H',
    low: language === 'zh' ? '低' : 'L',
    close: language === 'zh' ? '收' : 'C',
    hour1: '1H',
    hour4: '4H',
    day1: '1D',
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 获取高精度数据
        const fidelity = timeframe === '1h' ? 5 : timeframe === '4h' ? 15 : 60;
        const interval = timeframe === '1d' ? '7d' : '1d';

        const response = await fetch(
          `/api/prices?token=${tokenId}&fidelity=${fidelity}&interval=${interval}`
        );
        const data: PricePoint[] = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          setCandles([]);
          return;
        }

        // 将价格数据聚合成K线
        const candleMinutes = timeframe === '1h' ? 60 : timeframe === '4h' ? 240 : 1440;
        const aggregated = aggregateToCandles(data, candleMinutes);
        setCandles(aggregated);
      } catch (error) {
        console.error('Error fetching candlestick data:', error);
        setCandles([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (tokenId) {
      fetchData();
    }
  }, [tokenId, timeframe]);

  // 聚合价格数据为K线
  const aggregateToCandles = (data: PricePoint[], minutes: number): Candle[] => {
    if (data.length === 0) return [];

    const candles: Candle[] = [];
    const intervalMs = minutes * 60 * 1000;

    let currentCandle: Candle | null = null;
    let candleStartTime = 0;

    for (const point of data) {
      const pointTime = point.t * 1000;
      const candleTime = Math.floor(pointTime / intervalMs) * intervalMs;

      if (candleTime !== candleStartTime) {
        if (currentCandle) {
          candles.push(currentCandle);
        }
        candleStartTime = candleTime;
        currentCandle = {
          time: new Date(candleTime).toISOString(),
          open: point.p,
          high: point.p,
          low: point.p,
          close: point.p,
        };
      } else if (currentCandle) {
        currentCandle.high = Math.max(currentCandle.high, point.p);
        currentCandle.low = Math.min(currentCandle.low, point.p);
        currentCandle.close = point.p;
      }
    }

    if (currentCandle) {
      candles.push(currentCandle);
    }

    return candles;
  };

  // 绘制K线图
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 60, bottom: 30, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 清除画布
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--tw-bg-opacity') ? '#1e293b' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 计算价格范围
    const prices = candles.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices) * 0.995;
    const maxPrice = Math.max(...prices) * 1.005;
    const priceRange = maxPrice - minPrice;

    // K线宽度
    const candleWidth = Math.max(2, (chartWidth / candles.length) * 0.7);
    const candleSpacing = chartWidth / candles.length;

    // 绘制网格线
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // 价格标签
      const price = maxPrice - (priceRange * i) / 4;
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText((price * 100).toFixed(1) + '%', width - padding.right + 5, y + 3);
    }

    // 绘制K线
    candles.forEach((candle, i) => {
      const x = padding.left + i * candleSpacing + candleSpacing / 2;
      const isGreen = candle.close >= candle.open;

      // 计算Y坐标
      const openY = padding.top + ((maxPrice - candle.open) / priceRange) * chartHeight;
      const closeY = padding.top + ((maxPrice - candle.close) / priceRange) * chartHeight;
      const highY = padding.top + ((maxPrice - candle.high) / priceRange) * chartHeight;
      const lowY = padding.top + ((maxPrice - candle.low) / priceRange) * chartHeight;

      // 绘制影线
      ctx.strokeStyle = isGreen ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // 绘制实体
      ctx.fillStyle = isGreen ? '#22c55e' : '#ef4444';
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });

    // 鼠标悬停处理
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const index = Math.floor((x - padding.left) / candleSpacing);

      if (index >= 0 && index < candles.length) {
        setHoveredCandle(candles[index]);
      } else {
        setHoveredCandle(null);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [candles]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title || t.title}</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-500">{t.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title || t.title}</h3>

        {/* 时间周期选择 */}
        <div className="flex gap-2">
          {(['1h', '4h', '1d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {tf === '1h' ? t.hour1 : tf === '4h' ? t.hour4 : t.day1}
            </button>
          ))}
        </div>
      </div>

      {/* 悬停信息 */}
      {hoveredCandle && (
        <div className="flex gap-4 text-sm mb-2 text-gray-600 dark:text-gray-400">
          <span>{t.open}: <span className="font-medium text-gray-900 dark:text-white">{(hoveredCandle.open * 100).toFixed(2)}%</span></span>
          <span>{t.high}: <span className="font-medium text-green-600">{(hoveredCandle.high * 100).toFixed(2)}%</span></span>
          <span>{t.low}: <span className="font-medium text-red-600">{(hoveredCandle.low * 100).toFixed(2)}%</span></span>
          <span>{t.close}: <span className="font-medium text-gray-900 dark:text-white">{(hoveredCandle.close * 100).toFixed(2)}%</span></span>
        </div>
      )}

      {candles.length > 0 ? (
        <canvas
          ref={canvasRef}
          className="w-full h-64"
          style={{ width: '100%', height: '256px' }}
        />
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          {t.noData}
        </div>
      )}
    </div>
  );
}
