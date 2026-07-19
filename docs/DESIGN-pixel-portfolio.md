# DESIGN.md — Arsitektur Teknis: Interactive Pixel-Art Portfolio

| Field | Value |
|---|---|
| Versi | 1.0 |
| Status | Draft for implementation |
| Terkait | PRD-pixel-portfolio-v1.md |
| Target | v1.0 — single room, no backend |

---

## 0. Ringkasan Eksekutif Teknis

Aplikasi ini adalah **Next.js App Router** app yang merender konten portfolio sebagai HTML statis (SEO + no-JS baseline), lalu me-mount sebuah *overworld* interaktif di atasnya sebagai lapisan progresif.

Keputusan arsitektural paling penting, dan yang menentukan apakah target 60fps tercapai:

> **Simulation state tidak pernah masuk ke React state.** Posisi, kecepatan, arah, dan frame karakter hidup di `useRef`/store non-reaktif. Loop menulis langsung ke DOM lewat `ref.current.style.transform`. React hanya di-render ulang untuk **event diskrit**: hotspot masuk/keluar, modal buka/tutup, theme berubah.

Kalau prinsip ini dilanggar sekali saja — misalnya `setPosition()` di dalam loop — seluruh dokumen ini kehilangan gunanya.

---

## 1. Stack & Justifikasi

| Layer | Pilihan | Alasan | Alternatif yang ditolak |
|---|---|---|---|
| Framework | Next.js (App Router) | SSG untuk konten portfolio → memenuhi requirement SEO §6.4 PRD | Vite SPA — konten hanya ada setelah JS jalan |
| Bahasa | TypeScript (strict) | World config sebagai data bertipe; collision math rawan salah tanpa tipe | — |
| Styling | Tailwind + CSS Modules untuk scene | Tailwind untuk UI chrome; CSS Module untuk scene karena butuh kontrol `image-rendering` & layer | CSS-in-JS — runtime cost tidak perlu |
| Entrance anim | GSAP | Timeline sequencing untuk splash → scene reveal | Framer Motion — overhead React reconciliation |
| Motion runtime | Raw `requestAnimationFrame` | Butuh delta-time dan collision resolve per frame; CSS transition tidak bisa | CSS transition — tidak bisa interupsi mid-motion dengan benar |
| State | Zustand | Store bisa dibaca imperatif (`store.getState()`) di dalam loop tanpa subscribe | Redux — boilerplate; Context — re-render seluruh subtree |
| Deploy | Vercel | Native App Router, edge cache untuk aset statis | — |

**Catatan tentang Zustand:** dipakai untuk *discrete* state saja (activeHotspot, openModal, theme). Simulation state **bukan** di Zustand — di ref. Zustand di sini menggantikan Context, bukan menggantikan ref.

---

## 2. Prinsip Arsitektur

### P1 — Dua dunia yang tidak boleh bercampur

```
┌─────────────────────────────────────────────────────┐
│  SIMULATION WORLD (60Hz, imperatif, tanpa React)    │
│  posisi, velocity, facing, frameIndex, camera       │
│  → ditulis ke DOM via ref.style.transform           │
└────────────────────┬────────────────────────────────┘
                     │ hanya event diskrit yang menyeberang
                     ▼
┌─────────────────────────────────────────────────────┐
│  REACT WORLD (event-driven, deklaratif)             │
│  activeHotspotId, openModalId, theme, isPaused      │
│  → re-render badge, modal, navbar                   │
└─────────────────────────────────────────────────────┘
```

Aturan konkret:
- Loop **boleh** membaca React/Zustand state (via `getState()`, bukan hook).
- Loop **hanya boleh** menulis React state saat nilainya benar-benar berubah (guard `if (next !== prev)`).
- React **tidak pernah** menulis posisi karakter, kecuali sekali saat spawn/reset.

### P2 — World adalah data, bukan kode
Menambah furnitur, hotspot, atau project = edit `/data/*.ts`. Tidak menyentuh `useGameLoop`, `useCollision`, atau `Camera`.

### P3 — Input diabstraksi
Loop tidak tahu apakah user memakai keyboard, joystick, atau tap. `useInput()` mengembalikan `{ intent: Vec2, interactPressed: boolean }`. Titik.

