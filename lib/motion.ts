/**
 * Reduced-motion helpers. Dipakai tiap milestone animasi (M2-M6) supaya
 * `prefers-reduced-motion: reduce` benar-benar mematikan animasi berat,
 * bukan sekadar mempercepat CSS transition.
 *
 * Pola pakai dengan GSAP (recommended) — gsap.matchMedia() otomatis
 * revert semua animasi di dalam scope-nya saat media query berubah:
 *
 *   import { gsap } from '@/lib/gsap';
 *   import { REDUCE_MOTION, NO_PREFERENCE } from '@/lib/motion';
 *
 *   useGSAP(() => {
 *     const mm = gsap.matchMedia();
 *     mm.add(NO_PREFERENCE, () => {
 *       // animasi penuh (pin, scrub, dll)
 *     });
 *     mm.add(REDUCE_MOTION, () => {
 *       // set state final statis (mis. garis fully-drawn), tanpa animasi
 *     });
 *   }, { scope: ref });
 *
 * Pola pakai dengan Framer Motion: gunakan hook useReducedMotion() dari 'framer-motion'.
 */

import { useSyncExternalStore } from 'react';

/** Media query string: user MINTA lebih sedikit gerak. */
export const REDUCE_MOTION = '(prefers-reduced-motion: reduce)';

/** Media query string: user tidak keberatan gerak penuh. */
export const NO_PREFERENCE = '(prefers-reduced-motion: no-preference)';

/**
 * Cek imperatif satu kali (untuk logic non-GSAP, mis. skip inisialisasi
 * canvas idle-loop). SSR-safe: mengembalikan false di server.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(REDUCE_MOTION).matches;
}

/**
 * Versi reaktif untuk logic non-GSAP yang perlu MERENDER hal berbeda (bukan
 * sekadar menganimasi berbeda) — mis. M4 memilih antara <canvas> dan poster
 * statis. Untuk animasi biasa tetap pakai gsap.matchMedia(), bukan hook ini:
 * itu sudah menangani revert otomatis.
 *
 * Melanggan `change`, bukan membaca sekali: user bisa mengubah setelan ini
 * dari system settings tanpa reload halaman.
 *
 * Snapshot server sengaja `true` (= anggap minta hemat gerak). Markup pertama
 * jadi selalu varian statisnya; itu default yang aman dan sekaligus benar
 * untuk user yang memang memilih reduce, jadi mereka tidak pernah sekilas
 * melihat versi beranimasi.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => true);
}

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCE_MOTION);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** Boolean primitif → identitas snapshot stabil, syarat useSyncExternalStore. */
function getReducedMotion(): boolean {
  return window.matchMedia(REDUCE_MOTION).matches;
}
