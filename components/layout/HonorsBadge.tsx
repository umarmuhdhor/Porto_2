/**
 * Badge social-proof persisten menempel tepi kanan viewport.
 * Monogram + label "Honors" (teks vertikal). DESIGN §4.2.
 * Latar solid gelap agar selalu kebaca di atas section warna apa pun.
 * Boleh "mengintip" terpotong di mobile — by design (DESIGN §7).
 *
 * TODO(brand): ganti monogram "W." dengan inisial brand sendiri; tautkan ke
 * halaman/anchor honors saat konten tersedia (M5+).
 */
export function HonorsBadge() {
  return (
    <div className="fixed top-1/2 right-0 -translate-y-1/2" style={{ zIndex: 'var(--z-badge)' }}>
      <div className="bg-dark text-inverse flex flex-col items-center gap-6 rounded-l-[var(--radius-badge)] px-3 py-5 shadow-[0_18px_40px_-20px_rgba(10,10,10,0.6)]">
        <span className="font-display text-lg leading-none font-bold">UM.</span>
        <span className="text-xs font-medium tracking-widest [writing-mode:vertical-rl]">
          Honors
        </span>
      </div>
    </div>
  );
}
