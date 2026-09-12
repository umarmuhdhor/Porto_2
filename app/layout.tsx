import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { SITE } from '@/content/site';
import { SITE_URL } from '@/lib/site-url';
import { FONT_VARS } from '@/lib/fonts';
import { personJsonLd } from '@/lib/json-ld';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { HonorsBadge } from '@/components/layout/HonorsBadge';
import { NavPill } from '@/components/layout/NavPill';
import { GuestbookDock } from '@/components/layout/GuestbookDock';
import { AssistantDock } from '@/components/layout/AssistantDock';
import { LiveCursors } from '@/components/layout/LiveCursors';

/**
 * Anti-adblock: di produksi, script + beacon analytics disajikan lewat path
 * domain sendiri yang di-rewrite di next.config.ts. Di dev, biarkan komponen
 * pakai default-nya (script debug, tanpa proxy) supaya tak ada 404 `/_vercel/*`.
 */
const PROXIED = process.env.NODE_ENV === 'production';
const ANALYTICS_PROPS = PROXIED ? { scriptSrc: '/_hb/a.js', endpoint: '/_hb/a' } : {};
const SPEED_INSIGHTS_PROPS = PROXIED ? { scriptSrc: '/_hb/s.js', endpoint: '/_hb/s/vitals' } : {};

const TITLE = SITE.seo.title;
const DESCRIPTION = SITE.seo.description;

/**
 * metadataBase wajib ada begitu ada halaman ber-OG image (M5): tanpa ini Next
 * tidak bisa mengubah path relatif `/works/[slug]/opengraph-image` jadi URL
 * absolut, dan crawler (WhatsApp/Twitter) mengabaikan og:image relatif.
 * Origin-nya diresolusi di lib/site-url.ts — lihat catatan di sana soal kenapa
 * ia gagal build alih-alih jatuh ke localhost.
 */
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
    <html lang="en" className={`${FONT_VARS} h-full overscroll-none antialiased`}>
      <body className="min-h-full">
        {/*
         * JSON-LD Person. Ditaruh di <body>, bukan <head>: Google membaca
         * keduanya, dan `dangerouslySetInnerHTML` di dalam <head> yang dikelola
         * Next lebih rapuh terhadap urutan streaming.
         *
         * `dangerouslySetInnerHTML` di sini AMAN dan memang satu-satunya cara —
         * isinya kita sendiri yang bangun dari content/site.ts (nol input user),
         * dan React akan meng-escape `<` jadi `&lt;` kalau ditulis sebagai anak
         * biasa, yang membuat JSON-nya tak bisa di-parse crawler.
         */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(SITE_URL)) }}
        />

        {/*
         * Skip link — pintu masuk keyboard.
         *
         * Halaman ini scroll panjang dengan empat chrome `fixed` (NavPill,
         * AssistantDock, GuestbookDock, HonorsBadge). Tanpa ini user keyboard
         * harus men-Tab melewati semuanya sebelum menyentuh konten pertama.
         *
         * Sengaja anchor polos tanpa JS: ia harus jalan sebelum hidrasi, dan
         * justru user keyboard yang paling mungkin men-Tab detik pertama.
         * `<main>` ada di puncak dokumen di kedua rute, jadi lompatannya nyaris
         * tanpa scroll dan tak berkelahi dengan Lenis.
         *
         * Disembunyikan dengan DIGESER keluar layar, bukan `sr-only` +
         * `focus:not-sr-only`: utility `not-sr-only` ikut menyetel `padding: 0`,
         * dan karena ia bervarian ia menang atas `px-5 py-3` — pil-nya muncul
         * gepeng tanpa padding sama sekali (terverifikasi di browser). Digeser
         * `-translate-y` menjaga seluruh gayanya utuh, dan `fixed` membuatnya
         * tak pernah menyentuh alur layout dalam keadaan mana pun.
         *
         * Muncul DI ATAS semua chrome (z-cursor = lapisan tertinggi): link yang
         * muncul di bawah dock adalah link yang tidak ada.
         */}
        <a
          href="#main-content"
          className="bg-ink text-cream focus:outline-accent fixed top-5 left-5 -translate-y-[200%] rounded-[var(--radius-pill)] px-5 py-3 text-sm font-medium transition-transform duration-[var(--dur-base)] ease-[var(--ease-smooth)] focus:translate-y-0 focus:outline-2 focus:outline-offset-2"
          style={{ zIndex: 'var(--z-cursor)' }}
        >
          Skip to content
        </a>

        <SmoothScrollProvider>
          {children}
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
