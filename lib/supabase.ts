/**
 * Klien Supabase khusus SERVER (route handler / RSC).
 *
 * Memakai SERVICE ROLE key, yang bypass RLS. Karena itu file ini tidak boleh
 * pernah ikut ter-bundle ke client — `import 'server-only'` di baris pertama
 * yang menjaminnya: begitu ada komponen client yang meng-import (langsung atau
 * transitif), build gagal, bukan diam-diam membocorkan key.
 *
 * Tabel guestbook sengaja RLS-on-tanpa-policy (lihat supabase/schema.sql), jadi
 * satu-satunya jalan menulis komentar adalah lewat route handler kita yang
 * memvalidasi & me-rate-limit.
 */

import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

/**
 * Apakah guestbook punya kredensial untuk jalan?
 *
 * Dipisah dari `getSupabaseAdmin()` supaya route handler bisa MEMERIKSA tanpa
 * memancing exception. Tanpa ini, satu-satunya cara mengetahui env kosong
 * adalah membiarkan `getSupabaseAdmin()` melempar dan menangkapnya di
 * `catch` — yang menyamakan "belum dikonfigurasi" (kondisi normal di fork
 * orang lain / preview deploy) dengan "Supabase sedang down", dan keduanya
 * berakhir jadi 500 di muka pengunjung.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Sengaja lazy (bukan konstanta modul): kalau env belum di-set, hanya request
 * ke /api/guestbook yang gagal — halaman lain tetap build & render normal.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase belum dikonfigurasi. Set SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY (lihat .env.example).',
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
