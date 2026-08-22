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

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

const GREETING = 'Hey there!';
const CTA = 'Curious? Have a look!';

type Stage = 'wait' | 'show' | 'gone';

const POINTER_FINE = '(pointer: fine)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeToPointer(onChange: () => void) {
  const queries = [window.matchMedia(POINTER_FINE), window.matchMedia(REDUCED_MOTION)];
  queries.forEach((query) => query.addEventListener('change', onChange));
  return () => queries.forEach((query) => query.removeEventListener('change', onChange));
}

function readCanFollow() {
  return window.matchMedia(POINTER_FINE).matches && !window.matchMedia(REDUCED_MOTION).matches;
}

/**
 * Apakah perangkat ini boleh dapat bubble yang mengikuti kursor: ada mouse, dan
 * user tidak meminta gerak dikurangi.
 *
 * KENAPA useSyncExternalStore, bukan useState yang diisi di dalam useEffect:
 * menyetel state di body effect memicu render berantai (render → effect →
 * render lagi) tepat di frame pertama intro, dan `react-hooks/set-state-in-
 * effect` menolaknya. Media query adalah state di LUAR React, jadi ini memang
 * alatnya. Snapshot server `false` → SSR & render hidrasi pertama sama-sama
 * merender fallback statis (tidak ada mismatch), lalu nilai sebenarnya masuk.
 *
 * Efek samping yang disengaja: nilainya ikut berubah kalau user mengubah
 * preferensi gerak di tengah kunjungan — bubble berhenti mengikuti kursor saat
 * itu juga, bukan menunggu reload.
 */
function useCanFollowCursor() {
  return useSyncExternalStore(subscribeToPointer, readCanFollow, () => false);
}

export function ChatBubble({ active = false, play = false }: { active?: boolean; play?: boolean }) {
  const [display, setDisplay] = useState(CTA);
  const [caret, setCaret] = useState(false);
  const [stage, setStage] = useState<Stage>('wait');
  const canFollowCursor = useCanFollowCursor();
  /** Bubble hanya menempel ke kursor saat intro JS berjalan DAN perangkatnya cocok. */
  const follow = active && canFollowCursor;
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  /** Dibaca loop rAF untuk berhenti sendiri; ref (bukan dep effect) supaya
      pergantian stage tidak me-restart loop & melempar bubble balik ke tengah. */
  const gone = useRef(false);
  useEffect(() => {
    gone.current = stage === 'gone';
  }, [stage]);

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
  //
  // Dimatikan begitu stage 'gone': bubble-nya sudah tak terlihat, tapi loop rAF
  // + listener pointermove-nya akan terus hidup sepanjang sisa kunjungan dan
  // menulis transform ke elemen transparan tiap frame — persis di saat user
  // mulai men-scroll halaman.
  useEffect(() => {
    if (!follow) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight * 0.62 };
    const target = { ...pos };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    const loop = () => {
      // Bubble sudah selesai & tak terlihat: loop dan listener-nya dilepas.
      // Tanpa ini keduanya hidup sepanjang sisa kunjungan — satu rAF + satu
      // handler pointermove yang menulis transform tiap frame ke elemen
      // transparan, tepat selama user men-scroll halaman.
      if (gone.current) {
        window.removeEventListener('pointermove', onMove);
        raf = 0;
        return;
      }
      pos.x += (target.x - pos.x) * 0.16;
      pos.y += (target.y - pos.y) * 0.16;
      const el = ref.current;
      if (el) el.style.transform = `translate3d(${pos.x + 18}px, ${pos.y + 20}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [follow]);

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
