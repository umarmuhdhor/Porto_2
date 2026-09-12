'use client';

/**
 * Nama hero "UMAR MUHDHOR" (2 baris) — dua animasi per huruf, di elemen berbeda
 * supaya keduanya tidak berebut properti `transform` yang sama:
 *
 * 1. ENTRANCE (`.hero-char`, saat reveal) — huruf tersingkap dari bawah ke atas
 *    sambil naik sedikit dan melepas blur. Penyingkapannya pakai `clip-path`,
 *    BUKAN wrapper `overflow: hidden`: wrapper itu tetap mengklip selamanya
 *    setelah animasi selesai, jadi gerak hover apa pun yang keluar dari kotak
 *    huruf akan terpotong. Frame terakhir clip-path-nya sengaja melebar keluar
 *    kotak (inset negatif) supaya huruf bebas bergerak sesudahnya.
 *
 * 2. HOVER (`.hero-char-face`) — gelombang: huruf terangkat sedikit dan
 *    berganti warna ke terakota (senada signature), berurutan kiri→kanan lewat
 *    `transition-delay` per huruf. Reversibel penuh — gelombangnya menyapu balik
 *    saat kursor pergi, karena yang dipakai transition, bukan animation.
 *
 * Versi sebelumnya memakai "roll" dua-salinan (salinan atas keluar, salinan
 * bawah masuk) di dalam mask setinggi satu huruf. Mekanik itu menggandakan tiap
 * huruf di DOM dan, digabung dengan entrance-nya, membuat nama terus bergerak.
 * Yang di sini satu salinan per huruf: lebih tenang dan lebih murah.
 *
 * Robustness: state istirahat = huruf TERLIHAT tanpa clip. no-JS/reduced-motion
 * → nama tampil utuh statis (kedua efek di-gate `no-preference` di globals.css).
 * A11y: nama utuh dibaca sekali lewat `sr-only`; tiap huruf `aria-hidden`.
 */

const LINES = ['UMAR', 'MUHDHOR'] as const;
const FULL_NAME = 'Umar Muhdhor';

interface HeroNameProps {
  /** Delay huruf pertama entrance (detik) — diselaraskan fase 'reveal' Hero. */
  delay?: number;
  /** Jeda antar huruf entrance (detik). */
  stagger?: number;
}

export function HeroName({ delay = 2.4, stagger = 0.045 }: HeroNameProps) {
  let idx = 0;

  return (
    <span className="group/name block cursor-default select-none">
      <span className="sr-only">{FULL_NAME}</span>
      {LINES.map((line, li) => (
        <span key={li} className="block">
          {Array.from(line).map((ch, ci) => {
            const i = idx++;
            return (
              <span
                key={ci}
                aria-hidden
                className="hero-char inline-block"
                style={
                  {
                    '--in-delay': `${(delay + i * stagger).toFixed(3)}s`,
                    // Gelombang hover disapu per huruf; jedanya lebih rapat dari
                    // entrance supaya terasa satu sapuan, bukan huruf-per-huruf.
                    '--hover-delay': `${(i * 0.028).toFixed(3)}s`,
                  } as React.CSSProperties
                }
              >
                <span className="hero-char-face inline-block">{ch}</span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
