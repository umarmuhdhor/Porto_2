'use client';

/**
 * Section "about" bergaya jendela desktop — konsep diadaptasi dari
 * stefanobartoletti.it: beberapa panel kecil bertajuk kebab-case (`about-me`,
 * `where-i-work`, …) berisi baris bernomor seperti editor kode, tersebar di
 * satu layar, BISA DIGESER user, dan MUNCUL SATU PER SATU mengikuti scroll.
 *
 * Yang diambil hanya konsepnya. Warna, tipografi, hairline, radius, dan kurva
 * gerak seluruhnya token situs ini (globals.css) — tidak ada design system
 * baru yang ikut masuk.
 *
 * DUA LAPIS TRANSFORM (jangan digabung):
 *   - `.win-slot`  → transform milik REVEAL (scroll). Dikendalikan CSS lewat
 *                    data-armed / data-shown.
 *   - `.win`       → transform milik DRAG. Ditulis langsung ke style.transform
 *                    tiap pointermove.
 * Kalau keduanya berbagi satu elemen, geseran user akan ditimpa transform
 * reveal (dan sebaliknya) — window akan "meloncat balik" saat digeser.
 *
 * KENAPA nulis ke DOM langsung, bukan useState: posisi drag berubah tiap frame
 * pointer; setState per frame = re-render seluruh section per frame. Pola yang
 * sama dipakai StatementDark untuk opacity kata.
 *
 * FAIL-SAFE (pola yang sama dengan Reveal & SplitText): markup default =
 * TERLIHAT. Yang menyembunyikan cuma `data-armed="true"`, dan atribut itu hanya
 * dipasang JS di jalur `prefers-reduced-motion: no-preference` tepat sebelum
 * ScrollTrigger-nya dibuat. Jadi tanpa JS / di reduced-motion semua jendela
 * tampil utuh — tidak ada jalan bagi konten untuk tersangkut invisible.
 *
 * REVEAL BERTANGGA (konsep scroll dari nithinmwarrier.com §2). Section ini
 * berlatar accent SOLID dan tepat di atasnya menempel satu strip berisi lima
 * kolom krem — warna yang sama persis dengan hero. Saat section naik, tiap
 * kolom menyusut ke atas dengan jeda berbeda, jadi batas krem→accent tidak
 * pernah berupa garis lurus melainkan tangga yang bergerak. Kolom TENGAH
 * menyusut duluan, kolom terluar terakhir (lihat DELAY_FROM_CENTER).
 *
 * Referensinya memakai section `position: fixed` di belakang hero + deretan
 * "blind" krem yang menyusut untuk membuka layer itu. Di sini section-nya biasa
 * (in-flow) dan strip krem-nya menempel di tepi atas section: hasil visualnya
 * sama — batas bertangga yang naik — tanpa menambah satu lagi layer fixed yang
 * harus berebut z-index dengan latar fixed milik Hero (--z-hero-bg).
 */

