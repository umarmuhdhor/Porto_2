/**
 * Origin situs — SATU sumber kebenaran untuk setiap URL absolut.
 *
 * Sebelum file ini ada, `app/layout.tsx`, `app/sitemap.ts`, dan `app/robots.ts`
 * masing-masing menulis `process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'`.
 * Tiga salinan fallback yang sama berarti env yang lupa diset di Vercel GAGAL
 * SENYAP: build lulus, situs tampil normal, dan yang rusak baru terlihat dari
 * luar — sitemap mendaftarkan URL localhost ke Google, `metadataBase` membuat
 * setiap `og:image` menunjuk mesin yang salah, dan preview tautan di WhatsApp/
 * LinkedIn/Slack tampil kosong. Tidak ada satu pun yang gagal untuk memberi tahu.
 *
 * Karena itu resolusinya dipusatkan di sini dan `throw` saat produksi:
 * kegagalan build lima detik setelah deploy jauh lebih murah daripada minggu-
 * minggu og:image rusak yang tak seorang pun perhatikan.
 *
 * SENGAJA TIDAK jatuh ke `VERCEL_URL`: env itu berisi URL unik per-deploy
 * (`porto2-git-abc123-....vercel.app`), dan memakainya untuk canonical/sitemap
 * cuma menukar satu nilai salah yang senyap dengan yang lain — justru masalah
 * yang modul ini ada untuk membunuhnya.
 *
 * Import HANYA dari server (layout/sitemap/robots). `throw` di level modul
 * dalam bundle client akan merusak halaman, bukan build.
 */

const DEV_FALLBACK = 'http://localhost:3000';

/**
 * Apakah ini build yang benar-benar akan DISAJIKAN ke publik?
 *
 * `NODE_ENV === 'production'` saja tidak cukup untuk membedakannya: `pnpm build`
 * di laptop juga produksi, dan build lokal HARUS tetap boleh jalan. `VERCEL`
 * hanya ada di mesin build Vercel, jadi kombinasi keduanya yang menandai
 * "deploy sungguhan".
 */
const IS_DEPLOYED = process.env.NODE_ENV === 'production' && Boolean(process.env.VERCEL);

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]']);

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'NEXT_PUBLIC_SITE_URL belum diset. Build produksi butuh origin absolut untuk ' +
          'metadataBase, sitemap, robots, dan semua og:image. Set di Vercel → Project ' +
          'Settings → Environment Variables (lihat .env.example).',
      );
    }
    return DEV_FALLBACK;
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL bukan URL yang sah: "${raw}". Contoh yang benar: https://contoh.com`,
    );
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL harus http/https, bukan "${parsed.protocol}" (nilai: "${raw}").`,
    );
  }

  /**
   * Env yang TERISI localhost lolos dari pemeriksaan "kosong" di atas, dan itu
   * bukan kasus teoretis: `.env.local` di repo ini memang berisi
   * `http://localhost:3000`. Env lokal tidak ikut ke Vercel, tapi nilai yang
   * salah-tempel di dashboard akan lolos sama diam-diamnya — dan hasilnya
   * persis kerusakan yang modul ini ada untuk mencegahnya, cuma lewat pintu
   * yang berbeda. Hanya digagalkan saat deploy sungguhan, jadi `pnpm build`
   * di laptop tetap jalan.
   */
  if (IS_DEPLOYED && LOCAL_HOSTS.has(parsed.hostname)) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL menunjuk localhost ("${raw}") di deploy Vercel. Sitemap, ` +
        'robots, dan setiap og:image akan menyiarkan URL yang tak bisa dibuka siapa pun. ' +
        'Set ke domain publik situs di Project Settings → Environment Variables.',
    );
  }

  // `.origin` menormalkan sekaligus: slash di akhir hilang, path/query yang
  // tak sengaja ikut ter-copy dibuang. Tanpa ini `${SITE_URL}/works/x` bisa
  // jadi `https://contoh.com//works/x` — dua URL berbeda bagi crawler.
  return parsed.origin;
}

export const SITE_URL = resolveSiteUrl();
