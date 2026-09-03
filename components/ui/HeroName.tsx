'use client';

/**
 * Nama hero "UMAR MUHDHOR" (2 baris) — dua animasi digabung per huruf:
 *
 * 1. ENTRANCE (saat reveal): tiap huruf naik dari bawah garis (`.split-char`,
 *    di-gate `no-preference` di globals.css). Sama seperti SplitText.
 * 2. HOVER (mirror referensi nithinmwarrier.com): hover di nama → tiap huruf
 *    "roll" — salinan atas naik keluar, salinan bawah (terakota, senada
 *    signature) masuk. Referensi menukar Aeonik→Trobika; Trobika proprietary,
 *    jadi mekaniknya ditiru dengan pergeseran warna, bukan font.
 *
 * Struktur roll pakai pola RollingLabel (NavPill): salinan bawah `absolute` →
 * mask tetap setinggi SATU huruf, overflow-hidden mengklip salinan yang keluar.
 * Entrance & hover di elemen berbeda → animation-fill entrance tak menimpa hover.
 *
 * Robustness: state istirahat = huruf (salinan atas) TERLIHAT. no-JS/reduced-
 * motion → nama tampil utuh statis. A11y: wrapper `aria-label` nama utuh; tiap
 * huruf `aria-hidden`.
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
            // Stagger lebih besar → ombak menyapu huruf demi huruf (efek "air").
            const rollDelay = `${(i * 0.06).toFixed(3)}s`;
            return (
              // Mask entrance: klip huruf yang naik dari bawah saat reveal.
              <span key={ci} aria-hidden className="inline-block overflow-hidden align-bottom">
                <span
                  className="split-char inline-block"
                  style={{ animationDelay: `${(delay + i * stagger).toFixed(3)}s` }}
                >
                  {/* Mask hover-roll: setinggi 1 huruf (salinan bawah absolute). */}
                  <span className="relative block overflow-hidden leading-[0.9]">
                    <span
                      className="block transition-transform duration-[650ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/name:-translate-y-full"
                      style={{ transitionDelay: rollDelay }}
                    >
                      {ch}
                    </span>
                    <span
                      className="text-accent-line-strong absolute inset-0 block translate-y-full transition-transform duration-[650ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/name:translate-y-0"
                      style={{ transitionDelay: rollDelay }}
                    >
                      {ch}
                    </span>
                  </span>
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
