'use client';

/**
 * Service showcase — mirror bagian "services" referensi (nithinmwarrier.com):
 * kolom kiri = intro kecil + daftar layanan besar (rata kanan) yang item
 * aktifnya terikat scroll; kolom kanan = kartu preview yang isinya ikut berganti
 * mengikuti item aktif (M2 §3.5, DESIGN §3 #5).
 *
 * Progress fase "hold" panel dipetakan ke index aktif: satu item solid, sisanya
 * pudar, dan kartu memuat preview project yang cocok.
 *
 * A11y (DESIGN §8): status aktif diumumkan lewat `aria-current`, bukan hanya
 * warna. Kartu murni dekoratif (`aria-hidden`) — semua informasi sudah ada di
 * teks. Di `prefers-reduced-motion: reduce` SEMUA item dirender solid (aturan
 * `.service-item` di globals.css) sehingga tidak ada info yang cuma lewat opacity.
 */

import { useState } from 'react';
import Image from 'next/image';
import { StackSection } from '@/components/ui/StackSection';
import { BrushDivider } from '@/components/ui/BrushDivider';

/**
 * Satu baris layanan siap-render. Path preview sudah DIRESOLUSI di server
 * (app/page.tsx) dari slug project — komponen ini tidak tahu apa-apa soal
 * registry karya, sama seperti ProjectIndex.
 */
export interface ServiceRow {
  label: string;
  preview: string;
  alt: string;
}

/** Ruang scroll fase hold per item (vh). */
const HOLD_PER_ITEM = 28;

