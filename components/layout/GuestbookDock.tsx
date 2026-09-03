'use client';

/**
 * Guestbook dock — panel mengambang di pojok kanan atas (pola chat widget),
 * bukan section di dalam halaman.
 *
 * Kenapa di layout, bukan di app/page.tsx: dock ini chrome global sejajar
 * NavPill/HonorsBadge, jadi ia ikut hidup di halaman case study juga. Karena
 * `fixed`, ia tak menyentuh koreografi sticky-stacking homepage sama sekali.
 *
 * Kontrak dengan server (app/api/guestbook/route.ts): semua penjagaan
 * (honeypot, filter, rate limit) ada di sana. Validasi di file ini murni untuk
 * umpan balik cepat — keduanya memanggil `validateEntry` yang sama supaya
 * pesannya tidak berbeda antara yang dicegah di browser dan yang ditolak server.
 *
 * A11y:
 *  - tombol pemicu `aria-expanded` + `aria-controls`, Escape menutup dan
 *    mengembalikan fokus ke tombol (pola sama dengan NavPill);
 *  - panel `role="dialog"` non-modal: halaman di belakangnya tetap bisa dibaca
 *    dan di-scroll, jadi tidak perlu focus trap — cukup fokus awal ke input;
 *  - status kirim & error hidup di satu region `aria-live="polite"`;
 *  - daftar catatan `<ol>` dengan `<time dateTime>`.
 */

import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BODY_MAX, NICKNAME_MAX, validateEntry, type GuestbookEntry } from '@/lib/guestbook';
import { announceDockOpen, onOtherDockOpen } from '@/lib/dock';

/**
 * Waktu relatif ringkas. Sengaja dihitung di client: "2 hours ago" yang
 * dirender server akan membeku di HTML statis dan salah begitu halaman di-cache.
 */
const RTF = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

function relativeTime(iso: string): string {
  const diffSec = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diffSec < 45) return 'just now';
  for (const [unit, sec] of UNITS) {
    if (diffSec >= sec) return RTF.format(-Math.round(diffSec / sec), unit);
  }
  return 'just now';
}

/**
 * Warna avatar diturunkan dari nama, bukan diacak: pengunjung yang memakai nama
 * sama selalu dapat warna sama, jadi rangkaian catatan dari satu orang terbaca
 * sebagai satu orang tanpa perlu menyimpan identitas apa pun.
 */
function hueFrom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  return hash;
}

