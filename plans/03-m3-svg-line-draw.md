# M3 — SVG Self-Drawing Line Animation

> Garis vektor yang "menggambar dirinya sendiri" mengikuti scroll di section dark, plus signature-line terakota kecil di atas nama hero. Teknik `stroke-dasharray` multi-value yang di-scrub GSAP.

Referensi: PRD §6; DESIGN §4.1 (signature = SVG, bukan font), §5.

---

## 1. Tujuan & Acceptance Criteria

**STATUS: ✅ SELESAI & QA LOLOS (22 Jul 2026)** — semua AC terverifikasi di browser.

- [x] Path SVG di section dark menggambar-sendiri: progress garis = progress scroll dalam section (reversible saat scroll balik).
      Diukur: `strokeDashoffset` path utama 633px→0 sepanjang fase hold, dan deret nilai saat
      scroll turun **identik** dengan saat scroll naik di posisi y yang sama.
- [x] Multi-path sequencing (referensi: 17 dari 42 path pakai dash) dengan offset berbeda per path.
      17 path, `at` 0→0.6 pada timeline berdurasi 0.85.
- [x] Path aksen warna dengan `stroke-width` yang menebal bertahap (ilusi garis tangan).
      Terakota 1.1→2.6 (lihat §6.2 — sempat kebaca meloncat 1→2→3).
- [x] Hero signature-line (terakota) tampil sebagai SVG line-art, bukan teks/font.
- [x] Reduced-motion: garis tampil dalam keadaan final (fully drawn) tanpa animasi.
      Diverifikasi dengan memalsukan `matchMedia` (§6.5).

---

## 2. Prasyarat

- M1 (GSAP sync) + M2 (section dark sudah ada & pinned) selesai.
- Aset SVG sudah di-export dari Figma/Illustrator dengan path bersih (buat sendiri — DESIGN §9). Simpan sebagai komponen React SVG inline (bukan `<img>`), supaya `path` bisa diakses DOM.

---

## 3. Langkah

### 3.1 Siapkan SVG inline
- Export garis dari Figma sebagai SVG, bersihkan (hapus grup/transform tak perlu).
- Konversi ke komponen React (`components/sections/LineArt.tsx`) — path jadi elemen JSX dengan `ref` array.
- Pastikan tiap path punya `id`/index untuk di-target.

### 3.2 Hitung panjang path
```ts
const len = pathEl.getTotalLength();
```
- Init tiap path: `strokeDasharray = len; strokeDashoffset = len;` (garis tersembunyi penuh di awal).
- Untuk efek multi-value dash (PRD §6): beberapa path pakai pola dash bertingkat, bukan single offset — interpolasi array nilai dash sepanjang progress.

### 3.3 Drive dengan GSAP + ScrollTrigger
```tsx
useGSAP(() => {
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      gsap.fromTo(p,
        { strokeDashoffset: len },
        {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: darkSectionRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: true,
          },
          delay: i * 0.02,   // stagger antar-path
        }
      );
    });
  });
}, { scope: darkSectionRef });
```
- Untuk path yang butuh `stroke-width` menebal: animasikan `strokeWidth` (mis. 8 → 9.4) di timeline yang sama, `scrub`.

### 3.4 Reduced-motion
- Di `reduce`: set semua path `strokeDashoffset: 0` statis (garis tampil penuh), skip ScrollTrigger.

### 3.5 Hero signature-line
- Aset SVG kecil (coretan tanda tangan) warna `--color-accent-line`, ditempatkan di atas nama hero (DESIGN §3, §4.1).
- Animasi draw-on saat hero masuk viewport (bisa one-shot dengan `useGSAP`, atau `scrub` tipis). Bukan scroll-panjang seperti section dark.
- Tegaskan di kode/komentar: ini SVG, bukan font Tempting (yang di-drop, DESIGN §2.2).

---

## 4. File yang Dibuat/Disentuh

- `lib/lineDraw.ts` — helper timeline gambar (dipakai dua tempat)
- `components/sections/LineArt.tsx` (SVG dark section, 17 path)
- `components/ui/SignatureLine.tsx` (coretan hero)
- `components/sections/StatementDark.tsx` (mount LineArt + salurkan progress)
- `components/sections/Hero.tsx` (tambah signature-line)
- `components/ui/StackSection.tsx` (satu kata: `relative` — lihat §6.4)

`public/*.svg` tidak dipakai: aset digambar sebagai path inline di komponen
(alasan sama seperti BrushDivider, M2 §6.3 — bebas lisensi, `currentColor`,
dan geometri hidup satu file dengan timing animasinya).

---

## 5. Risiko & Catatan

- **`getTotalLength()` sebelum layout ready** → nilai salah. Panggil di `useGSAP`/`useEffect` setelah mount, bukan saat SSR.
- **Path dengan transform/scale** bikin panjang tidak akurat — flatten transform saat export.
- **Terlalu banyak path dianimasi** → jank. Referensi 17 path; kalau v2 lebih sedikit, lebih ringan. Batasi jumlah path aktif.
- **Non-scaling stroke:** pertimbangkan `vector-effect="non-scaling-stroke"` supaya tebal garis konsisten saat SVG di-scale responsif.
- **Reduced-motion wajib** — garis yang stuck setengah gambar saat animasi dimatikan = tampak rusak. Pastikan state final = fully drawn.

---

## 6. Catatan Hasil Implementasi & QA (untuk M4+)

### 6.1 Progress disuntik dari luar, komponen tidak bikin ScrollTrigger sendiri

