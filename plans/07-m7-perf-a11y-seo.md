# M7 — Performance, Accessibility, SEO, Analytics & Ship

> Finalisasi: reduced-motion audit menyeluruh, capai target Lighthouse, analytics proxy anti-adblock, SEO per halaman, deploy Vercel. Gate terakhir sebelum submit galeri.

Referensi: PRD §9, §10, §11, §14; DESIGN §7, §8, §10.

---

## 1. Tujuan & Acceptance Criteria

- [ ] Lighthouse: Perf ≥85 desktop / ≥75 mobile, A11y ≥90, Best Practices & SEO tinggi.
- [ ] 60fps scroll di device mid-range (Chrome Performance panel, no long tasks berulang).
- [ ] First paint < 2s di 4G.
- [ ] `prefers-reduced-motion` mematikan SEMUA animasi berat (GSAP, split-text, 3D idle) — situs tetap fungsional & terbaca.
- [ ] Keyboard: semua CTA/link reachable + focus ring terlihat.
- [ ] Kontras WCAG AA lolos (teks di atas cream, di atas accent, item pudar service list).
- [ ] Analytics (Vercel Web Analytics + Speed Insights) di-proxy lewat rewrite — tidak diblok adblocker.
- [ ] OG image unik per halaman terverifikasi (homepage + tiap `/works/[slug]`).
- [ ] Maks 2-3 WebGL context aktif — diaudit.
- [ ] No horizontal overflow di semua breakpoint.

---

## 2. Prasyarat

- M1-M6 selesai (semua fitur ada). M7 = polish & hardening, bukan fitur baru.

---

## 3. Langkah

### 3.1 Reduced-motion audit menyeluruh
- Telusuri tiap animasi: pastikan ada cabang `gsap.matchMedia('(prefers-reduced-motion: reduce)')` atau cek Framer Motion `useReducedMotion()`.
- Checklist: sticky-stacking (M2), SVG line-draw (M3), 3D idle+scroll (M4), split-text (M6), cursor-follow (M6), reveal galeri (M5).
- Test dengan OS setting reduce-motion aktif: situs harus jadi scroll linear statis yang tetap masuk akal (tidak ada garis setengah-gambar, objek tidak stuck).

### 3.2 Performa
- **Images:** semua raster `.webp` via `next/image`, `quality={75}`, `loading="lazy"` di bawah lipatan, `priority` hanya untuk hero (PRD §9).
- **Fonts:** preload display+hero (`next/font` auto). Subset kalau bisa.
- **3D:** `.glb` compressed (draco/meshopt), lazy, `frameloop="demand"`, pause saat keluar viewport. Audit jumlah WebGL context ≤ 2-3 (DESIGN §10).
- **Code splitting:** `dynamic(..., { ssr: false })` untuk Scene 3D & komponen berat. Cek bundle dengan `@next/bundle-analyzer`.
- **ScrollTrigger:** `ScrollTrigger.batch()` / kill instance yang keluar viewport, hindari ratusan trigger aktif (PRD §12 #5).
- **Layout shift:** set dimensi eksplisit semua media → CLS ~0.

### 3.3 Aksesibilitas
- Semua interaktif reachable keyboard, `:focus-visible` ring jelas (PRD §11).
- Split-text `aria-label` utuh (M6).
- Kontras: cek `--color-text-secondary` di atas cream, teks di atas `--color-accent`, item pudar service list saat fokus (DESIGN §8). Perbaiki token kalau gagal AA.
- Landmark & heading order benar (`<main>`, `<nav>`, `<footer>`, h1→h2 hierarki).
- Alt text bermakna untuk semua gambar.

### 3.4 SEO & metadata
- Per halaman: `title`, `description` unik (homepage + case study).
- OG image unik per halaman (verifikasi ulang M5 kerja).
- `sitemap.ts` + `robots.ts` (Next.js metadata routes).
- Structured data opsional (Person/CreativeWork).

### 3.5 Analytics proxy (anti-adblock)
- Vercel Web Analytics + Speed Insights (`@vercel/analytics`, `@vercel/speed-insights`).
- Proxy lewat `rewrites` di `next.config` supaya script disajikan dari domain sendiri (path ber-hash) — tidak diblok adblocker (PRD §10). Tidak ada GA/Plausible/Umami.

### 3.6 Footer credit
- Credit line sesuai proses kerja AKTUAL sendiri (mis. "Designed in Figma", "Built with Next.js") — jangan copy klaim referensi mentah (PRD §10, DESIGN §9).

### 3.7 Deploy Vercel
- Static prerendering aktif, edge region terdekat audiens.
- Verifikasi `x-vercel-cache`, Brotli, prerender headers.
- Cek build output: no runtime error, semua `/works/[slug]` ter-generate statis.

### 3.8 Cross-device QA
- iOS Safari + Android Chrome: sticky-stacking, Lenis momentum, nav pill, no horizontal scroll.
- Desktop: Chrome/Firefox/Safari.
- Throttle CPU 4x + 4G di DevTools untuk simulasi mid-range.

---

## 4. File yang Dibuat/Disentuh

- `next.config.ts` (rewrites analytics, image config)
- `app/sitemap.ts`, `app/robots.ts`
- `app/layout.tsx` (Analytics + SpeedInsights components)
- `lib/motion.ts` (finalisasi reduced-motion helper)
- Semua komponen animasi (audit reduced-motion branch)

---

## 5. Risiko & Catatan

- **Perf regression dari 3D/canvas** = risiko terbesar mobile. Kalau mobile < 75, pertimbangkan degrade 3D ke poster statis di mobile (bukan cuma reduce quality).
- **Reduced-motion setengah jalan** = animasi stuck di frame acak → tampak rusak. Pastikan state final, bukan sekadar "pause".
- **Adblock proxy** bisa berubah mengikuti update Vercel — verifikasi script benar-benar termuat via Network tab.
- **Lighthouse mobile** ketat: throttling agresif. Target 75 realistis untuk situs canvas-heavy; kalau perlu, potong efek non-esensial di mobile.
- **Submit galeri** (Awwwards/Godly/Land-book) = setelah semua gate lolos. Guardrail PRD v1 tetap: konten inti ≤2 klik dari cold load.
