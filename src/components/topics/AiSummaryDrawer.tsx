'use client';

import { useState } from 'react';
import { Sparkles, X, AlertTriangle, ShieldCheck, ExternalLink, Loader2, Send } from 'lucide-react';
import { VettedSource } from '@/lib/supabase/mock-data';
import { MANDATORY_DISCLAIMER } from '@/lib/ai/guardrails';
import { Locale } from '@/lib/i18n/config';

interface AiSummaryDrawerProps {
  topicTitle: string;
  articleText: string;
  keyTakeaways: string[];
  vettedSources: VettedSource[];
  locale?: Locale;
}

export default function AiSummaryDrawer({
  topicTitle,
  articleText,
  keyTakeaways,
  vettedSources,
  locale = 'en',
}: AiSummaryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    summary: string;
    citations: VettedSource[];
    disclaimer: string;
    isFallback: boolean;
  } | null>(null);

  const isSpanish = locale === 'es';
  const isTurkish = locale === 'tr';

  const handleGenerate = async (customPrompt?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle,
          articleText,
          keyTakeaways,
          vettedSources,
          userPrompt: customPrompt !== undefined ? customPrompt : userPrompt,
          locale,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        summary: isTurkish
          ? `İstek şu anda işlenemedi. Lütfen resmi klinik kaynaklarını inceleyin.\n\n${MANDATORY_DISCLAIMER}`
          : isSpanish
          ? `No se pudo procesar la solicitud. Por favor intente más tarde.\n\n${MANDATORY_DISCLAIMER}`
          : `Unable to process request right now. Please check official clinic resources.\n\n${MANDATORY_DISCLAIMER}`,
        citations: vettedSources,
        disclaimer: MANDATORY_DISCLAIMER,
        isFallback: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDefault = () => {
    setIsOpen(true);
    if (!result) {
      handleGenerate('');
    }
  };

  const triggerButtonText = isTurkish
    ? 'Yapay Zeka ile Sadeleştir / Özetle'
    : isSpanish
    ? 'Explicar con Inteligencia Artificial'
    : 'Ask AI to Simplify / Summarize';

  const drawerHeaderTitle = isTurkish
    ? 'Doğrulanmış Sağlık Asistanı'
    : isSpanish
    ? 'Asistente Educativo Verificado'
    : 'Grounded Health Assistant';

  const drawerHeaderSubtitle = isTurkish
    ? 'Yalnızca resmi halk sağlığı belgelerine dayanır'
    : isSpanish
    ? 'Basado únicamente en fuentes oficiales (OMS/CDC)'
    : 'Restricted strictly to vetted public health literature';

  const guardrailBannerText = isTurkish
    ? 'Güvenlik Koruması Aktif: Bu asistan kişisel belirtileri değerlendirmez, teşhis koymaz veya ilaç dozu öneremez.'
    : isSpanish
    ? 'Protección de seguridad activa: este asistente no diagnostica síntomas ni receta dosis. Es puramente educativo.'
    : 'Safety Guardrails Active: This assistant does not diagnose personal symptoms, triage, or alter dosages.';

  const loadingText = isTurkish
    ? 'Resmi metin doğrulanıyor...'
    : isSpanish
    ? 'Verificando con el texto oficial del tema...'
    : 'Grounding with vetted official text...';

  const fallbackAlertTitle = isTurkish
    ? 'Hasta Koruma Güvenlik Filtresi Devreye Girdi'
    : isSpanish
    ? 'Aviso de Protección al Paciente'
    : 'Patient Protection Guardrail Triggered';

  const fallbackAlertDesc = isTurkish
    ? 'Tıbbi teşhis, belirti değerlendirmesi veya kişisel bilgi içeren bir ifade tespit edildi. Güvenliğiniz için bu sisteme teşhis yetkisi verilmemiştir.'
    : isSpanish
    ? 'Detectamos una consulta relacionada con diagnóstico o datos personales. Para su seguridad, no podemos evaluar síntomas individuales.'
    : 'A diagnostic, symptom evaluation, or personal medical query was detected. For your safety, personalized diagnosis is restricted.';

  const inputPlaceholder = isTurkish
    ? 'Eğitim amaçlı bir soru sorun (Örn: "Tabak kuralını basitçe açıkla")'
    : isSpanish
    ? 'Haga una pregunta educativa (ej. "¿Cómo explico esto a mi familia?")'
    : 'Ask an educational question (e.g., "Explain the plate method simply")';

  return (
    <>
      <button
        type="button"
        onClick={handleOpenDefault}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-health-700 to-health-800 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl hover:from-health-800 hover:to-health-900 shadow-md transition transform active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-amber-300" aria-hidden="true" />
        <span>{triggerButtonText}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-drawer-title"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-health-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 id="ai-drawer-title" className="font-bold text-sm sm:text-base">
                    {drawerHeaderTitle}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {drawerHeaderSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md focus:outline-none"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guardrail Policy Banner */}
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-start gap-2 text-xs text-amber-950 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{guardrailBannerText}</span>
            </div>

            {/* Body / Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-health-600" />
                  <p className="text-xs font-medium">{loadingText}</p>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  {/* Fallback alert if guardrail tripped */}
                  {result.isFallback && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 flex items-start gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">
                          {fallbackAlertTitle}
                        </strong>
                        <span>{fallbackAlertDesc}</span>
                      </div>
                    </div>
                  )}

                  {/* Summary Text */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                    {result.summary}
                  </div>

                  {/* Mandatory Disclaimer Badge */}
                  <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-lg border border-slate-300 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <span>{MANDATORY_DISCLAIMER}</span>
                  </div>

                  {/* Citations */}
                  {result.citations && result.citations.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        {isTurkish ? 'Doğrulanmış Kaynaklar ve Alıntılar' : isSpanish ? 'Citas y Fuentes Verificadas' : 'Vetted Grounding Citations'}
                      </h4>
                      <ul className="space-y-1.5 text-xs">
                        {result.citations.map((c, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-health-700">
                            <span className="text-slate-400">•</span>
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              <span>{c.name} ({c.organization})</span>
                              <ExternalLink className="w-3 h-3 text-health-500" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Input Footer for Custom Question */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (userPrompt.trim()) handleGenerate(userPrompt);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder={inputPlaceholder}
                  className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-health-600"
                />
                <button
                  type="submit"
                  disabled={loading || !userPrompt.trim()}
                  className="bg-health-600 text-white p-2.5 rounded-xl hover:bg-health-700 disabled:opacity-50 transition"
                  aria-label="Send query"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
