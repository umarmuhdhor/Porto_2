/**
 * Generator aset placeholder case study — menulis `public/works/{slug}/*.svg`.
 *
 * KENAPA DIGENERATE (sama alasannya dengan scripts/generate-brand-object.mjs):
 * aset visual harus milik sendiri / lisensi jelas (PRD §12 #1). Membangkitkan
 * placeholder dari kode menghindari stock image berlisensi kabur, sekaligus
 * mengunci rasio tiap slot supaya bento grid sudah rapi sejak sebelum foto
 * aslinya ada (M5 §5).
 *
 * INI PLACEHOLDER, BUKAN ASET FINAL. Saat gambar asli siap, timpa file di
 * public/works/{slug}/ dengan .webp berukuran sama dan perbarui `src` di
 * content/works/{slug}.ts. Script ini boleh ikut dihapus saat itu.
 *
 * MANIFEST di bawah MENCERMINKAN content/works/*.ts — TypeScript tidak bisa
 * diimpor langsung dari script node polos, jadi slug/nama aset/rasio ditulis
 * ulang di sini. Kalau menambah gambar di file konten, tambahkan juga di sini.
 *
 * Jalankan: pnpm run gen:works
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Rasio dikunci per peran slot — harus cocok dengan BentoGallery. */
const RATIO = {
  banner: [1600, 900],
  full: [1600, 900],
  half: [1200, 800],
  portrait: [900, 1200],
};

/**
 * MANIFEST — cerminan content/works/*.ts dan content/works/cards.ts.
 *
 * `logo: false` berarti project itu SUDAH PUNYA logo asli di public/works/ dan
 * script ini tidak boleh menyentuhnya. Tanpa flag itu `pnpm gen:works` menimpa
 * ikon aplikasi Load Away yang asli dengan kotak huruf — kegagalan senyap yang
 * baru ketahuan saat melihat halamannya.
 *
 * Aset yang sudah diganti gambar asli (.webp) sengaja TIDAK didaftarkan di
 * sini: mendaftarkannya hanya menghasilkan .svg yatim yang tidak dirujuk siapa
 * pun. Yang ada di daftar `assets` di bawah = yang masih placeholder.
 */
const PROJECTS = [
  {
    slug: 'load-away',
    title: 'Load Away',
    // Ikon aplikasi aslinya sudah ada — jangan digenerate ulang.
    logo: false,
    accent: '#db0700',
    assets: [
      ['banner', 'banner'],
      ['screens', 'half'],
      ['system', 'half'],
      ['graphics', 'full'],
    ],
  },
  {
    slug: 'popshot',
    title: 'PopShot!!',
    monogram: 'P',
    accent: '#153861',
    // `welcome` sudah screenshot asli (.webp) — tidak didaftarkan.
    assets: [
      ['banner', 'banner'],
      ['waiting-room', 'portrait'],
      ['screens', 'half'],
      ['flow', 'half'],
      ['graphics', 'full'],
    ],
  },
  {
    slug: 'hisplora',
    title: 'Hisplora',
    monogram: 'H',
    accent: '#54453e',
    // Seluruh gallery-nya sudah screenshot asli; hanya banner yang belum.
    assets: [['banner', 'banner']],
  },
  {
    slug: 'regulens',
    title: 'ReguLens',
    monogram: 'R',
    accent: '#111111',
    // Banner & gallery semuanya asli — di sini tinggal logo-nya.
    assets: [],
  },
  {
    slug: 'shopify-automation',
    title: 'Shopify Automation',
    monogram: 'S',
    accent: '#334155',
    assets: [
      ['pipeline', 'half'],
      ['rules', 'half'],
      ['graphics', 'full'],
    ],
  },
  {
    slug: 'briefly',
    title: 'Briefly',
    monogram: 'B',
    accent: '#7c3aed',
    assets: [
      ['banner', 'banner'],
      ['surface', 'half'],
      ['flow', 'half'],
    ],
  },
  {
    slug: 'logic-and-code',
    title: 'Logic & Code',
    monogram: 'L',
    accent: '#e61919',
    assets: [
      ['engine', 'half'],
      ['admin', 'half'],
    ],
  },
  {
    slug: 'absata',
    title: 'ABSATA',
    monogram: 'A',
    accent: '#2f6df6',
    assets: [
      ['banner', 'banner'],
      ['screens', 'half'],
      ['system', 'half'],
      ['graphics', 'full'],
    ],
  },
  {
    slug: 'higgz-academia',
    title: 'Higgz Academia',
    monogram: 'H',
    accent: '#1f8a6d',
    assets: [
      ['banner', 'banner'],
      ['screens', 'half'],
      ['illustration', 'half'],
      ['graphics', 'full'],
      ['system', 'half'],
      ['detail', 'half'],
    ],
  },
  {
    slug: 'mdp-teaching',
    title: 'MDP Lecturing',
    monogram: 'M',
    accent: '#b4442a',
    assets: [
      ['banner', 'banner'],
      ['graphics', 'half'],
      ['illustration', 'half'],
      ['screens', 'full'],
    ],
  },

  /*
   * Entri indeks tanpa halaman case study (content/works/cards.ts). Masing-
   * masing cuma butuh SATU gambar — thumbnail di baris `/works` — dan tidak
   * punya field `logo` sama sekali, jadi `logo: false` di sini bukan
   * penghematan melainkan kebenaran: tidak ada slot yang merendernya.
   */
  {
    slug: 'balive',
    title: 'Balive',
    card: true,
    logo: false,
    accent: '#0d9488',
    assets: [['banner', 'banner']],
  },
  {
    slug: 'pelican',
    title: 'PELICAN',
    card: true,
    logo: false,
    accent: '#0369a1',
    assets: [['banner', 'banner']],
  },
  {
    slug: 'colab',
    title: 'COLAB',
    card: true,
    logo: false,
    accent: '#db2777',
    assets: [['banner', 'banner']],
  },
  {
    slug: 'suwotify',
    title: 'Suwotify',
    card: true,
    logo: false,
    accent: '#16a34a',
    assets: [['banner', 'banner']],
  },
  {
    slug: 'filmu',
    title: 'Filmu',
    card: true,
    logo: false,
    accent: '#c2410c',
    assets: [['banner', 'banner']],
  },
];

