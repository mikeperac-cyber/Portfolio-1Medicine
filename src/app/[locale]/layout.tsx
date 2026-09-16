import { notFound } from 'next/navigation';
import { i18n, Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!i18n.locales.includes(locale as any)) {
    notFound();
  }

  const dict = await getDictionary(locale);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar locale={locale as Locale} dict={dict} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer locale={locale as Locale} dict={dict} />
    </div>
  );
}
