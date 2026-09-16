'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartPulse, Menu, X, PhoneCall, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  locale: Locale;
  dict: any;
}

export default function Navbar({ locale, dict }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/topics`, label: dict.nav.topics },
    { href: `/${locale}/directory`, label: dict.nav.directory },
    { href: `/${locale}/ethics`, label: dict.nav.ethics },
    { href: `/${locale}/admin`, label: dict.nav.admin },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}` && pathname === `/${locale}`) return true;
    if (href !== `/${locale}` && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Skip to Content for Screen Readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-health-700 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
      >
        {dict.nav.skipToContent}
      </a>

      {/* Emergency & Crisis Top Ribbon */}
      <aside aria-label="Emergency and crisis assistance" className="bg-amber-500 text-slate-950 text-xs font-semibold px-4 py-2 border-b border-amber-600 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" aria-hidden="true" />
            <span>{dict.site.emergencyNotice}</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:988"
              className="inline-flex items-center gap-1 bg-slate-950 text-white px-2 py-0.5 rounded text-[11px] hover:bg-slate-800 transition"
              aria-label="Call or text 988 suicide and crisis lifeline"
            >
              <PhoneCall className="w-3 h-3 text-amber-300" aria-hidden="true" />
              <span>988 Crisis Lifeline (24/7)</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 text-health-800 hover:text-health-900 transition"
              aria-label="Community Health Bridge Homepage"
            >
              <div className="w-9 h-9 rounded-lg bg-health-600 flex items-center justify-center text-white shadow-sm">
                <HeartPulse className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg leading-tight tracking-tight text-slate-900">
                  {dict.site.title}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium hidden xs:inline">
                  {dict.site.tagline}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md transition ${
                    isActive(link.href)
                      ? 'bg-health-50 text-health-700 font-semibold border border-health-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Language Switcher & Mobile Hamburger */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher currentLocale={locale} />

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-base font-medium transition ${
                  isActive(link.href)
                    ? 'bg-health-50 text-health-700 font-bold border-l-4 border-health-600'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{dict.site.disclaimer}</span>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
