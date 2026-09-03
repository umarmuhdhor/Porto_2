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

import { getAllWorks, getWorkBySlug } from '@/lib/works';
import { SERVICES } from '@/content/services';
import { Hero } from '@/components/sections/Hero';
import { StatementDark } from '@/components/sections/StatementDark';
import { AboutWindows } from '@/components/sections/AboutWindows';
import { ValueSection } from '@/components/sections/ValueSection';
import { ServiceList, type ServiceRow } from '@/components/sections/ServiceList';
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

  // Layanan menunjuk project lewat SLUG (content/services.ts); banner-nya
  // diresolusi di sini. `throw` disengaja: slug yang salah ketik akan
  // MENGGAGALKAN BUILD halaman statis ini, bukan diam-diam merender kartu
  // preview kosong yang baru ketahuan setelah rilis.
  const services: ServiceRow[] = SERVICES.map((service) => {
    const work = getWorkBySlug(service.workSlug);
    if (!work) {
      throw new Error(
        `content/services.ts: layanan "${service.label}" menunjuk slug "${service.workSlug}" yang tidak terdaftar di lib/works.ts.`,
      );
    }
    return { label: service.label, preview: work.banner.src, alt: service.alt };
  });

  return (
    // `tabIndex={-1}` bukan hiasan: tanpa itu sebagian browser memindahkan
    // scroll ke target skip link tapi meninggalkan fokus di <body>, jadi Tab
    // berikutnya kembali ke chrome yang baru saja dilewati.
    <main id="main-content" tabIndex={-1} className="relative focus:outline-none">
      {/* 1 — Hero (cream, latar fixed) */}
      <Hero />

      {/* 2 — About windows (accent) — section langsung setelah hero. Latarnya
          SOLID accent dan tepi atasnya dibuka strip krem bertangga saat scroll,
          jadi peralihan hero→section ini yang jadi kejadian pertama halaman.
          Section BIASA (bukan stack-panel): tinggi isinya tumbuh mengikuti
          jumlah baris jendela, jadi tidak boleh dikunci setinggi viewport. */}
      <AboutWindows />

      {/* 3 — Statement (dark) — panel stacking, naik menutupi AboutWindows */}
      <StatementDark />

      {/* 4 — Value / approach (cream) — panel stacking yang naik menutupi
          StatementDark; brush divider-nya yang menandai peralihan gelap→terang
          (DESIGN §3 #3–4). Ini juga SATU-SATUNYA host objek 3D di situs (M4):
          objeknya `absolute` di dalam panel dan progress putarnya diambil dari
          fase hold panel ini. Tanpa section ini di sini, seluruh M4 mati di
          pohon — pernah begitu, dan yang ketahuan cuma lewat audit. */}
      <ValueSection />

      {/* 5 — Service list (cream) — panel stacking + item aktif terikat scroll */}
      <ServiceList services={services} />

      {/* 6 — Project index (cream) — naik menutupi ServiceList. Grid bergaris
          dua kolom; cover project muncul saat hover (M6 §3.3–3.4). */}
      <ProjectIndex projects={projects} />

      {/* 7 — Contact / footer (accent) — mirror referensi: watermark nama,
          avatar pixel-art, CTA kiri, sosial kanan, kredit sudut bawah. */}
      <ContactFooter />
    </main>
  );
}
