'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Locale, localeNames } from '@/lib/i18n/config';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    // Replace the locale prefix in current pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/') || `/${newLocale}`;
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-full px-2.5 py-1 text-xs font-semibold text-slate-800 transition">
      <Globe className="w-3.5 h-3.5 text-health-600 shrink-0" aria-hidden="true" />
      <span className="sr-only">Switch Language:</span>
      <select
        value={currentLocale}
        onChange={(e) => handleLanguageChange(e.target.value as Locale)}
        aria-label="Select preferred language"
        className="bg-transparent font-medium cursor-pointer focus:outline-none text-slate-900 pr-1 py-0.5"
      >
        {Object.entries(localeNames).map(([locKey, info]) => (
          <option key={locKey} value={locKey} className="text-slate-900 bg-white">
            {info.flag} {info.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}
