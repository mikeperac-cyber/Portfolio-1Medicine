'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import { Quiz } from '@/lib/supabase/mock-data';
import { Locale } from '@/lib/i18n/config';

interface QuizEngineProps {
  quiz: Quiz;
  topicSlug: string;
  locale?: Locale;
}

export default function QuizEngine({ quiz, topicSlug, locale = 'en' }: QuizEngineProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [previousPreScore, setPreviousPreScore] = useState<number | null>(null);

  const isSpanish = locale === 'es';
  const isTurkish = locale === 'tr';
  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correct_option_index) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);

      // Anonymous session token
      let sessionId = sessionStorage.getItem('anon_health_session');
      if (!sessionId) {
        sessionId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `session_${Math.random()}`;
        sessionStorage.setItem('anon_health_session', sessionId);
      }

      // Check for pre-score if this is post-quiz
      if (quiz.quiz_type === 'pre') {
        sessionStorage.setItem(`quiz_pre_${topicSlug}`, score.toString());
      } else {
        const storedPre = sessionStorage.getItem(`quiz_pre_${topicSlug}`);
        if (storedPre !== null) {
          setPreviousPreScore(parseInt(storedPre, 10));
        }
      }

      // Submit anonymous record to server
      try {
        await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            topicId: quiz.topic_id,
            topicSlug,
            quizType: quiz.quiz_type,
            score,
            totalQuestions,
            locale,
          }),
        });
      } catch (err) {
        console.debug('Anonymous quiz record submission error:', err);
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (totalQuestions === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <p className="text-slate-600">
          {isTurkish
            ? 'Bu konu için şu anda soru bulunmamaktadır.'
            : isSpanish
            ? 'No hay preguntas disponibles para este tema.'
            : 'No questions currently available for this topic.'}
        </p>
        <Link
          href={`/${locale}/topics/${topicSlug}`}
          className="inline-block bg-health-600 text-white font-semibold px-4 py-2 rounded-xl text-sm"
        >
          {isTurkish ? 'Rehbere dön' : isSpanish ? 'Volver al tema' : 'Return to explainer'}
        </Link>
      </div>
    );
  }

  // Completion Screen
  if (isFinished) {
    const percentage = Math.round((score / totalQuestions) * 100);
    const prePercentage = previousPreScore !== null ? Math.round((previousPreScore / totalQuestions) * 100) : null;
    const delta = prePercentage !== null ? percentage - prePercentage : null;

    const completionTitle = isTurkish ? 'Değerlendirme Tamamlandı!' : isSpanish ? '¡Evaluación Completada!' : 'Knowledge Check Complete!';
    const completionDesc = isTurkish
      ? 'Katıldığınız için teşekkürler! Bilinçli adımlar atmak sizin ve ailenizin sağlığını korur.'
      : isSpanish
      ? 'Gracias por participar. Su aprendizaje fortalece a nuestra comunidad.'
      : 'Thank you for participating! Taking charge of your health protects your entire family.';

    const correctAnswersLabel = isTurkish ? 'Doğru Yanıtlar' : isSpanish ? 'Respuestas Correctas' : 'Correct Answers';
    const initialScoreLabel = isTurkish ? 'Ön Puan: ' : isSpanish ? 'Evaluación Inicial: ' : 'Initial Pre-Score: ';
    const knowledgeGainLabel = isTurkish ? 'Bilgi Artışı' : isSpanish ? 'Mejora de Aprendizaje' : 'Knowledge Gain';

    const privacyText = isTurkish
      ? 'Bu yanıt %100 anonim olarak kaydedilmiştir. Hiçbir kişisel veri toplanmaz.'
      : isSpanish
      ? 'Esta respuesta se guardó de forma 100% anónima sin recopilar datos personales.'
      : '100% Anonymous: No names or identifying information are ever recorded.';

    const retakeButtonText = isTurkish ? 'Testi Tekrarla' : isSpanish ? 'Repetir Evaluación' : 'Retake Quiz';
    const backButtonText = isTurkish ? 'Rehbere Dön' : isSpanish ? 'Volver a la Guía' : 'Back to Explainer';

    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {completionTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {completionDesc}
          </p>
        </div>

        {/* Score & Delta Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-sm mx-auto space-y-3">
          <div className="text-3xl sm:text-4xl font-black text-health-800">
            {score} / {totalQuestions}
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {correctAnswersLabel} ({percentage}%)
          </div>

          {delta !== null && (
            <div className="pt-3 border-t border-slate-200 text-xs">
              <span className="text-slate-600">
                {initialScoreLabel} {prePercentage}% →
              </span>
              <strong className="text-emerald-700 ml-1 font-bold text-sm">
                +{delta > 0 ? delta : 0}% {knowledgeGainLabel}!
              </strong>
            </div>
          )}
        </div>

        {/* Anonymous Privacy Assurance */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{privacyText}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{retakeButtonText}</span>
          </button>

          <Link
            href={`/${locale}/topics/${topicSlug}`}
            className="inline-flex items-center gap-2 bg-health-600 hover:bg-health-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>{backButtonText}</span>
          </Link>
        </div>
      </div>
    );
  }

  const badgeHeader = quiz.quiz_type === 'pre'
    ? isTurkish ? 'Ön Değerlendirme' : isSpanish ? 'Evaluación Inicial' : 'Pre-Reading Check'
    : isTurkish ? 'Son Değerlendirme' : isSpanish ? 'Evaluación Final' : 'Post-Reading Check';

  const questionProgress = isTurkish
    ? `Soru ${currentQuestionIndex + 1} / ${totalQuestions}`
    : isSpanish
    ? `Pregunta ${currentQuestionIndex + 1} de ${totalQuestions}`
    : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;

  const explanationTitle = isTurkish ? 'Bu neden önemlidir:' : isSpanish ? 'Por qué es importante:' : 'Why this matters:';

  const nextButtonText = currentQuestionIndex + 1 === totalQuestions
    ? isTurkish ? 'Anonim Sonuçları Gör' : isSpanish ? 'Ver Resultados Anónimos' : 'View Anonymous Results'
    : isTurkish ? 'Sonraki Soru' : isSpanish ? 'Siguiente Pregunta' : 'Next Question';

  // Active Question Card
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Quiz Header & Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span className="uppercase tracking-wider">{badgeHeader}</span>
          <span>{questionProgress}</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-health-600 h-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Text */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
        {currentQ.question_text}
      </h3>

      {/* Options List */}
      <div className="space-y-2.5">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentQ.correct_option_index;

          let btnStyles = 'border-slate-200 hover:border-health-400 hover:bg-slate-50 text-slate-800';

          if (isAnswered) {
            if (isCorrect) {
              btnStyles = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-400';
            } else if (isSelected) {
              btnStyles = 'border-rose-400 bg-rose-50 text-rose-950 font-medium';
            } else {
              btnStyles = 'border-slate-200 opacity-60 text-slate-500';
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(idx)}
              className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between gap-3 ${btnStyles}`}
            >
              <span>{opt.text}</span>
              {isAnswered && (
                <span className="shrink-0">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  ) : null}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Educational Explanation Banner */}
      {isAnswered && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm space-y-1 animate-fadeIn">
          <span className="font-bold text-slate-900 block">{explanationTitle}</span>
          <p className="text-slate-700 leading-relaxed">{currentQ.explanation}</p>
        </div>
      )}

      {/* Next Button */}
      {isAnswered && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 bg-health-600 hover:bg-health-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-sm"
          >
            <span>{nextButtonText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
