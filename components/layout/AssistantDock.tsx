'use client';

/**
 * Assistant dock — panel tanya-jawab mengambang di pojok KANAN atas, berdampingan
 * dengan GuestbookDock. Keduanya chrome global, jadi ia ikut hidup di halaman
 * case study dan tidak menyentuh koreografi sticky-stacking homepage.
 *
 * Posisi pil pemicunya diatur baris dock bersama di app/layout.tsx, bukan di
 * sini — baca catatan di sana sebelum menambahkan `fixed`/`right` kembali.
 *
 * OTAKNYA DI lib/chatbot.ts dan semuanya hardcoded: tidak ada route API, tidak
 * ada model bahasa, tidak ada kunci rahasia. Komponen ini murni lapisan tampilan
 * — ia mencocokkan masukan lewat `matchTopic` lalu menampilkan jawaban yang
 * sudah ditulis. Menambah pengetahuan = mengedit TOPICS, bukan file ini.
 *
 * SATU PANEL PADA SATU WAKTU: dock ini dan guestbook sama-sama `fixed` selebar
 * `min(24rem, 100vw - 2rem)` dan kini berlabuh di tepi kanan yang SAMA, jadi
 * dua panel terbuka bersamaan akan bertindih persis. Saat salah satunya dibuka
 * ia menyiarkan event `dock:open`, dan yang lain menutup diri. Dipakai window
 * event, bukan state bersama, supaya kedua dock tetap bisa berdiri sendiri
 * tanpa provider baru di layout.
 *
 * A11y:
 *  - tombol pemicu `aria-expanded` + `aria-controls`, Escape menutup dan
 *    mengembalikan fokus ke tombol (pola sama dengan NavPill & guestbook);
 *  - panel `role="dialog"` non-modal — halaman di belakang tetap terbaca;
 *  - transkrip `role="log"` + `aria-live="polite"`: tiap jawaban baru dibacakan
 *    sekali, tanpa mengulang seluruh percakapan;
 *  - chip saran adalah <button> sungguhan, jadi seluruh percakapan bisa
 *    dijalankan tanpa mengetik sama sekali.
 */

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  DEFAULT_CHIPS,
  FALLBACK,
  GREETING,
  chipsFor,
  matchTopic,
  topicById,
  type Chip,
  type ChatLink,
} from '@/lib/chatbot';
import { announceDockOpen, onOtherDockOpen } from '@/lib/dock';

/** Batas ketik — jawaban tidak pernah butuh lebih, dan ini menahan paste raksasa. */
const INPUT_MAX = 200;

/**
 * Jeda "sedang mengetik". Jawaban sebetulnya tersedia seketika (sinkron), tapi
 * balasan yang muncul di frame yang sama dengan pertanyaan terbaca seperti
 * halaman yang berkedip, bukan seperti percakapan. Di reduced-motion jeda ini
 * dihapus: indikator berdenyut adalah gerakan yang tidak diminta.
 */
const THINKING_MS = 420;

type Message = {
  id: number;
  from: 'bot' | 'user';
  text: string;
  links?: ChatLink[];
  chips?: Chip[];
};

const OPENING: Message = {
  id: 0,
  from: 'bot',
  text: GREETING,
  chips: chipsFor(DEFAULT_CHIPS),
};

