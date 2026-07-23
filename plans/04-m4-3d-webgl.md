# M4 — 3D / WebGL Object

> Objek 3D custom (`.glb`) mengambang & berotasi, posisi terikat scroll progress, reaksi tilt ke kursor. React Three Fiber, 1 canvas context (bukan 7 seperti referensi). Fallback statis wajib.

Referensi: PRD §7; DESIGN §6; DESIGN §10 (pitfall: referensi jalankan 7 canvas — v2 maks 2-3).

---

## 1. Tujuan & Acceptance Criteria

- [x] 1 objek 3D `.glb` custom ter-render di section yang ditentukan (bukan model referensi — DESIGN §9).
      Digenerate sendiri dari `scripts/generate-brand-object.mjs` (bebas isu lisensi), host: `ValueSection`.
- [x] Objek mengambang + rotasi idle (loop), posisi/rotasi tambahan terikat scroll via GSAP ScrollTrigger.
- [x] Parallax tilt ringan mengikuti kursor (via R3F `useFrame`, terpisah dari ScrollTrigger).
- [x] `.glb` dimuat async/lazy — tidak blocking initial render (`Suspense`).
      Diverifikasi di build produksi: chunk three/R3F & `.glb` nol di scroll 0.
- [x] **Maks 1 WebGL context** untuk seluruh objek 3D di halaman (konsolidasi — PRD §7, DESIGN §10).
- [x] Fallback: jika WebGL tidak didukung / reduced-motion aktif → tampilkan poster gambar statis, bukan canvas.

---

## 2. Prasyarat

- M1-M3 selesai (layout & scroll infra stabil).
- Model `.glb` siap: dibuat sendiri / royalty-free lisensi jelas, sudah dioptimasi (draco/meshopt compression, low poly count). Simpan di `public/models/`.

---

## 3. Langkah

### 3.1 Install R3F
```bash
pnpm add three @react-three/fiber @react-three/drei
pnpm add -D @types/three
```

### 3.2 Single canvas Scene
- `components/three/Scene.tsx`: satu `<Canvas>` R3F yang menampung objek. Ini satu-satunya WebGL context (batasi sesuai DESIGN §10).
- Set `dpr={[1, 2]}`, `gl={{ antialias: true, powerPreference: 'high-performance' }}`, dan `frameloop="demand"` kalau memungkinkan (render hanya saat perlu → hemat GPU).

### 3.3 Load model
```tsx
import { useGLTF } from '@react-three/drei';
function FloatingObject() {
  const { scene } = useGLTF('/models/brand-object.glb');
  return <primitive object={scene} ref={meshRef} />;
}
useGLTF.preload('/models/brand-object.glb');
```
- Bungkus dengan `<Suspense fallback={<Poster />}>`.

### 3.4 Idle float + rotation
```tsx
useFrame((state, delta) => {
  meshRef.current.rotation.y += delta * 0.2;                 // idle spin
  meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1; // float
  // tilt ke kursor:
  meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, pointer.y * 0.2, 0.05);
});
```

### 3.5 Scroll-linked transform (GSAP)
- Untuk posisi/rotasi yang terikat scroll (bukan idle), pakai ScrollTrigger yang menulis ke `meshRef.current.rotation/position`:
```tsx
gsap.to(meshRef.current.rotation, {
  y: Math.PI * 2,
  scrollTrigger: { trigger: sectionRef.current, scrub: true, start:'top bottom', end:'bottom top' },
});
```
- Hati-hati: idle `useFrame` dan GSAP bisa saling menimpa nilai yang sama. Pisahkan channel — mis. idle pakai `rotation.y`, scroll pakai `position.z` / grup wrapper terpisah. Dokumentasikan pembagian ini.

### 3.6 Fallback
- `lib/webgl.ts`: deteksi dukungan WebGL. Kalau tidak ada → render `<Poster />` (gambar `.webp` statis objek).
- Reduced-motion: render Poster juga (atau objek diam tanpa idle/scroll animation).
- `frameloop="demand"` + pause render saat canvas keluar viewport (IntersectionObserver) untuk hemat baterai.

---

## 4. File yang Dibuat/Disentuh

