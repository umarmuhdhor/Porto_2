'use client';

/**
 * ProjectIndex (M6 §3.3–3.4) — daftar baris project. Di device ber-hover
 * (desktop), hover baris memunculkan gambar preview yang mengikuti kursor via
 * spring. Di device tanpa hover (touch), preview cursor-follow diganti thumbnail
 * statis kecil per baris (DESIGN §7 — fallback fungsional, bukan hilang).
 *
 * Performa (M6 §5): posisi preview digerakkan lewat `transform` (GPU) yang
 * di-drive useSpring, BUKAN set left/top per mousemove (reflow). Elemen preview
 * `pointer-events-none` supaya tak mengganggu hit-testing baris.
 *
 * A11y: tiap baris adalah <Link> penuh (mudah ditekan di layar sentuh) dengan
 * focus-visible ring. Preview murni dekoratif (`aria-hidden`) — informasi baris
 * sudah lengkap dari teks.
 */

import { useRef, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

export interface ProjectRow {
  slug: string;
  title: string;
  category: string;
  year: string;
  preview: string;
  previewAlt: string;
}

/** Reaktif: apakah pointer utama mendukung hover (desktop) vs touch. */
function useHasHover(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(hover: hover)');
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia('(hover: hover)').matches,
    () => false, // SSR: anggap touch → render fallback thumbnail dulu (aman).
  );
}

export function ProjectIndex({ projects }: { projects: ProjectRow[] }) {
  const hasHover = useHasHover();
  const reduce = useReducedMotion();
  const cursorFollow = hasHover && !reduce;

  return (
    <section
      id="projects"
      className="page-section bg-cream text-ink flex min-h-screen flex-col justify-center"
      style={{ paddingInline: 'var(--frame-inset)' }}
    >
      <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
        Curated Projects
      </h2>
      <p className="font-system text-muted mt-4 max-w-md">
        Selection of mobile and iOS development work, built end to end.
      </p>

      {cursorFollow ? <CursorFollowList projects={projects} /> : <StaticList projects={projects} />}
    </section>
  );
}

/* ---------- Desktop: cursor-follow preview ---------- */

function CursorFollowList({ projects }: { projects: ProjectRow[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSrc, setActiveSrc] = useState<string | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 30, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 300, damping: 30, mass: 0.5 });

  function handleMove(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  }

  return (
    <div
      ref={containerRef}
      className="relative mt-10"
      onMouseMove={handleMove}
      onMouseLeave={() => setActiveSrc(null)}
    >
      <ul className="font-system divide-y divide-black/10 border-y border-black/10">
        {projects.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/works/${p.slug}`}
              onMouseEnter={() => setActiveSrc(p.preview)}
              onFocus={() => setActiveSrc(p.preview)}
              className="group hover:text-accent focus-visible:text-accent focus-visible:outline-accent grid grid-cols-[1fr_auto] items-baseline gap-6 py-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span className="flex items-baseline gap-4">
                <span
                  aria-hidden
                  className="text-muted group-hover:text-accent text-sm transition-colors"
                >
                  +
                </span>
                <span className="text-lg md:text-2xl">{p.title}</span>
              </span>
              <span className="text-muted flex shrink-0 items-baseline gap-6 text-sm tracking-wide uppercase">
                <span className="hidden sm:inline">{p.category}</span>
                <span>{p.year}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Preview mengambang — pointer-events-none, transform-driven (GPU). */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-10 hidden md:block"
        style={{
          x: sx,
          y: sy,
          translateX: '-50%',
          translateY: '-50%',
          opacity: activeSrc ? 1 : 0,
        }}
      >
        {activeSrc && (
          <div className="h-48 w-64 overflow-hidden rounded-[var(--radius-card)] shadow-2xl ring-1 ring-black/10">
            <Image
              src={activeSrc}
              alt=""
              width={256}
              height={192}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ---------- Touch / reduced-motion: static thumbnails ---------- */

function StaticList({ projects }: { projects: ProjectRow[] }) {
  return (
    <ul className="font-system mt-10 divide-y divide-black/10 border-y border-black/10">
      {projects.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/works/${p.slug}`}
            className="hover:text-accent focus-visible:text-accent focus-visible:outline-accent flex items-center gap-4 py-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <span className="h-14 w-20 shrink-0 overflow-hidden rounded-[var(--radius-badge)] ring-1 ring-black/10">
              <Image
                src={p.preview}
                alt={p.previewAlt}
                width={80}
                height={56}
                className="h-full w-full object-cover"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-lg">{p.title}</span>
              <span className="text-muted block text-xs tracking-wide uppercase">{p.category}</span>
            </span>
            <span className="text-muted shrink-0 text-sm tracking-wide uppercase">{p.year}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
