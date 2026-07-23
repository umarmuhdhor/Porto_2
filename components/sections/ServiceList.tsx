'use client';

/**
 * Service showcase — mirror bagian "services" referensi (nithinmwarrier.com):
 * kolom kiri = intro kecil + daftar layanan besar yang item aktifnya terikat
 * scroll; kolom kanan = mockup browser yang preview project-nya ikut berganti
 * mengikuti item aktif (M2 §3.5, DESIGN §3 #5).
 *
 * Progress fase "hold" panel dipetakan ke index aktif: satu item solid, sisanya
 * pudar, dan mockup memuat preview project yang cocok.
 *
 * A11y (DESIGN §8): status aktif diumumkan lewat `aria-current`, bukan hanya
 * warna. Mockup murni dekoratif (`aria-hidden`) — semua informasi sudah ada di
 * teks. Di `prefers-reduced-motion: reduce` SEMUA item dirender solid (aturan
 * `.service-item` di globals.css) sehingga tidak ada info yang cuma lewat opacity.
 */

import { useState } from 'react';
import Image from 'next/image';
import { StackSection } from '@/components/ui/StackSection';
import { BrushDivider } from '@/components/ui/BrushDivider';

/**
 * Tiap layanan dipasangkan ke satu preview project (banner) supaya mockup di
 * kanan berganti mengikuti item aktif — persis pola referensi.
 */
const SERVICES = [
  {
    label: 'Landing Pages',
    preview: '/works/terra-atlas/terra-atlas_banner.svg',
    alt: 'Preview landing page Terra Atlas.',
  },
  {
    label: 'Visual Branding',
    preview: '/works/kopi-kultur/kopi-kultur_banner.svg',
    alt: 'Preview sistem branding Kopi Kultur.',
  },
  {
    label: 'Product Design',
    preview: '/works/halo-banking/halo-banking_banner.svg',
    alt: 'Preview produk Halo Banking.',
  },
] as const;

/** Ruang scroll fase hold — dibagi rata ke jumlah item (≈28vh per item). */
const HOLD_VH = SERVICES.length * 28;

export function ServiceList() {
  const [active, setActive] = useState(0);

  const handleProgress = (progress: number) => {
    const next = Math.min(SERVICES.length - 1, Math.floor(progress * SERVICES.length));
    setActive((current) => (current === next ? current : next));
  };

  return (
    <StackSection
      id="services"
      hold={HOLD_VH}
      className="bg-cream text-ink"
      divider={<BrushDivider className="text-cream" />}
      onHoldProgress={handleProgress}
    >
      <div className="grid grid-cols-1 items-center gap-y-12 lg:grid-cols-[1fr_minmax(0,42%)] lg:gap-x-16">
        {/* Kolom kiri — intro + daftar layanan besar */}
        <div>
          <p className="font-system text-muted max-w-sm text-base leading-relaxed md:text-lg">
            Designing experiences that help brands grow through
          </p>

          <ul className="mt-10 flex flex-col gap-2 md:gap-3">
            {SERVICES.map((service, i) => (
              <li
                key={service.label}
                aria-current={i === active ? 'true' : undefined}
                className="service-item font-display text-4xl leading-[1.02] font-bold tracking-tight uppercase md:text-6xl lg:text-7xl"
              >
                {service.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Kolom kanan — mockup browser, preview berganti mengikuti item aktif.
            Dekoratif: semua gambar dirender bertumpuk lalu di-crossfade lewat
            opacity, jadi pergantiannya mulus tanpa reflow. Disembunyikan di
            bawah lg supaya kata-kata layanan tetap dominan di layar kecil. */}
        <div aria-hidden className="hidden lg:block">
          <div className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-2xl ring-1 ring-black/10">
            {/* Chrome browser palsu */}
            <div className="flex items-center gap-2 border-b border-black/5 bg-black/[0.04] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-black/15" />
              <span className="h-3 w-3 rounded-full bg-black/15" />
              <span className="h-3 w-3 rounded-full bg-black/15" />
              <span className="ml-3 h-4 flex-1 rounded-full bg-black/[0.06]" />
            </div>

            {/* Panggung preview — semua banner bertumpuk, hanya yang aktif opaque */}
            <div className="relative aspect-[16/10] w-full">
              {SERVICES.map((service, i) => (
                <Image
                  key={service.label}
                  src={service.preview}
                  alt={service.alt}
                  fill
                  sizes="(max-width: 1024px) 0px, 42vw"
                  className={`object-cover transition-opacity duration-500 ease-out ${
                    i === active ? 'opacity-100' : 'opacity-0'
                  }`}
                  priority={i === 0}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </StackSection>
  );
}
