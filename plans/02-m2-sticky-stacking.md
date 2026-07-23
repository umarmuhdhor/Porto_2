# M2 — Sticky Stacking & Section Transitions

> Efek section saling menumpuk/menggantikan saat scroll (bukan scroll-through biasa), plus transisi brush-stroke organik antar section terang↔gelap. Output: homepage dengan koreografi stacking berjalan mulus di desktop.

Referensi: PRD §5.2, §5.3; DESIGN §3, §4.3.

---

## 1. Tujuan & Acceptance Criteria

**STATUS: ✅ SELESAI & QA LOLOS (22 Jul 2026)** — kecuali 1 item yang tidak bisa
diverifikasi di environment ini, lihat catatan.

- [x] Hero background berperilaku `fixed`-like (tetap di belakang saat section berikutnya naik menutupinya).
- [x] Section dark & light "pinned" bergantian dan saling crossfade/menumpuk saat scroll.
- [x] Transisi antar section kontras dihias brush-stroke divider (bukan garis lurus).
- [x] Service list section: 1 item aktif (solid) vs sisanya pudar, item aktif berganti terikat scroll progress.
- [x] Scroll ke atas membalik animasi dengan mulus (semua pakai `scrub`, reversible).
- [~] Prototipe `pin` vs `position: sticky` — **keputusan diambil: `sticky` + GSAP scrub, `pin` tidak dipakai**
      (alasan di §6.1). **Uji di device iOS Safari asli MASIH UTANG** — tidak ada device/simulator
      iOS di environment ini. Risiko sudah diperkecil karena pendekatan yang dipilih justru yang
      menghindari sumber jitter-nya, tapi tetap wajib dicek sebelum ship (M7).

---

## 2. Prasyarat

- M1 selesai: Lenis↔ScrollTrigger sync terverifikasi, 6 section skeleton ada.
- Aset brush-stroke `.webp` tersedia di `public/brush/` (buat sendiri / lisensi jelas — DESIGN §9).

---

## 3. Langkah

### 3.1 Keputusan teknik: `pin` vs `sticky`
Prototipe cepat DUA pendekatan untuk 2 section (dark + light), uji di iOS Safari + Android Chrome:
- **Opsi A — GSAP `ScrollTrigger pin: true`:** kontrol timeline penuh (opacity/scale crossfade), tapi rawan jitter di iOS momentum-scroll.
- **Opsi B — CSS `position: sticky; top: 0` + h-screen:** lebih stabil native, tapi terbatas untuk crossfade kompleks.
- Rekomendasi PRD: pakai `pin` untuk section yang butuh crossfade timeline, `sticky` murni untuk yang cuma "nempel". Kunci keputusan di sini, dokumentasikan.

### 3.2 Hero fixed background
- Hero section: layer background `fixed inset-0` dengan `h-[120vh]` (DESIGN §3, PRD §5.2). Konten hero (nama) di layer terpisah.
- Section setelahnya punya `z-index` lebih tinggi + latar solid supaya "naik menutupi" hero saat discroll.

### 3.3 Sticky-stacking section (dark → light)
- Bungkus tiap section stacking dalam wrapper GSAP timeline:
```tsx
useGSAP(() => {
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=100%',
        pin: true,
        scrub: true,
      },
    });
    // crossfade: section keluar fade+scale, section masuk fade in
  });
}, { scope: sectionRef });
```
- Gunakan `useGSAP` hook (`@gsap/react`) untuk auto-cleanup context per komponen:
```bash
pnpm add @gsap/react
```
- Pastikan `pin-spacing` benar supaya tidak ada "loncatan" tinggi saat pin lepas.

### 3.4 Brush-stroke divider
- `components/ui/BrushDivider.tsx`: aset `.webp` bertekstur kuas di batas 2 section warna kontras (DESIGN §4.3).
- Posisikan absolute di tepi section; reveal ringan terikat scroll (fade/position, bukan animasi kompleks — DESIGN §5).
- Pakai `next/image` dengan `priority` false (di bawah lipatan).

### 3.5 Service list — scroll-active item
- `components/sections/ServiceList.tsx`: daftar kapabilitas, tiap item punya 2 state (aktif = solid `text-primary` besar, non-aktif = `text-ghost` pudar).
- Item aktif berganti berdasar scroll progress dalam section: ScrollTrigger `scrub` yang memetakan progress → index aktif, update opacity/weight.
- CTA "View all works below" di bawah list.
- A11y: item pudar tetap punya kontras cukup saat fokus keyboard — jangan andalkan opacity saja (DESIGN §8).

### 3.6 Reduced-motion branch
- Di `prefers-reduced-motion: reduce`: matikan `pin` & crossfade, render section sebagai scroll linear biasa dengan urutan sama. Konten identik, cuma tanpa koreografi.

---

## 4. File yang Dibuat/Disentuh

- `components/sections/Hero.tsx` (layer fixed bg)
- `components/sections/StatementDark.tsx`, `ValueSection.tsx`, `ServiceList.tsx`
- `components/ui/BrushDivider.tsx`
- `app/page.tsx` (rangkai section + stacking order)
- `public/brush/*`

---

## 5. Risiko & Catatan

- **iOS Safari momentum-scroll + pin** = sumber jitter utama. Kalau Opsi A goyang, fallback ke `sticky` untuk section itu.
- **`pin-spacing` salah** → konten bawah "meloncat". Uji tinggi total halaman tetap masuk akal.
- **Terlalu banyak pin bersamaan** → performa turun. Batasi jumlah section pinned aktif (M7 audit).
- **z-index war:** dokumentasikan skala z-index (frame lines, badge, nav pill, section) di satu tempat supaya tidak konflik.

