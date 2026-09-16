import { ExternalLink, BookOpenCheck } from 'lucide-react';
import { VettedSource } from '@/lib/supabase/mock-data';
import { Locale } from '@/lib/i18n/config';

interface CitationsListProps {
  sources: VettedSource[];
  locale?: Locale;
}

export default function CitationsList({ sources, locale = 'en' }: CitationsListProps) {
  const isSpanish = locale === 'es';
  const isTurkish = locale === 'tr';

  if (!sources || sources.length === 0) return null;

  const headingText = isTurkish
    ? 'Resmi Kaynaklar ve Tıbbi Alıntılar'
    : isSpanish
    ? 'Fuentes Oficiales y Citas Médicas'
    : 'Official Sources & Clinical Citations';

  const descText = isTurkish
    ? 'Bu eğitim içeriği aşağıdaki doğrulanmış resmi sağlık kurumlarının kılavuzlarına dayanmaktadır:'
    : isSpanish
    ? 'Este contenido ha sido adaptado y verificado con base en las siguientes pautas oficiales:'
    : 'This educational content is adapted directly from the following verified public health agencies:';

  return (
    <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3" aria-labelledby="citations-heading">
      <div className="flex items-center gap-2 text-slate-800">
        <BookOpenCheck className="w-5 h-5 text-health-600" aria-hidden="true" />
        <h3 id="citations-heading" className="text-sm sm:text-base font-bold text-slate-900">
          {headingText}
        </h3>
      </div>
      <p className="text-xs text-slate-600">
        {descText}
      </p>

      <ul className="space-y-2.5 pt-1 text-xs sm:text-sm">
        {sources.map((src, idx) => (
          <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-400 text-xs shrink-0 mt-0.5">[{idx + 1}]</span>
            <div className="flex-1">
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-health-700 hover:text-health-900 hover:underline inline-flex items-center gap-1"
              >
                <span>{src.name}</span>
                <ExternalLink className="w-3.5 h-3.5 text-health-600" aria-label="(opens in a new tab)" />
              </a>
              <div className="text-slate-500 text-xs mt-0.5">
                <span>{src.organization}</span>
                <span className="mx-1.5">•</span>
                <span>{src.publication_year}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
