# M1 — Foundation

> Setup project, wiring semua library scroll/animasi, design tokens final, layout dasar. Output: homepage yang bisa discroll biasa (belum sticky-stacking), font & palet v2 terkunci, Lenis↔ScrollTrigger sudah nyambung dan terverifikasi.

Referensi: PRD §3, §4, §13 (M1); DESIGN §2 (tokens), §3 (layout persisten).

---

## 1. Tujuan & Acceptance Criteria

**STATUS: ✅ SELESAI & QA LOLOS (22 Jul 2026)**

- [x] `next dev` jalan, homepage render tanpa error di desktop & mobile.
- [x] Semua design token (warna, font, spacing, radius) tersedia sebagai CSS variable dan Tailwind theme extension. *(Tailwind v4 → pakai `@theme inline` di `globals.css`, bukan `tailwind.config.ts`.)*
- [x] Role font ter-load & self-hosted (display/body/system → Geist sementara; **script di-drop**, lihat DESIGN §2.2).
- [x] Lenis smooth-scroll aktif; ScrollTrigger membaca posisi dari Lenis — diverifikasi dengan dummy probe, hasil scrub linear & reversible (0→0.25→0.5→1→0).
- [x] Elemen layout persisten tampil di semua viewport: frame lines kiri-kanan, honors badge kanan.
- [x] `prefers-reduced-motion` helper siap dipakai milestone berikutnya (`lib/motion.ts` + CSS guard).
- [x] No horizontal overflow di mobile (375) maupun desktop (1440): `scrollWidth === innerWidth`, 0 elemen overflow.

---

## 2. Prasyarat