export function ServiceList({ services }: { services: ServiceRow[] }) {
  const [active, setActive] = useState(0);

  const SERVICES = services;
  const HOLD_VH = SERVICES.length * HOLD_PER_ITEM;

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
      <div className="grid grid-cols-1 items-center gap-y-14 lg:grid-cols-[1fr_minmax(0,36%)] lg:gap-x-[clamp(4rem,10vw,10rem)]">
        {/* Kolom kiri — intro + daftar layanan besar.
            Rata KANAN di desktop (mirror referensi): ketiga baris layanan dan
            intro berbagi satu tepi kanan, sehingga daftar terbaca sebagai blok
            teks yang "menggantung" ke arah mockup, bukan kolom kiri biasa.
            Di bawah lg kembali rata kiri — rata kanan pada layar sempit bikin
            baris yang wrap sulit dipindai. */}
        <div className="lg:text-right">
          <p className="font-system text-ink/70 max-w-[34rem] text-base leading-relaxed md:text-lg lg:ml-auto">
            Building mobile experiences that help people get things done
          </p>

          <ul className="mt-12 flex flex-col lg:mt-20">
            {SERVICES.map((service, i) => (
              <li
                key={service.label}
                aria-current={i === active ? 'true' : undefined}
                /**
                 * Hover mengambil alih item aktif dari scroll. Bukan state
                 * terpisah: keduanya menulis `active` yang sama, jadi begitu
                 * user menggulir lagi scroll yang menang kembali — tidak ada
                 * mode "terkunci karena pernah di-hover".
                 *
                 * Sengaja tanpa padanan keyboard: baris ini bukan kontrol
                 * (tidak menuju ke mana-mana), dan menjadikannya focusable akan
                 * menambah tiga perhentian tab yang tak melakukan apa pun.
                 * Informasinya sudah lengkap tanpa hover — kartu preview
                 * `aria-hidden`, statusnya dibawa `aria-current`.
                 */
                onMouseEnter={() => setActive(i)}
                /* Ukuran ikut lebar viewport (vw) supaya rasio teks:kolom tetap —
                   sekali muat satu baris, muat di semua lebar desktop, jadi
                   `nowrap` aman dan daftar tidak pernah "meloncat" tinggi. */
                className={`service-item font-display flex items-center gap-4 text-[clamp(1.35rem,5.8vw,2.5rem)] leading-[1.24] font-bold tracking-tight uppercase transition-transform duration-[var(--dur-base)] ease-[var(--ease-smooth)] lg:justify-end lg:gap-5 lg:text-[clamp(2rem,3.6vw,3.5rem)] lg:whitespace-nowrap ${
                  /* Item aktif menyembul melewati tepi kanan bersama — cuma di
                     lg, tempat daftarnya rata kanan; di layar sempit rata kiri
                     dan geseran ini justru merusak barisnya. */
                  i === active ? 'lg:translate-x-2 motion-reduce:lg:translate-x-0' : ''
                }`}
              >
                {/* Penanda terakota — bahasa garis yang sama dengan flank hero.
                    Lebarnya tumbuh hanya di item aktif; `aria-hidden` karena
                    statusnya sudah dibawa aria-current. */}
                <span
                  aria-hidden
                  className="bg-accent-line hidden h-[var(--hairline-w)] w-0 shrink-0 transition-[width,opacity] duration-[var(--dur-base)] ease-[var(--ease-smooth)] lg:block"
                  style={{ width: i === active ? '3.5rem' : 0, opacity: i === active ? 1 : 0 }}
                />
                {/* `min-w-0`: tanpa ini label jadi flex item dengan
                    min-width:auto → menolak menyusut & melewati garis tepi di
                    layar sempit alih-alih wrap. */}
                <span className="min-w-0">{service.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Kolom kanan — kartu preview yang isinya berganti mengikuti item aktif.
            Dekoratif: semua gambar dirender bertumpuk lalu di-crossfade lewat
            opacity + zoom halus, jadi pergantiannya mulus tanpa reflow.
            Disembunyikan di bawah lg supaya kata-kata layanan tetap dominan di
            layar kecil. */}
        {/* `pr` kecil: menahan kartu berhenti sebelum garis tepi kanan supaya
            badge Honors yang menempel di tepi viewport tidak menabrak sudutnya. */}
        <div aria-hidden className="relative hidden lg:block lg:pr-[3%]">
          {/* Halo hangat di belakang kartu — memberi kedalaman tanpa menambah
              garis atau kotak baru di komposisi. */}
          <div
            className="pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10"
            style={{
              background:
                'radial-gradient(60% 55% at 50% 50%, color-mix(in srgb, var(--color-accent-line) 12%, transparent), transparent 72%)',
            }}
          />

          {/* Kartu ikut MIRING bergantian tiap kali item aktif berganti — arah
              kemiringannya ditentukan ganjil/genap index, jadi pergantian terasa
              seperti kartu yang dilempar ke meja, bukan slideshow yang diam.
              Sudutnya kecil (±1.6°): lebih dari itu dan sisi kartu mulai
              memotong garis tepi kanan saat viewport pas selebar breakpoint. */}
          <div
            className={`bg-cream w-full overflow-hidden rounded-[calc(var(--radius-card)+4px)] shadow-[0_48px_90px_-48px_rgba(10,10,10,0.42),0_10px_28px_-20px_rgba(10,10,10,0.28)] ring-1 ring-[var(--line-rule)] transition-transform duration-[var(--dur-slow)] ease-[var(--ease-smooth)] motion-reduce:rotate-0 motion-reduce:transition-none ${
              active % 2 === 0 ? '-rotate-[1.6deg]' : 'rotate-[1.6deg]'
            }`}
          >
            {/* Panggung gambar mengikuti rasio banner (16:9) supaya tidak ada
                yang terpotong; baris kredit di bawahnya yang menambah tinggi
                kartu mendekati proporsi referensi. */}
            <div className="relative aspect-[16/9] w-full">
              {SERVICES.map((service, i) => (
                <Image
                  key={service.label}
                  src={service.preview}
                  alt={service.alt}
                  fill
                  sizes="(max-width: 1024px) 0px, 36vw"
                  className={`object-cover transition-[opacity,transform] duration-[700ms] ease-[var(--ease-smooth)] ${
                    i === active ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0'
                  }`}
                  /* SENGAJA TANPA `priority`: kartu ini ada di panel keempat,
                     jauh di bawah lipatan. `priority` menambahkan <link
                     rel=preload> di <head> sehingga gambar dekoratif ini
                     berebut bandwidth dengan hero pada detik-detik pertama —
                     menunda LCP demi sesuatu yang baru terlihat beberapa layar
                     kemudian. Lazy (default next/image) sudah tepat. */
                />
              ))}
            </div>

            {/* Baris kredit — mengikat kartu ke item aktif tanpa menambah
                elemen melayang di komposisi. */}
            <div className="font-system text-muted flex items-baseline justify-between border-t border-[var(--line-rule)] px-5 py-4 text-[11px] tracking-[0.22em] uppercase">
              <span className="text-ink/70">{SERVICES[active].label}</span>
              <span>
                {String(active + 1).padStart(2, '0')} / {String(SERVICES.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </StackSection>
  );
}
