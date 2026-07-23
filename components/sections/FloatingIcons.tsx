/**
 * Ikon brand melayang di section dark (mirror referensi §dark: satu ikon di
 * kiri-atas, satu di kanan-atas, mengapit headline yang kini di tengah).
 *
 * Referensi memakai Figma + Claude. Sesuai permintaan, Figma diganti Codex
 * (logomark OpenAI). Aset digambar sebagai inline SVG — bebas file/lisensi
 * eksternal & ikut warna/animasi di satu tempat.
 *
 * Presentasional murni (tanpa state) → server component. Float pakai CSS
 * keyframes `floaty`; otomatis mati di prefers-reduced-motion (guard global).
 * Disembunyikan < md: di lebar kecil headline butuh hampir seluruh kolom.
 */

import type { CSSProperties } from 'react';

/** Logomark OpenAI (dipakai sebagai ikon "Codex"). */
function CodexMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#f7f1ed" aria-hidden>
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071.006l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071-.005l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

/** Logomark Claude — sunburst terakota (stilasi asterisk radial). */
function ClaudeMark({ className = '' }: { className?: string }) {
  const RAYS = 12;
  const inner = 5;
  const outer = 20;
  return (
    <svg viewBox="-24 -24 48 48" className={className} fill="none" aria-hidden>
      {Array.from({ length: RAYS }).map((_, i) => {
        const a = (i / RAYS) * Math.PI * 2;
        // toFixed → string deterministik; tanpa ini digit terakhir cos/sin bisa
        // beda antara render server & client → hydration mismatch.
        const round = (n: number) => Number(n.toFixed(3));
        return (
          <line
            key={i}
            x1={round(Math.cos(a) * inner)}
            y1={round(Math.sin(a) * inner)}
            x2={round(Math.cos(a) * outer)}
            y2={round(Math.sin(a) * outer)}
            stroke="#d97757"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

const CODEX_STYLE: CSSProperties = {
  '--dur': '8s',
  '--rot': '-8deg',
  '--delay': '0.15s',
  filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.45))',
} as CSSProperties;

const CLAUDE_STYLE: CSSProperties = {
  '--dur': '6.5s',
  '--rot': '7deg',
  filter: 'drop-shadow(0 10px 26px rgba(217,119,87,0.35))',
} as CSSProperties;

export function FloatingIcons() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[6] hidden md:block">
      {/* Codex — kiri, setinggi tengah headline (posisi Figma pada referensi) */}
      <div className="floaty absolute top-[34%] left-[7%]" style={CODEX_STYLE}>
        <CodexMark className="h-16 w-16 lg:h-20 lg:w-20" />
      </div>

      {/* Claude — kanan-atas */}
      <div className="floaty absolute top-[20%] right-[13%]" style={CLAUDE_STYLE}>
        <ClaudeMark className="h-20 w-20 lg:h-24 lg:w-24" />
      </div>
    </div>
  );
}
