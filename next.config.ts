import type { NextConfig } from 'next';
import path from 'node:path';

/**
 * Anti-adblock analytics proxy (M7 §3.5 / PRD §10).
 *
 * Vercel Web Analytics & Speed Insights normally load their script from
 * `/_vercel/insights/*` dan `/_vercel/speed-insights/*`. Path itu ada di daftar
 * filter adblocker populer (EasyPrivacy), jadi beacon-nya diblok dan angka
 * kunjungan bocor. Solusinya menyajikan script + endpoint lewat path domain
 * sendiri yang namanya netral ("_hb" = tanpa kata insights/analytics/vitals),
 * lalu me-rewrite path itu ke sumber aslinya:
 *   - script  → CDN publik Vercel (host va.vercel-scripts.com)
 *   - beacon  → route platform internal `/_vercel/*` (di-ingest saat runtime
 *     produksi di Vercel; rewrite relatif masuk lagi ke routing edge).
 *
 * Path custom di-set sebagai `scriptSrc`/`endpoint` di komponen (app/layout.tsx)
 * dan HANYA di produksi — di dev, komponen memakai script debug bawaan dan tak
 * ada `/_vercel/*` yang bisa dilayani, jadi tidak ada 404 di console lokal.
 */
const ANALYTICS_REWRITES: NonNullable<NextConfig['rewrites']> = async () => [
  // Web Analytics: script + beacon (script menambahkan /view, /event ke endpoint).
  { source: '/_hb/a.js', destination: 'https://va.vercel-scripts.com/v1/script.js' },
  { source: '/_hb/a/:path*', destination: '/_vercel/insights/:path*' },
  // Speed Insights: script + beacon vitals (endpoint dipakai apa adanya).
  { source: '/_hb/s.js', destination: 'https://va.vercel-scripts.com/v1/speed-insights/script.js' },
  { source: '/_hb/s/:path*', destination: '/_vercel/speed-insights/:path*' },
];

const nextConfig: NextConfig = {
  // Pin workspace root ke folder project ini. Tanpa ini Next salah-deteksi root
  // (ada lockfile lain di ~/) dan memicu warning saat build.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Rewrites proxy hanya diaktifkan di produksi (lihat catatan di atas).
  ...(process.env.NODE_ENV === 'production' ? { rewrites: ANALYTICS_REWRITES } : {}),

  images: {
    // Aset case study saat ini SVG yang kita generate sendiri
    // (scripts/generate-work-placeholders.mjs). next/image menolak melayani SVG
    // tanpa flag ini karena SVG bisa memuat script. Dua setelan di bawahnya
    // yang membuatnya aman: response di-sandbox dan script dimatikan, jadi
    // meski nanti ada SVG dari sumber lain ia tidak bisa mengeksekusi apa pun.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
