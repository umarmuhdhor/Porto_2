import type { Work } from './types';

/**
 * TODO(content): teks & aset di file ini placeholder yang plausible, BUKAN
 * project real. Ganti copy + swap aset di public/works/halo-banking/ dengan
 * gambar asli (.webp) sebelum ship publik. Struktur file tidak perlu berubah.
 */
export const haloBanking: Work = {
  slug: 'halo-banking',
  title: 'Halo Banking',
  logo: '/works/halo-banking/halo-banking_logo.svg',
  category: 'PRODUCT DESIGN | DESIGN SYSTEM',
  year: '2025',
  description:
    'Redesign aplikasi mobile banking Halo — dari 40+ layar tak konsisten jadi satu design system dengan token bersama dan alur transfer yang dipangkas separuh.',
  summary: [
    { text: 'Halo tumbuh dari satu produk tabungan jadi tujuh lini dalam dua tahun. ' },
    { text: 'Tampilannya ikut pecah: 40+ layar dengan enam gaya tombol berbeda.', strong: true },
    {
      text: ' Saya membangun ulang fondasinya — satu skala tipografi, satu set token warna, dan komponen yang dipakai lintas tim — lalu memakainya untuk merapikan alur paling sering dipakai: transfer.',
    },
  ],
  services: ['Product design', 'Design system', 'Prototyping', 'Design QA'],
  challenge:
    'Empat squad merilis fitur secara paralel tanpa sumber komponen bersama. Tiap rilis menambah varian baru, dan alur transfer sudah menumpuk jadi sembilan langkah. Pekerjaannya bukan menggambar layar baru, tapi menyepakati fondasi yang bisa dipakai semua squad tanpa memperlambat rilis mereka.',
  role: 'Lead product designer. Audit 40+ layar, definisikan token & komponen inti bersama dua front-end engineer, lalu dampingi tiap squad memigrasikan layarnya. Alur transfer turun dari sembilan langkah ke empat; komponen baru dipakai di lima dari tujuh lini produk saat handoff.',
  banner: {
    src: '/works/halo-banking/halo-banking_banner.svg',
    alt: 'Empat layar aplikasi Halo Banking berjajar menampilkan beranda, transfer, dan riwayat transaksi.',
  },
  gallery: [
    {
      src: '/works/halo-banking/halo-banking_screens.svg',
      alt: 'Alur transfer empat langkah: pilih penerima, nominal, konfirmasi, dan tanda terima.',
      span: 'half',
    },
    {
      src: '/works/halo-banking/halo-banking_system.svg',
      alt: 'Papan token design system Halo: skala warna, tipografi, dan spacing.',
      span: 'half',
    },
    {
      src: '/works/halo-banking/halo-banking_graphics.svg',
      alt: 'Set ikon dan state komponen tombol dalam varian terang dan gelap.',
      span: 'full',
    },
  ],
  ogAccent: '#2f6df6',
};
