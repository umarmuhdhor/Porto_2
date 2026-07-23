# DESIGN.md — Portfolio v2: Cinematic Scroll Experience

| Field | Value |
|---|---|
| Versi dokumen | 1.0 |
| Status | Draft for review |
| Owner | Umar (Design + Engineering) |
| Pasangan dokumen | [PRD-portfolio-v2-cinematic-scroll.md](./PRD-portfolio-v2-cinematic-scroll.md) |
| Sumber referensi | Live inspection https://www.nithinmwarrier.com/ (22 Jul 2026) |

Dokumen ini adalah spesifikasi desain (token, layout, komponen, motion) turunan dari PRD. PRD jawab "apa & kenapa", dokumen ini jawab "persisnya kayak apa" — dipakai langsung sebagai acuan waktu build UI.

---

## 1. Prinsip Desain

1. **Scroll adalah timeline, bukan daftar.** Tiap section punya "peran" dalam satu narasi berurutan (siapa → berapa lama → apa keahlian → hasil kerja → kontak), bukan kumpulan blok independen.
2. **Kontras sebagai penanda babak.** Pergantian warna section (cream → dark → cream → kuning) menandai pergantian topik, bukan dekorasi acak — tiap warna = satu "babak" narasi.
3. **Craft di detail kecil, bukan cuma efek besar.** Garis animasi, hover text-roll, crosshair divider — bagian "wow" datang dari presisi mikro-interaksi, bukan cuma dari adanya 3D/WebGL.
4. **Konten inti tidak boleh terkubur dekorasi.** Nama, headline, dan CTA utama harus tetap dominan visual di tiap section meski ada elemen animasi berat di background.
5. **Orisinal secara palet & aset, familiar secara teknik.** Teknik (sticky-stacking, dash-array line-draw, hover-preview list) boleh terinspirasi; warna, font, ilustrasi, model 3D harus milik brand sendiri (lihat §12 PRD).

---

## 2. Design Tokens

### 2.1 Warna

| Token | Nilai referensi | Peran | Catatan v2 |
|---|---|---|---|
| `--color-bg-cream` | `#f7f1ed` | Latar terang dominan (hampir semua section) | Bisa dipertahankan atau digeser hue tipis |
| `--color-bg-dark` | `#242424` | Section kontras gelap ("4+ years...") | Dipertahankan |
| `--color-accent-yellow` | `#FFD640` | Latar aksen (footer, nav pill, badge) | **Wajib ganti** ke warna aksen brand sendiri — ini titik paling gampang dikenali sebagai "niru" kalau dipakai identik |
| `--color-accent-yellow-soft` | `#FFE862` | Varian terang aksen (hero potret) | Turunan dari accent utama, sama treatment-nya |
| `--color-accent-line` | `rgb(228,143,91)` terakota | Aksen garis SVG/brush | Opsional ganti; kalau dipertahankan, jangan dipakai sebagai warna CTA utama (biar gak kebaca "Claude-themed") |
| `--color-text-primary` | `#000000` / off-black | Teks di atas cream | Dipertahankan |
| `--color-text-secondary` | `rgb(99,99,99)` | Sub-teks, meta info (tahun, kategori) | Dipertahankan |
| `--color-text-inverse` | `#f7f1ed` / putih | Teks di atas dark section | Dipertahankan |
| `--color-text-ghost` | `rgba(0,0,0,.15)` approx | Teks "bayangan" besar di background (mis. kata "VISUAL BRANDING" pudar di belakang label aktif) | Dipertahankan sebagai teknik hierarki |

**Aturan pemakaian:** tiap section cuma boleh punya 1 warna latar dominan + 1 warna aksen. Jangan campur aksen kuning dan terakota dalam satu section yang sama.

### 2.2 Tipografi

| Token | Referensi | Pengganti v2 (lisensi jelas) | Peran |
|---|---|---|---|
| `--font-display` | Trobika | Display font komersial (lihat §12 PRD) | Hero name, judul section besar |
| `--font-body` | "Aeonik TRIAL" | Alternatif geometric sans (lisensi bebas/dibeli) | Body text, paragraf, nav |
| `--font-system` | Geist (var, 100–900) | **Geist** (dipakai langsung, open license) | UI kecil, meta text (tahun, kategori), tombol |

