import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { SITE } from '@/content/site';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { FrameLines } from '@/components/layout/FrameLines';
import { HonorsBadge } from '@/components/layout/HonorsBadge';
import { NavPill } from '@/components/layout/NavPill';
import { GuestbookDock } from '@/components/layout/GuestbookDock';
import { AssistantDock } from '@/components/layout/AssistantDock';
import { LiveCursors } from '@/components/layout/LiveCursors';

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

const TITLE = SITE.seo.title;
const DESCRIPTION = SITE.seo.description;

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
          {/*
           * Kedua dock berbagi SATU baris di pojok kanan atas, bukan
           * memposisikan pilnya sendiri-sendiri.
           *
           * Kenapa satu wadah flex dan bukan sekadar menyetel `right` masing-
           * masing: lebar pil guestbook berubah-ubah — labelnya hilang di bawah
           * `sm` dan lencana jumlah tamu baru muncul setelah datanya masuk.
           * Offset `right` apa pun yang dihitung manual akan meleset begitu
           * salah satu dari dua hal itu berubah. Flex + `gap` menjaga jarak
           * keduanya tetap sama tanpa ada angka yang perlu disetel ulang.
           *
           * `pointer-events-none` di wadah, `auto` di tombolnya: kotak baris ini
           * membentang selebar kedua pil, dan tanpa itu celah di antaranya ikut
           * mencegat klik ke halaman di belakangnya.
           *
           * Panel kedua dock tetap `fixed` terhadap viewport — wadah `fixed`
           * tanpa transform bukan containing block, jadi posisinya tak berubah.
           */}
          <div
            className="pointer-events-none fixed top-5 flex items-center gap-3 [&>*]:pointer-events-auto"
            style={{ right: 'var(--frame-inset)', zIndex: 'var(--z-chat)' }}
          >
            <AssistantDock />
            <GuestbookDock />
          </div>
          <LiveCursors />
        </SmoothScrollProvider>
        <Analytics {...ANALYTICS_PROPS} />
        <SpeedInsights {...SPEED_INSIGHTS_PROPS} />
      </body>
    </html>
  );
}
