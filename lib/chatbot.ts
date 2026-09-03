/**
 * Basis pengetahuan + mesin jawab untuk asisten "ask-me" (AssistantDock).
 *
 * SEMUA jawaban ditanam keras di file ini. Tidak ada model bahasa, tidak ada
 * panggilan jaringan, tidak ada kunci API: pertanyaan pengunjung dicocokkan ke
 * daftar topik di bawah lalu jawaban yang sudah ditulis dikembalikan apa adanya.
 * Konsekuensinya disengaja — bot tidak akan pernah mengarang fakta tentang Umar,
 * dan modul ini murni fungsi (bisa dipanggil dari komponen client tanpa efek).
 *
 * KENAPA pencocokan kata kunci, bukan pencarian semantik: ruang pertanyaannya
 * kecil dan sudah diketahui (siapa, skill, pengalaman, project, kontak). Sinyal
 * terkuat justru kata kunci literal — "flutter", "kontak", "kuliah" — dan
 * skoring literal bisa dibaca serta diperbaiki tanpa menebak isi model.
 *
 * DUA BAHASA: situs berbahasa Inggris, tapi pengunjung Indonesia akan mengetik
 * bahasa Indonesia. Jadi `keys` tiap topik memuat pemicu ID + EN sekaligus,
 * sementara `answer` selalu Inggris supaya sewarna dengan salinan situs.
 *
 * MENAMBAH PENGETAHUAN: tambahkan satu entri ke `TOPICS`. Isi `chip` hanya bila
 * topik itu layak ditawarkan sebagai saran cepat — chip yang terlalu banyak
 * membuat panel terbaca seperti menu, bukan percakapan.
 */

import { SITE } from '@/content/site';

export type ChatLink = { label: string; href: string };

export type ChatTopic = {
  /** Dipakai sebagai key React, target chip, dan rujukan di `next`. */
  id: string;
  /** Label saran cepat. Tanpa ini topik tetap bisa dijawab, hanya tak ditawarkan. */
  chip?: string;
  /**
   * Pemicu, huruf kecil semua. Entri berspasi diperlakukan sebagai frasa
   * (dicocokkan ke seluruh kalimat), entri satu kata dicocokkan per token.
   */
  keys: string[];
  answer: string;
  /** Tautan yang dirender di bawah jawaban. */
  links?: ChatLink[];
  /** Topik lanjutan yang ditawarkan setelah jawaban ini. */
  next?: string[];
};

export const GREETING =
  "Hi — I'm a small bot that answers questions about Umar. Ask me anything about his work, stack, or how to reach him.";

/**
 * Kata yang dibuang sebelum skoring. Isinya kata tanya & fungsi dua bahasa:
 * tanpa ini "apa" pada "apa skill kamu" bernilai sama dengan "skill", dan
 * pertanyaan apa pun akan menyerempet topik yang kebetulan memuat kata tanya.
 */
const STOPWORDS = new Set([
  'a',
  'about',
  'am',
  'an',
  'and',
  'any',
  'anything',
  'are',
  'as',
  'at',
  'be',
  'been',
  'can',
  'could',
  'did',
  'do',
  'does',
  'for',
  'from',
  'get',
  'give',
  'has',
  'have',
  'he',
  'her',
  'him',
  'his',
  'how',
  'i',
  'in',
  'is',
  'it',
  'its',
  'know',
  'like',
  'me',
  'more',
  'my',
  'of',
  'on',
  'or',
  'please',
  'she',
  'should',
  'so',
  'some',
  'tell',
  'that',
  'the',
  'their',
  'them',
  'there',
  'they',
  'this',
  'to',
  'us',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'who',
  'whom',
  'why',
  'will',
  'with',
  'would',
  'you',
  'your',
  'yours',
  'ada',
  'adalah',
  'aja',
  'apa',
  'apakah',
  'atau',
  'bagaimana',
  'bang',
  'banyak',
  'berapa',
  'bisa',
  'boleh',
  'buat',
  'dan',
  'dari',
  'dengan',
  'di',
  'dia',
  'dong',
  'gimana',
  'ini',
  'itu',
  'itu',
  'ke',
  'kah',
  'kalau',
  'kamu',
  'kasih',
  'lu',
  'mas',
  'mau',
  'mba',
  'mbak',
  'mu',
  'nya',
  'pada',
  'punya',
  'saja',
  'saya',
  'sih',
  'siapa',
  'tahu',
  'tau',
  'tentang',
  'untuk',
  'yang',
  'ya',
]);

