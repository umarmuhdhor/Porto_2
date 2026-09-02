'use client';

/**
 * Error boundary rute. Menangkap error render/efek di dalam <main> — pohon ini
 * penuh komponen client yang menyentuh hal-hal yang bisa gagal di mesin
 * pengunjung: GSAP/Lenis, WebGL (R3F), dan fetch ke Supabase.
 *
 * Tanpa file ini, SATU error dari salah satunya = layar putih kosong, tanpa
 * jalan keluar dan tanpa petunjuk. Itu kegagalan yang paling mahal di situs
 * portofolio: pengunjung tidak melaporkan bug, mereka menutup tab.
 *
 * Layout tetap dirender di sekelilingnya (batas boundary ada DI BAWAH layout),
 * jadi NavPill & dock masih hidup — hanya isi halamannya yang diganti.
 *
 * Wajib client component: `reset` adalah callback, dan `useEffect` di bawah
 * butuh browser. `app/global-error.tsx` menangani lapisan di atas ini (error di
 * layout itu sendiri).
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { MessagePage, PRIMARY_ACTION, SECONDARY_ACTION } from '@/components/layout/MessagePage';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Satu-satunya jejak yang tersisa. Di produksi Next menyembunyikan pesan
    // asli dari client dan hanya menyisakan `digest` — itulah yang mencocokkan
    // laporan ini dengan stack trace lengkap di log server Vercel.
    console.error('[error boundary]', error);
  }, [error]);

  return (
    <MessagePage
      code="500"
      title="Something broke on the way in."
      body="An unexpected error stopped this page from rendering. Trying again usually clears it — if it keeps happening, the rest of the site still works."
      detail={error.digest ? `Reference: ${error.digest}` : undefined}
    >
      {/* `reset()` me-render ulang segmen ini tanpa memuat ulang dokumen — jauh
          lebih murah daripada reload penuh, dan cukup untuk error sekali-jalan
          (fetch gagal, konteks WebGL hilang). */}
      <button type="button" onClick={reset} className={PRIMARY_ACTION}>
        Try again
      </button>
      <Link href="/" className={SECONDARY_ACTION}>
        Back to home
      </Link>
    </MessagePage>
  );
}
