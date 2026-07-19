# PRD — Interactive Pixel-Art Portfolio ("The Room")

| Field | Value |
|---|---|
| Versi dokumen | 1.0 |
| Status | Draft for review |
| Owner | Umar (Product + Engineering) |
| Target rilis | v1.0 (single room) |
| Platform | Web (desktop + mobile browser) |
| Stack | DOM/CSS scene + satu `requestAnimationFrame` loop |

---

## 1. Problem Statement

Portfolio front-end developer hari ini seragam: satu halaman panjang, grid project, tombol download CV. Hasilnya dua masalah sekaligus:

1. **Tidak memorable.** Recruiter melihat 40 portfolio sehari; tidak ada satupun yang diingat setelah 5 menit.
2. **Tidak membuktikan skill.** Klaim "berpengalaman di animasi & interaksi kompleks" ditulis sebagai teks, bukan didemonstrasikan.

Portfolio ini menyelesaikan keduanya: **artefaknya sendiri adalah bukti skill**, dan formatnya (ruangan pixel-art yang bisa dijelajahi) menciptakan ingatan.

**Constraint yang tidak bisa ditawar:** recruiter yang buru-buru tidak boleh jadi korban dari keputusan kreatif ini. Kalau eksplorasi jadi syarat untuk melihat project, produk ini gagal — seberapapun kerennya.

---

## 2. Goals & Non-Goals

### 2.1 Goals
| # | Goal | Cara diukur |
|---|---|---|
| G1 | Konten inti (project, CV, kontak) selalu bisa diakses tanpa memainkan game | Ada jalur navbar ≤2 klik dari cold load, diverifikasi di semua breakpoint |
| G2 | Mendemonstrasikan kemampuan front-end/animasi secara nyata | 60fps di mid-range device, movement terasa responsif (<100ms input-to-motion) |
| G3 | Accessible & performant, bukan hanya "keren" | Lighthouse Perf ≥90, A11y ≥90, WCAG 2.1 AA |
| G4 | Berfungsi setara di desktop & mobile | Semua Must-have feature jalan di iOS Safari + Android Chrome |

### 2.2 Non-Goals (v1)
- Bukan game engine umum; tidak ada level editor, entity system generik, atau physics engine.
- Tidak ada backend, autentikasi, save state server-side, database.
- Tidak ada multiplayer / presence / cursor sharing.
- Tidak menggantikan resume PDF — jalur "boring" (PDF + halaman teks statis) tetap wajib ada.
- Tidak ada analytics kustom kompleks (satu event tracker sederhana boleh).
- Mini-game sekunder, multiple rooms, sound FX → **v2**.

---

## 3. Personas & Kritikal Skenario

### P1 — "Rina, Recruiter yang buru-buru" (persona utama, prioritas #1)
Buka link dari CV, punya ~60 detik, sedang buka 12 tab lain. Tidak tahu WASD, tidak peduli pixel art.
**Job to be done:** verifikasi kandidat ini bisa coding dan lihat 2–3 project.
**Failure mode yang harus dicegah:** dia melihat karakter di layar, tidak tahu harus apa, lalu menutup tab.
**Mitigasi:** navbar permanen di atas, terlihat sebelum scene selesai load, dengan label eksplisit "Work · About · CV · Contact".

### P2 — "Dimas, Sesama developer/designer"
Datang dari Twitter/LinkedIn, punya waktu, menikmati detail. Akan buka DevTools, cek Network tab, cek apakah keyboard-accessible.
**JTBD:** menilai craft — apakah collision terasa enak, apakah reduced-motion benar-benar dihormati.

### P3 — "Pak Budi, Klien non-teknis"
Cari kontak dan bukti bahwa developer ini "bisa bikin yang begini".
**JTBD:** ketemu tombol kontak. Titik.

### P4 — "Pengguna assistive tech"
Screen reader atau keyboard-only. Harus dapat pengalaman setara, bukan pengalaman "maaf, buka versi mobile".

**Prinsip turunan:** setiap keputusan desain diuji terhadap Rina lebih dulu, Dimas kedua.

---

## 4. Product Scope — MoSCoW

### 4.1 Must Have (blocking untuk rilis)
| ID | Fitur |
|---|---|
| M-01 | World scene ter-render dari sprite (DOM/CSS layers) |
| M-02 | Karakter berjalan 4 arah + walk animation, idle state |
| M-03 | Collision terhadap furnitur & batas ruangan (feet hitbox, per-axis) |
| M-04 | Kamera follow karakter dengan clamp ke batas world |
| M-05 | Depth sorting berbasis koordinat Y |
| M-06 | Sistem hotspot: proximity → badge prompt → interact |
| M-07 | Modal konten (work, about, contact, CV) dengan focus trap |
| M-08 | Navbar navigasi langsung (bypass game sepenuhnya) |
| M-09 | Theme light/dark/system + persist |
| M-10 | Responsive layout + kontrol touch |
| M-11 | `prefers-reduced-motion` fallback (versi statis) |
| M-12 | Keyboard accessible end-to-end |
| M-13 | Konten portfolio ada di DOM saat initial load (SEO/no-JS baseline) |

