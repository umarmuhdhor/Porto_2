import type { Work } from './types';

/**
 * Multi Data Palembang University — Assistant Lecturer (Sep 2023–Jan 2024).
 * Pendampingan 50+ mahasiswa, penyusunan materi, dan penilaian tiga kelas.
 * Aset masih placeholder — ganti dengan materi/foto asli sebelum ship publik.
 *
 * TANPA `stack` — sama alasannya dengan higgz-academia.ts.
 */
export const mdpTeaching: Work = {
  slug: 'mdp-teaching',
  title: 'MDP Lecturing',
  logo: '/works/mdp-teaching/mdp-teaching_logo.svg',
  category: 'TEACHING | MENTORING',
  year: '2023',
  description:
    'Assistant lecturer at Universitas Multi Data Palembang — mentoring 50+ students, building course material, and holding one grading standard across three classes.',
  summary: [
    { text: 'Three classes of 30+ students each needed support that stayed consistent. ' },
    {
      text: 'As assistant lecturer I built the course material and mentored 50+ students one on one.',
      strong: true,
    },
    {
      text: ' Comprehension went up, class participation went up, and grading stayed fair and comparable across every section.',
    },
  ],
  services: ['Teaching', 'Curriculum materials', 'Mentoring', 'Assessment'],
  facts: [
    { label: 'Institution', value: 'Universitas Multi Data Palembang' },
    { label: 'Position', value: 'Assistant Lecturer' },
    { label: 'Timeline', value: 'Sep 2023 – Jan 2024' },
    { label: 'Scope', value: '3 classes across 2 courses' },
  ],
  challenge:
    'Three classes across two courses, more than 30 students each, meant learning speeds varied widely. Support had to be personal without giving up consistency in the material or fairness in how every class was graded.',
  role: 'Assistant Lecturer. Gave one-on-one support to 50+ students and lifted their grasp of the material by roughly 25%, built and distributed course material that raised class participation by around 20%, and led assessment for three classes across two courses under a consistent evaluation standard.',
  approach: [
    {
      title: 'Rebuilt the material',
      body: 'Course notes were restructured into shorter, exercise-led handouts students could work through on their own instead of only during class hours.',
    },
    {
      title: 'Support person by person',
      body: 'Students falling behind got direct one-on-one time, which kept them moving without slowing the pace for the rest of the class.',
    },
    {
      title: 'Graded to one rubric',
      body: 'A single shared rubric across all three classes kept marks comparable regardless of which section a student happened to be in.',
    },
  ],
  outcomes: [
    { metric: '50+', label: 'Students mentored one on one' },
    { metric: '~25%', label: 'Gain in grasp of the material' },
    { metric: '~20%', label: 'Rise in class participation' },
  ],
  banner: {
    src: '/works/mdp-teaching/mdp-teaching_banner.svg',
    alt: 'Class mentoring sessions and course material at Multi Data Palembang.',
  },
  gallery: [
    {
      src: '/works/mdp-teaching/mdp-teaching_graphics.svg',
      alt: 'Summary of the course material prepared for students.',
      span: 'half',
    },
    {
      src: '/works/mdp-teaching/mdp-teaching_illustration.svg',
      alt: 'Flow diagram of the mentoring loop: material, exercises, and assessment.',
      span: 'half',
    },
    {
      src: '/works/mdp-teaching/mdp-teaching_screens.svg',
      alt: 'Example course material and the grading rubric used across three classes.',
      span: 'full',
    },
  ],
  ogAccent: '#b4442a',
};
