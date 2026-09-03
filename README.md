# Porto v2 — Cinematic Scroll Portfolio

Portfolio pribadi kelas Awwwards. Next.js (App Router) + Tailwind + Lenis + GSAP + Framer Motion + React Three Fiber.

## Dokumen

- PRD: [docs/PRD-portfolio-v2-cinematic-scroll.md](docs/PRD-portfolio-v2-cinematic-scroll.md)
- Design spec: [docs/DESIGN-portfolio-v2-cinematic-scroll.md](docs/DESIGN-portfolio-v2-cinematic-scroll.md)
- Implementation plan (per-milestone): [plans/00-overview.md](plans/00-overview.md)
- Backlog — perbaikan & data yang belum ada: [docs/BACKLOG.md](docs/BACKLOG.md)

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 |
| Smooth scroll | Lenis |
| Scroll-linked animation | GSAP + ScrollTrigger |
| UI motion | Framer Motion |
| 3D | Three.js via React Three Fiber |

## Dev

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm lint
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest run
pnpm test:watch
pnpm format       # prettier + tailwind class sort
```

Kelima perintah verifikasi (`lint`, `format:check`, `typecheck`, `test`,
`build`) dijalankan CI per push ke `main` dan per pull request —
[.github/workflows/ci.yml](.github/workflows/ci.yml).

Test hanya untuk modul pure: [guestbook](lib/guestbook.test.ts) (aturan validasi
yang dipakai client & server), [site-url](lib/site-url.test.ts) (empat cabang
yang menggagalkan build produksi), [chatbot](lib/chatbot.test.ts) (pencocokan
topik + integritas TOPICS), dan [works](lib/works.test.ts) (kontrak data case
study, termasuk cek tiap aset benar-benar ada di `/public`). Komponen React
diverifikasi lewat browser sungguhan, bukan DOM palsu.

## Konten — di mana datanya

Semua yang perlu diganti saat mengisi portofolio ada di `content/`. Tidak ada
teks identitas yang ditulis langsung di komponen.

| Data | File |
|---|---|
| Nama, role, lokasi, email, handle sosial, monogram, judul & deskripsi SEO | [content/site.ts](content/site.ts) |
| Daftar layanan (section "services") | [content/services.ts](content/services.ts) |
| Satu case study | `content/works/<slug>.ts` |
| Registry & urutan tampil case study | [lib/works.ts](lib/works.ts) |
| Basis pengetahuan chatbot | [lib/chatbot.ts](lib/chatbot.ts) — array `TOPICS` |
| Isi jendela "about" | [components/sections/AboutWindows.tsx](components/sections/AboutWindows.tsx) — tetap di komponen karena kalimatnya membawa penanda `<Hl>` per frasa |

### Menambah case study

1. Buat `content/works/<slug>.ts` — contek [content/works/absata.ts](content/works/absata.ts), bentuk fieldnya di [content/works/types.ts](content/works/types.ts).
2. Taruh gambar di `public/works/<slug>/`. Rasio dikunci: banner & `span: 'full'` = 16:9, `span: 'half'` = 3:2.
3. Import + masukkan ke array `WORKS` di [lib/works.ts](lib/works.ts). Urutan array = urutan tampil di homepage dan urutan nav prev/next.

Beberapa field punya jumlah yang sudah ditentukan layoutnya: `facts` 3–4 item,
`approach` tepat 3 langkah, `outcomes` tepat 3 angka (gridnya tiga kolom).
Grid ProjectIndex dua kolom, jadi jumlah project ganjil menyisakan satu sel kosong
(sekarang enam — genap).

`links` opsional: isi hanya kalau ada build atau repo yang benar-benar bisa
dibuka pengunjung (TestFlight, App Store, GitHub).

`content/services.ts` menunjuk project lewat **slug**, bukan path gambar — slug
yang tak terdaftar menggagalkan build, bukan diam-diam merender kartu kosong.

Aset di `public/works/` saat ini masih placeholder hasil `pnpm gen:works`.
Ganti dengan screenshot asli sebelum rilis publik; manifest script itu ditulis
tangan, dan script akan berhenti kalau slugnya menyimpang dari `content/works/`.

## Guestbook anonim

Panel mengambang di pojok kanan atas ([components/layout/GuestbookDock.tsx](components/layout/GuestbookDock.tsx)),
dibuka lewat pil "Guestbook". Ada di semua halaman karena dipasang di layout,
sejajar NavPill/HonorsBadge. Pengunjung menulis tanpa login; data disimpan di
Supabase dan semua penjagaan ada di server.

Setup:

1. Buat project di [supabase.com](https://supabase.com) (free tier cukup).
2. SQL Editor → jalankan isi [supabase/schema.sql](supabase/schema.sql).
3. Salin `.env.example` → `.env.local`, isi `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, dan `GUESTBOOK_SALT` (`openssl rand -hex 32`).
   Project Supabase baru memberi kunci berformat `sb_secret_...` /
   `sb_publishable_...` alih-alih JWT `service_role` / `anon`; dua-duanya
   dipakai apa adanya, nama variabelnya tidak berubah.
