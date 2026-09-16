import { Metadata } from 'next';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { getAdminMetrics } from '@/lib/supabase/server';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { BarChart3 } from 'lucide-react';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isSpanish = params.locale === 'es';
  return {
    title: isSpanish ? 'Panel de Impacto Comunitario' : 'Community Impact & Analytics Dashboard',
    description: 'Anonymous telemetry tracking users served, quiz knowledge improvement, and feedback.',
  };
}

export default async function AdminPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const metrics = await getAdminMetrics();
  const isSpanish = locale === 'es';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Page Header */}
      <header className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-health-100 text-health-800 border border-health-300 px-3 py-1 rounded-full text-xs font-semibold">
          <BarChart3 className="w-3.5 h-3.5 text-health-600" />
          <span>{isSpanish ? 'Telemetría de Salud Pública' : 'Public Health Telemetry'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {dict.admin.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {dict.admin.subtitle}
        </p>
      </header>

      {/* Recharts Analytics Dashboard */}
      <AdminDashboard metrics={metrics} locale={locale} />
    </div>
  );
}