### 4.2 Should Have
S-01 Loading splash dengan progress · S-02 Entrance animation · S-03 Deep-link `?open=work` · S-04 Ambient animation (api berkedip, partikel debu) · S-05 Persist last position karakter di sessionStorage

### 4.3 Could Have
C-01 Sound FX + toggle mute (default **off**) · C-02 Particle effects · C-03 Easter egg · C-04 Konami code

### 4.4 Won't Have (v1)
Backend, akun, mini-game, multiple rooms/pintu, in-browser level editor, leaderboard.

---

## 5. Functional Requirements

### FR-1 — Movement
**Deskripsi.** Karakter bergerak di world coordinate berbasis delta time, bukan per-frame.

| Aspek | Spesifikasi |
|---|---|
| Input desktop | Arrow keys + WASD (keduanya aktif simultan) |
| Input mobile | Virtual joystick (bottom-left) **dan** tap-to-move ke titik |
| Kecepatan | Konstan, `SPEED` px/detik, dikalikan `deltaTime` |
| Diagonal | Vektor dinormalisasi (tidak boleh lebih cepat dari lurus) |
| Delta clamp | `dt` di-clamp maks 50ms untuk cegah tunneling setelah tab idle |
| Sprite | 4 folder arah: front/back/left/right; frame cycle saat bergerak, frame idle saat diam |
| Facing | Arah terakhir dipertahankan saat berhenti |

**Acceptance criteria**
- [ ] Menahan dua tombol berlawanan → karakter diam, tidak jitter.
- [ ] Diagonal speed = orthogonal speed (±2%).
- [ ] Pindah tab 30 detik lalu kembali → karakter tidak "teleport" menembus dinding.
- [ ] Input-to-visible-motion < 100ms.
- [ ] Melepas semua tombol → animasi kembali ke idle frame dalam ≤1 frame cycle.

### FR-2 — Collision
**Deskripsi.** Setiap objek solid punya bounding box (rect) di world coordinate. Karakter memakai **feet hitbox** — kotak kecil di kaki (± lebar sprite × 40%, tinggi 12px), bukan seluruh sprite — agar collision terasa natural pada perspektif top-down.

**Resolusi per-axis:** cek X dan Y secara terpisah, tolak hanya axis yang bertabrakan. Ini memungkinkan "sliding" di sepanjang dinding.

```
moveX()  → jika collide, kembalikan posisi X, pertahankan Y
moveY()  → jika collide, kembalikan posisi Y, pertahankan X
```

**Acceptance criteria**
- [ ] Karakter tidak pernah masuk ke dalam furnitur solid.
- [ ] Jalan diagonal ke dinding → karakter meluncur sepanjang dinding, tidak berhenti total.
- [ ] Tidak ada posisi di mana karakter terjebak permanen (soft-lock).
- [ ] Batas world dihormati di keempat sisi.
- [ ] Debug overlay (`?debug=1`) menampilkan semua hitbox.

### FR-3 — Depth Sorting
`z-index` tiap objek dan karakter dihitung dari koordinat Y baseline (kaki objek), bukan dari titik atas. Update z-index karakter hanya saat baseline berubah melewati threshold (hindari write DOM tiap frame).

**AC:** karakter berdiri di atas garis baseline meja → tampil di depan meja; di bawah baseline → tampil di belakang. Tidak ada flicker saat melewati baseline.

### FR-4 — Hotspot System
Tiap hotspot punya `triggerZone` (rect) yang lebih besar dari objeknya.

**State machine:**
```
IDLE → (feet hitbox enter zone) → PROMPTED → (E/Enter/Space/tap) → OPEN
OPEN → (Esc / close / click outside) → PROMPTED (jika masih di zona) atau IDLE
```
- Badge prompt muncul di atas objek dengan animasi bounce ringan.
- Badge adalah `<button>` HTML nyata dengan `aria-label` deskriptif ("Buka daftar project"), bukan div.
- Jika dua zona overlap, hotspot dengan jarak terdekat ke feet hitbox yang menang.

**AC**
- [ ] Badge muncul/hilang tanpa lag saat masuk/keluar zona.
- [ ] Badge bisa ditekan langsung via tap di mobile.
- [ ] Badge masuk ke tab order saat aktif, keluar saat tidak aktif.
- [ ] Menekan E berulang tidak membuka modal ganda.

