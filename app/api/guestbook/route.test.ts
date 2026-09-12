/**
 * Test route handler guestbook — satu-satunya endpoint tulis yang terbuka ke
 * publik di situs ini.
 *
 * KENAPA INI YANG DIUJI, BUKAN KOMPONEN FORM-nya: form cuma umpan balik cepat,
 * dan siapa pun bisa melewatinya dengan satu perintah curl. Yang benar-benar
 * menahan sampah — honeypot, validasi ulang, rate limit, dan janji bahwa IP
 * tidak pernah masuk database dalam bentuk aslinya — semuanya hidup di file
 * `route.ts`, dan sebelum ini tidak ada satu pun assertion yang menjaganya.
 *
 * Supabase-nya PALSU (`vi.mock('@/lib/supabase')`), bukan instance sungguhan.
 * Dua alasan: modul aslinya `import 'server-only'` sehingga tidak bisa dimuat
 * di luar konteks server React, dan yang mau diuji di sini keputusan handler-nya
 * — apa yang dia PUTUSKAN untuk dikirim ke database — bukan apakah Postgres
 * bisa menyimpan baris. Karena itu assertion terpenting di berkas ini bukan
 * "status 201", tapi "query apa yang sampai ke database, dan berisi apa".
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RATE_HOURLY, NICKNAME_MAX } from '@/lib/guestbook';

/**
 * State stub dideklarasikan lewat `vi.hoisted` karena `vi.mock` diangkat ke
 * atas berkas: tanpa ini, factory di bawah menyentuh variabel yang belum ada.
 */
const stub = vi.hoisted(() => ({
  configured: true,
  client: null as unknown as ReturnType<typeof createStub>['client'],
}));

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: () => stub.configured,
  getSupabaseAdmin: () => stub.client,
}));

const { GET, POST } = await import('./route');

/** Satu query yang sampai ke "database", direkam apa adanya. */
interface Query {
  table: string;
  op: 'select' | 'count' | 'insert' | null;
  columns?: string;
  filters: Record<string, string>;
  row?: Record<string, unknown>;
  limit?: number;
}

type Reply = { data?: unknown; count?: number; error?: unknown };

/**
 * Klien Supabase palsu.
 *
 * Sengaja merekam SELURUH rantai pemanggilan (kolom yang di-select, filter,
 * baris yang di-insert), bukan cuma jumlah panggilan — itu yang membuat test
 * "ip_hash tidak ikut di-select" dan "yang tersimpan hash, bukan IP" mungkin
 * ditulis sama sekali. Rantainya thenable: `await`-nya baru memanggil
 * `respond`, persis seperti query builder aslinya yang tidak jalan sampai
 * di-await.
 */
function createStub(respond: (query: Query) => Reply) {
  const queries: Query[] = [];

  function from(table: string) {
    const query: Query = { table, op: null, filters: {} };
    queries.push(query);

    const chain = {
      select(columns: string, opts?: { head?: boolean }) {
        query.columns = columns;
        // `head: true` = hitung saja, jangan ambil barisnya (dipakai rate limit).
        // Kalau op sudah 'insert', `.select()` di sini cuma menentukan kolom
        // yang dikembalikan baris hasil insert — bukan query baca baru.
        if (opts?.head) query.op = 'count';
        else if (query.op !== 'insert') query.op = 'select';
        return chain;
      },
      insert(row: Record<string, unknown>) {
        query.op = 'insert';
        query.row = row;
        return chain;
      },
      eq(key: string, value: string) {
        query.filters[key] = value;
        return chain;
      },
      gte(key: string, value: string) {
        query.filters[`gte:${key}`] = value;
        return chain;
      },
      order() {
        return chain;
      },
      limit(count: number) {
        query.limit = count;
        return chain;
      },
      single() {
        return chain;
      },
      then<T>(resolve: (value: Reply) => T, reject?: (reason: unknown) => T) {
        return Promise.resolve()
          .then(() => respond(query))
          .then(resolve, reject);
      },
    };

    return chain;
  }

  return { client: { from }, queries };
}

