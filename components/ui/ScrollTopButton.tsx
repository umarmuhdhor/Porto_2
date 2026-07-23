'use client';

/**
 * "Scroll to top" di nav bawah case study (M5 §3.3 #7).
 *
 * <button>, bukan <a href="#top">: ini aksi, bukan navigasi ke resource lain —
 * dan anchor akan mengubah URL jadi `#top` yang tidak berarti apa-apa kalau
 * di-share. Fokus keyboard tetap dapat karena button natively fokusable.
 *
 * Scroll HARUS lewat instance Lenis; window.scrollTo akan berkelahi dengan
 * virtual scroll-nya dan menghasilkan lompatan. Fallback native hanya dipakai
 * kalau provider belum mount.
 */

import { useLenisRef } from '@/components/providers/SmoothScrollProvider';
import { prefersReducedMotion } from '@/lib/motion';

export function ScrollTopButton({ className = '' }: { className?: string }) {
  const lenisRef = useLenisRef();

  const handleClick = () => {
    const immediate = prefersReducedMotion();
    const lenis = lenisRef?.current;

    if (lenis) {
      lenis.scrollTo(0, { immediate });
      return;
    }
    window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      Scroll to top ↑
    </button>
  );
}
