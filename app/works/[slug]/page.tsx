/**
 * Template case study `/works/[slug]` (M5).
 *
 * SATU template untuk SEMUA project — tidak ada percabangan per slug. Semua
 * yang berbeda antar project hidup di content/works/*.ts (PRD G3).
 *
 * SENGAJA TIDAK PAKAI sticky-stacking / 3D (DESIGN §4.6): homepage yang
 * sinematik, case study yang cepat dibaca. Scroll di sini linear, animasinya
 * cuma reveal one-shot per gambar.
 *
 * SSG penuh: generateStaticParams + dynamicParams=false → slug asing 404 di
 * build-time route table, bukan render on-demand.
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllSlugs, getWorkBySlug } from '@/lib/works';
import { BentoGallery } from '@/components/sections/BentoGallery';
import { ServicePillList } from '@/components/ui/ServicePill';
import { ScrollTopButton } from '@/components/ui/ScrollTopButton';

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) return {};

  // Title & description WAJIB unik per halaman (M5 §1). OG image-nya sendiri
  // di-attach otomatis oleh app/works/[slug]/opengraph-image.tsx.
  const title = `${work.title} — Case Study`;
  return {
    title,
    description: work.description,
    alternates: { canonical: `/works/${work.slug}` },
    openGraph: {
      type: 'article',
      title,
      description: work.description,
      url: `/works/${work.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: work.description,
    },
  };
}

const PAD = { paddingInline: 'var(--frame-inset)' };

const LINK =
  'font-system focus-visible:outline-accent rounded-sm underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4';

export default async function WorkPage({ params }: Params) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) notFound();

  return (
    // <main> tetap selebar viewport dengan padding frame-inset, jadi latar cream
    // penuh dan padding-nya masih dihitung dari lebar layar — sejajar dengan
    // FrameLines global. Yang dibatasi lebarnya cuma KOLOM KONTEN di dalamnya:
    // tanpa itu, gambar galeri ikut melebar di monitor besar dan halaman jadi
    // jauh lebih tinggi tanpa menambah informasi apa pun, sementara baris teks
    // lewat batas nyaman baca.
    <main style={PAD} className="bg-cream text-ink relative pt-28 pb-24 md:pt-36">
      <div className="mx-auto w-full max-w-[1200px]">
        <nav aria-label="Breadcrumb" className="font-system text-muted text-xs md:text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/#projects" className={`${LINK} hover:text-ink`}>
                Projects
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">
              {work.title}
            </li>
          </ol>
        </nav>

        <header className="mt-10 flex flex-col gap-6 md:mt-14 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Logo dekoratif — judulnya sudah ada sebagai teks di sebelahnya,
                jadi alt kosong supaya screen reader tidak membaca dua kali. */}
            <Image
              src={work.logo}
              alt=""
              width={64}
              height={64}
              className="rounded-[var(--radius-badge)]"
            />
            <h1 className="font-display text-4xl leading-none font-bold tracking-tight md:text-6xl">
              {work.title}
            </h1>
          </div>
          <p className="font-system text-muted text-xs tracking-[0.2em] uppercase md:pt-3 md:text-right">
            {work.category}
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            {work.year}
          </p>
        </header>

        <p className="font-body mt-10 max-w-3xl text-lg leading-relaxed md:mt-14 md:text-2xl">
          {work.summary.map((segment, i) =>
            segment.strong ? (
              <strong key={i} className="font-semibold">
                {segment.text}
              </strong>
            ) : (
              <span key={i}>{segment.text}</span>
            ),
          )}
        </p>

        <ServicePillList items={work.services} />

        <div className="mt-16 grid grid-cols-1 gap-10 md:mt-24 md:grid-cols-2 md:gap-16">
          <section>
            <h2 className="font-system text-muted text-xs tracking-[0.3em] uppercase">Challenge</h2>
            <p className="font-body mt-4 leading-relaxed md:text-lg">{work.challenge}</p>
          </section>
          <section>
            <h2 className="font-system text-muted text-xs tracking-[0.3em] uppercase">Role</h2>
            <p className="font-body mt-4 leading-relaxed md:text-lg">{work.role}</p>
          </section>
        </div>

        <BentoGallery banner={work.banner} items={work.gallery} />

        <nav
          aria-label="Case study navigation"
          className="border-ink/10 mt-20 flex items-center justify-between border-t pt-8 md:mt-28"
        >
          <Link href="/#projects" className={`${LINK} text-ink hover:text-accent`}>
            ← Go back to projects
          </Link>
          <ScrollTopButton className={`${LINK} text-muted hover:text-ink cursor-pointer`} />
        </nav>
      </div>
    </main>
  );
}
