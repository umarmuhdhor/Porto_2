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

  // Dev-only: expose untuk QA/debug di console (lihat juga window.__lenis).
  if (process.env.NODE_ENV !== 'production') {
    Object.assign(window, { __gsap: gsap, __ScrollTrigger: ScrollTrigger });
  }
}

export { gsap, ScrollTrigger, useGSAP };
