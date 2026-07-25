/**
 * Section penutup / kontak (mirror referensi):
 *  - latar accent (kuning) + medan titik halus
 *  - nama raksasa sebagai watermark tonal di belakang
 *  - avatar pixel-art berdiri di atas garis pembatas
 *  - kiri-bawah: CTA "Let's build something MEANINGFUL AND MEMORABLE"
 *  - kanan-bawah: "Reach out" + tombol ikon sosial
 *  - baris kredit di dua sudut bawah
 *
 * Layout flex-column supaya proporsional lintas lebar; padding tepi memakai
 * --frame-inset agar sejajar dengan frame global & badge Honors.
 */

import { PixelAvatar } from '@/components/ui/PixelAvatar';
import { ContactChromeToggle } from '@/components/sections/ContactChromeToggle';

const EMAIL = 'muhdhorcs@gmail.com';
// Default diturunkan dari handle git user ("umarmuhdhor"). VERIFIKASI &
// ganti bila handle sosial aslinya berbeda — cukup ubah dua konstanta ini.
const HANDLE = 'umarmuhdhor';
const INSTAGRAM = `https://instagram.com/${HANDLE}`;
const LINKEDIN = `https://www.linkedin.com/in/${HANDLE}`;

const FRAME = { paddingInline: 'var(--frame-inset)' };

function IconButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="border-ink text-ink hover:bg-ink hover:text-accent focus-visible:outline-ink flex h-11 w-11 items-center justify-center rounded-xl border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 md:h-12 md:w-12"
    >
      {children}
    </a>
  );
}

export function ContactFooter() {
  return (
    <footer
      style={FRAME}
      className="bg-accent text-ink page-section relative flex min-h-screen flex-col overflow-hidden"
    >
      <ContactChromeToggle />
      {/* Medan titik halus (mirror referensi) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(10,10,10,0.10) 1.4px, transparent 1.4px)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* Panggung: watermark nama + avatar berdiri di atas garis */}
      <div className="relative flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[6%] flex flex-col items-center leading-[0.8] text-black/[0.07]"
        >
          <span className="font-display text-[16vw] font-bold tracking-tight">UMAR</span>
          <span className="font-display text-[16vw] font-bold tracking-tight">MUHDHOR</span>
        </div>

        <div className="absolute bottom-0 left-1/2 h-[88%] max-h-[62vh] -translate-x-1/2">
          <PixelAvatar className="h-full w-auto" />
        </div>
      </div>

      {/* Garis pembatas */}
      <div aria-hidden className="h-px w-full bg-black/25" />

      {/* CTA kiri + Reach out kanan */}
      <div className="flex flex-col gap-8 pt-7 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <p className="font-system text-ink/80 text-lg md:text-xl">Let&apos;s build something</p>
          <h2 className="font-display mt-1 text-4xl leading-[0.95] font-bold tracking-tight uppercase sm:text-5xl md:text-6xl lg:text-7xl">
            Meaningful
            <br />
            and Memorable
          </h2>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <p className="font-system text-ink/80 text-base md:text-lg">Reach out</p>
          <div className="flex items-center gap-3">
            <IconButton href={INSTAGRAM} label="Instagram">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
              </svg>
            </IconButton>
            <IconButton href={LINKEDIN} label="LinkedIn">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.8-1.95 3.7-1.95 3.96 0 4.69 2.4 4.69 5.5V21H20v-5.3c0-1.26-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21H12z" />
              </svg>
            </IconButton>
            <IconButton href={`mailto:${EMAIL}`} label="Email">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
              </svg>
            </IconButton>
          </div>
        </div>
      </div>

      {/* Kredit sudut bawah */}
      <div className="font-system text-ink/70 flex items-center justify-between pt-8 pb-6 text-xs sm:text-sm">
        <p>
          Designed in <span className="text-ink font-semibold">Figma</span>
        </p>
        <p>
          Created with <span className="text-ink font-semibold">Claude Code</span>
        </p>
      </div>
    </footer>
  );
}
