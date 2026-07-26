/**
 * Garis frame vertikal kiri & kanan yang selalu terlihat sepanjang scroll.
 * DESIGN §2.3 / §3. Fixed, pointer-events-none, di atas konten tapi tidak
 * menghalangi interaksi.
 *
 * Garis dirender sebagai hairline (lihat `.frame-line` di globals.css) dengan
 * ujung atas/bawah yang meluruh, bukan batang 2px solid: pada layer `fixed`,
 * garis bertepi tegas terbaca sebagai border yang mengurung viewport, sedangkan
 * hairline meluruh terbaca sebagai garis margin cetak — persis peran yang
 * diminta DESIGN §3. Tick pendek di mid-height menandai sumbu tempat label hero
 * mengapit, jadi garis punya artikulasi tanpa menambah bobot visual.
 */
export function FrameLines() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 'var(--z-frame)' }}
    >
      <span className="frame-line absolute top-0 bottom-0" style={{ left: 'var(--frame-inset)' }} />
      <span
        className="frame-line absolute top-0 bottom-0"
        style={{ right: 'var(--frame-inset)' }}
      />

      {/* Tick sumbu tengah — hanya di layar lebar, tempat label hero mengapit. */}
      <span
        className="absolute top-1/2 hidden h-[26px] w-[var(--hairline-w)] -translate-y-1/2 md:block"
        style={{ left: 'var(--frame-inset)', background: 'var(--line-strong)' }}
      />
      <span
        className="absolute top-1/2 hidden h-[26px] w-[var(--hairline-w)] -translate-y-1/2 md:block"
        style={{ right: 'var(--frame-inset)', background: 'var(--line-strong)' }}
      />
    </div>
  );
}
