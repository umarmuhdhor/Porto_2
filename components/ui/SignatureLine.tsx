'use client';

/**
 * Signature-line terakota di atas nama hero (M3 §3.5, DESIGN §3 #1, §4.1).
 *
 * INI SVG LINE-ART, BUKAN TEKS BERFONT SCRIPT. Verifikasi live referensi
 * (PRD §4.1 / DESIGN §2.2) menemukan font script "Tempting" di-load tapi
 * dipakai 0 elemen — coretan tanda tangan di atas nama hero ternyata bagian
 * dari sistem SVG dash-array yang sama. Karena itu peran font script di-drop
 * dari v2 dan motifnya dibuat sebagai path di sini. Jangan "perbaiki" ini
 * jadi teks berfont belakangan.
 *
 * Beda dari line-art section dark: animasinya ONE-SHOT saat mount (hero ada
 * di atas lipatan, jadi tidak perlu ScrollTrigger), bukan di-scrub sepanjang
 * scroll.
 */

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { NO_PREFERENCE, REDUCE_MOTION } from '@/lib/motion';
import { buildDrawTimeline, setFullyDrawn, type DrawSpec } from '@/lib/lineDraw';

type Stroke = {
  d: string;
  at: number;
  dur: number;
  strokeWidth: number;
  width?: readonly [number, number];
};

const STROKES: readonly Stroke[] = [
  /* Coretan utama: bowl "U" (inisial nama) lalu ekor mengalir.
     Puncak sengaja beda-beda tinggi & jaraknya — deret puncak seragam
     terbaca sebagai gelombang CSS, bukan tulisan tangan (pelajaran yang
     sama seperti tepi BrushDivider, M2 §6.3). Cusp di ujung bowl (arah
     berubah tajam, bukan membulat) justru yang bikin terbaca "ditarik". */
  {
    d: 'M18 12 C14 34 20 50 34 50 C48 50 52 34 50 14 C60 30 66 46 80 44 C96 42 100 22 112 20 C126 18 130 40 146 40 C166 40 178 22 196 18 C212 14 224 22 236 8',
    at: 0,
    dur: 0.9,
    strokeWidth: 2.2,
    // menebal sedikit ke akhir goresan (tekanan pena)
    width: [1.6, 2.4],
  },
  // flick garis bawah — ditarik setelah coretan utama, seperti tanda tangan asli
  { d: 'M40 60 C96 66 160 60 212 48', at: 0.55, dur: 0.4, strokeWidth: 1.6 },
  // titik penutup di ujung flick
  {
    d: 'M218 46 a2.4 2.4 0 1 0 4.8 0 a2.4 2.4 0 1 0 -4.8 0',
    at: 0.92,
    dur: 0.14,
    strokeWidth: 1.6,
  },
];

export function SignatureLine({ className = '' }: { className?: string }) {
  const rootRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);

  useGSAP(
    () => {
      const specs = STROKES.flatMap<DrawSpec>((s, i) => {
        const el = pathRefs.current[i];
        return el ? [{ el, mode: 'solid', at: s.at, dur: s.dur, width: s.width }] : [];
      });

      if (!specs.length) return;

      const mm = gsap.matchMedia();

      mm.add(NO_PREFERENCE, () => {
        const tl = buildDrawTimeline(specs, false);
        // timeScale 0.55 (dulu 1.15) → gores ~+1s lebih lambat = terasa lebih
        // mulus. Reveal Hero (DRAW_MS) disetel ikut durasi baru ini.
        tl.timeScale(0.55).delay(0.15);
        return () => tl.kill();
      });

      // Tanpa animasi: coretan tampil utuh, bukan setengah tergambar (M3 §5).
      mm.add(REDUCE_MOTION, () => setFullyDrawn(specs));
    },
    { scope: rootRef },
  );

  return (
    <svg
      ref={rootRef}
      aria-hidden
      viewBox="0 0 240 64"
      fill="none"
      className={`pointer-events-none ${className}`}
    >
      {STROKES.map((s, i) => (
        <path
          key={s.d}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          d={s.d}
          stroke="var(--color-accent-line)"
          strokeWidth={s.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