### FR-5 — Modal
Konten diambil dari config data (JSON/TS), bukan hardcode di markup interaktif.

**Wajib:**
- Focus trap di dalam modal.
- Close via `Esc`, klik area luar, dan tombol X eksplisit.
- Focus dikembalikan ke elemen pemicu (badge atau navbar item) saat ditutup.
- Body scroll-lock saat terbuka, dikembalikan saat tutup (tanpa layout shift).
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby`.
- Game loop input di-pause saat modal terbuka (karakter tidak bergerak saat user mengetik).

**AC**
- [ ] Tab di dalam modal tidak pernah keluar ke background.
- [ ] Screen reader mengumumkan judul modal saat dibuka.
- [ ] Scroll position halaman tidak lompat setelah modal ditutup.

### FR-6 — Direct Menu (kritikal untuk P1)
Navbar persisten berisi: **Work · About · CV · Contact**. Membuka modal yang **sama persis** dengan hotspot. Harus ter-render dan interaktif **sebelum** scene selesai memuat aset.

**AC**
- [ ] Dari cold load, klik "Work" bisa dilakukan dalam ≤2 detik (bahkan saat sprite masih loading).
- [ ] Navbar terlihat tanpa scroll di semua breakpoint ≥320px.
- [ ] Semua konten inti tercapai dalam ≤2 aksi.

### FR-7 — Theme
Toggle light / dark / system. Persist di `localStorage`. Sinkron dengan `prefers-color-scheme` saat mode "system". Scene sprite tetap konsisten (tidak di-invert); yang berubah adalah UI chrome + overlay pencahayaan ruangan.

**AC:** tidak ada flash of wrong theme (FOUC) saat reload — resolve tema di inline script sebelum paint.

### FR-8 — Reduced Motion (M-11)
Jika `prefers-reduced-motion: reduce`:
- Game loop **tidak dijalankan sama sekali**.
- Scene ditampilkan sebagai gambar statis.
- Semua hotspot menjadi tombol yang selalu terlihat (bukan proximity-based).
- Entrance/ambient animation dinonaktifkan.
- Ada toggle manual untuk masuk/keluar mode ini, terlepas dari OS setting.

---

## 6. Non-Functional Requirements

### 6.1 Performa
| Metrik | Target |
|---|---|
| Frame rate | 60fps di mid-range Android (setara Pixel 6a / Redmi Note) |
| LCP | < 2.5s di Slow 4G |
| CLS | < 0.1 |
| INP | < 200ms |
| Total initial payload | < 1.2MB (termasuk sprite ruangan awal) |

**Aturan loop:**
- Loop hanya berjalan saat tab visible (`visibilitychange`) **dan** section on-screen (`IntersectionObserver`).
- `devicePixelRatio` di-cap di 2.
- Tidak ada layout read/write thrashing — batch DOM writes, gunakan `transform` bukan `top/left`.
- Sprite non-kritis lazy-load; sprite ruangan awal di-preload.

### 6.2 Aksesibilitas
- WCAG 2.1 Level AA.
- Full keyboard operability, focus indicator terlihat jelas (kontras ≥3:1).
- Semua interaksi game punya padanan non-game.
- Kontras teks ≥4.5:1 di kedua tema.
- Tidak ada konten yang hanya disampaikan lewat warna atau gerakan.

### 6.3 Kompatibilitas
Chrome, Firefox, Safari, Edge (2 versi terakhir). iOS Safari 16+, Android Chrome. Graceful degradation: tanpa JS → konten portfolio tetap terbaca sebagai halaman statis.

### 6.4 SEO
Konten portfolio ada di DOM saat initial render (SSR/SSG), bukan hanya di dalam modal yang di-inject lazy. Meta tags + OG image (screenshot ruangan). Structured data `Person` + `CreativeWork`.

---

## 7. Data Model

```ts
type Vec2 = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number };

interface WorldConfig {
  size: Vec2;              // dimensi world dalam px
  spawn: Vec2;             // posisi awal karakter
  colliders: Rect[];       // batas + furnitur solid
  layers: SceneLayer[];
}

interface SceneLayer {
  id: string;
  src: string;
  baselineY: number | null; // null = layer tanpa depth sorting (lantai/dinding)
  parallax?: number;
}

interface Hotspot {
  id: 'work' | 'about' | 'cv' | 'contact';
  label: string;           // untuk badge + aria-label
  anchor: Vec2;            // titik badge muncul
  triggerZone: Rect;
  content: ContentRef;
}

