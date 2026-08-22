/**
 * Loader data case study (M5 §3.1).
 *
 * Registry-nya sengaja eksplisit (import + array), bukan baca folder saat
 * runtime: file konten jadi ikut type-check dan bundler tahu persis apa yang
 * dipakai. Urutan array = urutan tampil di homepage & urutan nav prev/next.
 *
 * Menambah project: buat content/works/{slug}.ts, import, sisipkan di WORKS.
 */

import type { Work } from '@/content/works/types';
import { loadAway } from '@/content/works/load-away';
import { popshot } from '@/content/works/popshot';
import { shopifyAutomation } from '@/content/works/shopify-automation';
import { absata } from '@/content/works/absata';
import { higgzAcademia } from '@/content/works/higgz-academia';
import { mdpTeaching } from '@/content/works/mdp-teaching';

/**
 * Urutan = urutan tampil. Tiga teratas adalah karya terbaru dan paling dekat
 * dengan posisi yang dituju (iOS/Swift), tiga berikutnya riwayat kerja dari CV.
 * Jumlahnya genap supaya grid dua kolom di ProjectIndex tidak menyisakan sel
 * kosong.
 */
const WORKS: readonly Work[] = [
  loadAway,
  popshot,
  shopifyAutomation,
  absata,
  higgzAcademia,
  mdpTeaching,
];

export function getAllWorks(): readonly Work[] {
  return WORKS;
}

export function getAllSlugs(): string[] {
  return WORKS.map((work) => work.slug);
}

/** undefined kalau slug tak dikenal — pemanggil yang memutuskan notFound(). */
export function getWorkBySlug(slug: string): Work | undefined {
  return WORKS.find((work) => work.slug === slug);
}

export type {
  Work,
  GalleryItem,
  GallerySpan,
  SummarySegment,
  WorkLink,
} from '@/content/works/types';
