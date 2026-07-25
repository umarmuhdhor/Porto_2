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

/** Label seksi/kolom — satu konstanta supaya semua eyebrow di halaman ini sama. */
const LABEL = 'font-system text-muted text-xs tracking-[0.3em] uppercase';

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

        {/* Strip fakta: <dl>, bukan grid <div>, supaya screen reader membaca
            pasangan label→nilai sebagai pasangan. `stack` ikut di sini sebagai
            satu baris penuh — daripada jadi deret pill kedua yang bentuknya
            sama persis dengan services di atasnya. */}
        <dl className="border-ink/10 mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t pt-8 md:mt-16 md:grid-cols-4">
          {work.facts.map((fact) => (
            <div key={fact.label}>
              <dt className={LABEL}>{fact.label}</dt>
              <dd className="font-body mt-2 text-sm leading-snug md:text-base">{fact.value}</dd>
            </div>
          ))}
          {work.stack && (
            <div className="col-span-2 md:col-span-4">
              <dt className={LABEL}>Stack</dt>
              <dd className="font-system mt-2 text-sm md:text-base">{work.stack.join('  ·  ')}</dd>
            </div>
          )}
        </dl>

        <div className="mt-16 grid grid-cols-1 gap-10 md:mt-24 md:grid-cols-2 md:gap-16">
          <section>
            <h2 className={LABEL}>Challenge</h2>
            <p className="font-body mt-4 leading-relaxed md:text-lg">{work.challenge}</p>
          </section>
          <section>
            <h2 className={LABEL}>Role</h2>
            <p className="font-body mt-4 leading-relaxed md:text-lg">{work.role}</p>
          </section>
        </div>

        <section className="mt-16 md:mt-24">
          <h2 className={LABEL}>Approach</h2>
          {/* <ol> karena langkahnya memang berurut — urutannya bagian dari isi,
              dan itu sudah disampaikan oleh <ol> sendiri ke screen reader.
              Angka "01" di tiap item cuma versi terlihatnya, jadi aria-hidden
              supaya tidak dibacakan dua kali. Warnanya accent-line (terakota),
              BUKAN accent: accent itu kuning dan dipakai sebagai LATAR di
              sistem ini — sebagai teks di atas cream nyaris tidak terbaca. */}
          <ol className="mt-6 grid grid-cols-1 gap-8 md:mt-8 md:grid-cols-3 md:gap-10">
            {work.approach.map((step, i) => (
              <li key={step.title} className="border-ink/10 border-t pt-5">
                <span
                  aria-hidden="true"
                  className="font-display text-accent-line block text-sm leading-none font-bold"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display mt-3 text-lg leading-tight font-bold md:text-xl">
                  {step.title}
                </h3>
                <p className="font-body text-ink/80 mt-3 leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16 md:mt-24">
          <h2 className={LABEL}>Outcome</h2>
          <dl className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3 md:mt-8 md:gap-10">
            {work.outcomes.map((outcome) => (
              // flex-col-reverse: DOM tetap <dt> lalu <dd> (urutan yang sah di
              // <dl>, dan yang dibaca screen reader sebagai "label → nilai"),
              // sementara secara visual angkanya yang tampil duluan di atas
              // keterangannya. Alternatifnya menduplikasi label jadi <dt
              // class="sr-only">, yang membuat screen reader membacanya dua kali.
              <div key={outcome.label} className="border-ink/10 flex flex-col-reverse border-t pt-5">
                <dt className="font-body text-muted mt-3 text-sm leading-snug md:text-base">
                  {outcome.label}
                </dt>
                <dd className="font-display text-3xl leading-none font-bold tracking-tight md:text-5xl">
                  {outcome.metric}
                </dd>
              </div>
            ))}
          </dl>
        </section>

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
