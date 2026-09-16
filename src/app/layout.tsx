import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Community Health Bridge | Salud Comunitaria',
  description:
    'Multilingual, plain-language health explainers and free clinic directory for underserved communities. Adapted directly from WHO and CDC guidelines.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HealthBridge',
  },
  openGraph: {
    type: 'website',
    title: 'Community Health Bridge | Salud Comunitaria',
    description: 'Trusted, doctor-reviewed health literacy explainers in plain language.',
    siteName: 'Community Health Bridge',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0284c7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased selection:bg-health-200 selection:text-health-900">
        {children}

        {/* PWA Service Worker Registration */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('HealthBridge ServiceWorker registration successful with scope: ', registration.scope);
                  },
                  function(err) {
                    console.log('HealthBridge ServiceWorker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
