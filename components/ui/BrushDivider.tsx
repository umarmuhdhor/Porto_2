/**
 * Divider brush-stroke antar section warna kontras (DESIGN §4.3, M2 §3.4).
 * Dipasang di tepi ATAS section yang sedang naik menutupi section di bawahnya,
 * jadi batas dua warna terbaca sebagai sapuan kuas, bukan garis potong lurus.
 *
 * DEVIASI dari plan (§3.4 menyebut aset `.webp` + next/image): dipakai SVG
 * inline karena
 *   1. warnanya harus persis sama dengan latar section penutup — `currentColor`
 *      menyelesaikan ini tanpa bikin satu file raster per warna;
 *   2. aset digambar sendiri → tidak ada risiko lisensi (PRD §12);
 *   3. ~1 KB, tidak ada request tambahan, tajam di semua DPR.
 * Kalau nanti butuh tekstur bulu kuas yang lebih kasar (butir raster), ganti
 * `<path>` di bawah dengan <Image> bermask — API komponennya tetap sama.
 *
 * Parent WAJIB `position: relative|sticky` (divider dipasang `bottom-full`,
 * yaitu tepat di atas kotak parent).
 */
export function BrushDivider({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 bottom-full h-[clamp(28px,5.5vw,84px)] w-full ${className}`}
    >
      {/* Badan sapuan. Amplitudo & jarak antar puncak sengaja tidak beraturan —
          jarak seragam bikin tepinya terbaca sebagai gelombang CSS, bukan kuas. */}
      <path
        fill="currentColor"
        d="M0 120 H1440 V78
           C1400 78 1387 62 1360 62 C1340 62 1320 66 1300 66
           C1280 66 1260 44 1240 44 C1227 44 1213 40 1200 40
           C1183 40 1167 58 1150 58 C1130 58 1110 72 1090 72
           C1073 72 1057 70 1040 70 C1027 70 1013 52 1000 52
           C987 52 973 34 960 34 C950 34 940 30 930 30
           C920 30 910 46 900 46 C890 46 880 60 870 60
           C860 60 850 58 840 58 C827 58 813 74 800 74
           C787 74 773 80 760 80 C747 80 733 66 720 66
           C707 66 693 48 680 48 C667 48 653 42 640 42
           C627 42 613 56 600 56 C587 56 573 70 560 70
           C547 70 533 76 520 76 C507 76 493 62 480 62
           C467 62 453 44 440 44 C427 44 413 36 400 36
           C387 36 373 50 360 50 C347 50 333 64 320 64
           C307 64 293 58 280 58 C267 58 253 40 240 40
           C227 40 213 32 200 32 C187 32 173 48 160 48
           C147 48 133 62 120 62 C100 62 80 70 60 70
           C40 70 20 56 0 56 Z"
      />
      {/* Jejak bulu kuas: sliver tipis meruncing yang menyatu ke badan sapuan.
          Sengaja MIRING & asimetris — segitiga tegak simetris terbaca sebagai
          puncak gunung, bukan tarikan kuas. */}
      <g fill="currentColor">
        <path d="M1243 47 Q1248 28 1253 15 Q1252 30 1250 47 Z" />
        <path d="M1102 71 Q1105 60 1109 52 Q1108 61 1107 71 Z" />
        <path d="M932 34 Q936 20 941 9 Q940 22 938 34 Z" />
        <path d="M402 39 Q406 26 411 16 Q410 27 408 39 Z" />
        <path d="M203 34 Q205 27 208 22 Q207 28 206 34 Z" />
        {/* Cipratan kecil tepat di ujung flick terpanjang — lanjutan tarikan, bukan noda acak. */}
        <ellipse cx="1254" cy="9" rx="1.8" ry="1.1" />
      </g>
    </svg>
  );
}
