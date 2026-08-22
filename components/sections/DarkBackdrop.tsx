'use client';

/**
 * Backdrop interaktif untuk StatementDark.
 *
 * Tiga layer visual (semua pointer-events-none, lihat globals.css):
 *   .dark-dots     — medan titik statis yang memudar dari kiri-atas
 *   .dark-glow     — halo hangat mengikuti kursor
 *   .dark-dots-hi  — titik terakota yang menyala di lingkaran sekitar kursor
 *
 * Dua layer terakhir adalah KOTAK BERUKURAN TETAP yang digeser dengan
 * `transform`, bukan layer seukuran viewport yang gradien/mask-nya dihitung dari
 * posisi kursor (lihat catatan biaya di globals.css). Yang ditulis per frame
 * cuma satu transform per layer — kerja compositor, bukan paint.
 *
 * Posisi ditulis langsung ke DOM, bukan React state: pointermove bisa puluhan
 * kali/detik, setState per event = re-render section per gerakan. rAF membatasi
 * tulis DOM ke ~1x/frame.
 *
 * Listener dipasang di window (bukan elemen) supaya sorot tetap update walau
 * kursor lewat di atas teks yang berada di layer atas. data-active mematikan
 * layer hover saat kursor keluar dari rentang vertikal panel.
 */

import { useEffect, useRef } from 'react';

/** Petak grid titik (harus SAMA dengan background-size .dark-dots di globals.css). */
const DOT_GRID = 24;
/** Setengah sisi kotak .dark-dots-hi — offsetnya ke grid harus dikoreksi. */
const HI_HALF = 190;

export function DarkBackdrop({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const glow = el.querySelector<HTMLDivElement>('.dark-glow');
    const hi = el.querySelector<HTMLDivElement>('.dark-dots-hi');
    if (!glow || !hi) return;

    let raf = 0;
    let px = 0;
    let py = 0;

    const apply = () => {
      raf = 0;
      const move = `translate3d(${px}px, ${py}px, 0)`;
      glow.style.transform = move;
      hi.style.transform = move;
      // Kotak sorot ikut bergeser bersama gridnya sendiri, jadi titiknya akan
      // meleset dari medan titik statis di belakang. Background-nya digeser
      // balik sebesar sisa bagi posisi kotak terhadap petak grid — dengan itu
      // titik yang menyala mendarat persis di atas titik yang redup.
      const bx = (((HI_HALF - px) % DOT_GRID) + DOT_GRID) % DOT_GRID;
      const by = (((HI_HALF - py) % DOT_GRID) + DOT_GRID) % DOT_GRID;
      hi.style.backgroundPosition = `${bx}px ${by}px`;
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      // Aktif hanya saat kursor berada di dalam area panel yang terlihat.
      if (e.clientY < r.top || e.clientY > r.bottom || e.clientX < r.left || e.clientX > r.right) {
        el.dataset.active = 'false';
        return;
      }
      el.dataset.active = 'true';
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      el.dataset.active = 'false';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      data-active="false"
      className={`dark-backdrop pointer-events-none ${className}`}
    >
      <div className="dark-dots absolute inset-0" />
      <div className="dark-dots-cluster absolute inset-0" />
      {/* Ukuran & penempatan dua layer di bawah ini dari globals.css — sengaja
          TANPA `inset-0`, mereka kotak kecil yang digeser transform. */}
      <div className="dark-glow" />
      <div className="dark-dots-hi" />
    </div>
  );
}
