'use client';

/**
 * Line-art self-drawing untuk section dark (M3 §3.1–3.4, PRD §6).
 *
 * BENTUK (mirror referensi §dark): SATU garis tebal. Ia mulai **tepat di bawah
 * satu huruf headline**, turun vertikal sebentar, lalu menyapu ke kiri sebagai
 * gelombang lebar dan keluar dari tepi kiri layar. Node pen-tool duduk di titik
 * pertama gelombang itu.
 *
 * KENAPA DI-ANCHOR KE HURUF, BUKAN KE SECTION: titik mulainya harus tetap
 * "menempel" di bawah huruf yang sama di lebar layar apa pun. Kalau SVG-nya
 * dipasang absolut terhadap section, tiap kali headline re-wrap (atau ukuran
 * font clamp berubah) titik mulainya meleset. Karena itu SVG ini dirender di
 * dalam <span> yang membungkus satu huruf (lihat StatementDark) dan SEMUA
 * ukurannya dalam `em` → skalanya ikut font headline secara otomatis.
 *
 * Sistem koordinat: viewBox 200×600 dipetakan ke 2em×6em, jadi 1 unit = 0.01em.
 * Koordinat x negatif = ke kiri dari huruf; -3200 unit = -32em, jauh melewati
 * tepi kiri layar. `overflow: visible` membiarkannya keluar kotak SVG; yang
 * memotong di tepi layar adalah `overflow-x: clip` di html/body (globals.css).
 *
 * Progress disuntik dari luar lewat `ref.setProgress()` (panel induk sticky —
 * lihat StackSection M2 §6.2), bukan ScrollTrigger internal. Garis digambar
 * dari ujung huruf → ujung kiri, searah arah baca gerakannya.
 */

import { useImperativeHandle, useRef, type CSSProperties, type Ref } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { NO_PREFERENCE, REDUCE_MOTION } from '@/lib/motion';
import { buildDrawTimeline, setFullyDrawn, type DrawSpec } from '@/lib/lineDraw';

export type LineArtHandle = {
  /** progress 0→1; dipanggil tiap frame oleh scrub ScrollTrigger induk. */
  setProgress: (progress: number) => void;
};

/**
 * Kurva tunggal. Urutan titik = urutan gambar: turun dari huruf, belok kiri ke
 * titik node, lalu tiga gelombang panjang yang makin melandai ke tepi kiri.
 */
const CURVE =
  'M 3 0 L 3 58 C 3 150, -80 320, -450 262 S -700 480, -980 316 S -1400 540, -2000 440 S -2650 380, -3200 404';

/** Titik node pen-tool = ujung segmen pertama kurva, jadi ia persis di garis. */
const NODE = { x: -450, y: 262, r: 65 } as const;

/** Tebal garis (unit viewBox = 0.01em). Menebal sepanjang gambar = tekanan tangan. */
const STROKE: readonly [number, number] = [6, 13];

/** Posisi SVG relatif huruf pembungkus — mengikuti pola referensi. Ukuran
 *  (yang menentukan skala unit viewBox) di-set lewat class responsif. */
const FRAME: CSSProperties = {
  position: 'absolute',
  left: '0.07em',
  top: '0.72em',
  overflow: 'visible',
};

/**
 * Skala kurva per breakpoint. Ukuran SVG-lah yang memetakan unit viewBox ke em,
 * jadi mengubah w/h = memperpendek/memanjangkan sapuan secara UTUH (stroke ikut
 * proporsional; beda dari `scaleX` yang akan menggepengkan garisnya).
 *
 * Kenapa perlu: semua ukuran di sini ber-em, sementara headline mobile cuma
 * separuh ukuran desktop TAPI viewport-nya seperempatnya. Tanpa pengecilan
 * ekstra, node pen-tool mendarat menempel di tepi kiri layar kecil.
 */
const SCALE = 'w-[1.1em] h-[3.3em] md:w-[1.6em] md:h-[4.8em] lg:w-[2em] lg:h-[6em]';

export function LineArt({ className = '', ref }: { className?: string; ref?: Ref<LineArtHandle> }) {
  const rootRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      setProgress: (progress: number) => {
        tlRef.current?.progress(Math.min(1, Math.max(0, progress)));
      },
    }),
    [],
  );

  useGSAP(
    () => {
      const el = pathRef.current;
      if (!el) return;

      const specs: DrawSpec[] = [{ el, mode: 'solid', at: 0, dur: 0.9, width: STROKE }];
      const mm = gsap.matchMedia();

      mm.add(NO_PREFERENCE, () => {
        const tl = buildDrawTimeline(specs);
        tl.progress(0);
        tlRef.current = tl;
        return () => {
          tlRef.current = null;
        };
      });

      mm.add(REDUCE_MOTION, () => {
        tlRef.current = null;
        setFullyDrawn(specs);
      });
    },
    { scope: rootRef },
  );

  return (
    <svg
      ref={rootRef}
      aria-hidden
      viewBox="0 0 200 600"
      fill="none"
      style={FRAME}
      className={`pointer-events-none ${SCALE} ${className}`}
    >
      {/* Garis tunggal yang menggambar dirinya. Stroke SENGAJA dalam unit viewBox
          (tanpa non-scaling-stroke) supaya tebalnya ikut mengecil di headline
          mobile — 0.06em terbaca tebal di 72px dan tetap proporsional di 36px. */}
      <path
        ref={pathRef}
        d={CURVE}
        stroke="currentColor"
        strokeWidth={STROKE[0]}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Node pen-tool — statis, selalu tampil (mirror referensi). */}
      <g
        transform={`translate(${NODE.x} ${NODE.y})`}
        style={{ filter: 'drop-shadow(0 6px 16px rgba(211,221,82,0.25))' }}
      >
        {/* kotak rounded: isi gelap + border lime */}
        <rect
          x={-NODE.r}
          y={-NODE.r}
          width={NODE.r * 2}
          height={NODE.r * 2}
          rx={32}
          fill="#242424"
          stroke="#d3dd52"
          strokeWidth={5}
        />
        {/* ikon vektor pen-tool (bezier: kurva + 2 anchor + 2 control point) */}
        <g
          transform="scale(2)"
          stroke="#b8bcc4"
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M-15 8 C -9 -8 9 -8 15 8" />
          <path d="M-15 8 L -6 -4" strokeOpacity={0.7} />
          <path d="M15 8 L 6 -4" strokeOpacity={0.7} />
          <rect x={-18} y={5} width={6} height={6} fill="#b8bcc4" stroke="none" />
          <rect x={12} y={5} width={6} height={6} fill="#b8bcc4" stroke="none" />
          <circle cx={-6} cy={-4} r={2.2} fill="#b8bcc4" stroke="none" />
          <circle cx={6} cy={-4} r={2.2} fill="#b8bcc4" stroke="none" />
        </g>
      </g>
    </svg>
  );
}
