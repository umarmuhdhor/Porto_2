'use client';

/**
 * NavPill (M6 §3.2) — pill mengambang di bottom-center. Klik → expand jadi menu
 * HOME / WORKS / CONTACT. Framer Motion khusus buka/tutup (state animation),
 * BUKAN scroll (PRD §3). Text-roll per item pakai CSS transition murni — lebih
 * ringan untuk hover sederhana (plan §3.2) dan tetap jalan tanpa JS.
 *
 * A11y (AC M6 — tiap hover punya ekuivalen keyboard):
 * - tombol pill: aria-expanded + aria-controls, toggle via klik/Enter/Space.
 * - Escape menutup; fokus balik ke tombol.
 * - text-roll dipicu group-hover DAN group-focus-within → keyboard user lihat
 *   efek yang sama saat men-Tab ke item.
 * - menu di-`inert`/`aria-hidden` saat tertutup supaya link tak bisa di-Tab.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface NavItem {
  label: string;
  href: string;
}

const ITEMS: NavItem[] = [
  { label: 'HOME', href: '/' },
  { label: 'WORKS', href: '/#projects' },
  { label: 'CONTACT', href: 'mailto:muhdhorcs@gmail.com' },
];

/** Satu label dengan efek text-roll: baris asli slide naik, duplikat masuk dari bawah. */
function RollingLabel({ label }: { label: string }) {
  return (
    <span className="relative block overflow-hidden leading-tight">
      <span className="block transition-transform duration-300 ease-out group-hover/item:-translate-y-full group-focus-visible/item:-translate-y-full">
        {label}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full transition-transform duration-300 ease-out group-hover/item:translate-y-0 group-focus-visible/item:translate-y-0"
      >
        {label}
      </span>
    </span>
  );
}

export function NavPill() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  // Escape menutup menu + kembalikan fokus ke tombol pemicu.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <nav
      aria-label="Primary"
      className="chrome-floating fixed inset-x-0 bottom-6 flex flex-col items-center gap-3"
      style={{ zIndex: 'var(--z-nav)' }}
    >
      <AnimatePresence>
        {open && (
          <motion.ul
            id="nav-menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28, mass: 0.9 }}
            className="font-system flex flex-col items-stretch gap-1 rounded-[var(--radius-card)] border border-[var(--line-rule)] bg-white/85 p-2 text-center text-sm font-medium tracking-[0.2em] uppercase shadow-xl backdrop-blur"
          >
            {ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="group/item focus-visible:outline-ink block rounded-[calc(var(--radius-card)-8px)] px-8 py-3 underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:decoration-current focus-visible:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <RollingLabel label={item.label} />
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="nav-menu"
        className="bg-accent font-system text-ink focus-visible:outline-ink inline-flex items-center gap-3 rounded-[var(--radius-pill)] px-7 py-3 text-base font-medium tracking-[0.02em] shadow-[0_10px_30px_-12px_rgba(10,10,10,0.45)] transition-transform duration-[var(--dur-base)] ease-[var(--ease-smooth)] hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <span>{open ? 'Close' : 'Menu'}</span>
        <span aria-hidden className="text-base leading-none">
          {open ? '✕' : '≡'}
        </span>
      </button>
    </nav>
  );
}
