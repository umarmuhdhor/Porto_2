'use client';

/**
 * Primitif sticky-stacking (M2 §3.3).
 *
 * KEPUTUSAN TEKNIK (M2 §3.1 / PRD §15 Open Q #5): pakai **CSS `position: sticky`
 * untuk menahan panel + GSAP `scrub` untuk crossfade** — BUKAN ScrollTrigger
 * `pin: true`. Alasan:
 *   - `pin` membungkus elemen di pin-spacer & memindah-mindah `position`;
 *     di iOS Safari momentum-scroll ini sumber jitter utama (M2 §5).
 *   - `sticky` ditangani compositor native → stabil, tanpa pin-spacing math,
 *     tanpa "loncatan" tinggi halaman.
 *   - Kontrol timeline tetap penuh: GSAP cuma menganimasi opacity/scale/y
 *     konten di dalam panel, tidak menyentuh layout panel.
 *
 * BENTUK LAYOUT (penting — jangan diubah tanpa baca ini):
 *   Semua panel sticky harus jadi **direct child dari satu parent tinggi**
 *   (di sini `<main>`). Sticky berhenti di batas parent, jadi panel tetap
 *   "nempel" di `top: 0` sementara section berikutnya naik menutupinya —
 *   itulah efek stacking-nya. Kalau tiap panel dibungkus wrapper sendiri,
 *   panel keburu lepas sebelum ditutup dan efeknya hilang.
 *
 *   Tinggi panel = (100 + hold) vh:
 *     - `hold` vh pertama  → panel diam, belum ada yang menutupi.
 *     - 100 vh terakhir    → section berikutnya naik menutupi (fase cover).
 *   Konten dikunci di `min-h-[100svh]` teratas; sisa tinggi cuma ruang scroll.
 *
 * MARKER: ScrollTrigger tidak boleh memakai elemen sticky sebagai `trigger`
 * (rect-nya bergeser saat nempel → start/end salah). Karena itu tiap panel
 * menaruh satu div setinggi 0 non-sticky tepat sebelum dirinya sebagai anchor
 * pengukuran yang posisinya stabil.
 */

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { NO_PREFERENCE } from '@/lib/motion';

type StackSectionProps = {
  children: ReactNode;
  /** Ruang scroll ekstra (vh) sebelum section berikutnya mulai menutupi. */
  hold?: number;
  /** Kelas untuk panel (latar & warna teks section). */
  className?: string;
  id?: string;
  /** Ornamen tepi atas panel (mis. <BrushDivider />) — di luar layer yang di-crossfade. */
  divider?: ReactNode;
  /** Progress 0→1 selama fase hold. Dipakai section yang butuh scrub internal. */
  onHoldProgress?: (progress: number) => void;
};

export function StackSection({
  children,
  hold = 0,
  className = '',
  id,
  divider,
  onHoldProgress,
}: StackSectionProps) {
  const markerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Callback disimpan di ref supaya identitas fungsi yang berubah tiap render
  // tidak memicu pembuatan ulang ScrollTrigger.
  const progressCb = useRef(onHoldProgress);
  useEffect(() => {
    progressCb.current = onHoldProgress;
  }, [onHoldProgress]);

  useGSAP(
    () => {
      const marker = markerRef.current;
      const panel = panelRef.current;
      if (!marker || !panel) return;

      /** Tinggi fase hold dalam px = tinggi panel − tinggi viewport. */
      const holdPx = () => Math.max(0, panel.offsetHeight - window.innerHeight);

      const mm = gsap.matchMedia();

      // Cabang gerak penuh. Di `prefers-reduced-motion: reduce` tidak ada tween
      // sama sekali — sticky-nya pun dimatikan lewat CSS di globals.css,
      // jadi halaman jadi scroll linear biasa dengan urutan konten sama.
      mm.add(NO_PREFERENCE, () => {
        // Crossfade: konten panel yang sedang ditutupi memudar + mundur sedikit.
        // Yang dianimasi KONTEN, bukan panel — kalau panel yang di-scale,
        // latarnya menyusut dan menyisakan celah di tepi atas viewport.
        gsap.to(contentRef.current, {
          opacity: 0.12,
          scale: 0.94,
          y: -56,
          ease: 'none',
          scrollTrigger: {
            trigger: marker,
            start: () => `top top-=${holdPx()}`,
            end: () => `top top-=${holdPx() + window.innerHeight}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        if (progressCb.current && hold > 0) {
          ScrollTrigger.create({
            trigger: marker,
            start: 'top top',
            end: () => `top top-=${holdPx()}`,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => progressCb.current?.(self.progress),
          });
        }
      });
    },
    { scope: panelRef, dependencies: [hold] },
  );

  return (
    <>
      <div ref={markerRef} aria-hidden className="h-0 w-full" />
      <section
        ref={panelRef}
        id={id}
        className={`stack-panel ${className}`}
        /* `svh`, BUKAN `vh`: di mobile `vh` mengacu ke viewport saat bilah URL
           tersembunyi, jadi tinggi tiap panel berubah setiap kali bilah itu
           muncul/hilang saat scroll — seluruh halaman me-relayout dan posisi
           trigger meleset di tengah gestur. `svh` (small viewport height) nilai
           tetap: layout panel tidak pernah bergerak karena chrome browser. */
        style={{ '--stack-h': `${100 + hold}svh` } as CSSProperties}
      >
        {divider}
        {/* `relative` bukan hiasan: konten absolute di dalam section (mis.
            line-art M3) harus punya containing block yang pasti. Tanpa ini
            containing block-nya cuma "kebetulan" div ini — karena GSAP menaruh
            transform di sini saat crossfade aktif — dan langsung meleset ke
            panel sticky begitu tween-nya tidak ada (reduced-motion), sehingga
            ornamen `bottom-*` jatuh ke luar layar. */}
        <div
          ref={contentRef}
          className="relative flex min-h-[100svh] w-full flex-col justify-center"
          style={{ paddingInline: 'var(--frame-inset)' }}
        >
          {children}
        </div>
      </section>
    </>
  );
}
