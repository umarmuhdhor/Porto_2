'use client';

/**
 * Watermark nama raksasa di footer — dua baris yang ukurannya DIHITUNG supaya
 * baris terpanjang tepat memenuhi lebar kotaknya.
 *
 * KENAPA DIUKUR, BUKAN `font-size` dalam vw: panjang kedua baris tidak sama
 * ("UMAR" 4 huruf, "MUHDHOR" 7). Nilai vw apa pun yang bikin baris panjang pas
 * akan membuat baris pendek jauh lebih sempit dari kotaknya, dan sebaliknya —
 * dan angkanya harus disetel ulang tiap kali namanya berubah. Mengukur baris
 * terpanjang sekali lalu menskalakan font-size ke lebar target membuat blok
 * watermark selalu berhenti di tepi yang sama, berapa pun lebar layarnya.
 *
 * Diukur pada `PROBE_PX` lalu diskalakan linear: lebar teks berbanding lurus
 * dengan font-size selama font & letter-spacing (ber-em) tidak berubah, jadi
 * satu pengukuran cukup — tidak perlu iterasi biner.
 *
 * `useLayoutEffect` (bukan useEffect): ukuran final harus sudah terpasang
 * sebelum frame pertama dicat, kalau tidak watermark berkedip di ukuran probe.
 */

import { useLayoutEffect, useRef, useState } from 'react';

/** Ukuran ukur. Cukup besar supaya pembulatan subpiksel tidak berarti. */
const PROBE_PX = 200;

// `readonly string[]`, bukan `string[]`: sumbernya konstanta `as const` di
// content/site.ts, dan tuple readonly tidak assignable ke array mutable.
export function FitWatermark({
  lines,
  className = '',
}: {
  lines: readonly string[];
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<number | null>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const probe = probeRef.current;
    if (!box || !probe) return;

    const fit = () => {
      const target = box.clientWidth;
      const widest = probe.getBoundingClientRect().width;
      if (!target || !widest) return;
      setSize((PROBE_PX * target) / widest);
    };

    fit();

    // Lebar kotak ikut lebar viewport, dan font web baru selesai dimuat setelah
    // render pertama — dua-duanya mengubah hasil ukur, jadi keduanya diamati.
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    document.fonts?.ready.then(fit).catch(() => {});

    return () => ro.disconnect();
  }, [lines]);

  // Baris terpanjang secara jumlah karakter dipakai sebagai probe. Perkiraan
  // yang cukup: dua baris memakai font & tracking yang sama, jadi urutan
  // panjangnya nyaris selalu mengikuti jumlah hurufnya.
  const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), '');

  return (
    <div ref={boxRef} className={className}>
      {/* Elemen ukur: di luar alur & tak terlihat, tapi TETAP dirender (bukan
          `display: none`) — elemen tanpa box tidak punya lebar untuk diukur. */}
      <span
        ref={probeRef}
        aria-hidden
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'pre',
          pointerEvents: 'none',
          fontSize: PROBE_PX,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
        }}
      >
        {longest}
      </span>

      {lines.map((line) => (
        <div
          key={line}
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: 'max-content',
            margin: '0 auto',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            // Sampai hasil ukur ada, ukurannya 0 — bukan ukuran probe. Watermark
            // seukuran 200px yang tampil satu frame lalu melompat ke ukuran
            // sebenarnya jauh lebih kentara daripada satu frame kosong.
            fontSize: size ?? 0,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: 'var(--color-dark)',
            whiteSpace: 'pre',
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}
