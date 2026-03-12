import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import CookieBanner from '@/components/CookieBanner'

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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Faktura",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: "https://faktura.app",
              description:
                "Rechnungsprogramm für Freelancer und Selbstständige. Professionelle Rechnungen erstellen, per E-Mail versenden und schneller bezahlt werden.",
              offers: [
                {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "EUR",
                  name: "Free",
                },
                {
                  "@type": "Offer",
                  price: "9",
                  priceCurrency: "EUR",
                  name: "Starter",
                },
                {
                  "@type": "Offer",
                  price: "19",
                  priceCurrency: "EUR",
                  name: "Professional",
                },
                {
                  "@type": "Offer",
                  price: "49",
                  priceCurrency: "EUR",
                  name: "Business",
                },
              ],
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "120",
              },
            }),
          }}
        />
      </head>
      <body className={inter.variable}>
        {children}
        <Toaster position="top-right" richColors />
        <CookieBanner />
      </body>
    </html>
  )
}