/**
 * Penjaga anti-basi. Manifest di atas ditulis ulang dengan tangan karena script
 * node polos tidak bisa mengimpor TypeScript, dan itu persis kondisi yang bikin
 * ia menyimpang: sebelumnya isinya tiga slug (`halo-banking`, `terra-atlas`,
 * `kopi-kultur`) yang sudah lama tidak ada di content/works — menjalankan
 * script hanya akan membuat tiga folder yatim dan TIDAK menyentuh aset yang
 * benar-benar dipakai, tanpa satu pun peringatan.
 *
 * Sekarang script berhenti kalau slug di sini tidak punya file konten yang
 * cocok. Sengaja dicek terhadap keberadaan FILE, bukan isi lib/works.ts:
 * mencocokkan nama file cukup untuk menangkap penyimpangan tanpa harus
 * mem-parse TypeScript.
 */
function assertSlugsExist() {
  // Entri kartu tidak punya file sendiri — semuanya tinggal di cards.ts, jadi
  // yang dicek keberadaan slug-nya DI DALAM file itu, bukan nama filenya.
  const cardsFile = resolve(ROOT, 'content/works/cards.ts');
  const cardsSource = existsSync(cardsFile) ? readFileSync(cardsFile, 'utf8') : '';

  const missing = PROJECTS.filter((project) =>
    project.card
      ? !cardsSource.includes(`slug: '${project.slug}'`)
      : !existsSync(resolve(ROOT, 'content/works', `${project.slug}.ts`)),
  ).map((project) => project.slug);

  if (missing.length > 0) {
    console.error(
      `\n✗ Manifest di scripts/generate-work-placeholders.mjs sudah menyimpang.\n` +
        `  Slug tanpa content/works/<slug>.ts (atau tanpa entri di cards.ts): ${missing.join(', ')}\n` +
        `  Samakan manifest dengan isi content/works/ lalu jalankan lagi.\n`,
    );
    process.exit(1);
  }
}

/** Latar sama dengan --color-cream di app/globals.css. */
const CREAM = '#f7f1ed';