- `components/three/Scene.tsx` — satu-satunya `<Canvas>`
- `components/three/FloatingObject.tsx` — loader + 3 channel animasi
- `components/three/BrandObject.tsx` — entry point: pilih canvas vs poster, lazy-mount
- `components/three/Poster.tsx` (fallback)
- `lib/webgl.ts` — deteksi WebGL; `lib/motion.ts` — `usePrefersReducedMotion()`
- `scripts/generate-brand-object.mjs` (+ `pnpm run gen:model`), `scripts/capture-poster.md`
- `public/models/brand-object.glb` (66KB), `public/models/brand-object-poster.webp` (15KB)
- Section host: `components/sections/ValueSection.tsx`

---

## 5. Risiko & Catatan

- **Canvas proliferation** (pitfall referensi, DESIGN §10): jangan bikin `<Canvas>` per section. Satu Scene, banyak objek di dalamnya kalau perlu.
- **`.glb` besar** blok TTI → compress (draco/meshopt), target < ~1-2MB. Lazy load, jangan di initial bundle (PRD §9).
- **Mobile GPU** lemah: turunkan `dpr`, kurangi poly, matikan shadow. Uji di device nyata (PRD §12 #5).
- **useFrame vs GSAP tabrakan** pada properti sama → objek "melawan". Pisahkan properti/grup.
- **Memory leak:** dispose geometry/material saat unmount; `useGLTF` drei handle sebagian, tapi cek.
- **SSR:** R3F client-only, `dynamic(() => import(...), { ssr: false })` untuk Scene.

---

## 6. Catatan Implementasi

### 6.1 Model dibuat, bukan dicari

Tidak ada `.glb` royalty-free yang dipakai. `scripts/generate-brand-object.mjs`
membangkitkan model dari kode: dua tabung mengikuti kurva bezier yang **sama persis**
dengan signature-line di `LineArt.tsx`, diangkat ke 3D dengan sweep di sumbu z.
Konsekuensinya motif situs naik tingkat per section — coretan (hero) → konstruksi
garis (statement) → objek volumetrik (approach) — bukan tiga ornamen tak berhubungan.

Penulis GLB-nya manual (header 12 byte + chunk JSON + chunk BIN), karena
`GLTFExporter` three butuh `FileReader`/`Blob` milik browser yang tidak ada di Node.
Hasil: 66KB, 1928 vertex — jauh di bawah target 1-2MB di §5.

`TubeGeometry` meninggalkan ujung terbuka (terbaca sebagai lubang gelap); tiap ujung
ditutup bola kecil yang sekaligus jadi anchor point pen-tool, motif yang sama dengan
kotak anchor di M3.

### 6.2 Pembagian channel animasi (§3.5) — tiga group bersarang

`tiltGroup` (kursor: rotation.x/y) > `scrollGroup` (scroll: rotation.z, position.z) >
`spinGroup` (idle: rotation.y, position.y) > `<primitive>`. Tidak ada satu pun
properti yang ditulis dua sumber. `rotation.y` memang muncul dua kali tapi di objek
berbeda, jadi keduanya berkomposisi lewat matriks parent-child. Detail di
`FloatingObject.tsx`.

### 6.3 Scroll-linked TIDAK pakai `gsap.to(mesh.rotation, {scrollTrigger})`

Panel induknya `position: sticky`, dan ScrollTrigger tidak boleh memakai elemen
sticky sebagai trigger (M2 §6.2). Yang dipakai: progress dari `onHoldProgress`
milik `StackSection` (marker non-sticky) → `ref.setProgress()` → dibaca di dalam
`useFrame`. Pola identik dengan LineArt di M3. Bonus: transform dibaca di frame
render R3F, bukan ditulis dari luar di tengah frame.

**Jebakan yang sempat kena:** `objectRef` dideklarasikan dan `onHoldProgress`
dipasang, tapi `ref={objectRef}` lupa diteruskan ke `<BrandObject>`. Semuanya
"jalan" tanpa error — ScrollTrigger tetap firing, callback tetap dipanggil — objek
saja yang diam di progress 0. Kalau transform terikat scroll tidak bergerak, cek
rantai ref-nya lebih dulu sebelum menyalahkan ScrollTrigger.

### 6.4 `frameloop="demand"` ditolak, diganti saklar always/never

§3.6 menyarankan `demand`, tapi objek ini punya idle float + spin yang harus jalan
tiap frame — `demand` berarti memanggil `invalidate()` 60x/detik, yaitu `always`
dengan biaya tambahan. Yang benar-benar hemat baterai adalah **berhenti saat objek
keluar viewport**, jadi `frameloop` di-switch `always`/`never` dari
IntersectionObserver. Dengan `never`, framebuffer terakhir tetap terpajang → tidak
ada kedipan saat objek discroll keluar-masuk. Terverifikasi: `rotation.y` beku saat
di luar viewport.

Poster baru memudar setelah **frame pertama benar-benar dirender** (sinyal dikirim
dari dalam `useFrame`, bukan `useEffect`) — kalau dari efek, objek yang masih di luar
viewport akan menyembunyikan poster dan menampilkan canvas kosong.

### 6.5 Utility position dari pemanggil bisa kalah — jangan set `position` default

`BrandObject` sempat memasang `relative` sendiri lalu menggabung `className`. Hasilnya
`absolute` dari `ValueSection` **kalah**: Tailwind mengurutkan utility position secara
kanonik di stylesheet (absolute sebelum relative), bukan mengikuti urutan tulis di
string className. Objek jatuh ke aliran layout normal dan menggeser teks. Sekarang
komponen tidak menetapkan `position` sama sekali dan mensyaratkannya dari pemanggil.
Berlaku umum untuk semua utility yang saling meniadakan dalam satu properti CSS.

### 6.6 Layer objek wajib dibungkus `overflow-hidden`

Di bawah xl objek sengaja menggantung lewat tepi kanan (`right-[-6%]`). Tanpa
pembungkus `absolute inset-0 overflow-hidden`, itu melebarkan dokumen dan memunculkan
scrollbar horizontal di mobile (terukur: `scrollWidth` 413 di viewport 390). Pola
pembungkusnya sama dengan LineArt di StatementDark.

### 6.7 `useLoader(GLTFLoader)`, bukan `useGLTF` drei

`@react-three/drei` dihapus dari dependency. `useGLTF` menarik DRACOLoader/Meshopt
secara statis padahal model ini tidak dikompresi, dan default-nya menunjuk decoder
draco ke CDN gstatic — bertentangan dengan aturan aset self-hosted M1. Penghematan
bundle-nya kecil (~28KB dari 935KB; sisanya three core), tapi satu dependency dan
satu jalur request keluar hilang.

### 6.8 Dispose manual sengaja TIDAK dilakukan

§5 menyebut "dispose geometry/material saat unmount". Setelah dicek: menyalakannya
justru berbahaya. Cache `useLoader` membagikan **objek scene yang sama** antar mount,
dan React StrictMode di dev menjalankan mount → cleanup → mount pada instance yang
sama tanpa render ulang — cleanup akan men-dispose geometry yang langsung dipakai
lagi oleh mount kedua. Yang berlaku sekarang: satu model, satu Canvas, umur
sepanjang halaman; R3F membereskan renderer saat Canvas unmount, dan cache loader
adalah cache disengaja berukuran tetap, bukan kebocoran. Kalau nanti objek 3D jadi
banyak dan dinamis, ini harus ditinjau ulang.

### 6.9 QA: preview pane tidak bisa dipakai untuk hal yang butuh rAF

Preview pane menjalankan halaman dalam keadaan `document.hidden`, dengan
`innerHeight === 0`. Akibatnya `requestAnimationFrame`, IntersectionObserver, Lenis,
dan ScrollTrigger semuanya beku, dan R3F tidak pernah mengukur canvas (tersangkut di
300x150). Screenshot tetap benar karena pane sempat aktif saat difoto — jadi hasil
foto bisa menipu.

Yang dipakai sebagai gantinya: harness Chrome headless nyata
(`puppeteer-core` menunjuk ke Chrome sistem, di luar repo) dengan 18 pemeriksaan —
lazy-load, jumlah canvas, transform per channel, tilt, frameloop mati di luar
viewport, reduced-motion, WebGL dimatikan (patch `getContext`), dan overflow mobile.
Dijalankan terhadap dev **dan** build produksi. Catatan: `window.__r3f` /
`window.__lenis` hanya ada di dev, jadi asersi transform tidak bisa berjalan di
build produksi — di sana yang diverifikasi adalah pemisahan bundle + visual.

### 6.10 Utang yang diteruskan ke M7

- Chunk three + R3F ≈ 907KB tanpa kompresi (di luar jalur render awal, tapi tetap
  besar). Kandidat pemangkasan kalau budget PRD §9 terlampaui.
- Belum diuji di iOS Safari asli maupun GPU mobile nyata — SwiftShader headless
  tidak mewakili keduanya (§5 "Mobile GPU lemah", PRD §12 #5).
- `dpr={[1, 2]}` dan poly count belum dikalibrasi terhadap device mid-range asli.
