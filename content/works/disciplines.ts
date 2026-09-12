/**
 * Disiplin project — sumbu KEDUA di samping `category`.
 *
 * KENAPA BUKAN PAKAI `category` SAJA: `category` itu kalimat bebas per project
 * ("IOS GAME | SWIFTUI + ARKIT", "AI AUTOMATION | PYTHON"). Bagus dibaca, tapi
 * tidak bisa difilter — tidak ada dua project yang menuliskannya sama, dan
 * mencocokkannya dengan substring akan pecah begitu satu judul diubah. Disiplin
 * ini himpunan tertutup dan diketik, jadi filter di `/works` mustahil meleset,
 * dan salah ketik jatuh saat type-check, bukan sebagai chip kosong di produksi.
 *
 * SATU PROJECT BISA PUNYA LEBIH DARI SATU. Itu memang kenyataannya: pipeline
 * Shopify adalah kerja AI yang seluruh permukaannya platform web. Karena itu
 * `disciplines` array, bukan satu nilai — memaksa satu label akan menghapus
 * separuh isi project dari halaman filter.
 *
 * `teaching` ada karena dua entri di registry (Higgz, MDP) memang bukan app,
 * bukan web, bukan AI. Pilihannya: menempelkan salah satu label teknis ke
 * pekerjaan mengajar (klaim palsu), atau membiarkannya tanpa tag (hilang dari
 * setiap filter). Bucket keempat lebih jujur daripada dua-duanya.
 */

export type DisciplineId = 'app' | 'web' | 'ai' | 'teaching';

export interface Discipline {
  id: DisciplineId;
  /** Label penuh — dipakai di chip filter `/works`. */
  label: string;
  /** Label pendek untuk tag di sel grid homepage yang sempit. */
  short: string;
  /** Satu kalimat di bawah filter aktif; menjelaskan apa isi bucket ini. */
  blurb: string;
}

/** Urutan = urutan chip filter. */
export const DISCIPLINES: readonly Discipline[] = [
  {
    id: 'app',
    label: 'App',
    short: 'App',
    blurb:
      'Native and cross-platform mobile work — iOS in Swift, and Flutter where both stores matter.',
  },
  {
    id: 'web',
    label: 'Web',
    short: 'Web',
    blurb:
      'Work that lives on a web platform — storefront APIs, browser automation, and the services behind them.',
  },
  {
    id: 'ai',
    label: 'AI Automation',
    short: 'AI',
    blurb:
      'Pipelines where a model does the judgement and deterministic code does everything else.',
  },
  {
    id: 'teaching',
    label: 'Teaching',
    short: 'Teaching',
    blurb: 'Material, mentoring, and assessment — explaining the thing rather than building it.',
  },
];

const BY_ID = new Map(DISCIPLINES.map((discipline) => [discipline.id, discipline]));

/** Lempar untuk id tak dikenal: tipe sudah menjaganya, ini jaring saat data datang dari URL. */
export function getDiscipline(id: DisciplineId): Discipline {
  const discipline = BY_ID.get(id);
  if (!discipline) throw new Error(`Disiplin tidak dikenal: ${id}`);
  return discipline;
}

/** true kalau string sembarang (mis. `?tag=` di URL) adalah id yang sah. */
export function isDisciplineId(value: string | undefined): value is DisciplineId {
  return value !== undefined && BY_ID.has(value as DisciplineId);
}
