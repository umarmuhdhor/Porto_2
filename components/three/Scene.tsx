'use client';

/**
 * SATU-SATUNYA <Canvas> di seluruh situs (M4 §3.2 / AC #5).
 *
 * PRD §7 + DESIGN §10 mencatat pitfall referensi: 7 WebGL context aktif
 * bersamaan sampai browser mulai membuang context paling tua. Aturan di sini:
 * kalau nanti butuh objek 3D kedua, TAMBAHKAN OBJEK KE SCENE INI — jangan
 * bikin <Canvas> baru. Cari `new Canvas` sebelum menambah apa pun.
 *
 * Default export karena di-load lewat next/dynamic (lihat BrandObject.tsx):
 * R3F murni client-side, tidak boleh ikut render di server.
 */

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { FloatingObject, type ObjectMotion } from './FloatingObject';

type SceneProps = {
  motion: ObjectMotion;
  /** Objek sedang di viewport. Menentukan loop render jalan atau berhenti. */
  active: boolean;
  onReady?: () => void;
};

export default function Scene({ motion, active, onReady }: SceneProps) {
  return (
    <Canvas
      /**
       * M4 §3.6 menyarankan `frameloop="demand"`, tapi objek ini punya idle
       * float + spin yang memang harus jalan tiap frame — "demand" berarti
       * kita sendiri yang harus memanggil invalidate() 60x/detik, yaitu
       * "always" dengan biaya tambahan. Yang benar-benar menghemat baterai
       * adalah BERHENTI saat objek keluar viewport, dan itu yang dilakukan
       * saklar always/never ini (IntersectionObserver ada di BrandObject).
       * Dengan "never" framebuffer terakhir tetap terpajang, jadi tidak ada
       * kedipan saat objek discroll keluar-masuk.
       */
      frameloop={active ? 'always' : 'never'}
      // Batas atas 2 supaya layar 3x (mobile flagship) tidak merender 9x piksel
      // untuk ornamen dekoratif (M4 §5 "Mobile GPU lemah").
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 4.4], fov: 34 }}
      // Tanpa shadow map: satu-satunya objek tidak punya lantai untuk menerima
      // bayangan, jadi shadow map cuma biaya GPU tanpa hasil visual.
      shadows={false}
      // Canvas transparan → latar cream section yang terlihat, bukan warna
      // clear milik WebGL. Tidak perlu menyamakan warna di dua tempat.
      style={{ pointerEvents: 'none' }}
      onCreated={(state) => {
        // Dev-only: expose store R3F untuk QA/debug di console — konvensi yang
        // sama dengan __gsap / __lenis di lib/gsap.ts. Berguna khusus untuk
        // memeriksa transform per-channel (`__r3f.scene`) dan memajukan loop
        // manual (`__r3f.advance(t)`) di environment tanpa rAF.
        if (process.env.NODE_ENV !== 'production') Object.assign(window, { __r3f: state });
      }}
    >
      {/* Pencahayaan pakai light analitik, BUKAN drei <Environment />: yang
          terakhir mengunduh HDR dari CDN pihak ketiga — bertentangan dengan
          aturan aset self-hosted (M1) dan menambah request di jalur kritis. */}
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} />
      {/* Rim light hangat dari belakang-bawah: memisahkan siluet objek dari
          latar cream yang nilainya berdekatan dengan warna aksen. */}
      <directionalLight position={[-4, -2, -3]} intensity={0.9} color="#ffd9c9" />

      {/* fallback={null}: poster fallback-nya elemen DOM, tidak bisa jadi anak
          Canvas. Poster dirender sebagai layer di bawah canvas oleh
          BrandObject dan baru memudar setelah frame pertama. */}
      <Suspense fallback={null}>
        <FloatingObject motion={motion} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
