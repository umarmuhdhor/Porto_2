/**
 * Shape data case study (M5 §3.1).
 *
 * KENAPA DATA DIPISAH DARI JSX (PRD G3 — project baru < 1 hari): template
 * `/works/[slug]` tidak boleh tahu apa-apa soal isi project. Menambah project =
 * tambah satu file di folder ini + daftarkan di lib/works.ts, tanpa menyentuh
 * satu baris pun di app/works/[slug]/page.tsx.
 */

/**
 * Lebar slot di bento gallery. Rasio TIDAK ikut di data — dikunci per span di
 * components/sections/BentoGallery.tsx supaya grid tetap rapi lintas project
 * (M5 §5: konsistensi aspect ratio).
 */
export type GallerySpan = 'full' | 'half';

export interface GalleryItem {
  /** Path absolut dari /public, mis. `/works/halo-banking/halo-banking_screens.svg`. */
  src: string;
  /** Alt deskriptif — bukan "gambar project". Dipakai screen reader (PRD §11). */
  alt: string;
  span: GallerySpan;
}

/**
 * Satu potongan paragraf ringkasan. Ringkasan disimpan sebagai deret segmen,
 * bukan string HTML, supaya penekanan frasa kunci (DESIGN §4.6) tetap data —
 * tidak ada `dangerouslySetInnerHTML` dan tidak ada markup di file konten.
 */
export interface SummarySegment {
  text: string;
  /** true → dirender <strong>. */
  strong?: boolean;
}

export interface Work {
  slug: string;
  title: string;
  /** Logo mark SVG di /public. Dirender di header, di samping judul. */
  logo: string;
  /** Mis. "PRODUCT DESIGN | VISUAL BRANDING" — ditampilkan apa adanya. */
  category: string;
  year: string;
  /** Dipakai untuk <meta name="description"> — plain text, tanpa penekanan. */
  description: string;
  summary: SummarySegment[];
  services: string[];
  challenge: string;
  role: string;
  /** Gambar lebar pembuka gallery, selalu full-bleed. */
  banner: Omit<GalleryItem, 'span'>;
  gallery: GalleryItem[];
  /**
   * Warna aksen khas project. Dipakai HANYA di OG image
   * (app/works/[slug]/opengraph-image.tsx) supaya tiap link share terlihat
   * berbeda — inti dari M5 §3.5 / pitfall DESIGN §10 #1. Halaman itu sendiri
   * tetap memakai token global agar situs terasa satu sistem.
   */
  ogAccent: string;
}
