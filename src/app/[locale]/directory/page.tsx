'use client';

import { useState, useMemo } from 'react';
import { MapPin, Phone, Building2, CheckCircle2, ShieldCheck, HeartPulse } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';
import { MOCK_RESOURCES, ClinicResource } from '@/lib/supabase/mock-data';
import ClinicCard from '@/components/directory/ClinicCard';
import DirectoryFilters from '@/components/directory/DirectoryFilters';

export default function DirectoryPage({ params }: { params: { locale: string } }) {
  const locale = (params.locale === 'es' ? 'es' : 'en') as Locale;
  const isSpanish = locale === 'es';

  const [search, setSearch] = useState('');
  const [service, setService] = useState('all');
  const [language, setLanguage] = useState('all');

  const filteredClinics = useMemo(() => {
    return MOCK_RESOURCES.filter((clinic) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        clinic.name.toLowerCase().includes(q) ||
        clinic.address.toLowerCase().includes(q) ||
        clinic.city.toLowerCase().includes(q) ||
        clinic.description.toLowerCase().includes(q);

      const matchesService = service === 'all' || clinic.services.includes(service);

      const matchesLanguage =
        language === 'all' ||
        clinic.languages_spoken.some((l) => l.toLowerCase().includes(language.toLowerCase()));

      return matchesSearch && matchesService && matchesLanguage;
    });
  }, [search, service, language]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-health-100 text-health-800 border border-health-300 px-3 py-1 rounded-full text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5 text-health-600" />
          <span>{isSpanish ? 'Red de Centros Comunitarios' : 'Community Clinic Network'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {isSpanish ? 'Directorio Comunitario de Clínicas y Recursos' : 'Community Clinic & Resource Directory'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {isSpanish
            ? 'Encuentre centros de salud cercanos con atención a bajo costo, escala móvil de pagos, vacunas gratuitas e intérpretes bilingües, sin importar su estatus de seguro o migratorio.'
            : 'Find neighborhood community health clinics offering sliding-scale fees, free vaccines, and certified interpreters, regardless of insurance or immigration status.'}
        </p>
      </div>

      {/* Trust & Immigrant Protection Assurance */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs sm:text-sm text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold">
            {isSpanish ? 'Atención Segura y Confidencial' : 'Safe & Welcoming for All Patients'}
          </strong>
          <p className="text-emerald-800 leading-relaxed">
            {isSpanish
              ? 'Los Centros de Salud Calificados a Nivel Federal (FQHC) atienden a todas las personas. Nunca reportan su estatus migratorio y cuentan con asesoría financiera para ajustar el costo a sus ingresos.'
              : 'Federally Qualified Health Centers (FQHCs) serve everyone. They never report immigration status and offer sliding fee scales based on household income.'}
          </p>
        </div>
      </div>

      {/* Search & Multi-Filters */}
      <DirectoryFilters
        search={search}
        setSearch={setSearch}
        service={service}
        setService={setService}
        language={language}
        setLanguage={setLanguage}
        locale={locale}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
        <span>
          {isSpanish
            ? `${filteredClinics.length} Clínicas Encontradas`
            : `${filteredClinics.length} Neighborhood Clinics Found`}
        </span>
      </div>

      {/* Clinic Cards Grid */}
      {filteredClinics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClinics.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">
            {isSpanish ? 'No se encontraron clínicas con estos filtros.' : 'No clinics match your current filter.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isSpanish
              ? 'Pruebe seleccionando "Todos los Servicios" o busque por ciudad.'
              : 'Try clearing your search query or selecting "All Services".'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setService('all');
              setLanguage('all');
            }}
            className="bg-health-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            {isSpanish ? 'Restablecer Filtros' : 'Reset All Filters'}
          </button>
        </div>
      )}
    </div>
  );
}
