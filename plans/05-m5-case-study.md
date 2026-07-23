# M5 — Case Study Template & Project Pages

> Template konsisten `/works/[slug]` untuk semua project: breadcrumb, header, tag pill, Challenge/Role, bento gallery, nav bawah. Data lokal (MDX/JSON), SSG, SEO + OG image unik per halaman.

Referensi: PRD §8; DESIGN §4.6, §7; DESIGN §10 (pitfall OG generic — jangan diulang).

---

## 1. Tujuan & Acceptance Criteria

- [x] Route dinamis `/works/[slug]` render dari data lokal, SSG via `generateStaticParams`.
- [x] Template lengkap: breadcrumb `Projects / [Nama]`, logo+judul, kategori+tahun, ringkasan, service pills, kolom Challenge & Role, bento gallery, nav "Go back to projects" + "Scroll to top".
- [x] 3-6 project real terisi konten & aset. — 3 project; copy & aset masih placeholder bertanda `TODO(content)`, strukturnya final.
- [x] Tiap halaman punya `title` + `description` unik.
- [x] **OG image unik per project** (bukan generic — pitfall referensi DESIGN §10). — 3 PNG dengan hash berbeda, digenerate saat build.
- [x] Case study = scroll linear + reveal ringan per gambar (BUKAN sticky-stacking — DESIGN §4.6).
- [ ] Halaman ringan (target < ~2500px tinggi seperti referensi, tanpa canvas berat). — TIDAK berat (nol canvas/WebGL, nol dependency animasi tambahan), tapi tinggi terukur di viewport 1280: halo-banking ~3020px, kopi-kultur ~3020px, terra-atlas ~3360px. Lebar kolom konten sudah dikunci 1200px supaya tinggi tidak ikut membesar di monitor lebar. Menembus 2500px hanya bisa dengan mengecilkan/mengurangi slot galeri — keputusan konten, bukan teknis.

---

## 2. Prasyarat

- M1 (tokens, layout persisten) selesai. Tidak butuh M2-M4 (case study tidak pakai stacking/3D).
- Aset per project siap di `public/works/{slug}/` dengan konvensi penamaan (DESIGN §4.6):
  `{slug}_logo_color.svg`, `{slug}_banner.webp`, `{slug}_screens.webp`, `{slug}_illustration.webp`, `{slug}_graphics.webp`, dst.

---

## 3. Langkah

### 3.1 Struktur data project
Pilih salah satu (rekomendasi: JSON/TS untuk metadata + MDX kalau butuh body kaya):
- `content/works/{slug}.ts` atau `.mdx` berisi: `title, slug, category, year, summary, services[], challenge, role, gallery[]`.
- `lib/works.ts`: loader — `getAllWorks()`, `getWorkBySlug(slug)`, `getAllSlugs()`.

Contoh shape:
```ts
export interface Work {
  slug: string;
  title: string;
  category: string;        // "PRODUCT DESIGN | VISUAL BRANDING"
  year: string;
  summary: string;
  services: string[];      // ["Product design", "Visual branding", ...]
  challenge: string;
  role: string;
  gallery: GalleryItem[];  // { src, alt, span: 'full' | 'half' }
}
```

### 3.2 Route + SSG
- `app/works/[slug]/page.tsx`:
  - `export async function generateStaticParams()` → semua slug.
  - `export async function generateMetadata({ params })` → title/description unik dari data.
  - Body render template.
- `export const dynamicParams = false` supaya slug tak dikenal → 404.

### 3.3 Template komponen
Susun sesuai PRD §8:
1. Breadcrumb (link balik ke `/#works` atau `/works`).
2. Header: logo SVG + judul, kategori + tahun (kanan-atas, `text-secondary`).
3. Paragraf ringkasan (bold pada frasa kunci — lihat pola referensi).
4. `components/ui/ServicePill.tsx` — deret pill radius-full.
5. Grid 2 kolom: Challenge (kiri) + Role (kanan).
6. `components/sections/BentoGallery.tsx` — banner full-width + grid asimetris kartu `radius-card` (DESIGN §4.6). Campur full-bleed & 2-kolom, gap konsisten (bukan gap 0).
7. Nav bawah: "Go back to projects" + "Scroll to top" (scroll-to-top pakai Lenis `lenis.scrollTo(0)`).

### 3.4 Reveal animation ringan
- Tiap gambar galeri: fade/translate-up saat masuk viewport. Gunakan Framer Motion `whileInView` (bukan ScrollTrigger pin — ini bukan stacking). Ringan, one-shot.
- Reduced-motion: langsung tampil tanpa reveal.

### 3.5 OG image unik per halaman (WAJIB)
- `app/works/[slug]/opengraph-image.tsx`: pakai Next.js `ImageResponse` untuk generate OG dinamis dari data project (judul + kategori + warna brand), ATAU assign file `{slug}_og.png` per project.
- Set `twitter:card: summary_large_image`.
- Verifikasi: tiap slug menghasilkan `og:image` berbeda (jangan ulangi kesalahan referensi — DESIGN §10 #1).

### 3.6 Link dari homepage
- Section Project Index (M6 handle interaksinya) → tiap baris link ke `/works/[slug]`.

---

## 4. File yang Dibuat/Disentuh

- `app/works/[slug]/page.tsx`, `app/works/[slug]/opengraph-image.tsx`
- `components/sections/BentoGallery.tsx`
- `components/ui/ServicePill.tsx`
- `content/works/*` (data project)
- `lib/works.ts`
- `public/works/{slug}/*`

---

## 5. Risiko & Catatan

- **OG generic** = kesalahan referensi yang paling gampang tak sengaja diulang. Test share link ke WhatsApp/Twitter sebelum ship.
- **Konsistensi aspect ratio** gambar galeri: tetapkan rasio per slot (`span: full/half`) supaya grid rapi lintas project.
- **Data terpisah dari layout** = kunci maintainability (PRD G3: project baru < 1 hari). Jangan hardcode konten di JSX.
- **Jangan bawa stacking/3D ke sini** — case study sengaja ringan & cepat (DESIGN §4.6).
- **Breadcrumb & back-nav** harus reachable keyboard (PRD §11).
