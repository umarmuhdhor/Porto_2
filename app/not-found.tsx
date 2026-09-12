/**
 * 404. Menangkap dua hal: URL yang ditebak-tebak orang, dan `notFound()` yang
 * dipanggil app/works/[slug]/page.tsx untuk slug asing.
 *
 * Halaman ini justru SERING dilihat — orang menebak `/about`, `/cv`, `/blog`,
 * dan tautan lama yang dibagikan tidak pernah mati diam-diam. Membiarkannya
 * jatuh ke 404 bawaan Next berarti satu-satunya halaman yang keluar total dari
 * brand adalah halaman yang muncul justru saat pengunjung sudah bingung.
 *
 * Server component: tidak ada state, dan tetap dirender saat JS gagal dimuat.
 */

import Link from 'next/link';
import { MessagePage, PRIMARY_ACTION, SECONDARY_ACTION } from '@/components/layout/MessagePage';

export default function NotFound() {
  return (
    <MessagePage
      code="404"
      title="This page took a wrong turn."
      body="The link is broken, or the page moved. Nothing here is lost — the work is all one scroll away."
    >
      {/* Dua tujuan yang benar-benar dituju orang saat nyasar: beranda, dan
          daftar project. Tidak ada tombol "back" — riwayat browser sudah
          melakukannya lebih baik, dan tombol yang meniru tombol browser justru
          mematahkan harapan saat halaman ini yang PERTAMA dibuka. */}
      <Link href="/" className={PRIMARY_ACTION}>
        Back to home
      </Link>
      <Link href="/works" className={SECONDARY_ACTION}>
        See the work
      </Link>
    </MessagePage>
  );
}
