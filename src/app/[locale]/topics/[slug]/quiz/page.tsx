import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';
import { getArticleBySlug, getQuizzesForTopic } from '@/lib/supabase/server';
import QuizEngine from '@/components/quiz/QuizEngine';

export default async function TopicQuizPage({
  params,
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams: { type?: string };
}) {
  const { locale, slug } = params;
  const quizType = searchParams.type === 'post' ? 'post' : 'pre';
  const isSpanish = locale === 'es';

  const article = await getArticleBySlug(slug, locale as Locale);
  if (!article) notFound();

  const quizzes = await getQuizzesForTopic(slug, locale as Locale);
  const quiz = quizzes[quizType];

  if (!quiz) {
    // Fallback: If specific quiz not present, generate an educational default check
    const fallbackQuiz = {
      id: `fallback-${slug}-${quizType}`,
      topic_id: article.topic_id,
      locale: locale as Locale,
      quiz_type: quizType as 'pre' | 'post',
      title: `${quizType.toUpperCase()} Knowledge Check: ${article.title}`,
      description: 'Anonymous health understanding check.',
      questions: [
        {
          id: 'fb-q1',
          quiz_id: `fallback-${slug}-${quizType}`,
          order_index: 0,
          question_text: isSpanish
            ? '¿Los cambios pequeños y diarios pueden prevenir o controlar mejor esta condición?'
            : 'Can small everyday lifestyle habits effectively prevent or manage this health condition?',
          options: [
            { id: 0, text: isSpanish ? 'No, la salud no depende de hábitos diarios.' : 'No, everyday habits have no impact.' },
            { id: 1, text: isSpanish ? 'Sí, la nutrición, el movimiento y el seguimiento médico son fundamentales.' : 'Yes, nutrition, physical activity, and medical guidance are foundational.' },
          ],
          correct_option_index: 1,
          explanation: isSpanish
            ? '¡Correcto! Las pautas de la OMS y los CDC demuestran que las decisiones diarias tienen un impacto masivo en el bienestar.'
            : 'Correct! WHO and CDC clinical guidance confirms that daily choices significantly improve outcomes.',
        },
        {
          id: 'fb-q2',
          quiz_id: `fallback-${slug}-${quizType}`,
          order_index: 1,
          question_text: isSpanish
            ? '¿A dónde puede acudir si no cuenta con seguro médico para recibir atención a bajo costo?'
            : 'Where can you go for low-cost care if you do not currently have health insurance?',
          options: [
            { id: 0, text: isSpanish ? 'A ninguna parte, no hay opciones sin seguro.' : 'Nowhere; uninsured patients cannot get care.' },
            { id: 1, text: isSpanish ? 'A un Centro de Salud Comunitario con escala móvil de pago.' : 'To a local Community Health Center with sliding fee discounts.' },
          ],
          correct_option_index: 1,
          explanation: isSpanish
            ? '¡Exacto! Los centros de salud comunitarios atienden a cualquier persona independientemente de su seguro o capacidad de pago.'
            : 'Correct! Community health clinics serve all patients regardless of insurance or ability to pay.',
        },
      ],
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <Link
          href={`/${locale}/topics/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isSpanish ? 'Volver a la Guía' : 'Back to Explainer'}</span>
        </Link>
        <QuizEngine quiz={fallbackQuiz} topicSlug={slug} locale={locale as Locale} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Link
        href={`/${locale}/topics/${slug}`}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isSpanish ? 'Volver a la Guía' : 'Back to Explainer'}</span>
      </Link>

      <QuizEngine quiz={quiz} topicSlug={slug} locale={locale as Locale} />
    </div>
  );
}
