/**
 * Aturan bersama guestbook — dipakai route handler (server) DAN form (client).
 *
 * Isinya sengaja pure & tanpa dependensi runtime: batas panjang yang sama harus
 * berlaku di dua sisi, dan menaruhnya di satu file mencegah `maxLength` di input
 * dan `check` di database saling meleset. Validasi client cuma untuk umpan balik
 * cepat — server tetap memvalidasi ulang dari nol (client bisa dilewati).
 */

export const NICKNAME_MAX = 32;
export const BODY_MIN = 2;
export const BODY_MAX = 500;

/** Jumlah komentar yang dikirim ke client per muat. */
export const PAGE_SIZE = 50;

/** Rate limit per ip_hash: 1 komentar / menit, 5 komentar / jam. */
export const RATE_BURST = { windowSec: 60, max: 1 };
export const RATE_HOURLY = { windowSec: 3600, max: 5 };

export interface GuestbookEntry {
  id: string;
  /** null = pengirim tidak mengisi nama; UI menampilkannya sebagai "Anonymous". */
  nickname: string | null;
  body: string;
  created_at: string;
}

export type ValidationResult =
  { ok: true; value: { nickname: string | null; body: string } } | { ok: false; error: string };

/**
 * Buang karakter kontrol & zero-width, lalu padatkan deret baris baru.
 *
 * Zero-width (U+200B–U+200D, U+FEFF) dipakai untuk menyelundupkan kata lewat
 * filter — `k<ZWSP>ontol` terbaca wajar oleh mata tapi lolos regex kata. Dibuang
 * di sini, SEBELUM filter, supaya filter melihat teks yang sama dengan pembaca.
 * Deret `\n` >2 dipadatkan agar satu komentar tak bisa mendorong komentar lain
 * keluar layar.
 *
 * Ditulis sebagai filter code point, bukan char class regex: kelas berisi
 * karakter kontrol literal tak terbaca di diff dan gampang rusak saat di-edit.
 */
function clean(input: string): string {
  const stripped = Array.from(input)
    .filter((ch) => {
      const code = ch.codePointAt(0) as number;
      if (code === 0x09 || code === 0x0a) return true; // tab & newline dipertahankan
      if (code < 0x20 || code === 0x7f) return false; // sisa kontrol (termasuk CR)
      return code !== 0x200b && code !== 0x200c && code !== 0x200d && code !== 0xfeff;
    })
    .join('');

  return stripped.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Daftar kata kasar ID + EN. SENGAJA pendek: filter kata selalu bocor di dua
 * arah (kata kasar baru lolos, kata wajar kena false positive), jadi ia di sini
 * cuma penyapu sampah paling jelas — moderasi sebenarnya tetap manual lewat
 * dashboard Supabase.
 */
const BANNED = [
  'anjing',
  'anjay',
  'asu',
  'bangsat',
  'bajingan',
  'kontol',
  'memek',
  'ngentot',
  'jancok',
  'jancuk',
  'pepek',
  'pantek',
  'goblok',
  'tolol',
  'fuck',
  'shit',
  'bitch',
  'cunt',
  'asshole',
  'nigger',
  'faggot',
  'retard',
];

/** Normalisasi leetspeak (`k0nt0l`, `sh1t`) supaya tidak lolos filter. */
function normalizeForFilter(text: string): string {
  return text
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/[1|!]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/[4@]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/7/g, 't')
    .replace(/[^a-z\s]/g, ' ');
}

function hasBannedWord(text: string): boolean {
  const normalized = normalizeForFilter(text);
  // `\w*` di ekor menangkap imbuhan (`goblokk`, `fucking`) tanpa ikut memakan
  // kata lain, karena batas depan tetap `\b`.
  return BANNED.some((word) => new RegExp(`\\b${word}\\w*\\b`).test(normalized));
}

/** Blok komentar yang isinya cuma URL — pola spam paling umum di guestbook. */
const URL_RE = /https?:\/\/\S+|www\.\S+/gi;

function isLinkSpam(body: string): boolean {
  const links = body.match(URL_RE) ?? [];
  if (links.length === 0) return false;
  if (links.length > 2) return true;
  // Link boleh, asal komentarnya punya isi lain yang layak dibaca.
  return body.replace(URL_RE, '').trim().length < 20;
}

/**
 * Satu-satunya gerbang validasi. Server memanggilnya sebelum insert; client
 * memanggilnya untuk umpan balik sebelum request dikirim.
 */
export function validateEntry(rawNickname: unknown, rawBody: unknown): ValidationResult {
  if (typeof rawBody !== 'string') return { ok: false, error: 'Write something first.' };
  if (rawNickname !== undefined && rawNickname !== null && typeof rawNickname !== 'string') {
    return { ok: false, error: 'That name is not valid.' };
  }

  const body = clean(rawBody);
  const nickname = clean(typeof rawNickname === 'string' ? rawNickname : '');

  if (body.length < BODY_MIN) return { ok: false, error: 'That is a bit too short.' };
  if (body.length > BODY_MAX) return { ok: false, error: `Keep it under ${BODY_MAX} characters.` };
  if (nickname.length > NICKNAME_MAX) {
    return { ok: false, error: `Name must be ${NICKNAME_MAX} characters or fewer.` };
  }
  if (hasBannedWord(body) || hasBannedWord(nickname)) {
    return { ok: false, error: 'Some wording there is not welcome here. Mind rephrasing?' };
  }
  if (isLinkSpam(body)) {
    return { ok: false, error: 'Link-only notes are not accepted.' };
  }

  return { ok: true, value: { nickname: nickname || null, body } };
}
