'use client';

/**
 * Beacon kecil: menandai `document.body[data-at-contact]` saat section kontak
 * mendominasi viewport. Dipakai untuk menyembunyikan chrome mengambang (NavPill)
 * supaya sudut layar bersih — hanya baris kredit — persis seperti referensi.
 *
 * IntersectionObserver di elemen <footer> terdekat; threshold 0.55 = footer
 * mengisi lebih dari separuh layar. Atribut dibersihkan saat unmount.
 */

import { useEffect, useRef } from 'react';

export function ContactChromeToggle() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const footer = ref.current?.closest('footer');
    if (!footer) return;

    const set = (on: boolean) => {
      if (on) document.body.dataset.atContact = 'true';
      else delete document.body.dataset.atContact;
    };

    const io = new IntersectionObserver(
      ([entry]) => set(entry.isIntersecting && entry.intersectionRatio >= 0.55),
      { threshold: [0, 0.55, 1] },
    );
    io.observe(footer);

    return () => {
      io.disconnect();
      set(false);
    };
  }, []);

  return <span ref={ref} aria-hidden className="hidden" />;
}
