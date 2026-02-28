import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Faktura – Rechnungen für Selbstständige',
  description: 'Rechnungen erstellen, verwalten und schneller bezahlt werden.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.variable}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
