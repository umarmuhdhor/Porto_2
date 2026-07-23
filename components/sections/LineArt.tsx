'use client';

/**
 * Line-art self-drawing untuk section dark (M3 §3.1–3.4, PRD §6).
 *
 * Bentuk mengikuti referensi §dark: SATU kurva mulus lebar melintang bagian
 * bawah — bukit di kiri, lembah di tengah tempat node pen-tool duduk, lalu naik
 * ke kanan atas. Ditemani kurva gema tipis + sapuan aksen terakota di dasar.
 *
 * Node pen-tool (kotak rounded, isi gelap, border lime + ikon vektor) BUKAN
 * bagian yang digambar — ia selalu ada (mirror referensi: node tetap tampil),
 * jadi dirender statis di luar timeline. Yang menggambar dirinya cuma 3 stroke:
 * kurva utama, kurva gema, dan sapuan aksen.
 *
 * Progress disuntik dari luar lewat `ref.setProgress()` (panel induk sticky —
 * lihat StackSection M2 §6.2), bukan ScrollTrigger internal.
 */

import { useImperativeHandle, useRef, type Ref } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { NO_PREFERENCE, REDUCE_MOTION } from '@/lib/motion';
import { buildDrawTimeline, setFullyDrawn, type DrawMode, type DrawSpec } from '@/lib/lineDraw';

export type LineArtHandle = {
  /** progress 0→1; dipanggil tiap frame oleh scrub ScrollTrigger induk. */
  setProgress: (progress: number) => void;
};

type ArtPath = {
  d: string;
  mode: DrawMode;
  at: number;
  dur: number;
  tone?: 'ink' | 'accent';
  opacity: number;
  strokeWidth: number;
  width?: readonly [number, number];
  cap?: 'round' | 'butt';
};

/** Pusat node pen-tool di koordinat viewBox (di lembah kurva utama). */
const NODE = { x: 560, y: 208, r: 32 } as const;

/** Hanya 3 path yang MENGGAMBAR dirinya — sisanya (node) statis.
 *  Amplitudo sengaja rendah (gelombang lebar dangkal) supaya puncak kanan tidak
 *  menabrak baris terakhir headline — mirror referensi. */
const PATHS: readonly ArtPath[] = [
  // — kurva utama: bukit kiri → lembah tengah (node) → naik kanan
  {
    d: 'M-10 200 C 120 150 235 150 355 185 C 435 210 495 212 560 208 C 645 203 705 150 815 130 C 905 114 965 120 1010 116',
    mode: 'solid',
    at: 0,
    dur: 0.62,
    opacity: 0.95,
    strokeWidth: 2,
    cap: 'round',
  },
  // — kurva gema, sedikit di bawah (kesan sketsa ganda)
  {
    d: 'M-10 212 C 120 162 235 162 355 197 C 435 222 495 224 560 220 C 645 215 705 162 815 142 C 905 126 965 132 1010 128',
    mode: 'solid',
    at: 0.1,
    dur: 0.56,
    opacity: 0.3,
    strokeWidth: 1.1,
    cap: 'round',
  },
  // — sapuan aksen terakota di dasar; satu-satunya yang MENEBAL sepanjang scroll
  {
    d: 'M30 248 C 300 240 650 245 980 232',
    mode: 'solid',
    at: 0.4,
    dur: 0.5,
    tone: 'accent',
    opacity: 0.9,
    strokeWidth: 1.2,
    width: [1.2, 2.6],
    cap: 'round',
  },
];

export function LineArt({ className = '', ref }: { className?: string; ref?: Ref<LineArtHandle> }) {
  const rootRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
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
      const specs = PATHS.flatMap<DrawSpec>((p, i) => {
        const el = pathRefs.current[i];
        return el ? [{ el, mode: p.mode, at: p.at, dur: p.dur, width: p.width }] : [];
      });

      if (!specs.length) return;

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
      viewBox="0 0 1000 260"
      fill="none"
      preserveAspectRatio="xMidYMax meet"
      className={`pointer-events-none ${className}`}
    >
      {/* Stroke yang digambar sendiri */}
      {PATHS.map((p, i) => (
        <path
          key={p.d}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          d={p.d}
          stroke={p.tone === 'accent' ? 'var(--color-accent-line)' : 'currentColor'}
          strokeWidth={p.strokeWidth}
          strokeOpacity={p.opacity}
          strokeLinecap={p.cap ?? 'butt'}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}

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
          rx={16}
          fill="#242424"
          stroke="#d3dd52"
          strokeWidth={2.5}
          vectorEffect="non-scaling-stroke"
        />
        {/* ikon vektor pen-tool (bezier: kurva + 2 anchor + 2 control point) */}
        <g
          stroke="#b8bcc4"
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
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
