import { MapPin, Phone, Clock, Languages, CheckCircle2, Navigation, Accessibility, DollarSign } from 'lucide-react';
import { ClinicResource } from '@/lib/supabase/mock-data';
import { Locale } from '@/lib/i18n/config';

interface ClinicCardProps {
  clinic: ClinicResource;
  locale?: Locale;
}

export default function ClinicCard({ clinic, locale = 'en' }: ClinicCardProps) {
  const isSpanish = locale === 'es';
  const isTurkish = locale === 'tr';

  const slidingScaleLabel = isTurkish ? 'Esnek Ödeme / Düşük Maliyet' : isSpanish ? 'Escala Móvil / Bajo Costo' : 'Sliding Fee Scale';
  const accessibleLabel = isTurkish ? 'Engelsiz Erişim' : isSpanish ? 'Accesible' : 'Accessible';
  const languagesLabel = isTurkish ? 'Diller:' : isSpanish ? 'Idiomas:' : 'Languages:';
  const directionsLabel = isTurkish ? 'Google Haritalarda Aç (Yol Tarifi)' : isSpanish ? 'Abrir en Google Maps / Direcciones' : 'Open Directions in Google Maps';

  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header with Badges */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {clinic.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
            {clinic.sliding_scale_available && (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span>{slidingScaleLabel}</span>
              </span>
            )}
            {clinic.wheelchair_accessible && (
              <span className="bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Accessibility className="w-3 h-3" />
                <span>{accessibleLabel}</span>
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {clinic.description}
        </p>

        {/* Address & Phone */}
        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-health-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              {clinic.address}, {clinic.city}, {clinic.state} {clinic.postal_code}
            </span>
          </div>

          <div className="flex items-center gap-2 font-medium">
            <Phone className="w-4 h-4 text-health-600 shrink-0" aria-hidden="true" />
            <a
              href={`tel:${clinic.phone.replace(/[^0-9]/g, '')}`}
              className="text-health-700 hover:text-health-900 hover:underline font-bold text-sm"
              aria-label={`Call ${clinic.name} at ${clinic.phone}`}
            >
              {clinic.phone}
            </a>
          </div>

          <div className="flex items-start gap-2 text-slate-600">
            <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-[11px] space-y-0.5">
              {Object.entries(clinic.hours_schedule).map(([days, hrs]) => (
                <div key={days}>
                  <span className="font-semibold text-slate-800">{days}:</span> {hrs}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Languages Spoken */}
        <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-xs">
          <Languages className="w-4 h-4 text-health-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-wrap gap-1">
            <span className="font-semibold text-slate-700">{languagesLabel}</span>
            {clinic.languages_spoken.map((lang, idx) => (
              <span
                key={idx}
                className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Services Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {clinic.services.map((srv, idx) => (
            <span
              key={idx}
              className="bg-health-50 text-health-700 border border-health-200 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-health-600" />
              <span>{srv.replace(/_/g, ' ')}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Map Action Button */}
      <div className="pt-3 border-t border-slate-100">
        <a
          href={clinic.map_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-health-50 hover:text-health-800 hover:border-health-300 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 transition"
        >
          <Navigation className="w-4 h-4 text-health-600" />
          <span>{directionsLabel}</span>
        </a>
      </div>
    </article>
  );
}
