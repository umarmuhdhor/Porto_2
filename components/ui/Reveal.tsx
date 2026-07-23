'use client';

/**
 * Reveal one-shot saat elemen masuk viewport (M5 §3.4).
 *
 * KENAPA IntersectionObserver, BUKAN ScrollTrigger: case study sengaja ringan
 * dan scroll-nya linear (DESIGN §4.6). ScrollTrigger dipakai untuk animasi
 * yang terikat progres scroll (pin/scrub) — di sini kita cuma butuh "sudah
 * kelihatan atau belum", sekali, lalu observer dilepas. Tidak ada state yang
 * perlu ikut mundur saat user scroll balik ke atas.
 *
 * Plan M5 menyebut Framer Motion `whileInView`; hasil visualnya identik tanpa
 * menambah dependency runtime ke halaman yang justru ditargetkan paling ringan.
 *
 * KENAPA data-attribute LANGSUNG, BUKAN useState: hasil reveal murni visual dan
 * tidak dipakai logic React mana pun. Menulis atribut = menyinkronkan DOM
 * dengan sistem eksternal (observer) — persis tugas useEffect — dan menghindari
 * satu render ulang per gambar plus risiko mismatch hidrasi.
 *
 * FAIL-SAFE (dari QA M5): elemen dirender TERLIHAT, lalu JS yang memasang
 * `data-reveal="armed"` untuk menyembunyikannya. Jadi setiap jalur gagal —
 * JS tidak jalan, IntersectionObserver absen, atau observer tidak pernah fire —
 * berakhir di "gambar tampil", bukan "gambar hilang". Ini bukan hipotesis:
 * Chrome TIDAK menghitung intersection sama sekali selama
 * `document.visibilityState === 'hidden'`, jadi versi yang menyembunyikan
 * duluan lewat CSS membuat halaman yang dibuka di tab background tampil kosong.
 */

import { useEffect, useRef } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Jeda mulai (ms) — untuk menstagger item bersebelahan di satu baris grid. */
  delay?: number;
}

export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Tab background: intersection tidak dihitung browser. Biarkan tampil.
    if (document.visibilityState === 'hidden') return;
    if (typeof IntersectionObserver === 'undefined') return;

    // Sudah (hampir) di viewport saat mount → tidak ada gunanya menganimasi
    // sesuatu yang sudah dilihat user, dan menyembunyikannya dulu justru
    // memunculkan kedip tampil→hilang→tampil.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.dataset.reveal = 'armed';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.visible = 'true';
        observer.disconnect();
      },
      // -8% bawah: reveal menyala sedikit SETELAH elemen benar-benar masuk,
      // bukan tepat saat piksel pertamanya menyentuh tepi layar.
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
