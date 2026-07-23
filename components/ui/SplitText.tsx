/**
 * SplitText (M6 §3.1) — memecah string jadi satu <span> per karakter dengan
 * entrance stagger saat halaman load (one-shot).
 *
 * ROBUSTNESS (overview: halaman harus tetap terbaca kalau JS gagal / DoD):
 * animasinya CSS murni, bukan JS. State ISTIRAHAT tiap huruf = TERLIHAT; animasi
 * cuma enhancement yang digerakkan `.split-char` di globals.css, di-gate
 * `prefers-reduced-motion: no-preference`. Konsekuensinya:
 *   - No-JS  → CSS tetap jalan, huruf muncul & settle terlihat.
 *   - Reduced-motion → tak ada animasi, huruf langsung terlihat.
 *   - Tab background → CSS animation pakai document timeline, tak nyangkut
 *     invisible seperti animasi rAF (framer) yang membeku saat tab hidden.
 * Tak ada `opacity:0` yang ter-SSR ke HTML → nama tak pernah hilang.
 *
 * A11y (M6 §5 — split-text bisa merusak screen reader / copy-paste):
 * - wrapper `aria-label` teks utuh → dibaca sebagai satu kata.
 * - tiap span per-huruf `aria-hidden` supaya tak dibaca dobel.
 * - teks utuh tetap ada di DOM → copy-paste & SEO utuh.
 *
 * Selalu render <span> inline. Untuk heading bungkus dari pemanggil:
 *   <h1><SplitText text="UMAR" /></h1>
 *
 * Tanpa hook/klien-only API → boleh dipakai di Server maupun Client Component.
 */

/** NBSP untuk merender spasi tanpa kehilangan lebar saat dipecah per span. */
const NBSP = ' ';

interface SplitTextProps {
  /** Teks yang dipecah. Juga jadi aria-label utuh. */
  text: string;
  className?: string;
  /** Jeda antar huruf (detik). */
  stagger?: number;
  /** Delay sebelum huruf pertama mulai (detik). */
  delay?: number;
}

export function SplitText({ text, className, stagger = 0.045, delay = 0.1 }: SplitTextProps) {
  const chars = Array.from(text);

  return (
    <span className={className} aria-label={text}>
      {chars.map((c, i) => (
        // overflow-hidden per huruf → efek "naik dari bawah garis".
        <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom">
          <span
            className="split-char inline-block"
            style={{ animationDelay: `${(delay + i * stagger).toFixed(3)}s` }}
          >
            {c === ' ' ? NBSP : c}
          </span>
        </span>
      ))}
    </span>
  );
}
