/**
 * OG image dinamis per case study (M5 §3.5) — WAJIB.
 *
 * Ini perbaikan langsung atas pitfall DESIGN §10 #1: situs referensi memakai
 * SATU og:image generik untuk semua halaman, jadi setiap link project yang
 * di-share terlihat identik. Di sini gambar dibangkitkan dari data project —
 * judul, kategori, tahun, dan `ogAccent` khas project — sehingga tiap slug
 * menghasilkan file yang berbeda.
 *
 * Digenerate saat build (generateStaticParams), bukan per-request.
 *
 * Catatan JSX: ini dirender satori, bukan browser. Hanya inline style, dan
 * setiap elemen dengan >1 anak wajib punya display:flex — tanpa itu build gagal.
 */

import { ImageResponse } from 'next/og';
import { getAllSlugs, getWorkBySlug } from '@/lib/works';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * `alt` harus konstan (dievaluasi statis oleh Next), jadi tidak bisa memuat
 * judul project. Deskripsi spesifik halaman sudah dibawa og:title/og:description
 * di generateMetadata.
 */
export const alt = 'Case study cover';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

const CREAM = '#f7f1ed';
const INK = '#0a0a0a';

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);

  const title = work?.title ?? 'Selected work';
  const category = work?.category ?? 'CASE STUDY';
  const year = work?.year ?? '';
  const accent = work?.ogAccent ?? '#ff5d3b';

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
      {/* Blok aksen — pembeda visual utama antar project saat link di-share. */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          right: -120,
          width: 520,
          height: 520,
          borderRadius: 260,
          background: accent,
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -180,
          left: -80,
          width: 420,
          height: 420,
          borderRadius: 210,
          background: accent,
          opacity: 0.25,
        }}
      />

      <div style={{ display: 'flex', fontSize: 26, letterSpacing: 6, color: INK, opacity: 0.6 }}>
        UMAR — PORTFOLIO
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 96, fontWeight: 700, color: INK, lineHeight: 1 }}>
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 28,
            letterSpacing: 4,
            color: INK,
            opacity: 0.65,
          }}
        >
          {year ? `${category} · ${year}` : category}
        </div>
      </div>

      <div style={{ display: 'flex', width: 220, height: 10, background: accent }} />
    </div>,
    size,
  );
}
