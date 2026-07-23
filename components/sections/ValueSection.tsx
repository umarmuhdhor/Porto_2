'use client';

/**
 * Section value proposition (DESIGN §3 #4). Panel sticky terang yang naik
 * menutupi StatementDark — pergantian gelap→terang ditandai brush divider.
 *
 * M4: section ini jadi host objek 3D (satu-satunya di situs). Dipilih di sini
 * karena bentuknya versi volumetrik dari kurva bezier yang sama dengan
 * SignatureLine (hero) dan LineArt (statement) — motifnya naik tingkat tiap
 * section: coretan → konstruksi garis → objek. Bukan ornamen baru.
 *
 * Sumber progress-nya `onHoldProgress` StackSection, sama seperti LineArt di
 * M3: panel ini `position: sticky` sehingga tidak boleh dipakai sebagai
 * trigger ScrollTrigger (M2 §6.2).
 */

import { useCallback, useRef } from 'react';
import { StackSection } from '@/components/ui/StackSection';
import { BrushDivider } from '@/components/ui/BrushDivider';
import { BrandObject, type BrandObjectHandle } from '@/components/three/BrandObject';

/** Fase hold = ruang scroll yang memutar & memajukan objek 3D dari 0→1. */
const HOLD_VH = 90;

export function ValueSection() {
  const objectRef = useRef<BrandObjectHandle>(null);

  const handleProgress = useCallback((progress: number) => {
    objectRef.current?.setProgress(progress);
  }, []);

  return (
    <StackSection
      id="approach"
      hold={HOLD_VH}
      className="bg-cream text-ink"
      divider={<BrushDivider className="text-cream" />}
      onHoldProgress={handleProgress}
    >
      {/* Layer objek 3D. Absolute supaya tidak menggeser layout teks, dan di
          dalam konten panel supaya ikut memudar saat ServiceList menutupi.

          `overflow-hidden` di pembungkus bukan hiasan: di bawah xl objek
          sengaja menggantung lewat tepi kanan (`right-[-6%]`), dan tanpa klip
          itu melebarkan dokumen → muncul scrollbar horizontal di mobile.
          Pola pembungkusnya sama dengan LineArt di StatementDark.

          Di bawah xl objek mundur jadi tekstur latar (opacity rendah, digeser
          ke kanan-bawah): headline 60-72px memakai hampir seluruh lebar di
          breakpoint itu, jadi keduanya tidak punya kolom sendiri. Jangan
          naikkan opacity-nya di layar kecil tanpa menyelesaikan tabrakan
          kolomnya lebih dulu. Teks tetap `relative` supaya dicat di atas objek. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <BrandObject
          ref={objectRef}
          className="absolute right-[-6%] bottom-[2%] aspect-square w-[clamp(230px,52vw,420px)] opacity-40 xl:right-[2%] xl:bottom-1/2 xl:w-[clamp(380px,34vw,560px)] xl:translate-y-1/2 xl:opacity-100"
        />
      </div>

      <p className="font-system text-muted relative text-xs tracking-[0.3em] uppercase">Approach</p>
      <h2 className="font-display relative mt-6 max-w-4xl text-4xl leading-[1.05] font-bold tracking-tight md:text-6xl lg:text-7xl xl:max-w-2xl">
        Designing experiences that help brands grow.
      </h2>
      <p className="font-system text-muted relative mt-8 max-w-lg text-base leading-relaxed">
        Clarity first, craft second, decoration last. Every screen earns its place in the story
        before it earns a gradient.
      </p>
    </StackSection>
  );
}
