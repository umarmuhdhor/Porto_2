import type { Work } from './types';

/**
 * Higgz Academia Technology PTE. LTD (Singapura) — Freelance (Feb 2023–Feb 2024).
 * Menyusun materi & tutorial video penyelesaian soal matematika dengan akurasi tinggi.
 * Aset masih placeholder — ganti dengan materi/screenshot asli sebelum ship publik.
 *
 * TANPA `stack`: ini bukan project engineering. Mengarang daftar teknologi di
 * sini cuma buat mengisi baris = klaim palsu di halaman portfolio.
 */
export const higgzAcademia: Work = {
  slug: 'higgz-academia',
  title: 'Higgz Academia',
  logo: '/works/higgz-academia/higgz-academia_logo.svg',
  category: 'EDTECH | PROBLEM SOLVING',
  disciplines: ['teaching'],
  year: '2023–2024',
  description:
    'Worked solutions and video tutorials for Higgz Academia — steps that follow one clean path, stay consistent across topics, and hold accuracy above 90%.',
  summary: [
    { text: 'Higgz Academia needed maths solutions students could actually trust. ' },
    {
      text: 'I solved problems across topics at 90%+ daily accuracy and turned each one into a video tutorial.',
      strong: true,
    },
    {
      text: ' The point was never the right answer alone — it was steps easy enough to follow that understanding went up, not just marks.',
    },
  ],
  services: ['Problem solving', 'Video tutorials', 'Content development', 'Mentoring'],
  facts: [
    { label: 'Client', value: 'Higgz Academia Technology PTE. LTD — Singapore' },
    { label: 'Engagement', value: 'Freelance' },
    { label: 'Timeline', value: 'Feb 2023 – Feb 2024' },
    { label: 'Output', value: 'Worked solutions + video tutorials' },
  ],
  challenge:
    'Problems arrived from different topics at uneven difficulty, and every solution had to be both correct and easy to follow. Holding accuracy high while explaining the steps consistently was the hard part.',
  role: 'Freelance. Solved a wide range of maths problems at above 90% daily accuracy, lifted user comprehension by roughly 20% through a video tutorial on each problem, and applied critical and creative thinking consistently to arrive at solutions that actually land.',
  approach: [
    {
      title: 'Solve first, explain second',
      body: 'Each problem was worked through completely before recording, so the tutorial follows one clean path instead of walking students through a live struggle.',
    },
    {
      title: 'One format for every solution',
      body: 'A repeatable structure — what is given, the key step, the result — kept explanations recognisable no matter which topic the problem came from.',
    },
    {
      title: 'Accuracy checked daily',
      body: 'Every batch was verified before it went out, which is what kept the daily accuracy rate above 90% across a full year of work.',
    },
  ],
  outcomes: [
    { metric: '90%+', label: 'Daily solution accuracy' },
    { metric: '~20%', label: 'Lift in user comprehension' },
    { metric: '12 mo', label: 'Continuous freelance delivery' },
  ],
  banner: {
    src: '/works/higgz-academia/higgz-academia_banner.svg',
    alt: 'A set of Higgz Academia worked solutions laid out step by step.',
  },
  gallery: [
    {
      src: '/works/higgz-academia/higgz-academia_screens.svg',
      alt: 'An example solution broken down into sequential steps.',
      span: 'half',
    },
    {
      src: '/works/higgz-academia/higgz-academia_illustration.svg',
      alt: 'Flow diagram from problem, through working steps, to video tutorial.',
      span: 'half',
    },
    {
      src: '/works/higgz-academia/higgz-academia_graphics.svg',
      alt: 'Summary of solution accuracy over time.',
      span: 'full',
    },
    {
      src: '/works/higgz-academia/higgz-academia_system.svg',
      alt: 'Solution format template that keeps steps consistent across problems.',
      span: 'half',
    },
    {
      src: '/works/higgz-academia/higgz-academia_detail.svg',
      alt: 'Detail of one tutorial: the problem, the key steps, and the final result.',
      span: 'half',
    },
  ],
  ogAccent: '#1f8a6d',
};
