'use client';

/**
 * Daftar case study di `/works` + filter disiplinnya (App / Web / AI / Teaching).
 *
 * KENAPA KLIEN, padahal sisa halaman ini server component: filter harus terasa
 * instan. Versi berbasis link (`/works?tag=app` sebagai navigasi penuh) berarti
 * satu round-trip tiap kali orang mencoba tag berikutnya, dan orang MENCOBA
 * beberapa tag berturut-turut — itu memang cara filter dipakai. Datanya sendiri
 * tetap di-load di server dan diserahkan sebagai baris siap render; komponen
 * ini tidak tahu ada registry.
 *
 * `?tag=` DIBACA DI KLIEN, bukan lewat `searchParams` di server: begitu sebuah
 * page membaca searchParams, Next mencabutnya dari static rendering dan halaman
 * ini dirender ulang tiap request hanya untuk satu kata di query string. Halaman
 * ini tidak punya data yang berubah — biarkan ia statis. Harganya satu frame:
 * pengunjung yang datang lewat `/works?tag=ai` melihat daftar penuh sesaat
 * sebelum filter menempel. Tautan hasil filter tetap bisa dibagikan, yang
 * memang tujuannya.
 *
 * Perubahan filter menulis balik ke URL dengan `history.replaceState`, BUKAN
 * router.push: mengganti tag bukan halaman baru, dan mendorong entri riwayat
 * tiap klik chip membuat tombol Back harus ditekan enam kali untuk keluar dari
 * satu halaman. replaceState menjaga URL tetap bisa disalin tanpa menyandera
 * tombol Back.
 *
 * URL ITU SATU-SATUNYA STATE. Tidak ada `useState` yang menyimpan tag terpilih
 * di samping query string — dua salinan dari satu fakta hanya menunggu untuk
 * berbeda (mis. setelah tombol Back, atau setelah replaceState gagal). Nilai
 * dibaca lewat `useSyncExternalStore`: server merender tanpa filter,
 * `getServerSnapshot` mengembalikan hal yang sama sehingga hidrasi cocok, lalu
 * React membaca ulang dari `location.search` setelah terpasang. Itu juga alasan
 * `apply()` menyiarkan event sendiri — replaceState tidak memicu `popstate`,
 * jadi tanpa siaran itu klik chip tidak akan pernah terbaca.
 */

import { useCallback, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DISCIPLINES, isDisciplineId, type DisciplineId } from '@/content/works/disciplines';
import { DisciplineTags } from '@/components/ui/DisciplineTags';

export interface WorkRow {
  slug: string;
  title: string;
  description: string;
  category: string;
  year: string;
  disciplines: readonly DisciplineId[];
  banner: string;
  /**
   * `null` = entri ini tidak punya halaman case study (content/works/cards.ts).
   * Barisnya tetap dirender lengkap, cuma tidak dibungkus <a>.
   *
   * Dibawa sebagai href, BUKAN sebagai `isCaseStudy: boolean` yang dipakai
   * komponen untuk menyusun `/works/${slug}` sendiri: satu-satunya tempat yang
   * tahu bentuk URL case study jadi tetap satu (app/works/page.tsx).
   */
  href: string | null;
  /** Tautan keluar — satu-satunya jalan keluar buat baris tanpa halaman. */
  links?: readonly { label: string; href: string }[];
}

/** `null` = tidak ada filter aktif ("All"). */
type Filter = DisciplineId | null;

const LABEL = 'font-system text-muted text-xs tracking-[0.3em] uppercase';

const CHIP_BASE =
  'font-system focus-visible:outline-accent rounded-[var(--radius-pill)] border px-4 py-2 text-xs tracking-[0.12em] uppercase transition-colors duration-[var(--dur-base)] ease-[var(--ease-smooth)] focus-visible:outline-2 focus-visible:outline-offset-2 md:text-sm';
const CHIP_ON = 'border-ink bg-ink text-cream';
const CHIP_OFF = 'border-[var(--line-strong)] text-ink/70 hover:border-ink hover:text-ink';

/** Isi baris — sama persis untuk yang punya halaman maupun yang tidak. */
const ROW =
  'flex flex-col gap-5 py-8 md:flex-row md:items-center md:gap-10 md:py-10';

/** Event internal: replaceState tidak memicu apa pun yang bisa kita dengarkan. */
const TAG_EVENT = 'works-filter:change';

function subscribe(onChange: () => void) {
  window.addEventListener(TAG_EVENT, onChange);
  // popstate: tombol Back/Forward tetap harus mengubah daftar, bukan cuma URL.
  window.addEventListener('popstate', onChange);
  return () => {
    window.removeEventListener(TAG_EVENT, onChange);
    window.removeEventListener('popstate', onChange);
  };
}

