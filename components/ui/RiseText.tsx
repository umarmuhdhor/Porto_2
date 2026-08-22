'use client';

/**
 * "Rise from clip" — teks (atau elemen apa pun) yang naik dari balik kotak
 * ber-`overflow: hidden` saat blok induknya masuk viewport. Ini gerak masuk yang
 * dipakai seluruh footer: tiap huruf punya kotak kliping sendiri, mulai di
 * `translateY(110%)` (persis di bawah garis potong) lalu naik ke 0 dengan jeda
 * bertingkat, sehingga barisnya terbaca "terisi" dari kiri ke kanan.
 *
 * BEDA DARI SplitText: SplitText adalah animasi CSS one-shot yang jalan saat
 * halaman load (dipakai nama hero). Yang ini dipicu SCROLL — footer ada di dasar
 * halaman, jadi animasinya harus menunggu sampai orang benar-benar sampai ke
 * sana, bukan main duluan di layar yang tak pernah dilihat.
 *
 * FAIL-SAFE (pola sama dengan Reveal/SplitText/AboutWindows): state ISTIRAHAT =
 * TERLIHAT. Yang menyembunyikan cuma `data-armed="true"`, dan atribut itu hanya
 * dipasang JS di jalur `prefers-reduced-motion: no-preference` tepat sebelum
 * observer-nya dibuat. Jadi tanpa JS, di reduced-motion, atau saat halaman
 * dibuka di tab background (Chrome tidak menghitung intersection sama sekali di
 * sana), teksnya tetap tampil penuh — tidak ada jalan konten tersangkut
 * tak terlihat.
 *
 * PEMICUNYA SATU, BUKAN PER ELEMEN: `RiseGroup` memasang satu
 * IntersectionObserver dan menyalakan seluruh isinya sekaligus lewat atribut di
 * root. Kalau tiap huruf punya observer sendiri, satu baris judul saja sudah
 * belasan observer yang semuanya melaporkan hal yang sama.
 */

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/** NBSP: spasi biasa di ujung inline-block ikut terpangkas. */
const NBSP = ' ';

/** Jeda antar huruf (detik) — cukup rapat supaya baris terbaca sebagai gelombang. */
const CHAR_STEP = 0.028;

type GroupProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * Pembungkus yang menyalakan semua `RiseText`/`Rise` di dalamnya sekali, saat ia
 * masuk viewport. Sengaja one-shot: footer adalah tujuan akhir halaman, jadi
 * memainkannya ulang tiap kali orang scroll bolak-balik cuma jadi kedipan.
 */
export function RiseGroup({ children, className = '', style }: GroupProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Tab background: intersection tidak dihitung browser. Biarkan tampil.
    if (document.visibilityState === 'hidden') return;
    if (typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.dataset.armed = 'true';

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.in = 'true';
        io.disconnect();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`rise-group ${className}`} style={style}>
      {children}
    </div>
  );
}

type TextProps = {
  text: string;
  /** `flex` untuk baris judul (mirror referensi), `inline-flex` untuk teks di dalam paragraf. */
  inline?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Jeda mulai baris ini (detik) — untuk mengantre beberapa baris. */
  delay?: number;
};

/**
 * Satu baris teks yang naik per huruf.
 *
 * A11y: kotak luar membawa `aria-label` teks utuh dan tiap huruf `aria-hidden`,
 * jadi screen reader membaca satu kalimat, bukan mengeja huruf demi huruf.
 */
export function RiseText({ text, inline = false, className = '', style, delay = 0 }: TextProps) {
  const chars = Array.from(text);

  return (
    <span
      aria-label={text}
      className={className}
      style={{ display: inline ? 'inline-flex' : 'flex', overflow: 'hidden', ...style }}
    >
      {chars.map((c, i) => (
        <span
          key={i}
          aria-hidden
          className="rise-item"
          style={{
            display: 'inline-block',
            whiteSpace: 'pre',
            transitionDelay: `${(delay + i * CHAR_STEP).toFixed(3)}s`,
          }}
        >
          {c === ' ' ? NBSP : c}
        </span>
      ))}
    </span>
  );
}

/**
 * Versi non-teks: satu elemen utuh (ikon sosial) yang naik dari balik klipnya.
 * Kotak klip dan elemen yang bergerak sengaja dua span terpisah — `overflow`
 * dan `transform` di satu elemen berarti elemen itu mengkliping dirinya sendiri.
 */
export function Rise({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={className} style={{ display: 'inline-flex', overflow: 'hidden' }}>
      <span
        className="rise-item"
        style={{ display: 'inline-flex', transitionDelay: `${delay.toFixed(3)}s` }}
      >
        {children}
      </span>
    </span>
  );
}
