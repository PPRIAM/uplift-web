import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Outfit } from 'next/font/google';
import './globals.css';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SolarSpine from '@/components/SolarSpine';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const theBoldFont = localFont({
  src: '../public/fonts/theboldfont.woff',
  variable: '--font-display',
  display: 'swap',
});

const geoForm = localFont({
  src: [
    {
      path: '../public/fonts/geoform-regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/geoform-bold.woff',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-heading',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ayibuzz-media.com'),
  title: {
    default: 'Ayibuzz Media | Leve ansanm, Briye ansanm',
    template: '%s | Ayibuzz Media'
  },
  description: "Ayibuzz Media — la plateforme media de la nouvelle génération haïtienne. Découvre les voix, les histoires et les événements qui façonnent Haïti.",
  keywords: ['Ayibuzz Media', 'média haïtien', 'jeunesse haïtienne', 'culture Haïti', 'événements Haïti', 'contenu haïtien', 'créateurs haïtiens', 'Ayibuzz', 'Gonaïves'],
  authors: [{ name: 'Ayibuzz Media' }],
  creator: 'Ayibuzz Media',
  publisher: 'Ayibuzz Media',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Ayibuzz Media | Leve ansanm, Briye ansanm',
    description: "La scène digitale d'Haïti: la prochaine génération crée, partage et amplifie les histoires qui façonnent notre avenir.",
    url: 'https://ayibuzz-media.com',
    siteName: 'Ayibuzz Media',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ayibuzz Media. Leve ansanm, Briye ansanm.',
      },
    ],
    locale: 'fr_HT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ayibuzz Media | Leve ansanm, Briye ansanm',
    description: "La scène digitale d'Haïti. Découvre les voix, les histoires et les événements qui façonnent notre avenir.",
    images: ['/images/og-image.jpg'],
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${theBoldFont.variable} ${geoForm.variable} ${outfit.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Ayibuzz Media',
              description: "La plateforme media de la nouvelle génération haïtienne. Leve ansanm, Briye ansanm.",
              url: 'https://ayibuzz-media.com',
              logo: 'https://ayibuzz-media.com/logo-ayibuzz.png',
              sameAs: [
                'https://www.facebook.com/profile.php?id=61572866728775',
                'https://www.instagram.com/ayibuzz',
                'https://www.tiktok.com/@ayibuzz'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'contact@ayibuzz.com',
                contactType: 'customer service',
              },
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Gonaïves',
                addressRegion: 'Artibonite',
                addressCountry: 'HT'
              }
            })
          }}
        />
        <Navbar />
        <SolarSpine />
        <main className="min-h-[100dvh] pt-[72px]">
          {children}
        </main>
        <Footer />
        {process.env.NODE_ENV === 'production' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
