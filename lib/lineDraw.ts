'use client';

/**
 * Helper self-drawing SVG line (M3, PRD §6).
 *
 * Dua mode gambar — keduanya menulis `stroke-dasharray`, bukan opacity:
 *
 *   'solid' — dasharray `L L` + dashoffset L→0. Garis utuh yang tumbuh dari
 *             titik awal ke titik akhir. Dipakai untuk kurva utama & anchor.
 *
 *   'dash'  — interpolasi **dasharray 4-nilai** sepanjang progress (PRD §6:
 *             "manipulasi stroke-dasharray empat-nilai dinamis, bukan sekadar
 *             stroke-dashoffset tunggal"). Di p=0 semua segmen `on` panjangnya
 *             0 → path tak terlihat; makin besar p, segmen `on` memanjang dan
 *             gap menyusut, jadi garis "mengendap" sebagai garis bantu teknis
 *             yang makin padat. Dipakai untuk handle bezier & garis ukur.
 *
 * Semua tween ditulis ke SATU timeline paused; pemanggil yang menentukan
 * progress-nya (di-scrub ScrollTrigger untuk section dark, atau `play()`
 * one-shot untuk signature hero). Timeline yang sama otomatis reversible.
 *
 * getTotalLength() WAJIB dipanggil setelah mount (bukan SSR) dan pada elemen
 * yang benar-benar dirender — elemen `display: none` mengembalikan 0. Karena
 * itu panjang 0 ditangani sebagai "lewati path ini", bukan dibiarkan bikin
 * dasharray NaN.
 */

import { gsap } from '@/lib/gsap';

export type DrawMode = 'solid' | 'dash';

export type DrawSpec = {
  /** Elemen geometri SVG (path/circle/line) yang digambar. */
  el: SVGGeometryElement;
  mode: DrawMode;
  /** Posisi mulai di timeline (detik). Beda per path = sequencing multi-path. */
  at: number;
  /** Durasi gambar (detik). */
  dur: number;
  /** stroke-width awal → akhir. Menebal bertahap = ilusi tekanan tangan. */
  width?: readonly [number, number];
};

/** Banyaknya segmen dash saat pola 4-nilai sudah penuh. */
const DASH_SEGMENTS = 14;

function totalLength(el: SVGGeometryElement): number {
  try {
    return el.getTotalLength();
  } catch {
    // jsdom / browser lawas tanpa implementasi getTotalLength
    return 0;
  }
}

/**
 * Pola dash 4-nilai pada progress p (0→1).
 * p=0  → `0 2u 0 1.2u`  (tak ada segmen on → path tak terlihat)
 * p=1  → `u 0.4u 0.4u 0.25u` (garis bantu padat, ritme tidak seragam)
 */
function dashPattern(unit: number, p: number): string {
  const on1 = unit * p;
  const off1 = unit * (2 - 1.6 * p);
  const on2 = unit * 0.4 * p;
  const off2 = unit * (1.2 - 0.95 * p);
  return `${on1} ${off1} ${on2} ${off2}`;
}

/**
 * Bangun timeline gambar untuk sekumpulan path.
 * @param specs urutan & timing per path
 * @param paused true (default) untuk di-scrub manual lewat `.progress()`
 */
export function buildDrawTimeline(specs: DrawSpec[], paused = true): gsap.core.Timeline {
  const tl = gsap.timeline({ paused });

  specs.forEach((spec) => {
    const { el, mode, at, dur, width } = spec;
    const len = totalLength(el);

    if (width) {
      // Lewat `attr`, BUKAN properti CSS strokeWidth: CSSPlugin membulatkan
      // nilai px ke integer, jadi 1.1→2.6 kebaca meloncat 1px→2px→3px dan
      // ilusi tekanan tangannya hilang. AttrPlugin menulis angka apa adanya.
      gsap.set(el, { attr: { 'stroke-width': width[0] } });
      tl.to(el, { attr: { 'stroke-width': width[1] }, ease: 'none', duration: dur }, at);
    }

    if (len <= 0) return; // path tidak terukur → biarkan tampil apa adanya

    if (mode === 'dash') {
      const unit = len / DASH_SEGMENTS;
      const proxy = { p: 0 };
      gsap.set(el, { strokeDasharray: dashPattern(unit, 0), strokeDashoffset: 0 });
      tl.to(
        proxy,
        {
          p: 1,
          ease: 'none',
          duration: dur,
          onUpdate: () => {
            el.style.strokeDasharray = dashPattern(unit, proxy.p);
          },
        },
        at,
      );
      return;
    }

    // 'solid' — dasharray `L L` (BUKAN `L` tunggal): dengan pola dua nilai,
    // offset L menaruh segmen on di [-L, 0] sehingga benar-benar kosong dan
    // tidak ada sisa pola yang membungkus balik ke ujung path.
    // +1 unit ekstra menghindari titik round-cap yang nyembul di offset penuh.
    gsap.set(el, { strokeDasharray: `${len} ${len}`, strokeDashoffset: len + 1 });
    tl.to(el, { strokeDashoffset: 0, ease: 'none', duration: dur }, at);
  });

  return tl;
}

/**
 * State akhir statis untuk `prefers-reduced-motion: reduce` (M3 §3.4):
 * semua garis tampil PENUH. Garis yang berhenti setengah gambar terbaca
 * sebagai render rusak, bukan sebagai "animasi dimatikan".
 */
export function setFullyDrawn(specs: DrawSpec[]): void {
  specs.forEach(({ el, mode, width }) => {
    if (width) gsap.set(el, { attr: { 'stroke-width': width[1] } });
    const len = totalLength(el);
    if (len <= 0) return;
    if (mode === 'dash') {
      gsap.set(el, { strokeDasharray: dashPattern(len / DASH_SEGMENTS, 1), strokeDashoffset: 0 });
    } else {
      gsap.set(el, { strokeDasharray: 'none', strokeDashoffset: 0 });
    }
  });
}
