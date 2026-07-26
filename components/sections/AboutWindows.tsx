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
 */

import { useCallback, useRef, type ReactNode } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { NO_PREFERENCE } from '@/lib/motion';
import { PixelAvatar } from '@/components/ui/PixelAvatar';

/** Penanda kata kunci di dalam baris. Warna diambil dari token aksen situs. */
function Hl({ tone = 'line', children }: { tone?: 'line' | 'note' | 'ink'; children: ReactNode }) {
  const cls =
    tone === 'note' ? 'text-note' : tone === 'ink' ? 'text-ink font-medium' : 'text-accent-line';
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
    place: 'lg:col-span-3 lg:col-start-9 lg:row-start-1 lg:mt-16',
    media: (
      <div className="bg-accent flex items-end justify-center overflow-hidden py-6">
        <PixelAvatar className="h-44 w-auto sm:h-52" />
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
    place: 'lg:col-span-4 lg:col-start-8 lg:row-start-2 lg:mt-8',
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

/** Langkah geser per tekan panah — ekuivalen keyboard untuk drag. */
const NUDGE = 16;

export function AboutWindows() {
  const sectionRef = useRef<HTMLElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** Window paling depan. Dinaikkan tiap kali sebuah window disentuh. */
  const topZ = useRef(1);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();

      mm.add(NO_PREFERENCE, () => {
        const slots = slotRefs.current.filter(Boolean) as HTMLDivElement[];

        // Arming (menyembunyikan) dilakukan DI SINI, satu langkah sebelum
        // trigger-nya dibuat — bukan di CSS — supaya tidak ada celah di mana
        // konten sudah disembunyikan tapi belum ada yang bisa memunculkannya.
        slots.forEach((el) => {
          el.dataset.armed = 'true';
        });

        const paint = (progress: number) => {
          slots.forEach((el, i) => {
            el.dataset.shown = progress >= showAt(i) ? 'true' : 'false';
          });
        };

        paint(0);

        ScrollTrigger.create({
          trigger: section,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => paint(self.progress),
          // Landing di tengah/bawah section (deep link, reload) harus langsung
          // menampilkan jendela yang semestinya sudah lewat, bukan menunggu
          // pointer bergerak.
          onRefresh: (self) => paint(self.progress),
        });

        return () => {
          slots.forEach((el) => {
            delete el.dataset.armed;
            delete el.dataset.shown;
          });
        };
      });
    },
    { scope: sectionRef },
  );

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
      const dx = baseX + ev.clientX - startX;
      const dy = baseY + ev.clientY - startY;
      win.dataset.dx = String(dx);
      win.dataset.dy = String(dy);
      win.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
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

    const dx = Number(win.dataset.dx ?? 0) + delta[0];
    const dy = Number(win.dataset.dy ?? 0) + delta[1];
    win.dataset.dx = String(dx);
    win.dataset.dy = String(dy);
    win.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about-me"
      className="page-section bg-cream text-ink relative py-[14vh]"
      style={{ paddingInline: 'var(--frame-inset)' }}
    >
      <div className="mx-auto w-full max-w-[92rem]">
        {/* Kepala section — sengaja kecil: headline besar sudah jadi milik hero
            dan StatementDark, jadi bagian ini masuk sebagai "ruang kerja". */}
        <header className="mb-[7vh] flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 className="font-display max-w-3xl text-3xl leading-[1.08] font-bold tracking-tight md:text-5xl">
            The developer <span className="text-accent-line">behind</span> the work
          </h2>
          <p className="font-system text-muted text-[11px] tracking-[0.22em] uppercase">
            Drag the windows around
          </p>
        </header>

        {/* Kanvas jendela. Grid 12 kolom hanya di lg — di bawah itu satu kolom
            bertumpuk supaya baris teks tidak pernah menyempit sampai sulit
            dibaca. `items-start` menjaga tiap jendela setinggi isinya sendiri
            (bukan diregangkan setinggi baris grid). */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-10">
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
                      <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.1" />
                    </svg>
                  </span>
                </div>

                {win.media ?? (
                  <ol className="font-system flex flex-col gap-3 px-5 py-5 text-[15px] leading-relaxed md:px-6 md:py-6 md:text-base">
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
    </section>
  );
}