**Update verifikasi live (22 Jul 2026):** font **Tempting** (script, "Personal Use Only") di-load di stylesheet referensi tapi **0 elemen di halaman benar-benar memakainya** (dicek via `getComputedStyle` ke seluruh DOM, hero maupun case study). "Tanda tangan" terakota yang tampak di atas nama hero adalah **SVG line-art** (bagian dari sistem 17 path dash-array di §5 PRD, bukan teks). Kesimpulan: role `--font-accent`/script **di-drop dari v2** — tidak perlu cari font pengganti untuk peran ini, cukup buat aset SVG signature-line sendiri kalau mau motif serupa.

**Skala tipografi (berdasarkan observasi ukuran nyata di desktop ≥1600px):**

| Level | Ukuran referensi | Pemakaian |
|---|---|---|
| Display / Hero name | ~100–140px, weight bold, uppercase, tracking rapat | Nama besar "NITHIN M WARRIER" |
| H1 section | ~64–80px, weight bold/black | "4+ years of crafting...", "Designing experiences..." |
| H2 label besar | ~48–64px, uppercase, weight bold utk item aktif / regular-gray utk item tidak aktif | Daftar service ("LANDING PAGES / VISUAL BRANDING / PRODUCT DESIGN") |
| Body / paragraf | ~18–22px, weight regular/light | Deskripsi singkat, summary case study |
| Meta / label kecil | ~14–16px, uppercase, tracking lebar | Tahun, kategori, breadcrumb, badge "Honors" |
| Nav / button | ~16–18px, weight medium | Label pill "Menu", "HOME/WORKS/CONTACT" |

Teknik split-text: setiap karakter di headline hero dibungkus elemen inline-block terpisah agar bisa dianimasikan stagger per huruf saat entrance.

### 2.3 Spacing & Grid

- Container dibatasi garis vertikal tipis di `left-[5%]` dan `right-[5%]` (viewport desktop) — bertindak sebagai "frame" konten sepanjang seluruh halaman, fixed position, selalu terlihat.
- Grid dua-kolom dipakai untuk: daftar project (kategori kiri, tahun kanan / label kiri-kanan berselang), dan layout Challenge/Role di case study.
- Divider grid pakai crosshair kecil (`+`) di titik pertemuan garis horizontal-vertikal — detail dekoratif berulang di beberapa section (list project, footer grid).
- Section padding vertikal generous: tiap section penuh minimal `100vh` di desktop, memberi ruang napas ala "satu section = satu layar".

### 2.4 Radius, Border, Shadow

| Token | Nilai | Pemakaian |
|---|---|---|
| `--radius-pill` | `9999px` | Nav "Menu", tag/pill service, badge kategori |
| `--radius-card` | `16–24px` | Kartu galeri bento di case study, foto |
| `--radius-badge` | `12–16px` | Badge kecil (mis. ikon pen-tool berputar di dark section) |
| Border | `1px solid rgba(0,0,0,.1)` | Garis divider grid tipis (frame kiri-kanan, grid project) |
| Shadow | Minimal/nyaris tanpa shadow | Referensi flat & rely on warna/kontras, bukan drop-shadow — dipertahankan sebagai gaya |

---

## 3. Arsitektur Halaman & Section (Beranda)

Urutan section terverifikasi dari live scroll:

