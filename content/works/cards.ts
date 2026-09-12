import type { WorkCard } from './types';

/**
 * Entri indeks tanpa halaman case study.
 *
 * KENAPA MEREKA DI SINI DAN BUKAN JADI `Work`: lihat komentar `WorkCard` di
 * types.ts. Ringkasnya, datanya memang tipis — dan `Work` menuntut `challenge`,
 * tiga langkah `approach`, dan tiga `outcomes`. Mengisi itu untuk project yang
 * tidak punya satu pun angka hasil berarti mengarang, dan bagian `outcomes`
 * adalah tempat paling gampang buat berbohong tanpa ketahuan.
 *
 * SEMUANYA SATU FILE, bukan satu file per entri seperti case study: isi tiap
 * entri sekitar sepuluh baris, dan lima file sepuluh baris hanya menambah lima
 * import di lib/works.ts tanpa menambah satu pun kejelasan.
 *
 * Urutan di sini = urutan tampil, dan sengaja menyusul seluruh case study di
 * indeks `/works`: baris yang bisa diklik dulu, baru yang berhenti di situ.
 * Urutannya sendiri dari yang terbaru ke yang terlama.
 *
 * MENAIKKAN SATU ENTRI: pindahkan ke content/works/{slug}.ts sebagai `Work`,
 * daftarkan di WORKS, hapus dari sini. Tidak ada yang lain yang perlu diubah.
 */
export const WORK_CARDS: readonly WorkCard[] = [
  {
    slug: 'balive',
    title: 'Balive',
    category: 'IOS APP | SWIFTUI + SUPABASE',
    disciplines: ['app'],
    year: '2026',
    description:
      'A boarding house finder for Bali that borrows the swipe-card interaction from dating apps. Built for Challenge Zero at the Apple Developer Academy, then carried past the two screens the brief asked for — with listings gathered by walking the area, because no usable dataset covers it.',
    banner: {
      src: '/works/balive/balive_banner.svg',
      alt: 'Balive swipe-card browsing of boarding house listings around the academy.',
    },
    links: [{ label: 'Source on GitHub', href: 'https://github.com/umarmuhdhor/Balive' }],
  },
  {
    slug: 'pelican',
    title: 'PELICAN',
    category: 'MOBILE APP | FLUTTERFLOW',
    disciplines: ['app'],
    year: '2025',
    description:
      'An attendance app taken on as a first paid project right after the DPR RI internship ended, built by three people in FlutterFlow — a visual builder learned in two days, and a noticeably more rigid discipline than writing Flutter by hand.',
    banner: {
      src: '/works/pelican/pelican_banner.svg',
      alt: 'PELICAN attendance screens built in FlutterFlow.',
    },
  },
  {
    slug: 'colab',
    title: 'COLAB',
    category: 'MOBILE APP | FLUTTER',
    disciplines: ['app'],
    year: '2024',
    description:
      'A team collaboration application built in Flutter as university coursework, developed by a small group.',
    banner: {
      src: '/works/colab/colab_banner.svg',
      alt: 'COLAB team collaboration screens built in Flutter.',
    },
  },
  {
    slug: 'suwotify',
    title: 'Suwotify',
    category: 'MOBILE APP | FLUTTER + STRAPI',
    disciplines: ['app'],
    year: '2023',
    description:
      'A Spotify-shaped music player built for a mobile programming course — browse a catalogue, open a track, play it — with its own Strapi backend, local session persistence, and a dependency list that leans noticeably into animation.',
    banner: {
      src: '/works/suwotify/suwotify_banner.svg',
      alt: 'Suwotify catalogue and player screens built in Flutter.',
    },
    links: [{ label: 'Source on GitHub', href: 'https://github.com/umarmuhdhor/spotifysuwo' }],
  },
  {
    slug: 'filmu',
    title: 'Filmu',
    category: 'MOBILE APP | REACT NATIVE',
    disciplines: ['app'],
    year: '2023',
    description:
      'The closing project of the Timedoor Academy bootcamp: a React Native movie companion pulling films, trailers, and cast from the TMDb API, presented to mentors at the end of the programme.',
    banner: {
      src: '/works/filmu/filmu_banner.svg',
      alt: 'Filmu movie browsing and detail screens built in React Native.',
    },
    links: [{ label: 'Source on GitHub', href: 'https://github.com/umarmuhdhor/Filmu' }],
  },
];
