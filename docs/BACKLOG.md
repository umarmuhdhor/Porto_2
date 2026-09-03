# Backlog — yang perlu diperbaiki & data yang belum ada

Hasil audit codebase 2026-08-22, diperbarui 2026-09-03 setelah batch P0+P1
lalu batch P2 Bagian A dikerjakan. Dua bagian besar:

- **Bagian A — perbaikan kode.** Bisa dikerjakan siapa pun tanpa data baru.
- **Bagian B — data yang belum ada.** Hanya Umar yang bisa mengisi; tanpa ini
  Bagian A tidak menutup lubangnya.

Prioritas: **P0** = blokir rilis publik, **P1** = harus sebelum dibagikan ke
recruiter, **P2** = perbaikan kualitas, **P3** = nice to have.

Status ringkas juga ada di [../README.md](../README.md) section "Status".

---

## A. Perbaikan kode

### P0 — blokir rilis publik

**Kosong.** Dua-duanya selesai 2026-09-03 — lihat "Sudah selesai" di bawah.

### P1 — sebelum dibagikan ke recruiter

- [ ] **`HonorsBadge` tidak menautkan ke mana pun.**
      `components/layout/HonorsBadge.tsx:7` — `TODO(brand)`. Sekarang cuma
      ornamen bertulis "Honors". Butuh data B5.

### P2 — kualitas

- [ ] **Tidak ada test.** CI sudah ada (lihat "Sudah selesai"), tapi yang
      dijalankannya cuma lint/format/typecheck/build — tidak ada satu pun
      assertion tentang perilaku. Kandidat pertama yang paling berbayar:
      `lib/guestbook.ts` (`validateEntry` dipakai dua sisi, client & server) dan
      `lib/site-url.ts` (empat cabang error yang sejauh ini hanya diverifikasi
      manual). Belum ada test runner terpasang — itu keputusan pertama.


### P3 — nice to have

- [ ] **Sisa audit M7 yang butuh perangkat/deploy asli** — 60fps di device
      mid-range dan verifikasi `x-vercel-cache` / Brotli / prerender header.
      Dua-duanya tidak bisa diukur dari mesin dev; sisanya sudah dijalankan
      2026-09-03 (lihat "Sudah selesai"). Kriteria di
      `plans/07-m7-perf-a11y-seo.md` §1.

- [ ] **Huruf berongga di service list di luar jangkauan pemeriksa otomatis.**
      Item non-aktif digambar `color: transparent` + `-webkit-text-stroke`
      (`app/globals.css`). Kepekatan yang bisa diukur sudah dinaikkan sampai
      lolos AA (lihat "Sudah selesai"), tapi axe/Lighthouse mengukur `color`,
      dan `transparent` selalu dilaporkan 1:1 kalau branch itu yang aktif.
      Keputusan yang tersisa: pertahankan huruf berongga (dan terima temuan
      otomatis itu selamanya), atau ganti jadi isian pudar yang bisa diukur.


- [ ] **Tidak ada halaman indeks `/works`.** Nav "WORKS" menunjuk anchor
      `/#projects`. Dengan enam project ini mulai layak dipertimbangkan.

- [ ] **Tidak ada section tulisan/catatan.** Sinyal kuat untuk developer, tapi
      butuh komitmen menulis — jangan bikin kerangkanya kalau belum ada isinya.

---

## B. Data yang belum ada

Ini yang menahan situs, bukan kodenya. Kolom "taruh di mana" sudah pasti — file
tujuannya ada semua, tinggal isinya yang kosong.

B1 (URL GitHub) dan B2 (verifikasi handle sosial) sudah masuk — lihat
"Sudah selesai" di bawah.

### B3 — Screenshot & aset case study asli  ·  P0

**Gap terbesar yang tersisa.** 32 file di `public/works/` semuanya SVG hasil
`pnpm gen:works` — persegi warna + huruf, bukan tangkapan layar. Motion kelas
Awwwards yang membungkus gambar palsu justru merusak kredibilitas lebih cepat
daripada situs polos.

Nama file & rasio sudah dikunci oleh `scripts/generate-work-placeholders.mjs`
dan dibaca `content/works/*.ts`. Rasio: banner & `span: 'full'` = 16:9,
`span: 'half'` = 3:2.

