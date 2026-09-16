'use client';

import { useState, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';

interface AudioHelperProps {
  textToRead: string;
  locale?: Locale;
}

export default function AudioHelper({ textToRead, locale = 'en' }: AudioHelperProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const isSpanish = locale === 'es';
  const isTurkish = locale === 'tr';

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const handleTogglePlay = () => {
    if (!isSupported) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = isTurkish ? 'tr-TR' : isSpanish ? 'es-ES' : 'en-US';
    utterance.rate = 0.9; // Slightly slower for low health literacy comprehension

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleTogglePlay}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition shadow-sm ${
        isPlaying
          ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
          : 'bg-health-100 text-health-800 hover:bg-health-200 border border-health-300'
      }`}
      aria-label={
        isPlaying
          ? isTurkish ? 'Sesli okumayı durdur' : isSpanish ? 'Detener lectura en voz alta' : 'Stop reading aloud'
          : isTurkish ? 'Bu rehberi sesli dinle' : isSpanish ? 'Escuchar este artículo en voz alta' : 'Listen to this explainer aloud'
      }
    >
      {isPlaying ? (
        <>
          <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
          <span>{isTurkish ? 'Sesi Durdur' : isSpanish ? 'Detener Audio' : 'Stop Audio'}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isTurkish ? 'Sesli Dinle' : isSpanish ? 'Escuchar en Voz Alta' : 'Listen Aloud'}</span>
        </>
      )}
    </button>
  );
}
