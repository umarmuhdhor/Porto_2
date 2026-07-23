import type { Work } from './types';

/**
 * TODO(content): teks & aset placeholder yang plausible, BUKAN project real.
 * Ganti sebelum ship publik — lihat catatan di halo-banking.ts.
 */
export const kopiKultur: Work = {
  slug: 'kopi-kultur',
  title: 'Kopi Kultur',
  logo: '/works/kopi-kultur/kopi-kultur_logo.svg',
  category: 'VISUAL BRANDING | PACKAGING',
  year: '2024',
  description:
    'Identitas visual dan sistem kemasan Kopi Kultur — satu grid label yang menampung 14 varian single-origin tanpa mencetak ulang desain tiap panen.',
  summary: [
    { text: 'Kopi Kultur merilis varian baru tiap musim panen. ' },
    {
      text: 'Desain label sekali pakai membuat biaya cetak naik tiap kali roaster ganti biji.',
      strong: true,
    },
    {
      text: ' Solusinya sistem, bukan gambar: satu grid label dengan blok warna asal biji dan satu bidang kosong untuk informasi panen — dicetak sekali, dilengkapi per batch.',
    },
  ],
  services: ['Visual branding', 'Packaging', 'Art direction', 'Brand guidelines'],
  challenge:
    'Empat belas varian harus terlihat sekeluarga di rak, tetapi tetap bisa dibedakan dari jarak dua meter. Anggaran cetak hanya cukup untuk satu kali produksi label per tahun, jadi apa pun yang berubah tiap panen tidak boleh ikut tercetak.',
  role: 'Brand designer. Rancang wordmark, grid label, dan sistem blok warna asal biji, lalu tulis panduan 18 halaman agar tim roaster bisa menyiapkan varian baru sendiri. Biaya cetak label turun sekitar 60% di tahun pertama.',
  banner: {
    src: '/works/kopi-kultur/kopi-kultur_banner.svg',
    alt: 'Deretan kemasan Kopi Kultur dengan blok warna berbeda per asal biji.',
  },
  gallery: [
    {
      src: '/works/kopi-kultur/kopi-kultur_graphics.svg',
      alt: 'Konstruksi wordmark Kopi Kultur beserta ruang aman di sekelilingnya.',
      span: 'half',
    },
    {
      src: '/works/kopi-kultur/kopi-kultur_illustration.svg',
      alt: 'Grid label yang menunjukkan bidang tetap dan bidang isian per batch panen.',
      span: 'half',
    },
    {
      src: '/works/kopi-kultur/kopi-kultur_screens.svg',
      alt: 'Empat belas blok warna asal biji tersusun sebagai satu palet keluarga.',
      span: 'full',
    },
  ],
  ogAccent: '#b4442a',
};
