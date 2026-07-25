import type { Work } from './types';

/**
 * ABSATA — magang Mobile Application Developer di DPR RI (Sep–Des 2024).
 * Sistem absensi mobile untuk Staff Administrasi Anggota (SAA) & Tenaga Ahli (TA).
 * Aset masih placeholder — ganti dengan screenshot asli sebelum ship publik.
 */
export const absata: Work = {
  slug: 'absata',
  title: 'ABSATA',
  logo: '/works/absata/absata_logo.svg',
  category: 'MOBILE APP | FLUTTER',
  year: '2024',
  description:
    'Mobile attendance system for administrative staff and expert staff at the Indonesian House of Representatives — secure login, an informative dashboard, and real-time attendance tracking in one Flutter app.',
  summary: [
    { text: 'DPR RI tracked hundreds of staff by hand, unit by unit. ' },
    {
      text: 'ABSATA replaced that with a single mobile attendance app used daily by administrative and expert staff.',
      strong: true,
    },
    {
      text: ' I built the features in Flutter — secure login, dashboard, and real-time attendance tracking — wired to a REST API and delivered alongside the team through Git.',
    },
  ],
  services: ['Mobile development', 'Flutter', 'REST API integration', 'UI/UX implementation'],
  facts: [
    { label: 'Organisation', value: 'DPR RI (House of Representatives)' },
    { label: 'Timeline', value: 'Sep – Dec 2024' },
    { label: 'Platform', value: 'Flutter — iOS & Android' },
    { label: 'Team', value: 'In-house mobile team' },
  ],
  stack: ['Flutter', 'Dart', 'REST API', 'Git'],
  challenge:
    'The attendance flow had to serve two different roles — administrative staff and expert staff — without confusing either one, stay resistant to cheating, and remain fast on a network that is not always stable. Features were built in parallel with the rest of the team, so API integration and version control had to be disciplined from day one.',
  role: 'Mobile Application Developer Intern. Built ABSATA from scratch in Flutter — secure login, dashboard, and real-time attendance tracking — integrated the REST API, and collaborated on UI/UX implementation for ABSATA as well as an LMS app. Active in team discussions and reviews to keep the development flow moving.',
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
      body: 'Branches, reviews, and Git discipline kept my work mergeable while the rest of the team moved in parallel on the LMS app.',
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
