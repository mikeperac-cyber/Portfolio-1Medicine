import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Clock,
  Printer,
  FileQuestion,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Locale, i18n } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { getTopics, getArticleBySlug } from '@/lib/supabase/server';
import ReviewerBadge from '@/components/topics/ReviewerBadge';
import CitationsList from '@/components/topics/CitationsList';
import AudioHelper from '@/components/topics/AudioHelper';
import AiSummaryDrawer from '@/components/topics/AiSummaryDrawer';
import { MANDATORY_DISCLAIMER } from '@/lib/ai/guardrails';

export async function generateStaticParams() {
  const topics = await getTopics();
  const params: { locale: string; slug: string }[] = [];
  for (const locale of i18n.locales) {
    for (const t of topics) {
      params.push({ locale, slug: t.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug, params.locale as any);
  if (!article) return { title: 'Health Topic Not Found' };

  return {
    title: `${article.title} | Health Literacy Guide`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
    },
  };
}

export default async function TopicDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const { locale, slug } = params;
  const dict = await getDictionary(locale);
  const topics = await getTopics();
  const currentTopic = topics.find((t) => t.slug === slug);

  if (!currentTopic) {
    notFound();
  }

  const article = await getArticleBySlug(slug, locale as Locale);

  if (!article) {
    notFound();
  }

  const isSpanish = locale === 'es';
  const isTurkish = locale === 'tr';

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Top Breadcrumb & Return */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <Link
          href={`/${locale}/topics`}
          className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {isTurkish
              ? 'Tüm konulara dön'
              : isSpanish
              ? 'Volver a todos los temas'
              : 'Back to all topics'}
          </span>
        </Link>

        {/* Audio helper */}
        <AudioHelper textToRead={`${article.title}. ${article.summary}. ${article.key_takeaways.join('. ')}`} locale={locale as Locale} />
      </div>

      {/* Header Section */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="bg-health-50 text-health-700 border border-health-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px] font-bold">
            {currentTopic.category.replace(/-/g, ' ')}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {currentTopic.estimated_read_minutes} {isTurkish ? 'dk okuma' : isSpanish ? 'min de lectura' : 'min read'}
            </span>
          </span>
          <span>•</span>
          <span>{currentTopic.reading_level}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
          {article.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          {article.summary}
        </p>

        {/* Clinical Reviewer Sign-off Badge */}
        <div className="pt-2">
          <ReviewerBadge
            reviewedBy={article.reviewed_by}
            reviewerRole={article.reviewer_role}
            reviewedAt={article.reviewed_at}
            status={article.status}
            locale={locale as Locale}
          />
        </div>
      </header>

      {/* Action Bar (Quizzes, Print Handout, AI Drawer) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Pre-Quiz Button */}
          <Link
            href={`/${locale}/topics/${slug}/quiz?type=pre`}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            <FileQuestion className="w-4 h-4 text-health-600" />
            <span>{dict.topics.preQuizCta}</span>
          </Link>

          {/* Post-Quiz Button */}
          <Link
            href={`/${locale}/topics/${slug}/quiz?type=post`}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{dict.topics.postQuizCta}</span>
          </Link>

          {/* Printable Handout */}
          <Link
            href={`/${locale}/topics/${slug}/print`}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            <Printer className="w-4 h-4 text-amber-600" />
            <span>{dict.topics.printHandout}</span>
          </Link>
        </div>

        {/* AI Summarizer Drawer CTA */}
        <AiSummaryDrawer
          topicTitle={article.title}
          articleText={article.content_markdown}
          keyTakeaways={article.key_takeaways}
          vettedSources={article.vetted_sources}
          locale={locale as Locale}
        />
      </div>

      {/* Key Takeaways Box */}
      <section className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 sm:p-6 space-y-3" aria-labelledby="takeaways-title">
        <h2 id="takeaways-title" className="text-base sm:text-lg font-bold text-emerald-950 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{dict.topics.keyTakeaways}</span>
        </h2>
        <ul className="space-y-2 text-xs sm:text-sm text-emerald-900 leading-relaxed">
          {article.key_takeaways.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Main Explainer Body */}
      <section className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4">
        {article.content_markdown.split('\n\n').map((paragraph, idx) => {
          if (paragraph.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-xl sm:text-2xl font-black text-slate-900 pt-4 border-b border-slate-200 pb-2">
                {paragraph.replace('## ', '')}
              </h2>
            );
          }
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-lg sm:text-xl font-bold text-slate-900 pt-2">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ') || paragraph.startsWith('4. ')) {
            return (
              <div key={idx} className="pl-2 space-y-1">
                <p className="font-medium text-slate-800">{paragraph}</p>
              </div>
            );
          }
          return (
            <p key={idx} className="text-slate-700 leading-relaxed">
              {paragraph}
            </p>
          );
        })}
      </section>

      {/* Mandatory Clinical Disclaimer */}
      <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 flex items-center gap-2 text-xs text-slate-700 font-medium">
        <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0" />
        <span>{MANDATORY_DISCLAIMER}</span>
      </div>

      {/* Official Citations & Sources */}
      <CitationsList sources={article.vetted_sources} locale={locale as Locale} />

      {/* Post-reading Quiz CTA banner */}
      <div className="bg-gradient-to-r from-health-50 to-emerald-50 border border-health-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            {isTurkish
              ? 'Öğrendiklerinizi test etmeye hazır mısınız?'
              : isSpanish
              ? '¿Listo para comprobar lo aprendido?'
              : 'Ready to test your knowledge?'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            {isTurkish
              ? 'Kısa ve anonim son değerlendirmeyi tamamlayarak bilgi artışınızı görün.'
              : isSpanish
              ? 'Tome la breve evaluación final anónima para ver cuánto mejoró su comprensión.'
              : 'Take the quick anonymous post-quiz to verify your learning and see your knowledge delta.'}
          </p>
        </div>

        <Link
          href={`/${locale}/topics/${slug}/quiz?type=post`}
          className="bg-health-700 hover:bg-health-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition shrink-0"
        >
          {isTurkish ? 'Son Değerlendirmeyi Yap' : isSpanish ? 'Hacer Evaluación Final' : 'Take Post-Quiz Now'}
        </Link>
      </div>
    </article>
  );
}
