/**
 * Structured data schema.org — dibangun dari `content/site.ts`, bukan ditulis
 * ulang sebagai literal JSON.
 *
 * Kenapa ini ada: `<meta>` memberi tahu mesin pencari APA judul halaman, tapi
 * tidak pernah menyatakan bahwa "Umar Muhdhor" adalah SEORANG ORANG yang
 * berprofesi iOS developer dan yang profil GitHub/LinkedIn/Instagram-nya adalah
 * akun-akun itu. `sameAs` yang mengikat nama → profil sosial inilah yang dipakai
 * mesin pencari untuk menyatukan entitas yang tersebar; tanpa itu setiap profil
 * berdiri sendiri sebagai halaman acak yang kebetulan bernama sama.
 *
 * Datanya sudah lengkap di SITE — file ini hanya memetakannya, jadi mengganti
 * handle atau email tetap cukup di satu tempat.
 */

import { SITE } from '@/content/site';

/**
 * `location` di SITE ditulis "Bali, Indonesia" — satu string untuk dibaca
 * manusia. schema.org memisahkan kota dan negara, jadi dipecah di sini alih-alih
 * menambah dua field baru ke SITE yang tak dipakai komponen mana pun.
 */
const [LOCALITY, COUNTRY] = SITE.location.split(',').map((part) => part.trim());

export function personJsonLd(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    // `@id` memberi node ini identitas stabil, jadi halaman lain (case study)
    // bisa menunjuk ke orang yang sama alih-alih mendeklarasikan Person kedua.
    '@id': `${siteUrl}/#person`,
    name: SITE.name,
    url: siteUrl,
    jobTitle: SITE.role,
    email: SITE.mailto,
    description: SITE.seo.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: LOCALITY,
      addressCountry: COUNTRY,
    },
    // Apple Developer Academy adalah pembeda terkuat yang ada dan sudah disebut
    // di deskripsi SEO; di sini ia jadi relasi yang bisa dibaca mesin, bukan
    // hanya kata di dalam kalimat.
    affiliation: {
      '@type': 'Organization',
      name: 'Apple Developer Academy',
    },
    knowsAbout: ['iOS Development', 'Swift', 'SwiftUI', 'Flutter', 'Mobile App Development'],
    sameAs: [SITE.github, SITE.linkedin, SITE.instagram],
  };
}
