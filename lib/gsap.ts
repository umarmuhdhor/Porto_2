/**
 * Central GSAP setup. Import { gsap, ScrollTrigger } dari sini di seluruh app
 * supaya plugin cuma di-register sekali (hindari double-register warning).
 *
 * Catatan: file ini client-side. Jangan import dari server component.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);

  /**
   * `ignoreMobileResize` — di iOS/Android, menyembunyikan atau memunculkan bilah
   * URL saat scroll menghitung ulang `innerHeight`. Tanpa ini setiap gerakan itu
   * memicu ScrollTrigger.refresh() penuh: SEMUA start/end diukur ulang (halaman
   * ini punya belasan trigger, beberapa dengan `invalidateOnRefresh`) tepat di
   * tengah gestur scroll — sumber jitter khas di mobile. Resize horizontal
   * (rotasi layar) tetap memicu refresh.
   */
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Dev-only: expose untuk QA/debug di console (lihat juga window.__lenis).
  if (process.env.NODE_ENV !== 'production') {
    Object.assign(window, { __gsap: gsap, __ScrollTrigger: ScrollTrigger });
  }
}

export { gsap, ScrollTrigger, useGSAP };
