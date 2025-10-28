'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function MarketSearch() {
  const [searchInput, setSearchInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { t } = useLanguage();

  const extractMarketId = (input: string): string | null => {
    const trimmed = input.trim();

    // 如果是纯数字，直接返回
    if (/^\d+$/.test(trimmed)) {
      return trimmed;
    }

    // Polymarket URL patterns:
    // https://polymarket.com/event/...?slug=...
    // https://polymarket.com/market/...
    // https://polymarket.com/event/[slug]

    try {
      const url = new URL(trimmed);

      // 检查是否是 polymarket.com
      if (!url.hostname.includes('polymarket.com')) {
        return null;
      }

      // 从路径中提取 ID
      const pathParts = url.pathname.split('/').filter(p => p);

      // /event/[slug] 或 /market/[id]
      if (pathParts.length >= 2) {
        const lastPart = pathParts[pathParts.length - 1];
        // 如果最后一部分是数字，就是 market ID
        if (/^\d+$/.test(lastPart)) {
          return lastPart;
        }

        // 否则可能是 slug，需要通过 API 查询
        return lastPart;
      }

      return null;
    } catch (e) {
      // 不是有效的 URL，可能是 slug
      if (trimmed.length > 0 && !/^\d+$/.test(trimmed)) {
        return trimmed;
      }
      return null;
    }
  };

  const searchMarket = async () => {
    if (!searchInput.trim()) {
      setError(t('searchPlaceholder'));
      return;
    }

    setSearching(true);
    setError('');

    try {
      const identifier = extractMarketId(searchInput);

      if (!identifier) {
        setError(t('invalidUrl'));
        setSearching(false);
        return;
      }

      // 如果是纯数字，直接跳转
      if (/^\d+$/.test(identifier)) {
        router.push(`/market/${identifier}`);
        return;
      }

      // 否则是 slug，需要搜索
      // 先尝试通过 events API 查找（支持 /event/[slug] URL）
      try {
        const eventResponse = await fetch(`/api/events?slug=${identifier}`);
        if (eventResponse.ok) {
          const events = await eventResponse.json();

          if (events && events.length > 0 && events[0].markets && events[0].markets.length > 0) {
            // 找到 event，跳转到第一个 market
            router.push(`/market/${events[0].markets[0].id}`);
            return;
          }
        }
      } catch (err) {
        console.log('Event search failed, trying market search:', err);
      }

      // 如果 event 搜索失败，尝试通过 markets API 查找
      const response = await fetch(`/api/markets?limit=100`);
      const markets = await response.json();

      // 查找匹配的市场
      const market = markets.find((m: any) =>
        m.slug === identifier ||
        m.id === identifier
      );

      if (market) {
        router.push(`/market/${market.id}`);
      } else {
        setError(t('marketNotFound'));
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(t('invalidUrl'));
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchMarket();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🔍</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('searchMarket')}
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          placeholder={t('searchPlaceholder')}
          className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          disabled={searching}
        />
        <button
          onClick={searchMarket}
          disabled={searching || !searchInput.trim()}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          {searching ? t('searching') : t('searchButton')}
        </button>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>{t('searchHelp')}</p>
        <div className="mt-2 space-y-1">
          <p>• https://polymarket.com/event/netherlands-parliamentary-election</p>
          <p>• https://polymarket.com/market/516925</p>
          <p>• 516925</p>
        </div>
      </div>
    </div>
  );
}
