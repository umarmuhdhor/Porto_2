'use client';

/**
 * Deteksi dukungan WebGL (M4 §3.6).
 *
 * Dipakai untuk memutuskan render <Scene> (canvas) atau <Poster> (gambar
 * statis). Tanpa ini, browser/GPU tanpa WebGL cuma dapat canvas kosong —
 * melanggar prinsip progressive enhancement di plans/00-overview.md.
 */

import { useSyncExternalStore } from 'react';

/** Probe cukup sekali per sesi; bikin context itu mahal. */
let cached: boolean | null = null;

export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  if (cached !== null) return cached;

  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') ??
      canvas.getContext('webgl')) as WebGLRenderingContext | null;
    cached = gl !== null;

    // Context probe ini ikut menghitung ke batas context per-halaman
    // (M4 §1: maks 1). Lepaskan segera supaya tidak menyandera slot GPU.
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cached = false;
  }

  return cached;
}

/** Dukungan WebGL tidak pernah berubah dalam satu halaman — tidak ada yang perlu dilanggan. */
const subscribe = () => () => {};

/**
 * Versi hook. `null` di server & saat hydrate, lalu boolean di client.
 *
 * Pakai useSyncExternalStore, bukan useState+useEffect: probe-nya cuma bisa
 * jalan di client, jadi kalau dibaca langsung saat render, output server dan
 * client berbeda → hydration mismatch. useSyncExternalStore memisahkan kedua
 * snapshot itu secara eksplisit (dan tidak memicu cascading render seperti
 * setState di dalam efek).
 *
 * `null` berarti "belum tahu" — pemanggil menampilkan fallback statis dulu,
 * yang kebetulan juga state yang benar kalau WebGL ternyata tidak ada.
 */
export function useWebGLSupport(): boolean | null {
  // supportsWebGL() memoize hasilnya, jadi snapshot-nya stabil antar render —
  // syarat wajib useSyncExternalStore (kalau tidak, render loop tak berujung).
  return useSyncExternalStore(subscribe, supportsWebGL, () => null);
}