4. Set tiga env var yang sama di Vercel → Project Settings → Environment Variables.

Catatan:

- Tabel `guestbook` RLS-on **tanpa policy** — anon key tidak bisa apa-apa. Satu-satunya
  jalan tulis adalah `POST /api/guestbook`, yang memvalidasi & me-rate-limit.
- Anti-spam: honeypot, filter kata + spam tautan ([lib/guestbook.ts](lib/guestbook.ts)),
  rate limit 1 catatan/menit & 5/jam per hash IP.
- IP tidak disimpan; yang masuk DB hanya `sha256(ip + GUESTBOOK_SALT)`.
- Moderasi = hapus baris lewat Table Editor Supabase (komentar tampil langsung, tanpa approval).

## Kursor live

[components/layout/LiveCursors.tsx](components/layout/LiveCursors.tsx) menampilkan kursor
pengunjung lain yang sedang membuka halaman yang sama, lewat Supabase Realtime
Broadcast — ephemeral, tidak menyentuh tabel apa pun.

Setup: tambahkan `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(lihat `.env.example`). Tanpa keduanya fitur mati diam-diam. Tidak ada langkah
SQL — Broadcast aktif bawaan di setiap project Supabase.

Catatan:

- **Biaya**: kuota Realtime dihitung per pesan. Laju kirim diatur `BROADCAST_MS`
  di [lib/live-cursors.ts](lib/live-cursors.ts) (default 140ms ≈ 7 pesan/detik
  saat mouse bergerak, dikali jumlah penerima di halaman yang sama). Naikkan
  angkanya kalau kuota terasa cepat habis — yang hilang cuma keterlambatan
  kursor, bukan kehalusannya, karena penerima meng-interpolasi antar-sampel.
- Channel dipisah per pathname — pembaca `/works/absata` tidak melihat kursor
  orang yang ada di homepage.
- Mati otomatis di perangkat sentuh (`pointer: coarse`); klien Supabase juga
  tidak diunduh di sana karena di-`import()` dinamis.
- Posisi dikirim sebagai fraksi ukuran dokumen, bukan piksel — pendekatan, bukan
  presisi piksel, karena tiap pengunjung punya viewport berbeda.
- Anon key memang publik dan aman di sini: tabel `guestbook` RLS-on tanpa policy,
  jadi anon key tidak bisa membaca/menulis apa pun.

## Status

Milestone plan ada di [plans/00-overview.md](plans/00-overview.md). M1–M6 sudah
terpasang; M7 tinggal dua item yang butuh perangkat & deploy asli.

| Milestone | Status | Bukti di kode |
|---|---|---|
| M0 — scaffold | ✅ | Next.js + TS strict + Tailwind v4 + Prettier |
| M1 — foundation | ✅ | design tokens, Geist + Space Grotesk, Lenis↔GSAP sync ([lib/gsap.ts](lib/gsap.ts)), frame lines, honors badge, reduced-motion helper ([lib/motion.ts](lib/motion.ts)) |
| M2 — sticky stacking | ✅ | [components/ui/StackSection.tsx](components/ui/StackSection.tsx), `.stack-panel` di [app/page.tsx](app/page.tsx) |
| M3 — SVG line-draw | ✅ | [lib/lineDraw.ts](lib/lineDraw.ts), [components/ui/SignatureLine.tsx](components/ui/SignatureLine.tsx), [components/sections/LineArt.tsx](components/sections/LineArt.tsx) |
| M4 — 3D / WebGL | ✅ | [components/three/](components/three/), `public/models/brand-object.glb` + poster fallback, di-host [ValueSection](components/sections/ValueSection.tsx) — 1 WebGL context saat gerak normal, 0 (poster saja) di reduced-motion |
| M5 — case study | ✅ | `/works/[slug]` SSG (3 slug), OG image per halaman, [BentoGallery](components/sections/BentoGallery.tsx) |
| M6 — micro-interactions | ✅ | text-roll [NavPill](components/layout/NavPill.tsx), hover preview [ProjectIndex](components/sections/ProjectIndex.tsx), [SplitText](components/ui/SplitText.tsx), [ChatBubble](components/ui/ChatBubble.tsx) |
| M7 — perf / a11y / SEO | 🚧 | **sudah:** sitemap + robots, OG unik per halaman, analytics proxy anti-adblock ([app/layout.tsx](app/layout.tsx) + rewrite di [next.config.ts](next.config.ts)), JSON-LD `Person` ([lib/json-ld.ts](lib/json-ld.ts)), skip link, 404 + error boundary ([components/layout/MessagePage.tsx](components/layout/MessagePage.tsx)), audit 2026-09-03: Lighthouse 99/100/96/100 desktop & 86/100/96/100 mobile, kontras AA (6 pelanggaran diperbaiki), focus ring, overflow, reduced-motion. **belum:** 60fps di device mid-range & verifikasi header cache/Brotli — dua-duanya butuh perangkat + deploy asli |

Di luar plan (ditambahkan setelah M7 dimulai): guestbook anonim, asisten "ask
about Umar", kursor live — lihat section masing-masing di atas.

### Belum beres sebelum rilis publik

Ringkasan. Daftar lengkap dengan prioritas, rujukan `file:line`, dan
data apa saja yang masih kosong: [docs/BACKLOG.md](docs/BACKLOG.md).

- **Aset case study masih placeholder.** 32 file di `public/works/*/` adalah SVG
  hasil `pnpm gen:works`, bukan screenshot asli — enam project, semuanya.
- **Tidak ada CV yang bisa diunduh.** Topik `resume` di
  [lib/chatbot.ts](lib/chatbot.ts) mengarahkan pengunjung ke email.
- **`HonorsBadge` belum menautkan ke mana pun** — lihat `TODO(brand)` di
  [components/layout/HonorsBadge.tsx](components/layout/HonorsBadge.tsx).
- **Test belum menyentuh route handler & komponen.** Empat modul pure sudah
  tertutup; `app/api/guestbook/route.ts` belum.

Beres 2026-09-03 (dulu ada di daftar ini): `NEXT_PUBLIC_SITE_URL` yang gagal
senyap, halaman 404 & error boundary, JSON-LD `Person`, skip link, dan CI.

> **Sebelum deploy:** set `NEXT_PUBLIC_SITE_URL` ke domain publik situs.
> [lib/site-url.ts](lib/site-url.ts) sekarang MENGGAGALKAN build produksi kalau
> env-nya kosong — dan juga kalau isinya localhost saat build jalan di Vercel.
> Itu disengaja: dulu kegagalannya diam-diam dan baru terlihat dari Google.

### Debug handle (dev-only)

`window.__lenis`, `window.__gsap`, `window.__ScrollTrigger` tersedia saat `pnpm dev` untuk QA scroll/animasi.
Pakai `__lenis.scrollTo(y, { immediate: true })` — jangan `window.scrollTo()` (berkelahi dengan virtual scroll Lenis).