/**
 * Bedakan dua query hitung rate limit lewat batas waktunya, bukan lewat urutan
 * pemanggilan: keduanya dijalankan `Promise.all`, jadi urutan penyelesaiannya
 * bukan jaminan. Jendela burst 60 detik, jendela hourly 3600 detik — selisihnya
 * terlalu jauh untuk salah baca.
 */
function windowOf(query: Query): 'burst' | 'hourly' {
  const since = Date.parse(query.filters['gte:created_at']);
  return Date.now() - since < 120_000 ? 'burst' : 'hourly';
}

/** Request POST dengan IP yang bisa ditentukan per kasus. */
function post(body: unknown, ip = '203.0.113.7') {
  return new Request('http://localhost/api/guestbook', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

let errorLog: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  stub.configured = true;
  // Salt eksplisit: fallback-nya membaca SUPABASE_SERVICE_ROLE_KEY, yang di
  // lingkungan test kosong — dan hash tanpa salt persis yang tidak boleh
  // dianggap normal di sini.
  vi.stubEnv('GUESTBOOK_SALT', 'salt-untuk-test');
  // Jalur 500 memang MENULIS ke console.error dengan sengaja; dibungkam supaya
  // output test bersih, tapi tetap bisa di-assert (lihat kasus 500 di bawah).
  errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('GET', () => {
  it('membalas daftar kosong + disabled saat Supabase belum dikonfigurasi', async () => {
    // Ini keadaan SAH di fork orang lain dan di preview deploy — bukan error.
    // Kalau ini suatu saat berubah jadi 500, guestbook akan tampil sebagai
    // fitur rusak di setiap clone yang tidak punya project Supabase.
    stub.configured = false;
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ entries: [], disabled: true });
  });

  it('mengembalikan entri terbaru TANPA pernah menyentuh kolom ip_hash', async () => {
    const rows = [{ id: '1', nickname: 'Ana', body: 'Halo', created_at: '2026-09-04T00:00:00Z' }];
    const { client, queries } = createStub(() => ({ data: rows }));
    stub.client = client;

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ entries: rows });
    // Assertion inti: hash IP tidak boleh keluar dari server. Ia memang tidak
    // mengandung IP aslinya, tapi hash yang bocor tetap cukup untuk
    // menghubungkan beberapa komentar ke satu orang yang sama.
    expect(queries[0].columns).not.toContain('ip_hash');
    expect(queries[0].columns).toBe('id, nickname, body, created_at');
  });

  it('membalas 500 generik saat query gagal, tanpa membocorkan pesan aslinya', async () => {
    const { client } = createStub(() => ({
      error: new Error('relation "guestbook" does not exist'),
    }));
    stub.client = client;

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe('Could not load the guestbook.');
    expect(JSON.stringify(payload)).not.toContain('relation');
    expect(errorLog).toHaveBeenCalled();
  });
});

