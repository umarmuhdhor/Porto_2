/**
 * Sitemap (M7 §3.4). Homepage + tiap case study `/works/[slug]`.
 *
 * URL absolut butuh origin yang sama dengan metadataBase (app/layout.tsx):
 * NEXT_PUBLIC_SITE_URL di produksi, localhost saat dev.
 */

import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/works';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

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
    ...getAllSlugs().map((slug) => ({
      url: `${SITE_URL}/works/${slug}`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    })),
  ];
}
