import Link from 'next/link';
import { Clock, Printer, ArrowRight, Activity, ShieldCheck, Pill, Smile, CalendarCheck } from 'lucide-react';
import { Topic, Article } from '@/lib/supabase/mock-data';
import { Locale } from '@/lib/i18n/config';

interface TopicCardProps {
  topic: Topic;
  article?: Article;
  locale?: Locale;
}

const iconMap: Record<string, any> = {
  Activity,
  ShieldCheck,
  Pill,
  Smile,
  CalendarCheck,
};

export default function TopicCard({ topic, article, locale = 'en' }: TopicCardProps) {
  const isSpanish = locale === 'es';
  const isTurkish = locale === 'tr';
  const IconComponent = iconMap[topic.icon_name] || Activity;

  const readingLevelLabel = isTurkish ? 'Okuma Düzeyi:' : isSpanish ? 'Nivel de Lectura:' : 'Reading Level:';
  const printHandoutLabel = isTurkish ? 'Broşürü Yazdır' : isSpanish ? 'Imprimir Hoja' : 'Print Handout';
  const readFullGuideLabel = isTurkish ? 'Rehberi Oku' : isSpanish ? 'Leer Guía Completa' : 'Read Full Guide';
  const readTimeLabel = isTurkish ? 'dk okuma' : isSpanish ? 'min de lectura' : 'min read';

  return (
    <article className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group">
      <div className="space-y-3">
        {/* Category & Read Time */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-health-50 text-health-700 border border-health-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">
            <IconComponent className="w-3.5 h-3.5 text-health-600" />
            <span>{topic.category.replace(/-/g, ' ')}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {topic.estimated_read_minutes} {readTimeLabel}
            </span>
          </div>
        </div>

        {/* Title & Summary */}
        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-health-700 transition leading-snug">
            <Link href={`/${locale}/topics/${topic.slug}`}>
              {article ? article.title : topic.slug}
            </Link>
          </h3>
          {article && (
            <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
              {article.summary}
            </p>
          )}
        </div>

        {/* Reading Level Badge */}
        <div className="text-[11px] text-slate-500 font-medium pt-1">
          <span className="font-semibold text-slate-700">{readingLevelLabel}</span>{' '}
          {topic.reading_level}
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/${locale}/topics/${topic.slug}/print`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          aria-label={`Print handout for ${article?.title || topic.slug}`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>{printHandoutLabel}</span>
        </Link>

        <Link
          href={`/${locale}/topics/${topic.slug}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-health-700 hover:text-health-900 group-hover:translate-x-0.5 transition"
        >
          <span>{readFullGuideLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
