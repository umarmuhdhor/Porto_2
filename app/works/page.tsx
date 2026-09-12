/**
 * Indeks `/works` — daftar seluruh case study di satu URL sendiri.
 *
 * KENAPA ADA, padahal homepage sudah punya grid project: grid itu tinggal di
 * dalam koreografi sticky-stacking dan hanya bisa ditunjuk sebagai anchor
 * (`/#projects`). Anchor tidak bisa dibagikan sebagai "ini kerjaan saya" tanpa
 * ikut membawa seluruh scroll di atasnya, tidak punya title/description
 * sendiri di hasil pencarian, dan mengembalikan pengunjung ke tengah animasi
 * saat mereka menekan tombol back dari satu case study.
 *
 * SENGAJA BUKAN SALINAN grid homepage. Grid itu berbasis hover: logo di tengah
 * sel, cover muncul saat kursor masuk. Bagus sebagai kejadian visual di tengah
 * scroll, tapi sebagai indeks ia menyembunyikan hal yang justru dicari orang di
 * halaman indeks — judul yang bisa dibaca, satu kalimat isinya, dan tahunnya.
 * Di sini semuanya terlihat tanpa hover sama sekali (dan karenanya juga di
 * layar sentuh, tempat hover tidak pernah terjadi).
 *
 * Halaman ini server component; SATU-SATUNYA bagian klien adalah daftar +
 * filter disiplin (components/works/WorksExplorer.tsx). Datanya tetap di-load
 * di sini dan diserahkan sebagai baris siap render — metadata, heading, dan
 * navigasi baliknya tidak ikut jadi JS yang harus diunduh.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllEntries, hasCaseStudy } from '@/lib/works';
import { SITE } from '@/content/site';
import { WorksExplorer, type WorkRow } from '@/components/works/WorksExplorer';

const TITLE = 'Works';
const DESCRIPTION = `Case studies from ${SITE.name} — mobile and iOS development work, each one written up end to end: the problem, the role, the approach, and what shipped.`;

export const metadata: Metadata = {
  title: `${TITLE} — ${SITE.name}`,
  description: DESCRIPTION,
  alternates: { canonical: '/works' },
  openGraph: {
    type: 'website',
    title: `${TITLE} — ${SITE.name}`,
    description: DESCRIPTION,
    url: '/works',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} — ${SITE.name}`,
    description: DESCRIPTION,
  },
};

/** Label eyebrow — sama dengan yang dipakai template case study. */
const LABEL = 'font-system text-muted text-xs tracking-[0.3em] uppercase';

export default function WorksIndexPage() {
  /*
   * `getAllEntries()` — case study DAN entri yang berhenti sebagai kartu.
   * Bentuk URL case study cuma diketahui di sini: `href: null` yang dikirim
   * ke WorksExplorer adalah satu-satunya cara komponen itu tahu sebuah baris
   * tidak menuju ke mana-mana, jadi ia tidak perlu tahu pola `/works/{slug}`
   * sama sekali.
   */
  const works: WorkRow[] = getAllEntries().map((work) => ({
    slug: work.slug,
    title: work.title,
    description: work.description,
    category: work.category,
    year: work.year,
    disciplines: work.disciplines,
    banner: work.banner.src,
    href: hasCaseStudy(work.slug) ? `/works/${work.slug}` : null,
    links: work.links,
  }));

  return (
    <main
      id="main-content"
      tabIndex={-1}
      style={{ paddingInline: 'var(--frame-inset)' }}
      className="bg-cream text-ink relative min-h-svh pt-28 pb-28 focus:outline-none md:pt-36"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        {/* Eyebrow ini SENGAJA bukan jumlah project: jumlahnya sudah dicetak
            tepat di atas daftar oleh WorksExplorer dan ikut berubah saat
            difilter. Dua angka di satu halaman yang berbunyi "15 projects"
            dan "1 project" sekaligus terbaca seperti salah satunya salah. */}
        <p className={LABEL}>Project index</p>

        <h1 className="font-display mt-5 text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.92] font-bold tracking-tight uppercase">
          {TITLE}
        </h1>

        <p className="font-body text-ink/70 mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
          Mobile and iOS development work, built end to end — plus the AI automation, web platform,
          and teaching work that sits alongside it. Filter by discipline, or open any entry with a
          write-up: the problem it started from, what my role actually was, and what shipped. The
          last few are coursework and early client work, listed for the record rather than written
          up.
        </p>

        {/* Chip filter + daftarnya hidup di satu komponen: jumlah di tiap chip
            dihitung dari baris yang sama yang dirender di bawahnya, jadi angka
            dan isi daftar tidak mungkin berbeda. */}
        <WorksExplorer works={works} />

        <p className="font-system text-muted mt-14 text-sm">
          <Link
            href="/"
            className="focus-visible:outline-accent hover:text-ink rounded-sm underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
