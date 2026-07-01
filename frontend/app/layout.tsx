import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Fraunces, Playfair_Display, Caveat } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/AppContext'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import UpdatePrompt from '@/components/UpdatePrompt'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-editorial',
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-handwritten',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'AI Ate Indonesia — Sehat dengan Cita Rasa Nusantara',
  description: 'Program diet berbasis pangan lokal Indonesia — lebih terjangkau, lebih lezat, lebih sehat. Didukung oleh AI.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/brand/logogram-32px.ico', sizes: '32x32' },
      { url: '/brand/logogram192px.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/brand/logogram192px.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning className={`${fraunces.variable} ${plusJakartaSans.variable} ${playfair.variable} ${caveat.variable}`}>
      <head>
        <link rel="icon" href="/assets/brand/logogram-32px.ico" sizes="any" />
        <link rel="icon" href="/assets/brand/logogram32px.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/brand/logogram192px.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${fraunces.variable} ${plusJakartaSans.variable} ${playfair.variable} ${caveat.variable} font-body bg-paper-light text-text-primary antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppProvider>
            {children}
            <UpdatePrompt />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
