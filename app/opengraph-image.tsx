/**
 * OG image homepage (M7 §3.4 / AC "OG image unik per halaman").
 *
 * Halaman `/works/[slug]` punya OG-nya sendiri (app/works/[slug]/opengraph-image.tsx)
 * yang meng-override file ini untuk rute anaknya. Jadi homepage dan tiap case
 * study menghasilkan gambar berbeda — bukan satu og:image generik seperti
 * pitfall referensi (DESIGN §10 #1).
 *
 * Dirender satori, bukan browser: hanya inline style, dan setiap elemen dengan
 * >1 anak wajib punya display:flex.
 */

import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Umar Muhdhor — iOS Developer';

// Selaras dengan token DESIGN §2.1 (cream / ink / accent coral).
const CREAM = '#f7f1ed';
const INK = '#0a0a0a';
const ACCENT = '#ff5d3b';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: CREAM,
        padding: 72,
        position: 'relative',
      }}
    >
      {/* Blok aksen — motif visual yang sama dengan OG case study. */}
      <div
        style={{
          position: 'absolute',
          top: -140,
          right: -120,
          width: 540,
          height: 540,
          borderRadius: 270,
          background: ACCENT,
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -200,
          left: -120,
          width: 460,
          height: 460,
          borderRadius: 230,
          background: ACCENT,
          opacity: 0.22,
        }}
      />

      <div style={{ display: 'flex', fontSize: 26, letterSpacing: 6, color: INK, opacity: 0.6 }}>
        UMAR — PORTFOLIO
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 88,
            fontWeight: 700,
            color: INK,
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          Mobile apps, built end to end.
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 28,
            letterSpacing: 2,
            color: INK,
            opacity: 0.65,
          }}
        >
          iOS Developer · Swift & Flutter
        </div>
      </div>

      <div style={{ display: 'flex', width: 220, height: 10, background: ACCENT }} />
    </div>,
    size,
  );
}