### P4 — Setiap fitur game punya padanan non-game
Setiap hotspot punya entri navbar yang membuka modal identik.

---

## 3. Struktur Folder

```
/app
  layout.tsx                 // <html data-theme>, inline theme script, font
  page.tsx                   // SSG: konten portfolio (SEO) + <Overworld/>
  opengraph-image.tsx
/components
  /overworld
    Overworld.tsx            // root: viewport, scale, mount loop, error boundary
    WorldLayer.tsx           // render objects dari world.ts, depth-sorted
    Character.tsx            // sprite <img>, ref di-expose ke loop
    Hotspot.tsx              // badge <button>, dikontrol activeHotspotId
    MobileControls.tsx       // joystick + tombol interact
    DebugOverlay.tsx         // ?debug=1 → render semua hitbox
  /ui
    Navbar.tsx               // jalur langsung (PRD FR-6)
    Modal.tsx                // portal, focus-trap
    ThemeToggle.tsx
    LoadingSplash.tsx
  /static
    StaticPortfolio.tsx      // konten SSR + fallback reduced-motion
/hooks
  useGameLoop.ts             // rAF, delta time, orchestration
  useInput.ts                // keyboard + touch → intent
  useCollision.ts            // per-axis AABB resolve (pure fn factory)
  useHotspots.ts             // proximity detection + dispatch
  usePrefersReducedMotion.ts
  useViewportScale.ts        // world→screen scale, resize handling
/lib
  camera.ts                  // follow + clamp + lerp
  math.ts                    // lerp, clamp, aabb, normalize
  sprites.ts                 // preload manifest, frame cycling
  theme.ts
  analytics.ts
/state
  gameStore.ts               // Zustand: discrete state only
/data
  world.ts                   // objects, colliders, hotspots, spawn, size
  content.ts                 // konten tiap hotspot (juga dipakai SSR)
/public/portfolio-game
  /character/{front,back,left,right}/{0,1,2,3}.png
  /furniture/*.png
  /badges/*.svg
  background.png
```

---

## 4. Sistem Koordinat & Kamera

### 4.1 Tiga ruang koordinat

| Ruang | Satuan | Contoh |
|---|---|---|
| **World space** | px absolut, ukuran tetap `1448 × 1086` | Posisi karakter, collider, trigger zone |
| **Camera space** | world space digeser oleh offset kamera | Hasil `applyTransforms()` |
| **Screen space** | px viewport setelah `scale(s)` | Hanya untuk hit-testing tap mobile |

Semua logika game bekerja **eksklusif di world space**. Konversi ke screen hanya terjadi di satu tempat: transform container.

### 4.2 Struktur DOM

```html
<div class="viewport">            <!-- overflow:hidden, ukuran responsif -->
  <div class="world" ref={worldRef}>   <!-- transform: scale(s) translate(cx, cy) -->
    <img class="bg" />
    <div class="obj" style="transform: translate3d(x,y,0); z-index: baselineY" />
    <div class="character" ref={charRef} />
    ...
  </div>
  <div class="hud">               <!-- badge, mobile controls: TIDAK ikut scale -->
</div>
```

**Kenapa HUD di luar `.world`:** badge dan kontrol mobile harus tetap tajam dan berukuran konsisten di semua zoom level. Posisi badge dihitung world→screen secara manual saat berubah (bukan tiap frame).

### 4.3 Perhitungan skala

```ts
// useViewportScale.ts
function computeScale(vw: number, vh: number, world: Vec2): number {
  const raw = Math.min(vw / world.x, vh / world.y);   // strategi 'contain'
  // Pixel art: bulatkan ke kelipatan 0.5 agar tidak ada shimmer antar-piksel
  return Math.max(0.5, Math.round(raw * 2) / 2);
}
```

Untuk mobile portrait, `contain` menghasilkan skala terlalu kecil. Strategi: gunakan `cover` + kamera clamp — user melihat sebagian ruangan, kamera menggeser saat berjalan. Ini justru membuat eksplorasi terasa lebih hidup di mobile.

### 4.4 Kamera

