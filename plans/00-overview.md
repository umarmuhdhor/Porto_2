# Implementation Plan — Overview & Index

| Field | Value |
|---|---|
| Sumber | [PRD-portfolio-v2-cinematic-scroll.md](../docs/PRD-portfolio-v2-cinematic-scroll.md) + [DESIGN-portfolio-v2-cinematic-scroll.md](../docs/DESIGN-portfolio-v2-cinematic-scroll.md) |
| Status | Ready to build |
| Owner | Umar |

Plan ini memecah PRD menjadi 7 milestone berurutan (M1→M7). Tiap milestone punya file sendiri dengan tujuan, prasyarat, langkah teknis, struktur file, acceptance criteria, dan risiko. Kerjakan berurutan — tiap milestone mengasumsikan milestone sebelumnya sudah selesai.

---

## Index Milestone

| # | File | Milestone | Fokus |
|---|---|---|---|
| M1 | [01-m1-foundation.md](./01-m1-foundation.md) | Foundation | Next.js + Tailwind + Lenis + GSAP wiring, design tokens, tipografi, layout dasar |
| M2 | [02-m2-sticky-stacking.md](./02-m2-sticky-stacking.md) | Sticky Stacking | Section pin/stack GSAP, brush-stroke transitions, 6-section homepage skeleton |
| M3 | [03-m3-svg-line-draw.md](./03-m3-svg-line-draw.md) | SVG Line-Draw | Self-drawing stroke-dasharray animation, hero signature-line |
| M4 | [04-m4-3d-webgl.md](./04-m4-3d-webgl.md) | 3D / WebGL | React Three Fiber object, scroll-linked transform, WebGL fallback |
| M5 | [05-m5-case-study.md](./05-m5-case-study.md) | Case Study | Template `/works/[slug]`, MDX/JSON data, bento gallery, per-page SEO+OG |
| M6 | [06-m6-microinteractions.md](./06-m6-microinteractions.md) | Micro-interactions | Nav pill text-roll, cursor-follow project preview, hover states, split-text |
| M7 | [07-m7-perf-a11y-seo.md](./07-m7-perf-a11y-seo.md) | Perf / A11y / SEO / Ship | reduced-motion, Lighthouse targets, analytics proxy, Vercel deploy |

---

## Arsitektur Target (ringkas)

```
Porto_2/
├── app/
│   ├── layout.tsx              # root: <html class="lenis"> , fonts, providers
│   ├── page.tsx                # homepage — 6 section stacking
│   ├── globals.css             # tailwind + design tokens (CSS vars)
│   ├── works/
│   │   └── [slug]/
│   │       ├── page.tsx        # case study template (SSG via generateStaticParams)
│   │       └── opengraph-image.tsx  # OG image unik per project
│   └── api/ (kalau perlu)
├── components/
│   ├── providers/
│   │   └── SmoothScrollProvider.tsx   # Lenis + ScrollTrigger sync (M1)
│   ├── layout/
│   │   ├── FrameLines.tsx      # garis vertikal kiri/kanan fixed (M1)
│   │   ├── HonorsBadge.tsx     # badge fixed kanan (M1)
│   │   └── NavPill.tsx         # floating menu pill + text-roll (M6)
│   ├── sections/
│   │   ├── Hero.tsx            # M1 layout, M3 signature-line, M6 split-text
│   │   ├── StatementDark.tsx   # M2 sticky, M3 line-draw
│   │   ├── ValueSection.tsx    # M2 sticky
│   │   ├── ServiceList.tsx     # M2 scroll-active item
│   │   ├── ProjectIndex.tsx    # M6 cursor-follow preview
│   │   ├── Outro.tsx
│   │   └── Footer.tsx
│   ├── three/
│   │   ├── Scene.tsx           # 1 R3F canvas (M4)
│   │   └── FloatingObject.tsx  # .glb loader + scroll transform (M4)
│   └── ui/
│       ├── BrushDivider.tsx    # M2
│       ├── ServicePill.tsx     # M5
│       └── SplitText.tsx       # M6 reusable
├── content/
│   └── works/                  # data project (MDX atau JSON) (M5)
├── lib/
│   ├── gsap.ts                 # register plugins sekali (M1)
│   ├── motion.ts               # matchMedia reduced-motion helper (M1/M7)
│   └── works.ts                # loader data project (M5)
├── public/
│   ├── fonts/                  # self-hosted fonts (M1)
│   ├── works/                  # aset per project {slug}_*.webp/svg (M5)
│   └── brush/                  # brush-stroke .webp (M2)
├── docs/
└── plans/
```

Catatan: struktur di atas adalah target akhir. Tiap milestone hanya menambah/mengisi bagian yang relevan — jangan bikin semua file kosong di M1.

---

## Konvensi Lintas-Milestone

- **Motion split (dari PRD §3):** GSAP+ScrollTrigger = semua scroll-linked; Framer Motion = mount/hover/state; Lenis = satu-satunya scroll engine.
- **Design tokens:** semua warna/font/spacing lewat CSS variable di `globals.css` (didefinisikan M1), jangan hardcode hex di komponen.
- **Reduced-motion:** tiap animasi baru wajib punya cabang `gsap.matchMedia()` / cek `prefers-reduced-motion` sejak ditulis, bukan ditambal di M7.
- **Progressive enhancement:** halaman harus tetap terbaca & bisa discroll kalau JS/WebGL gagal load.
- **TypeScript strict**, ESLint + Prettier aktif sejak M1.

---

## Definition of Done (global, dicek di M7)

- Lighthouse Perf ≥85 desktop / ≥75 mobile, A11y ≥90.
- 60fps scroll di device mid-range.
- Semua section & case study reachable ≤2 klik dari cold load.
- `prefers-reduced-motion` mematikan semua animasi berat, situs tetap fungsional.
- OG image unik per halaman `/works/[slug]`.
- Maks 2-3 WebGL context aktif bersamaan.
