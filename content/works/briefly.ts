import type { Work } from './types';

/**
 * Briefly — workspace content marketing tempat agent bekerja di permukaan yang
 * sama dengan manusia, lewat WebMCP. Hackathon dua hari (3–4 September 2026),
 * bertiga. Demo: briefly-1.vercel.app · Repo: github.com/codeby-dani/TrendDashboard
 *
 * ANGKA DI APLIKASINYA SENDIRI REKAAN, dan itu bagian dari desainnya: angka
 * hasil seed diberi badge "demo data", nilai yang diturunkan script dari file
 * di repo diberi badge "measured". `outcomes` di sini HANYA memakai yang jenis
 * kedua plus fakta build — bukan satu pun metrik analitik dari dalam demo.
 *
 * Aset masih placeholder — tidak ada screenshot yang ikut di DATA-PORTO.
 */
export const briefly: Work = {
  slug: 'briefly',
  title: 'Briefly',
  logo: '/works/briefly/briefly_logo.svg',
  category: 'AI AGENTS | WEBMCP + REACT',
  disciplines: ['ai', 'web'],
  year: '2026',
  description:
    'A content workspace where the agent works on the same surface as the human — it reads the view the person has open, and writes the finished brief into the application library instead of into a chat transcript.',
  summary: [
    { text: 'An AI assistant cannot see the tab you are working in, so every hand-off is a copy-paste. ' },
    {
      text: 'Briefly hands the dashboard its own capabilities through WebMCP: the brief lands in the app library with a status and links to its trend and product, not in a chat log.',
      strong: true,
    },
    {
      text: ' I built the trend table and detail drawer with ten of the registered tools, the calendar and performance views with the last two, and the briefs and schedule stores behind them.',
    },
  ],
  services: [
    'Frontend engineering',
    'WebMCP tool design',
    'State and persistence',
    'Agent interaction design',
  ],
  facts: [
    { label: 'Context', value: 'Two-day hackathon build' },
    { label: 'Role', value: 'Frontend engineer — phases 2 and 5' },
    { label: 'Platform', value: 'Single-page React app, no database' },
    { label: 'Team', value: 'Three people' },
  ],
  stack: ['React', 'TypeScript', 'Vite', 'WebMCP', 'Gemini', 'Vercel'],
  links: [
    { label: 'Open the demo', href: 'https://briefly-1.vercel.app' },
    { label: 'Source on GitHub', href: 'https://github.com/codeby-dani/TrendDashboard' },
  ],
  challenge:
    'Most WebMCP demos register one fixed tool set at page load, and that produces behaviour that is simply wrong: the agent is offered a save-brief tool while the human sits on a settings page, calls it, and fails. The project also had a demonstration problem underneath the engineering one — its central claim is that the tool surface moves with the human, and a surface nobody renders is a claim nobody can see.',
  role: 'Frontend engineer, one of three people over a two-day build. Built phase 2 — the trend table, the trend detail drawer, and the ten WebMCP tools registered from them — and phase 5, the calendar and performance views plus the final two tools. Also worked on the briefs and schedule stores, their persistence layer, and the Briefs and Pending routes.',
  approach: [
    {
      title: 'Derive the tool surface from application state',
      body: 'Six tools on the trends route, four more once a trend is opened, and the brief composer tools registering only after a trend and a product are both selected. Registration follows state through an AbortSignal lifecycle, so the set the agent can see is always exactly the set that can succeed.',
    },
    {
      title: 'Render the claim, do not just make it',
      body: 'A live panel driven by the specification’s toolchange event shows tools appearing as they register and disappearing as they unregister, written in present tense. The footer count is the thing an audience follows while the human clicks around — the argument becomes watchable instead of described.',
    },
    {
      title: 'Draw the line between invented and real, in the interface',
      body: 'Every metric and video in the app is fictional, which risks the whole thing reading as a fabricated analytics product. Seeded numbers carry a demo data badge; values a committed script derives from files in the repository — clip duration, word count, speaking rate — carry a measured badge. The processing is real, the dataset is not, and the app says so.',
    },
  ],
  outcomes: [
    { metric: '12', label: 'WebMCP tools I registered across two phases' },
    { metric: '2', label: 'Days, start to working demo' },
    { metric: '0', label: 'Databases — state persists locally, per browser' },
  ],
  banner: {
    src: '/works/briefly/briefly_banner.svg',
    alt: 'Briefly workspace with the live tool surface panel beside the trend table.',
  },
  gallery: [
    {
      src: '/works/briefly/briefly_surface.svg',
      alt: 'The live tool surface: tools registering and unregistering as the human moves between routes.',
      span: 'half',
    },
    {
      src: '/works/briefly/briefly_flow.svg',
      alt: 'A brief moving from trend to draft to approved, staying linked to its source trend and product.',
      span: 'half',
    },
  ],
  ogAccent: '#7c3aed',
};