/**
 * Pengetahuan. Fakta di sini bersumber dari CV & konten situs (content/works/*,
 * AboutWindows, ContactFooter) — kalau salah satunya berubah, perbarui juga di
 * sini supaya bot tidak menjawab dengan versi lama.
 */
export const TOPICS: ChatTopic[] = [
  {
    id: 'greeting',
    keys: [
      'hi',
      'hello',
      'hey',
      'halo',
      'hai',
      'hallo',
      'assalamualaikum',
      'pagi',
      'siang',
      'malam',
      'good morning',
      'good evening',
      'kabar',
    ],
    answer: 'Hey there. Ask me anything about Umar — his work, his stack, or how to reach him.',
    next: ['about', 'skills', 'projects'],
  },
  {
    id: 'about',
    chip: 'Who is Umar?',
    keys: [
      'about umar',
      'who is umar',
      'umar',
      'about him',
      'profile',
      'bio',
      'introduce',
      'perkenalan',
      'kenalan',
      'orangnya',
      'profil',
      'biodata',
    ],
    answer:
      'Umar Muhdhor is an iOS developer from Indonesia. He builds mobile apps with Swift and Flutter, and cares most about interfaces that stay fast and predictable once real people start using them. Informatics graduate from Multi Data Palembang, now building at the Apple Developer Academy in Bali.',
    next: ['skills', 'experience', 'education'],
  },
  {
    id: 'role',
    chip: 'What does he do?',
    keys: [
      'what does he do',
      'job',
      'role',
      'position',
      'work as',
      'profession',
      'developer',
      'pekerjaan',
      'kerja',
      'profesi',
      'posisi',
      'jabatan',
    ],
    answer:
      'He works as an iOS developer. Day to day that means native iOS work in Swift and SwiftUI, cross-platform apps in Flutter, and turning designs into interfaces that behave correctly on real devices and unreliable networks.',
    next: ['skills', 'services', 'projects'],
  },
  {
    id: 'skills',
    chip: 'Tech stack',
    keys: [
      'skill',
      'skills',
      'stack',
      'tech',
      'technology',
      'tools',
      'language',
      'languages',
      'framework',
      'swift',
      'swiftui',
      'flutter',
      'dart',
      'kotlin',
      'react',
      'programming',
      'android',
      'ios',
      'native',
      'keahlian',
      'kemampuan',
      'teknologi',
      'bahasa pemrograman',
      'ngoding',
    ],
    answer:
      'Main stack: Swift and SwiftUI for native iOS, Flutter and Dart for cross-platform. Around that: ARKit and HealthKit on the device side, real-time clients over WebSocket, REST API integration, and Python for automation pipelines. He also works in the web stack this site is built on — Next.js, TypeScript, and Tailwind.',
    next: ['services', 'projects', 'site'],
  },
  {
    id: 'services',
    chip: 'What he can build',
    keys: [
      'services',
      'service',
      'offer',
      'build for me',
      'can he build',
      'help with',
      'layanan',
      'jasa',
      'bikin apa',
      'bisa bikin',
      'ngerjain apa',
    ],
    answer:
      'Three things, mostly: iOS development in Swift, cross-platform apps in Flutter, and AI automation — pipelines where a model handles the judgment calls and code handles everything that has to be exact.',
    next: ['hire', 'projects', 'contact'],
  },
  {
    id: 'projects',
    chip: 'His projects',
    keys: [
      'project',
      'projects',
      'portfolio',
      'work',
      'works',
      'case study',
      'apps',
      'app',
      'built',
      'shipped',
      'proyek',
      'karya',
      'aplikasi',
      'pengalaman project',
    ],
    answer:
      'Six pieces of work are written up on this site — three recent builds, then the roles behind them:\n\n• Load Away — a satirical iOS game whose loading bar only fills when you look away (2026)\n• Popshot!! — an iOS app that turns group travel photos into a game (2026)\n• Shopify Automation — an agent pipeline turning supplier links into review-ready drafts (2026)\n• ABSATA — a Flutter attendance app for staff at DPR RI (2024)\n• Higgz Academia — freelance edtech problem-solving and video tutorials (2023–2024)\n• MDP Lecturing — assistant lecturer work at Multi Data Palembang (2023–2024)\n\nAsk me about any of them, or scroll to the project index for the full case studies.',
    next: ['loadaway', 'popshot', 'shopifyauto'],
  },
  {
    id: 'loadaway',
    chip: 'Load Away',
    keys: [
      'load away',
      'loadaway',
      'game',
      'games',
      'arkit',
      'gaze',
      'loading bar',
      'watch',
      'apple watch',
      'watchos',
      'heart rate',
      'testflight',
    ],
    answer:
      "Load Away is a satirical iOS game built at the Apple Developer Academy: the loading bar advances only while you are NOT looking at it. Umar built the gameplay engine and the ARKit gaze pipeline — head angle re-derived as face-to-camera geometry, five anti-cheat guards on top (eye-gaze peek check, eyes-closed path, frozen-mesh detector, identity lock, peek tax) — plus a watchOS companion streaming live heart rate into the bar's volatility.",
    links: [
      { label: 'Read the case study', href: '/works/load-away' },
      { label: 'Try it on TestFlight', href: 'https://testflight.apple.com/join/pFp5njxz' },
      { label: 'Source on GitHub', href: 'https://github.com/aliefauzan/LoadAway' },
    ],
    next: ['popshot', 'academy', 'skills'],
  },
  {
    id: 'popshot',
    chip: 'Popshot!!',
    keys: [
      'popshot',
      'pop shot',
      'travel',
      'trip',
      'photo app',
      'camera app',
      'shared album',
      'websocket',
      'realtime',
      // Ditulis sebagai FRASA ('real time'), bukan 'real-time': tokenizer
      // mengganti tiap non-alfanumerik dengan spasi, jadi key bertanda hubung
      // tidak akan pernah sama dengan token mana pun — pemicunya mati sejak
      // lahir. Sebagai frasa, ia dicocokkan ke kalimat yang sudah dinormalkan,
      // sehingga "real-time" DAN "real time" dua-duanya kena.
      'real time',
    ],
    answer:
      'Popshot!! turns documenting a group trip into the game itself: everyone gets photo challenges, each person picks an exclusive sidequest, and the shared album unlocks only once the trip ends. Umar built the iOS side in Swift — auth, join-by-code, the real-time waiting room over WebSocket, the camera and its challenge overlay, upload with retry, and the album screens. The Go backend was built by teammates.',
    links: [
      { label: 'Read the case study', href: '/works/popshot' },
      { label: 'Try it on TestFlight', href: 'https://testflight.apple.com/join/dts9hnCS' },
    ],
    next: ['loadaway', 'shopifyauto', 'skills'],
  },
  {
    id: 'shopifyauto',
    chip: 'Shopify Automation',
    keys: [
      'shopify',
      'automation',
      'automate',
      'ai automation',
      'agent',
      'python',
      'scraping',
      'scraper',
      'pipeline',
      'otomasi',
    ],
    answer:
      'Shopify Automation turns one supplier product link into a review-ready draft product — brand copy, linked colour and size variants, cost, size chart, and photos. The design decision that shapes it: the model decides only four things per product, and deterministic Python does the rest, including every line of GraphQL. A verification gate then re-reads the created product and checks every rule against the live store, so nothing reports success on trust alone.',
    links: [{ label: 'Read the case study', href: '/works/shopify-automation' }],
    next: ['loadaway', 'skills', 'hire'],
  },
  {
    id: 'absata',
    chip: 'ABSATA',
    keys: ['absata', 'dpr', 'dpr ri', 'attendance', 'absensi', 'magang dpr', 'internship app'],
    answer:
      'ABSATA is a mobile attendance system Umar built during his internship at DPR RI, the Indonesian House of Representatives (Sep–Dec 2024). One Flutter codebase serving two staff roles, with secure login, a dashboard, and real-time attendance tracking wired to a REST API — built inside a team workflow with proper branching and reviews.',
    links: [{ label: 'Read the case study', href: '/works/absata' }],
    next: ['higgz', 'mdp', 'experience'],
  },
  {
    id: 'higgz',
    chip: 'Higgz Academia',
    keys: [
      'higgz',
      'higgz academia',
      'edtech',
      'tutorial',
      'math',
      'maths',
      'matematika',
      'freelance work',
    ],
    answer:
      'Higgz Academia Technology PTE. LTD is a Singapore company; Umar freelanced for them from February 2023 to February 2024 — solving a wide range of maths problems at above 90% daily accuracy and recording a video tutorial for each one. Same format every time, so learners could follow the reasoning instead of just the answer.',
    links: [{ label: 'Read the case study', href: '/works/higgz-academia' }],
    next: ['absata', 'mdp', 'experience'],
  },
  {
    id: 'mdp',
    chip: 'MDP Lecturing',
    keys: [
      'mdp lecturing',
      'lecturer',
      'teaching',
      'assistant lecturer',
      'mengajar',
      'dosen',
      'asisten dosen',
      'ngajar',
    ],
    answer:
      'From September 2023 to January 2024 Umar was an assistant lecturer at Multi Data Palembang: one-on-one support for 50+ students, rebuilt course material that lifted class participation by around 20%, and assessment for three classes across two courses under a single rubric.',
    links: [{ label: 'Read the case study', href: '/works/mdp-teaching' }],
    next: ['absata', 'higgz', 'education'],
  },
  {
    id: 'experience',
    chip: 'Experience',
    // Frasa "pengalaman kerja"/"work experience" ditulis eksplisit: tanpa itu
    // "kerja" menarik pertanyaan ini ke topik `role` lewat seri skor.
    keys: [
      'experience',
      'career',
      'history',
      'background',
      'worked',
      'internship',
      'intern',
      'years',
      'work experience',
      'pengalaman',
      'pengalaman kerja',
      'riwayat',
      'magang',
      'karir',
      'karier',
      'berapa lama',
    ],
    answer:
      'Short version, most recent first:\n\n• Apple Developer Academy, Bali — building now, 2026 (Load Away, Popshot!!)\n• DPR RI — mobile application developer intern, Sep–Dec 2024 (ABSATA)\n• Higgz Academia (Singapore) — freelance problem solver and tutorial author, Feb 2023 – Feb 2024\n• Multi Data Palembang — assistant lecturer, Sep 2023 – Jan 2024',
    next: ['academy', 'absata', 'education'],
  },
  {
    id: 'academy',
    chip: 'Apple Developer Academy',
    keys: [
      'apple developer academy',
      'academy',
      'apple',
      'akademi',
      'developer academy',
      'lagi ngapain',
      'right now',
      'currently',
      'sekarang',
    ],
    answer:
      "He's currently at the Apple Developer Academy in Bali (2026) — going deep on SwiftUI and native platform APIs, and shipping projects with a cohort of other developers and designers. Load Away, the gaze-controlled game on this site, came out of it.",
    next: ['skills', 'location', 'hire'],
  },
  {
    id: 'education',
    chip: 'Education',
    keys: [
      'education',
      'study',
      'studied',
      'university',
      'campus',
      'degree',
      'college',
      'graduate',
      'gpa',
      'major',
      'informatics',
      'pendidikan',
      'kuliah',
      'kampus',
      'jurusan',
      'lulusan',
      'ipk',
      's1',
      'exchange',
      'pertukaran',
    ],
    answer:
      "Bachelor's in Informatics from Multi Data Palembang, graduating with a 3.99 GPA, with a semester on student exchange at Dian Nuswantoro University in Semarang along the way. After that, the Apple Developer Academy in Bali — which is less classroom and more shipping real projects.",
    next: ['academy', 'experience', 'skills'],
  },
  {
    id: 'location',
    chip: 'Where is he?',
    keys: [
      'location',
      'located',
      'based',
      'city',
      'country',
      'live',
      'lives',
      'remote',
      'timezone',
      'relocate',
      'lokasi',
      'domisili',
      'tinggal',
      'kota',
      'dimana',
      'negara',
    ],
    answer:
      'Based in Bali, Indonesia (GMT+8). He works remotely with teams across Asia and further out, and is used to async collaboration.',
    next: ['hire', 'contact', 'availability'],
  },
  {
    id: 'availability',
    chip: 'Is he available?',
    keys: [
      'available',
      'availability',
      'open to work',
      'available for',
      'looking for',
      'hiring',
      'free',
      'capacity',
      'lowongan',
      'tersedia',
      'terima kerja',
      'open',
    ],
    answer:
      "Yes — he's open to remote collaboration, freelance builds, and full-time iOS roles. The fastest way to check current capacity is to email him directly.",
    next: ['contact', 'hire', 'location'],
  },
  {
    id: 'hire',
    chip: 'Work with him',
    keys: [
      'hire',
      'hiring',
      'work with',
      'collaborate',
      'collaboration',
      'freelance',
      'project rate',
      'budget',
      'price',
      'cost',
      'quote',
      'rate',
      'how much',
      'kerjasama',
      'rekrut',
      'harga',
      'harga jasa',
      'tarif',
      'biaya',
      'ngajak kerja',
    ],
    answer:
      "Send him a note with what you're building, the platform, and roughly when you need it — he'll come back with whether it's a fit and what it would take. Rates depend on scope, so they're discussed per project rather than listed.",
    links: [{ label: 'Email umar', href: SITE.mailto }],
    next: ['contact', 'services', 'availability'],
  },
  {
    id: 'contact',
    chip: 'Contact',
    keys: [
      'contact',
      'email',
      'reach',
      'mail',
      'linkedin',
      'instagram',
      'github',
      'repo',
      'source code',
      'social',
      'dm',
      'phone',
      'whatsapp',
      'kontak',
      'hubungi',
      'nomor',
      'surel',
      'sosmed',
      'medsos',
    ],
    answer: `Email is the surest way: ${SITE.email}. His code is on GitHub as @${SITE.githubHandle}, and he's on LinkedIn and Instagram too.`,
    links: [
      { label: SITE.email, href: SITE.mailto },
      { label: 'GitHub', href: SITE.github },
      { label: 'LinkedIn', href: SITE.linkedin },
      { label: 'Instagram', href: SITE.instagram },
    ],
    next: ['hire', 'availability'],
  },
  {
    id: 'resume',
    chip: 'Resume',
    keys: ['resume', 'cv', 'curriculum vitae', 'lamaran', 'berkas'],
    answer: `There's no download link on the site yet. Email him at ${SITE.email} and he'll send the latest CV over — meanwhile, the project index here covers most of what's on it.`,
    links: [{ label: 'Email umar', href: SITE.mailto }],
    next: ['experience', 'contact'],
  },
  {
    id: 'interests',
    keys: [
      'hobby',
      'hobbies',
      'interest',
      'interests',
      'fun',
      'outside work',
      'spare time',
      'hobi',
      'kesukaan',
      'waktu luang',
      'di luar kerja',
    ],
    answer:
      'Outside client work he keeps shipping side projects and pulls new frameworks apart to see how they hold up. Teaching is a soft spot too — the assistant lecturer year left a mark.',
    next: ['projects', 'academy'],
  },
  {
    id: 'site',
    chip: 'About this site',
    keys: [
      'this site',
      'this website',
      'website',
      'built this',
      'made this',
      'site stack',
      'situs ini',
      'web ini',
      'website ini',
      'dibuat pakai',
      'bikin web',
    ],
    answer:
      'This site is Next.js and TypeScript, styled with Tailwind, with GSAP and Framer Motion driving the scroll choreography, three.js for the 3D object, and Supabase behind the guestbook and live cursors. Umar built it himself.',
    next: ['skills', 'projects'],
  },
  {
    id: 'bot',
    keys: [
      'are you umar',
      'are you real',
      'real person',
      'are you ai',
      'chatgpt',
      'bot',
      'robot',
      'human',
      'person',
      'who are you',
      'kamu siapa',
      'beneran umar',
      'manusia',
      'ai',
      'asli',
    ],
    answer: `Not Umar — I'm a small scripted bot on his site. Every answer I give is hardcoded, so I can't improvise. Anything I don't have, email Umar directly at ${SITE.email}.`,
    next: ['about', 'contact'],
  },
  {
    id: 'thanks',
    keys: [
      'thanks',
      'thank you',
      'thx',
      'nice',
      'cool',
      'awesome',
      'makasih',
      'terima kasih',
      'mantap',
      'keren',
      'oke',
      'ok',
      'sip',
    ],
    answer: 'Anytime. Anything else you want to know about Umar?',
    next: ['projects', 'contact'],
  },
];

