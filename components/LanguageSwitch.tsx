'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitch() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg shadow-md px-4 py-2">
      <span className="text-sm text-gray-600 dark:text-gray-300">{t('language')}:</span>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('zh')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          language === 'zh'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
        }`}
      >
        中文
      </button>
    </div>
  );
}
