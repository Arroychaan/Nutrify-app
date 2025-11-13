import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nutrify - Indonesian Personalized Nutrition',
  description: 'Aplikasi perencanaan nutrisi personal berbasis budaya Indonesia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
