/**
 * Daftar layanan di section "services".
 *
 * Tiap layanan MENUNJUK SLUG PROJECT, bukan path gambar. Sebelumnya path banner
 * ditulis langsung (`/works/absata/absata_banner.svg`), dan itu punya mode gagal
 * yang buruk: ganti nama slug atau file banner, dan kartu preview berubah jadi
 * kotak kosong tanpa satu pun error — halaman tetap build, tetap render, cuma
 * gambarnya hilang. Lewat slug, resolusinya terjadi di app/page.tsx dan slug
 * yang tak dikenal MENGGAGALKAN BUILD, bukan diam-diam lolos ke produksi.
 *
 * `alt` sengaja ditulis di sini, bukan diambil dari `work.banner.alt`: kalimat
 * alt milik project menjelaskan bannernya sebagai karya, sedangkan di sini
 * gambar yang sama dipakai untuk mengilustrasikan sebuah LAYANAN. Konteksnya
 * beda, jadi kalimatnya beda.
 */

export interface Service {
  label: string;
  /** Slug project yang jadi contoh layanan ini. Harus ada di lib/works.ts. */
  workSlug: string;
  alt: string;
}

export const SERVICES: readonly Service[] = [
  {
    label: 'iOS Development',
    workSlug: 'load-away',
    alt: 'Preview game iOS Load Away.',
  },
  {
    label: 'Cross-Platform Apps',
    workSlug: 'absata',
    alt: 'Preview aplikasi Flutter ABSATA di iOS dan Android.',
  },
  {
    label: 'AI Automation',
    workSlug: 'shopify-automation',
    alt: 'Preview pipeline otomasi produk Shopify.',
  },
];
