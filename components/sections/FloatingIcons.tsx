'use client';

/**
 * Ikon brand melayang di section dark (mirror referensi §dark: satu ikon di
 * kiri-atas, satu di kanan-atas, mengapit headline yang kini di tengah).
 *
 * Referensi memakai Figma + Claude. Sesuai permintaan, Figma diganti Codex
 * (logomark OpenAI). Aset digambar sebagai inline SVG — bebas file/lisensi
 * eksternal & ikut warna/animasi di satu tempat.
 *
 * ── KENAPA TIDAK WebGL ────────────────────────────────────────────────────
 * Ketebalannya dibangun dari SALINAN BERLAPIS di ruang 3D CSS
 * (`transform-style: preserve-3d` + `translateZ` bertingkat), bukan geometri
 * ter-extrude di three.js. Alasannya aturan di components/three/Scene.tsx:
 * SATU `<Canvas>` untuk seluruh situs, dan canvas itu tinggal di ValueSection.
 * Merender ikon ini sebagai objek nyata berarti context WebGL kedua (plus chunk
 * R3F) demi ornamen selebar 64–96px di belakang headline — pada ukuran itu
 * extrude sungguhan dan tumpukan salinan ini terbaca sama saja.
 *
 * Yang membuatnya benar-benar terbaca sebagai volume, bukan stiker bertumpuk:
 *   - tiap lapis makin gelap ke belakang → sisi extrude,
 *   - lapis sheen di depan → pantulan cahaya di permukaan muka,
 *   - seluruh tumpukan MIRING dan bereaksi ke kursor, jadi lapisannya
 *     ber-parallax satu sama lain (inilah yang tak bisa ditiru drop-shadow).
 *
 * Geometrinya ditulis SEKALI di `<defs>` lalu dipakai ulang tiap lapis lewat
 * `<use href>`: sembilan salinan path OpenAI yang panjang itu akan jadi ~14KB
 * markup yang identik semua.
 *
 * Float pakai CSS keyframes `floaty`; yaw idle & tilt kursor juga hanya hidup
 * di `prefers-reduced-motion: no-preference`. Di reduced-motion ikonnya diam
 * TAPI tetap timbul — kedalaman itu bentuk, bukan gerak.
 *
 * Disembunyikan < md: di lebar kecil headline butuh hampir seluruh kolom.
 */

import { useEffect, useRef, type CSSProperties } from 'react';

/**
 * Banyak lapis penyusun ketebalan. Jaraknya TIDAK dalam px: tiap lapis mundur
 * sepersekian `--size` ikon (lihat `.icon3d-layer` di globals.css), jadi
 * ketebalannya tetap proporsional saat ikon membesar di `lg` — offset px tetap
 * akan terbaca sebagai lempeng tebal di ikon 64px dan lapisan tipis di 96px.
 * 12 lapis: di bawah ~10 sisi extrude-nya mulai terlihat sebagai pita bertingkat
 * saat tumpukan dimiringkan penuh.
 */
const LAYERS = 12;

/** Path logomark OpenAI (dipakai sebagai ikon "Codex") — ditulis sekali di defs. */
const CODEX_PATH =
  'M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071.006l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071-.005l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z';

/** Sunburst Claude — 12 rusuk radial. Sudutnya dibulatkan supaya string yang
    dirender server & klien identik (kalau tidak: hydration mismatch). */
const CLAUDE_RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  const r = (n: number) => Number(n.toFixed(3));
  return {
    x1: r(Math.cos(a) * 5),
    y1: r(Math.sin(a) * 5),
    x2: r(Math.cos(a) * 20),
    y2: r(Math.sin(a) * 20),
  };
});

/**
 * Warna satu lapis. i=0 lapis MUKA (paling terang), i=LAYERS-1 lapis paling
 * belakang. Interpolasi linier di ruang sRGB — cukup untuk gradasi sisi
 * sesempit ini, dan hasilnya angka tetap (bukan color-mix runtime) sehingga
 * markup server & klien sama persis.
 */
type RGB = [number, number, number];

function ramp(face: RGB, deep: RGB) {
  return (i: number) => {
    if (i === 0) return `rgb(${face[0]}, ${face[1]}, ${face[2]})`;
    const t = i / (LAYERS - 1);
    const c = face.map((v, k) => Math.round(v + (deep[k] - v) * t));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  };
}

/** Muka → dasar. Codex meluruh ke abu arang, Claude ke terakota gosong. */
const CODEX_SHADE = ramp([247, 241, 237], [74, 70, 67]);
const CLAUDE_SHADE = ramp([217, 119, 87], [74, 33, 18]);

/**
 * Tumpukan lapis satu ikon: LAYERS salinan geometri yang sama, tiap salinan
 * mundur `LAYER_STEP` px di sumbu z dan makin gelap — itulah sisi extrude-nya —
 * ditutup satu lapis sheen di depan muka.
 *
 * Digambar dari BELAKANG ke depan: dengan preserve-3d urutan cat memang
 * ditentukan z, tapi urutan DOM yang searah menghindari z-fighting saat
 * tumpukan hampir tegak lurus terhadap kamera dan jarak antar lapis (1.7px)
 * mengecil ke nol dalam proyeksi.
 */
