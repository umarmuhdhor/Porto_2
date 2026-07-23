# PRD — Portfolio v2: Cinematic Scroll Experience

| Field | Value |
|---|---|
| Versi dokumen | 2.0 |
| Status | Draft for review |
| Owner | Umar (Product + Engineering) |
| Sumber referensi | Observasi teknis portfolio Nithin M Warrier (situs Awwwards) |
| Target rilis | v2.0 |
| Platform | Web (desktop + mobile browser) |
| Stack utama | Next.js (App Router) + Tailwind CSS + Lenis + GSAP (ScrollTrigger) + Framer Motion + Three.js (React Three Fiber) |

---

## 1. Latar Belakang & Tujuan

Dokumen ini menggantikan arah desain portfolio sebelumnya ("The Room" — ruangan pixel-art interaktif). Arah baru diambil dari observasi mendalam terhadap portfolio Nithin M Warrier: sebuah portfolio kelas Awwwards yang mengandalkan **smooth-scroll sinematik**, **sticky-stacking section**, **SVG line-drawing animation**, dan **objek 3D mengambang (Three.js)** sebagai pembeda utama — bukan game/eksplorasi ruangan.

Tujuan produk:
1. Membangun portfolio pribadi yang membuktikan kemampuan front-end/animasi lewat pengalaman itu sendiri (show, don't tell), meniru level craft referensi di atas.
2. Tetap fungsional sebagai etalase case study yang jelas dan mudah dinavigasi — bukan sekadar pameran efek.
3. Menghasilkan situs yang ringan secara DOM, cepat (SSG + edge caching), dan dioptimasi untuk submission ke galeri desain (Awwwards, Godly, dsb).

**Constraint yang tidak bisa ditawar:** kompleksitas animasi tidak boleh mengorbankan keterbacaan konten inti (project, kontak, CV) maupun performa di device mid-range.

---

## 2. Goals & Non-Goals

### 2.1 Goals
| # | Goal | Cara diukur |
|---|---|---|
| G1 | Smooth-scroll sinematik dengan sticky-stacking section terasa mulus di desktop & mobile | 60fps saat scroll di mid-range device, tidak ada jank/layout shift |
| G2 | Section 3D (Three.js) dan SVG line-draw berjalan tanpa menurunkan skor performa | Lighthouse Perf ≥85 (desktop), ≥75 (mobile) meski canvas-heavy |
| G3 | Struktur halaman case study konsisten dan mudah di-maintain untuk banyak project | Template case study reusable, project baru bisa ditambah <1 hari kerja |
| G4 | Identitas visual (tipografi, warna) unik untuk brand pribadi, bukan tiruan identik | Palet & font final berbeda dari referensi, terinspirasi bukan copy 1:1 |
| G5 | Aksesibilitas dasar tetap terjaga di tengah situs animasi berat | Ada `prefers-reduced-motion` fallback, semua CTA reachable via keyboard |

### 2.2 Non-Goals (v2)
- Tidak mereplikasi 100% aset, model 3D (`.glb`), atau font berlisensi trial/personal-use milik referensi.
- Tidak membangun CMS/backend untuk case study — konten dikelola sebagai data lokal (MDX/JSON) di repo.
- Tidak ada multiplayer/cursor-sharing/live collaboration.
- Tidak menggantikan CV/resume PDF — tetap disediakan sebagai unduhan terpisah.
- Blog, dark/light theme toggle, multi-bahasa → v3 (opsional, out of scope sekarang).

---

## 3. Tech Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js (App Router, React Server Components) | SSG/ISR untuk performa, konvensi routing bersih (`/works/[slug]`) |
| Bundler | Turbopack (bawaan Next.js dev) | Standar Next.js terbaru |
| Styling | Tailwind CSS (dengan arbitrary values seperlunya) | Sama seperti referensi; cepat untuk layout presisi (`left-[5%]`, dll) |
| Smooth scroll | Lenis | Jadi "clock" utama yang menyinkronkan semua animasi ke posisi scroll |
| Scroll-linked animation | **GSAP + ScrollTrigger** | Driver utama buat sticky-stacking transition, SVG dash-array line-draw, parallax, dan scroll-position 3D — di-sync ke Lenis via `ScrollTrigger.scrollerProxy` / `lenis.on('scroll', ScrollTrigger.update)` |
| UI motion / micro-interactions | Framer Motion | Transisi masuk (reveal) non-scroll, hover text-roll nav, state transitions React (mount/unmount) |
| 3D | Three.js r18x via React Three Fiber | Membungkus WebGL dalam komponen React yang idiomatik, posisi objek di-drive GSAP timeline |
| Hosting | Vercel | Edge caching, prerendering statis, region terdekat (mis. `sin1` Singapura) |
| Analytics | Vercel Web Analytics + Speed Insights, di-proxy lewat rewrite `next.config` | Hindari pemblokiran ad-blocker tanpa perlu GA/Umami pihak ketiga |
| Gambar | `next/image` + format WebP | Resize & kompresi otomatis, lazy-load di bawah lipatan |

**Pembagian tugas motion library** (biar gak tumpang tindih & gak dobel-drive satu elemen dari dua sumber):
- **GSAP + ScrollTrigger** → semua yang terikat posisi scroll: sticky-stacking pin/transition, SVG dash-array line-draw, parallax transform, posisi/rotasi objek 3D.
- **Framer Motion** → semua yang terikat React state/lifecycle, bukan scroll: reveal saat mount, hover/tap interaction (nav text-roll), page transition.
- **Lenis** tetap jadi scroll engine tunggal; GSAP `ScrollTrigger` disinkronkan ke event scroll Lenis, bukan native `window.scroll`.

**Lisensi GSAP:** sejak GSAP versi bebas (termasuk seluruh plugin termasuk `ScrollTrigger`, `SplitText`) di-*open-source*-kan di bawah Webflow, semua plugin yang dipakai di PRD ini gratis dipakai komersial — tidak ada risiko lisensi seperti kasus font di §12.

**Catatan implementasi:** semua path canggih di atas (Lenis + sticky stacking + Three.js + SVG dash-array) harus di-*progressive enhance* — situs tetap bisa discroll & dibaca normal jika salah satu layer gagal load (mis. WebGL tidak didukung).

---

## 4. Sistem Desain

### 4.1 Tipografi

Referensi memakai 4 font kustom dengan peran terpisah (display/body/system/aksen). Struktur perannya diadopsi, **tapi font aktualnya harus diganti** karena isu lisensi (lihat §12).

| Peran | Font referensi (jangan dipakai langsung) | Rekomendasi pengganti (lisensi jelas) |
|---|---|---|
| Display/Hero | Trobika | Cari font display serupa dengan lisensi komersial (mis. dari Google Fonts, Fontshare, atau beli lisensi resmi) |
| Body/UI | Aeonik (TRIAL) | Alternatif geometric sans berlisensi bebas (mis. Fontshare "General Sans"/"Switzer", atau beli Aeonik resmi) |
| Sistem/Sans fallback | Geist (variable, 100–900) | **Bisa dipakai langsung** — Geist dari Vercel gratis & open |

**Update verifikasi live (22 Jul 2026):** font **Tempting** (peran aksen/script) ternyata **tidak dipakai di elemen manapun** — dicek langsung lewat `getComputedStyle` ke seluruh DOM beranda & case study, hasilnya 0 elemen. Elemen "tanda tangan" terakota yang terlihat di atas nama hero adalah SVG line-art (bagian sistem dash-array §6), bukan teks berfont Tempting. **Kesimpulan: peran font aksen/script di-drop dari v2 sepenuhnya** — tidak perlu dicari penggantinya, cukup buat aset SVG kalau motif serupa dibutuhkan.

Teknik animasi teks per-karakter (setiap huruf hero dibungkus `<span>` inline-block terpisah untuk animasi split-text) tetap diadopsi sebagai signature interaksi.

### 4.2 Palet Warna

Struktur 4 warna inti diadopsi sebagai kerangka, nilai HEX final disesuaikan brand pribadi:

| Peran | Referensi | Catatan untuk v2 |
|---|---|---|
| Latar terang dominan | `#f7f1ed` (krem hangat) | Bisa dipertahankan/disesuaikan sedikit |
| Section kontras gelap | `#242424` (abu gelap) | Bisa dipertahankan |
| Aksen energik | `#FFE862` / `#FFD640` (kuning) | Ganti ke warna aksen milik brand sendiri agar tidak terasa 1:1 tiruan |
| Aksen garis/brush | `rgb(228,143,91)` (terakota) | Opsional ganti, terakota ini terinspirasi warna brand Claude — pertimbangkan warna lain agar orisinal |
| Teks | Hitam + `rgb(99,99,99)` abu | Dipertahankan sebagai standar hierarki teks |

---

## 5. Arsitektur Scroll & Section (Beranda)

### 5.1 Smooth Scroll Engine
- Gunakan **Lenis** sebagai driver smooth-scroll utama. `<html>` mendapat class `lenis` + `overscroll-none` untuk mencegah native bounce.
- **GSAP ScrollTrigger** didaftarkan sebagai konsumen event scroll Lenis (bukan native `window.scroll`), jadi satu sumber kebenaran posisi scroll dipakai bersama oleh Lenis (visual smoothing) dan ScrollTrigger (animation trigger/progress).
- Semua animasi scroll-linked (parallax, dash-array SVG, posisi 3D) didefinisikan sebagai GSAP timeline yang di-`scrub` ke progress ScrollTrigger.

### 5.2 Sticky Stacking
- Section pertama (hero background): `position: fixed; inset: 0; height: 120vh`.
- Section berikutnya (dark section, light section): masing-masing dikontrol oleh `ScrollTrigger` dengan `pin: true` (pengganti/pendamping `sticky top-0 h-screen` murni CSS), membuat efek section saling menumpuk/menggantikan saat discroll — bukan sekadar scroll-through biasa. `pin` GSAP dipilih karena kasih kontrol timeline (opacity/scale crossfade antar-section) yang tidak bisa didapat dari `position: sticky` polos.
- Elemen dekoratif permanen: garis bingkai vertikal `fixed left-[5%]` / `right-[5%]`, dan satu tab menempel di tepi (mis. label sosial atau "Available for work") di `fixed right-*`.

### 5.3 Struktur Section Beranda (v2, disesuaikan brand pribadi)
1. **Hero** — nama besar dengan split-text animation per huruf, background fixed.
2. **Intro/tentang singkat** — dark section, sticky, dengan SVG line-draw animation (lihat §6).
3. **Value proposition / pendekatan kerja** — light section, sticky.
4. **Showcase project unggulan** — grid/bento preview ke case study.
5. **3D interactive section** — objek 3D mengambang (lihat §7).
6. **Footer/kontak** — section warna aksen terang, CTA kontak + social links, credit line ("Designed in Figma", "Built with [stack]").

### 5.4 Micro-interaction Navigasi
- Menu pil mengambang (floating pill nav) berisi 3 item: **HOME, WORKS, CONTACT**.
- Hover pada label menu memakai teknik text-roll/flip: setiap huruf label di-duplikasi dalam DOM, satu set huruf bergeser keluar sementara duplikatnya bergeser masuk (efek gulungan vertikal).
- Cursor kustom (opsional, evaluasi kebutuhan) dengan z-index tinggi mengikuti posisi mouse.
- Transisi antar-section terang↔gelap dihias motif brush-stroke organik (aset `.webp`), bukan garis lurus.

---

## 6. Animasi SVG Line-Drawing (Self-Drawing Line)

- Satu (atau lebih) garis vektor menggambar dirinya sendiri mengikuti posisi scroll di section dark.
- Teknik: manipulasi `stroke-dasharray` empat-nilai dinamis (bukan sekadar `stroke-dashoffset` tunggal), diinterpolasi terhadap panjang total path via progres scroll.
- Path terpisah untuk aksen warna (mis. terakota) dengan `stroke-width` yang berubah bertahap sepanjang scroll untuk ilusi garis tangan menebal.
- **Implementasi:** SVG di-export dari Figma/Illustrator, path length dihitung via `getTotalLength()`. Animasi digerakkan oleh **GSAP timeline + ScrollTrigger** (`scrub: true`) yang menulis nilai `stroke-dasharray`/`stroke-width` per frame sesuai `onUpdate`/`progress` ScrollTrigger — dipilih ketimbang Framer Motion `useScroll` karena timeline GSAP lebih presisi untuk sequencing multi-path (17 dari 42 path) dengan offset berbeda-beda.
- **Verifikasi live (22 Jul 2026):** angka 17/42 path terkonfirmasi lewat inspeksi DOM langsung. "Tanda tangan" terakota kecil di atas nama hero juga bagian dari sistem SVG ini (bukan font — lihat §4.1 catatan lisensi di bawah), jadi teknik ini dipakai di ≥2 titik: hero signature-line dan section dark.

---

## 7. Elemen 3D (Three.js / React Three Fiber)

- Render model `.glb` custom (dibuat sendiri atau dari sumber royalty-free/lisensi jelas) yang merepresentasikan brand pribadi — bukan menyalin model referensi (logo Figma 3D, dsb tidak relevan untuk brand sendiri).
- Objek mengambang & berotasi, posisinya terikat ke progres scroll via **GSAP ScrollTrigger** (`gsap.to(meshRef.current.rotation/position, {scrollTrigger: {...}})`), dan idealnya bereaksi ringan terhadap posisi kursor (parallax tilt, di-handle terpisah lewat R3F `useFrame`, bukan ScrollTrigger).
- Muat model `.glb` secara asinkron/lazy (jangan blocking initial render) — gunakan `Suspense` dari React Three Fiber.
- Canvas WebGL tambahan (opsional) untuk efek background interaktif (grid titik/partikel) di section aksen — evaluasi kebutuhan vs kompleksitas; boleh di-skip di v2 jika trade-off performa tidak sepadan.
- **Fallback wajib:** jika WebGL tidak tersedia atau `prefers-reduced-motion` aktif, tampilkan versi statis (gambar/poster) sebagai pengganti canvas.
- **Temuan verifikasi live (22 Jul 2026):** beranda referensi menjalankan **7 canvas sekaligus** (1 canvas 2D + 6 context WebGL2 terpisah, ukuran render 300×150px s.d. 2560×1728px) — jauh lebih berat dari asumsi awal "beberapa canvas Three.js + 1-2 tambahan". **v2 dibatasi maksimal 2-3 context WebGL aktif bersamaan** (idealnya 1 context R3F yang menampung semua objek 3D + 1 canvas 2D untuk efek partikel/garis kalau memang perlu) — konsolidasi context adalah requirement performa, bukan nice-to-have.

---

## 8. Halaman Case Study (`/works/[slug]`)

Template konsisten untuk setiap project, mengikuti struktur referensi:

1. Breadcrumb: `Projects / [Nama Project]`.
2. Logo & judul project, kategori, tahun.
3. Paragraf ringkasan singkat.
4. Tag layanan berbentuk pill (mis. "Product design", "Visual branding", "Front-end dev").
5. Dua kolom: **Challenge** dan **Role**.
6. Galeri visual bento-grid: kombinasi gambar full-width dan grid dua-kolom asimetris, kartu bersudut membulat.
7. Navigasi bawah: "Go back to projects" dan "Scroll to top".

**SEO per halaman:** `title`, `description`, dan `twitter:card: summary_large_image` unik per project. Open Graph image **wajib** dibuat unik per project — **terverifikasi langsung (22 Jul 2026)** bahwa referensi memakai `og:image` generic yang sama persis (`About_awwwards.png`) di ke-6 halaman case study meski `title`/`description` sudah unik; ini kelemahan nyata yang bikin link project kalau di-share ke sosial media tampil dengan preview gambar identik semua. v2 tidak boleh mewarisi ini — generate/assign OG image berbeda per `/works/[slug]` sejak M5.

**Skala halaman:** case study jauh lebih pendek dari beranda (live: ≈2300px vs ≈9000px) dan **tidak** memakai sticky-stacking — cukup scroll linear dengan reveal animation ringan per gambar galeri. Jangan bawa kompleksitas pin/GSAP ScrollTrigger section-stacking dari beranda ke halaman ini.

**Konvensi penamaan aset per project** (diadopsi dari pola nyata di referensi): `{project-slug}_logo_color.svg`, `{project-slug}_banner.webp`, plus beberapa gambar galeri bertema (`_screens.webp`, `_illustration.webp`, `_graphics.webp`, dst — sesuaikan isi tiap project). Prefix slug per file memudahkan maintain aset saat jumlah project bertambah.

Routing bersih tanpa prefix berlebihan, mis. `/works/nama-project`.

---

## 9. Aset, Optimasi & Performa

- Semua gambar raster: format **WebP**, lewat `next/image` (auto resize, quality ~75, `loading="lazy"` untuk gambar di bawah lipatan).
- Logo/ikon: **SVG**.
- Font hero, gambar hero, dan chunk JS kritikal: **preload** untuk mempercepat first paint.
- Model `.glb`: dimuat asinkron, jangan sertakan di initial bundle.
- Target struktur DOM ringan (canvas/efek visual dipakai untuk hal berat, bukan markup bertele-tele) — audit dengan DevTools node count sebagai sanity check.
- Deployment di Vercel dengan static prerendering + edge caching aktif; pilih region terdekat ke audiens utama.

---

## 10. Analytics & Privasi

- Gunakan **Vercel Web Analytics** + **Speed Insights**, di-*rewrite* lewat `next.config` agar disajikan dari domain sendiri (menghindari ad-blocker tanpa perlu skrip pihak ketiga seperti GA/Plausible/Umami).
- Tidak ada pelacakan pihak ketiga tambahan di v2.
- Nyatakan credit line di footer sesuai fakta stack yang benar-benar dipakai (mis. "Designed in Figma", "Built with Next.js & Claude Code" — sesuaikan dengan proses kerja aktual, jangan copy klaim referensi mentah-mentah).

---

## 11. Aksesibilitas & Performance Guardrail

| Kebutuhan | Implementasi |
|---|---|
| `prefers-reduced-motion` | Matikan/kurangi parallax, split-text, dan animasi 3D saat preferensi ini aktif — cek via `gsap.matchMedia()` supaya semua ScrollTrigger instance ikut nonaktif, bukan cuma CSS transition |
| Keyboard navigation | Semua CTA & link (termasuk menu pill, case study nav) reachable & terlihat fokusnya via keyboard |
| Kontras warna | Pastikan teks di atas warna aksen (kuning/terakota) tetap memenuhi WCAG AA |
| Fallback non-WebGL | Section 3D & canvas punya fallback gambar statis |
| Mobile scroll | Sticky-stacking & Lenis diuji khusus di iOS Safari (rawan bug momentum-scroll) & Android Chrome |

---

## 12. Risiko & Catatan Lisensi (Penting)

1. **Font berisiko lisensi.** Referensi memakai font berlabel "TRIAL" (Aeonik) dan "Personal Use Only" (Tempting) — **tidak boleh dipakai langsung** di situs publik/komersial. v2 wajib memilih font pengganti dengan lisensi jelas untuk Trobika & Aeonik (beli lisensi resmi atau pakai alternatif open/commercial-licensed). Geist aman dipakai karena open license dari Vercel. **Update:** Tempting terverifikasi 0% dipakai di elemen manapun (lihat §4.1) — untuk font ini v2 tidak perlu cari pengganti sama sekali, langsung di-drop dari scope.
2. **Aset 3D & ilustrasi.** Model `.glb` dan ilustrasi kustom pada referensi adalah milik brand tersebut — v2 harus membuat aset sendiri atau memakai aset dengan lisensi yang mengizinkan penggunaan komersial.
3. **Orisinalitas visual.** Meniru *teknik* (sticky-stacking, dash-array line draw, split-text) adalah praktik umum dan legal, tapi mereplikasi *identitas visual* 1:1 (palet warna sama persis, layout sama persis, aset sama) berisiko terlihat sebagai copy langsung — bagian §4 sudah mengarahkan ke penyesuaian warna/font untuk menjaga orisinalitas.
4. **Kompleksitas vs waktu.** Kombinasi Lenis + GSAP ScrollTrigger + sticky-stacking + SVG dash-array + Three.js adalah stack animasi yang kompleks untuk dikerjakan solo — pertimbangkan membangun bertahap per section (lihat §13) daripada all-at-once.
5. **Performa mobile.** Referensi live menjalankan 7 canvas (1×2D + 6×WebGL2) sekaligus di beranda — level ini berisiko berat di device low-end kalau ditiru mentah. v2 dibatasi maksimal 2-3 context WebGL aktif bersamaan (lihat §7), plus perlu budget performa jelas, `ScrollTrigger.batch()`/cleanup instance yang keluar viewport, dan testing di device nyata, bukan hanya desktop dev.
6. **Konflik dua scroll-driver.** Lenis (virtual scroll) dan native scroll yang dibaca ScrollTrigger harus disatukan lewat integrasi resmi (`lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker`), kalau tidak, posisi trigger ScrollTrigger bisa desync dari posisi visual Lenis (animasi trigger kepagian/kesorean).

---

## 13. Rollout / Milestone

| Fase | Cakupan | Deliverable |
|---|---|---|
| M1 | Setup Next.js + Tailwind + Lenis + GSAP/ScrollTrigger (integrasi scroll-sync), layout dasar & tipografi/warna final | Beranda scroll biasa (belum sticky-stacking), font & palet v2 final, Lenis↔ScrollTrigger sudah nyambung |
| M2 | Sticky-stacking sections (GSAP `pin`) + brush-stroke transitions | Beranda dengan efek section menumpuk berjalan mulus di desktop |
| M3 | SVG self-drawing line animation (GSAP timeline + dash-array) | Section intro/dark dengan garis animasi scroll-linked |
| M4 | Three.js/R3F 3D object section, posisi di-drive GSAP ScrollTrigger | Objek 3D custom mengambang & merespons scroll |
| M5 | Template case study + 3–6 project pages | Semua halaman `/works/[slug]` lengkap dengan konten real |
| M6 | Micro-interactions (nav text-roll, cursor, hover states) + polish | Navigasi pill + hover interactions selesai |
| M7 | Optimasi performa, aksesibilitas, analytics, SEO per halaman | Lighthouse target tercapai, siap submit ke Awwwards/Godly |

---

## 14. Metrik Sukses

- Lighthouse: Performance ≥85 desktop / ≥75 mobile, Accessibility ≥90.
- 60fps stabil saat scroll di device mid-range (diuji manual + Chrome Performance panel).
- Waktu load first paint <2s di koneksi 4G rata-rata.
- Situs berhasil di-submit dan (idealnya) masuk kurasi galeri desain (Awwwards/Godly/Land-book).
- Recruiter/pengunjung tetap bisa mencapai case study & kontak dalam ≤2 klik dari cold load (guardrail dari PRD v1 tetap berlaku).

---

## 15. Open Questions

1. Font pengganti final untuk peran display & body — perlu riset/pembelian lisensi sebelum M1 selesai. (Peran aksen/script sudah tidak perlu diriset — di-drop, lihat §4.1.)
2. Apakah efek canvas partikel/grid interaktif tambahan (di luar Three.js utama) worth dikerjakan di v2, atau didorong ke v3 mengingat kompleksitas vs manfaat.
3. Jumlah & isi project case study final untuk M5 — perlu daftar project + aset visual siap pakai.
4. Apakah cursor kustom dipertahankan di mobile (biasanya di-disable di touch device) — perlu keputusan UX eksplisit.
5. Pin GSAP `ScrollTrigger` vs `position: sticky` CSS murni — perlu prototipe cepat di M2 buat validasi mana yang lebih stabil di iOS Safari sebelum dikunci sebagai pendekatan final.