| Slug | File yang perlu diganti |
|---|---|
| `load-away` | `_banner`, `_screens`, `_system`, `_graphics`, `_logo` |
| `popshot` | `_banner`, `_screens`, `_flow`, `_graphics`, `_logo` |
| `shopify-automation` | `_banner`, `_pipeline`, `_rules`, `_graphics`, `_logo` |
| `absata` | `_banner`, `_screens`, `_system`, `_graphics`, `_logo` |
| `higgz-academia` | `_banner`, `_screens`, `_system`, `_graphics`, `_detail`, `_illustration`, `_logo` |
| `mdp-teaching` | `_banner`, `_screens`, `_graphics`, `_illustration`, `_logo` |

Tiga slug teratas paling mendesak — itu karya terbaru dan paling relevan, dan
dua di antaranya punya build TestFlight yang bisa dibuka, jadi pengunjung bisa
membandingkan screenshot dengan app aslinya.

Dua catatan izin:

- **ABSATA** aplikasi internal DPR RI — cek dulu boleh dipublikasikan atau tidak.
  Kalau tidak: mockup ulang UI-nya, blur data sensitif, atau ganti dengan diagram alur.
- **Shopify Automation** kliennya sudah dianonimkan di teks, jadi screenshot-nya
  tidak boleh memuat nama toko, domain, atau produk yang bisa dilacak. Tangkapan
  layar terminal/pipeline lebih aman daripada tangkapan admin Shopify.

### B4 — Angka hasil Popshot!!  ·  P2  ·  butuh data

Sisa dari penambahan tiga project. PRD Popshot!! memuat OKR — 5.000 pengguna,
60% trip completion, rating ≥4.3, 500 koneksi konkuren — tapi semuanya **target
di dokumen berstatus Draft**, bukan hasil. Tidak satu pun dipakai, dan komentar
di `content/works/popshot.ts` mencatat alasannya.

`outcomes` untuk Popshot!! sekarang diisi fakta lingkup yang pasti benar (10
member per trip, 2 mode challenge, rilis TestFlight). Kalau beta-nya sudah
menghasilkan angka nyata — jumlah tester, trip selesai, foto terunggah — itu
lebih kuat dan layak menggantikannya.

| | |
|---|---|
| Yang dibutuhkan | Angka yang benar-benar tercapai dari beta Popshot!! |
| Taruh di | `content/works/popshot.ts` → `outcomes` |

Berlaku juga untuk Load Away dan Shopify Automation: `outcomes` keduanya kini
memakai fakta teknis yang terverifikasi dari dokumen, bukan metrik dampak.

### B5 — Isi "Honors"  ·  P1

`HonorsBadge` menempel di tepi kanan setiap halaman bertulis "Honors" tapi tidak
menautkan apa pun. Bahan dari CV yang belum muncul di situs sama sekali:

- IPK **3.99/4.00** (Multi Data Palembang, Sep 2022 – Feb 2026)
- Diterima **Apple Developer Academy** — selektif, dan itu inti pesannya
- **Student Exchange** Dian Nuswantoro University (Mar–Jul 2024)
- Ketua/pengurus Informatics Student Association (Sep 2023 – sekarang)

| | |
|---|---|
| Yang dibutuhkan | Keputusan: badge ini menautkan ke mana — anchor di About, atau halaman `/honors` sendiri |
| Taruh di | `components/layout/HonorsBadge.tsx:7` (hapus `TODO(brand)`) + tujuan tautannya |

### B6 — CV yang bisa diunduh  ·  P1

`lib/chatbot.ts:547` secara harfiah menjawab pengunjung:
*"There's no download link on the site yet."* Ini aksi nomor satu seorang
recruiter, dan situsnya menolak melayani.

Sumbernya sudah ada: `/Users/umar/Data/CV_Terbaru.pages` → ekspor ke PDF.

| | |
|---|---|
| Yang dibutuhkan | `CV_Umar_Muhdhor.pdf` hasil ekspor |
| Taruh di | `public/` + tautkan di `components/sections/ContactFooter.tsx`, dan perbarui topik `resume` di `lib/chatbot.ts:543` |

### B7 — Avatar asli  ·  P2

`components/ui/PixelAvatar.tsx:7` — *"Aset placeholder — ganti dengan avatar asli
bila tersedia."* Dipakai di footer kontak, tepat di sebelah CTA email.

| | |
|---|---|
| Yang dibutuhkan | Foto/avatar asli |
| Taruh di | `components/ui/PixelAvatar.tsx` (atau file gambar di `public/`) |

