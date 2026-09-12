/**
 * Garis frame vertikal kiri & kanan — MILIK HERO SAJA (DESIGN §2.3 / §3).
 *
 * Sebelumnya layer ini `fixed` di root layout dan menemani seluruh scroll.
 * Konsekuensinya: hairline yang sama melintasi section accent, section dark,
 * grid project, dan footer — empat bidang yang masing-masing sudah punya
 * bahasa garisnya sendiri, jadi garis frame berubah peran dari "margin cetak
 * halaman pembuka" menjadi border yang mengurung setiap section. Sekarang ia
 * dirender di dalam layer konten Hero: `absolute`, ikut naik & memudar bersama
 * konten hero, dan berhenti tepat saat section berikutnya mengambil alih.
 *
 * Garis tetap hairline dengan ujung atas/bawah yang meluruh (lihat
 * `.frame-line` di globals.css) — bertepi tegas ia terbaca sebagai border,
 * meluruh ia terbaca sebagai garis margin cetak. Tick pendek di mid-height
 * menandai sumbu tempat label peran mengapit nama.
 */
export function FrameLines() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <span className="frame-line absolute top-0 bottom-0" style={{ left: 'var(--frame-inset)' }} />
      <span
        className="frame-line absolute top-0 bottom-0"
        style={{ right: 'var(--frame-inset)' }}
      />

      {/* Tick sumbu tengah — hanya di `lg` ke atas, tempat label peran mengapit
          nama; di bawah itu labelnya pindah ke bawah nama dan tick jadi tanda
          tanpa yang ditandai. */}
      <span
        className="absolute top-1/2 hidden h-[26px] w-[var(--hairline-w)] -translate-y-1/2 lg:block"
        style={{ left: 'var(--frame-inset)', background: 'var(--line-strong)' }}
      />
      <span
        className="absolute top-1/2 hidden h-[26px] w-[var(--hairline-w)] -translate-y-1/2 lg:block"
        style={{ right: 'var(--frame-inset)', background: 'var(--line-strong)' }}
      />
    </div>
  );
}
