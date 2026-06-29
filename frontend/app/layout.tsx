import type { Metadata, Viewport } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/AppContext'
import UpdatePrompt from '@/components/UpdatePrompt'

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  weight: ['400', '500', '600', '700'],
})

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Nutrify — Nutrisi Personal Berbasis Budaya Indonesia',
  description: 'Rancang pola makan sehat dengan kecerdasan yang memahami bahan lokal, tradisi kuliner, dan kebutuhan gizi unikmu.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logorevisi.png', type: 'image/png' },
    ],
    apple: '/logorevisi.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1E1810',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning className={`${fraunces.variable} ${jakartaSans.variable}`}>
      <head>
        <link rel="icon" href="/logorevisi.png" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1E1810" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var APP_VERSION = '2.0.0';
              var storedVersion = localStorage.getItem('appVersion');
              if (storedVersion !== APP_VERSION) {
                console.log('App updated from', storedVersion, 'to', APP_VERSION);
                localStorage.removeItem('appSettings');
                localStorage.setItem('appVersion', APP_VERSION);
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    names.forEach(function(name) { caches.delete(name); });
                  });
                }
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    registrations.forEach(function(registration) { registration.unregister(); });
                  });
                }
              }
            })();
          `
        }} />
      </head>
      <body className={`${fraunces.variable} ${jakartaSans.variable} font-sans bg-background text-text-primary antialiased`}>
        <AppProvider>
          {children}
          <UpdatePrompt />
        </AppProvider>
      </body>
    </html>
  )
}
