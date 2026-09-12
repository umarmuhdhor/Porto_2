/**
 * Tag disiplin (App / Web / AI Automation / Teaching) — dipakai di grid
 * homepage, indeks `/works`, dan header case study.
 *
 * SATU komponen untuk ketiganya supaya bentuk tag-nya identik di mana pun ia
 * muncul: kalau bentuknya berbeda per halaman, pengunjung tidak akan mengenali
 * tag di grid sebagai hal yang sama dengan chip filter di `/works` — dan itu
 * satu-satunya alasan tag ini ada di grid.
 *
 * Non-interaktif dan memang begitu: yang bisa diklik adalah chip di `/works`
 * (WorksExplorer) dan tautan pintasan di homepage. Tag di dalam kartu project
 * berada DI DALAM link project — tombol di dalam link itu markup ilegal dan
 * membajak klik yang jelas-jelas dimaksudkan ke case study-nya.
 *
 * DIRENDER <span>, BUKAN <ul>/<li>: kedua pemakainya menaruh tag ini di dalam
 * <a> yang isinya sudah phrasing content (<span>), dan <ul> di dalam <span>
 * adalah nesting yang tidak sah — browser boleh memperbaikinya sendiri, dan
 * "boleh" di sini berarti tata letaknya berubah tanpa satu pun error. Semantik
 * daftar tidak hilang banyak: ini dua-tiga kata label, bukan daftar yang perlu
 * dinavigasi. `role="list"` juga sengaja tidak dipasang — Safari/VoiceOver
 * membuang semantik list begitu list-style-nya dihapus, jadi itu janji yang
 * tidak selalu ditepati.
 */

import { DISCIPLINES, type DisciplineId } from '@/content/works/disciplines';

const LOOKUP = new Map(DISCIPLINES.map((discipline) => [discipline.id, discipline]));

/**
 * `variant`:
 * - `plain` — di atas latar krem polos (indeks & header case study).
 * - `onImage` — di sel grid homepage, tempat cover project muncul di belakang
 *   tag saat hover. Diberi latar solid supaya kontras teksnya tidak bergantung
 *   pada seterang apa gambar di bawahnya.
 */
export function DisciplineTags({
  ids,
  variant = 'plain',
  className = '',
}: {
  ids: readonly DisciplineId[];
  variant?: 'plain' | 'onImage';
  className?: string;
}) {
  if (ids.length === 0) return null;

  const tone =
    variant === 'onImage'
      ? 'border-transparent bg-white/85 text-ink'
      : 'border-[var(--line-strong)] text-ink/75';

  return (
    <span className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {ids.map((id) => {
        const discipline = LOOKUP.get(id);
        if (!discipline) return null;
        return (
          <span
            key={id}
            className={`font-system rounded-[var(--radius-pill)] border px-2.5 py-1 text-[10px] leading-none tracking-[0.14em] uppercase md:text-[11px] ${tone}`}
          >
            {/* Label pendek di kartu, penuh di halaman yang punya ruang: "AI"
                cukup jelas berdampingan dengan tag lain di sel sempit, tapi
                sendirian di header case study ia terbaca seperti singkatan
                yang belum selesai. */}
            {variant === 'onImage' ? discipline.short : discipline.label}
          </span>
        );
      })}
    </span>
  );
}