- Node ≥ 20, package manager (pnpm direkomendasikan).
- Aset font final sudah diputuskan & file `.woff2`-nya ada (lihat PRD §15 Open Question #1 — display & body font wajib berlisensi jelas sebelum M1 ditutup). Geist ambil dari `geist` npm package.

---

## 3. Langkah

### 3.1 Scaffold project
```bash
pnpm create next-app@latest . --typescript --tailwind --app --eslint --turbopack --src-dir=false --import-alias "@/*"
pnpm add lenis gsap
pnpm add geist
pnpm add -D prettier prettier-plugin-tailwindcss
```
- Aktifkan TS `strict: true` di `tsconfig.json`.
- Setup Prettier + `prettier-plugin-tailwindcss` untuk auto-sort class.

### 3.2 Self-host fonts
- Taruh file di `public/fonts/`.
- Load via `next/font/local` di `app/layout.tsx` untuk display & body; Geist via `import { GeistSans } from 'geist/font/sans'`.
- Assign ke CSS variable: `--font-display`, `--font-body`, `--font-system`.
- `next/font` otomatis handle preload + `font-display: swap`.

### 3.3 Design tokens → `app/globals.css`
Definisikan semua token dari DESIGN §2 sebagai CSS variable di `:root`:
```css
:root {
  --color-bg-cream: #f7f1ed;
  --color-bg-dark: #242424;
  --color-accent: <WARNA-BRAND-SENDIRI>;      /* WAJIB ganti dari #FFD640, DESIGN §2.1 */
  --color-accent-soft: <turunan>;
  --color-accent-line: <opsional, ganti dari terakota>;
  --color-text-primary: #0a0a0a;
  --color-text-secondary: rgb(99,99,99);
  --color-text-inverse: #f7f1ed;
  --color-text-ghost: rgba(0,0,0,0.15);
  --radius-pill: 9999px;
  --radius-card: 20px;
  --frame-inset: 5%;
}
```
- Extend Tailwind theme (`tailwind.config.ts`) supaya token dipakai sebagai utility (`bg-cream`, `text-secondary`, dll) — jangan pakai arbitrary value untuk warna yang berulang.
- Set base: `html { background: var(--color-bg-cream); }`, `body { font-family: var(--font-body); color: var(--color-text-primary); }`.

### 3.4 Lenis + GSAP ScrollTrigger wiring (KRITIS)
Buat `components/providers/SmoothScrollProvider.tsx` (client component):
```tsx
'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ /* smooth opts */ });
    lenis.on('scroll', ScrollTrigger.update);            // sync #1: trigger baca posisi Lenis
    gsap.ticker.add((time) => lenis.raf(time * 1000));   // sync #2: satu RAF loop
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.destroy();
      gsap.ticker.remove(/* fn di atas — simpan ref */);
    };
  }, []);
  return <>{children}</>;
}
```
- Bungkus `{children}` di `app/layout.tsx` dengan provider ini.
- Tambah class `lenis` + `overscroll-none` ke `<html>` (DESIGN §3, PRD §5.1).
- `lib/gsap.ts`: register plugin sekali di satu tempat untuk dipakai ulang.

### 3.5 Verifikasi sync
- Pasang 1 dummy element dengan ScrollTrigger sederhana (mis. box yang `gsap.to` opacity saat masuk viewport, `scrub: true`).
- Konfirmasi progress animasi mengikuti posisi visual Lenis, bukan native scroll (tidak ada lag/desync). Ini validasi risiko PRD §12 #6. Hapus dummy setelah lolos.

### 3.6 Layout persisten
- `components/layout/FrameLines.tsx`: 2 garis vertikal `fixed` di `left: var(--frame-inset)` / `right: var(--frame-inset)`, `1px`, warna border tipis. `z-index` di atas konten tapi `pointer-events-none`.
- `components/layout/HonorsBadge.tsx`: badge `fixed` tepi kanan, monogram + label "Honors" rotasi 90° (DESIGN §4.2). Latar solid gelap kontras. Boleh "mengintip" terpotong di mobile (DESIGN §7 — itu by design, bukan bug).
- Mount keduanya di `app/layout.tsx` supaya muncul di semua halaman.

### 3.7 Homepage skeleton
- `app/page.tsx`: render 6 `<section>` placeholder polos (hero, statement-dark, value, service, project-index, footer) dengan tinggi `min-h-screen` dan warna latar sesuai peran (DESIGN §3). Belum ada animasi/stacking — cuma scroll linear. Ini kanvas untuk M2+.

### 3.8 Reduced-motion helper
- `lib/motion.ts`: helper `prefersReducedMotion()` + wrapper `gsap.matchMedia()` pattern yang akan dipakai tiap milestone animasi. Dokumentasikan cara pakainya di komentar file.

---

## 4. File yang Dibuat/Disentuh

- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- `tailwind.config.ts`, `tsconfig.json`, `.prettierrc`
- `components/providers/SmoothScrollProvider.tsx`
- `components/layout/FrameLines.tsx`, `components/layout/HonorsBadge.tsx`
- `lib/gsap.ts`, `lib/motion.ts`
- `public/fonts/*`

---

## 5. Risiko & Catatan

- **Lenis + ScrollTrigger desync** = bug paling umum di stack ini. Jangan lanjut ke M2 sebelum §3.5 lolos.
- **Font lisensi** (PRD §12 #1): jangan commit font "TRIAL"/"Personal Use Only". Kalau font final belum siap, pakai Geist sementara untuk semua peran dan tandai sebagai TODO — tapi jangan deploy publik dengan font berisiko.
- **SSR/hydration:** Lenis & GSAP client-only. Provider harus `'use client'`, jangan panggil di server component.
- **Strict Mode double-effect** (dev): pastikan cleanup di `useEffect` benar supaya Lenis tidak dobel-instantiate.

---

## 6. Catatan Hasil Implementasi & QA (untuk M2+)

Deviasi & pelajaran yang berlaku ke milestone berikutnya:

1. **Tailwind v4, bukan v3.** Tidak ada `tailwind.config.ts`. Token didefinisikan di `app/globals.css`: nilai mentah di `:root`, lalu di-map via `@theme inline` supaya tersedia sebagai CSS var *dan* utility (`bg-cream`, `text-muted`, `rounded-pill`).
2. **Accent color diganti.** `--color-accent: #ff5d3b` (coral) menggantikan kuning referensi `#FFD640` sesuai DESIGN §2.1. Masih placeholder — ganti di satu tempat (`:root`) kalau brand color final beda.
3. **Font sementara Geist untuk semua peran** (display/body/system) karena font display & body berlisensi belum tersedia (PRD §12 #1). Swap nanti cukup ubah `--font-display`/`--font-body` di `globals.css`. GeistMono dihapus dari layout — tidak dipakai, tapi ikut ter-preload (buang-buang byte).
4. **Debug handle dev-only tersedia** dan dipertahankan untuk QA milestone berikutnya (otomatis hilang di production build):
   - `window.__lenis` — drive scroll deterministik saat QA. **Penting:** `window.scrollTo()` berkelahi dengan virtual scroll Lenis dan menghasilkan pengukuran sampah; selalu pakai `__lenis.scrollTo(y, { immediate: true })`.
   - `window.__gsap`, `window.__ScrollTrigger` — introspeksi `getAll()`, `maxScroll()`, `progress`.
5. **JANGAN pakai `trigger: document.documentElement`** untuk progress se-halaman — start/end terhitung salah. Untuk range seluruh halaman gunakan `{ start: 0, end: 'max' }` tanpa trigger.
6. **Jebakan QA di browser headless:** kalau pane tersembunyi, `window.innerWidth/innerHeight` bisa `0`, membuat `ScrollTrigger.maxScroll()` jadi `0` dan `end` jadi `-0.001` — terlihat seperti bug padahal artefak lingkungan. Selalu `resize_window` ke ukuran eksplisit sebelum mengukur, jangan pakai "native size".
7. **Stale Turbopack cache** bisa memunculkan `Cannot find module 'geist/font/sans'` setelah dev server auto-restart (memory threshold). Fix: `rm -rf .next` lalu `pnpm dev` ulang — bukan masalah dependency.
8. **`turbopack.root` dipin** di `next.config.ts` karena ada lockfile lain di `~/` yang bikin Next salah-deteksi workspace root.
9. **pnpm build scripts:** `pnpm-workspace.yaml` pakai `allowBuilds: { sharp: true, unrs-resolver: true }`. Tanpa ini `next dev` gagal (deps-check menjalankan `pnpm install` yang exit 1).