---

## 6. Catatan Hasil Implementasi & QA (untuk M3+)

### 6.1 Keputusan: `sticky` menang, `pin` tidak dipakai

Semua panel stacking pakai **CSS `position: sticky; top: 0` untuk menahan panel**, dan
**GSAP `scrub` cuma untuk crossfade konten** — `ScrollTrigger pin: true` tidak dipakai sama sekali.

- `pin` membungkus elemen dalam pin-spacer & mengganti-ganti `position`; itu sumber jitter di
  iOS momentum-scroll dan sumber bug `pin-spacing` (tinggi halaman meloncat).
- `sticky` ditangani compositor native → stabil, tinggi dokumen selalu masuk akal, tanpa spacer.
- Kontrol timeline tetap ada: GSAP menganimasi opacity/scale/y **konten**, tidak menyentuh layout panel.

**Aturan layout yang tidak boleh dilanggar:** semua `.stack-panel` WAJIB direct child dari satu
parent tinggi yang sama (`<main>`). Sticky berhenti di batas parent — justru itu yang membuat panel
tetap nempel sementara section berikutnya naik menutupinya. Membungkus tiap panel dalam wrapper
sendiri akan mematahkan efeknya (panel lepas sebelum sempat ditutupi).

Tinggi panel = `(100 + hold) vh`: `hold` vh pertama = panel diam, 100 vh terakhir = fase ditutupi.

### 6.2 ScrollTrigger tidak boleh nge-trigger elemen sticky

Rect elemen sticky bergeser saat nempel → `start`/`end` salah hitung. Solusinya tiap
`StackSection` menaruh **div setinggi 0 non-sticky** tepat sebelum panelnya sebagai anchor
pengukuran. `start`/`end` ditulis sebagai fungsi (`() => \`top top-=${holdPx()}\``) +
`invalidateOnRefresh: true` supaya ikut resize.

### 6.3 Brush divider = SVG inline, bukan `.webp`

Deviasi sadar dari §3.4. Warna divider harus persis sama dengan latar section penutup →
`currentColor` menyelesaikannya dengan satu komponen; `.webp` butuh satu file per warna.
Bonus: aset digambar sendiri (bebas isu lisensi PRD §12), ~1 KB, tajam di semua DPR.
`public/brush/` sengaja dibiarkan kosong (ada README-nya).

Catatan desain dari iterasi QA: tepi dengan amplitudo & jarak puncak seragam terbaca sebagai
**gelombang CSS**, dan segitiga tegak simetris terbaca sebagai **puncak gunung**. Yang bikin
terbaca sebagai kuas: amplitudo tidak beraturan + sliver tipis meruncing yang **miring/asimetris**.

### 6.4 Kontras — angka yang sudah dihitung, jangan diturunkan tanpa hitung ulang

Diukur di browser dengan compositing alpha di canvas (nilai `oklab()`/`color-mix()` tidak bisa
diparse manual):

| Elemen | Rasio | Butuh |
|---|---|---|
| Kata redup `text-inverse/40` di dark | 3.43 | ≥3 (teks besar) |
| Paragraf kecil `text-inverse/60` di dark | 5.90 | ≥4.5 |
| Service item non-aktif di cream | 3.10 | ≥3 (teks besar) |
| Service item aktif di cream | 17.69 | — |
| `text-muted` di cream (meta/CTA/tahun) | 5.37 | ≥4.5 |
| Link footer di accent | 6.49 | ≥4.5 |

`--color-ghost` (rgba(0,0,0,.15)) **tidak dipakai** untuk service item — cuma ~1.3:1, padahal
item non-aktif tetap konten yang harus terbaca. Diganti `color-mix(in srgb, var(--color-ink) 45%, transparent)`.

### 6.5 Reduced-motion

Dimatikan lewat CSS, bukan JS: di `prefers-reduced-motion: reduce`, `.stack-panel` jadi
`position: relative; height: auto` → halaman jadi scroll linear biasa dengan urutan konten identik
dan tanpa ruang scroll kosong sisa fase hold. GSAP `matchMedia` cuma mendaftarkan cabang
`NO_PREFERENCE`, jadi tidak ada tween yang tertinggal. Karena tanpa scrub tidak ada item "aktif",
semua `.service-item` dirender kontras penuh di mode ini.

### 6.6 Jebakan QA baru (di luar yang sudah dicatat M1 §6)

1. **Preview pane yang hidden membekukan rAF.** Akibatnya: (a) `lenis.scrollTo()` tidak pernah
   diterapkan, (b) CSS `transition` beku di nilai awal — sempat terbaca seperti "warna item aktif
   terbalik", padahal artefak. Workaround yang dipakai: drive manual
   `lenis.raf(performance.now())` lalu `ScrollTrigger.update()` — bypass rAF sepenuhnya.
2. **Screenshot cuma valid tepat setelah navigasi.** Selama pane hidden, scroll via JS tidak
   memicu repaint → screenshot mengembalikan frame basi (terlihat seperti halaman kosong/blank).
   Untuk verifikasi visual komponen, bikin route QA sementara yang terlihat di scroll 0, screenshot,
   lalu hapus routenya.
3. **State React tidak flush di dalam satu blok JS sinkron.** Probe yang men-scroll + membaca
   `aria-current` dalam satu loop akan selalu membaca state awal. Sisipkan `await sleep()` antar
   langkah.
4. **JSX comment `{/* */}` tidak boleh jadi sibling elemen** di dalam callback `.map()` yang
   me-return satu elemen — Turbopack gagal parse dengan pesan menyesatkan `Expected '</', got 'ident'`.
