/**
 * Pill layanan di header case study (M5 §3.3 #4, DESIGN §2.4).
 *
 * Non-interaktif: ini label, bukan filter atau link. Karena itu dirender <li>
 * di dalam <ul> — daftar layanan yang dibacakan screen reader sebagai daftar,
 * bukan deretan tombol palsu yang tidak bisa ditekan.
 */

export function ServicePill({ children }: { children: React.ReactNode }) {
  return (
    <li className="font-system border-ink/15 text-ink/80 rounded-[var(--radius-pill)] border px-4 py-2 text-xs tracking-wide md:text-sm">
      {children}
    </li>
  );
}

export function ServicePillList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-8 flex flex-wrap gap-2 md:gap-3">
      {items.map((item) => (
        <ServicePill key={item}>{item}</ServicePill>
      ))}
    </ul>
  );
}