1. **Hero** (cream, fixed background) — nama besar split-text, tanda tangan/aksen script warna terakota di atas nama, tagline peran ("Visual Designer / Brand Designer / Web Designer / Product Designer"), lokasi ("Based in Kochi, Kerala").
2. **Statement dark** (`#242424`, sticky/pinned) — "4+ years of crafting meaningful products and visuals that hold up", teks besar bertumpuk dengan opacity berbeda (kata pertama solid putih, sisanya abu redup), badge bulat rotasi berisi ikon pen-tool (nod ke tool desain).
3. **Transisi brush-stroke** — tepi robek/kuas antara section dark → section aksen kuning, dipakai sebagai divider organik pengganti garis lurus.
4. **Portrait + value section** (kuning → cream) — foto potret (torso, hoodie) muncul dari section kuning, menyatu ke teks "Designing experiences that help brands grow through" di atas cream.
5. **Service list** (cream, sticky) — daftar kapabilitas dengan 1 item **aktif** (hitam solid, besar) dan sisanya **pudar** (abu terang) — kemungkinan item aktif berganti terikat scroll progress. Diikuti CTA "View all works below".
6. **Curated Projects — intro** — heading "CURATED PROJECTS" + 1 paragraf ringkas, lalu masuk grid.
7. **Project index (grid list)** — bukan thumbnail grid biasa: daftar **teks** (kategori kiri, tahun kanan), dibagi grid 2 kolom bergaris tipis dengan crosshair `+` di persimpangan. Gambar preview project kemungkinan besar muncul on-hover mengikuti posisi kursor (area kosong besar di atas tiap baris teks mengindikasikan slot image-on-hover, bukan gambar statis).
8. **Outro/CTA** — nama besar diulang lagi (mirror hero) sebagai penutup ritme, lalu "Let's build something MEANINGFUL AND MEMORABLE".
9. **Footer/kontak** (aksen kuning) — "Reach out", email, dan credit line ("Designed in Figma", "Created with Claude Code").

Elemen persisten di semua section (fixed, tidak ikut scroll):
- Garis frame vertikal kiri-kanan (`left-[5%]` / `right-[5%]`).
- Badge hitam menempel tepi kanan berisi monogram ("W.") + label vertikal "Honors" — indikasi pencapaian/awards, selalu terlihat.
- Nav pill mengambang di bawah-tengah viewport (floating, bukan top nav klasik).

---

## 4. Spesifikasi Komponen

### 4.1 Floating Nav Pill
- Posisi: fixed, bottom-center.
- Bentuk: pill penuh (`radius-pill`), latar aksen (kuning di referensi).
- Isi: label "Menu" + ikon garis-dua (≡) di kanan.
- State klik: expand jadi menu berisi 3 item (HOME, WORKS, CONTACT).
- Hover per-item menu: **text-roll** — tiap huruf label punya 2 salinan bertumpuk (asli + duplikat), transform `translateY` berlawanan arah saat hover sehingga huruf lama slide keluar atas, huruf baru slide masuk dari bawah.

### 4.2 Honors/Award Badge
- Fixed, menempel tepi kanan viewport (`right: 0`), rotasi konten teks 90° ("Honors" dibaca vertikal).
- Latar solid gelap kontras dengan background section apapun di baliknya (selalu kebaca).
- Fungsinya sebagai social-proof persisten, bukan cuma sekali muncul di satu section.

### 4.3 Section Divider — Brush Stroke
- Aset raster/vektor bertekstur kuas (WebP), dipasang di batas antara dua section berwarna kontras.
- Tujuan: memecah garis lurus batas section supaya transisi terasa "digambar tangan", bukan dipotong software.

### 4.4 Rotating Badge Icon (dark section)
- Badge bulat/rounded-square kecil dengan border aksen (kuning), isi ikon garis (pen-tool/anchor-point) sebagai representasi tool desain.
- Animasi: rotasi kontinu lambat dan/atau terikat scroll progress, posisi melayang di tengah teks besar section dark.

### 4.5 Project Index Row
- Layout per baris: label kategori (kiri) — tahun (kanan), dipisah garis horizontal tipis.
- Grid 2 kolom, crosshair `+` sebagai penanda titik potong grid.
- **Interaksi hover:** area gambar preview project muncul mengikuti kursor (floating image, ukuran tetap, `pointer-events: none`), fade in/out cepat saat enter/leave baris — pola umum "cursor-follow image reveal" pada list-based portfolio.
- Klik baris → navigasi ke `/works/[slug]`.

