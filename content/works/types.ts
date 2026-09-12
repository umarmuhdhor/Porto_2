import type { DisciplineId } from './disciplines';

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
 *
 * `portrait` ada untuk SATU alasan konkret: screenshot iPhone. Rasionya sekitar
 * 1:2, dan dipaksa masuk slot 3/2 dengan `object-cover` ia kehilangan dua
 * pertiga layarnya — yang tersisa cuma pita tengah tanpa nav bar maupun tombol
 * di bawah. Slot ini 3/4 dan gambarnya di-`object-contain`, jadi layar utuh.
 * Jangan dipakai untuk gambar lanskap: ia akan mengambang kecil di tengah kartu.
 */
export type GallerySpan = 'full' | 'half' | 'portrait';

export type { Discipline, DisciplineId } from './disciplines';

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

/**
 * Tautan keluar milik project — TestFlight, App Store, repo.
 *
 * OPSIONAL dan sengaja bukan field tetap seperti `testflight`/`github`: tiap
 * project punya kombinasi yang berbeda (satu punya beta publik tanpa repo, satu
 * punya repo tanpa build publik, sebagian klien tidak punya keduanya), dan key
 * kosong yang harus dicek satu per satu di template lebih buruk daripada daftar
 * yang panjangnya nol.
 */
export interface WorkLink {
  label: string;
  href: string;
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

/**
 * Entri yang muncul di indeks `/works` TAPI TIDAK punya halaman sendiri.
 *
 * KENAPA ADA: sebagian project di DATA-PORTO memang tipis — coursework, satu
 * job freelance pertama, sebuah konsep Challenge Zero. Datanya jujur: tidak ada
 * angka hasil, tidak ada screenshot, satu-dua kalimat ringkasan. Memaksa
 * masing-masing jadi `Work` berarti mengarang `challenge`, tiga langkah
 * `approach`, dan tiga `outcomes` untuk mengisi grid — persis klaim palsu yang
 * dilarang komentar `Outcome` di bawah. Menghapusnya juga salah: pekerjaan itu
 * benar-benar ada dan menjelaskan lompatan Flutter → Swift di riwayatnya.
 *
 * Jadi mereka tampil sebagai baris di indeks, dengan tautan keluar kalau repo-
 * nya publik, dan berhenti di situ. Naik jadi case study penuh = pindahkan ke
 * WORKS di lib/works.ts begitu datanya cukup.
 */
export interface WorkCard {
  slug: string;
  title: string;
  /** Mis. "PRODUCT DESIGN | VISUAL BRANDING" — ditampilkan apa adanya. */
  category: string;
  /**
   * Sumbu yang BISA DIFILTER pengunjung (App / Web / AI Automation / Teaching).
   * Terpisah dari `category` karena `category` kalimat bebas per project dan
   * karenanya tidak pernah cocok satu sama lain — lihat content/works/disciplines.ts.
   *
   * Array, dan sengaja: satu project boleh berdiri di dua disiplin sekaligus.
   * WAJIB berisi minimal satu (dijaga lib/works.test.ts) — nol berarti project
   * itu lenyap dari setiap filter kecuali "All".
   */
  disciplines: readonly DisciplineId[];
  year: string;
  /** Dipakai untuk <meta name="description"> — plain text, tanpa penekanan. */
  description: string;
  /**
   * Gambar wakil project. SATU field untuk dua tempat: thumbnail di indeks
   * `/works` + grid homepage, dan banner full-bleed pembuka gallery di halaman
   * case study. Dua field terpisah untuk gambar yang selalu sama hanya
   * menghasilkan satu di antaranya basi.
   */
  banner: Omit<GalleryItem, 'span'>;
  /**
   * Tautan ke build atau kode yang benar-benar bisa dibuka pengunjung. Kosongkan
   * (atau hilangkan) untuk project yang tidak punya — bukan alasan buat menaruh
   * tautan ke halaman yang tidak ada.
   *
   * Ada di `WorkCard`, bukan cuma `Work`: untuk entri tanpa halaman sendiri
   * inilah satu-satunya jalan keluar yang dipunyai barisnya.
   */
  links?: WorkLink[];
}

export interface Work extends WorkCard {
  /** Logo mark SVG di /public. Dirender di header, di samping judul. */
  logo: string;
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
  gallery: GalleryItem[];
  /**
   * Warna aksen khas project. Dipakai HANYA di OG image
   * (app/works/[slug]/opengraph-image.tsx) supaya tiap link share terlihat
   * berbeda — inti dari M5 §3.5 / pitfall DESIGN §10 #1. Halaman itu sendiri
   * tetap memakai token global agar situs terasa satu sistem.
   */
  ogAccent: string;
}