function Avatar({ name }: { name: string }) {
  const hue = hueFrom(name);
  return (
    <span
      aria-hidden
      className="font-display mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold"
      style={{
        background: `hsl(${hue} 60% 22%)`,
        color: `hsl(${hue} 85% 78%)`,
        boxShadow: `inset 0 0 0 1px hsl(${hue} 60% 40% / 0.5)`,
      }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

type Status =
  { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string };

function Note({ entry }: { entry: GuestbookEntry }) {
  const name = entry.nickname ?? 'Anonymous';
  return (
    <li className="flex gap-3 px-4 py-2.5">
      <Avatar name={name} />
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-2">
          <span className="font-system truncate text-sm font-semibold text-white/90">{name}</span>
          <time
            dateTime={entry.created_at}
            className="font-system shrink-0 text-[0.6875rem] text-white/60"
          >
            {relativeTime(entry.created_at)}
          </time>
        </p>
        {/* `whitespace-pre-line` menghormati baris baru pengirim — server sudah
            memadatkan deret >2, jadi tak bisa dipakai merusak layout. */}
        <p className="font-body text-[0.875rem] leading-relaxed break-words whitespace-pre-line text-white/75">
          {entry.body}
        </p>
      </div>
    </li>
  );
}

export function GuestbookDock() {
  const panelId = useId();
  const reduce = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  /**
   * Server memberi tahu env Supabase-nya kosong → seluruh dock tidak dirender.
   *
   * Beda dari `loadError` yang menawarkan Retry: di sini tidak ada yang bisa
   * dicoba ulang, jadi menampilkan pil yang setiap kali dibuka hanya bisa gagal
   * lebih buruk daripada tidak menampilkannya sama sekali. Fitur mati diam-diam,
   * persis seperti LiveCursors saat env-nya kosong.
   */
  const [disabled, setDisabled] = useState(false);

  const [nickname, setNickname] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  /**
   * Muat catatan. Ditulis sebagai efek yang bergantung pada `reloadKey`, bukan
   * fungsi `load()` yang dipanggil dari mana-mana: pemuatan awal, tombol Retry,
   * dan pembukaan panel semuanya cukup menaikkan key, jadi hanya ADA SATU tempat
   * yang memulai fetch dan tak ada dua request balapan menulis state.
   */
  useEffect(() => {
    const controller = new AbortController();

    // `cache: 'no-store'` wajib: tanpa itu browser bisa menyajikan daftar lama
    // setelah user mengirim catatan dari tab lain.
    fetch('/api/guestbook', { cache: 'no-store', signal: controller.signal })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? 'request failed');
        return json as { entries: GuestbookEntry[]; disabled?: boolean };
      })
      .then(({ entries: list, disabled: off }) => {
        if (off) setDisabled(true);
        setEntries(list);
        setLoadError(null);
        setLoading(false);
      })
      .catch((error: unknown) => {
        // Abort bukan kegagalan — request penggantinya sudah jalan, dan menulis
        // error di sini akan menimpa hasilnya.
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setLoadError('Could not load the guestbook right now.');
        setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  // Escape menutup + kembalikan fokus ke tombol pemicu.
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  /**
   * Sembunyikan HonorsBadge selama panel terbuka — badge itu menempel di tepi
   * kanan pada mid-height dan panel melewatinya di viewport pendek. Dilakukan
   * lewat atribut di <body> (pola yang sama dengan `data-at-contact`) supaya
   * aturan sembunyinya tetap satu tempat: globals.css.
   */
  useEffect(() => {
    document.body.dataset.guestbookOpen = open ? 'true' : 'false';
    return () => {
      delete document.body.dataset.guestbookOpen;
    };
  }, [open]);

  /**
   * Buka/tutup. Refresh data dipicu DI LUAR updater `setOpen` — updater harus
   * murni (React memanggilnya dua kali di StrictMode), jadi menaruh
   * `setReloadKey` di dalamnya membuat setiap pembukaan menembak dua fetch.
   */
  function toggle() {
    if (!open) {
      setReloadKey((key) => key + 1);
      // Panel assistant di pojok kiri atas selebar ini juga — di layar sempit
      // keduanya bertindih, jadi yang dibuka belakangan menutup yang lain.
      announceDockOpen('guestbook');
    }
    setOpen((wasOpen) => !wasOpen);
  }

  // Dock lain terbuka → tutup diri.
  useEffect(() => onOtherDockOpen('guestbook', () => setOpen(false)), []);

  // Daftar dirender terbaru-di-bawah (arah baca chat), jadi setiap kali isinya
  // berubah atau panel dibuka, gulir ke dasar.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [open, entries]);

  async function submit() {
    if (status.kind === 'sending') return;

    const local = validateEntry(nickname, body);
    if (!local.ok) {
      setStatus({ kind: 'error', message: local.error });
      return;
    }

    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          nickname: local.value.nickname,
          body: local.value.body,
          website: honeypotRef.current?.value ?? '',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? 'Could not save your note. Try again.');

      // `entry` bisa null kalau honeypot terisi — server membalas 201 palsu.
      // Perlakukan sebagai sukses di UI, tanpa menambah apa pun ke daftar.
      if (json.entry) setEntries((prev) => [json.entry as GuestbookEntry, ...prev]);
      setBody('');
      setStatus({ kind: 'sent' });
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Could not save your note. Try again.',
      });
    }
  }

  // DI BAWAH semua hook — early return di atasnya akan membuat jumlah hook
  // berubah antar render dan React melempar.
  if (disabled) return null;

  const sending = status.kind === 'sending';
  // API mengirim terbaru-dulu; panel membacanya seperti chat (terbaru di bawah).
  const ordered = [...entries].reverse();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close guestbook' : 'Open guestbook'}
        /* Posisi datang dari baris dock bersama di app/layout.tsx (lihat catatan
           di sana) — tombol ini sengaja BUKAN `fixed` lagi. */
        className="chrome-floating bg-dark text-inverse focus-visible:outline-accent flex shrink-0 items-center gap-2 rounded-[var(--radius-pill)] px-4 py-2.5 shadow-[0_18px_40px_-20px_rgba(10,10,10,0.6)] transition-transform duration-[var(--dur-base)] ease-[var(--ease-smooth)] hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" aria-hidden>
          <path
            d="M21 12a8 8 0 0 1-8 8H7l-4 3v-5.5A8 8 0 1 1 21 12z"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        </svg>
        {/* Label disembunyikan di layar sempit — di sana pil selebar 159px
            memakan hampir separuh baris atas. Ikon + hitungan sudah cukup, dan
            nama lengkapnya tetap terbaca pembaca layar lewat `aria-label`. */}
        <span className="font-system hidden text-sm font-medium sm:inline">Guestbook</span>
        {entries.length > 0 && (
          <span className="bg-accent text-ink font-system rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-semibold tabular-nums">
            {entries.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            id={panelId}
            role="dialog"
            aria-label="Guestbook"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.97 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.9 }}
            // Lebar & tinggi memakai `min()` terhadap viewport, bukan breakpoint:
            // panel harus muat di layar pendek (landscape ponsel) maupun sempit,
            // dan `svh` menghindari lompatan saat bar browser mobile menyusut.
            className="fixed flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-white/12 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.85)]"
            style={{
              // Sedikit lebih terang dari --color-dark, BUKAN `bg-dark` persis:
              // StatementDark memakai warna yang sama, dan panel sewarna latar
              // hanya terbaca lewat bayangan — di layar kontras rendah ia hilang.
              // Selisih 8% putih cukup untuk mengangkatnya tanpa mengubah nada.
              background: 'color-mix(in srgb, var(--color-dark) 92%, #fff)',
              zIndex: 'var(--z-chat)',
              top: 'calc(5rem + env(safe-area-inset-top))',
              right: 'max(1rem, var(--frame-inset))',
              width: 'min(24rem, calc(100vw - 2rem))',
              height: 'min(34rem, calc(100svh - 7rem))',
            }}
          >
            <header className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span aria-hidden className="font-display text-lg leading-none text-white/35">
                #
              </span>
              <h2 className="font-system text-inverse text-sm font-semibold">guestbook</h2>
              <p className="font-system ml-auto text-xs text-white/60 tabular-nums">
                {entries.length} {entries.length === 1 ? 'note' : 'notes'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-label="Close guestbook"
                className="focus-visible:outline-accent -mr-1 grid h-7 w-7 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain py-2">
              {loading && (
                <p className="font-system px-4 py-6 text-center text-sm text-white/60">
                  Loading notes…
                </p>
              )}

              {!loading && loadError && (
                <div className="px-4 py-6 text-center">
                  <p className="font-system text-sm text-white/55">{loadError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoading(true);
                      setLoadError(null);
                      setReloadKey((key) => key + 1);
                    }}
                    className="font-system mt-2 text-sm text-white/80 underline underline-offset-4 hover:text-white"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !loadError && ordered.length === 0 && (
                <p className="font-system px-6 py-8 text-center text-sm text-white/60">
                  No notes yet — yours would be the first.
                </p>
              )}

              {ordered.length > 0 && (
                <ol>
                  {ordered.map((entry) => (
                    <Note key={entry.id} entry={entry} />
                  ))}
                </ol>
              )}
            </div>

            <div className="border-t border-white/10 p-3">
              {/* Honeypot — di luar layar, bukan display:none (sebagian bot
                  melewati field yang benar-benar tidak dirender). */}
              <input
                ref={honeypotRef}
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
              />

              <label htmlFor={`${panelId}-nickname`} className="sr-only">
                Your name (optional)
              </label>
              <input
                id={`${panelId}-nickname`}
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={NICKNAME_MAX}
                disabled={sending}
                autoComplete="off"
                placeholder="Signed as Anonymous — add a name?"
                className="font-system focus-visible:border-accent w-full rounded-[var(--radius-badge)] bg-white/[0.04] px-3 py-2 text-xs text-white placeholder:text-white/55 focus-visible:outline-none disabled:opacity-60"
              />

              <div className="mt-2 flex items-end gap-2">
                <label htmlFor={`${panelId}-body`} className="sr-only">
                  Your note
                </label>
                <textarea
                  id={`${panelId}-body`}
                  ref={inputRef}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  onKeyDown={(event) => {
                    // Enter kirim, Shift+Enter baris baru — konvensi kolom chat.
                    // `isComposing` dicek supaya Enter yang menutup kandidat IME
                    // (mis. papan ketik Jepang/Korea) tidak ikut mengirim.
                    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
                      return;
                    }
                    event.preventDefault();
                    void submit();
                  }}
                  maxLength={BODY_MAX}
                  rows={1}
                  disabled={sending}
                  placeholder="Leave a note…"
                  className="font-body focus-visible:border-accent max-h-28 min-h-[2.5rem] flex-1 resize-none rounded-[var(--radius-badge)] border border-white/10 bg-black/25 px-3 py-2.5 text-sm leading-relaxed text-white placeholder:text-white/55 focus-visible:outline-none disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={sending || body.trim().length === 0}
                  aria-label="Post note"
                  className="bg-accent text-ink focus-visible:outline-accent grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-badge)] transition-transform duration-[var(--dur-base)] ease-[var(--ease-smooth)] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                  >
                    <path d="M4 12l16-8-6 16-2.5-6.5L4 12z" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Satu region live untuk sukses & gagal — dua region terpisah
                  membuat pembaca layar mengumumkan dua kali saat state berpindah. */}
              <p
                aria-live="polite"
                className={`font-system mt-2 min-h-[1rem] text-xs ${
                  status.kind === 'error' ? 'text-[var(--color-accent-line)]' : 'text-white/60'
                }`}
              >
                {status.kind === 'error' && status.message}
                {status.kind === 'sent' && 'Posted. Thanks for stopping by.'}
                {status.kind === 'idle' && 'No account needed. Enter to send.'}
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
