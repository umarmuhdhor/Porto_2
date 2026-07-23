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
import { haloBanking } from '@/content/works/halo-banking';
import { terraAtlas } from '@/content/works/terra-atlas';
import { kopiKultur } from '@/content/works/kopi-kultur';

const WORKS: readonly Work[] = [haloBanking, terraAtlas, kopiKultur];

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

export type { Work, GalleryItem, GallerySpan, SummarySegment } from '@/content/works/types';
