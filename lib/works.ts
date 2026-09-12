/**
 * Loader data case study (M5 §3.1).
 *
 * Registry-nya sengaja eksplisit (import + array), bukan baca folder saat
 * runtime: file konten jadi ikut type-check dan bundler tahu persis apa yang
 * dipakai. Urutan array = urutan tampil di homepage & urutan nav prev/next.
 *
 * DUA REGISTRY, dan bedanya nyata:
 *   - `WORKS`      → case study penuh; masing-masing punya `/works/{slug}`.
 *   - `WORK_CARDS` → entri yang cuma jadi baris di indeks, tanpa halaman.
 * Alasan pemisahannya ada di komentar `WorkCard` (content/works/types.ts) —
 * ringkasnya, sebagian project memang tidak punya cukup fakta untuk mengisi
 * `challenge`/`approach`/`outcomes` tanpa mengarang.
 *
 * Menambah case study: buat content/works/{slug}.ts, import, sisipkan di WORKS.
 * Menambah kartu: satu objek di content/works/cards.ts, tidak ada import baru.
 */

import type { DisciplineId, Work, WorkCard } from '@/content/works/types';
import { loadAway } from '@/content/works/load-away';
import { popshot } from '@/content/works/popshot';
import { hisplora } from '@/content/works/hisplora';
import { shopifyAutomation } from '@/content/works/shopify-automation';
import { regulens } from '@/content/works/regulens';
import { briefly } from '@/content/works/briefly';
import { logicAndCode } from '@/content/works/logic-and-code';
import { absata } from '@/content/works/absata';
import { higgzAcademia } from '@/content/works/higgz-academia';
import { mdpTeaching } from '@/content/works/mdp-teaching';
import { WORK_CARDS } from '@/content/works/cards';

/**
 * Urutan = urutan tampil. Empat teratas adalah karya terbaru dan paling dekat
 * dengan posisi yang dituju (iOS/Swift), lalu kerja AI automation & web, lalu
 * riwayat kerja dari CV. Jumlahnya genap supaya grid dua kolom di ProjectIndex
 * tidak menyisakan sel kosong.
 */
const WORKS: readonly Work[] = [
  loadAway,
  popshot,
  hisplora,
  regulens,
  shopifyAutomation,
  briefly,
  logicAndCode,
  absata,
  higgzAcademia,
  mdpTeaching,
];

/**
 * Semua yang tampil di indeks `/works` — case study dulu, lalu entri yang
 * berhenti sebagai kartu (content/works/cards.ts).
 *
 * KENAPA DUA REGISTRY DAN BUKAN SATU ARRAY DENGAN FLAG: `Work` dan `WorkCard`
 * beda TIPE, bukan beda nilai satu field. Satu array bertipe `WorkCard` dengan
 * `isCaseStudy: boolean` akan memaksa setiap pembaca `work.challenge`
 * mengecek flag itu dulu — dan yang lupa mengecek tidak akan gagal build,
 * cuma merender `undefined`. Dipisah begini, `getAllWorks()` mustahil
 * mengembalikan entri tanpa case study, dan itu dijamin compiler.
 */
const ENTRIES: readonly WorkCard[] = [...WORKS, ...WORK_CARDS];

export function getAllWorks(): readonly Work[] {
  return WORKS;
}

export function getAllSlugs(): string[] {
  return WORKS.map((work) => work.slug);
}

/**
 * Case study + kartu, dalam urutan tampil indeks. Dipakai `/works`.
 *
 * Homepage SENGAJA tidak memakai ini: tiap sel di ProjectIndex adalah link ke
 * halaman case study, dan sel yang tidak menuju ke mana-mana di tengah grid
 * terbaca sebagai link rusak, bukan sebagai keputusan.
 */
export function getAllEntries(): readonly WorkCard[] {
  return ENTRIES;
}

/** true kalau slug ini punya halaman `/works/[slug]` sendiri. */
export function hasCaseStudy(slug: string): boolean {
  return WORKS.some((work) => work.slug === slug);
}

/**
 * Project yang berdiri di disiplin tertentu, urutannya sama dengan registry.
 * Dipakai halaman `/works` untuk render awal di server — filter di klien
 * memakai predikat yang sama, jadi hasil pertama dan hasil setelah klik
 * mustahil berbeda.
 */
export function getWorksByDiscipline(id: DisciplineId): readonly Work[] {
  return WORKS.filter((work) => work.disciplines.includes(id));
}

/** Versi yang ikut menghitung kartu — angka di chip filter `/works`. */
export function getEntriesByDiscipline(id: DisciplineId): readonly WorkCard[] {
  return ENTRIES.filter((entry) => entry.disciplines.includes(id));
}

/** undefined kalau slug tak dikenal — pemanggil yang memutuskan notFound(). */
export function getWorkBySlug(slug: string): Work | undefined {
  return WORKS.find((work) => work.slug === slug);
}

export { DISCIPLINES, getDiscipline, isDisciplineId } from '@/content/works/disciplines';

export type {
  Discipline,
  DisciplineId,
  Work,
  WorkCard,
  GalleryItem,
  GallerySpan,
  SummarySegment,
  WorkLink,
} from '@/content/works/types';