`LineArt` cuma mengekspos `ref.setProgress(0→1)`. Yang punya ScrollTrigger tetap
`StackSection` lewat `onHoldProgress` — karena panelnya `position: sticky` dan
elemen sticky tidak boleh jadi `trigger` (rect-nya bergeser saat nempel, M2 §6.2).
Salurannya **ref imperatif, bukan React state**: nilainya berubah tiap frame scroll,
`setState` per frame = re-render section per frame.

Konsekuensi yang enak: timeline GSAP `paused` + `.progress(p)` otomatis reversible
dan idempotent — nilai dash cuma fungsi dari `p`, tidak menyimpan arah. Ini yang
membuat AC "reversible" lolos tanpa kode tambahan.

### 6.2 `strokeWidth` lewat CSS dibulatkan GSAP ke integer

Animasi 1.1→2.6 px terbaca meloncat **1px→2px→3px**: CSSPlugin membulatkan nilai
px. Ilusi "tekanan tangan" hilang total. Solusinya tulis lewat `attr`
(`{ attr: { 'stroke-width': v } }`) — AttrPlugin tidak membulatkan. Kalau nanti ada
properti SVG lain yang butuh pecahan halus (`r`, `stroke-dashoffset` kecil), pakai
jalur yang sama.

### 6.3 Dua mode gambar; `dash` = 4-nilai yang benar-benar diinterpolasi

- `solid`: `dasharray = "L L"` (BUKAN `L` tunggal) + offset L→0. Dua nilai bikin
  segmen `on` duduk di [-L, 0] saat tersembunyi, jadi tidak ada sisa pola yang
  membungkus balik ke ujung path. Offset awal `L + 1` menghindari titik round-cap
  yang nyembul di posisi 0.
- `dash`: 4 nilai `on1 off1 on2 off2` yang semuanya bergerak terhadap progress
  (PRD §6 minta "empat-nilai dinamis, bukan sekadar dashoffset tunggal"). Di p=0
  semua `on` = 0 → path tak terlihat, jadi tidak perlu menambah tween opacity.
  **Syarat: `stroke-linecap` harus `butt`** — dengan `round`, dash sepanjang 0
  tetap dirender sebagai titik dan path "tersembunyi" jadi kelihatan seperti
  deretan noda.

### 6.4 Elemen absolute di dalam StackSection butuh containing block eksplisit

Bug yang ketangkap saat QA reduced-motion: line-art hilang dari layar. Penyebabnya
containing block-nya cuma "kebetulan" benar — GSAP menaruh `transform` di div konten
saat crossfade aktif, dan transform bikin elemen itu jadi containing block. Di
reduced-motion tween-nya tidak ada → containing block meleset ke panel sticky yang
tingginya `(100 + hold)vh`, dan ornamen `bottom-[5%]` jatuh jauh di bawah lipatan.

Perbaikan: div konten `StackSection` sekarang `relative` permanen. **Aturan untuk
milestone berikutnya:** jangan pernah mengandalkan transform GSAP sebagai penentu
posisi; kalau menaruh sesuatu `absolute` di dalam section, pastikan ada ancestor
`relative` yang eksplisit.

Terkait: elemen absolute selalu dicat **di atas** sibling non-positioned, jadi h2/p
di section itu ikut diberi `relative` supaya teks tetap di depan garis.

### 6.5 Menguji reduced-motion tanpa bisa mengubah setting OS

Browser QA di sini tidak punya cara mengubah `prefers-reduced-motion`. Yang dipakai:
route QA sementara yang **memalsukan `window.matchMedia`** sebelum komponen mount —
mengembalikan objek MediaQueryList palsu (`matches`, `addListener`,
`addEventListener`, dst) untuk query reduce/no-preference. Cukup untuk menguji cabang
`gsap.matchMedia`, **tapi tidak memicu media query CSS** — jadi aturan CSS
`.stack-panel { height: auto }` tetap tidak aktif dan tinggi panel yang terbaca saat
tes bukan tinggi yang sebenarnya. Ingat perbedaan itu saat membaca hasilnya.

### 6.6 Screenshot in-context: paksa state lewat `useEffect`, bukan lewat scroll

Perluasan M2 §6.6 #2. Karena scroll lewat JS tidak memicu repaint, section dark tidak
bisa difoto di posisi scroll-nya. Yang berhasil: route QA sementara yang menaruh
`<StatementDark />` sebagai section **pertama** (terlihat di scroll 0) lalu memaksa
progress di `useEffect` dengan
`ScrollTrigger.getAll().forEach(st => st.vars.onUpdate?.({ progress: p }))` —
memanggil callback trigger-nya langsung. Frame yang difoto tepat setelah navigasi
sudah membawa state itu. `?p=` dan `?reduce=` bikin satu route cukup untuk semua
kombinasi. Route-nya dihapus setelah verifikasi.

### 6.7 Layout: headline 60–72px dan garis tidak muat berdampingan di bawah 1280px

Diukur, bukan dikira: di 1280px+ headline dibatasi `xl:max-w-3xl` dan garis dapat
kolomnya sendiri (jarak bersih 51px di 1280, 154px di 1440). Di bawah itu keduanya
tidak mungkin berdampingan, jadi garis mundur jadi tekstur latar `opacity-25`.
Teks tidak kehilangan kontras karena dicat penuh di atasnya (§6.4). Menaikkan
opacity di breakpoint kecil = menabrak headline; jangan lakukan tanpa mengubah
layout kolomnya dulu.

### 6.8 Utang yang diteruskan ke M7

Sama seperti M2: **belum diuji di iOS Safari asli**. Tambahan khusus M3 yang perlu
dicek di sana — `vector-effect="non-scaling-stroke"` dan animasi `stroke-dasharray`
per frame termasuk properti yang tidak selalu di-GPU-kan; kalau ada jank di device
mid-range, kandidat pertama yang dipangkas adalah jumlah path yang dianimasi
bersamaan (sekarang 17).
