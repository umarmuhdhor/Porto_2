/**
 * Sitemap (M7 §3.4). Homepage + tiap case study `/works/[slug]`.
 *
 * URL absolut butuh origin yang sama dengan metadataBase (app/layout.tsx) —
 * keduanya membaca lib/site-url.ts, yang gagal build kalau env-nya kosong di
 * produksi. Sitemap yang mendaftarkan localhost ke Google adalah persis
 * kegagalan senyap yang modul itu ada untuk mencegahnya.
 */

import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/works';
import { SITE_URL } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  // Statis penuh (SSG) → semua di-generate saat build; satu timestamp build cukup.
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      // Indeks project. Prioritasnya di antara homepage dan case study: ia
      // pintu masuk ke semuanya, tapi isinya ringkasan — halaman case
      // study-nya yang punya isi sebenarnya.
      url: `${SITE_URL}/works`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...getAllSlugs().map((slug) => ({
      url: `${SITE_URL}/works/${slug}`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    })),
  ];
}
