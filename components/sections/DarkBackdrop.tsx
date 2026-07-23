'use client';

/**
 * Backdrop interaktif untuk StatementDark.
 *
 * Tiga layer visual (semua pointer-events-none, lihat globals.css):
 *   .dark-dots     — medan titik statis yang memudar dari kiri-atas
 *   .dark-glow     — halo hangat mengikuti kursor
 *   .dark-dots-hi  — titik terakota yang menyala di lingkaran sekitar kursor
 *
 * Posisi kursor disuntik lewat CSS var --mx/--my (koordinat lokal elemen),
 * bukan React state: pointermove bisa puluhan kali/detik, setState per event =
 * re-render section per gerakan. rAF membatasi tulis DOM ke ~1x/frame.
 *
 * Listener dipasang di window (bukan elemen) supaya sorot tetap update walau
 * kursor lewat di atas teks yang berada di layer atas. data-active mematikan
 * layer hover saat kursor keluar dari rentang vertikal panel.
 */

import { useEffect, useRef } from 'react';

export function DarkBackdrop({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let px = 0;
    let py = 0;

    const apply = () => {
      raf = 0;
      el.style.setProperty('--mx', `${px}px`);
      el.style.setProperty('--my', `${py}px`);
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
      <div className="dark-glow absolute inset-0" />
      <div className="dark-dots-hi absolute inset-0" />
    </div>
  );
}
