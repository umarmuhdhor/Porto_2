/**
 * Homepage — koreografi sticky-stacking (M2).
 *
 * URUTAN & PERAN section mengikuti DESIGN §3. Yang penting secara teknis:
 * SEMUA section adalah direct child dari <main>. Panel `.stack-panel` nempel
 * di top:0 sampai batas <main>, sehingga section berikutnya (yang berlatar
 * solid & lebih belakang di DOM) naik menutupinya — itu efek stacking-nya.
 * Membungkus panel dalam wrapper sendiri akan mematahkan efek ini.
 * Detail lengkap: components/ui/StackSection.tsx.
 */

import { getAllWorks } from '@/lib/works';
import { Hero } from '@/components/sections/Hero';
import { StatementDark } from '@/components/sections/StatementDark';
import { ServiceList } from '@/components/sections/ServiceList';
import { ProjectIndex, type ProjectRow } from '@/components/sections/ProjectIndex';
import { BrushDivider } from '@/components/ui/BrushDivider';

const PAD = { paddingInline: 'var(--frame-inset)' };

export default function Home() {
  // Data project di-load di server (RSC) lalu diserahkan ke ProjectIndex (client)
  // sebagai baris siap-render — komponen interaktif tak perlu tahu loader-nya.
  const projects: ProjectRow[] = getAllWorks().map((work) => ({
    slug: work.slug,
    title: work.title,
    category: work.category,
    year: work.year,
    preview: work.banner.src,
    previewAlt: work.banner.alt,
  }));

  return (
    <main className="relative">
      {/* 1 — Hero (cream, latar fixed) */}
      <Hero />

      {/* 2 — Statement (dark) — panel stacking */}
      <StatementDark />

      {/* 3 — Service list (cream) — panel stacking + item aktif terikat scroll */}
      <ServiceList />

      {/* 5 — Project index (cream) — naik menutupi ServiceList. Cursor-follow
          preview di desktop, thumbnail statis di touch (M6 §3.3–3.4). */}
      <ProjectIndex projects={projects} />

      {/* 6 — Footer (accent) — batas cream→accent pakai brush divider */}
      <footer
        style={PAD}
        className="page-section bg-accent-soft text-ink relative flex min-h-screen flex-col items-center justify-center"
      >
        <BrushDivider className="text-accent-soft" />
        <h2 className="font-display text-center text-4xl font-bold tracking-tight md:text-6xl">
          Let&apos;s build something memorable
        </h2>
        <a
          className="font-system focus-visible:outline-ink mt-6 text-lg underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          href="mailto:muhdhorcs@gmail.com"
        >
          Reach out
        </a>

        {/* Credit line — proses kerja AKTUAL sendiri (M7 §3.6). Bukan copy klaim
            referensi: situs ini memang dirancang di Figma & dibangun dengan
            Next.js. /80 di atas accent ≈ 5.3:1 untuk teks kecil (WCAG AA;
            /70 turun ke ~4.4:1, di bawah ambang).

            bottom-24 (bukan bottom-8): NavPill global fixed di bottom-center
            (~24–68px dari dasar) — credit di bottom-8 tertimpa pill (terlihat di
            QA M7). Dinaikkan ke 96px supaya lolos di atas pill di semua lebar. */}
        <p className="font-system text-ink/80 absolute inset-x-0 bottom-24 text-center text-xs tracking-[0.15em] uppercase">
          Designed in Figma · Built with Next.js &amp; GSAP
        </p>
      </footer>
    </main>
  );
}
