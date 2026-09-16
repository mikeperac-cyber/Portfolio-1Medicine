export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'tr'],
} as const;

export type Locale = (typeof i18n)['locales'][number];

export const localeNames: Record<Locale, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
};
