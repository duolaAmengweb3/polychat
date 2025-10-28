'use client';

import Image from 'next/image';
import Link from 'next/link';
import SocialLinks from './SocialLinks';
import LanguageSwitch from './LanguageSwitch';
import { useLanguage } from '@/context/LanguageContext';

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className="w-full">
      {/* Top Bar with Social Links and Language Switch */}
      <div className="flex items-center justify-between mb-6">
        <SocialLinks />
        <LanguageSwitch />
      </div>

      {/* Main Title with Logo */}
      <div className="text-center mb-12">
        <Link href="/" className="inline-flex items-center justify-center gap-4 mb-4">
          <Image
            src="/logo.png"
            alt="PolyChart Logo"
            width={64}
            height={64}
            className="object-contain"
          />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {t('title')}
          </h1>
        </Link>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          {t('marketDescription')}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {t('clickToView')}
        </p>
      </div>
    </header>
  );
}
