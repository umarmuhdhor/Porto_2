import type { Work } from './types';

/**
 * TODO(content): teks & aset placeholder yang plausible, BUKAN project real.
 * Ganti sebelum ship publik — lihat catatan di halo-banking.ts.
 */
export const terraAtlas: Work = {
  slug: 'terra-atlas',
  title: 'Terra Atlas',
  logo: '/works/terra-atlas/terra-atlas_logo.svg',
  category: 'DATA VISUALISATION | PRODUCT DESIGN',
  year: '2024',
  description:
    'Dasbor pemantauan tutupan lahan untuk tim riset Terra — peta, deret waktu, dan ekspor laporan dalam satu ruang kerja yang tetap terbaca di data 12 tahun.',
  summary: [
    { text: 'Tim riset Terra membaca citra satelit 12 tahun lewat empat tool terpisah. ' },
    {
      text: 'Setiap laporan bulanan butuh tiga hari hanya untuk menyatukan angkanya.',
      strong: true,
    },
    {
      text: ' Saya merancang satu ruang kerja: peta dan deret waktu terikat pada seleksi yang sama, dan laporan lahir dari state yang sedang dilihat — bukan dari salin-tempel manual.',
    },
  ],
  services: ['Data visualisation', 'Product design', 'Interaction design', 'User research'],
  challenge:
    'Data mentahnya besar dan tidak rata: sebagian wilayah punya citra mingguan, sebagian hanya tahunan. Grafik yang jujur harus menunjukkan celah itu tanpa membuat dasbor terlihat rusak, dan peneliti tetap perlu membandingkan dua wilayah yang kerapatan datanya berbeda jauh.',
  role: 'Product designer tunggal, bekerja dengan tiga data engineer selama lima bulan. Wawancara delapan peneliti, susun model interaksi peta-ke-grafik, lalu rancang bahasa visual untuk data yang hilang. Waktu penyusunan laporan bulanan turun dari tiga hari ke satu sore.',
  banner: {
    src: '/works/terra-atlas/terra-atlas_banner.svg',
    alt: 'Dasbor Terra Atlas: peta tutupan lahan di kiri, grafik deret waktu di kanan.',
  },
  gallery: [
    {
      src: '/works/terra-atlas/terra-atlas_screens.svg',
      alt: 'Panel deret waktu dengan penanda periode data yang tidak tersedia.',
      span: 'half',
    },
    {
      src: '/works/terra-atlas/terra-atlas_illustration.svg',
      alt: 'Diagram model interaksi antara seleksi peta, filter waktu, dan panel laporan.',
      span: 'half',
    },
    {
      src: '/works/terra-atlas/terra-atlas_graphics.svg',
      alt: 'Skala warna tutupan lahan beserta uji kontrasnya pada latar terang dan gelap.',
      span: 'full',
    },
    {
      src: '/works/terra-atlas/terra-atlas_system.svg',
      alt: 'Tata letak laporan ekspor dalam format cetak A4.',
      span: 'half',
    },
    {
      src: '/works/terra-atlas/terra-atlas_detail.svg',
      alt: 'Detail tooltip perbandingan dua wilayah pada periode yang sama.',
      span: 'half',
    },
  ],
  ogAccent: '#1f8a6d',
};
