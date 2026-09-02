'use client';

/**
 * Error boundary TERAKHIR — menangkap error di root layout itu sendiri, yaitu
 * satu-satunya kegagalan yang `app/error.tsx` tidak bisa tangkap (boundary itu
 * hidup DI DALAM layout; kalau layout-nya yang melempar, ia ikut mati).
 *
 * Karena menggantikan root layout, file ini WAJIB merender <html> dan <body>
 * sendiri, dan karena itu pula ia harus memasang globals.css + variabel font
 * sendiri — semuanya berasal dari layout yang barusan gagal.
 *
 * Sengaja dijaga tetap kurus: apa pun yang di-import di sini ikut jadi risiko
 * baru di jalur yang justru sedang menangani kegagalan. Tidak ada provider,
 * tidak ada GSAP/Lenis, tidak ada dock — dan tautannya `<a>` polos, bukan
 * `next/link`, supaya berpindah halaman berarti memuat dokumen baru yang bersih
 * alih-alih menavigasi di dalam runtime React yang barusan runtuh.
 */

import { useEffect } from 'react';
import './globals.css';
import { FONT_VARS } from '@/lib/fonts';
import { MessagePage, PRIMARY_ACTION, SECONDARY_ACTION } from '@/components/layout/MessagePage';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global error boundary]', error);
  }, [error]);

  return (
    <html lang="en" className={`${FONT_VARS} h-full antialiased`}>
      <body className="min-h-full">
        <MessagePage
          code="500"
          title="The site failed to load."
          body="Something went wrong before the page could start. A reload usually fixes it."
          detail={error.digest ? `Reference: ${error.digest}` : undefined}
        >
          <button type="button" onClick={reset} className={PRIMARY_ACTION}>
            Reload
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages --
              `<a>` DISENGAJA, lihat catatan di kepala file: navigasi client-side
              lewat next/link akan tetap berada di runtime React yang barusan
              runtuh. Muat dokumen baru dari nol adalah satu-satunya pemulihan
              yang bisa diandalkan di sini. */}
          <a href="/" className={SECONDARY_ACTION}>
            Back to home
          </a>
        </MessagePage>
      </body>
    </html>
  );
}