const BY_ID = new Map(TOPICS.map((topic) => [topic.id, topic]));

/** Topik yang ditawarkan saat panel baru dibuka atau saat bot kehilangan arah. */
export const DEFAULT_CHIPS = ['about', 'skills', 'projects', 'contact'];

export const FALLBACK = `I don't have that one written down — my answers are hardcoded, so I only know what Umar put in me. Try one of these, or email him at ${SITE.email}.`;

export type Chip = { id: string; label: string };

export function topicById(id: string): ChatTopic | undefined {
  return BY_ID.get(id);
}

/** Chip untuk daftar id; id tanpa label `chip` dilewati diam-diam. */
export function chipsFor(ids: readonly string[]): Chip[] {
  return ids
    .map((id) => BY_ID.get(id))
    .filter((topic): topic is ChatTopic => Boolean(topic?.chip))
    .map((topic) => ({ id: topic.id, label: topic.chip as string }));
}

/**
 * Buang tanda baca & diakritik, sisakan token bermakna.
 * Diakritik dinormalkan supaya "dimana" dan "dímana" tidak jadi dua kata beda.
 */
function tokenize(input: string): { text: string; tokens: string[] } {
  const text = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  return {
    text,
    tokens: text.split(' ').filter((token) => token.length > 0 && !STOPWORDS.has(token)),
  };
}