### 4.6 Case Study Bento Gallery
(Detail tetap mengikuti §8 PRD — breadcrumb, judul, tag pill, dua kolom Challenge/Role, grid bento asimetris kartu rounded.)
- Kartu galeri: radius besar (`--radius-card`), campuran gambar full-bleed dan grid 2 kolom tidak simetris (1 gambar besar + 2 kecil, dst).
- Spacing antar-kartu konsisten, tidak ada gap 0 (bukan grid rapat tanpa jarak).
- **Verifikasi live — pola nyata di project "Understood":** 1 logo SVG header → 1 banner full-width (mockup produk) → grid 2×2 (logo guides, screens, illustration, graphics), masing-masing gambar `.webp` terpisah per keperluan (bukan satu sheet besar dipotong CSS).
- **Skala halaman jauh lebih pendek dari beranda:** total tinggi halaman case study live ≈2300px vs beranda ≈9000px — case study TIDAK memakai sticky-stacking/pin, cuma scroll linear biasa dengan reveal animation ringan per gambar. Jangan bawa kompleksitas sticky-stacking beranda ke halaman case study.
- **Konvensi penamaan aset** (diadopsi buat v2, disesuaikan nama project sendiri): `{project-slug}_logo_color.svg`, `{project-slug}_banner.webp`, `{project-slug}_logo_guides.webp`, `{project-slug}_screens.webp`, `{project-slug}_illustration.webp`, `{project-slug}_graphics.webp` — prefix nama project bikin folder aset gampang di-grep/maintain pas project bertambah.

---

## 5. Spesifikasi Motion

| Interaksi | Trigger | Driver (lihat PRD §3) | Detail |
|---|---|---|---|
| Split-text hero entrance | Page load | Framer Motion (stagger per `<span>` huruf) | Huruf muncul stagger dari bawah/opacity, bukan sekaligus |
| Sticky-stacking section | Scroll | GSAP ScrollTrigger `pin` | Section dark & cream "menumpuk" gantian di viewport |
| SVG self-drawing line | Scroll (dalam section dark) | GSAP timeline + `stroke-dasharray` | Progress line = progress scroll dalam section tsb |
| Rotasi badge pen-tool | Scroll atau time-based loop | GSAP (`gsap.to rotation`) | Kontinu pelan, tidak mengganggu keterbacaan teks |
| Fade in/out service list item aktif | Scroll | GSAP ScrollTrigger scrub | Item yang "in-focus" solid hitam, sisanya turun opacity |
| Hover-follow image preview (project list) | Mousemove + hover row | Framer Motion (`useMotionValue` + spring ke posisi kursor) | Gambar mengikuti kursor dengan sedikit delay/spring, bukan snap langsung |
| Text-roll nav hover | Hover per item menu | CSS transform + Framer Motion / CSS transition | Duplikat huruf, translateY berlawanan |
| Brush-stroke transition reveal | Scroll masuk section baru | CSS/GSAP fade+position | Statis relatif terhadap scroll, bukan animasi kompleks |
| 3D object float (jika dipakai) | Scroll + idle loop | GSAP ScrollTrigger + R3F `useFrame` | Lihat PRD §7 |

**Prinsip timing:** semua transisi scroll-linked pakai `scrub` (terikat langsung ke posisi scroll, reversible), bukan `once`-play — supaya scroll ke atas terasa natural (animasi mundur), bukan cuma play sekali maju.

---

## 6. Imagery & Ikonografi

- Foto: gaya lifestyle/portrait natural (bukan studio flat), crop tight ke torso/wajah untuk hero-portrait section.
- Ikon: garis tipis (line icon), monoline, bukan filled/solid — konsisten dengan estetika "hand-drawn technical" dari SVG line-draw.
- Semua foto & ilustrasi harus aset milik sendiri/lisensi jelas — dilarang pakai model/produk dari referensi (lihat PRD §12).

---

## 7. Breakpoints & Perilaku Responsif

