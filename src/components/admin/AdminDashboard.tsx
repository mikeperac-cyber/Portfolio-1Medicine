'use client';

import { useState } from 'react';
import {
  Users,
  Eye,
  TrendingUp,
  Printer,
  ShieldCheck,
  Star,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Locale } from '@/lib/i18n/config';

interface AdminDashboardProps {
  metrics: any;
  locale?: Locale;
}

export default function AdminDashboard({ metrics, locale = 'en' }: AdminDashboardProps) {
  const isSpanish = locale === 'es';
  const isTurkish = locale === 'tr';

  return (
    <div className="space-y-8">
      {/* Privacy Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-emerald-950 space-y-1">
          <strong className="block font-bold">
            {isTurkish
              ? 'Sıkı Anonim Telemetri ve Gizlilik Protokolü'
              : isSpanish
              ? 'Garantía de Privacidad y Anonimato de Datos'
              : 'Strict Anonymous Telemetry Protocol'}
          </strong>
          <p className="text-emerald-800">
            {isTurkish
              ? 'Tüm göstergeler anonim sayaçlarla derlenir. IP adresleri, hasta adları veya kişisel tıbbi veriler kesinlikle toplanmaz veya saklanmaz.'
              : isSpanish
              ? 'Todas las métricas se generan mediante contadores anónimos sin almacenar direcciones IP, nombres de pacientes ni identificadores individuales.'
              : 'All metrics reflect anonymous aggregate counters. No patient identifiers, IP addresses, or personal medical information are ever collected or stored.'}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Users Served */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isTurkish ? 'Ulaşılan Kişi' : isSpanish ? 'Personas Alcanzadas' : 'Users Served'}
            </span>
            <Users className="w-4 h-4 text-health-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {metrics.totalUsersServed.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% {isTurkish ? 'bu ay' : isSpanish ? 'este mes' : 'this month'}</span>
          </div>
        </div>

        {/* Metric 2: Topics Viewed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isTurkish ? 'Okunan Rehber' : isSpanish ? 'Guías Leídas' : 'Explainers Read'}
            </span>
            <Eye className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {metrics.topicsViewedTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            5.2 dk {isTurkish ? 'ortalama süre' : isSpanish ? 'tiempo promedio' : 'avg engagement'}
          </div>
        </div>

        {/* Metric 3: Quiz Knowledge Delta */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isTurkish ? 'Bilgi Artış Oranı' : isSpanish ? 'Mejora en Evaluaciones' : 'Quiz Knowledge Delta'}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {metrics.avgQuizImprovement}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {isTurkish ? 'Ön ve son test farkı' : isSpanish ? 'Pre vs. Post evaluación' : 'Pre- vs Post-Reading Delta'}
          </div>
        </div>

        {/* Metric 4: Outreach Handouts Printed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isTurkish ? 'Basılan Broşür' : isSpanish ? 'Hojas Impresas' : 'Outreach Handouts'}
            </span>
            <Printer className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {metrics.totalGuidesPrinted.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {isTurkish ? 'Klinik ve panolar için' : isSpanish ? 'Para clínicas y ONG' : 'For clinics & community boards'}
          </div>
        </div>
      </div>

      {/* Chart Row 1: Quiz Delta Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">
              {isTurkish
                ? 'Eğitim Etkisi: Ön ve Son Değerlendirme Puanları (%)'
                : isSpanish
                ? 'Impacto Educativo: Pre vs. Post Evaluación (%)'
                : 'Educational Impact: Pre- vs. Post-Quiz Scores (%)'}
            </h3>
            <p className="text-xs text-slate-500">
              {isTurkish
                ? 'Sade dille hazırlanan sağlık rehberlerini okuduktan sonra elde edilen ölçülebilir kavrama artışı.'
                : isSpanish
                ? 'Incremento medible de comprensión en salud tras leer las guías redactadas en lenguaje claro.'
                : 'Demonstrable knowledge retention gain after reading plain-language explainers.'}
            </p>
          </div>
          <span className="text-xs font-bold bg-health-50 text-health-700 border border-health-200 px-2.5 py-1 rounded-full">
            Avg: +38.4% Knowledge Gain
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.quizDeltas} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="topic" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <Tooltip
                formatter={(val: any, name: string) => [`${val}%`, name === 'preScore' ? 'Pre-Reading Score' : 'Post-Reading Score']}
                contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #cbd5e1' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="preScore" name="Pre-Reading Score (%)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="postScore" name="Post-Reading Score (%)" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart Row 2: Engagement Activity & Topic Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Area Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">
            {isTurkish ? 'Haftalık Toplum Etkileşim Trendi' : isSpanish ? 'Tendencia Semanal de Consultas y Descargas' : 'Weekly Community Engagement Activity'}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.recentActivityDays} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#0284c7" fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="guidesPrinted" name="Handouts Printed" stroke="#d97706" fill="#fef3c7" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Viewed Topics Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">
            {isTurkish ? 'En Çok Danışılan Konular' : isSpanish ? 'Temas de Mayor Consulta' : 'Most Viewed Health Topics'}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.topicViews}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={120} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="views" name="Total Views" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Anonymous Feedback Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">
            {isTurkish ? 'Son Anonim Toplum Geri Bildirimleri' : isSpanish ? 'Comentarios Anónimos de la Comunidad' : 'Recent Anonymous Community Feedback'}
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {isTurkish ? 'Ortalama memnuniyet: 4.9 / 5.0' : isSpanish ? 'Calificación promedio: 4.9 / 5.0' : 'Satisfaction: 96.2% Helpful'}
          </span>
        </div>

        <div className="space-y-3">
          {metrics.anonymousFeedback.map((fb: any) => (
            <div key={fb.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{fb.topic}</span>
                  <div className="flex text-amber-500">
                    {[...Array(fb.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <span className="text-slate-400 text-xs">{fb.date}</span>
              </div>
              <p className="text-slate-700 italic">"{fb.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
