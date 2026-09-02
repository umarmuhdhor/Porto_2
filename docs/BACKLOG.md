# Backlog — yang perlu diperbaiki & data yang belum ada

Hasil audit codebase 2026-08-22, diperbarui 2026-09-03 setelah batch P0+P1
Bagian A dikerjakan. Dua bagian besar:

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

- [ ] **`@supabase/supabase-js` masuk bundle homepage.**
      Terlihat di network `/`: chunk `@supabase_supabase-js_dist_index_mjs`.
      Penyebabnya `GuestbookDock` selalu mounted di `app/layout.tsx`.
      **Fix:** `import()` dinamis klien Supabase saat panel dibuka — pola yang
      `components/layout/LiveCursors.tsx` sudah pakai.

- [ ] **`BROADCAST_MS = 70`** (`lib/live-cursors.ts:16`) ≈ 14 pesan/detik per
      pengunjung yang menggerakkan mouse. Kuota Realtime free tier dihitung per
      pesan. Naikkan ke ~120–150ms.

- [ ] **Tidak ada test & CI.** Tidak ada `.github/`. Minimal satu workflow yang
      menjalankan `pnpm lint` + `pnpm build` per push — itu yang akan menangkap
      regresi seperti error lint ChatBubble kemarin sebelum sampai `main`.
      Nilainya naik setelah batch P0: `lib/site-url.ts` kini sengaja
      MENGGAGALKAN build produksi saat env-nya salah, dan CI adalah tempat yang
      benar untuk menemui kegagalan itu — bukan deploy Vercel.


### P3 — nice to have

- [ ] **Sisa audit M7 belum dijalankan** — angka Lighthouse, kontras WCAG AA
      (teks pudar di service list paling rawan), focus ring keyboard, overflow
      horizontal per breakpoint, jumlah WebGL context aktif.
      Kriteria lengkapnya di `plans/07-m7-perf-a11y-seo.md` §1.


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
