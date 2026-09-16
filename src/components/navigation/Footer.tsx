import Link from 'next/link';
import { ShieldCheck, HeartPulse, ExternalLink, Phone } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';

interface FooterProps {
  locale: Locale;
  dict: any;
}

export default function Footer({ locale, dict }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 no-print" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Prominent Educational Disclaimer Ribbon */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-slate-200">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-white text-sm sm:text-base">
              Educational Resource Only — Not Medical Advice
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              This platform provides plain-language health explainers adapted directly from the WHO, CDC, and health ministries. It does not provide medical diagnosis, clinical triage, or personalized treatment plans. If you are unwell, please contact a healthcare professional or visit a local clinic.
            </p>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <HeartPulse className="w-5 h-5 text-health-400" />
              <span>{dict.site.title}</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
              Equipping underserved communities, non-English speakers, and families with clear, culturally respectful, doctor-reviewed health literacy materials.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% Anonymous • Zero Personal Data Retained</span>
            </div>
          </div>

          {/* Emergency & Support Contacts */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Emergency Help</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-bold text-white">Emergency:</span>
                <a href="tel:911" className="text-rose-400 hover:underline">911</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-white">Crisis & Suicide:</span>
                <a href="tel:988" className="text-amber-400 hover:underline">988 (Call or Text)</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-bold text-white">Community Services:</span>
                <a href="tel:211" className="text-sky-400 hover:underline">211 (Housing, Food)</a>
              </li>
            </ul>
          </div>

          {/* Official Vetted Sources */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Vetted Source Partners</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.who.int"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition"
                >
                  <span>World Health Organization (WHO)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.cdc.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition"
                >
                  <span>Centers for Disease Control (CDC)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <Link
                  href={`/${locale}/ethics`}
                  className="inline-flex items-center gap-1 text-health-400 hover:underline font-semibold"
                >
                  <span>Ethics & Review Protocols →</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Plain language note */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Community Health Bridge. Open-access public health initiative.</p>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/ethics`} className="hover:text-white">Ethics & Sources</Link>
            <Link href={`/${locale}/directory`} className="hover:text-white">Clinic Finder</Link>
            <Link href={`/${locale}/admin`} className="hover:text-white">Impact Dashboard</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