import { Fragment, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { NO_PREFERENCE } from '@/lib/motion';
import Image from 'next/image';
import { StaircaseBlinds } from '@/components/ui/StaircaseBlinds';

/** Penanda kata kunci di dalam baris. Warna diambil dari token aksen situs. */
function Hl({ tone = 'line', children }: { tone?: 'line' | 'note' | 'ink'; children: ReactNode }) {
  const cls =
    tone === 'note'
      ? 'text-note-strong'
      : tone === 'ink'
        ? 'text-ink font-medium'
        : 'text-accent-line-strong';
  return <span className={cls}>{children}</span>;
}

type WindowSpec = {
  /** Judul di title bar — kebab-case, sekaligus dipakai sebagai key & aria-label. */
  title: string;
  /** Penempatan di grid 12 kolom (desktop). Di bawah lg semua jadi satu kolom. */
  place: string;
  /** Baris bernomor. Kosongkan untuk jendela bergambar (lihat `media`). */
  lines?: ReactNode[];
  /** Isi non-teks (portrait) — dirender menggantikan daftar baris. */
  media?: ReactNode;
};

const WINDOWS: WindowSpec[] = [
  {
    title: 'about-me',
    place: 'lg:col-span-7 lg:col-start-1 lg:row-start-1',
    lines: [
      <>
        Nice to meet you! I&apos;m Umar, an <Hl>iOS Developer</Hl>.
      </>,
      <>
        I build mobile apps with <Hl tone="note">Swift</Hl> and <Hl tone="note">Flutter</Hl>, with a
        particular focus on <Hl tone="ink">interfaces</Hl> that stay fast and predictable once real
        people start using them.
      </>,
      <>
        Informatics graduate from <Hl tone="ink">Multi Data Palembang</Hl>, now building at the{' '}
        <Hl>Apple Developer Academy</Hl> in Bali.
      </>,
      <>
        Outside client work I keep shipping <Hl tone="note">side projects</Hl> and take apart new
        frameworks whenever I get the chance.
      </>,
    ],
  },
  {
    title: 'portrait',
    // Lebarnya DIBATASI di kedua arah, dan itu yang menentukan tingginya:
    // isinya `aspect-square`, jadi satu kolom penuh di mobile berarti foto
    // setinggi ~900px — satu wajah yang mengisi hampir seluruh layar
    // (terverifikasi di viewport 992px). `max-w` menjaganya tetap terbaca
    // sebagai tile potret, bukan billboard.
    place:
      'mx-auto w-full max-w-[17rem] lg:mx-0 lg:max-w-[15rem] lg:col-span-3 lg:col-start-9 lg:row-start-1 lg:mt-4',
    media: (
      // Foto asli, bukan lagi avatar pixel-art: jendela ini judulnya
      // "portrait", dan satu-satunya tempat di situs yang menjanjikan wajah
      // sungguhan. Avatar pixel-art tetap hidup di footer, tempat ia memang
      // berperan sebagai figur seluruh badan, bukan sebagai potret.
      //
      // Latar putih bawaan fotonya DIBIARKAN — tile putih di atas bidang
      // accent terbaca sebagai pas foto yang memang begitu, dan alternatifnya
      // (memaksa cutout atau menimpa latar gelap di belakang subjek yang
      // tepinya masih putih) menghasilkan halo yang jauh lebih terlihat.
      //
      // `fill` + aspect-square: kotaknya yang menentukan ukuran, jadi jendela
      // ini tidak berubah tinggi kalau fotonya suatu saat diganti dengan rasio
      // lain. `sizes` mengikuti lebar render nyata (3/12 kolom di desktop).
      <div className="relative aspect-square w-full overflow-hidden bg-white">
        <Image
          src="/umar-portrait.jpg"
          alt="Umar Muhdhor"
          fill
          sizes="(max-width: 1024px) 17rem, 15rem"
          className="object-cover"
        />
      </div>
    ),
  },
  {
    title: 'where-i-work',
    place: 'lg:col-span-5 lg:col-start-2 lg:row-start-2 lg:-mt-4',
    lines: [
      <>
        Currently based in <Hl tone="ink">Bali, Indonesia</Hl>
      </>,
      <>
        Available for <Hl>remote collaboration</Hl> across Asia and worldwide
      </>,
    ],
  },
  {
    title: 'right-now',
    place: 'lg:col-span-4 lg:col-start-8 lg:row-start-2 lg:mt-4',
    lines: [
      <>
        Learning <Hl tone="note">SwiftUI</Hl> and native platform APIs in depth
      </>,
      <>
        Previously a <Hl tone="ink">mobile developer intern</Hl> at DPR RI
      </>,
    ],
  },
];

/** Titik munculnya jendela ke-i sepanjang progress reveal (0→1). */
const showAt = (i: number) => (i + 0.6) / WINDOWS.length;

/** Judul section, dipecah per kata — tiap kata naik dari balik klip sendiri. */
const HEADING = 'The developer behind the work'.split(' ');

/** Jeda antar kata & panjang jendela naik satu kata, dalam satuan progress. */
const WORD_STEP = 0.09;
const WORD_SPAN = 0.55;

/** Langkah geser per tekan panah — ekuivalen keyboard untuk drag. */
const NUDGE = 16;

/** Ease-out kubik — kata judul melesat naik lalu melambat di ujung. */
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Jarak aman window ke tepi panggung saat digeser. */
const DRAG_PAD = 12;

/**
 * Posisi "rumah" window (sebelum geseran) relatif ke padding box panggung,
 * dijumlahkan lewat rantai offsetParent.
 *
 * SENGAJA offsetLeft/offsetTop, BUKAN getBoundingClientRect: rect ikut membawa
 * transform milik leluhur, dan `.win-slot` masih men-scale dirinya selama
 * transisi reveal 640ms. Window yang digeser tepat di tengah transisi itu akan
 * diukur lebih kecil dari ukuran sebenarnya, jadi batasnya dihitung terlalu
 * longgar dan window bisa menonjol keluar panggung setelah transisinya selesai.
 * Nilai offset* murni hasil layout — tidak terpengaruh transform sama sekali.
 */
function homeWithin(win: HTMLElement, stage: HTMLElement): [number, number] {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = win;
  while (node && node !== stage) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return [x, y];
}

/**
 * Kunci geseran supaya window tak pernah keluar panggung.
 *
 * Kalau window lebih besar dari panggung pada satu sumbu, batas bawah melewati
 * batas atas — sumbu itu dikunci di 0 (bukan dipaksa ke salah satu tepi, yang
 * akan membuat window meloncat begitu disentuh).
 */
function clampOffset(
  win: HTMLElement,
  stage: HTMLElement | null,
  dx: number,
  dy: number,
): [number, number] {
  if (!stage) return [dx, dy];

  const [homeX, homeY] = homeWithin(win, stage);
  const fit = (v: number, lo: number, hi: number) => (lo > hi ? 0 : Math.min(hi, Math.max(lo, v)));

  return [
    fit(dx, DRAG_PAD - homeX, stage.clientWidth - DRAG_PAD - win.offsetWidth - homeX),
    fit(dy, DRAG_PAD - homeY, stage.clientHeight - DRAG_PAD - win.offsetHeight - homeY),
  ];
}

/** Satu-satunya jalan menulis posisi window — selalu lewat clamp. */
function applyOffset(win: HTMLElement, stage: HTMLElement | null, dx: number, dy: number) {
  const [x, y] = clampOffset(win, stage, dx, dy);
  win.dataset.dx = String(x);
  win.dataset.dy = String(y);
  win.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

export function AboutWindows() {
  const sectionRef = useRef<HTMLElement>(null);
  /** Panggung = kotak sebesar viewport saat section terpaku. Batas drag. */
  const stageRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  /** Window paling depan. Dinaikkan tiap kali sebuah window disentuh. */
  const topZ = useRef(1);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();

      mm.add(NO_PREFERENCE, () => {
        const slots = slotRefs.current.filter(Boolean) as HTMLDivElement[];
        const words = wordRefs.current.filter(Boolean) as HTMLSpanElement[];

        // Arming (menyembunyikan) dilakukan DI SINI, satu langkah sebelum
        // trigger-nya dibuat — bukan di CSS — supaya tidak ada celah di mana
        // konten sudah disembunyikan tapi belum ada yang bisa memunculkannya.
        //
        // `data-instant` menemani arming supaya perpindahan terlihat→tersembunyi
        // yang pertama ini TIDAK ikut teranimasi (lihat globals.css). Sekarang
        // state tersembunyi punya transition sendiri — itu yang bikin arah
        // "menghilang" mulus — tapi konsekuensinya arming pun jadi kandidat
        // animasi kalau tidak dibungkam sesaat.
        slots.forEach((el) => {
          el.dataset.armed = 'true';
          el.dataset.instant = 'true';
        });

        const paintWindows = (progress: number) => {
          slots.forEach((el, i) => {
            el.dataset.shown = progress >= showAt(i) ? 'true' : 'false';
          });
        };

        /**
         * Judul naik per kata dari balik klipnya. Ditulis langsung ke style
         * (bukan class + transition) supaya gerakannya SCRUB — ikut maju-mundur
         * persis mengikuti scroll, sama seperti tangga krem di atasnya, jadi
         * arah balik ke atas tidak perlu animasi terpisah untuk terasa mulus.
         */
        const paintHeading = (progress: number) => {
          words.forEach((el, i) => {
            const t = (progress - i * WORD_STEP) / WORD_SPAN;
            const eased = easeOut(t <= 0 ? 0 : t >= 1 ? 1 : t);
            el.style.transform = `translateY(${(1 - eased) * 100}%)`;
            el.style.opacity = String(eased);
          });
        };

        paintWindows(0);
        paintHeading(0);

        // Paksa browser meng-commit style tersembunyi di atas SEKARANG, selagi
        // `data-instant` masih memblokir transisi. Membaca offsetHeight memicu
        // recalc sinkron; setelah itu `data-instant` boleh dicabut karena nilai
        // opacity/transform-nya sudah tercatat — mencabutnya tidak mengubah
        // nilai apa pun, jadi tidak ada transisi yang ikut terpicu. Perubahan
        // BERIKUTNYA (scroll) baru teranimasi, dua-dua arah.
        void slots[0]?.offsetHeight;
        slots.forEach((el) => {
          delete el.dataset.instant;
        });

        // Judul menyusul tepat saat tangga krem selesai membuka bagian atas
        // panggung (tangga tuntas di 'top top', lihat StaircaseBlinds), jadi
        // kata pertama sudah naik sebelum layar sempat kosong.
        ScrollTrigger.create({
          trigger: section,
          start: 'top 55%',
          end: 'top 8%',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => paintHeading(self.progress),
          onRefresh: (self) => paintHeading(self.progress),
        });

        // Jendela menyusul SETELAH tangga selesai, dan sepanjang fase PAKU:
        // 'top top' → 'bottom bottom' persis rentang saat panggung diam di
        // viewport (lihat .about-panel/.about-stage di globals.css). Ini yang
        // membuat kemunculannya benar-benar terbaca satu per satu — kalau
        // dipetakan ke gerak section seperti sebelumnya, jendela terakhir baru
        // menyala tepat ketika barisnya sudah nyaris keluar layar.
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => paintWindows(self.progress),
          // Landing di tengah/bawah section (deep link, reload) harus langsung
          // menampilkan jendela yang semestinya sudah lewat, bukan menunggu
          // pointer bergerak.
          onRefresh: (self) => paintWindows(self.progress),
        });

        return () => {
          slots.forEach((el) => {
            delete el.dataset.armed;
            delete el.dataset.shown;
            delete el.dataset.instant;
          });
          // Judul balik ke posisi normal, bukan ke frame awal — di
          // reduced-motion ia harus langsung terbaca utuh.
          words.forEach((el) => {
            el.style.transform = '';
            el.style.opacity = '';
          });
        };
      });
    },
    { scope: sectionRef },
  );

  // Panggung menyusut saat viewport diubah ukurannya, dan window yang tadinya
  // pas bisa jadi menggantung di luar. Offset-nya dijepit ulang, BUKAN direset:
  // posisi itu hasil kerja user, jadi yang dibetulkan cuma yang benar-benar
  // melewati batas.
  useEffect(() => {
    // Digabung ke satu rAF: `resize` menembak puluhan kali saat jendela diseret,
    // dan tiap panggilan membaca offsetWidth/clientWidth (layout paksa) untuk
    // tiap window. Menjepit ulang sekali per frame sudah cukup — posisinya toh
    // baru terlihat saat frame itu dicat.
    let raf = 0;
    const onResize = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const stage = stageRef.current;
        if (!stage) return;
        stage.querySelectorAll<HTMLElement>('[data-win]').forEach((win) => {
          if (win.dataset.dx === undefined && win.dataset.dy === undefined) return;
          applyOffset(win, stage, Number(win.dataset.dx ?? 0), Number(win.dataset.dy ?? 0));
        });
      });
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /**
   * Drag lewat title bar saja — persis jendela sungguhan, dan itu juga yang
   * menjaga scroll tetap milik halaman: menyeret badan window (tempat teks
   * berada) tidak pernah membajak gestur scroll di layar sentuh.
   */
  const startDrag = useCallback((e: React.PointerEvent<HTMLElement>) => {
    // Tombol tengah/kanan bukan gestur drag; biarkan browser yang urus.
    if (e.button !== 0) return;

    const handle = e.currentTarget;
    const win = handle.closest<HTMLElement>('[data-win]');
    if (!win) return;

    win.style.zIndex = String(++topZ.current);

    const startX = e.clientX;
    const startY = e.clientY;
    const baseX = Number(win.dataset.dx ?? 0);
    const baseY = Number(win.dataset.dy ?? 0);

    handle.setPointerCapture(e.pointerId);
    win.dataset.dragging = 'true';

    const move = (ev: PointerEvent) => {
      applyOffset(win, stageRef.current, baseX + ev.clientX - startX, baseY + ev.clientY - startY);
    };

    const end = (ev: PointerEvent) => {
      handle.releasePointerCapture(ev.pointerId);
      delete win.dataset.dragging;
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
    };

    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }, []);

  /** Ekuivalen keyboard: panah menggeser, Escape/Home mengembalikan posisi. */
  const onHandleKey = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    const win = e.currentTarget.closest<HTMLElement>('[data-win]');
    if (!win) return;

    const step: Record<string, [number, number]> = {
      ArrowLeft: [-NUDGE, 0],
      ArrowRight: [NUDGE, 0],
      ArrowUp: [0, -NUDGE],
      ArrowDown: [0, NUDGE],
    };

    if (e.key === 'Escape' || e.key === 'Home') {
      e.preventDefault();
      delete win.dataset.dx;
      delete win.dataset.dy;
      win.style.transform = '';
      return;
    }

    const delta = step[e.key];
    if (!delta) return;
    e.preventDefault();

    applyOffset(
      win,
      stageRef.current,
      Number(win.dataset.dx ?? 0) + delta[0],
      Number(win.dataset.dy ?? 0) + delta[1],
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about-me"
      className="page-section about-panel bg-accent text-ink relative"
    >
      {/* Panggung. Di desktop ia `sticky top-0 h-screen` (globals.css) sehingga
          section-nya yang tinggi mengalir sementara isinya DIAM di layar — itu
          ruang scroll tempat jendela muncul satu per satu. Section sendiri tetap
          non-sticky supaya sah dipakai sebagai trigger ScrollTrigger (M2 §6.2).
          Batas drag = kotak elemen ini (lihat clampOffset). */}
      <div
        ref={stageRef}
        className="about-stage flex w-full flex-col justify-center overflow-hidden py-[16vh] lg:py-[12vh]"
        style={{ paddingInline: 'var(--frame-inset)' }}
      >
        {/* Medan titik — bahasa tekstur yang sama dengan StatementDark, dengan
            warna dibalik (lihat .accent-dots di globals.css). Dipasang sebagai
            layer paling belakang di panggung: strip krem (z-20) tetap menutupinya
            saat menyusut, dan isi section (z-10) tetap di atasnya. */}
        <div aria-hidden className="accent-dots pointer-events-none absolute inset-0" />

        {/* Tepi bertangga krem→accent. Trigger-nya section ini (dicari sendiri
            oleh komponen), jadi tangganya selesai sebelum panggung berhenti di
            tengah layar dan isi section jadi fokus. */}
        <StaircaseBlinds />

        <div className="relative z-10 mx-auto w-full max-w-[92rem]">
          {/* Kepala section — sengaja kecil: headline besar sudah jadi milik hero
            dan StatementDark, jadi bagian ini masuk sebagai "ruang kerja".
            Di atas accent semua teks dipaksa ink gelap (globals.css §2.1). */}
          <header className="mb-[5vh] flex flex-col items-center gap-4 text-center lg:mb-[4vh]">
            <h2 className="font-display max-w-3xl text-3xl leading-[1.08] font-bold tracking-tight md:text-5xl">
              {HEADING.map((word, i) => (
                <Fragment key={`${word}-${i}`}>
                  {/* Kotak klip per kata. `pb`/`-mb` sepasang: dengan leading
                    1.08 `overflow-hidden` akan memotong ekor huruf "p" di
                    "developer", jadi kotaknya diberi ruang bawah lalu ditarik
                    balik supaya tinggi barisnya tidak ikut bertambah. */}
                  <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
                    <span
                      ref={(el) => {
                        wordRefs.current[i] = el;
                      }}
                      className="inline-block"
                      style={{ willChange: 'transform, opacity' }}
                    >
                      {word}
                    </span>
                  </span>
                  {/* Spasi DI LUAR kotak klip: spasi di ujung inline-block ikut
                    terpangkas saat baris ter-wrap dan kata jadi dempet. */}
                  {i < HEADING.length - 1 ? ' ' : ''}
                </Fragment>
              ))}
            </h2>
            {/* BUKAN --color-muted: abu-abu itu dipilih untuk latar krem dan cuma
              ~2:1 di atas kuning. Ink 55% tetap terbaca sebagai teks sekunder. */}
            <p className="font-system text-ink/65 text-[11px] tracking-[0.22em] uppercase">
              Drag the windows around
            </p>
          </header>

          {/* Kanvas jendela. Grid 12 kolom hanya di lg — di bawah itu satu kolom
            bertumpuk supaya baris teks tidak pernah menyempit sampai sulit
            dibaca. `items-start` menjaga tiap jendela setinggi isinya sendiri
            (bukan diregangkan setinggi baris grid). */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-6">
            {WINDOWS.map((win, i) => (
              <div
                key={win.title}
                ref={(el) => {
                  slotRefs.current[i] = el;
                }}
                className={`win-slot ${win.place}`}
              >
                <div
                  data-win
                  className="win bg-cream relative overflow-hidden rounded-[var(--radius-card)] shadow-[0_36px_70px_-46px_rgba(10,10,10,0.45),0_8px_22px_-18px_rgba(10,10,10,0.25)] ring-1 ring-[var(--line-rule)]"
                >
                  {/* Title bar = satu-satunya area drag. `tabIndex`/`role` +
                    handler panah memberi jalur keyboard yang setara dengan
                    pointer (a11y: tiap gestur pointer punya padanan keyboard). */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`Move the ${win.title.replace(/-/g, ' ')} window with the arrow keys; Escape resets it`}
                    onPointerDown={startDrag}
                    onKeyDown={onHandleKey}
                    className="win-bar flex items-center justify-between gap-4 border-b border-[var(--line-rule)] px-4 py-3 select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-accent-line)]"
                  >
                    <span className="font-system text-ink/70 text-[12px] tracking-[0.12em]">
                      {win.title}
                    </span>
                    {/* Kontrol jendela murni dekoratif — bentuknya meminjam chrome
                      OS supaya panel terbaca sebagai "window", tapi sengaja
                      BUKAN <button>: tombol yang tidak melakukan apa-apa adalah
                      jebakan untuk pengguna screen reader & keyboard. */}
                    <span aria-hidden className="text-ink/30 flex items-center gap-3">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M1 5.5h9" stroke="currentColor" strokeWidth="1.1" />
                      </svg>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <rect
                          x="1"
                          y="1"
                          width="9"
                          height="9"
                          stroke="currentColor"
                          strokeWidth="1.1"
                        />
                      </svg>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path
                          d="M1.5 1.5l8 8M9.5 1.5l-8 8"
                          stroke="currentColor"
                          strokeWidth="1.1"
                        />
                      </svg>
                    </span>
                  </div>

                  {win.media ?? (
                    <ol className="font-system flex flex-col gap-3 px-5 py-5 text-[15px] leading-relaxed md:px-6 md:py-5 md:text-base">
                      {win.lines?.map((line, li) => (
                        <li key={li} className="flex gap-4">
                          {/* Nomor baris: dekoratif (urutan sudah dibawa <ol>),
                            jadi tidak ikut dibacakan screen reader. `tabular-nums`
                            menjaga kolomnya lurus saat menembus 9 baris. */}
                          <span
                            aria-hidden
                            className="text-ink/25 w-4 shrink-0 text-right text-[13px] tabular-nums"
                          >
                            {li + 1}
                          </span>
                          <span className="text-ink/80 min-w-0">{line}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
