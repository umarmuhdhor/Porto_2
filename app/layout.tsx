import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { FrameLines } from '@/components/layout/FrameLines';
import { HonorsBadge } from '@/components/layout/HonorsBadge';
import { NavPill } from '@/components/layout/NavPill';

/**
 * Display face — Space Grotesk (OFL). Grotesk geometrik modern; pendekatan bebas
 * untuk Aeonik yang dipakai referensi pada nama hero raksasa. Body/system tetap
 * Geist (netral, enak dibaca). `display: swap` → teks tampil pakai fallback dulu,
 * tak ada FOIT.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

/**
 * Anti-adblock: di produksi, script + beacon analytics disajikan lewat path
 * domain sendiri yang di-rewrite di next.config.ts. Di dev, biarkan komponen
 * pakai default-nya (script debug, tanpa proxy) supaya tak ada 404 `/_vercel/*`.
 */
const PROXIED = process.env.NODE_ENV === 'production';
const ANALYTICS_PROPS = PROXIED ? { scriptSrc: '/_hb/a.js', endpoint: '/_hb/a' } : {};
const SPEED_INSIGHTS_PROPS = PROXIED ? { scriptSrc: '/_hb/s.js', endpoint: '/_hb/s/vitals' } : {};

/**
 * metadataBase wajib ada begitu ada halaman ber-OG image (M5): tanpa ini
 * Next tidak bisa mengubah path relatif `/works/[slug]/opengraph-image` jadi
 * URL absolut, dan crawler (WhatsApp/Twitter) mengabaikan og:image relatif.
 * Set NEXT_PUBLIC_SITE_URL di environment produksi.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const TITLE = 'Umar — Portfolio';
const DESCRIPTION =
  'Product, brand, and interface work by Umar — a visual & front-end designer building experiences that stay legible long after launch.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  // og:image homepage di-attach otomatis oleh app/opengraph-image.tsx.
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    siteName: TITLE,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${spaceGrotesk.variable} h-full overscroll-none antialiased`}
    >
      <body className="min-h-full">
        <SmoothScrollProvider>
          {children}
          <FrameLines />
          <HonorsBadge />
          <NavPill />
        </SmoothScrollProvider>
        <Analytics {...ANALYTICS_PROPS} />
        <SpeedInsights {...SPEED_INSIGHTS_PROPS} />
      </body>
    </html>
  );
}