/** Hash string → int stabil, supaya komposisi tiap aset beda tapi reproducible. */
function hash(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** PRNG kecil dari seed — dipakai untuk menempatkan bentuk. */
function rng(seed) {
  let state = seed || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

/**
 * Komposisi abstrak: blok besar + lingkaran + satu kurva, semua turunan warna
 * aksen project. Tujuannya cuma memberi bobot visual & rasio yang benar.
 */
function composition(w, h, accent, seed) {
  const rand = rng(seed);
  const parts = [];

  const blockW = w * (0.34 + rand() * 0.22);
  const blockH = h * (0.36 + rand() * 0.3);
  const blockX = w * (0.06 + rand() * 0.2);
  const blockY = h * (0.12 + rand() * 0.22);
  parts.push(
    `<rect x="${blockX.toFixed(1)}" y="${blockY.toFixed(1)}" width="${blockW.toFixed(1)}" height="${blockH.toFixed(1)}" rx="${(Math.min(blockW, blockH) * 0.08).toFixed(1)}" fill="${accent}" opacity="0.9"/>`,
  );

  const r = Math.min(w, h) * (0.16 + rand() * 0.12);
  const cx = w * (0.58 + rand() * 0.3);
  const cy = h * (0.3 + rand() * 0.4);
  parts.push(
    `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${accent}" opacity="0.35"/>`,
  );

  const y0 = h * (0.6 + rand() * 0.2);
  const y1 = h * (0.2 + rand() * 0.4);
  parts.push(
    `<path d="M0 ${y0.toFixed(1)} C ${(w * 0.3).toFixed(1)} ${y1.toFixed(1)}, ${(w * 0.7).toFixed(1)} ${(h - y1).toFixed(1)}, ${w} ${(h - y0 * 0.4).toFixed(1)}" fill="none" stroke="${accent}" stroke-width="${(Math.min(w, h) * 0.014).toFixed(1)}" opacity="0.55" stroke-linecap="round"/>`,
  );

  const barY = h * 0.78;
  const barCount = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < barCount; i += 1) {
    const bw = w * (0.05 + rand() * 0.09);
    const bx = w * 0.08 + i * (w * 0.13);
    parts.push(
      `<rect x="${bx.toFixed(1)}" y="${barY.toFixed(1)}" width="${bw.toFixed(1)}" height="${(h * 0.035).toFixed(1)}" rx="${(h * 0.0175).toFixed(1)}" fill="#0a0a0a" opacity="0.12"/>`,
    );
  }

  return parts.join('\n  ');
}

function imageSvg({ w, h, accent, title, role, seed }) {
  const label = `${title} — ${role}`.toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}">
  <rect width="${w}" height="${h}" fill="${CREAM}"/>
  ${composition(w, h, accent, seed)}
  <text x="${(w * 0.06).toFixed(1)}" y="${(h * 0.94).toFixed(1)}" font-family="system-ui, sans-serif" font-size="${(h * 0.032).toFixed(1)}" letter-spacing="${(h * 0.006).toFixed(1)}" fill="#0a0a0a" opacity="0.45">${label}</text>
</svg>
`;
}

/** Logo mark: monogram di dalam kotak aksen — cukup untuk mengisi slot header. */
function logoSvg({ monogram, accent, title }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" role="img" aria-label="${title} logo">
  <rect width="96" height="96" rx="22" fill="${accent}"/>
  <text x="48" y="63" text-anchor="middle" font-family="system-ui, sans-serif" font-size="46" font-weight="700" fill="${CREAM}">${monogram}</text>
</svg>
`;
}

assertSlugsExist();

let written = 0;
for (const project of PROJECTS) {
  const dir = resolve(ROOT, 'public/works', project.slug);
  mkdirSync(dir, { recursive: true });

  if (project.logo !== false) {
    writeFileSync(resolve(dir, `${project.slug}_logo.svg`), logoSvg(project), 'utf8');
    written += 1;
  }

  for (const [role, slot] of project.assets) {
    const [w, h] = RATIO[slot];
    const svg = imageSvg({
      w,
      h,
      accent: project.accent,
      title: project.title,
      role,
      seed: hash(`${project.slug}_${role}`),
    });
    writeFileSync(resolve(dir, `${project.slug}_${role}.svg`), svg, 'utf8');
    written += 1;
  }
}

console.log(`generate-work-placeholders: wrote ${written} file(s) to public/works/`);
