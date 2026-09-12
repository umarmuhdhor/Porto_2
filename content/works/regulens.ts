import type { Work } from './types';

/**
 * ReguLens — pemantauan regulasi otonom untuk eksportir makanan & minuman
 * skala kecil. Dibangun untuk All Things Agentic Hackathon (track Collaborative
 * Partner) mulai Agustus 2026, berdua. Repo: github.com/aliefauzan/ReguLens
 *
 * Angka di `outcomes` diukur di stack yang benar-benar terdeploy (618 test,
 * 25,5 detik untuk satu aturan yang ditempel, 88 limit verbatim dari regulasi
 * yang ditemukan sistem sendiri) — bukan target dan bukan estimasi.
 *
 * Gallery-nya ASLI: screenshot console operasi dari DATA-PORTO.
 */
export const regulens: Work = {
  slug: 'regulens',
  title: 'ReguLens',
  logo: '/works/regulens/regulens_logo.svg',
  category: 'AI AGENTS | PYTHON + GOOGLE ADK',
  disciplines: ['ai', 'web'],
  year: '2026',
  description:
    'Autonomous regulatory monitoring for small food and beverage exporters — it keeps a compliance twin of a product, reconciles it against incoming clauses, and flips the verdict on its own when a rule changes, naming the regulation and quoting the clause.',
  summary: [
    { text: 'A small exporter has no compliance officer, and the rules move without notice. ' },
    {
      text: 'ReguLens is not a regulation chatbot: it keeps a structured twin of the product and reconciles it continuously, so a changed rule flips the verdict with nobody asking.',
      strong: true,
    },
    {
      text: ' I worked both sides of the stack as one of two contributors — the impact engine and its verdicts, the guardrail, query retrieval, streaming extraction, and the operations console.',
    },
  ],
  services: [
    'Agent pipeline engineering',
    'Backend and data modelling',
    'Google Cloud infrastructure',
    'Operations console',
  ],
  facts: [
    { label: 'Context', value: 'All Things Agentic Hackathon — Collaborative Partner track' },
    { label: 'Role', value: 'Full-stack engineer — 39 of 83 commits' },
    { label: 'Platform', value: 'Cloud Run services behind Pub/Sub' },
    { label: 'Team', value: 'Two contributors' },
  ],
  stack: [
    'Python',
    'FastAPI',
    'Google ADK',
    'Gemini',
    'Firestore',
    'Cloud Run',
    'Pub/Sub',
    'Next.js',
    'TypeScript',
  ],
  links: [
    { label: 'Open the console', href: 'https://regulens-web-babuvy7w3a-as.a.run.app' },
    { label: 'Source on GitHub', href: 'https://github.com/aliefauzan/ReguLens' },
  ],
  challenge:
    'A system that confidently declares a false conflict destroys the only thing it has. And an LLM asked to compare two regulatory clauses will always return an answer — including for pairs that were never comparable in the first place, where the substance, the product type, the unit, or the jurisdiction simply do not line up. The same trap sat downstream: a requirement generated from a clause kept applying after that clause had been superseded, so a product could be failed against a rule that no longer existed.',
  role: 'Full-stack engineer, one of two contributors, authoring 39 of 83 commits. Built and corrected the impact engine so a verdict names the rule it actually rests on, made alerts name and link the regulation that moved a verdict, extended the guardrail to read food category, fixed query retrieval to target the market a question names rather than only its wording, reworked extraction to flush each PDF page instead of holding a whole document in memory, and laid the web app out as an operations console rather than a set of pages.',
  approach: [
    {
      title: 'Let deterministic code decide, and the model only advise',
      body: 'A guardrail in plain Python decides whether two clauses may be compared at all — substance family, product type, unit, jurisdiction — before any model is consulted. Different jurisdictions with different limits resolve to a conflict in code. The LLM judge runs only on same-jurisdiction pairs whose effective dates leave the supersede question genuinely open.',
    },
    {
      title: 'Ask the model only what it can actually do',
      body: 'Country discovery needed regulator URLs, and the model got the regulator name and domain root right six times out of six while every path it wrote was wrong. So it names the regulator and nothing else; paths are read from pages actually fetched, and any index it picks outside the supplied link inventory is discarded.',
    },
    {
      title: 'Make a redelivered message a no-op',
      body: 'Pub/Sub delivers at least once and will redeliver, which in a naive pipeline means duplicate clauses and duplicate alerts for one document. Every handler became idempotent through a state check, with redelivery tested rather than assumed, and each clause mutation wrapped in a Firestore transaction so parallel reconciliation cannot race.',
    },
  ],
  outcomes: [
    { metric: '618', label: 'Tests green from a clean checkout, no GCP account' },
    { metric: '88', label: 'Verbatim limits read from a regulation it found itself' },
    { metric: '25.5s', label: 'Pasted rule to alert, on the deployed stack' },
  ],
  banner: {
    src: '/works/regulens/regulens_banner.webp',
    alt: 'ReguLens answering a plain-English compliance question, every claim traced back to the clause it came from.',
  },
  gallery: [
    {
      src: '/works/regulens/regulens_architecture.webp',
      alt: 'ReguLens architecture: watched sources feeding an async Pub/Sub pipeline into in-process ADK agents on Cloud Run.',
      span: 'full',
    },
    {
      src: '/works/regulens/regulens_add-rules.webp',
      alt: 'Add rules screen, offering either the bundled starter rule set or a regulation document to upload.',
      span: 'half',
    },
    {
      src: '/works/regulens/regulens_clauses.webp',
      alt: 'Clauses extracted from an uploaded document, each still linked to the passage it was read from.',
      span: 'half',
    },
    {
      src: '/works/regulens/regulens_watchtower.webp',
      alt: 'Watch screen counting regulations read, rules extracted, and verdicts changed while nobody was looking.',
      span: 'full',
    },
  ],
  ogAccent: '#111111',
};
