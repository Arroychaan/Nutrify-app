import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/AppContext'
import UpdatePrompt from '@/components/UpdatePrompt'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Nutrify - Indonesian Personalized Nutrition',
  description: 'Aplikasi perencanaan nutrisi personal berbasis budaya Indonesia',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192x192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#24B47E',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#24B47E" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Version checker - increment this when deploying breaking changes
              var APP_VERSION = '2.2.0';
              var storedVersion = localStorage.getItem('appVersion');
              
              // If version mismatch, clear old data
              if (storedVersion !== APP_VERSION) {
                console.log('App updated from', storedVersion, 'to', APP_VERSION);
                // Clear potentially problematic cached data
                localStorage.removeItem('appSettings');
                // Keep token so user stays logged in
                localStorage.setItem('appVersion', APP_VERSION);
                
                // Clear service worker cache
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    names.forEach(function(name) {
                      caches.delete(name);
                    });
                  });
                }
                
                // Unregister service workers
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    registrations.forEach(function(registration) {
                      registration.unregister();
                    });
                  });
                }
              }
              
              // Apply theme
              try {
                var settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
                var theme = settings.theme || 'light';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
              } catch (e) {}
            })();
          `
        }} />
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <AppProvider>
          {children}
          <UpdatePrompt />
        </AppProvider>
      </body>
    </html>
  )
}

