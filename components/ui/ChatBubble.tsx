'use client';

/**
 * Bubble chat intro hero — mirror referensi (nithinmwarrier.com):
 * MENGIKUTI CURSOR (trailing) sambil mengetik "Hey there!" → jeda → ganti ketik
 * "Curious? Have a look!" lalu memudar (rest bersih, hanya Menu pill tersisa).
 *
 * Terikat koreografi signature-first Hero lewat dua prop:
 * - `active`: intro JS sedang berjalan (fase draw/reveal). Saat FALSE
 *   (SSR/no-JS/reduced-motion) bubble tampil CTA statis — robust, tak pernah kosong.
 * - `play`: fase 'reveal' tercapai (signature selesai menggores & naik). Saat TRUE
 *   sekuens ketik mulai — jadi bubble baru muncul setelah signature, bukan barengan.
 *
 * Pointer:
 * - fine (mouse) → bubble `fixed`, trailing cursor pakai lerp (rAF).
 * - coarse/touch → fallback statis fixed di bawah-tengah (di atas Menu pill).
 *
 * A11y: teks animasi `aria-hidden`; label CTA statis `sr-only`.
 */

import { useEffect, useRef, useState } from 'react';

const GREETING = 'Hey there!';
const CTA = 'Curious? Have a look!';

type Stage = 'wait' | 'show' | 'gone';

export function ChatBubble({ active = false, play = false }: { active?: boolean; play?: boolean }) {
  const [display, setDisplay] = useState(CTA);
  const [caret, setCaret] = useState(false);
  const [stage, setStage] = useState<Stage>('wait');
  const [follow, setFollow] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  // Sekuens ketik: dijalankan sekali saat `play` (fase reveal) pertama true.
  useEffect(() => {
    if (!play || started.current) return;
    started.current = true;

    const timers: number[] = [];
    let alive = true;
    setStage('show');
    setCaret(true);

    const type = (full: string, at: number, done?: () => void) => {
      timers.push(
        window.setTimeout(() => {
          if (!alive) return;
          setDisplay('');
          let i = 0;
          const tick = () => {
            if (!alive) return;
            i += 1;
            setDisplay(full.slice(0, i));
            if (i < full.length) timers.push(window.setTimeout(tick, 55));
            else done?.();
          };
          tick();
        }, at),
      );
    };

    type(GREETING, 250, () => {
      timers.push(
        window.setTimeout(
          () =>
            type(CTA, 0, () => {
              setCaret(false);
              timers.push(window.setTimeout(() => setStage('gone'), 1900));
            }),
          1100,
        ),
      );
    });

    return () => {
      alive = false;
      timers.forEach((t) => clearTimeout(t));
    };
  }, [play]);

  // Follow cursor (mouse saja, intro aktif) — lerp halus supaya menyusul.
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    setFollow(true);
    const pos = { x: window.innerWidth / 2, y: window.innerHeight * 0.62 };
    const target = { ...pos };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    const loop = () => {
      pos.x += (target.x - pos.x) * 0.16;
      pos.y += (target.y - pos.y) * 0.16;
      const el = ref.current;
      if (el) el.style.transform = `translate3d(${pos.x + 18}px, ${pos.y + 20}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  // Visibilitas: !active → CTA statis (reduced-motion/no-JS). active → mengikuti stage.
  const visible = !active || stage === 'show';
  const opacity = visible ? 'opacity-100' : 'pointer-events-none opacity-0';
  const positioning = follow
    ? 'fixed left-0 top-0 z-[48]'
    : 'fixed bottom-28 left-1/2 z-[48] -translate-x-1/2';

  const base =
    'bg-note text-note-ink inline-flex min-h-[2.75rem] min-w-[7rem] items-center justify-center rounded-[var(--radius-pill)] px-5 py-2.5 text-sm font-medium shadow-md transition-opacity duration-700 will-change-transform md:text-base';

  return (
    <span
      ref={ref}
      aria-hidden={!visible}
      className={`${base} ${positioning} ${opacity}`}
      style={follow ? { transform: 'translate3d(50vw, 62vh, 0)' } : undefined}
    >
      <span className="sr-only">{CTA}</span>
      <span aria-hidden className="whitespace-nowrap">
        {display}
        {caret && <span className="ml-0.5 animate-pulse font-normal opacity-80">|</span>}
      </span>
    </span>
  );
}
