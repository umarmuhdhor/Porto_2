/**
 * Test `lib/site-url.ts` — modul yang MENGGAGALKAN build produksi saat
 * originnya salah. Empat cabang errornya sebelum ini cuma diverifikasi manual
 * sekali, padahal justru cabang itu yang menentukan apakah sitemap, robots, dan
 * setiap og:image menunjuk mesin yang benar.
 *
 * `SITE_URL` dihitung SEKALI saat modul dievaluasi, jadi tiap kasus harus
 * memuat ulang modulnya dengan env yang berbeda — itu fungsi `load()` di bawah:
 * `resetModules()` membuang cache, lalu `import()` mengevaluasi ulang.
 * Memanggilnya di dalam `expect(...).rejects` bukan `toThrow` juga bukan gaya:
 * yang melempar adalah evaluasi modul, dan itu terjadi di dalam promise import.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

const MOD = '@/lib/site-url';

/** Muat ulang modul dengan env yang sudah di-stub. */
async function load() {
  vi.resetModules();
  return (await import(MOD)).SITE_URL;
}

/** Set env; `undefined` berarti benar-benar dihapus, bukan diisi string kosong. */
function env(vars: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined) vi.stubEnv(key, undefined as unknown as string);
    else vi.stubEnv(key, value);
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('di luar produksi', () => {
  it('jatuh ke localhost saat env kosong', async () => {
    env({ NODE_ENV: 'development', NEXT_PUBLIC_SITE_URL: undefined, VERCEL: undefined });
    await expect(load()).resolves.toBe('http://localhost:3000');
  });

  it('tetap memakai nilai yang diisi kalau ada', async () => {
    env({ NODE_ENV: 'development', NEXT_PUBLIC_SITE_URL: 'https://staging.example.com' });
    await expect(load()).resolves.toBe('https://staging.example.com');
  });
});

describe('produksi — env kosong', () => {
  it('melempar, bukan diam-diam jatuh ke localhost', async () => {
    // Ini seluruh alasan modul ini ada: kegagalan build lima detik setelah
    // deploy jauh lebih murah daripada minggu-minggu og:image rusak.
    env({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: undefined, VERCEL: undefined });
    await expect(load()).rejects.toThrow(/NEXT_PUBLIC_SITE_URL belum diset/);
  });

  it('memperlakukan string berisi spasi sama dengan kosong', async () => {
    env({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: '   ', VERCEL: undefined });
    await expect(load()).rejects.toThrow(/belum diset/);
  });
});

describe('produksi — nilai yang tidak sah', () => {
  it('melempar untuk string yang bukan URL', async () => {
    env({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'contoh.com' });
    await expect(load()).rejects.toThrow(/bukan URL yang sah/);
  });

  it('melempar untuk protokol selain http/https', async () => {
    env({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'ftp://contoh.com' });
    await expect(load()).rejects.toThrow(/harus http\/https/);
  });
});

describe('localhost — hanya digagalkan saat deploy sungguhan', () => {
  it('melempar kalau build produksi jalan di Vercel', async () => {
    env({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'http://localhost:3000', VERCEL: '1' });
    await expect(load()).rejects.toThrow(/menunjuk localhost/);
  });

  it('melempar untuk semua host lokal, bukan cuma "localhost"', async () => {
    for (const host of ['127.0.0.1', '0.0.0.0', '[::1]']) {
      env({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: `http://${host}:3000`, VERCEL: '1' });
      await expect(load()).rejects.toThrow(/menunjuk localhost/);
    }
  });

  it('MEMBIARKAN `pnpm build` di laptop tetap jalan', async () => {
    // Tanpa VERCEL, build produksi lokal harus tetap boleh — kalau baris ini
    // jatuh, tidak ada lagi yang bisa membangun situs ini di luar Vercel.
    env({
      NODE_ENV: 'production',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      VERCEL: undefined,
    });
    await expect(load()).resolves.toBe('http://localhost:3000');
  });
});

describe('normalisasi', () => {
  it('membuang slash di akhir', async () => {
    // Tanpa ini `${SITE_URL}/works/x` jadi `//works/x` — dua URL berbeda bagi crawler.
    env({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://contoh.com/' });
    await expect(load()).resolves.toBe('https://contoh.com');
  });

  it('membuang path & query yang tak sengaja ikut ter-copy', async () => {
    env({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://contoh.com/works?ref=x' });
    await expect(load()).resolves.toBe('https://contoh.com');
  });

  it('mempertahankan port non-standar', async () => {
    env({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://contoh.com:8443' });
    await expect(load()).resolves.toBe('https://contoh.com:8443');
  });
});
