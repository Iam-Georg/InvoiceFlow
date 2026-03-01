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
  title: {
    default: "Faktura – Rechnungen für Selbstständige",
    template: "%s | Faktura",
  },
  description:
    "Das Rechnungsprogramm für Freelancer und Selbstständige. Professionelle Rechnungen erstellen, per E-Mail versenden und schneller bezahlt werden.",
  keywords: [
    "Rechnungsprogramm",
    "Rechnungssoftware",
    "Freelancer",
    "Selbstständige",
    "Rechnung erstellen",
    "Rechnungsvorlage",
    "Online Rechnung",
    "PDF Rechnung",
  ],
  authors: [{ name: "Faktura" }],
  creator: "Faktura",
  metadataBase: new URL("https://faktura.app"),
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://faktura.app",
    siteName: "Faktura",
    title: "Faktura – Rechnungen für Selbstständige",
    description:
      "Professionelle Rechnungen erstellen, versenden und verwalten. Für Freelancer und Selbstständige.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Faktura – Rechnungen für Selbstständige",
    description: "Professionelle Rechnungen erstellen und schneller bezahlt werden.",
    creator: "@fakturaapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
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
