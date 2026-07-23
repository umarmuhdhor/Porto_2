# Porto v2 — Cinematic Scroll Portfolio

Portfolio pribadi kelas Awwwards. Next.js (App Router) + Tailwind + Lenis + GSAP + Framer Motion + React Three Fiber.

## Dokumen

- PRD: [docs/PRD-portfolio-v2-cinematic-scroll.md](docs/PRD-portfolio-v2-cinematic-scroll.md)
- Design spec: [docs/DESIGN-portfolio-v2-cinematic-scroll.md](docs/DESIGN-portfolio-v2-cinematic-scroll.md)
- Implementation plan (per-milestone): [plans/00-overview.md](plans/00-overview.md)

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
pnpm format       # prettier + tailwind class sort
```

## Status

- **M0 (scaffold):** ✅ Next.js + TS strict + Tailwind v4 + Prettier, folder skeleton.
- **M1 (foundation):** ✅ QA lolos — design tokens, Geist fonts, Lenis↔GSAP ScrollTrigger sync terverifikasi, frame lines + honors badge, homepage skeleton 6 section, reduced-motion helper.
- Berikutnya: **M2** (sticky-stacking + brush transitions) → [plans/02-m2-sticky-stacking.md](plans/02-m2-sticky-stacking.md).

### Debug handle (dev-only)

`window.__lenis`, `window.__gsap`, `window.__ScrollTrigger` tersedia saat `pnpm dev` untuk QA scroll/animasi.
Pakai `__lenis.scrollTo(y, { immediate: true })` — jangan `window.scrollTo()` (berkelahi dengan virtual scroll Lenis).
