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
import { AboutWindows } from '@/components/sections/AboutWindows';
import { ServiceList } from '@/components/sections/ServiceList';
import { ProjectIndex, type ProjectRow } from '@/components/sections/ProjectIndex';
import { ContactFooter } from '@/components/sections/ContactFooter';

export default function Home() {
  // Data project di-load di server (RSC) lalu diserahkan ke ProjectIndex (client)
  // sebagai baris siap-render — komponen interaktif tak perlu tahu loader-nya.
  const projects: ProjectRow[] = getAllWorks().map((work) => ({
    slug: work.slug,
    title: work.title,
    category: work.category,
    year: work.year,
    logo: work.logo,
    preview: work.banner.src,
    previewAlt: work.banner.alt,
  }));

  return (
    <main className="relative">
      {/* 1 — Hero (cream, latar fixed) */}
      <Hero />

      {/* 2 — Statement (dark) — panel stacking */}
      <StatementDark />

      {/* 2b — About windows (cream) — panel jendela yang bisa digeser & muncul
          satu per satu mengikuti scroll. Section BIASA (bukan stack-panel):
          isinya tumbuh mengikuti jumlah baris, jadi tidak boleh dikunci setinggi
          viewport. Ia tetap naik menutupi StatementDark karena urutan DOM. */}
      <AboutWindows />

      {/* 3 — Service list (cream) — panel stacking + item aktif terikat scroll */}
      <ServiceList />

      {/* 5 — Project index (cream) — naik menutupi ServiceList. Grid bergaris
          dua kolom; cover project muncul saat hover (M6 §3.3–3.4). */}
      <ProjectIndex projects={projects} />

      {/* 6 — Contact / footer (accent) — mirror referensi: watermark nama,
          avatar pixel-art, CTA kiri, sosial kanan, kredit sudut bawah. */}
      <ContactFooter />
    </main>
  );
}