function Bubble({ message }: { message: Message }) {
  const mine = message.from === 'user';
  return (
    <li className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-[var(--radius-badge)] px-3 py-2 ${
          mine ? 'bg-accent text-ink' : 'bg-white/[0.07] text-white/85'
        }`}
      >
        {/* `whitespace-pre-line`: sebagian jawaban memakai daftar berpoin yang
            dipisah baris baru di lib/chatbot.ts. */}
        <p className="font-body text-[0.875rem] leading-relaxed break-words whitespace-pre-line">
          {message.text}
        </p>

        {message.links && message.links.length > 0 && (
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {message.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                {...(link.href.startsWith('http')
                  ? { target: '_blank', rel: 'noreferrer noopener' }
                  : {})}
                className="font-system focus-visible:outline-accent text-[0.8125rem] underline underline-offset-4 opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {link.label}
              </a>
            ))}
          </p>
        )}
      </div>
    </li>
  );
}

export function AssistantDock() {
  const panelId = useId();
  const reduce = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([OPENING]);
  const [thinking, setThinking] = useState(false);
  const [draft, setDraft] = useState('');

  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  /** Sumber id pesan. Counter, bukan acak: id harus stabil antar render. */
  const seq = useRef(0);
  /** Timer "sedang mengetik" yang sedang jalan — dibatalkan saat unmount. */
  const timer = useRef<number | null>(null);

  const nextId = () => (seq.current += 1);

  /** Balas satu topik (dari ketikan atau chip) setelah jeda mengetik. */
  const respond = useCallback(
    (topicId: string | null) => {
      if (timer.current !== null) window.clearTimeout(timer.current);

      const topic = topicId ? topicById(topicId) : null;
      const reply: Message = topic
        ? {
            id: nextId(),
            from: 'bot',
            text: topic.answer,
            links: topic.links,
            chips: chipsFor(topic.next ?? DEFAULT_CHIPS),
          }
        : {
            id: nextId(),
            from: 'bot',
            text: FALLBACK,
            chips: chipsFor(DEFAULT_CHIPS),
          };

      if (reduce) {
        setMessages((prev) => [...prev, reply]);
        return;
      }

      setThinking(true);
      timer.current = window.setTimeout(() => {
        timer.current = null;
        setThinking(false);
        setMessages((prev) => [...prev, reply]);
      }, THINKING_MS);
    },
    [reduce],
  );

  /** Kirim ketikan bebas — dicocokkan ke topik, null berarti jawaban fallback. */
  const send = useCallback(() => {
    const text = draft.trim();
    if (text.length === 0) return;

    setDraft('');
    setMessages((prev) => [...prev, { id: nextId(), from: 'user', text }]);
    respond(matchTopic(text)?.id ?? null);
  }, [draft, respond]);

  /**
   * Chip diklik: labelnya dimasukkan sebagai pesan user supaya transkrip tetap
   * terbaca sebagai percakapan, lalu dijawab LEWAT ID — bukan dicocokkan ulang
   * dari labelnya. Label ditulis untuk manusia, dan menyerahkannya ke matcher
   * membuat chip bisa mendarat di topik lain begitu sebuah label diedit.
   */
  const askChip = useCallback(
    (chip: Chip) => {
      setMessages((prev) => [...prev, { id: nextId(), from: 'user', text: chip.label }]);
      respond(chip.id);
    },
    [respond],
  );

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

  // Dock lain terbuka → tutup diri.
  useEffect(() => onOtherDockOpen('assistant', () => setOpen(false)), []);

  // Timer tidak boleh menembak setelah komponen hilang (navigasi antar halaman).
  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  // Transkrip dibaca terbaru-di-bawah: tiap pesan/indikator baru gulir ke dasar.
  useEffect(() => {
    if (!open) return;
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [open, messages, thinking]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  /**
   * Buka/tutup. Penyiaran dilakukan DI LUAR updater `setOpen` — updater harus
   * murni (React memanggilnya dua kali di StrictMode), dan menyiarkan di dalamnya
   * akan menembakkan event dua kali.
   */
  function toggle() {
    if (!open) announceDockOpen('assistant');
    setOpen((wasOpen) => !wasOpen);
  }

  // Chip hanya ditawarkan pada pesan bot TERAKHIR: chip di pesan lama menawarkan
  // arah percakapan yang sudah lewat dan menumpuk jadi dinding tombol.
  const lastBot = [...messages].reverse().find((message) => message.from === 'bot');

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close the assistant' : 'Ask about Umar'}
        /* Posisi datang dari baris dock bersama di app/layout.tsx — tombol ini
           sengaja BUKAN `fixed` lagi, supaya lebarnya yang berubah-ubah
           (label hilang di bawah `sm`) tidak perlu dikompensasi angka apa pun. */
        className="chrome-floating bg-dark text-inverse focus-visible:outline-accent flex shrink-0 items-center gap-2 rounded-[var(--radius-pill)] px-4 py-2.5 shadow-[0_18px_40px_-20px_rgba(10,10,10,0.6)] transition-transform duration-[var(--dur-base)] ease-[var(--ease-smooth)] hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" aria-hidden>
          <path
            d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9z"
            strokeWidth={1.6}
          />
          <path
            d="M9.4 9.4a2.7 2.7 0 1 1 3.4 3.2c-.5.2-.8.7-.8 1.2v.3"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <path d="M12 17.2h.01" strokeWidth={2.2} strokeLinecap="round" />
        </svg>
        {/* Label disembunyikan di layar sempit — sama seperti guestbook, di sana
            baris atas hanya cukup untuk dua ikon. */}
        <span className="font-system hidden text-sm font-medium sm:inline">Ask about Umar</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            id={panelId}
            role="dialog"
            aria-label="Ask about Umar"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.97 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.9 }}
            className="fixed flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-white/12 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.85)]"
            style={{
              // Sedikit lebih terang dari --color-dark supaya panel tetap terbaca
              // di atas section gelap — alasan yang sama dengan GuestbookDock.
              background: 'color-mix(in srgb, var(--color-dark) 92%, #fff)',
              zIndex: 'var(--z-chat)',
              top: 'calc(5rem + env(safe-area-inset-top))',
              // Panel mengikuti pemicunya yang kini di kanan. Sama persis dengan
              // guestbook, dan itu tidak bertabrakan: kedua dock saling menutup
              // (lihat onOtherDockOpen), jadi tak pernah ada dua panel terbuka.
              right: 'max(1rem, var(--frame-inset))',
              width: 'min(24rem, calc(100vw - 2rem))',
              height: 'min(34rem, calc(100svh - 7rem))',
            }}
          >
            <header className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span aria-hidden className="font-display text-lg leading-none text-white/35">
                ?
              </span>
              <h2 className="font-system text-inverse text-sm font-semibold">ask-about-umar</h2>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-label="Close the assistant"
                className="focus-visible:outline-accent -mr-1 ml-auto grid h-7 w-7 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
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

            <div
              ref={logRef}
              role="log"
              aria-live="polite"
              aria-label="Conversation"
              className="flex-1 overflow-y-auto overscroll-contain px-3 py-3"
            >
              <ul className="flex flex-col gap-2">
                {messages.map((message) => (
                  <Bubble key={message.id} message={message} />
                ))}

                {thinking && (
                  <li className="flex justify-start">
                    <span
                      className="font-system rounded-[var(--radius-badge)] bg-white/[0.07] px-3 py-2 text-sm text-white/70"
                      aria-label="Typing"
                    >
                      …
                    </span>
                  </li>
                )}
              </ul>

              {lastBot?.chips && lastBot.chips.length > 0 && !thinking && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {lastBot.chips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => askChip(chip)}
                      className="font-system focus-visible:outline-accent rounded-[var(--radius-pill)] border border-white/15 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2">
                <label htmlFor={`${panelId}-input`} className="sr-only">
                  Ask a question about Umar
                </label>
                <input
                  id={`${panelId}-input`}
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    // `isComposing` dicek supaya Enter yang menutup kandidat IME
                    // tidak ikut mengirim (pola sama dengan guestbook).
                    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
                    event.preventDefault();
                    send();
                  }}
                  maxLength={INPUT_MAX}
                  autoComplete="off"
                  placeholder="Ask something…"
                  className="font-body focus-visible:border-accent min-h-[2.5rem] flex-1 rounded-[var(--radius-badge)] border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white placeholder:text-white/55 focus-visible:outline-none"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={draft.trim().length === 0}
                  aria-label="Send question"
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

              {/* Jujur soal sifat bot ini, di tempat yang tak bisa dilewatkan:
                  jawabannya terbatas, dan orang yang butuh lebih tahu harus
                  langsung diarahkan ke Umar sendiri. */}
              <p className="font-system mt-2 text-xs text-white/60">
                Scripted answers, not AI — anything else, email Umar.
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
