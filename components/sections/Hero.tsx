'use client';

/**
 * Hero (M2 §3.2) — dirancang mirror hero referensi (nithinmwarrier.com):
 * grid blueprint halus, nama raksasa di tengah, dua bagian label peran mengapit
 * di garis frame (mid-height), signature terakota di atas nama, dan bubble chat
 * intro yang mengetik greeting → CTA.
 *
 * Garis frame (`FrameLines`) dirender DI SINI, bukan di root layout: ia bagian
 * dari komposisi halaman pembuka, jadi ia ikut naik & memudar bersama konten
 * hero alih-alih membingkai setiap section sesudahnya.
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
import { SITE } from '@/content/site';
import { FrameLines } from '@/components/layout/FrameLines';
import { SignatureLine } from '@/components/ui/SignatureLine';
import { HeroName } from '@/components/ui/HeroName';
import { ChatBubble } from '@/components/ui/ChatBubble';

/** Label mengapit nama: [kiri] NAMA [kanan]. Dua bagian peran, bukan peran+lokasi. */
const [ROLE_LEFT, ROLE_RIGHT] = SITE.roleParts;

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
    /* `svh` (bukan `vh`): di mobile `vh` diukur dari viewport tanpa bilah URL,
       jadi tinggi hero berubah tiap kali bilah itu muncul/hilang saat scroll —
       halaman me-relayout persis di tengah gestur. `svh` nilainya tetap. */
    <section ref={sectionRef} className="page-section relative h-[120svh]">
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
        className="absolute inset-x-0 top-0 h-[100svh]"
      >
        {/* Garis margin halaman pembuka — hidup di dalam layer konten hero
            supaya ia ikut naik & memudar saat section berikutnya mengambil
            alih, bukan membingkai seluruh scroll. */}
        <FrameLines />

        {/* Signature terakota. Fase 'draw': dipindah ke tengah & membesar sambil
            menggores; fase 'reveal': naik ke posisi atas ini (transisi di CSS). */}
        <div className="hero-signature absolute inset-x-0 top-[9svh] flex justify-center md:top-[7svh]">
          <SignatureLine className="h-auto w-[clamp(120px,16vw,200px)]" />
        </div>

        {/* Label mengapit — inline di garis frame, setinggi tengah nama (desktop).
            [garis][label] kiri, [label][garis] kanan.

            Ambangnya `lg`, BUKAN `md`: pada ~820px nama raksasa sudah selebar
            hampir seluruh kolom dan huruf pertamanya menabrak label — kedua
            elemen memperebutkan baris mid-height yang sama (terverifikasi di
            browser). Di bawah `lg` kedua bagian peran pindah ke satu baris di
            bawah nama. Lebar garisnya pun ikut viewport (`clamp`) supaya jarak
            label ke nama tidak menyusut jadi nol di lebar antara. */}
        <div
          className="hero-rest absolute top-1/2 left-0 hidden -translate-y-1/2 items-center gap-4 lg:flex"
          style={{ paddingLeft: 'var(--frame-inset)' }}
        >
          {/* Garis tumbuh dari garis frame lalu menguat ke arah label. */}
          <span aria-hidden className="rule-fade-l w-[clamp(40px,7vw,140px)]" />
          <p className="font-system text-ink/80 text-base xl:text-lg">{ROLE_LEFT}</p>
        </div>
        <div
          className="hero-rest absolute top-1/2 right-0 hidden -translate-y-1/2 items-center gap-4 lg:flex"
          style={{ paddingRight: 'var(--frame-inset)' }}
        >
          <p className="font-system text-ink/80 text-base xl:text-lg">{ROLE_RIGHT}</p>
          <span aria-hidden className="rule-fade-r w-[clamp(40px,7vw,140px)]" />
        </div>

        {/* Nama ter-center di viewport. */}
        <div
          className="hero-rest absolute inset-0 flex flex-col items-center justify-center"
          style={{ paddingInline: 'var(--frame-inset)' }}
        >
          {/* Ukuran nama fluid, BUKAN tangga breakpoint: pada 375px `text-6xl`
              (60px) membuat "MUHDHOR" ~275px + inset frame melebihi layar dan
              huruf terakhirnya terpotong di luar viewport — terverifikasi di
              browser. `clamp` menjaga baris terpanjang selalu muat di lebar
              mana pun sekaligus tetap raksasa di layar besar.

              Koefisien 11vw bukan angka bebas: baris "MUHDHOR" ≈ 0.65em/huruf,
              jadi 7 × 0.65 × 11vw ≈ 50vw — separuh layar, yang menyisakan kolom
              untuk label peran yang mengapitnya di `lg` ke atas. */}
          <h1 className="font-display text-center text-[clamp(2.75rem,11vw,8.5rem)] leading-[0.9] font-bold tracking-tight">
            <HeroName delay={2.4} />
          </h1>
          {/* Meta ringkas untuk layar di bawah `lg` (flank labels disembunyikan
              di sana).
              Isinya diturunkan dari `SITE.roleParts` yang SAMA dengan flank
              desktop, bukan kalimat terpisah: versi sebelumnya ditulis ulang di
              sini dan sempat berbunyi lain dari sisa situs — dan justru baris
              inilah yang dilihat pengunjung mobile lebih dulu (Lighthouse
              mencatatnya sebagai elemen LCP). Ukuran & tracking ikut viewport:
              pada 320px, `text-xs` + tracking 0.2em membuat baris ini melebar
              melewati inset frame. */}
          <p className="font-system text-muted mt-5 text-[clamp(0.625rem,2.8vw,0.75rem)] tracking-[0.16em] uppercase lg:hidden">
            {ROLE_LEFT} · {ROLE_RIGHT}
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
