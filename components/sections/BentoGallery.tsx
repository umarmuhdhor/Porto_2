/**
 * Bento gallery case study (M5 §3.3 #6, DESIGN §4.6).
 *
 * ATURAN RASIO: rasio TIDAK datang dari data. `span: 'full'` selalu 16/9 dan
 * `span: 'half'` selalu 3/2, dikunci di sini. Kalau tiap project bebas memilih
 * rasio, grid akan compang-camping antar case study — dan itu justru masalah
 * yang mau dihindari (M5 §5). Gambar diisi `object-cover`, jadi aset boleh
 * sedikit meleset dari rasio slot tanpa merusak grid.
 *
 * Gap sengaja ada dan konsisten (bukan gap 0) — kartu radius-card butuh ruang
 * agar terbaca sebagai kartu.
 *
 * Server component: tidak ada state di sini. Yang butuh klien cuma <Reveal>.
 */

import Image from 'next/image';
import type { GalleryItem } from '@/lib/works';
import { Reveal } from '@/components/ui/Reveal';

const SHELL = 'relative overflow-hidden rounded-[var(--radius-card)] bg-ink/5';

function GalleryImage({
  src,
  alt,
  priority = false,
  sizes,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
      // Aset placeholder saat ini .svg — dilewatkan apa adanya oleh optimizer
      // (lihat images.dangerouslyAllowSVG di next.config.ts).
    />
  );
}

/**
 * Stagger dihitung dari POSISI KOLOM, bukan dari index item. Index salah begitu
 * ada item full-width di tengah daftar: item sesudahnya bergeser kolom, dan
 * kartu kanan bisa muncul lebih dulu daripada kartu kiri di baris yang sama.
 * Item full-width mereset hitungan kolom dan tidak pernah menunggu.
 */
function staggerDelays(items: readonly GalleryItem[]): number[] {
  let column = 0;
  return items.map((item) => {
    if (item.span === 'full') {
      column = 0;
      return 0;
    }
    const delay = column * 90;
    column = (column + 1) % 2;
    return delay;
  });
}

export function BentoGallery({
  banner,
  items,
}: {
  banner: { src: string; alt: string };
  items: readonly GalleryItem[];
}) {
  const delays = staggerDelays(items);

  return (
    <section aria-label="Project gallery" className="mt-16 md:mt-24">
      {/* Banner: satu-satunya gambar yang di-priority — ia yang paling mungkin
          jadi LCP halaman ini, dan ia tidak pakai reveal supaya tidak menahan
          paint pertama di belakang JS. */}
      <div className={`${SHELL} aspect-[16/9]`}>
        {/* sizes dipatok ke lebar nyata slot (main dibatasi max-w-[1200px] dikurangi
            frame-inset), bukan cuma vw — supaya browser tidak menurunkan aset
            3840px di monitor lebar. */}
        <GalleryImage
          src={banner.src}
          alt={banner.alt}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1080px"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:grid-cols-2 md:gap-6">
        {items.map((item, i) => (
          <Reveal
            key={item.src}
            className={item.span === 'full' ? 'md:col-span-2' : undefined}
            delay={delays[i]}
          >
            <figure
              className={`${SHELL} ${item.span === 'full' ? 'aspect-[16/9]' : 'aspect-[3/2]'}`}
            >
              <GalleryImage
                src={item.src}
                alt={item.alt}
                sizes={
                  item.span === 'full'
                    ? '(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1080px'
                    : '(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 528px'
                }
              />
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
