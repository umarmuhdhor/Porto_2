/**
 * Halaman pesan layar-penuh — dipakai 404 (`app/not-found.tsx`) dan kedua error
 * boundary (`app/error.tsx`, `app/global-error.tsx`).
 *
 * Satu komponen untuk ketiganya, bukan tiga markup terpisah: halaman-halaman
 * ini justru yang paling jarang dilihat saat mengerjakan situs, jadi kalau
 * masing-masing punya salinan sendiri, dua di antaranya akan tertinggal diam-
 * diam setiap kali gaya berubah. Yang berbeda antar ketiganya cuma teks dan
 * tombolnya — itulah yang jadi props.
 *
 * `<main id="main-content">` WAJIB ada di sini: skip link global di
 * app/layout.tsx dirender di setiap rute, dan tanpa target ini ia jadi tautan
 * mati persis di halaman yang paling membingungkan untuk ditemui.
 *
 * Chrome mengambang (NavPill dkk.) tetap hidup di 404 & error non-fatal karena
 * keduanya dirender di dalam layout — pengunjung yang nyasar tetap punya menu.
 */

import type { ReactNode } from 'react';

const LINK =
  'font-system inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-5 py-3 text-xs tracking-[0.2em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 md:text-sm';

/** Tombol utama — isian penuh, kontras tertinggi di halaman. */
export const PRIMARY_ACTION = `${LINK} border-ink bg-ink text-cream hover:bg-transparent hover:text-ink focus-visible:outline-ink`;

/** Tombol sekunder — hanya garis, supaya hierarkinya tak bersaing. */
export const SECONDARY_ACTION = `${LINK} border-ink/20 text-ink hover:border-ink focus-visible:outline-ink`;

interface MessagePageProps {
  /** Penanda besar di atas judul — "404", "500". Dekoratif; dibaca oleh judul. */
  code: string;
  title: string;
  body: string;
  /** Tombol aksi. */
  children: ReactNode;
  /** Detail teknis opsional (digest error) — kecil, di kaki halaman. */
  detail?: string;
}

export function MessagePage({ code, title, body, children, detail }: MessagePageProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      style={{ paddingInline: 'var(--frame-inset)' }}
      className="bg-cream text-ink relative flex min-h-svh flex-col justify-center py-28 focus:outline-none"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        {/* aria-hidden: angkanya diulang kata-per-kata di <h1>, dan screen
            reader yang membaca "404" lalu "Page not found" mengumumkan hal
            yang sama dua kali. */}
        <p
          aria-hidden="true"
          className="font-display text-accent-line text-[clamp(5rem,18vw,12rem)] leading-[0.8] font-bold tracking-tight"
        >
          {code}
        </p>

        <h1 className="font-display mt-6 max-w-3xl text-[clamp(2rem,5vw,3.75rem)] leading-[1.05] font-bold tracking-tight">
          {title}
        </h1>

        <p className="font-body text-ink/70 mt-6 max-w-xl text-base leading-relaxed md:text-lg">
          {body}
        </p>

        <div className="mt-10 flex flex-wrap gap-3">{children}</div>

        {detail && (
          <p className="font-system text-muted mt-12 border-t border-[var(--line-rule)] pt-5 text-xs">
            {detail}
          </p>
        )}
      </div>
    </main>
  );
}