interface ContentRef {
  type: 'projectList' | 'richText' | 'contactCard' | 'external';
  data: unknown;
}
```

**Prinsip:** world layout, hotspot, dan konten adalah **data**, bukan kode. Menambah project = edit satu file config, bukan menyentuh game loop.

---

## 8. Analytics & Success Metrics

| Metrik | Target v1 | Cara ukur |
|---|---|---|
| Time to first core content | < 10 detik (median) | Event `content_opened` pertama |
| Bounce rate | < 45% | Session tanpa event apapun |
| % pengunjung yang membuka ≥1 project | > 60% | Event `content_opened` type=work |
| % yang memakai navbar vs hotspot | Dipantau (bukan target) | Property `source` di event |
| Console errors | 0 | Manual + sanity check rilis |
| Lighthouse Perf / A11y | ≥ 90 / ≥ 90 | CI check |
| Mobile completion parity | ≥ 90% dari desktop | Segmentasi event |

**Insight yang dicari:** jika >85% memakai navbar dan hampir tidak ada yang menggerakkan karakter, itu sinyal bahwa affordance eksplorasi kurang jelas — bukan sinyal untuk menghapus game.

---

## 9. Risks & Mitigations

| # | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| R1 | Efek "wow" mengalahkan fungsi; recruiter bingung | Tinggi | Navbar langsung wajib, di-render lebih dulu; user test dengan 3 non-developer sebelum rilis |
| R2 | Konsistensi sprite sulit (perspektif, palet, ukuran) | Sedang | Alokasikan buffer waktu produksi aset 2×; kunci style guide (palet + grid + sudut pandang) sebelum menggambar aset kedua |
| R3 | Kontrol mobile awkward | Tinggi | Uji di device asli (bukan emulator) sejak M2; sediakan tap-to-move sebagai alternatif joystick |
| R4 | Over-scope (mini-game, multi-room) | Sedang | Won't-have list dikunci; ide baru masuk backlog v2, bukan v1 |
| R5 | Performa jeblok di low-end Android | Sedang | Budget performa dicek tiap milestone, bukan di akhir; cap DPR; profil di device asli di M2 |
| R6 | Aset besar merusak LCP | Sedang | Sprite atlas + WebP/AVIF; preload hanya aset ruangan awal |
| R7 | Reduced-motion jadi warga kelas dua | Sedang | Jadikan Must-have (M-11) dan uji setiap milestone, bukan ditambal di akhir |

---

## 10. Milestones & Definition of Done

| Milestone | Deliverable | Definition of Done |
|---|---|---|
| **M1** | Scene statis + kamera | Ruangan ter-render, kamera clamp benar di keempat sisi, 60fps idle |
| **M2** | Movement + collision | FR-1 & FR-2 AC lolos; diuji di 1 device Android asli |
| **M3** | Satu hotspot + modal | FR-4 & FR-5 AC lolos; focus trap terverifikasi keyboard-only |
| **M4** | Semua konten + navbar + theme | FR-6 & FR-7 AC lolos; semua konten inti tercapai ≤2 aksi |
| **M5** | Mobile + a11y + reduced-motion | Lighthouse A11y ≥90; FR-8 lolos; touch control diuji di iOS + Android |
| **M6** | Polish + deploy | Lighthouse Perf ≥90; 0 console error; OG image; domain live |

**Gate antar milestone:** tidak boleh lanjut ke milestone berikutnya sebelum AC milestone sebelumnya lolos. Ini mencegah bug collision terbawa sampai M5.

---

## 11. Open Questions

1. **Framework?** Vanilla + Vite, atau Next.js untuk SSR/SEO? Requirement SEO (§6.4) condong ke SSG/SSR — perlu diputuskan sebelum M1.
2. **Sumber aset sprite** — digambar sendiri, asset pack berlisensi, atau kombinasi? Menentukan risiko R2 dan timeline.
3. **CV** — modal berisi versi HTML, atau langsung download PDF? Rekomendasi: keduanya (HTML untuk SEO, tombol PDF di dalamnya).
4. **Persist posisi karakter** (S-05) — berguna atau membingungkan saat kembali? Cenderung skip di v1.
5. **Tap-to-move pathfinding** — perlu A* atau cukup gerak lurus + slide di collider? Rekomendasi: gerak lurus dulu, evaluasi di M5.
6. **Deep-link `?open=work`** — apakah juga memindahkan karakter ke hotspot terkait, atau hanya membuka modal? Rekomendasi: hanya buka modal, karakter tetap di spawn.

---

## 12. Appendix — Prinsip Desain

1. **Game adalah lapisan, bukan gerbang.** Setiap konten harus punya dua jalur: melalui eksplorasi dan melalui menu. Selalu.
2. **Data over code.** Menambah project tidak boleh menyentuh game loop.
3. **Ukur di device asli.** Emulator berbohong tentang performa touch dan frame timing.
4. **A11y adalah requirement, bukan polish.** Diuji tiap milestone.
5. **Bila ragu, menangkan Rina.** Persona recruiter yang buru-buru selalu menang atas persona developer yang menikmati detail.
