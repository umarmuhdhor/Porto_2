'use client';

/**
 * Smooth-scroll engine. Lenis = satu-satunya scroll driver; GSAP ScrollTrigger
 * disinkronkan ke event scroll Lenis (bukan native window.scroll) supaya posisi
 * trigger tidak desync dari posisi visual (PRD §12 risiko #6).
 *
 * Wajib client component — Lenis & GSAP menyentuh window/DOM.
 */
import { createContext, useContext, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { REDUCE_MOTION } from '@/lib/motion';

/**
 * Akses instance Lenis dari komponen lain (mis. tombol "Scroll to top" di
 * case study). Native window.scrollTo berkelahi dengan virtual scroll Lenis,
 * jadi apa pun yang ingin memindahkan scroll harus lewat instance yang sama.
 *
 * Yang dibagikan REF, bukan instance-nya langsung: instance baru ada setelah
 * effect jalan, dan menaruhnya di state akan memaksa satu render ulang seluruh
 * pohon aplikasi hanya untuk nilai yang cuma dibaca saat event (klik). Ref
 * stabil sejak render pertama, jadi tidak ada render tambahan sama sekali.
 * `.current === null` = provider belum mount; pemanggil wajib punya fallback.
 */
const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

export function useLenisRef(): RefObject<Lenis | null> | null {
  return useContext(LenisContext);
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Smooth/momentum scroll ADALAH efek gerak. `prefers-reduced-motion: reduce`
    // harus mematikannya (M7 §3.1), bukan hanya animasi berbasis scroll —
    // momentum sendiri bisa memicu mual bagi user yang meminta reduce. Saat
    // reduce aktif, Lenis tidak diinisialisasi sama sekali dan browser memakai
    // scroll native; ScrollTrigger tetap jalan karena default-nya membaca event
    // scroll native begitu tidak ada driver Lenis.
    //
    // Dipasang sebagai listener (bukan cek sekali) supaya toggle setelan di
    // tengah sesi langsung menyalakan/mematikan Lenis tanpa reload.
    const mq = window.matchMedia(REDUCE_MOTION);

    let lenis: Lenis | null = null;
    let raf: ((time: number) => void) | null = null;

    const start = () => {
      if (lenis) return;
      // lerp = seberapa cepat posisi terlihat mengejar posisi target tiap frame.
      // Lebih kecil = ekor momentum lebih panjang, TAPI juga jeda yang makin
      // terasa antara memutar wheel dan halaman bergerak. 0.075 (~13 frame /
      // ≈220ms untuk sampai) sudah masuk wilayah "berat": gerakannya halus tapi
      // tidak lagi terasa terhubung ke tangan. 0.1 (~10 frame) menahan
      // kehalusannya sambil mengembalikan respons itu.
      //
      // wheelMultiplier dikembalikan ke 1: meredamnya ke 0.9 berarti tiap notch
      // wheel menempuh jarak lebih pendek, jadi user memutar lebih banyak untuk
      // jarak yang sama — halaman terasa lambat, bukan halus. Fase hold
      // koreografi stacking punya ruang scroll sendiri (85vh & 84vh) dan tidak
      // bergantung pada peredaman ini.
      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
        syncTouch: true,
      });

      // sync #1: setiap Lenis scroll → ScrollTrigger update posisi trigger.
      lenis.on('scroll', ScrollTrigger.update);

      // sync #2: satu RAF loop tunggal (gsap.ticker) mendrive Lenis.
      raf = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      // Dev-only: expose instance supaya scroll bisa didrive secara deterministik
      // saat QA/debug (native window.scrollTo berkelahi dengan virtual scroll Lenis).
      if (process.env.NODE_ENV !== 'production') {
        (window as Window & { __lenis?: Lenis }).__lenis = lenis;
      }

      lenisRef.current = lenis;
    };

    const stop = () => {
      if (!lenis) return;
      lenisRef.current = null;
      lenis.off('scroll', ScrollTrigger.update);
      if (raf) gsap.ticker.remove(raf);
      lenis.destroy();
      lenis = null;
      raf = null;
      if (process.env.NODE_ENV !== 'production') {
        delete (window as Window & { __lenis?: Lenis }).__lenis;
      }
      // Posisi trigger dihitung ulang untuk konteks scroll native yang baru.
      ScrollTrigger.refresh();
    };

    const sync = () => (mq.matches ? stop() : start());

    sync();
    mq.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      stop();
    };
  }, []);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
