'use client';

/**
 * Objek 3D brand: loader .glb + seluruh animasinya (M4 §3.3–3.5).
 *
 * ── PEMBAGIAN CHANNEL (M4 §3.5, WAJIB DIBACA SEBELUM MENAMBAH ANIMASI) ──
 * Idle-loop dan animasi terikat-scroll gampang saling menimpa kalau menulis ke
 * properti yang sama — objek jadi "melawan" / bergetar. Karena itu tiap sumber
 * gerak punya GROUP-nya sendiri, dan tidak ada satu pun properti yang ditulis
 * dua sumber:
 *
 *   tiltGroup   → rotation.x, rotation.y   : kursor (damped)
 *     scrollGroup → rotation.z, position.z : progress scroll panel
 *       spinGroup   → rotation.y, position.y : idle spin + float
 *         <primitive>                       : model, tidak pernah disentuh
 *
 * Perhatikan rotation.y muncul dua kali — tapi di OBJEK BERBEDA (tilt vs spin),
 * jadi keduanya cuma berkomposisi lewat matriks parent-child. Aman. Yang tidak
 * boleh: dua sumber menulis `spinGroup.rotation.y`.
 *
 * ── KENAPA BUKAN gsap.to(mesh.rotation, {scrollTrigger}) seperti M4 §3.5 ──
 * Panel induknya `position: sticky` (M2), dan ScrollTrigger tidak boleh memakai
 * elemen sticky sebagai trigger — rect-nya bergeser saat nempel (M2 §6.2).
 * Progress-nya karena itu diambil dari ScrollTrigger milik StackSection (yang
 * memakai marker non-sticky) lalu dialirkan ke sini lewat ref mutable, persis
 * pola yang sudah dipakai LineArt di M3. Bonusnya: nilai dibaca di dalam
 * useFrame, jadi transform 3D selalu sinkron dengan frame render R3F alih-alih
 * ditulis dari luar di tengah-tengah frame.
 */

import { useMemo, useRef, type RefObject } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box3, Group, MathUtils, Vector3 } from 'three';

export const MODEL_URL = '/models/brand-object.glb';

/**
 * Ukuran target sisi terpanjang objek dalam satuan dunia.
 *
 * Angkanya terikat ke kamera di Scene.tsx (fov 34°, z 4.4): tinggi viewport di
 * bidang z=0 ≈ 2.7 satuan, dan di ujung dolly terdekat ≈ 2.4. 2.0 menyisakan
 * ruang untuk rotasi roll — objek yang panjangnya 2.0 dan diputar 0.5 rad
 * memakan ≈2.4 satuan diagonal, jadi pas tidak terpotong. Menaikkan angka ini
 * TANPA menurunkan SCROLL_DOLLY akan memotong ujung objek di akhir scroll.
 */
const FIT_SIZE = 2.0;

/** Rentang transform yang dikendalikan scroll (progress 0 → 1). */
const SCROLL_ROLL = [-0.5, 0.42] as const; // rotation.z (rad)
const SCROLL_DOLLY = [-1.1, 0.3] as const; // position.z (maju ke kamera)

export type ObjectMotion = {
  /** Progress 0→1 fase hold panel induk. Mutable — diupdate tiap frame scroll. */
  progress: RefObject<number>;
  /** Kursor ternormalisasi -1..1 relatif viewport; tetap 0,0 di device tanpa hover. */
  pointer: RefObject<{ x: number; y: number }>;
};

export function FloatingObject({
  motion,
  onReady,
}: {
  motion: ObjectMotion;
  onReady?: () => void;
}) {
  /**
   * useLoader + GLTFLoader mentah, BUKAN useGLTF dari @react-three/drei.
   * Dua alasan, keduanya terukur:
   *   - drei menarik DRACOLoader/Meshopt/KTX2 secara statis ke dalam chunk,
   *     padahal model ini tidak dikompresi sama sekali — bobot mati.
   *   - default useGLTF menunjuk decoder draco ke CDN gstatic; semua aset di
   *     proyek ini self-hosted (M1), jadi jalur request keluar itu tidak
   *     diinginkan meski dalam praktiknya jarang terpicu.
   * useLoader punya cache modul yang sama dengan useGLTF, jadi Suspense &
   * dedup antar-mount tetap berlaku.
   */
  const { scene } = useLoader(GLTFLoader, MODEL_URL);

  const tiltRef = useRef<Group>(null);
  const scrollRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);

  /**
   * Center + scale dihitung dari bounding box, BUKAN di-hardcode, supaya
   * mengubah geometri di scripts/generate-brand-object.mjs tidak perlu diikuti
   * penyetelan angka di sini.
   *
   * Hasilnya dipasang sebagai PROP (nilai absolut), bukan lewat
   * `scene.position.sub(...)` di useEffect: `scene` itu objek dari cache drei
   * yang dipakai bersama, dan mutasi relatif akan menumpuk tiap kali komponen
   * di-mount ulang (React StrictMode di dev me-mount dua kali).
   */
  const fit = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const scale = FIT_SIZE / Math.max(size.x, size.y, size.z);
    const offset = center.multiplyScalar(-1).toArray() as [number, number, number];
    return { offset, scale };
  }, [scene]);

  const readyFired = useRef(false);

  useFrame((state, rawDelta) => {
    // Tab yang lama di background mengumpulkan delta besar; tanpa clamp,
    // frame pertama setelah kembali akan meloncatkan rotasi idle jauh.
    const delta = Math.min(rawDelta, 1 / 30);
    const t = state.clock.elapsedTime;

    const spin = spinRef.current;
    if (spin) {
      spin.rotation.y += delta * 0.2; // idle spin
      spin.position.y = Math.sin(t * 0.8) * 0.08; // mengambang
    }

    const scroll = scrollRef.current;
    if (scroll) {
      const p = motion.progress.current;
      scroll.rotation.z = MathUtils.lerp(SCROLL_ROLL[0], SCROLL_ROLL[1], p);
      scroll.position.z = MathUtils.lerp(SCROLL_DOLLY[0], SCROLL_DOLLY[1], p);
    }

    const tilt = tiltRef.current;
    if (tilt) {
      // damp() = lerp yang tidak bergantung framerate; 60fps dan 120fps
      // menghasilkan kurva kejar yang sama.
      tilt.rotation.x = MathUtils.damp(tilt.rotation.x, motion.pointer.current.y * 0.16, 4, delta);
      tilt.rotation.y = MathUtils.damp(tilt.rotation.y, motion.pointer.current.x * 0.22, 4, delta);
    }

    // Sinyal "boleh sembunyikan poster" sengaja dikirim dari sini, bukan dari
    // useEffect: dengan frameloop="never" (objek di luar viewport) efek sudah
    // jalan tapi belum ada satu frame pun yang dirender — poster akan memudar
    // dan menampilkan canvas kosong. useFrame baru jalan saat loop benar-benar
    // hidup, jadi ini menjamin ada gambar di balik poster sebelum ia pergi.
    if (!readyFired.current) {
      readyFired.current = true;
      onReady?.();
    }
  });

  return (
    <group ref={tiltRef}>
      <group ref={scrollRef}>
        <group ref={spinRef}>
          <primitive object={scene} position={fit.offset} scale={fit.scale} />
        </group>
      </group>
    </group>
  );
}

// Mulai ambil .glb begitu chunk R3F selesai dimuat, tanpa menunggu React
// merender komponennya (M4 §3.3).
useLoader.preload(GLTFLoader, MODEL_URL);
