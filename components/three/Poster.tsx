'use client';

/**
 * Fallback statis objek 3D (M4 §3.6 / AC #6).
 *
 * Dipakai di tiga situasi:
 *   1. WebGL tidak didukung → satu-satunya yang dirender.
 *   2. `prefers-reduced-motion: reduce` → canvas sengaja tidak dipasang.
 *   3. Sementara chunk R3F + .glb masih dimuat → poster tampil dulu, lalu
 *      di-fade begitu model siap (lihat BrandObject.tsx).
 *
 * Gambarnya hasil render objek yang sama (scripts/capture-poster.md), jadi
 * pergantian poster→canvas tidak terlihat sebagai lompatan bentuk.
 *
 * Dekoratif murni: `alt=""` + `aria-hidden` supaya tidak menambah kebisingan
 * di screen reader — semua informasi section ada di teksnya.
 */

import Image from 'next/image';

export const POSTER_SRC = '/models/brand-object-poster.webp';
export const POSTER_SIZE = 720;

export function Poster({ className = '' }: { className?: string }) {
  return (
    <Image
      src={POSTER_SRC}
      alt=""
      aria-hidden
      width={POSTER_SIZE}
      height={POSTER_SIZE}
      // Bukan LCP dan berada jauh di bawah fold — biarkan lazy (default).
      className={`pointer-events-none h-full w-full object-contain ${className}`}
    />
  );
}
