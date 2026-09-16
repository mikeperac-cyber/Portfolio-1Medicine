import { ShieldCheck, UserCheck, Calendar } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';

interface ReviewerBadgeProps {
  reviewedBy: string;
  reviewerRole: string;
  reviewedAt: string;
  status?: string;
  locale?: Locale;
}

export default function ReviewerBadge({
  reviewedBy,
  reviewerRole,
  reviewedAt,
  status = 'published',
  locale = 'en',
}: ReviewerBadgeProps) {
  const isSpanish = locale === 'es';
  const isTurkish = locale === 'tr';

  const badgeTitle = isTurkish ? 'Klinik Olarak Onaylandı' : isSpanish ? 'Revisión Médica Aprobada' : 'Clinically Reviewed';
  const datePrefix = isTurkish ? 'Tarih: ' : isSpanish ? 'Fecha: ' : 'Verified: ';
  const statusLabel = isTurkish ? 'Yayınlandı' : isSpanish ? 'Publicado' : 'Published';
  const dateLocale = isTurkish ? 'tr-TR' : isSpanish ? 'es-ES' : 'en-US';

  return (
    <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 text-xs text-emerald-950 shadow-sm">
      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
        <span>{badgeTitle}</span>
      </div>

      <span className="hidden sm:inline text-emerald-300">|</span>

      <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
        <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-semibold">{reviewedBy}</strong>
          <span className="text-emerald-700 ml-1">({reviewerRole})</span>
        </span>
      </div>

      <span className="hidden sm:inline text-emerald-300">|</span>

      <div className="flex items-center gap-1 text-emerald-700">
        <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>
          {datePrefix}
          {new Date(reviewedAt).toLocaleDateString(dateLocale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      {status === 'published' && (
        <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {statusLabel}
        </span>
      )}
    </div>
  );
}
