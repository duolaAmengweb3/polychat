'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface LoadingStateProps {
  message?: string;
  onRetry?: () => void;
  timeout?: number; // 超时时间（毫秒），默认15秒
}

export default function LoadingState({
  message,
  onRetry,
  timeout = 15000
}: LoadingStateProps) {
  const { t } = useLanguage();
  const [elapsed, setElapsed] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const currentElapsed = Date.now() - startTime;
      setElapsed(currentElapsed);

      if (currentElapsed > timeout) {
        setShowWarning(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeout]);

  const formatTime = (ms: number) => {
    return Math.floor(ms / 1000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
      {/* Spinner */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          {showWarning && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center">
              <span className="text-white text-xs">⚠️</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading message */}
      <p className="text-gray-900 dark:text-white font-medium mb-2">
        {message || t('loadingChart')}
      </p>

      {/* Elapsed time */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t('loadingTime')}: {formatTime(elapsed)}s
      </p>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-6">
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>

      {/* Warning message if taking too long */}
      {showWarning && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 dark:text-yellow-300 text-sm mb-2">
            ⚠️ {t('loadingTakingLong')}
          </p>
          <p className="text-yellow-700 dark:text-yellow-400 text-xs">
            {t('loadingSlowReason')}
          </p>
        </div>
      )}

      {/* Retry button if provided */}
      {onRetry && showWarning && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
        >
          {t('retryLoading')}
        </button>
      )}

      {/* Tips */}
      {!showWarning && (
        <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
          <p>{t('loadingTip')}</p>
        </div>
      )}
    </div>
  );
}
