'use client';

/**
 * Section statement gelap (DESIGN §3 #2). Panel sticky pertama: naik menutupi
 * hero, ditahan sebentar, lalu ditutupi ValueSection.
 *
 * Headline menyala PER KATA mengikuti scroll (mirror referensi): semua kata
 * mulai redup, lalu satu per satu naik ke opacity penuh selama fase hold.
 *
 * M3: <LineArt /> menggambar dirinya sendiri selama fase HOLD panel ini.
 * Progress-nya diambil dari `onHoldProgress` StackSection (ScrollTrigger yang
 * memakai marker non-sticky — panel ini sendiri TIDAK boleh jadi trigger,
 * lihat M2 §6.2) lalu disuntik ke timeline LineArt lewat ref imperatif.
 * Sengaja lewat ref, bukan React state: nilainya berubah tiap frame scroll,
 * setState per frame = re-render seluruh section per frame. Opacity kata ditulis
 * langsung ke `style` tiap elemen dengan alasan yang sama.
 */

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { StackSection } from '@/components/ui/StackSection';
import { BrushDivider } from '@/components/ui/BrushDivider';
import { LineArt, type LineArtHandle } from '@/components/sections/LineArt';
import { DarkBackdrop } from '@/components/sections/DarkBackdrop';
import { FloatingIcons } from '@/components/sections/FloatingIcons';

const HEADLINE = 'Building mobile apps that feel effortless and hold up in real use';
const SOLID_WORDS = 2;

/**
 * Huruf tempat garis line-art bergantung (mirror referensi, yang menggantungkan
 * kurvanya di bawah satu huruf headline). Dipilih "p" pada kata "up": posisinya
 * di kanan-tengah blok teks, jadi kurva punya ruang penuh menyapu ke kiri.
 * Indeks dihitung terhadap HEADLINE di atas — kalau kalimatnya diubah, sesuaikan.
 */
const ANCHOR = { word: 8, char: 1 } as const;

/** Fase hold dipakai penuh untuk menggambar garis — habis 100% saat mulai ditutupi. */
const HOLD_VH = 60;

/** Opacity kata sebelum gilirannya menyala (nilai referensi). */
const DIM = 0.22;
/** Semua kata sudah menyala di titik ini — sisa hold jadi jeda baca. */
const REVEAL_END = 0.72;
/** Panjang jendela nyala tiap kata, dalam kelipatan satu slot. >1 = saling
 *  menimpa, jadi nyalanya terbaca sebagai gelombang, bukan lampu satu-satu. */
const OVERLAP = 2.2;

/** Media query dipakai berulang; useLayoutEffect isomorfik (no-op di SSR). */
const useIsoLayout = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function StatementDark() {
  const words = HEADLINE.split(' ');
  const artRef = useRef<LineArtHandle>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  /**
   * Kata ke-i menyala di jendelanya sendiri. Jendela dihitung dari progress
   * (0→1 sepanjang fase hold), bukan dari waktu, supaya gerakannya benar-benar
   * mengikuti scroll — termasuk saat user scroll balik ke atas (reversible).
   */
  const paintWords = useCallback((progress: number) => {
    const els = wordRefs.current;
    const slot = REVEAL_END / els.length;

    els.forEach((el, i) => {
      if (!el) return;
      const t = (progress - i * slot) / (slot * OVERLAP);
      const eased = t <= 0 ? 0 : t >= 1 ? 1 : t;
      el.style.opacity = String(DIM + (1 - DIM) * eased);
    });
  }, []);

  // State awal REDUP dipasang pre-paint & hanya di jalur no-preference. Default
  // markup-nya opacity penuh, jadi tanpa JS / di reduced-motion headline tampil
  // utuh — teks tidak pernah tersangkut nyaris tak terbaca (pola sama seperti
  // Reveal & SplitText, lihat globals.css).
  useIsoLayout(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    paintWords(0);
  }, [paintWords]);

  const handleProgress = useCallback(
    (progress: number) => {
      artRef.current?.setProgress(progress);
      paintWords(progress);
    },
    [paintWords],
  );

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

      {/* Blok teks di TENGAH (mirror referensi: cuma headline, tanpa peran/paragraf).
          `relative z-10` supaya dicat di atas backdrop titik & line-art absolute.
          Line-art hidup DI DALAM headline — digantung di bawah satu huruf
          (lihat ANCHOR & komentar di LineArt.tsx). */}
      <div className="relative z-10 mb-[12vh] flex w-full flex-col items-center text-center">
        <h2 className="font-display mx-auto max-w-4xl text-4xl leading-[1.05] font-normal tracking-tight md:text-6xl lg:text-7xl">
          {/* "Building mobile" bold, sisanya berat normal — warna seragam cream
              penuh seperti referensi (hierarki lewat berat huruf, bukan redup).
              `inline-block` di tiap kata supaya opacity-nya jadi layer sendiri
              (kata utuh menyala bersamaan, bukan per baris saat kata ter-wrap). */}
          {words.map((word, i) => (
            <Fragment key={`${word}-${i}`}>
              <span
                ref={(el) => {
                  wordRefs.current[i] = el;
                }}
                className={`inline-block ${i < SOLID_WORDS ? 'font-bold' : ''}`}
                style={{ willChange: 'opacity' }}
              >
                {i === ANCHOR.word ? (
                  <>
                    {word.slice(0, ANCHOR.char)}
                    {/* `inline-block` + `relative`: satu-satunya cara memberi huruf
                        ini containing block sendiri tanpa mengubah alirannya. */}
                    <span className="relative inline-block">
                      {word.slice(ANCHOR.char, ANCHOR.char + 1)}
                      <LineArt ref={artRef} className="text-inverse" />
                    </span>
                    {word.slice(ANCHOR.char + 1)}
                  </>
                ) : (
                  word
                )}
              </span>
              {/* Spasi SENGAJA di luar span: spasi di ujung kotak inline-block
                  ikut terpangkas saat baris ter-wrap, dan kata jadi dempet. */}
              {i < words.length - 1 ? ' ' : ''}
            </Fragment>
          ))}
        </h2>
      </div>
    </StackSection>
  );
}
