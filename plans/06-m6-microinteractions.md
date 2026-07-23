# M6 — Micro-interactions & Polish

> Detail "craft" yang bikin situs terasa premium: nav pill text-roll, cursor-follow image preview di project list, split-text hero entrance, hover states, cursor kustom (opsional). Framer Motion untuk interaksi non-scroll.

Referensi: PRD §5.4; DESIGN §4.1, §4.5, §5.

---

## 1. Tujuan & Acceptance Criteria

- [ ] Nav pill mengambang (bottom-center) → klik expand jadi menu HOME/WORKS/CONTACT.
- [ ] Hover per item menu: text-roll (huruf lama slide keluar atas, duplikat masuk dari bawah).
- [ ] Split-text hero: nama muncul stagger per huruf saat load.
- [ ] Project Index: hover baris → gambar preview muncul mengikuti kursor (spring, `pointer-events-none`).
- [ ] Mobile: cursor-follow preview diganti thumbnail statis (fallback fungsional, bukan hilang — DESIGN §7).
- [ ] Cursor kustom (jika dipertahankan) — keputusan mobile eksplisit (Open Question PRD §15 #4).
- [ ] Semua interaksi hover punya focus-state ekuivalen untuk keyboard.

---

## 2. Prasyarat

- M1 selesai. M2 (section) & M5 (project data) idealnya sudah ada supaya interaksi terpasang di konten real.
- `pnpm add framer-motion`.

---

## 3. Langkah

### 3.1 Split-text hero
- `components/ui/SplitText.tsx`: pecah string jadi `<span>` per karakter (inline-block), stagger via Framer Motion `staggerChildren` (PRD §5.4, DESIGN §2.2).
- Trigger saat mount (one-shot), bukan scroll.
- Reduced-motion: tampil langsung tanpa stagger.
- A11y: bungkus dengan `aria-label` teks lengkap, `aria-hidden` pada span per-huruf supaya screen reader baca utuh.

### 3.2 Nav pill + text-roll
- `components/layout/NavPill.tsx`: pill `fixed bottom-center`, `radius-pill`, latar `--color-accent`. Label "Menu" + ikon ≡.
- Klik → expand ke menu 3 item (Framer Motion layout animation / height).
- Text-roll per item (DESIGN §4.1):
```tsx
// tiap huruf punya 2 salinan bertumpuk; group hover → translateY berlawanan
<span className="relative inline-block overflow-hidden">
  <span className="block transition-transform group-hover:-translate-y-full">{c}</span>
  <span className="absolute inset-0 translate-y-full transition-transform group-hover:translate-y-0">{c}</span>
</span>
```
- Bisa CSS-only (transition) atau Framer Motion. CSS lebih ringan untuk hover sederhana.

### 3.3 Project Index cursor-follow preview
- `components/sections/ProjectIndex.tsx`: list baris (kategori kiri, tahun kanan), grid 2 kolom + crosshair `+` (DESIGN §4.5).
- Floating image mengikuti kursor:
```tsx
const x = useMotionValue(0), y = useMotionValue(0);
const sx = useSpring(x, { stiffness: 300, damping: 30 });
// onMouseMove baris → set x/y ke posisi kursor
// image absolute, pointer-events-none, opacity 0→1 saat hover baris
```
- Tiap baris punya `data-preview={src}`; hover set src gambar aktif.
- Klik baris → navigate `/works/[slug]`.

### 3.4 Mobile fallback
- `<768px` (atau `(hover: none)`): matikan cursor-follow, render thumbnail statis kecil per baris (DESIGN §7). Link tetap jelas tap-able.
- Deteksi via `matchMedia('(hover: hover)')`, bukan lebar saja.

### 3.5 Cursor kustom (opsional)
- Elemen `fixed` z-index tinggi mengikuti pointer (Framer Motion spring).
- Keputusan: **disable di touch device** (default). Kalau menambah kompleksitas tanpa nilai jelas, boleh di-drop (Open Question PRD §15 #4).

### 3.6 Hover states umum
- Link, pill, card: transisi hover halus (scale/opacity/underline-draw). Konsisten pakai token & durasi seragam.

---

## 4. File yang Dibuat/Disentuh

- `components/ui/SplitText.tsx`
- `components/layout/NavPill.tsx`
- `components/sections/ProjectIndex.tsx`
- `components/ui/CustomCursor.tsx` (opsional)
- `components/sections/Hero.tsx` (pakai SplitText)

---

## 5. Risiko & Catatan

- **Split-text & SEO/a11y:** teks yang dipecah per-span bisa rusak untuk screen reader / copy-paste. Selalu sediakan `aria-label` utuh.
- **Cursor-follow performa:** gunakan `transform` (GPU) + spring, jangan set `left/top` per mousemove (reflow). `pointer-events-none` wajib.
- **Hover di touch:** jangan andalkan `:hover` untuk fungsi penting — sediakan fallback tap.
- **Framer Motion bundle size:** import selektif; jangan tarik seluruh lib kalau cuma butuh beberapa fitur.
- **Jangan drive scroll-linked pakai Framer Motion di sini** — itu domain GSAP (PRD §3). Framer Motion khusus mount/hover/state.
