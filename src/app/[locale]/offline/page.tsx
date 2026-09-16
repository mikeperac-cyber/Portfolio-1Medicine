import Link from 'next/link';
import { WifiOff, HeartPulse, BookOpen, MapPin } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';

export default function OfflinePage({ params }: { params: { locale: string } }) {
  const locale = (params.locale === 'es' ? 'es' : 'en') as Locale;
  const isSpanish = locale === 'es';

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
        <WifiOff className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {isSpanish ? 'Modo Sin Conexión' : 'You are Currently Offline'}
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          {isSpanish
            ? 'No tiene conexión a internet, pero las guías de salud principales han sido guardadas en su dispositivo para que pueda seguir consultándolas.'
            : 'No internet connection detected. The core health guides have been saved to your browser so you can continue reading.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <Link
          href={`/${locale}/topics`}
          className="inline-flex items-center gap-2 bg-health-700 hover:bg-health-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          <span>{isSpanish ? 'Ver Guías Guardadas' : 'View Saved Guides'}</span>
        </Link>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-sm transition"
        >
          <HeartPulse className="w-4 h-4" />
          <span>{isSpanish ? 'Inicio' : 'Home'}</span>
        </Link>
      </div>
    </div>
  );
}
