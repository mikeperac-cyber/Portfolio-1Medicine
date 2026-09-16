import { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { getTopics, getArticleBySlug } from '@/lib/supabase/server';
import TopicCard from '@/components/topics/TopicCard';
import { BookOpen, ShieldCheck } from 'lucide-react';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isSpanish = params.locale === 'es';
  return {
    title: isSpanish ? 'Temas de Salud | Salud Comunitaria' : 'Health Topics | Community Health Bridge',
    description: isSpanish
      ? 'Guías de salud en lenguaje sencillo sobre diabetes, vacunas, medicamentos y citas médicas.'
      : 'Plain-language health explainers on diabetes, vaccines, medications, and appointment prep.',
  };
}

export default async function TopicsPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const topics = await getTopics();

  const topicsWithArticles = await Promise.all(
    topics.map(async (topic) => {
      const article = await getArticleBySlug(topic.slug, locale);
      return { topic, article };
    })
  );

  const isSpanish = locale === 'es';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-health-100 text-health-800 border border-health-300 px-3 py-1 rounded-full text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-health-600" />
          <span>{isSpanish ? 'Guías Escritas en Lenguaje Sencillo' : 'Plain-Language Health Literacy'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {dict.topics.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {dict.topics.subtitle}
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-700">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          {isSpanish
            ? 'Todos los temas son redactados a nivel de 5to grado y revisados por médicos comunitarios. Solo con fines educativos; no es consejo médico.'
            : 'All guides are crafted for 5th-grade reading clarity and signed off by practicing community physicians. Educational only; not medical advice.'}
        </span>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topicsWithArticles.map(({ topic, article }) => (
          <TopicCard key={topic.id} topic={topic} article={article || undefined} locale={locale} />
        ))}
      </div>
    </div>
  );
}
