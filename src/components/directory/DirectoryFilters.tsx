'use client';

import { Search, Filter, Languages } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';

interface DirectoryFiltersProps {
  search: string;
  setSearch: (s: string) => void;
  service: string;
  setService: (s: string) => void;
  language: string;
  setLanguage: (l: string) => void;
  locale?: Locale;
}

export default function DirectoryFilters({
  search,
  setSearch,
  service,
  setService,
  language,
  setLanguage,
  locale = 'en',
}: DirectoryFiltersProps) {
  const isSpanish = locale === 'es';
  const isTurkish = locale === 'tr';

  const searchPlaceholder = isTurkish
    ? 'Klinik veya sokak adı ara...'
    : isSpanish
    ? 'Buscar por clínica o calle...'
    : 'Search clinic name, street...';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Text Search */}
        <div className="sm:col-span-1 relative">
          <label htmlFor="clinic-search" className="sr-only">
            {isTurkish ? 'Klinik ara' : isSpanish ? 'Buscar clínicas' : 'Search clinics'}
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
          <input
            id="clinic-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-health-600"
          />
        </div>

        {/* Filter by Service */}
        <div className="relative">
          <label htmlFor="service-filter" className="sr-only">
            {isTurkish ? 'Hizmete göre filtrele' : isSpanish ? 'Filtrar por servicio' : 'Filter by service'}
          </label>
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
          <select
            id="service-filter"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-health-600 appearance-none cursor-pointer"
          >
            <option value="all">{isTurkish ? 'Tüm Hizmetler' : isSpanish ? 'Todos los Servicios' : 'All Services'}</option>
            <option value="sliding_scale">{isTurkish ? 'Gelire Göre Esnek Ödeme' : isSpanish ? 'Escala Móvil / Bajo Costo' : 'Sliding Fee Scale'}</option>
            <option value="free_vaccines">{isTurkish ? 'Ücretsiz Aşılar' : isSpanish ? 'Vacunas Gratuitas' : 'Free Vaccines'}</option>
            <option value="diabetes_education">{isTurkish ? 'Diyabet Eğitimi' : isSpanish ? 'Educación en Diabetes' : 'Diabetes Education'}</option>
            <option value="mental_health">{isTurkish ? 'Ruh Sağlığı ve Psikolojik Danışmanlık' : isSpanish ? 'Salud Mental y Consejería' : 'Mental Health Support'}</option>
            <option value="dental">{isTurkish ? 'Diş Tedavisi' : isSpanish ? 'Atención Dental' : 'Dental Care'}</option>
            <option value="prenatal">{isTurkish ? 'Doğum Öncesi Bakım' : isSpanish ? 'Control Prenatal' : 'Prenatal Care'}</option>
            <option value="interpreter">{isTurkish ? 'Tercüman Hizmeti' : isSpanish ? 'Intérpretes Disponibles' : 'Interpreter Services'}</option>
          </select>
        </div>

        {/* Filter by Language */}
        <div className="relative">
          <label htmlFor="language-filter" className="sr-only">
            {isTurkish ? 'Dile göre filtrele' : isSpanish ? 'Filtrar por idioma' : 'Filter by language'}
          </label>
          <Languages className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
          <select
            id="language-filter"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-health-600 appearance-none cursor-pointer"
          >
            <option value="all">{isTurkish ? 'Tüm Diller' : isSpanish ? 'Todos los Idiomas' : 'All Languages'}</option>
            <option value="Turkish">{isTurkish ? 'Türkçe' : 'Turkish / Türkçe'}</option>
            <option value="Spanish">{isTurkish ? 'İspanyolca' : isSpanish ? 'Español' : 'Spanish'}</option>
            <option value="Cantonese">{isTurkish ? 'Kantonca' : isSpanish ? 'Cantonés' : 'Cantonese'}</option>
            <option value="Vietnamese">{isTurkish ? 'Vietnamca' : isSpanish ? 'Vietnamita' : 'Vietnamese'}</option>
            <option value="Mayan">{isTurkish ? 'Maya Dilleri' : isSpanish ? 'Lenguas Mayas' : 'Mayan Languages'}</option>
            <option value="Tagalog">{isTurkish ? 'Tagalogca' : isSpanish ? 'Tagalo' : 'Tagalog'}</option>
            <option value="Arabic">{isTurkish ? 'Arapça' : isSpanish ? 'Árabe' : 'Arabic'}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