function Extruded({
  viewBox,
  shade,
  paint,
}: {
  viewBox: string;
  /** Warna lapis ke-i (0 = muka). */
  shade: (i: number) => string;
  /** Menggambar SATU lapis dengan warna yang sudah dihitung untuk lapis itu. */
  paint: (color: string) => React.ReactNode;
}) {
  return (
    <>
      {Array.from({ length: LAYERS }, (_, n) => {
        const i = LAYERS - 1 - n;
        return (
          <span
            key={i}
            className="icon3d-layer"
            // --l: 0 di muka → 1 di lapis terdalam. CSS yang mengalikannya
            // dengan --size & --depth jadi jarak z sebenarnya.
            style={{ '--l': (i / (LAYERS - 1)).toFixed(4) } as React.CSSProperties}
          >
            <svg viewBox={viewBox} className="h-full w-full">
              {paint(shade(i))}
            </svg>
          </span>
        );
      })}
      {/* Sheen duduk sedikit DI DEPAN muka (--l negatif) supaya ia tidak
          z-fighting dengan lapis muka saat tumpukan hampir tegak lurus. */}
      <span className="icon3d-layer" style={{ '--l': '-0.04' } as React.CSSProperties}>
        <svg viewBox={viewBox} className="h-full w-full">
          {paint('url(#mark-sheen)')}
        </svg>
      </span>
    </>
  );
}

export function FloatingIcons() {
  const rootRef = useRef<HTMLDivElement>(null);

  /**
   * Tilt mengikuti kursor. Yang ditulis cuma DUA custom property di elemen akar
   * (-1..1), lalu CSS-lah yang menurunkannya jadi sudut per ikon lewat
   * `--tilt` masing-masing — jadi tidak ada satu pun getBoundingClientRect per
   * frame, dan menambah ikon ketiga tidak menambah kerja JS sama sekali.
   *
   * Ditulis langsung ke DOM (bukan state) dengan alasan yang sama seperti
   * DarkBackdrop: pointermove menembak puluhan kali per detik.
   */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // Tilt hanya untuk perangkat ber-mouse & yang tidak meminta gerak dikurangi.
    if (
      !window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let raf = 0;
    let px = 0;
    let py = 0;

    const apply = () => {
      raf = 0;
      el.style.setProperty('--px', px.toFixed(3));
      el.style.setProperty('--py', py.toFixed(3));
    };

    const onMove = (e: PointerEvent) => {
      px = (e.clientX / window.innerWidth) * 2 - 1;
      py = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[6] hidden md:block"
    >
      {/* Geometri bersama. `<svg width=0 height=0>` tidak ikut layout; seluruh
          isinya cuma definisi yang dirujuk `<use href>` di tiap lapis. */}
      <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
        <defs>
          <path id="mark-codex" d={CODEX_PATH} />
          <g id="mark-claude" strokeWidth="3" strokeLinecap="round">
            {CLAUDE_RAYS.map((r, i) => (
              <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
            ))}
          </g>
          {/* Sheen: gradien putih yang meluruh, dipakai sebagai lapis paling
              depan. Inilah yang membuat muka ikon terbaca memantul cahaya
              alih-alih rata seperti stiker. */}
          <linearGradient id="mark-sheen" x1="0" y1="0" x2="0.65" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Codex — kiri, setinggi tengah headline (posisi Figma pada referensi) */}
      <div
        className="floaty absolute top-[34%] left-[7%]"
        style={
          {
            '--dur': '8s',
            '--rot': '-8deg',
            '--delay': '0.15s',
            filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.55))',
          } as CSSProperties
        }
      >
        <div
          className="icon3d"
          style={{ '--size': 'clamp(4rem, 5.5vw, 5rem)', '--tilt': 14 } as CSSProperties}
        >
          <div className="icon3d-spin">
            <div className="icon3d-tilt">
              <Extruded
                viewBox="0 0 24 24"
                shade={CODEX_SHADE}
                paint={(color) => <use href="#mark-codex" fill={color} />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Claude — kanan-atas */}
      <div
        className="floaty absolute top-[20%] right-[13%]"
        style={
          {
            '--dur': '6.5s',
            '--rot': '7deg',
            filter: 'drop-shadow(0 14px 28px rgba(217,119,87,0.45))',
          } as CSSProperties
        }
      >
        {/* Tilt-nya lebih besar & yaw-nya berlawanan arah (--spin-dir) supaya
            kedua ikon tidak terbaca sebagai satu benda yang bergerak serempak. */}
        <div
          className="icon3d"
          style={
            {
              '--size': 'clamp(5rem, 6.5vw, 6rem)',
              '--tilt': 18,
              '--spin-dir': -1,
              // Menghadap ke arah berlawanan dari Codex — dua ikon yang miring
              // ke sisi yang sama terbaca seperti satu lembar yang dimiringkan.
              '--base-yaw': '-22deg',
            } as CSSProperties
          }
        >
          <div className="icon3d-spin">
            <div className="icon3d-tilt">
              <Extruded
                viewBox="-24 -24 48 48"
                shade={CLAUDE_SHADE}
                paint={(color) => <use href="#mark-claude" stroke={color} />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
