'use client';

/**
 * Tepi bertangga antar section — strip kolom krem yang menempel di tepi ATAS
 * sebuah section berlatar accent, lalu menyusut satu per satu saat section itu
 * naik. Karena tiap kolom mulai menyusut pada waktu berbeda, batas krem→accent
 * tidak pernah berupa garis lurus melainkan tangga yang bergerak.
 *
 * Awalnya hidup di dalam AboutWindows (konsep scroll dari nithinmwarrier.com
 * §2). Diangkat jadi komponen sendiri begitu ContactFooter membutuhkan efek yang
 * sama: dua salinan berarti dua tempat yang harus diubah setiap kali jumlah
 * kolom atau kurvanya disetel.
 *
 * KENAPA `transform: scaleY`, bukan `height`: kolomnya bidang warna KOSONG —
 * tidak ada isi yang bisa ikut menggepeng — jadi menyusutkannya dari
 * `transform-origin: top` menghasilkan piksel yang identik dengan menyusutkan
 * `height`. Bedanya di biaya: `height` dijalankan ulang lewat layout + paint
 * tiap frame scroll (5 kolom × 2 pemakaian = 10 elemen yang me-relayout
 * sepanjang scroll), sedangkan `scaleY` murni kerja compositor. Kalau suatu saat
 * kolom ini diisi konten, kembalikan ke `height` — scale akan menggepengkan isi.
 *
 * TRIGGER-nya section INDUK (`section`/`footer` terdekat), bukan strip ini
 * sendiri: strip berukuran tetap di tepi atas induknya, jadi memakai dirinya
 * sebagai trigger hanya mengukur ulang hal yang sama — dan di AboutWindows ia
 * berada di dalam panggung sticky, yang berhenti bergerak selama fase paku
 * sehingga progress-nya membeku di tengah animasi.
 *
 * REST STATE = HABIS (scaleY 0). Markup default sudah begitu, jadi tanpa JS
 * atau di `prefers-reduced-motion: reduce` tidak ada balok krem yang tertinggal
 * menutupi kepala section.
 */

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { NO_PREFERENCE } from '@/lib/motion';

/**
 * Jumlah kolom. Ganjil supaya ada satu kolom tengah yang jelas jadi titik mulai
 * tangga; lima cukup terbaca sebagai tangga tapi belum serapat sisir (yang
 * justru bikin tepinya kembali terlihat lurus).
 */
const COLS = 5;

/**
 * Jeda mulai kolom ke-i: makin jauh dari tengah, makin telat menyusut. Angka
 * ini yang menentukan seberapa TINGGI bedanya antar anak tangga — kolom terluar
 * baru mulai bergerak setelah kolom tengah menempuh 2×0.2 = 40% perjalanannya.
 */
const DELAY_FROM_CENTER = (i: number) => Math.abs(i - (COLS - 1) / 2) * 0.2;

/**
 * Panjang jendela susut satu kolom, dalam satuan progress. Lebih pendek dari
 * jumlah jeda + span berarti kolom-kolom saling menyusul, bukan bergerak
 * berbarengan — itu yang bikin bentuknya terbaca sebagai tangga, bukan tirai
 * yang naik rata.
 */
const SPAN = 0.5;

/** Ease-out kubik — kolom melesat naik lalu melambat di ujung. */
const easeOut = (t: number) => 1 - (1 - t) ** 3;

type Props = {
  /** Awal & akhir jendela scrub (sintaks ScrollTrigger, relatif section induk). */
  start?: string;
  end?: string;
  /** Tinggi strip = seberapa dalam tangga menjorok ke dalam section. */
  height?: string;
  /** Warna kolom — harus SAMA PERSIS dengan latar section sebelumnya. */
  colorClassName?: string;
};

export function StaircaseBlinds({
  start = 'top bottom',
  // TIGA ANGKA INI SALING TARIK — jangan disetel sendiri-sendiri:
  //
  //  - `end` = kapan tangga tuntas. Ini yang paling sering disalahsetel, dan
  //    perangkapnya bukan cuma "cepat/lambat": strip menggantung KE BAWAH dari
  //    tepi atas section, jadi anak tangga TERLUAR selalu berada `height` di
  //    bawah tepi itu. Kalau tangganya tuntas saat section masih di dasar layar
  //    (dicoba 'top 78%', lalu 42%, lalu 20%), puncak gerakannya jatuh ketika
  //    tepi section masih di y≈550–660 — undakan terluarnya di luar viewport
  //    dan yang tampak cuma dua tingkat. 'top top' menahan sampai tepi section
  //    mencapai puncak layar, sehingga bentuk penuhnya lewat di paruh atas
  //    layar dengan ruang cukup di bawahnya.
  //  - `height` = kedalaman tangga: sekaligus SELISIH antar kolom dan seberapa
  //    dini bentuk penuhnya muat di layar (butuh tepi section ≤ vh − height).
  //    22vh dulu cuma beda ~100px (terbaca sebagai garis miring); 34vh jelas
  //    tapi baru muat saat tangganya nyaris selesai. 30vh titik tengahnya.
  //  - DELAY_FROM_CENTER & SPAN di atas mengatur seberapa jauh kolom saling
  //    menyusul di dalam jendela itu.
  end = 'top top',
  height = '30vh',
  colorClassName = 'bg-cream',
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const trigger = root?.closest('section, footer');
      if (!trigger) return;

      const mm = gsap.matchMedia();

      mm.add(NO_PREFERENCE, () => {
        const cols = colRefs.current.filter(Boolean) as HTMLDivElement[];

        /** progress 0 → strip utuh (menyambung section sebelumnya); 1 → habis. */
        const paint = (progress: number) => {
          cols.forEach((el, i) => {
            const t = (progress - DELAY_FROM_CENTER(i)) / SPAN;
            const clamped = t <= 0 ? 0 : t >= 1 ? 1 : t;
            el.style.transform = `scaleY(${1 - easeOut(clamped)})`;
          });
        };

        paint(0);

        ScrollTrigger.create({
          trigger,
          start,
          end,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => paint(self.progress),
          // Landing di tengah halaman (deep link, reload) harus langsung
          // menampilkan state yang semestinya, bukan menunggu scroll pertama.
          onRefresh: (self) => paint(self.progress),
        });

        return () => {
          cols.forEach((el) => {
            el.style.transform = 'scaleY(0)';
          });
        };
      });
    },
    { scope: rootRef },
  );

  return (
    // `inset-x-0` pada anak absolute mengukur ke padding box induknya, jadi strip
    // otomatis membentang selebar section dan mengabaikan --frame-inset — tanpa
    // perlu margin negatif. Tiap kolom dijangkarkan ke TEPI ATAS strip sehingga
    // yang menyusut sisi bawahnya, dan accent tumbuh ke atas.
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start"
      style={{ height }}
    >
      {Array.from({ length: COLS }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            colRefs.current[i] = el;
          }}
          // `transform` ditulis inline (bukan lewat utility `scale-y-0`):
          // Tailwind v4 mengompilasi utility skala ke properti `scale`, yang
          // BERKALIAN dengan `transform` alih-alih menggantikannya — nilai dari
          // paint() akan selalu berakhir nol.
          className={`h-full flex-1 origin-top ${colorClassName}`}
          style={{ transform: 'scaleY(0)' }}
        />
      ))}
    </div>
  );
}
