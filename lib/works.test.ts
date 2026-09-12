/**
 * Test registry case study.
 *
 * Fungsinya sendiri tipis (tiga baris `find`/`map`), jadi yang benar-benar
 * berharga diuji di sini bukan fungsinya melainkan KONTRAK DATA yang dipegang
 * template `/works/[slug]`, homepage, dan OG image. Kesalahan di file konten
 * tidak pernah kelihatan sebagai error tipe — path gambar yang salah ketik
 * tetap `string`, dan yang muncul cuma kotak kosong di halaman yang sudah
 * di-deploy.
 *
 * Test path aset sengaja menyentuh filesystem (`existsSync`) alih-alih
 * mencocokkan pola string. Yang mau dicegah adalah gambar yang TIDAK ADA, dan
 * cuma filesystem yang tahu itu. Ini juga jaring pengaman saat 32 placeholder
 * SVG diganti screenshot asli (B3 di docs/BACKLOG.md): kalau nama filenya
 * meleset, test ini jatuh sebelum situsnya jatuh.
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DISCIPLINES,
  getAllEntries,
  getAllSlugs,
  getAllWorks,
  getEntriesByDiscipline,
  getWorkBySlug,
  getWorksByDiscipline,
  hasCaseStudy,
  isDisciplineId,
} from '@/lib/works';
import { SERVICES } from '@/content/services';
import { WORK_CARDS } from '@/content/works/cards';

const works = getAllWorks();
const entries = getAllEntries();
const PUBLIC_DIR = path.join(process.cwd(), 'public');

describe('lookup', () => {
  it('mengembalikan work untuk slug yang terdaftar', () => {
    expect(getWorkBySlug('load-away')?.title).toBeTruthy();
    expect(getWorkBySlug('load-away')?.slug).toBe('load-away');
  });

  it('mengembalikan undefined untuk slug tak dikenal, bukan melempar', () => {
    // Pemanggil (`app/works/[slug]/page.tsx`) yang memutuskan notFound().
    expect(getWorkBySlug('tidak-ada')).toBeUndefined();
    expect(getWorkBySlug('')).toBeUndefined();
  });

  it('peka huruf besar-kecil — URL yang berbeda bukan halaman yang sama', () => {
    expect(getWorkBySlug('Load-Away')).toBeUndefined();
  });

  it('getAllSlugs sejalan dengan getAllWorks', () => {
    expect(getAllSlugs()).toEqual(works.map((work) => work.slug));
  });
});

describe('registry', () => {
  it('slug-nya unik', () => {
    // Duplikat = satu case study menutupi yang lain tanpa error apa pun.
    expect(new Set(getAllSlugs()).size).toBe(works.length);
  });

  it('jumlahnya genap', () => {
    // ProjectIndex grid dua kolom: jumlah ganjil meninggalkan sel kosong.
    // Yang dihitung HANYA case study — homepage memang tidak merender kartu.
    expect(works.length % 2).toBe(0);
  });

  it('slug-nya aman dipakai sebagai segmen URL', () => {
    for (const work of works) expect(work.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});

describe('kontrak data tiap work', () => {
  it.each(works.map((work) => [work.slug, work] as const))('%s — field wajib terisi', (_, work) => {
    for (const field of [
      'title',
      'category',
      'year',
      'description',
      'challenge',
      'role',
    ] as const) {
      expect(work[field].trim().length, field).toBeGreaterThan(0);
    }
    expect(work.summary.length).toBeGreaterThan(0);
    expect(work.services.length).toBeGreaterThan(0);
    expect(work.gallery.length).toBeGreaterThan(0);
  });

  it.each(works.map((work) => [work.slug, work] as const))(
    '%s — semua aset yang dirujuk benar-benar ada di /public',
    (_, work) => {
      const assets = [work.logo, work.banner.src, ...work.gallery.map((item) => item.src)];
      for (const asset of assets) {
        expect(asset.startsWith('/'), `${asset} harus path absolut dari /public`).toBe(true);
        expect(fs.existsSync(path.join(PUBLIC_DIR, asset)), `${asset} tidak ada`).toBe(true);
      }
    },
  );

  it.each(works.map((work) => [work.slug, work] as const))(
    '%s — tiap gambar punya alt yang deskriptif',
    (_, work) => {
      // Alt kosong berarti screen reader melewatinya; alt generik lebih buruk
      // lagi karena terdengar seperti informasi padahal bukan.
      for (const { alt } of [work.banner, ...work.gallery]) {
        expect(alt.trim().length).toBeGreaterThan(3);
        expect(alt.toLowerCase()).not.toMatch(/^(image|gambar|foto|screenshot)$/);
      }
    },
  );

  it.each(works.map((work) => [work.slug, work] as const))(
    '%s — bentuk grid tetap: 3 langkah approach, 3 outcome',
    (_, work) => {
      // Dua-duanya dirender sebagai grid tiga kolom; jumlah lain merusak barisnya.
      expect(work.approach).toHaveLength(3);
      expect(work.outcomes).toHaveLength(3);
    },
  );

  it.each(works.map((work) => [work.slug, work] as const))(
    '%s — ogAccent hex yang sah & unik per project',
    (_, work) => {
      expect(work.ogAccent).toMatch(/^#[0-9a-f]{6}$/i);
    },
  );

  it('slug tidak bentrok antara case study dan kartu', () => {
    // Bentrok = kartu ikut ter-render sebagai baris kedua di indeks, dan
    // `hasCaseStudy` mengirim salah satunya ke halaman milik yang lain.
    const cardSlugs = WORK_CARDS.map((card) => card.slug);
    for (const slug of cardSlugs) expect(getWorkBySlug(slug), slug).toBeUndefined();
    expect(new Set(entries.map((entry) => entry.slug)).size).toBe(entries.length);
  });

  it('ogAccent tidak dipakai dua project', () => {
    // Seluruh gunanya memang membedakan preview link antar project.
    const accents = works.map((work) => work.ogAccent.toLowerCase());
    expect(new Set(accents).size).toBe(accents.length);
  });

  it.each(works.map((work) => [work.slug, work] as const))(
    '%s — link keluar absolut & https',
    (_, work) => {
      for (const link of work.links ?? []) {
        expect(link.href).toMatch(/^https:\/\//);
        expect(link.label.trim().length).toBeGreaterThan(0);
      }
    },
  );
});

describe('disiplin (filter /works)', () => {
  it.each(works.map((work) => [work.slug, work] as const))(
    '%s — punya minimal satu disiplin, semuanya id yang sah & tanpa duplikat',
    (_, work) => {
      // Nol disiplin = project itu hanya muncul di "All" dan lenyap dari setiap
      // chip filter — hilang tanpa satu pun error.
      expect(work.disciplines.length).toBeGreaterThan(0);
      for (const id of work.disciplines) expect(isDisciplineId(id)).toBe(true);
      expect(new Set(work.disciplines).size).toBe(work.disciplines.length);
    },
  );

  it('setiap disiplin yang terdaftar punya minimal satu project', () => {
    // Chip yang isinya nol dirender mati di WorksExplorer. Kalau itu terjadi,
    // yang salah bukan UI-nya — bucket-nya yang tidak punya alasan untuk ada.
    for (const discipline of DISCIPLINES) {
      expect(getWorksByDiscipline(discipline.id).length, discipline.id).toBeGreaterThan(0);
    }
  });

  it('getWorksByDiscipline mempertahankan urutan registry', () => {
    const apps = getWorksByDiscipline('app').map((work) => work.slug);
    const expected = works.filter((work) => work.disciplines.includes('app')).map((w) => w.slug);
    expect(apps).toEqual(expected);
  });

  it('isDisciplineId menolak nilai dari URL yang tidak dikenal', () => {
    // `?tag=` datang dari luar; satu-satunya penjaga sebelum dipakai jadi state.
    expect(isDisciplineId('app')).toBe(true);
    expect(isDisciplineId('App')).toBe(false);
    expect(isDisciplineId('')).toBe(false);
    expect(isDisciplineId(undefined)).toBe(false);
  });

  it('id disiplin aman dipakai di query string & unik', () => {
    const ids = DISCIPLINES.map((discipline) => discipline.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z]+$/);
  });
});

describe('kartu indeks (content/works/cards.ts)', () => {
  /*
   * Kartu tidak lewat kontrak `Work` — tidak punya challenge/approach/outcomes,
   * dan memang itu alasannya ada. Yang tetap harus dijaga: ia muncul di indeks,
   * jadi gambarnya harus ada, alt-nya harus terbaca, tag-nya harus sah, dan ia
   * TIDAK boleh punya halaman.
   */
  it.each(WORK_CARDS.map((card) => [card.slug, card] as const))(
    '%s — field wajib terisi & slug aman dipakai di URL',
    (_, card) => {
      for (const field of ['title', 'category', 'year', 'description'] as const) {
        expect(card[field].trim().length, field).toBeGreaterThan(0);
      }
      expect(card.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    },
  );

  it.each(WORK_CARDS.map((card) => [card.slug, card] as const))(
    '%s — banner ada di /public dan punya alt yang deskriptif',
    (_, card) => {
      expect(card.banner.src.startsWith('/')).toBe(true);
      expect(
        fs.existsSync(path.join(PUBLIC_DIR, card.banner.src)),
        `${card.banner.src} tidak ada`,
      ).toBe(true);
      expect(card.banner.alt.trim().length).toBeGreaterThan(3);
    },
  );

  it.each(WORK_CARDS.map((card) => [card.slug, card] as const))(
    '%s — punya disiplin yang sah & link keluar absolut https',
    (_, card) => {
      expect(card.disciplines.length).toBeGreaterThan(0);
      for (const id of card.disciplines) expect(isDisciplineId(id)).toBe(true);
      for (const link of card.links ?? []) {
        expect(link.href).toMatch(/^https:\/\//);
        expect(link.label.trim().length).toBeGreaterThan(0);
      }
    },
  );

  it('hasCaseStudy memisahkan keduanya dengan benar', () => {
    // Inilah yang memutuskan sebuah baris di `/works` dibungkus <a> atau tidak.
    // Salah di sini = link ke 404, atau case study yang tidak bisa dibuka.
    for (const work of works) expect(hasCaseStudy(work.slug), work.slug).toBe(true);
    for (const card of WORK_CARDS) expect(hasCaseStudy(card.slug), card.slug).toBe(false);
    expect(hasCaseStudy('tidak-ada')).toBe(false);
  });

  it('getAllEntries = case study lalu kartu, tanpa yang hilang', () => {
    expect(entries.length).toBe(works.length + WORK_CARDS.length);
    expect(entries.slice(0, works.length).map((entry) => entry.slug)).toEqual(getAllSlugs());
  });

  it('getEntriesByDiscipline tidak pernah lebih sedikit dari getWorksByDiscipline', () => {
    // Angka di chip filter dihitung dari entries; kalau bucket entries lebih
    // kecil daripada bucket works, ada case study yang lenyap dari indeks.
    for (const discipline of DISCIPLINES) {
      expect(
        getEntriesByDiscipline(discipline.id).length,
        discipline.id,
      ).toBeGreaterThanOrEqual(getWorksByDiscipline(discipline.id).length);
    }
  });
});

describe('content/services.ts', () => {
  it('setiap layanan menunjuk slug yang terdaftar', () => {
    // app/page.tsx sengaja `throw` untuk slug yang salah — artinya salah ketik
    // di sini MENGGAGALKAN BUILD. Test ini melaporkannya dalam hitungan
    // milidetik, bukan setelah bundler selesai.
    for (const service of SERVICES) {
      expect(
        getWorkBySlug(service.workSlug),
        `${service.label} → ${service.workSlug}`,
      ).toBeDefined();
    }
  });
});