| Breakpoint | Perubahan utama |
|---|---|
| Desktop (≥1280px) | Layout penuh sesuai spesifikasi di atas: sticky-stacking, frame kiri-kanan, badge fixed kanan |
| Tablet (768–1279px) | Ukuran display font diturunkan proporsional; sticky-stacking tetap jalan tapi height section disesuaikan; badge "Honors" bisa disederhanakan/disembunyikan kalau ganggu konten |
| Mobile (<768px) | Cursor-follow image preview **di-nonaktifkan** (tidak relevan di touch device) → ganti jadi thumbnail statis kecil di tiap baris project; nav pill tetap floating tapi ukuran diperkecil; frame kiri-kanan boleh dihilangkan demi ruang horizontal; sticky-stacking dievaluasi ulang (lihat Open Question PRD §15 soal `pin` vs `sticky` di iOS Safari) |

**Verifikasi live di mobile (375×812, referensi asli):** hero name **tetap 2 baris besar dan proporsional** (font-size ikut turun, tidak overflow/kepotong), garis frame kiri-kanan **tetap tampil** (tidak dihilangkan di breakpoint ini), badge "Honors" **sengaja dibiarkan "mengintip"** terpotong di tepi kanan viewport (bukan bug — bagian dari desain, dan tidak menimbulkan horizontal-scroll karena posisinya `fixed`/di luar flow dokumen). Nav pill full-width proporsional di bawah. Kesimpulan: v2 tidak perlu buru-buru menyembunyikan frame/badge di mobile seperti asumsi awal — cukup pastikan ukuran font & spacing scale down dan tidak ada elemen yang memicu horizontal scroll asli (`document.documentElement.scrollWidth` harus selalu = `innerWidth`).

**Aturan wajib:** efek yang secara fundamental butuh mouse (hover text-roll, cursor-follow image) harus punya *fallback* touch-friendly, bukan cuma disembunyikan tanpa pengganti fungsional (link tetap harus jelas bisa di-tap).

---

## 8. Aksesibilitas dalam Desain

- Kontras teks abu (`--color-text-secondary`) di atas cream harus dicek rasio WCAG AA sebelum dikunci sebagai token final.
- Item "pudar" di service list (opacity rendah) tetap harus punya kontras minimum saat difokus keyboard — jangan andalkan opacity visual saja untuk indikasi fokus.
- Semua motion di §5 wajib py fallback `prefers-reduced-motion` (detail teknis di PRD §11).

---

## 9. Yang Sengaja Tidak Ditiru

Untuk jaga orisinalitas (selaras PRD §12), berikut elemen referensi yang **tidak** masuk scope v2 apa adanya:
- Palet kuning+terakota persis (§2.1 — wajib re-hue).
- Font Trobika/Aeonik/Tempting asli (§2.2 — wajib ganti, isu lisensi).
- Model `.glb` logo Figma/Claude spesifik — kalau v2 pakai 3D, objeknya representasi brand sendiri.
- Copy/teks persis ("Designed in Figma", dst) — credit line footer harus sesuai proses kerja aktual sendiri.
- Font Tempting sekalian **jangan dicari penggantinya** — di referensi terbukti 0% terpakai di elemen manapun (§2.2), cuma dead-weight preload. v2 tidak perlu font script sama sekali kecuali ada kebutuhan desain baru yang eksplisit.

## 10. Pitfall Referensi yang Jangan Diulang

Dua kelemahan nyata di situs referensi (dari verifikasi live 22 Jul 2026), dicatat supaya v2 tidak mewarisi:
1. **OG image generic di semua halaman.** Meski `title` & `description` per project sudah unik (bagus, dan wajib ditiru), `og:image` di semua 7 halaman (beranda + 6 case study) memakai file yang sama (`About_awwwards.png`). Dampak: link project yang di-share ke sosial media/WhatsApp semua tampil dengan gambar preview identik — kurang menarik & membingungkan. v2 wajib generate OG image unik per halaman (lihat PRD §8).
2. **7 context WebGL aktif sekaligus di beranda** (dicek langsung: 1 canvas 2D + 6 canvas WebGL2, ukuran render bervariasi 300×150 s.d. 2560×1728px). Ini beban GPU/memory yang signifikan untuk device low-end — v2 harus lebih hemat: gabungkan efek yang bisa digabung dalam 1 context React Three Fiber, jangan bikin canvas terpisah per section kalau tidak perlu (lihat PRD §12 risiko performa mobile).