```ts
// lib/camera.ts
interface CameraState { x: number; y: number }

export function updateCamera(
  cam: CameraState,
  target: Vec2,          // posisi karakter (center)
  viewport: Vec2,        // ukuran viewport dalam world units (screen / scale)
  world: Vec2,
  dt: number
): void {
  // 1. target ideal: karakter di tengah
  let tx = target.x - viewport.x / 2;
  let ty = target.y - viewport.y / 2;

  // 2. clamp agar tidak menampilkan area di luar dinding
  tx = clamp(tx, 0, Math.max(0, world.x - viewport.x));
  ty = clamp(ty, 0, Math.max(0, world.y - viewport.y));

  // 3. lerp frame-rate independent (BUKAN lerp(cam, t, 0.1))
  const smoothing = 1 - Math.pow(0.001, dt);   // ~konstan di 30fps & 144fps
  cam.x = lerp(cam.x, tx, smoothing);
  cam.y = lerp(cam.y, ty, smoothing);
}
```

**Detail penting:** `lerp(a, b, 0.1)` per frame menghasilkan kecepatan kamera yang berbeda di 30fps vs 144fps. Rumus `1 - pow(k, dt)` membuatnya independen frame rate. Ini bug yang hampir selalu terlewat.

Jika `world.x <= viewport.x` (ruangan lebih kecil dari layar), kamera dikunci di tengah — jangan biarkan clamp menghasilkan nilai negatif.

---

## 5. Game Loop

### 5.1 Implementasi

```ts
// hooks/useGameLoop.ts
export function useGameLoop(refs: SceneRefs, world: WorldConfig) {
  const sim = useRef<SimState>(createInitialSim(world));
  const rafId = useRef<number>();
  const lastTime = useRef<number>(0);

  useEffect(() => {
    if (prefersReducedMotion) return;         // loop TIDAK pernah start

    const collide = createCollisionResolver(world.objects);

    function frame(now: number) {
      const dt = Math.min((now - lastTime.current) / 1000, 0.05);
      lastTime.current = now;

      const s = sim.current;
      const { intent, interactPressed } = readInput();
      const paused = gameStore.getState().openModalId !== null;

      // --- SIMULATE ---
      if (!paused) {
        moveCharacter(s, intent, dt, collide);
        updateFacingAndFrame(s, intent, dt);
      }
      updateCamera(s.camera, s.charCenter, s.viewport, world.size, dt);

      // --- RENDER (semua DOM write dikumpulkan di sini) ---
      applyTransforms(refs, s);

      // --- DISCRETE EVENTS (boleh setState, tapi hanya jika berubah) ---
      checkHotspots(s, world.hotspots);
      if (interactPressed) tryInteract(s);

      rafId.current = requestAnimationFrame(frame);
    }

    // start hanya jika visible & on-screen
    const start = () => {
      if (rafId.current) return;
      lastTime.current = performance.now();   // hindari dt raksasa
      rafId.current = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = undefined;
    };

    // ... wiring visibilitychange + IntersectionObserver
    return stop;
  }, [world]);
}
```

### 5.2 Urutan operasi (tidak boleh diubah)

| # | Tahap | Kenapa urutannya begini |
|---|---|---|
| 1 | `readInput()` | Snapshot input sekali per frame, konsisten untuk semua tahap |
| 2 | `moveCharacter()` | Posisi harus final sebelum kamera menghitung target |
| 3 | `updateFacingAndFrame()` | Butuh intent dari tahap 1 |
| 4 | `updateCamera()` | Butuh posisi final dari tahap 2 |
| 5 | `applyTransforms()` | **Semua** DOM write terkumpul di sini — cegah layout thrash |
| 6 | `checkHotspots()` | Butuh posisi final; boleh trigger setState |

**Aturan keras:** tidak ada DOM *read* (`getBoundingClientRect`, `offsetWidth`) di dalam loop. Semua dimensi sudah diketahui dari config atau di-cache saat resize.

### 5.3 Pause/resume

```ts
const shouldRun = !document.hidden && isSectionVisible && !prefersReducedMotion;
```

Saat resume, **wajib** reset `lastTime = performance.now()`. Tanpa ini, `now - lastTime` bisa bernilai 30 detik → walaupun sudah di-clamp ke 0.05, karakter tetap melompat 50ms sekaligus. Lebih aman lagi: skip frame pertama setelah resume.