### B8 — Nomor telepon: tampilkan atau tidak?  ·  P3  ·  butuh keputusan

CV memuat 0895070069922; situs tidak menyebutnya sama sekali. Pastikan itu
keputusan sadar — nomor pribadi di halaman publik mengundang spam dan tidak bisa
ditarik kembali setelah terindeks — bukan sekadar terlewat.

Kalau memang mau dipasang, `content/site.ts` tempatnya, dan topik `contact` di
`lib/chatbot.ts` ikut menyesuaikan.

### B9 — Pengalaman organisasi  ·  P3  ·  butuh keputusan penempatan

Dua entri di CV tidak muncul di mana pun: Informatics Student Association
(Sep 2023 – sekarang) dan Representative/Leader (Okt 2023 – sekarang), keduanya
dengan angka hasil yang konkret. Bukan case study — jadi tempatnya bergantung
pada keputusan B5 (HonorsBadge menautkan ke mana). Kalau halaman honors jadi
dibuat, dua entri ini isinya.

---

## Sudah selesai

### ValueSection dipasang kembali — 2026-09-03

`app/page.tsx` sekarang merender `<ValueSection />` di antara `StatementDark`
dan `ServiceList` — posisi yang memang disebut DESIGN §3 (#3 brush divider,
#4 value section) dan yang diasumsikan `StatementDark` ("ditutupi ValueSection").

Sebelum ini section-nya tidak dipanggil dari mana pun, jadi seluruh M4 mati di
pohon: nol WebGL context, `.glb` + poster tidak pernah diminta, dan `three` +
`@react-three/fiber` terpasang tanpa pernah dieksekusi.

Diverifikasi lewat CDP (Browser pane tidak bisa dipakai untuk ini — halamannya
`visibilityState: hidden`, dan Chrome tidak menghitung IntersectionObserver di
sana, jadi Scene-nya memang tidak akan pernah mount):

- Gerak normal: **1** canvas dengan context WebGL hidup (budget DESIGN §10 ≤2–3),
  poster memudar ke `opacity: 0` setelah model siap, nol exception.
- `prefers-reduced-motion: reduce`: **0** canvas, poster `opacity: 1` — persis
  cabang yang dijanjikan `BrandObject`.
- Lighthouse setelah dipasang: desktop Perf **100** (naik dari 99) / A11y 100 /
  BP 96 / SEO 100, mobile Perf **91** (naik dari 86) / 100 / 96 / 100. TBT 0ms
  di dua-duanya. Objeknya tidak membebani muat awal karena memang tidak ikut:
  chunk R3F baru diminta 400px sebelum section-nya masuk viewport.

Tinggi dokumen homepage bertambah ~2.800px — fase hold 90vh milik panel ini yang
memutar objeknya.

### Audit M7 — 2026-09-03

Dijalankan terhadap build produksi lokal (`pnpm build` + `pnpm start`), bukan
dev server: angka dev tidak berarti apa-apa untuk performa.

**Lighthouse** (target plan: Perf ≥85 desktop / ≥75 mobile, A11y ≥90):

| | Perf | A11y | Best Practices | SEO |
|---|---|---|---|---|
| Desktop | 99 | 100 | 96 | 100 |
| Mobile | 86 | 100 | 96 | 100 |

FCP mobile 0.9s (target plan <2s di 4G), CLS 0.001, TBT 90ms. LCP mobile 4.1s —
elemennya baris meta mobile-only di hero, dan yang menahannya render delay,
bukan unduhan.

Satu-satunya temuan Best Practices yang tersisa: `errors-in-console` dari
`/_hb/a/view` 404. Itu beacon analytics yang di-rewrite ke `/_vercel/insights/*`
— route yang hanya ada di Vercel, jadi 404-nya memang perilaku yang benar di
luar platform dan tidak akan muncul di produksi.

**Kontras WCAG AA — enam pelanggaran ditemukan, semuanya diperbaiki:**

- `text-accent-line` (#e48f5b) sebagai HURUF di atas cream cuma 2.24:1, dan
  `text-note` (#5b93e0) 2.80:1. Keduanya dipakai di sorotan kata About, angka
  section case study, numeral 404, hover judul project, dan huruf hover nama
  hero. Ditambahkan dua token TEKS terpisah — `--color-accent-line-strong`
  (#b0551d, 4.51:1) dan `--color-note-strong` (#276dce, 4.50:1).

  Sengaja token baru, bukan menggelapkan yang lama: aksen aslinya SUDAH benar
  sebagai garis/stroke/latar, dan #e48f5b yang digelapkan justru rusak di atas
  panel gelap (teks error guestbook: 6.19:1 → 3.08:1). Satu token untuk dua
  pekerjaan berlawanan itu sumber kesalahannya.

- Bubble hero: putih di atas #5b93e0 = 3.14:1. `--color-note` digelapkan jadi
  #2e75d7 (4.52:1) — hue sama, jadi bubble-nya masih biru yang sama.

- Teks pudar di dua dock gelap: `text-white/40` = 3.35:1 dan `text-white/35` =
  2.92:1 (jumlah catatan, empty state, disclaimer, hint, chip saran), plus
  `placeholder:text-white/30`. Dinaikkan ke /60, /70, dan /55.

- "Drag the windows around" `text-ink/55` di atas accent kuning = 4.02:1 → /65.

- Item non-aktif service list: 32% ink = 2.13:1, di bawah ambang 3:1 untuk teks
  besar → 46% (3.20:1); stroke huruf berongga 38% → 55%.

**`aria-label` di span polos (3 komponen).** Lighthouse `aria-prohibited-attr`:
ARIA melarang nama aksesibel pada elemen tanpa role, jadi `<span aria-label>`
pembungkus `SplitText`, `RiseText`, dan `HeroName` bisa diabaikan screen reader
— yang tersisa cuma span per-huruf. Diganti salinan `sr-only` berisi teks utuh
di dalam pembungkus; span per-huruf tetap `aria-hidden`. A11y desktop 93 → 100.

**Hero mobile menulis "Indonesia" saja** (`components/sections/Hero.tsx`)
sementara seluruh situs sudah "Bali, Indonesia" — string-nya di-hardcode, bukan
dibaca dari `SITE`. Justru baris itu yang jadi elemen LCP di mobile. Sekarang
membaca `SITE.location`.

**Yang lolos tanpa perubahan:**

- Focus ring: 18 elemen fokusabel, semuanya punya ring terlihat di bawah
  modalitas keyboard (diuji dengan `:focus-visible`, bukan `.focus()` — fokus
  programatik tidak memicu state itu, dan tes pertama sempat salah karenanya).
- Overflow horizontal: nihil di 375 / 768 / 1280 / 1920, di tiga posisi scroll.
- OG image, sitemap, robots: 200 semua di build produksi, PNG per halaman.
- Reduced-motion: hero dirender penuh (nama, signature, bubble, flank) di Chrome
  `--force-prefers-reduced-motion` — tidak ada garis setengah gambar atau teks
  yang tersangkut tak terlihat. Section bawah baru diperiksa lewat kode
  (semua komponen beranimasi punya cabang reduced-motion), belum lewat mata.
- WebGL context: 0 — tapi lihat temuan M4 di Bagian A, itu bukan hasil yang baik.


### Batch P2 Bagian A — 2026-09-03

- ✅ **CI.** `.github/workflows/ci.yml` — `pnpm lint` + `format:check` +
  `typecheck` + `build` per push ke `main` dan per pull request.

  `NEXT_PUBLIC_SITE_URL` diisi placeholder `https://example.com` di workflow:
  build produksi menolak jalan tanpa origin absolut, dan CI bukan tempat
  menyimpan domain sungguhan. Penjaga localhost di `lib/site-url.ts` hanya
  aktif saat `VERCEL` ada, jadi placeholder itu aman.

  Ikut masuk: script `typecheck` (`tsc --noEmit`) dan field `packageManager`
  di `package.json` — `pnpm/action-setup` membaca versinya dari sana, jadi CI
  dan laptop tidak bisa memakai pnpm yang berbeda.

- ✅ **`BROADCAST_MS` 70 → 140.** (`lib/live-cursors.ts`) ~14 → ~7 pesan/detik
  per pengunjung yang bergerak, dan biaya itu dikali jumlah penerima di halaman
  yang sama. `LERP` sengaja TIDAK ikut diubah: ia mengatur seberapa cepat kursor
  mengejar sampel terakhir, bukan seberapa sering sampel datang — menaikkannya
  untuk "mengimbangi" justru mengembalikan patah-patah yang ia ada untuk
  menghaluskannya.

- ✅ **Item "supabase-js masuk bundle homepage" dicoret — salah alamat.**
  `GuestbookDock` tidak mengimpor Supabase sama sekali; ia bicara ke
  `/api/guestbook`. Satu-satunya pemakai di klien adalah `LiveCursors`, dan di
  sana klien Supabase MEMANG sudah `import()` dinamis
  (`components/layout/LiveCursors.tsx:81`), dijaga `pointer: fine` + env terisi.
  Chunk-nya lazy dan tidak pernah diunduh perangkat sentuh — tidak ada yang
  perlu diperbaiki.

- ✅ **Catatan `NEXT_PUBLIC_SITE_URL` di `.env.example` disegarkan.** Isinya
  masih menjanjikan fallback senyap ke localhost — persis perilaku yang dibunuh
  batch P0 sebelumnya. Dokumentasi yang menjelaskan perilaku lama lebih
  berbahaya daripada tidak ada dokumentasi.

### Batch P0 + P1 Bagian A — 2026-09-03

- ✅ **P0 — `NEXT_PUBLIC_SITE_URL` tidak lagi gagal senyap.** Resolusi origin
  pindah ke `lib/site-url.ts`; `app/layout.tsx`, `app/sitemap.ts`, dan
  `app/robots.ts` mengimpornya. Build produksi `throw` kalau env-nya kosong.
  Origin dinormalkan lewat `URL.origin`, jadi slash di akhir tidak lagi bisa
  menghasilkan `//works/...`.

  **Ada lubang kedua yang baru ketahuan saat mengujinya:** `.env.local` di repo
  ini isinya `http://localhost:3000`, jadi penjaga "env kosong" LOLOS dan
  sitemap tetap memuat localhost. Nilai yang terisi-tapi-lokal sekarang ikut
  digagalkan — tapi hanya saat `VERCEL` ada, supaya `pnpm build` di laptop tetap
  bisa dijalankan. Ketiga jalur diverifikasi.

  Sengaja TIDAK jatuh ke `VERCEL_URL`: itu hostname per-deploy, dan memakainya
  untuk canonical cuma menukar satu nilai salah yang senyap dengan yang lain.

- ✅ **P0 — guestbook mati diam-diam, bukan 500.** `GET /api/guestbook` balas
  200 + `disabled` saat env Supabase kosong, `POST` balas 503, dan
  `GuestbookDock` tidak merender apa pun. Pola yang sama dengan `LiveCursors`.
  Env kosong itu keadaan sah di fork, preview deploy, dan clone baru — bukan
  error.

- ✅ **P1 — `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`.**
  Ketiganya berbagi `components/layout/MessagePage.tsx` supaya halaman yang
  paling jarang dilihat tidak jadi tiga salinan yang saling tertinggal.

  Konfigurasi font ikut pindah ke `lib/fonts.ts`: `global-error` merender
  `<html>`-nya sendiri, dan dua pemanggilan `next/font` yang beda satu opsi akan
  memuat dua salinan font yang sama.

- ✅ **P1 — skip link.** Anchor polos di `app/layout.tsx` (jalan sebelum
  hidrasi); `<main>` di homepage, case study, dan `MessagePage` dapat
  `id="main-content"` + `tabIndex={-1}`.

  Disembunyikan dengan digeser keluar layar, BUKAN `sr-only` +
  `focus:not-sr-only` — utility `not-sr-only` ikut menyetel `padding: 0` dan
  menang atas `px-5 py-3`, jadi pil-nya terender setinggi 20px. Ketahuan di
  browser, tidak oleh compiler maupun lint.

- ✅ **P1 — JSON-LD `Person`.** `lib/json-ld.ts`, dibangun dari `content/site.ts`.
  `sameAs` mengikat nama ke tiga profil sosial, `affiliation` menyebut Apple
  Developer Academy, dan `SITE.location` akhirnya punya pemakai — field itu
  memang disimpan untuk ini.

- ✅ **P2 — `pnpm format:check` hijau.** `pnpm format` merapikan
  `components/layout/LiveCursors.tsx`, `eslint.config.mjs`, `postcss.config.mjs`.
  Di-commit terpisah dari perbaikan di atas supaya diff-nya terbaca.

### Sebelumnya

- ✅ Error lint `react-hooks/set-state-in-effect` di `components/ui/ChatBubble.tsx`
  — `follow` sekarang turunan `useSyncExternalStore`, bukan `setState` di effect.
- ✅ `.DS_Store` dilepas dari git (`git rm --cached`); `.gitignore:24` sudah
  memuatnya sejak awal, masalahnya file itu terlanjur ter-track.
- ✅ Section "Status" di README disegarkan — tabel M0–M7, M7 ditandai 🚧 dengan
  rincian sudah/belum.
- ✅ **B1 — URL GitHub.** `SITE.github` di `content/site.ts`, ikon di footer
  (ditaruh paling depan, sebelum Instagram), dan tautan + kata kunci `github` /
  `repo` / `source code` di topik `contact` `lib/chatbot.ts`.
- ✅ **Tiga project baru masuk** — Load Away, Popshot!!, Shopify Automation.
  Total enam, urutan menempatkan karya 2026 di atas riwayat CV. `WORKS` genap,
  jadi sel kosong di grid dua kolom hilang. Chatbot ikut disinkronkan: topik
  `projects` sekarang menyebut enam, plus tiga topik baru dengan tautan
  TestFlight/GitHub, dan `services`/`skills`/`academy`/`experience` disesuaikan.
- ✅ **`Work.links` ditambahkan** (`content/works/types.ts`) + dirender di
  template case study. Dua project punya TestFlight publik; tanpa field ini
  halaman case study-nya tidak punya jalan ke build yang bisa dicoba.
- ✅ **Pemetaan `content/services.ts` diperbaiki.** "Cross-Platform Apps" kini
  menunjuk ABSATA (benar-benar Flutter, bukan tutorial edtech), "iOS Development"
  ke Load Away, dan "UI Implementation" diganti "AI Automation" → Shopify
  Automation.
- ✅ **Lokasi diseragamkan jadi "Bali, Indonesia".** Hero sebelumnya bilang
  "Indonesia" saja sementara `AboutWindows` dan chatbot sudah bilang Bali —
  permukaan yang paling ramai dibaca justru yang paling kabur. `content/site.ts`
  (`location`, `locationLabel`, deskripsi SEO) sekarang sejalan dengan keduanya.
  Catatan: field `location` belum dipakai komponen mana pun — Hero membaca
  `locationLabel`. Sengaja dipertahankan karena JSON-LD `Person` akan
  membutuhkannya sebagai `addressLocality`.
- ✅ **Rentang waktu Higgz & MDP diperbaiki.** Higgz ditulis "2024" padahal
  Feb 2023 – Feb 2024 (empat tempat: `content/works/higgz-academia.ts`, dan tiga
  topik di `lib/chatbot.ts`); MDP ditulis "2023" padahal Sep 2023 – Jan 2024
  (tiga tempat). `facts.Timeline` di kedua case study sebenarnya sudah benar
  sejak awal — yang salah hanya field `year` dan salinan di chatbot.
- ✅ **Higgz dikenali sebagai perusahaan Singapura.** Ditambahkan ke
  `facts.Client` dan ke dua topik chatbot. Ini satu-satunya bukti konkret untuk
  klaim "remote collaboration across Asia" di `AboutWindows`.
- ✅ **Student exchange Dian Nuswantoro masuk** ke topik `education` chatbot,
  plus kata kunci `exchange` / `pertukaran`. Sebelumnya nol penyebutan di situs.
- ✅ **`NEXT_PUBLIC_SITE_URL` didokumentasikan di `.env.example`.** Sebelumnya
  file itu merinci lima env Supabase tapi tidak menyebut satu-satunya env yang
  kalau lupa diset akan merusak sitemap, robots, dan semua og:image.
- ✅ **Deskripsi SEO menyebut Apple Developer Academy.** Kalimat lama tidak
  menyebut Academy maupun lokasi — terbaca sama seperti portofolio mobile mana
  pun, padahal ini kalimat yang muncul di hasil pencarian & preview tautan.
- ✅ **B2 — handle sosial diverifikasi.** Instagram-nya ternyata **`umarmuhd._`**,
  bukan `umarmuhdhor` seperti yang ditebak dari username git — jadi tautan
  Instagram di footer selama ini memang mati. `content/site.ts` sekarang menulis
  tiga handle terpisah, bukan satu konstanta yang ditempel ke tiga URL, dan
  komentarnya melarang menyatukannya lagi. Kalimat chatbot yang mengklaim satu
  handle dipakai di LinkedIn *dan* Instagram ikut diperbaiki.
