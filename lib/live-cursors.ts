/**
 * Aturan bersama kursor live — dipisah dari komponennya supaya angka yang
 * menentukan biaya (laju broadcast) berdiri sendiri dan gampang diaudit.
 */

/**
 * Jeda minimum antar-broadcast posisi, ms.
 *
 * ANGKA INI ADALAH BIAYA. Kuota Realtime Supabase dihitung per pesan, dan satu
 * pengunjung yang menggerakkan mouse terus-menerus mengirim 1000/JEDA pesan per
 * detik. 70ms ≈ 14 pesan/detik ≈ 850/menit — cukup mulus setelah interpolasi di
 * sisi penerima, dan masih realistis untuk kuota free tier. Menurunkannya ke
 * 16ms (60fps) akan membakar kuota ~4x lebih cepat tanpa perbedaan yang terlihat
 * karena penerima tetap meng-interpolasi antar-sampel.
 */
export const BROADCAST_MS = 70;

/** Faktor interpolasi per frame ke posisi target (0..1). */
export const LERP = 0.18;

/** Nama channel per halaman: kursor hanya tampil ke sesama pembaca halaman itu. */
export function channelFor(pathname: string): string {
  return `cursors:${pathname}`;
}

export interface CursorPayload {
  id: string;
  /** Fraksi 0..1 terhadap LEBAR dokumen (bukan piksel — lihat catatan di bawah). */
  x: number;
  /** Fraksi 0..1 terhadap TINGGI dokumen. */
  y: number;
}

export interface PeerIdentity {
  name: string;
  hue: number;
}

const ADJECTIVES = [
  'Bright',
  'Calm',
  'Curious',
  'Eager',
  'Gentle',
  'Happy',
  'Keen',
  'Lucky',
  'Noble',
  'Proud',
  'Quiet',
  'Swift',
  'Warm',
  'Wise',
];

const ANIMALS = [
  'Bear',
  'Cat',
  'Crane',
  'Deer',
  'Eagle',
  'Falcon',
  'Fox',
  'Heron',
  'Lion',
  'Otter',
  'Owl',
  'Panda',
  'Seal',
  'Whale',
];

/**
 * Nama & warna diturunkan dari id sesi, bukan diacak terpisah: penerima cukup
 * menerima id untuk memanggil nama yang SAMA dengan yang dipakai pengirim, jadi
 * tak ada identitas yang perlu dikirim atau disimpan.
 */
export function identityFor(id: string): PeerIdentity {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return {
    name: `${ADJECTIVES[hash % ADJECTIVES.length]} ${ANIMALS[(hash >> 8) % ANIMALS.length]}`,
    hue: (hash >> 16) % 360,
  };
}
