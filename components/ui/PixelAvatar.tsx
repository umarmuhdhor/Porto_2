/**
 * Avatar pixel-art persona (mirror figur referensi): sosok berdiri, headphone,
 * hoodie biru, celana jogger hitam, sneakers putih, tangan di kantong hoodie.
 *
 * Dibangun dari kotak-kotak (grid integer + shape-rendering crispEdges) supaya
 * tepinya bertangga & terbaca sebagai pixel-art, bukan ilustrasi vektor mulus.
 * Aset placeholder — ganti dengan avatar asli bila tersedia.
 */

const C = {
  dark: '#17171a', // rambut / headband
  cushion: '#33343a', // busa earcup
  skin: '#b07a52',
  beard: '#7c5233',
  eye: '#141414',
  blue: '#2f6ad0', // hoodie
  blueDark: '#2453a0', // bayangan hoodie / lengan
  cord: '#ece7dd', // tali hoodie
  pants: '#1f1f24',
  pantsDark: '#16161a',
  shoe: '#f1f1ee',
  sole: '#c7c7c2',
  accent: '#b4442a', // logo kecil sepatu
} as const;

// [x, y, w, h, color] pada grid 40×66 — digambar belakang → depan.
const PIX: ReadonlyArray<readonly [number, number, number, number, string]> = [
  // Headband + rambut
  [13, 4, 14, 3, C.dark],
  [14, 6, 12, 4, C.dark],
  [14, 10, 2, 3, C.dark],
  [24, 10, 2, 3, C.dark],
  // Earcup kiri/kanan
  [11, 9, 3, 7, C.cushion],
  [13, 9, 1, 7, C.dark],
  [26, 9, 3, 7, C.cushion],
  [26, 9, 1, 7, C.dark],
  // Wajah
  [15, 9, 10, 10, C.skin],
  [15, 15, 10, 4, C.beard],
  [17, 12, 2, 1, C.eye],
  [21, 12, 2, 1, C.eye],
  [18, 18, 4, 3, C.skin], // leher
  // Hoodie
  [10, 20, 20, 5, C.blue], // bahu
  [12, 25, 16, 16, C.blue], // badan
  [13, 41, 14, 3, C.blue], // pinggang
  [16, 20, 8, 2, C.blueDark], // kerah V
  [17, 22, 6, 1, C.blueDark],
  [18, 23, 4, 1, C.blueDark],
  [10, 22, 2, 18, C.blueDark], // lengan kiri (bayangan)
  [28, 22, 2, 18, C.blueDark], // lengan kanan
  [18, 22, 1, 6, C.cord], // tali kiri
  [21, 22, 1, 6, C.cord], // tali kanan
  [14, 33, 12, 1, C.blueDark], // garis kantong atas
  [15, 38, 10, 1, C.blueDark], // garis kantong bawah
  [15, 34, 4, 4, C.skin], // tangan kiri di kantong
  [21, 34, 4, 4, C.skin], // tangan kanan
  // Celana
  [13, 44, 14, 2, C.pants], // pinggang celana
  [14, 46, 5, 15, C.pants], // kaki kiri
  [18, 46, 1, 15, C.pantsDark],
  [21, 46, 5, 15, C.pants], // kaki kanan
  [21, 46, 1, 15, C.pantsDark],
  // Sepatu
  [12, 61, 8, 3, C.shoe],
  [12, 64, 8, 1, C.sole],
  [20, 61, 8, 3, C.shoe],
  [20, 64, 8, 1, C.sole],
  [16, 62, 1, 1, C.accent],
  [24, 62, 1, 1, C.accent],
];

export function PixelAvatar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 66"
      role="img"
      aria-label="Avatar pixel-art: sosok berdiri mengenakan headphone dan hoodie biru."
      style={{ shapeRendering: 'crispEdges' }}
    >
      {PIX.map(([x, y, w, h, fill], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />
      ))}
    </svg>
  );
}
