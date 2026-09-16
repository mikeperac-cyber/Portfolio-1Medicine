'use client';

import { Printer, HeartPulse, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Article, Topic } from '@/lib/supabase/mock-data';
import { MANDATORY_DISCLAIMER } from '@/lib/ai/guardrails';
import { Locale } from '@/lib/i18n/config';

interface PrintableHandoutProps {
  topic: Topic;
  article: Article;
  locale?: Locale;
}

export default function PrintableHandout({ topic, article, locale = 'en' }: PrintableHandoutProps) {
  const isSpanish = locale === 'es';
  const isTurkish = locale === 'tr';
  const currentUrl = `https://communityhealthbridge.org/${locale}/topics/${topic.slug}`;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const backText = isTurkish
    ? 'Dijital Rehbere Geri Dön'
    : isSpanish
    ? 'Volver a la Guía Digital'
    : 'Back to Digital Guide';

  const printButtonText = isTurkish
    ? 'Broşürü Yazdır / PDF Kaydet'
    : isSpanish
    ? 'Imprimir Hoja de Orientación'
    : 'Print / Save as PDF';

  const orgHeader = isTurkish
    ? 'Toplum Sağlığı Köprüsü'
    : isSpanish
    ? 'Salud Comunitaria'
    : 'Community Health Bridge';

  const subHeader = isTurkish
    ? 'Hasta ve Aileler İçin Sağlık Okuryazarlığı Broşürü'
    : isSpanish
    ? 'Guía Informativa para Pacientes y Familias'
    : 'Patient & Family Health Literacy Guide';

  const keyPointsTitle = isTurkish
    ? 'Sağlığınız İçin Önemli Noktalar:'
    : isSpanish
    ? 'Puntos Clave para su Salud:'
    : 'Key Points to Remember:';

  const practicalStepsTitle = isTurkish
    ? 'Pratik Bilgiler ve Günlük Adımlar'
    : isSpanish
    ? 'Información Práctica'
    : 'Everyday Steps';

  const qrTitle = isTurkish
    ? 'Sesli Dinleme ve Testler İçin QR Kodu Okutun'
    : isSpanish
    ? 'Escanee para Audio y Más Idiomas'
    : 'Scan for Audio, Translation & Quizzes';

  const qrDesc = isTurkish
    ? 'Telefonunuzun kamerasıyla okutarak rehberi sesli dinleyebilir, bilginizi test edebilir veya klinik haritalarına ulaşabilirsiniz.'
    : isSpanish
    ? 'Escanee con la cámara de su teléfono para escuchar este artículo en voz alta o buscar clínicas cercanas.'
    : 'Scan with your smartphone camera to access audio read-aloud, self-quizzes, and neighborhood clinic maps.';

  const reviewPrefix = isTurkish
    ? 'İnceleyen: '
    : isSpanish
    ? 'Revisado por: '
    : 'Reviewed by: ';

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">
      {/* On-screen control bar (hidden when printing) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/${locale}/topics/${topic.slug}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backText}</span>
        </Link>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-health-700 hover:bg-health-800 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md transition"
        >
          <Printer className="w-4 h-4" />
          <span>{printButtonText}</span>
        </button>
      </div>

      {/* Printable Sheet (Standard Letter / 1-Page Optimized) */}
      <div className="print-container bg-white border border-slate-300 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6 text-slate-900">
        {/* Header Ribbon */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                {orgHeader}
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                {subHeader}
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-500 font-semibold">
            <div>{topic.reading_level}</div>
            <div>{isTurkish ? 'Klinik Olarak Doğrulandı' : isSpanish ? 'Revisión Médica Verificada' : 'Clinically Verified'}</div>
          </div>
        </div>

        {/* Title & Summary */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 leading-tight">
            {article.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Key Takeaways Box */}
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 sm:p-5 space-y-2.5">
          <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-900">
            {keyPointsTitle}
          </h3>
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800">
            {article.key_takeaways.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-bold text-health-800">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Core Explainer Highlights */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            {practicalStepsTitle}
          </h3>
          <div className="prose prose-sm max-w-none text-slate-800 line-clamp-[12]">
            {article.content_markdown.replace(/##/g, '').replace(/###/g, '')}
          </div>
        </div>

        {/* QR Code & Digital Access Box */}
        <div className="border-2 border-dashed border-slate-400 rounded-2xl p-4 flex items-center justify-between gap-4 bg-slate-50">
          <div className="space-y-1">
            <h4 className="font-bold text-xs sm:text-sm text-slate-950">
              {qrTitle}
            </h4>
            <p className="text-[11px] text-slate-600 leading-tight">
              {qrDesc}
            </p>
            <div className="text-[10px] text-slate-500 font-mono pt-1 break-all">
              {currentUrl}
            </div>
          </div>

          {/* Crisp Scalable SVG QR Code */}
          <div className="w-24 h-24 bg-white border border-slate-400 p-1.5 rounded-lg flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
              <rect x="5" y="5" width="30" height="30" />
              <rect x="10" y="10" width="20" height="20" fill="white" />
              <rect x="15" y="15" width="10" height="10" />

              <rect x="65" y="5" width="30" height="30" />
              <rect x="70" y="10" width="20" height="20" fill="white" />
              <rect x="75" y="15" width="10" height="10" />

              <rect x="5" y="65" width="30" height="30" />
              <rect x="10" y="70" width="20" height="20" fill="white" />
              <rect x="15" y="75" width="10" height="10" />

              <rect x="42" y="10" width="6" height="6" />
              <rect x="52" y="15" width="6" height="6" />
              <rect x="42" y="25" width="6" height="6" />
              <rect x="52" y="30" width="6" height="6" />
              <rect x="40" y="45" width="20" height="10" />
              <rect x="10" y="45" width="10" height="10" />
              <rect x="75" y="45" width="15" height="15" />
              <rect x="45" y="65" width="10" height="20" />
              <rect x="65" y="75" width="25" height="15" />
            </svg>
          </div>
        </div>

        {/* Emergency & Clinic Helplines */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
          <div className="bg-slate-100 p-2 rounded-lg">
            <span className="font-bold text-slate-950 block">{isTurkish ? 'Acil Servis' : 'Emergency'}</span>
            <span className="text-rose-700 font-bold">{isTurkish ? '112 / 911' : '911'}</span>
          </div>
          <div className="bg-slate-100 p-2 rounded-lg">
            <span className="font-bold text-slate-950 block">{isTurkish ? 'Kriz Hattı' : 'Crisis Lifeline'}</span>
            <span className="text-amber-700 font-bold">988 (24/7)</span>
          </div>
          <div className="bg-slate-100 p-2 rounded-lg">
            <span className="font-bold text-slate-950 block">{isTurkish ? 'Toplum Hizmeti' : 'Local Clinics'}</span>
            <span className="text-sky-700 font-bold">211</span>
          </div>
        </div>

        {/* Footer: Clinical Review & Disclaimer */}
        <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>{reviewPrefix}</strong>
            {article.reviewed_by} ({article.reviewer_role}) • {article.reviewed_at}
          </div>
          <div className="font-semibold text-slate-600">
            {MANDATORY_DISCLAIMER}
          </div>
        </div>
      </div>
    </div>
  );
}