### 5.4 Delta time clamp

`dt` di-clamp ke maksimum `0.05` (20fps). Konsekuensi: di device yang sangat lambat, game berjalan dalam *slow motion* alih-alih *tunneling* menembus dinding. Ini trade-off yang benar untuk kasus ini — karakter menembus meja jauh lebih merusak daripada gerak melambat.

---

## 6. Model Data

```ts
// lib/types.ts
export type Vec2 = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };
export type Facing = 'front' | 'back' | 'left' | 'right';

export interface Sprite {
  src: string;
  w: number;
  h: number;
}

export interface WorldObject {
  id: string;
  sprite: Sprite;
  pos: Vec2;                 // top-left di world space
  collider?: Rect;           // ABSOLUT di world space, bukan relatif ke pos
  baselineY: number;         // untuk depth sort; biasanya pos.y + sprite.h
  decorative?: boolean;      // true → aria-hidden, tidak pernah punya collider
}

export interface Hotspot {
  id: string;
  triggerZone: Rect;
  badge: { icon: string; label: string; anchor: Vec2 };
  contentId: keyof typeof content;
}

export interface WorldConfig {
  size: Vec2;                // 1448 x 1086
  spawn: Vec2;
  bounds: Rect[];            // 4 dinding sebagai collider terpisah
  objects: WorldObject[];
  hotspots: Hotspot[];
}

// Simulation state — TIDAK di React state
export interface SimState {
  pos: Vec2;                 // top-left karakter di world
  vel: Vec2;
  facing: Facing;
  frameIndex: number;
  frameAccumulator: number;
  camera: Vec2;
  viewport: Vec2;            // dalam world units
  charCenter: Vec2;          // dihitung, cache
}
```

**Keputusan: `collider` absolut, bukan relatif.** Alasannya, saat mengarang layout ruangan kamu bekerja dengan koordinat absolut dari desain gambar. Membuatnya relatif menambah satu langkah mental yang jadi sumber bug saat objek digeser.

### 6.1 Konten (`/data/content.ts`)

```ts
export const content = {
  work:    { type: 'projectList', title: 'Projects', items: Project[] },
  about:   { type: 'richText',    title: 'About',    body: string },
  cv:      { type: 'richText',    title: 'CV',       body: string, pdfUrl: string },
  contact: { type: 'contactCard', title: 'Contact',  links: Link[] },
} as const;
```

Satu sumber kebenaran, dikonsumsi tiga tempat:
1. `Modal.tsx` — saat hotspot dibuka
2. `Navbar.tsx` → modal yang sama
3. `StaticPortfolio.tsx` — dirender di SSG untuk SEO & no-JS

---

## 7. Sprite & Animasi Karakter

### 7.1 Layout aset
4 arah × 4 frame = 16 PNG di `/public/portfolio-game/character/{facing}/{0..3}.png`.

### 7.2 Preload wajib

```ts
// lib/sprites.ts
export async function preloadCharacter(): Promise<void> {
  const urls = FACINGS.flatMap(f => [0,1,2,3].map(i => `/portfolio-game/character/${f}/${i}.png`));
  await Promise.all(urls.map(src => new Promise<void>((res) => {
    const img = new Image();
    img.onload = () => res();
    img.onerror = () => res();       // jangan blokir load karena satu aset gagal
    img.src = src;
  })));
}
```

Tanpa preload, frame pertama tiap arah akan flicker putih saat pertama kali dipakai. Loop **tidak boleh start** sebelum preload selesai (atau timeout 3 detik).

### 7.3 Frame cycling

```ts
const FRAME_DURATION = 0.12;   // detik per frame

function updateFacingAndFrame(s: SimState, intent: Vec2, dt: number) {
  const moving = intent.x !== 0 || intent.y !== 0;

  if (moving) {
    // facing dari komponen dominan; tie-break ke horizontal (terasa lebih natural)
    s.facing = Math.abs(intent.x) >= Math.abs(intent.y)
      ? (intent.x > 0 ? 'right' : 'left')
      : (intent.y > 0 ? 'front' : 'back');

    s.frameAccumulator += dt;
    while (s.frameAccumulator >= FRAME_DURATION) {
      s.frameAccumulator -= FRAME_DURATION;
      s.frameIndex = (s.frameIndex + 1) % 4;
    }
  } else {
    s.frameIndex = 0;              // idle
    s.frameAccumulator = 0;
  }
}
```