describe('POST — gerbang sebelum database', () => {
  it('membalas 503, bukan 500, saat Supabase belum dikonfigurasi', async () => {
    // 503 = fiturnya mati, bukan rusak; tidak ada yang perlu di-retry sampai
    // env-nya diisi. UI-nya sudah disembunyikan lewat GET, tapi endpoint ini
    // tetap bisa dipanggil langsung.
    stub.configured = false;
    const response = await POST(post({ body: 'halo' }));

    expect(response.status).toBe(503);
  });

  it('membalas 400 untuk JSON rusak, bukan melempar', async () => {
    const { client, queries } = createStub(() => ({}));
    stub.client = client;

    const response = await POST(post('{ bukan json', '203.0.113.7'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Malformed request.' });
    expect(queries).toHaveLength(0);
  });

  it('honeypot: membalas 201 palsu dan TIDAK menyimpan apa pun', async () => {
    const { client, queries } = createStub(() => ({}));
    stub.client = client;

    const response = await POST(post({ body: 'halo', website: 'https://spam.example' }));

    // Balasan sengaja terlihat sukses supaya bot tidak belajar bahwa field itu
    // jebakan. Yang membuktikan jebakannya bekerja bukan status-nya — tapi
    // baris berikutnya: tidak ada satu pun query yang sampai ke database.
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ entry: null });
    expect(queries).toHaveLength(0);
  });

  it('honeypot yang cuma berisi spasi TIDAK dianggap terisi', async () => {
    // Sebagian browser autofill menaruh string kosong/spasi di field
    // tersembunyi. Kalau itu ikut terperangkap, komentar manusia hilang
    // diam-diam — kegagalan yang tak akan pernah dilaporkan siapa pun.
    const { client, queries } = createStub((query) =>
      query.op === 'count' ? { count: 0 } : { data: { id: '1' } },
    );
    stub.client = client;

    const response = await POST(post({ body: 'halo dari manusia', website: '   ' }));

    expect(response.status).toBe(201);
    expect(queries.some((q) => q.op === 'insert')).toBe(true);
  });

  it('memvalidasi ULANG di server — kiriman yang ditolak tidak pernah di-query', async () => {
    const { client, queries } = createStub(() => ({}));
    stub.client = client;

    const short = await POST(post({ body: 'a' }));
    const banned = await POST(post({ body: 'dasar goblok kamu' }));
    const longName = await POST(post({ nickname: 'x'.repeat(NICKNAME_MAX + 1), body: 'halo' }));

    expect(short.status).toBe(400);
    expect(banned.status).toBe(400);
    expect(longName.status).toBe(400);
    // Validasi terjadi SEBELUM rate limit dihitung: kiriman busuk tidak boleh
    // menghabiskan satu pun round-trip ke database.
    expect(queries).toHaveLength(0);
  });
});

describe('POST — rate limit', () => {
  /** Stub yang membalas jumlah kiriman terakhir per jendela. */
  function counting(counts: { burst: number; hourly: number }) {
    return createStub((query) => {
      if (query.op === 'count') return { count: counts[windowOf(query)] };
      return { data: { id: 'baru', nickname: null, body: 'halo', created_at: 'now' } };
    });
  }

  it('menolak kiriman kedua dalam satu menit', async () => {
    const { client, queries } = counting({ burst: 1, hourly: 1 });
    stub.client = client;

    const response = await POST(post({ body: 'halo lagi' }));

    expect(response.status).toBe(429);
    expect(queries.some((q) => q.op === 'insert')).toBe(false);
  });

  it('menolak kiriman ke-6 dalam satu jam dengan pesan yang menyebut batasnya', async () => {
    const { client, queries } = counting({ burst: 0, hourly: RATE_HOURLY.max });
    stub.client = client;

    const response = await POST(post({ body: 'halo' }));
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.error).toContain(String(RATE_HOURLY.max));
    expect(queries.some((q) => q.op === 'insert')).toBe(false);
  });

  it('menghitung dua jendela berbeda untuk hash IP yang sama', async () => {
    const { client, queries } = counting({ burst: 0, hourly: 0 });
    stub.client = client;

    await POST(post({ body: 'halo' }));
    const counts = queries.filter((q) => q.op === 'count');

    expect(counts).toHaveLength(2);
    expect(counts.map(windowOf).sort()).toEqual(['burst', 'hourly']);
    // Kedua hitungan harus memfilter hash yang SAMA — kalau tidak, salah satu
    // jendela menghitung orang lain dan batasnya jadi hiasan.
    expect(counts[0].filters.ip_hash).toBe(counts[1].filters.ip_hash);
  });

  it('memberi bucket berbeda untuk IP berbeda, dan bucket sama untuk IP yang sama', async () => {
    const { client, queries } = counting({ burst: 0, hourly: 0 });
    stub.client = client;

    await POST(post({ body: 'halo' }, '198.51.100.1'));
    await POST(post({ body: 'halo' }, '198.51.100.2'));
    await POST(post({ body: 'halo' }, '198.51.100.1'));

    const hashes = queries.filter((q) => q.op === 'count').map((q) => q.filters.ip_hash);
    expect(hashes[0]).not.toBe(hashes[2]);
    expect(hashes[0]).toBe(hashes[4]);
  });

  it('memakai entri PERTAMA dari rantai x-forwarded-for', async () => {
    // Rantai proxy: `klien, proxy1, proxy2`. Kalau yang diambil entri terakhir,
    // seluruh trafik lewat satu proxy jatuh ke bucket yang sama dan satu
    // pengunjung bisa mengunci semua orang di belakang proxy itu.
    const { client, queries } = counting({ burst: 0, hourly: 0 });
    stub.client = client;

    await POST(post({ body: 'halo' }, '198.51.100.9, 10.0.0.1, 10.0.0.2'));
    await POST(post({ body: 'halo' }, '198.51.100.9'));

    const hashes = queries.filter((q) => q.op === 'count').map((q) => q.filters.ip_hash);
    expect(hashes[0]).toBe(hashes[2]);
  });
});