/**
 * Skor satu topik terhadap masukan.
 *
 * Frasa dinilai jauh lebih tinggi dari kata tunggal dan dikalikan jumlah kata:
 * "apple developer academy" adalah bukti niat yang jauh lebih kuat daripada
 * kebetulan menyebut "apple". Awalan (`startsWith`) diberi nilai kecil supaya
 * bentuk berimbuhan ("projects", "aplikasinya") tetap kena tanpa menyamakan
 * kata pendek yang kebetulan berbagi tiga huruf pertama.
 */
function scoreTopic(topic: ChatTopic, text: string, tokens: string[]): number {
  let score = 0;

  for (const key of topic.keys) {
    if (key.includes(' ')) {
      if (text.includes(key)) score += 4 * key.split(' ').length;
      continue;
    }

    for (const token of tokens) {
      if (token === key) {
        score += 3;
      } else if (key.length >= 5 && (token.startsWith(key) || key.startsWith(token))) {
        score += 1;
      }
    }
  }

  return score;
}

/**
 * Ambang minimum. Satu kecocokan awalan (nilai 1) sengaja TIDAK cukup: itu
 * tingkat kemiripan di mana "kar" pada "karya" bisa menyeret topik "karir",
 * dan jawaban salah lebih merugikan daripada mengaku tidak tahu.
 */
const MIN_SCORE = 3;

/** Topik paling cocok, atau null kalau tak ada yang melewati ambang. */
export function matchTopic(input: string): ChatTopic | null {
  const { text, tokens } = tokenize(input);
  if (text.length === 0) return null;

  let best: ChatTopic | null = null;
  let bestScore = 0;

  for (const topic of TOPICS) {
    const score = scoreTopic(topic, text, tokens);
    // `>` bukan `>=`: seri dimenangkan topik yang lebih dulu di TOPICS, jadi
    // urutan array itu sekaligus urutan prioritas yang bisa diatur.
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }

  return bestScore >= MIN_SCORE ? best : null;
}