**Kenapa `while` bukan `if`:** jika satu frame render memakan 300ms (device tersendat), accumulator perlu mengejar beberapa frame animasi sekaligus. `if` akan membuat animasi tertinggal permanen.

**Tie-break ke horizontal:** saat berjalan diagonal sempurna, memilih sprite kiri/kanan terasa lebih benar daripada depan/belakang untuk perspektif top-down.

### 7.4 Penerapan ke DOM
Tukar `src` pada satu `<img>`, bukan mount/unmount elemen. Karena semua sudah di-preload, penukaran `src` instan dari cache.

Optimasi v2 bila perlu: spritesheet tunggal + `background-position`. Untuk 16 sprite kecil, PNG terpisah cukup dan jauh lebih mudah di-debug.

---

## 8. Collision — Per-Axis AABB

### 8.1 Feet hitbox

```ts
const FEET_W_RATIO = 0.5;      // 50% lebar sprite
const FEET_H = 12;             // px, di world space

function feetHitbox(pos: Vec2, sprite: Sprite): Rect {
  return {
    x: pos.x + (sprite.w * (1 - FEET_W_RATIO)) / 2,
    y: pos.y + sprite.h - FEET_H,
    w: sprite.w * FEET_W_RATIO,
    h: FEET_H,
  };
}
```

Memakai seluruh sprite sebagai hitbox membuat karakter terasa "gemuk" dan tidak bisa lewat celah yang secara visual terlihat cukup. Feet hitbox adalah standar top-down karena yang secara logis menyentuh lantai adalah kaki.

### 8.2 Resolusi per-axis

```ts
export function createCollisionResolver(colliders: Rect[]) {
  return function move(s: SimState, dx: number, dy: number, sprite: Sprite) {
    // --- sumbu X ---
    if (dx !== 0) {
      const nextX = { ...s.pos, x: s.pos.x + dx };
      if (!hitsAny(feetHitbox(nextX, sprite), colliders)) s.pos.x = nextX.x;
    }
    // --- sumbu Y ---
    if (dy !== 0) {
      const nextY = { ...s.pos, y: s.pos.y + dy };
      if (!hitsAny(feetHitbox(nextY, sprite), colliders)) s.pos.y = nextY.y;
    }
  };
}
```

Cek terpisah inilah yang menghasilkan *wall sliding*: berjalan diagonal ke dinding vertikal → X ditolak, Y diterima → karakter meluncur ke atas/bawah alih-alih macet. Tanpa ini, kontrol terasa "lengket" dan amatir.

### 8.3 Broad phase
Dengan <50 collider, brute-force `hitsAny` sudah cukup (50 × 2 axis × 60fps = 6.000 AABB test/detik — tidak terasa). Jika nanti melewati ~200 collider, tambahkan spatial hash grid. **Jangan optimasi sekarang.**

### 8.4 Edge cases

| Kasus | Penanganan |
|---|---|
| Spawn di dalam collider | Validasi saat build: assert spawn tidak overlap collider manapun |
| Karakter terjebak (collider ditambah saat runtime) | Tidak mungkin di v1 (world statis) |
| Kecepatan > lebar collider tertipis | `SPEED * 0.05 < minColliderWidth` — assert di unit test |
| Floating point drift | Bulatkan `pos` ke 2 desimal saat apply transform |

---

## 9. Input

```ts
// hooks/useInput.ts
export interface InputState {
  intent: Vec2;              // ternormalisasi, magnitude 0..1
  interactPressed: boolean;  // edge-triggered, di-consume sekali
}
```

### 9.1 Keyboard

```ts
const KEYMAP: Record<string, keyof Dirs> = {
  ArrowUp: 'up',    KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
};
```

Simpan flag arah di ref (bukan state). Hitung intent saat dibaca:

```ts
function computeIntent(d: Dirs): Vec2 {
  let x = (d.right ? 1 : 0) - (d.left ? 1 : 0);
  let y = (d.down ? 1 : 0) - (d.up ? 1 : 0);
  if (x !== 0 && y !== 0) {          // normalisasi diagonal
    const inv = Math.SQRT1_2;         // 1/√2
    x *= inv; y *= inv;
  }
  return { x, y };
}
```