describe('POST — penyimpanan', () => {
  function ok() {
    return createStub((query) => {
      if (query.op === 'count') return { count: 0 };
      return {
        data: { id: 'baru', nickname: 'Ana', body: 'Halo', created_at: '2026-09-04T00:00:00Z' },
      };
    });
  }

  it('menyimpan nilai HASIL VALIDASI, bukan input mentah', async () => {
    const { client, queries } = ok();
    stub.client = client;

    const response = await POST(post({ nickname: '  Ana  ', body: '  Halo\n\n\n\ndunia  ' }));

    expect(response.status).toBe(201);
    const insert = queries.find((q) => q.op === 'insert');
    // Trim + pemadatan baris baru terjadi di validator; kalau handler suatu saat
    // meng-insert `body` mentah dari payload, baris ini yang jatuh duluan.
    expect(insert?.row).toMatchObject({ nickname: 'Ana', body: 'Halo\n\ndunia' });
  });

  it('menyimpan nickname kosong sebagai null, bukan string kosong', async () => {
    const { client, queries } = ok();
    stub.client = client;

    await POST(post({ nickname: '   ', body: 'halo' }));

    // UI membaca null sebagai "Anonymous"; string kosong akan lolos ke layar
    // sebagai nama tanpa huruf.
    expect(queries.find((q) => q.op === 'insert')?.row?.nickname).toBeNull();
  });

  it('menyimpan HASH IP, tidak pernah IP-nya sendiri', async () => {
    const { client, queries } = ok();
    stub.client = client;

    await POST(post({ body: 'halo' }, '203.0.113.42'));
    const row = queries.find((q) => q.op === 'insert')?.row as Record<string, unknown>;

    // Janji "anonim" di halaman guestbook berdiri di atas satu baris ini.
    expect(JSON.stringify(row)).not.toContain('203.0.113.42');
    expect(row.ip_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('mengembalikan baris yang tersimpan, tanpa ip_hash di kolom yang dipilih', async () => {
    const { client, queries } = ok();
    stub.client = client;

    const response = await POST(post({ body: 'halo' }));
    const payload = await response.json();

    expect(payload.entry).toMatchObject({ id: 'baru', body: 'Halo' });
    expect(queries.find((q) => q.op === 'insert')?.columns).not.toContain('ip_hash');
  });

  it('membalas 500 generik saat insert gagal', async () => {
    const { client } = createStub((query) =>
      query.op === 'count' ? { count: 0 } : { error: new Error('duplicate key value') },
    );
    stub.client = client;

    const response = await POST(post({ body: 'halo' }));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe('Could not save your note. Try again.');
    expect(JSON.stringify(payload)).not.toContain('duplicate key');
    expect(errorLog).toHaveBeenCalled();
  });
});
