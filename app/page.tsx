'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Market } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/Header';
import MarketSearch from '@/components/MarketSearch';
import MarketInsights from '@/components/MarketInsights';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const [limit] = useState(20);
  const { t } = useLanguage();
  const { data: markets, error, isLoading } = useSWR<Market[]>(
    `/api/markets?limit=${limit}&closed=false`,
    fetcher
  );

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with Logo, Social Links, and Language Switch */}
      <Header />

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loadingMarkets')}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            {t('loadingFailed')}: {error.message}
          </p>
        </div>
      )}

      {/* Market Search */}
      <MarketSearch />

      {/* Market Insights */}
      {markets && markets.length > 0 && (
        <MarketInsights markets={markets} />
      )}

      {/* Markets Grid */}
      {markets && markets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market) => (
            <Link
              key={market.id}
              href={`/market/${market.id}`}
              className="group block bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-slate-700 hover:scale-105"
            >
              {/* Market Image */}
              {market.image && (
                <div className="w-full h-40 bg-gray-100 dark:bg-slate-700 overflow-hidden">
                  <img
                    src={market.image}
                    alt={market.question}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Market Info */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {market.question}
                </h3>

                {/* Market Stats */}
                {market.volume24hr !== undefined && market.volume24hr > 0 && (
                  <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{t('volume24h')}:</span>{' '}
                    <span className="text-gray-700 dark:text-gray-300">
                      ${market.volume24hr.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      market.active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {market.active ? t('active') : t('ended')}
                  </span>

                  <span className="text-purple-600 dark:text-purple-400 font-medium group-hover:translate-x-1 transition-transform">
                    {t('viewChart')} →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {markets && markets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">{t('noMarkets')}</p>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>{t('dataSource')}</p>
        <p className="mt-2">{t('disclaimer')}</p>
      </footer>
    </main>
  );
}
