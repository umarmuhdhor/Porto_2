/**
 * ProjectIndex (M6 §3.3–3.4) — grid project bergaris, mirror referensi:
 * dua kolom yang dipisah garis hairline, tiap sel berisi tahun di atas,
 * logo project di tengah, dan kategori di bawah. Saat hover, cover project
 * memenuhi sel dan pil "View project" muncul.
 *
 * TANPA 'use client' — semuanya CSS hover/focus, tidak ada state. Versi lama
 * memakai framer-motion untuk preview yang mengikuti kursor; grid ini menaruh
 * preview DI DALAM selnya sendiri, jadi tidak ada lagi yang perlu dihitung per
 * mousemove dan bundle client-nya hilang sepenuhnya.
 *
 * Sentuh / tanpa hover: sel tetap menampilkan logo + kategori (cover hanya
 * tambahan), jadi tidak ada informasi yang cuma hidup di state hover. Fokus
 * keyboard memicu efek yang sama lewat `group-focus-visible`.
 */

import Image from 'next/image';
import Link from 'next/link';

export interface ProjectRow {
  slug: string;
  title: string;
  category: string;
  year: string;
  /** Wordmark project — tampil di tengah sel. */
  logo: string;
  preview: string;
  previewAlt: string;
}

const HEADING = 'Curated Projects';

export function ProjectIndex({ projects }: { projects: ProjectRow[] }) {
  return (
    <section
      id="projects"
      className="page-section bg-cream text-ink flex min-h-screen flex-col justify-center py-[12vh]"
      style={{ paddingInline: 'var(--frame-inset)' }}
    >
      <header className="text-center">
        {/* Judul dipecah per huruf supaya tiap huruf bisa melompat & miring
            sendiri saat disentuh kursor — satu-satunya gerakan di section ini
            yang benar-benar dipicu user, bukan scroll.

            `aria-label` di <h2> + `aria-hidden` di pembungkus huruf: tanpa itu
            sebagian screen reader mengeja "C-U-R-A-T-E-D" karena tiap huruf
            jadi kotak inline-block sendiri.

            Murni CSS hover — tidak ada state, jadi file ini tetap tanpa
            'use client' (lihat catatan kepala). */}
        <h2
          aria-label={HEADING}
          className="font-display text-4xl font-bold tracking-tight uppercase md:text-6xl"
        >
          <span aria-hidden>
            {[...HEADING].map((char, i) =>
              char === ' ' ? (
                // Spasi TIDAK dibungkus inline-block: kotak selebar spasi ikut
                // hilang saat baris ter-wrap dan dua kata jadi dempet.
                <span key={i}> </span>
              ) : (
                <span
                  key={i}
                  className="hover:text-accent-line-strong inline-block transition-transform duration-[var(--dur-base)] ease-[var(--ease-smooth)] hover:-translate-y-1.5 hover:rotate-[-7deg] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-0"
                >
                  {char}
                </span>
              ),
            )}
          </span>
        </h2>
        <p className="font-system text-muted mx-auto mt-5 max-w-xl text-base md:text-lg">
          Selection of mobile and iOS development work, built end to end.
        </p>
      </header>

      {/*
       * Garis grid dibentuk dari border tiap sel, bukan `gap` + divider:
       * dengan flex-wrap, jumlah baris tidak diketahui di muka, dan border
       * per sel otomatis membentuk kisi yang benar berapa pun jumlah project.
       * Container menyumbang sisi atas (mobile) & kiri (desktop).
       */}
      <ul className="mt-12 flex flex-col border-t border-[var(--line-rule)] md:mt-16 md:flex-row md:flex-wrap md:border-l">
        {projects.map((project) => (
          <li
            key={project.slug}
            className="w-full border-x border-b border-[var(--line-rule)] md:w-1/2 md:border-x-0 md:border-r"
          >
            <Link
              href={`/works/${project.slug}`}
              className="group focus-visible:outline-accent relative flex min-h-[238px] flex-col items-center justify-between overflow-hidden px-6 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 md:min-h-[348px]"
            >
              {/* Cover — dekoratif (`alt=""`): judul & kategori sudah ada
                  sebagai teks di sel yang sama. */}
              <Image
                src={project.preview}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="scale-[1.06] object-cover opacity-0 transition-[opacity,transform] duration-[var(--dur-slow)] ease-[var(--ease-smooth)] group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
              />
              {/* Scrim tipis di atas cover: tahun & kategori tetap terbaca
                  berapa pun terangnya gambar di belakangnya. */}
              <span
                aria-hidden
                className="bg-cream/35 absolute inset-0 opacity-0 transition-opacity duration-[var(--dur-slow)] ease-[var(--ease-smooth)] group-hover:opacity-100 group-focus-visible:opacity-100"
              />

              <span className="font-system text-muted relative z-[2] text-xs leading-none tracking-wide uppercase md:text-base">
                {project.year}
              </span>

              <span className="relative z-[2] flex w-full flex-1 items-center justify-center">
                <Image
                  src={project.logo}
                  alt={project.title}
                  width={320}
                  height={320}
                  /* Batas TINGGI, bukan cuma lebar: aset logo di sini campur —
                     ada wordmark lebar, ada mark persegi. Kalau hanya lebar yang
                     dibatasi, yang persegi tumbuh setinggi selnya. */
                  className="h-auto max-h-[84px] w-[58%] max-w-[220px] object-contain md:max-h-[104px] md:w-[44%] md:max-w-[280px]"
                />
              </span>

              <span className="font-system relative z-[2] text-xs leading-none tracking-wide uppercase md:text-base">
                {project.category}
              </span>

              {/* Pil CTA — murni dekoratif, seluruh selnya sudah satu link. */}
              <span
                aria-hidden
                /* Ditaruh di 32% tinggi sel, BUKAN dead-center: logo project
                   duduk di tengah, dan pil di titik yang sama akan menutupinya
                   persis saat gambar cover baru muncul. */
                className="text-ink font-system pointer-events-none absolute top-[32%] left-1/2 z-[3] flex -translate-x-1/2 -translate-y-[130%] items-center gap-2 rounded-[var(--radius-pill)] bg-white px-5 py-2.5 text-sm font-medium opacity-0 shadow-[0_12px_28px_-16px_rgba(10,10,10,0.5)] transition-[opacity,transform] duration-[var(--dur-base)] ease-[var(--ease-smooth)] group-hover:-translate-y-1/2 group-hover:opacity-100 group-focus-visible:-translate-y-1/2 group-focus-visible:opacity-100"
              >
                View project
                <svg
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" />
                </svg>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
