'use client';

/**
 * Entry point objek 3D untuk section host (M4). Bagian ini yang memutuskan
 * APA yang dirender; Scene.tsx cuma tahu cara menggambar.
 *
 * Tiga keputusan hidup di sini:
 *   1. Fallback (AC #6) — tanpa WebGL atau saat `prefers-reduced-motion`,
 *      canvas TIDAK dipasang sama sekali dan yang tampil cuma <Poster />.
 *      Reduced-motion memilih poster (bukan objek diam) karena objek diam pun
 *      masih menahan satu WebGL context hidup untuk gambar yang tidak bergerak.
 *   2. Lazy (AC #4) — chunk R3F + .glb baru diminta saat objek mendekati
 *      viewport, lewat IntersectionObserver ber-rootMargin. Jadi berat 3D
 *      tidak pernah masuk jalur render awal halaman.
 *   3. Hemat daya — observer kedua (rootMargin 0) menyalakan/mematikan loop
 *      render sesuai objek benar-benar terlihat atau tidak.
 *
 * Progress scroll disuntik dari luar lewat `ref.setProgress()`, pola yang sama
 * dengan LineArt di M3 — alasannya di FloatingObject.tsx.
 */

import dynamic from 'next/dynamic';
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { Poster } from '@/components/three/Poster';
import { useWebGLSupport } from '@/lib/webgl';
import { usePrefersReducedMotion } from '@/lib/motion';

// ssr:false wajib (M4 §5): R3F menyentuh document/WebGL saat modul dievaluasi.
const Scene = dynamic(() => import('@/components/three/Scene'), { ssr: false });

export type BrandObjectHandle = {
  /** progress 0→1 dari ScrollTrigger panel induk. */
  setProgress: (progress: number) => void;
};

/** Seberapa awal (dalam px sebelum masuk viewport) chunk 3D mulai diambil. */
const PRELOAD_MARGIN = '400px 0px';

export function BrandObject({
  className = '',
  ref,
}: {
  /**
   * WAJIB memuat kelas positioning (`absolute` / `relative` / `fixed`) plus
   * ukurannya. Komponen ini sengaja TIDAK menetapkan `position` sendiri:
   * pernah dicoba menaruh `relative` sebagai default, dan hasilnya `absolute`
   * dari pemanggil kalah — Tailwind mengurutkan utility position secara
   * kanonik (absolute sebelum relative), bukan sesuai urutan tulis di string
   * className, jadi default-nya justru selalu menang dan objek jatuh ke aliran
   * layout normal. Layer di dalam sini `absolute inset-0`, dan itu tetap benar
   * selama pemanggil memberi containing block apa pun yang positioned.
   */
  className?: string;
  ref?: Ref<BrandObjectHandle>;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  // Nilai per-frame disimpan di ref, bukan state: keduanya berubah puluhan kali
  // per detik dan setState di frekuensi itu = re-render section tiap frame.
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });

  const [near, setNear] = useState(false); // sudah dekat → boleh mount Scene
  const [visible, setVisible] = useState(false); // benar-benar terlihat → loop jalan
  const [ready, setReady] = useState(false); // frame pertama sudah dirender
  const reducedMotion = usePrefersReducedMotion();
  const webgl = useWebGLSupport();

  useImperativeHandle(
    ref,
    () => ({
      setProgress: (value: number) => {
        progress.current = Math.min(1, Math.max(0, value));
      },
    }),
    [],
  );

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    // Dua observer, bukan satu: ambang "mulai unduh" (400px lebih awal) dan
    // ambang "mulai render" (tepat di viewport) memang beda tujuan. Satu
    // observer dengan satu rootMargin tidak bisa mewakili keduanya.
    const preload = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), {
      rootMargin: PRELOAD_MARGIN,
    });
    const onScreen = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));

    preload.observe(el);
    onScreen.observe(el);
    return () => {
      preload.disconnect();
      onScreen.disconnect();
    };
  }, []);

  // `webgl === true` (bukan truthy): null = "belum diprobe", dan selama itu
  // yang benar adalah menampilkan poster.
  const showCanvas = webgl === true && !reducedMotion;

  useEffect(() => {
    if (!showCanvas) return;
    // Hanya device dengan penunjuk presisi. Di layar sentuh tidak ada kursor
    // untuk diikuti, dan `pointermove` di sana cuma ikut gestur scroll.
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const onMove = (event: PointerEvent) => {
      // Dinormalisasi terhadap VIEWPORT, bukan canvas: canvas ini
      // pointer-events-none (tidak boleh menghalangi teks section), jadi
      // event-nya tidak pernah sampai ke sana.
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [showCanvas]);

  return (
    <div ref={hostRef} aria-hidden className={`pointer-events-none ${className}`}>
      {/* Poster selalu ada di bawah canvas dan cuma disembunyikan setelah frame
          pertama benar-benar tergambar — jadi tidak pernah ada lubang kosong,
          baik saat chunk masih diunduh maupun saat WebGL memang tidak ada. */}
      {/* Syaratnya `ready && showCanvas`, bukan `ready` saja: kalau user
          menyalakan reduced-motion setelah canvas jalan, canvas di-unmount dan
          poster harus kembali — dengan `ready` saja tempatnya jadi kosong. */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          ready && showCanvas ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <Poster />
      </div>

      {showCanvas && near && (
        <div className="absolute inset-0">
          <Scene motion={{ progress, pointer }} active={visible} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
