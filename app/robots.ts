/**
 * robots.txt (M7 §3.4). Izinkan semua crawler; tunjuk ke sitemap.
 *
 * `/_hb/` (proxy analytics) & `/_vercel/` di-disallow: bukan konten, tak perlu
 * di-crawl, dan menutup path itu dari indeks pencarian.
 */

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/_hb/', '/_vercel/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
