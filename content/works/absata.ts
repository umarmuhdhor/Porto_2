import type { Work } from './types';

/**
 * ABSATA — magang Mobile Application Developer di DPR RI (Sep–Des 2024).
 * Sistem absensi mobile untuk Staf Administrasi Anggota (SAA) & Tenaga Ahli (TA).
 *
 * PROJECT BER-NDA (`private: true` di DATA-PORTO): sistem internal pemerintah.
 * Tidak ada demo, tidak ada repo, dan TIDAK ADA SATU PUN SCREENSHOT yang boleh
 * dibagikan — karena itu `links` sengaja kosong dan seluruh asetnya placeholder,
 * BUKAN karena screenshot aslinya belum sempat diambil. Jangan diganti.
 *
 * Angka & klaim di sini dibatasi ke apa yang ada di DATA-PORTO: dua kelompok
 * staf, login aman, dashboard, pemantauan realtime, integrasi REST API.
 */
export const absata: Work = {
  slug: 'absata',
  title: 'ABSATA',
  logo: '/works/absata/absata_logo.svg',
  category: 'MOBILE APP | FLUTTER',
  disciplines: ['app'],
  year: '2024',
  description:
    'Mobile attendance system for administrative staff and expert staff at the Indonesian House of Representatives — secure login, an informative dashboard, and real-time attendance tracking in one Flutter app.',
  summary: [
    { text: 'Attendance for two groups of parliamentary support staff was handled by hand. ' },
    {
      text: 'ABSATA replaced that with one mobile attendance app, part of a wider digital transformation effort inside the institution.',
      strong: true,
    },
    {
      text: ' I built the features in Flutter — secure login, dashboard, and real-time attendance tracking — wired to a REST API and delivered alongside the team through Git.',
    },
  ],
  services: ['Mobile development', 'Flutter', 'REST API integration', 'UI/UX implementation'],
  facts: [
    { label: 'Organisation', value: 'DPR RI (House of Representatives)' },
    { label: 'Timeline', value: 'Sep – Dec 2024, four-month placement' },
    { label: 'Platform', value: 'Flutter — iOS & Android' },
    { label: 'Access', value: 'Internal system — no public link or repository' },
  ],
  stack: ['Flutter', 'Dart', 'REST API', 'Git'],
  challenge:
    'Attendance for Member Administration Staff and Expert Staff was handled manually, which cost administrative time and left the institution with no live view of who was actually present. The replacement had to serve two different roles without confusing either one, and it was built in parallel with the rest of an intern team — so the API contract and version control had to be disciplined from day one.',
  role: 'Mobile Application Developer Intern. Led development of the attendance application as part of the internship team — the secure login flow, the dashboard, and realtime attendance monitoring in Flutter — integrated it with the institution\'s services over a REST API, and implemented UI/UX designs for both ABSATA and the institution\'s LMS application. Development continued with another team after the placement ended in December 2024.',
  approach: [
    {
      title: 'One app, two roles',
      body: 'Administrative and expert staff have different attendance duties, so the flow branches by role inside a single app instead of splitting into two builds nobody would maintain.',
    },
    {
      title: 'Built against the API contract',
      body: 'Every screen was wired to REST endpoints with explicit loading and error states, so a slow office network reads as "still working" rather than as a broken app.',
    },
    {
      title: 'Shipped inside a team workflow',
      body: 'Branches, reviews, and Git discipline kept the work mergeable while the rest of the intern team moved in parallel on the LMS app — and left something another team could pick up when the placement ended.',
    },
  ],
  outcomes: [
    { metric: '2', label: 'Staff roles served by one app' },
    { metric: 'Real-time', label: 'Attendance visible as it happens' },
    { metric: '1', label: 'Flutter codebase for both platforms' },
  ],
  banner: {
    src: '/works/absata/absata_banner.svg',
    alt: 'Several ABSATA app screens: login, dashboard, and attendance history.',
  },
  gallery: [
    {
      src: '/works/absata/absata_screens.svg',
      alt: 'The ABSATA attendance flow: login, dashboard, and attendance confirmation.',
      span: 'half',
    },
    {
      src: '/works/absata/absata_system.svg',
      alt: 'Component and state structure of the ABSATA app built in Flutter.',
      span: 'half',
    },
    {
      src: '/works/absata/absata_graphics.svg',
      alt: 'ABSATA icon set and interface components in light and dark variants.',
      span: 'full',
    },
  ],
  ogAccent: '#2f6df6',
};
