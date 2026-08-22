/**
 * API guestbook anonim.
 *
 *   GET  /api/guestbook  → 50 komentar terbaru (tanpa ip_hash)
 *   POST /api/guestbook  → kirim komentar
 *
 * SEMUA penjagaan ada di sini, bukan di client, karena endpoint ini bisa
 * dipanggil langsung dengan curl:
 *   1. honeypot  — field `website` yang disembunyikan dari manusia; bot form
 *                  filler mengisinya, dan kita balas 200 palsu supaya bot tidak
 *                  belajar bahwa isian itu jebakan.
 *   2. validasi  — panjang, kata terlarang, spam tautan (lib/guestbook.ts).
 *   3. rate limit— per hash IP: 1/menit dan 5/jam.
 *
 * Anonim di sini berarti tidak ada identitas yang disimpan: nama opsional dan
 * tidak diverifikasi, dan IP tidak pernah masuk database dalam bentuk aslinya —
 * hanya sha256(ip + salt) yang cukup untuk menghitung rate limit.
 */

import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  PAGE_SIZE,
  RATE_BURST,
  RATE_HOURLY,
  validateEntry,
  type GuestbookEntry,
} from '@/lib/guestbook';

// node:crypto + service role key → wajib runtime Node, dan tidak boleh ada
// cache: daftar komentar berubah tiap kiriman.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `x-forwarded-for` bisa berisi rantai proxy; entri PERTAMA adalah IP klien
 * menurut edge Vercel. Di lokal header ini tidak ada — semua kiriman jatuh ke
 * bucket 'local', yang justru enak untuk menguji rate limit.
 */
function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip')?.trim() || 'local';
}

function hashIp(ip: string): string {
  // Salt wajib: tanpa itu hash IPv4 bisa di-brute force seluruhnya (2^32 saja).
  // Fallback ke service role key hanya agar dev lokal jalan tanpa env tambahan;
  // di produksi set GUESTBOOK_SALT sendiri (lihat .env.example).
  const salt = process.env.GUESTBOOK_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex');
}

async function countSince(ipHash: string, windowSec: number): Promise<number> {
  const since = new Date(Date.now() - windowSec * 1000).toISOString();
  const { count, error } = await getSupabaseAdmin()
    .from('guestbook')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since);

  if (error) throw error;
  return count ?? 0;
}

export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('guestbook')
      // ip_hash SENGAJA tidak ikut di-select — ia hanya untuk rate limit, dan
      // hash yang bocor tetap bisa dipakai menghubungkan komentar ke satu orang.
      .select('id, nickname, body, created_at')
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (error) throw error;
    return NextResponse.json({ entries: (data ?? []) as GuestbookEntry[] });
  } catch (error) {
    console.error('[guestbook] GET gagal:', error);
    return NextResponse.json({ error: 'Could not load the guestbook.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const { nickname, body, website } = (payload ?? {}) as Record<string, unknown>;

  // Honeypot: field ini `aria-hidden` + di luar layar, manusia tidak pernah
  // melihatnya. Balas seolah sukses — bot menganggap berhasil dan tidak
  // mencoba pola lain, sementara tidak ada apa pun yang tersimpan.
  if (typeof website === 'string' && website.trim() !== '') {
    return NextResponse.json({ entry: null }, { status: 201 });
  }

  const validation = validateEntry(nickname, body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const ipHash = hashIp(clientIp(request));

  try {
    const [burst, hourly] = await Promise.all([
      countSince(ipHash, RATE_BURST.windowSec),
      countSince(ipHash, RATE_HOURLY.windowSec),
    ]);

    if (burst >= RATE_BURST.max) {
      return NextResponse.json(
        { error: 'Hold on a moment before posting again.' },
        { status: 429 },
      );
    }
    if (hourly >= RATE_HOURLY.max) {
      return NextResponse.json(
        { error: `Limit of ${RATE_HOURLY.max} notes per hour reached. Try again later.` },
        { status: 429 },
      );
    }

    const { data, error } = await getSupabaseAdmin()
      .from('guestbook')
      .insert({ nickname: validation.value.nickname, body: validation.value.body, ip_hash: ipHash })
      .select('id, nickname, body, created_at')
      .single();

    if (error) throw error;
    return NextResponse.json({ entry: data as GuestbookEntry }, { status: 201 });
  } catch (error) {
    console.error('[guestbook] POST gagal:', error);
    return NextResponse.json({ error: 'Could not save your note. Try again.' }, { status: 500 });
  }
}
