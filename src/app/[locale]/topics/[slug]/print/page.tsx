import { notFound } from 'next/navigation';
import { Locale } from '@/lib/i18n/config';
import { getTopics, getArticleBySlug } from '@/lib/supabase/server';
import PrintableHandout from '@/components/print/PrintableHandout';

export default async function TopicPrintPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const { locale, slug } = params;
  const topics = await getTopics();
  const topic = topics.find((t) => t.slug === slug);
  if (!topic) notFound();

  const article = await getArticleBySlug(slug, locale as Locale);
  if (!article) notFound();

  return (
    <div className="py-6">
      <PrintableHandout topic={topic} article={article} locale={locale as Locale} />
    </div>
  );
}
