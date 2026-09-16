import type { Locale } from './config';

import en from '../../../public/locales/en/common.json';
import es from '../../../public/locales/es/common.json';
import tr from '../../../public/locales/tr/common.json';

const dictionaries = {
  en,
  es,
  tr,
};

export async function getDictionary(locale: string) {
  const normalizedLocale: Locale = locale === 'tr' ? 'tr' : locale === 'es' ? 'es' : 'en';
  return dictionaries[normalizedLocale] || dictionaries.en;
}
