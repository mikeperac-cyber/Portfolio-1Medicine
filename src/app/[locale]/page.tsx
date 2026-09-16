import Link from 'next/link';
import { ShieldCheck, Lock, BookOpen, MapPin, ArrowRight, HeartPulse, CheckCircle2, Sparkles } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { getTopics, getArticleBySlug } from '@/lib/supabase/server';
import TopicCard from '@/components/topics/TopicCard';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const topics = await getTopics();

  // Load articles for all topics
  const topicsWithArticles = await Promise.all(
    topics.map(async (topic) => {
      const article = await getArticleBySlug(topic.slug, locale);
      return { topic, article };
    })
  );

  const isSpanish = locale === 'es';

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-health-50 via-white to-slate-50 border-b border-slate-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-health-100 text-health-800 border border-health-300 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-health-600" />
            <span>{isSpanish ? 'Salud Pública Gratuita y Bilingüe' : 'Free, Community-Centered Public Health Initiative'}</span>
          </div>

          {/* Heading */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              {dict.home.heroTitle}
            </h1>
            <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-normal">
              {dict.home.heroSubtitle}
            </p>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href={`/${locale}/topics`}
              className="inline-flex items-center gap-2 bg-health-700 hover:bg-health-800 text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-md transition transform active:scale-95"
            >
              <BookOpen className="w-5 h-5" />
              <span>{dict.home.exploreTopics}</span>
            </Link>

            <Link
              href={`/${locale}/directory`}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-sm transition"
            >
              <MapPin className="w-5 h-5 text-health-600" />
              <span>{dict.home.findClinics}</span>
            </Link>
          </div>

          {/* Trust Guarantees Bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isSpanish ? 'Nivel de Lectura de 5to Grado' : '5th-Grade Plain Language'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isSpanish ? 'Revisado por Médicos Comunitarios' : 'Doctor Reviewed'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isSpanish ? 'Cero Datos Personales Solicitados' : '100% Anonymous'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Community Safety & Ethics Pledge */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {dict.home.communityPledgeTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {isSpanish
                ? 'Diseñado específicamente para proteger la seguridad, dignidad y privacidad de comunidades desatendidas.'
                : 'Engineered specifically to protect the dignity, safety, and privacy of vulnerable communities.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Pledge 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {dict.home.pledge1Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {dict.home.pledge1Desc}
              </p>
            </div>

            {/* Pledge 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {dict.home.pledge2Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {dict.home.pledge2Desc}
              </p>
            </div>

            {/* Pledge 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {dict.home.pledge3Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {dict.home.pledge3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {dict.home.topicsHeading}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {dict.home.topicsSubheading}
            </p>
          </div>

          <Link
            href={`/${locale}/topics`}
            className="inline-flex items-center gap-1 text-sm font-bold text-health-700 hover:text-health-900"
          >
            <span>{isSpanish ? 'Ver todos los temas →' : 'View all topics →'}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topicsWithArticles.map(({ topic, article }) => (
            <TopicCard key={topic.id} topic={topic} article={article || undefined} locale={locale} />
          ))}
        </div>
      </section>

      {/* Clinic Directory Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-health-900 to-health-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-health-700 text-health-100 px-3 py-1 rounded-full text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{isSpanish ? 'Atención Médica Cerca de Usted' : 'Affordable Local Healthcare'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              {isSpanish
                ? '¿Busca una clínica con doctores que hablen su idioma?'
                : 'Need a clinic with doctors who speak your language?'}
            </h2>
            <p className="text-xs sm:text-sm text-health-100 leading-relaxed">
              {isSpanish
                ? 'Consulte nuestro directorio de centros de salud comunitarios con atención a bajo costo, vacunas gratuitas e intérpretes médicos certificados.'
                : 'Explore neighborhood community health centers providing sliding-scale fees, free immunizations, and bilingual medical care regardless of insurance status.'}
            </p>
          </div>

          <Link
            href={`/${locale}/directory`}
            className="bg-white text-health-950 font-bold px-8 py-4 rounded-2xl text-sm sm:text-base hover:bg-slate-100 shadow-lg transition transform active:scale-95 shrink-0"
          >
            {dict.home.findClinics}
          </Link>
        </div>
      </section>
    </div>
  );
}