/** Snapshot = string query mentah, supaya nilainya stabil antar render. */
function getSearch() {
  return window.location.search;
}

/** Di server tidak ada query string yang bisa dibaca — render tanpa filter. */
function getServerSearch() {
  return '';
}

function toFilter(search: string): Filter {
  const tag = new URLSearchParams(search).get('tag') ?? undefined;
  return isDisciplineId(tag) ? tag : null;
}

export function WorksExplorer({ works }: { works: WorkRow[] }) {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const filter = toFilter(search);

  const visible = filter ? works.filter((work) => work.disciplines.includes(filter)) : works;
  const active = DISCIPLINES.find((discipline) => discipline.id === filter);

  const apply = useCallback((next: Filter) => {
    // URL disinkronkan supaya tautan hasil filter bisa disalin & dibagikan;
    // event-nya yang membuat komponen membacanya kembali.
    const url = new URL(window.location.href);
    if (next) url.searchParams.set('tag', next);
    else url.searchParams.delete('tag');
    window.history.replaceState(null, '', url);
    window.dispatchEvent(new Event(TAG_EVENT));
  }, []);

  /**
   * Jumlah project per tag dihitung dari data yang sama, bukan ditulis tangan.
   * Angka di chip inilah yang mencegah pengunjung menekan tag yang isinya nol —
   * dan menghitungnya di sini berarti angka itu tak mungkin basi.
   */
  const counts = new Map<DisciplineId, number>(
    DISCIPLINES.map((discipline) => [
      discipline.id,
      works.filter((work) => work.disciplines.includes(discipline.id)).length,
    ]),
  );

  return (
    <>
      {/* role="group" + aria-label: tanpa itu deretan tombol ini terdengar
          seperti enam tombol lepas tanpa hubungan apa pun dengan daftar di
          bawahnya. `aria-pressed` menyampaikan mana yang sedang aktif — chip
          ini toggle, bukan navigasi. */}
      <div
        role="group"
        aria-label="Filter projects by discipline"
        className="mt-10 flex flex-wrap gap-2 md:mt-12 md:gap-3"
      >
        <button
          type="button"
          aria-pressed={filter === null}
          onClick={() => apply(null)}
          className={`${CHIP_BASE} ${filter === null ? CHIP_ON : CHIP_OFF}`}
        >
          All
          <span className="ml-2 opacity-60">{works.length}</span>
        </button>

        {DISCIPLINES.map((discipline) => {
          const count = counts.get(discipline.id) ?? 0;
          const on = filter === discipline.id;
          return (
            <button
              key={discipline.id}
              type="button"
              aria-pressed={on}
              // Tag tanpa isi tetap dirender tapi mati: menghilangkannya diam-diam
              // membuat daftar filter berubah bentuk tiap kali satu project
              // ditambah, dan pengunjung kehilangan gambaran cakupannya.
              disabled={count === 0}
              onClick={() => apply(on ? null : discipline.id)}
              className={`${CHIP_BASE} ${on ? CHIP_ON : CHIP_OFF} disabled:pointer-events-none disabled:opacity-40`}
            >
              {discipline.label}
              <span className="ml-2 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* aria-live: pengguna screen reader yang menekan chip tidak melihat
          daftar menyusut — baris inilah yang memberi tahu mereka apa yang
          barusan terjadi. */}
      <p aria-live="polite" className={`${LABEL} mt-6`}>
        {/* "project", bukan "case study": daftar ini campur — sebagian punya
            halaman sendiri, sebagian berhenti sebagai baris. Menghitung
            semuanya sebagai "case studies" akan menjanjikan sebelas halaman
            yang bisa dibuka padahal ada enam belas baris di layar. */}
        {visible.length} {visible.length === 1 ? 'project' : 'projects'}
        {active ? ` · ${active.label}` : ''}
      </p>

      {active && (
        <p className="font-body text-ink/70 mt-3 max-w-2xl text-sm leading-relaxed md:text-base">
          {active.blurb}
        </p>
      )}

      {/*
       * <ol>, bukan <ul>: urutannya bermakna — terbaru dan paling relevan
       * dulu (lihat catatan urutan di lib/works.ts), dan itu satu-satunya
       * cara pengunjung tahu mana yang paling menggambarkan saya sekarang.
       * <ol> menyampaikan itu ke screen reader tanpa satu kata tambahan.
       *
       * Garis dibentuk dari border tiap baris, bukan `divide-y`, supaya baris
       * terakhir tetap punya penutup dan daftarnya terbaca sebagai blok utuh.
       */}
      <ol className="mt-10 border-t border-[var(--line-rule)] md:mt-14">
        {visible.map((work, i) => {
          /*
           * Isi baris identik apakah ia punya halaman atau tidak — yang beda
           * cuma pembungkusnya. Ditulis sekali sebagai variabel, bukan dua
           * cabang JSX yang disalin: dua salinan markup sepanjang ini hanya
           * menunggu untuk berbeda diam-diam di salah satu cabang.
           */
          const body = (
            <>
              {/* Nomor urut: versi terlihat dari <ol>. aria-hidden supaya
                  screen reader tidak membaca "1" dua kali — penomorannya
                  sudah diumumkan oleh list-nya sendiri. */}
              <span
                aria-hidden="true"
                className="font-display text-accent-line-strong hidden w-10 shrink-0 text-sm leading-none font-bold md:block"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Thumbnail SELALU tampil, bukan cuma saat hover: di halaman
                  indeks gambar itu bagian dari cara orang mengenali project,
                  dan hover tidak pernah terjadi di layar sentuh. Dekoratif
                  (`alt=""`) karena judul di sebelahnya sudah menyebutkannya.
                  `sizes` dipatok ke lebar render nyata — tanpa itu Next
                  menyajikan gambar selebar viewport untuk kotak 240px. */}
              <span className="relative block aspect-[16/9] w-full shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-[var(--line-rule)] md:w-[240px]">
                <Image
                  src={work.banner}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 240px"
                  className="object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-smooth)] group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="font-display block text-2xl leading-tight font-bold tracking-tight underline decoration-transparent decoration-2 underline-offset-[6px] transition-colors duration-[var(--dur-base)] group-hover:decoration-current group-focus-visible:decoration-current md:text-4xl">
                  {work.title}
                </span>
                <span className="font-body text-ink/70 mt-3 block max-w-2xl leading-relaxed">
                  {work.description}
                </span>

                {/* Tag disiplin di tiap baris, bukan cuma di chip filter di
                    atas: begitu satu filter aktif, tag inilah yang menunjukkan
                    project mana yang berdiri di DUA disiplin sekaligus —
                    informasi yang hilang total kalau tag hanya ada di header. */}
                <DisciplineTags ids={work.disciplines} className="mt-4" />

                <span className={`${LABEL} mt-3 block`}>
                  {work.category}
                  <span className="mx-2" aria-hidden="true">
                    ·
                  </span>
                  {work.year}
                </span>
              </span>

              {/* Panah: penanda arah murni visual — seluruh barisnya sudah
                  satu link, dan kata "View case study" akan jadi teks link
                  kedua yang mengumumkan tujuan yang sama. Baris tanpa halaman
                  tidak mendapatkannya: panah yang tidak menuju ke mana-mana
                  adalah janji yang tidak ditepati. */}
              <span
                aria-hidden="true"
                className="text-muted group-hover:text-ink hidden shrink-0 text-2xl transition-[color,transform] duration-[var(--dur-base)] ease-[var(--ease-smooth)] group-hover:translate-x-1 group-focus-visible:translate-x-1 md:block"
              >
                &#8594;
              </span>
            </>
          );

          return (
            <li key={work.slug} className="border-b border-[var(--line-rule)]">
              {work.href ? (
                <Link
                  href={work.href}
                  className={`group focus-visible:outline-accent ${ROW} focus-visible:outline-2 focus-visible:outline-offset-4`}
                >
                  {body}
                </Link>
              ) : (
                <>
                  {/*
                   * Bukan <a>, dan sengaja: tidak ada halaman di ujungnya.
                   * Link yang mengarah ke 404 lebih buruk daripada baris yang
                   * memang berhenti di sini — dan `<div>` menjaga barisnya
                   * tetap keluar dari urutan tab, jadi pengguna keyboard tidak
                   * menabrak sesuatu yang tak bisa dibuka.
                   */}
                  <div className={ROW}>{body}</div>

                  {work.links && work.links.length > 0 && (
                    <p className="-mt-4 flex flex-wrap gap-x-6 gap-y-2 pb-8 md:pl-[calc(2.5rem+240px+2.5rem)]">
                      {work.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-system text-muted hover:text-ink focus-visible:outline-accent rounded-sm text-sm underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
                        >
                          {link.label}
                          <span aria-hidden="true"> ↗</span>
                        </a>
                      ))}
                    </p>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>

      {/* Tidak akan terpicu selama tiap tag punya isi (chip kosong dimatikan di
          atas), tapi tetap ada: daftar yang berakhir sebagai ruang kosong tanpa
          satu kata pun terbaca seperti halaman yang rusak. */}
      {visible.length === 0 && (
        <p className="font-body text-ink/70 py-10">
          No projects under this filter yet.{' '}
          <button
            type="button"
            onClick={() => apply(null)}
            className="focus-visible:outline-accent hover:text-ink rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Show all
          </button>
          .
        </p>
      )}
    </>
  );
}
