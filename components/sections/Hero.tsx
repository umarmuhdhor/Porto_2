'use client';

/**
 * Hero (M2 §3.2) — dirancang mirror hero referensi (nithinmwarrier.com):
 * grid blueprint halus, nama raksasa di tengah, label peran & lokasi mengapit di
 * garis frame (mid-height), signature terakota di atas nama, dan bubble chat
 * intro yang mengetik greeting → CTA.
 *
 * Latar hero hidup di layer `fixed inset-0` tersendiri supaya tetap diam saat
 * section berikutnya naik menutupinya (PRD §5.2). Konten hero ada di layer
 * `contentRef` yang ikut scroll & memudar.
 *
 * Section setinggi 120vh (PRD §5.2) — jeda sebelum StatementDark mulai menutup.
 */

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { NO_PREFERENCE } from '@/lib/motion';
import { SignatureLine } from '@/components/ui/SignatureLine';
import { HeroName } from '@/components/ui/HeroName';
import { ChatBubble } from '@/components/ui/ChatBubble';

const ROLE = 'Visual Designer';
const LOCATION = 'Based in — Indonesia';

/** Layout-effect isomorfik: pre-paint di klien (cegah flash intro), no-op di SSR. */
const useIsoLayout = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Durasi fase 'draw' (signature menggores sendiri di tengah) sebelum 'reveal'.
    Diselaraskan dengan timeScale SignatureLine (~2s gores + buffer). */
const DRAW_MS = 2300;

type Phase = 'idle' | 'draw' | 'reveal';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Koreografi intro signature-first. Default 'idle' = state final terlihat
  // (SSR/no-JS/reduced-motion aman). JS no-preference: 'draw' (pre-paint, tanpa
  // flash) → signature di tengah menggores → 'reveal' → signature naik, sisa muncul.
  const [phase, setPhase] = useState<Phase>('idle');

  useIsoLayout(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setPhase('draw');
    const t = window.setTimeout(() => setPhase('reveal'), DRAW_MS);
    return () => clearTimeout(t);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        gsap.to(contentRef.current, {
          opacity: 0,
          y: -120,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="page-section relative h-[120vh]">
      {/* Layer latar fixed — dipasang di dalam Hero (child pertama <main>) supaya
          urutan cat menaruhnya di belakang semua section berikutnya. */}
      <div
        aria-hidden
        className="fixed inset-0"
        style={{ zIndex: 'var(--z-hero-bg)' } as CSSProperties}
      >
        <div className="bg-cream absolute inset-0" />
        {/* Grid blueprint halus (mirror referensi). Dua repeating-gradient tipis;
            di-mask fade lembut hanya di tepi jauh supaya grid terasa merata. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(10,10,10,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,10,10,0.05) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            maskImage: 'radial-gradient(145% 130% at 50% 42%, black 72%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(145% 130% at 50% 42%, black 72%, transparent 100%)',
          }}
        />
      </div>

      {/* Layer konten — pinned ke atas section (tinggi 1 viewport) supaya nama
          ter-center di viewport saat load (referensi: center ~46%), 20vh sisa
          section jadi runway. Ikut scroll & memudar (GSAP scrub di atas).
          `data-intro` menyetir koreografi (lihat globals.css). */}
      <div
        ref={contentRef}
        data-intro={phase === 'idle' ? undefined : phase}
        className="absolute inset-x-0 top-0 h-screen"
      >
        {/* Signature terakota. Fase 'draw': dipindah ke tengah & membesar sambil
            menggores; fase 'reveal': naik ke posisi atas ini (transisi di CSS). */}
        <div className="hero-signature absolute inset-x-0 top-[7vh] flex justify-center">
          <SignatureLine className="h-auto w-[clamp(140px,16vw,200px)]" />
        </div>

        {/* Label mengapit — inline di garis frame, setinggi tengah nama (desktop).
            [garis][label] kiri, [label][garis] kanan. Disembunyikan di mobile. */}
        <div
          className="hero-rest absolute top-1/2 left-0 hidden -translate-y-1/2 items-center gap-4 md:flex"
          style={{ paddingLeft: 'var(--frame-inset)' }}
        >
          <span aria-hidden className="h-[2px] w-[100px] bg-black/30" />
          <p className="font-system text-ink/80 text-base lg:text-lg">{ROLE}</p>
        </div>
        <div
          className="hero-rest absolute top-1/2 right-0 hidden -translate-y-1/2 items-center gap-4 md:flex"
          style={{ paddingRight: 'var(--frame-inset)' }}
        >
          <p className="font-system text-ink/80 text-base lg:text-lg">{LOCATION}</p>
          <span aria-hidden className="h-[2px] w-[100px] bg-black/30" />
        </div>

        {/* Nama ter-center di viewport. */}
        <div
          className="hero-rest absolute inset-0 flex flex-col items-center justify-center"
          style={{ paddingInline: 'var(--frame-inset)' }}
        >
          <h1 className="font-display text-center text-6xl leading-[0.9] font-bold tracking-tight md:text-7xl lg:text-8xl">
            <HeroName delay={2.4} />
          </h1>
          {/* Meta ringkas mobile-only (flank labels disembunyikan di mobile). */}
          <p className="font-system text-muted mt-5 text-xs tracking-[0.2em] uppercase md:hidden">
            {ROLE} · Indonesia
          </p>
        </div>
      </div>

      {/* Bubble ikut-kursor — fixed, di luar alur. `active` = intro JS jalan
          (aktifkan follow-cursor + sembunyikan sampai reveal); `play` = fase
          'reveal' (mulai ketik, setelah signature selesai menggores & naik). */}
      <ChatBubble active={phase !== 'idle'} play={phase === 'reveal'} />
    </section>
  );
}
