'use client';

/**
 * Section statement gelap (DESIGN §3 #2). Panel sticky pertama: naik menutupi
 * hero, ditahan sebentar, lalu ditutupi ValueSection.
 *
 * Kata pertama solid, sisanya redup — hierarki via opacity teks, bukan animasi.
 *
 * M3: <LineArt /> menggambar dirinya sendiri selama fase HOLD panel ini.
 * Progress-nya diambil dari `onHoldProgress` StackSection (ScrollTrigger yang
 * memakai marker non-sticky — panel ini sendiri TIDAK boleh jadi trigger,
 * lihat M2 §6.2) lalu disuntik ke timeline LineArt lewat ref imperatif.
 * Sengaja lewat ref, bukan React state: nilainya berubah tiap frame scroll,
 * setState per frame = re-render seluruh section per frame.
 */

import { useCallback, useRef } from 'react';
import { StackSection } from '@/components/ui/StackSection';
import { BrushDivider } from '@/components/ui/BrushDivider';
import { LineArt, type LineArtHandle } from '@/components/sections/LineArt';
import { DarkBackdrop } from '@/components/sections/DarkBackdrop';
import { FloatingIcons } from '@/components/sections/FloatingIcons';

const HEADLINE = 'Building mobile apps that feel effortless and hold up in real use';
const SOLID_WORDS = 2;

/** Fase hold dipakai penuh untuk menggambar garis — habis 100% saat mulai ditutupi. */
const HOLD_VH = 60;

export function StatementDark() {
  const words = HEADLINE.split(' ');
  const artRef = useRef<LineArtHandle>(null);

  const handleProgress = useCallback((progress: number) => {
    artRef.current?.setProgress(progress);
  }, []);

  return (
    <StackSection
      id="about"
      hold={HOLD_VH}
      className="bg-dark text-inverse"
      divider={<BrushDivider className="text-dark" />}
      onHoldProgress={handleProgress}
    >
      {/* Backdrop interaktif: medan titik + sorot ikut kursor (improve background
          + hover background). Paling belakang. */}
      <DarkBackdrop className="absolute inset-0" />

      {/* Ikon brand melayang (Codex + Claude) mengapit headline tengah. */}
      <FloatingIcons />

      {/* Line-art dekoratif: kurva pen-tool lebar melintang bawah + node tengah
          (mirror referensi). Full-width, terang. Wrapper overflow-hidden supaya
          ekor kurva yang keluar viewBox terpotong rapi, bukan bikin scroll. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <LineArt
          ref={artRef}
          className="text-inverse absolute inset-x-0 bottom-[7vh] h-auto w-full"
        />
      </div>

      {/* Blok teks di TENGAH (mirror referensi: cuma headline, tanpa peran/paragraf).
          `relative z-10` supaya dicat di atas backdrop titik & line-art absolute. */}
      <div className="relative z-10 mb-[12vh] flex w-full flex-col items-center text-center">
        <h2 className="font-display mx-auto max-w-4xl text-4xl leading-[1.05] font-normal tracking-tight md:text-6xl lg:text-7xl">
          {/* "4+ years" bold, sisanya berat normal — warna seragam cream penuh
              seperti referensi (hierarki lewat berat huruf, bukan redup). */}
          {words.map((word, i) => (
            <span key={`${word}-${i}`} className={i < SOLID_WORDS ? 'font-bold' : ''}>
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h2>
      </div>
    </StackSection>
  );
}