Tanpa normalisasi, gerak diagonal 41% lebih cepat — bug klasik yang langsung terasa "salah".

**Detail yang mudah terlewat:**
- `preventDefault()` pada arrow keys **hanya** saat scene punya fokus dan modal tertutup. Kalau tidak, user tidak bisa scroll halaman.
- Listener di `window`, tapi cek `document.activeElement` — jangan bajak panah saat user mengetik di form kontak.
- `keyup` bisa hilang saat window blur → reset semua flag pada event `blur`. Tanpa ini karakter "jalan terus" setelah alt-tab.

### 9.2 Touch

| Kontrol | Perilaku |
|---|---|
| Virtual joystick (bottom-left) | Posisi thumb relatif ke pusat → intent vector, magnitude di-clamp 1 |
| Tap-to-move | Tap di scene → target world pos; intent = arah lurus ke target, berhenti saat dekat |
| Tombol interact (bottom-right) | Muncul hanya saat `activeHotspotId !== null` |

Tap-to-move v1 **tanpa pathfinding** — gerak lurus + wall sliding dari collision. Jika macet >0.5 detik, batalkan target. A* ditunda ke v2 (open question #5 di PRD).

Wajib: `touch-action: none` pada area joystick, dan `passive: false` pada listener agar `preventDefault` bekerja mencegah scroll.

---

## 10. Hotspot & Modal

### 10.1 Deteksi proximity

```ts
function checkHotspots(s: SimState, hotspots: Hotspot[]) {
  const feet = feetHitbox(s.pos, CHARACTER_SPRITE);

  let best: string | null = null;
  let bestDist = Infinity;
  for (const h of hotspots) {
    if (!aabb(feet, h.triggerZone)) continue;
    const d = distSq(centerOf(feet), centerOf(h.triggerZone));
    if (d < bestDist) { bestDist = d; best = h.id; }
  }

  // GUARD: setState hanya saat berubah — ini yang menjaga 60fps
  if (best !== gameStore.getState().activeHotspotId) {
    gameStore.getState().setActiveHotspot(best);
  }
}
```

Tie-break jarak terdekat menyelesaikan kasus dua trigger zone yang tumpang tindih tanpa perlu menggambar zona yang rapi sempurna.

### 10.2 State machine

```
        ┌──────┐  feet ∈ zone   ┌──────────┐  interact  ┌──────┐
        │ IDLE │ ─────────────► │ PROMPTED │ ─────────► │ OPEN │
        └──────┘ ◄───────────── └──────────┘ ◄───────── └──────┘
                  feet ∉ zone         Esc/close/outside
                                      │
                    (jika feet sudah keluar zona saat modal
                     ditutup → langsung ke IDLE)
```

Movement input di-nonaktifkan saat `OPEN`, tapi loop tetap jalan (kamera lerp menyelesaikan gerakannya, ambient animation lanjut).

### 10.3 Modal

```tsx
// Modal.tsx — kontrak
createPortal(
  <div className="overlay" onClick={closeOnOutside}>
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialogRef}>
      <h2 id={titleId}>{title}</h2>
      {children}
      <button aria-label="Tutup" onClick={close}>×</button>
    </div>
  </div>,
  document.body
)
```

Checklist implementasi:
- [ ] Focus dipindah ke dialog saat mount; simpan `document.activeElement` sebelumnya
- [ ] Focus trap: `Tab`/`Shift+Tab` melingkar di dalam elemen fokusabel
- [ ] `Esc` menutup (listener di dialog, bukan window)
- [ ] Klik overlay menutup; klik di dalam dialog tidak (cek `e.target === e.currentTarget`)
- [ ] Restore focus ke trigger asal saat unmount
- [ ] Background diberi `inert` (dengan polyfill untuk Safari lama)
- [ ] Scroll lock: `overflow:hidden` + kompensasi `padding-right` selebar scrollbar → cegah layout shift

**Kenapa `inert` selain focus trap:** focus trap menangani keyboard, `inert` menangani screen reader virtual cursor dan klik pointer. Keduanya diperlukan.

---

## 11. Reduced Motion & Fallback

Tiga tingkat degradasi:

| Kondisi | Yang dirender |
|---|---|
| Tanpa JS | `StaticPortfolio` dari SSG — semua konten terbaca, navbar berupa anchor link |
| `prefers-reduced-motion: reduce` | Gambar ruangan statis + semua hotspot jadi tombol permanen yang terlihat; loop **tidak pernah start**; GSAP di-skip |
| Normal | Overworld penuh |

```ts
// hooks/usePrefersReducedMotion.ts — plus override manual
const effective = manualOverride ?? systemPreference;
```

Toggle manual disediakan di navbar ("Mode statis"), sehingga user bisa keluar-masuk terlepas dari setelan OS. Ini juga cara termudah untuk QA fitur ini.

**Aturan implementasi:** `if (reducedMotion) return;` ditaruh di `useEffect` game loop, **bukan** di dalam `frame()`. Loop yang jalan tapi tidak melakukan apa-apa tetap membakar baterai.

---

## 12. Performa

### 12.1 Aturan DOM

```ts
function applyTransforms(refs: SceneRefs, s: SimState) {
  // 1 write per elemen bergerak, tidak ada read
  refs.world.current!.style.transform =
    `scale(${s.scale}) translate3d(${-s.camera.x}px, ${-s.camera.y}px, 0)`;
  refs.char.current!.style.transform =
    `translate3d(${Math.round(s.pos.x)}px, ${Math.round(s.pos.y)}px, 0)`;
}
```

- `translate3d` (bukan `translate`) → GPU layer
- `will-change: transform` **hanya** pada `.world` dan `.character` — bukan pada semua objek (will-change berlebihan justru menghabiskan memori GPU)
- `image-rendering: pixelated` pada semua sprite
- `Math.round` pada posisi → cegah sub-pixel blur pada pixel art

### 12.2 Depth sorting tanpa write tiap frame

`z-index` objek statis dihitung sekali saat mount dari `baselineY`. Hanya karakter yang berubah:

```ts
const nextZ = Math.round(s.pos.y + CHARACTER_SPRITE.h);
if (nextZ !== s.lastZ) {           // guard: biasanya berubah <5× per detik
  refs.char.current!.style.zIndex = String(nextZ);
  s.lastZ = nextZ;
}
```

### 12.3 Loading strategy

| Aset | Strategi |
|---|---|
| Background ruangan | `<link rel="preload">` di `<head>` |
| 16 sprite karakter | Preload via JS sebelum loop start |
| Furnitur | Dimuat bersama scene, `loading="eager"` |
| Gambar project (di modal) | `loading="lazy"`, dimuat saat modal dibuka |
| GSAP | Dynamic import, hanya jika `!reducedMotion` |

### 12.4 Budget

| Metrik | Budget | Diverifikasi di |
|---|---|---|
| JS bundle (initial) | < 180KB gzip | CI (`@next/bundle-analyzer`) |
| Aset scene awal | < 700KB | Manual |
| Frame time p95 | < 16.6ms | Chrome DevTools di device asli, tiap milestone |
| Long tasks saat load | 0 > 200ms | Lighthouse |

---

## 13. Theme

```html
<!-- app/layout.tsx — inline, sebelum paint -->
<script dangerouslySetInnerHTML={{ __html: `
  (function(){
    try {
      var t = localStorage.getItem('theme') || 'system';
      var d = t === 'dark' || (t === 'system' &&
              matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.dataset.theme = d ? 'dark' : 'light';
    } catch(e) {}
  })();
`}} />
```

Harus **inline dan sinkron** — kalau di-load sebagai file eksternal atau di `useEffect`, akan ada flash tema salah.

Yang berubah antar tema: UI chrome (navbar, modal, badge) dan satu overlay pencahayaan di atas scene (`.room-tint`, `mix-blend-mode: multiply`). Sprite ruangan **tidak** diganti atau di-invert — satu set aset, dua mood.

---

## 14. Testing

### 14.1 Unit (Vitest)
- `math.ts`: `lerp`, `clamp`, `aabb`, `normalize` — termasuk edge case nilai negatif dan nol
- `collision`: sliding di dinding, penolakan per-axis, tidak ada penetrasi pada `dt` maksimum
- `camera`: clamp saat world < viewport, konsistensi lerp di dt berbeda
- `computeIntent`: normalisasi diagonal, tombol berlawanan → nol

Property test yang layak ditulis: *untuk sembarang urutan input, feet hitbox tidak pernah overlap collider manapun.*

### 14.2 Integration (Testing Library)
- Hotspot enter → badge muncul dengan `aria-label` benar
- Modal: focus trap, restore focus, Esc, klik luar
- Theme toggle → `data-theme` berubah + tersimpan
- Reduced motion → loop tidak start (spy `requestAnimationFrame`)

### 14.3 E2E (Playwright)
| Skenario | Prioritas |
|---|---|
| Navbar → semua 4 modal terbuka (jalur P1/Rina) | **P0** |
| Keyboard-only: Tab ke navbar, buka modal, Esc, focus kembali | **P0** |
| Karakter bergerak, hotspot terpicu, modal terbuka | P1 |
| Deep-link `?open=work` membuka modal yang benar | P1 |
| Mobile viewport: joystick menggerakkan karakter | P1 |
| Reduced motion: semua konten tercapai tanpa gerak | **P0** |

### 14.4 Manual (checklist rilis)
- Device Android mid-range asli — frame rate & responsivitas joystick
- iOS Safari — `touch-action`, safe area, tidak ada bounce scroll
- VoiceOver/NVDA menelusuri konten statis
- Lighthouse: Perf ≥90, A11y ≥90
- Console bersih di semua flow

---

## 15. Keputusan yang Ditunda ke v2

| Item | Kenapa ditunda |
|---|---|
| Spritesheet + `background-position` | 16 PNG terpisah sudah memenuhi budget; optimasi prematur |
| Spatial hash untuk collision | <50 collider; brute force tidak terukur di profil |
| A* pathfinding untuk tap-to-move | Gerak lurus + sliding cukup untuk ruangan tunggal |
| Multiple rooms / transisi pintu | Butuh sistem scene management yang tidak dibutuhkan v1 |
| Sound FX | Autoplay policy + toggle mute + preload audio = kompleksitas tidak sebanding |
| Object pooling partikel | Belum ada partikel |

---

## 16. Risiko Teknis

| # | Risiko | Deteksi dini | Mitigasi |
|---|---|---|---|
| T1 | Ada `setState` bocor ke dalam loop → frame drop | React DevTools Profiler saat M2 | Code review khusus; guard `if (next !== prev)` di semua dispatch dari loop |
| T2 | iOS Safari `touch-action` / scroll bounce merusak joystick | Uji device asli di M2, bukan M5 | `touch-action: none`, `passive: false`, `overscroll-behavior: none` |
| T3 | Skala pecahan menghasilkan shimmer pada pixel art | Visual check di M1 | Bulatkan skala ke kelipatan 0.5; `Math.round` posisi |
| T4 | GSAP menambah bundle signifikan | Bundle analyzer di CI | Dynamic import, hanya plugin yang dipakai |
| T5 | `inert` tidak didukung Safari lama | Browser matrix test | Polyfill + focus trap sebagai lapisan kedua |
| T6 | Zustand subscribe tidak sengaja dipakai di komponen scene → re-render | Profiler | Scene pakai `getState()` imperatif; hanya UI chrome yang subscribe |

---

## Appendix A — Kontrak Antar Modul

| Modul | Input | Output | Boleh setState? |
|---|---|---|---|
| `useInput` | DOM events | `{ intent, interactPressed }` | Tidak |
| `useCollision` | `world.objects` | `move(s, dx, dy)` | Tidak |
| `camera.ts` | pos, viewport, world, dt | mutasi `s.camera` | Tidak |
| `sprites.ts` | facing, frameIndex | src string | Tidak |
| `useHotspots` | `s.pos`, hotspots | — | **Ya**, dengan guard perubahan |
| `useGameLoop` | refs, world | — | Hanya via `useHotspots` |
| `gameStore` | actions | discrete state | — |

**Satu aturan yang merangkum semuanya:** kalau sebuah modul dipanggil 60× per detik, ia tidak boleh menyentuh React.
