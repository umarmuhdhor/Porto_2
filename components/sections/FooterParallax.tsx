'use client';

/**
 * Parallax isi footer (mirror referensi).
 *
 * Isi footer bergerak LEBIH LAMBAT dari section-nya: saat tepi atas footer naik
 * dari dasar layar ke puncak layar, isinya bergeser dari `-OFFSET_VH` ke 0.
 * Relatif terhadap section ia jadi "turun" menyusul, dan itu yang membuat
 * footer terasa terbuka alih-alih sekadar naik ikut scroll.
 *
 * Yang dianimasi WRAPPER ISI, bukan <footer>-nya: menggeser section akan ikut
 * memindahkan bidang warna & strip tangga di tepi atasnya, meninggalkan celah
 * krem di antara ProjectIndex dan footer.
 *
 * TRIGGER-nya <footer> terdekat (dicari sendiri), bukan wrapper ini: wrapper
 * ini yang sedang ditransform, dan rect elemen ber-transform ikut bergeser —
 * memakai dirinya sebagai trigger berarti start/end-nya bergerak mengikuti
 * animasinya sendiri.
 */

import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { NO_PREFERENCE } from '@/lib/motion';

/**
 * Jarak tempuh parallax, dalam persen tinggi footer. 60% = nilai yang dipakai
 * referensi (isi berada di -480px pada footer setinggi 800px saat progress 0).
 */
const OFFSET_PCT = 60;

export function FooterParallax({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const footer = el?.closest('footer');
      if (!el || !footer) return;

      const mm = gsap.matchMedia();

      mm.add(NO_PREFERENCE, () => {
        // Nilai FUNGSI, bukan angka: tinggi footer ikut tinggi viewport
        // (100svh), jadi jarak tempuhnya harus dihitung ulang tiap refresh.
        // Angka biasa akan dibekukan ke tinggi viewport saat tween dibuat, dan
        // parallax-nya jadi meleset setelah jendela diubah ukurannya.
        // Pasangannya `invalidateOnRefresh` di bawah — itu yang menyuruh GSAP
        // mengevaluasi ulang fungsi ini.
        const shift = () => -(footer.offsetHeight * OFFSET_PCT) / 100;

        gsap.fromTo(
          el,
          { y: shift },
          {
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: footer,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
