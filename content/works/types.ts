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
  /** Path absolut dari /public, mis. `/works/absata/absata_screens.svg`. */
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

/**
 * Satu baris di strip fakta bawah header (organisasi, periode, platform, dst).
 * Label sengaja bebas per project: project engineering butuh "Platform",
 * project mengajar butuh "Scope" — memaksa key yang sama bikin salah satunya
 * diisi asal.
 */
export interface WorkFact {
  label: string;
  value: string;
}

/** Satu langkah di bagian Approach — judul pendek + satu paragraf. */
export interface ApproachStep {
  title: string;
  body: string;
}

/**
 * Satu angka hasil. `metric` dirender besar, `label` menjelaskan angkanya.
 * Isi HANYA angka yang benar-benar ada di CV — bagian ini paling gampang
 * jadi klaim palsu kalau diisi kira-kira.
 */
export interface Outcome {
  metric: string;
  label: string;
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
  /** Strip fakta ringkas di bawah header. 3–4 item; lebih dari itu jadi tabel. */
  facts: WorkFact[];
  /**
   * Teknologi yang dipakai. OPSIONAL karena tidak semua project di sini project
   * engineering — mengarang stack untuk project mengajar lebih buruk daripada
   * tidak menampilkan barisnya sama sekali.
   */
  stack?: string[];
  challenge: string;
  role: string;
  /** Bagaimana challenge diselesaikan. 3 langkah — cukup untuk kasih bentuk. */
  approach: ApproachStep[];
  /** Hasil terukur. 3 angka; grid-nya memang dirancang untuk tiga kolom. */
  outcomes: Outcome[];
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
