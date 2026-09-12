import type { Work } from './types';

/**
 * Logic & Code (gerbangdev.com) — platform try out untuk calon peserta seleksi
 * Apple Developer Academy Indonesia. Dikerjakan SENDIRI, mulai Juni 2026, masih
 * berjalan.
 *
 * BUKAN produk resmi Apple, dan kalimat itu ikut di `description` — bukan
 * catatan legal yang bisa dibuang, melainkan bagian dari apa produknya.
 *
 * Angka di `outcomes` dihitung dari repo-nya (20 migrasi, 4 edge function,
 * 9+6+5 suite test), bukan metrik pemakaian: platformnya masih berjalan dan
 * angka user-nya bukan milik saya untuk dipublikasikan.
 */
export const logicAndCode: Work = {
  slug: 'logic-and-code',
  title: 'Logic & Code',
  logo: '/works/logic-and-code/logic-and-code_logo.svg',
  category: 'WEB PLATFORM | NEXT.JS + SUPABASE',
  disciplines: ['web'],
  year: '2026',
  description:
    'An independent try-out platform at gerbangdev.com for people preparing for the Apple Developer Academy Indonesia selection — server-scored practice tests, a server-set timer, and a token economy that runs without a scheduler.',
  summary: [
    {
      text: 'A practice platform that scores in the browser is worthless the moment someone opens developer tools. ',
    },
    {
      text: 'Logic & Code puts every decision on the server: questions arrive without their answer key, scoring happens inside the database, and the deadline is written when the attempt starts.',
      strong: true,
    },
    {
      text: ' Built solo end to end — Next.js frontend, Postgres schema and RPCs, Deno edge functions, payments, and the admin side.',
    },
  ],
  services: [
    'Full-stack development',
    'Database and security design',
    'Payments integration',
    'Test and CI setup',
  ],
  facts: [
    { label: 'Product', value: 'gerbangdev.com — independent, not an Apple product' },
    { label: 'Role', value: 'Solo full-stack engineer' },
    { label: 'Model', value: 'Freemium — token-based practice, paid document builder' },
    { label: 'Status', value: 'Live and in development since June 2026' },
  ],
  stack: [
    'Next.js',
    'TypeScript',
    'PostgreSQL',
    'Supabase',
    'Deno Edge Functions',
    'PL/pgSQL',
    'Playwright',
    'pgTAP',
  ],
  links: [{ label: 'Open gerbangdev.com', href: 'https://gerbangdev.com' }],
  challenge:
    'Everything that decides an outcome is worth something to somebody, and each one leaks in its own way. An answer key reachable through row-level security is still reachable. A timer living in the browser can be paused, rewound, or reloaded away. Crediting tokens on the post-payment redirect hands them to anyone who visits a success URL, and a gateway will happily replay its webhook. If the browser sends an amount, the browser decides the price — and if it can write its own profile row, it decides its own role.',
  role: 'Solo full-stack engineer. Built the whole platform: the Next.js App Router frontend across four route groups, the Postgres schema and its SECURITY DEFINER RPCs, four Deno edge functions, the SayaBayar payment flow with signed-webhook settlement, the admin panel, and the quality gate covering typecheck, lint, unit, end-to-end, and database tests plus a scan for secrets reaching the client bundle.',
  approach: [
    {
      title: 'The client never reads the questions table',
      body: 'Not restricted access to it — no access at all. A SECURITY DEFINER RPC assembles the questions for an attempt with the correctness flag stripped, and scoring runs as a database function, so the answer key never leaves the server. The deadline is written server-side at start, and a separate function closes attempts that ran past it.',
    },
    {
      title: 'Money moves only on a verified signature',
      body: 'The webhook checks its HMAC-SHA256 signature before doing anything else, finds the row by gateway reference, and calls a service-role-only settlement function that is idempotent, so a replay does nothing. The browser sends a pack id and never an amount; prices map server-side. Role and account status are held immutable by a database trigger, not by hiding a form field.',
    },
    {
      title: 'Compute the free tokens lazily, and delete the cron job',
      body: 'A rolling grant usually means a scheduler, and a naive top-up would wipe out tokens someone actually paid for. Here the balance is recomputed whenever it is read or an attempt starts, rolling back up to 50 every 72 hours — and it only ever raises a balance toward 50, so a purchased balance above that is left alone.',
    },
  ],
  outcomes: [
    { metric: '20', label: 'File-based migrations, no dashboard schema edits' },
    { metric: '9 + 6 + 5', label: 'Vitest, Playwright, and pgTAP suites' },
    { metric: '72h', label: 'Token refresh, computed with no scheduled job' },
  ],
  banner: {
    src: '/works/logic-and-code/logic-and-code_banner.webp',
    alt: 'Logic & Code title card: structured material, a 90-minute server-set timer, and server-side scoring.',
  },
  gallery: [
    {
      src: '/works/logic-and-code/logic-and-code_engine.svg',
      alt: 'The try-out engine: an attempt started server-side, answers autosaved, and scoring run inside the database.',
      span: 'half',
    },
    {
      src: '/works/logic-and-code/logic-and-code_admin.svg',
      alt: 'The admin side covering users, packages, questions, results, payments, and editable info content.',
      span: 'half',
    },
  ],
  ogAccent: '#e61919',
};
