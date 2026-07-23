/**
 * Generator aset 3D brand — menulis `public/models/brand-object.glb`.
 *
 * KENAPA DIGENERATE, BUKAN DIDOWNLOAD (M4 §2, PRD §12 #1): model harus milik
 * sendiri / lisensi jelas. Membangkitkannya dari kode menghapus isu lisensi
 * sekaligus membuat geometri bisa di-review lewat git (yang masuk repo cuma
 * ~130KB biner, tapi sumber kebenarannya file ini).
 *
 * BENTUKNYA: dua tabung mengikuti kurva bezier yang SAMA dengan signature-line
 * di components/sections/LineArt.tsx — kurva utama + kurva gema — diangkat ke
 * 3D dengan sweep di sumbu z. Jadi objek 3D ini bukan ornamen acak; ia versi
 * volumetrik dari motif garis yang sudah dipakai di section gelap.
 *
 * Jalankan: pnpm run gen:model   (hanya perlu saat geometri diubah)
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/models/brand-object.glb');

/* ── Geometri ─────────────────────────────────────────────────────────────
 * Titik diambil dari path LineArt (viewBox 520x420) lalu dinormalisasi ke
 * satuan dunia: x=(sx-242)/120, y=(210-sy)/120 (y SVG ke bawah, y 3D ke atas).
 * Komponen z ditambahkan manual supaya kurva keluar dari bidang datar.
 */
const sx = (v) => (v - 242) / 120;
const sy = (v) => (210 - v) / 120;
const P = (x, y, z) => new THREE.Vector3(sx(x), sy(y), z);

/** Kurva utama: dua segmen cubic, sama dengan segmen pertama LineArt. */
function mainCurve() {
  const path = new THREE.CurvePath();
  path.add(
    new THREE.CubicBezierCurve3(
      P(32, 356, 0.55),
      P(150, 300, 0.3),
      P(120, 96, -0.25),
      P(236, 92, -0.45),
    ),
  );
  path.add(
    new THREE.CubicBezierCurve3(
      P(236, 92, -0.45),
      P(352, 88, -0.2),
      P(330, 268, 0.35),
      P(452, 236, 0.6),
    ),
  );
  return path;
}

/** Kurva gema: kurva kedua LineArt, digeser sedikit di y & z. */
function echoCurve() {
  const path = new THREE.CurvePath();
  path.add(
    new THREE.CubicBezierCurve3(
      P(32, 372, 0.72),
      P(152, 318, 0.46),
      P(134, 114, -0.1),
      P(240, 110, -0.3),
    ),
  );
  path.add(
    new THREE.CubicBezierCurve3(
      P(240, 110, -0.3),
      P(350, 106, -0.05),
      P(340, 284, 0.5),
      P(460, 252, 0.76),
    ),
  );
  return path;
}

/**
 * TubeGeometry meninggalkan ujung TERBUKA — dari kamera terlihat sebagai lubang
 * gelap, bukan sapuan yang selesai. Tiap ujung karena itu ditutup bola kecil
 * berjari-jari sedikit lebih besar dari tabungnya, yang sekaligus membaca
 * sebagai anchor point pen-tool — motif yang sama dengan kotak anchor di
 * LineArt (M3). Digabung ke satu geometry supaya tetap 1 draw call per kurva.
 */
function cappedTube(curve, tubularSegments, radius, radialSegments) {
  const capRadius = radius * 1.4;
  return mergeGeometries([
    new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false),
    ...[0, 1].map((t) =>
      new THREE.SphereGeometry(capRadius, radialSegments * 2, radialSegments).translate(
        ...curve.getPointAt(t).toArray(),
      ),
    ),
  ]);
}

/**
 * Poly budget sengaja rendah (M4 §5 "Mobile GPU lemah"): ~2k vertex total.
 * Cukup mulus di layar besar, murah di GPU mobile.
 */
const MESHES = [
  {
    name: 'signature-main',
    geo: cappedTube(mainCurve(), 96, 0.075, 8),
    color: '#ff5d3b',
    metallic: 0.25,
    rough: 0.34,
  },
  {
    name: 'signature-echo',
    geo: cappedTube(echoCurve(), 80, 0.032, 6),
    color: '#e48f5b',
    metallic: 0.1,
    rough: 0.5,
  },
];

/* ── Penulis GLB ──────────────────────────────────────────────────────────
 * Ditulis manual (bukan GLTFExporter three) karena exporter itu bergantung
 * pada FileReader/Blob milik browser — tidak ada di Node. Format GLB sendiri
 * sederhana: header 12 byte + chunk JSON + chunk BIN.
 */

/** glTF menyimpan warna dalam ruang LINEAR; nilai hex desain ada di sRGB. */
function srgbHexToLinear(hex) {
  const int = parseInt(hex.slice(1), 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
}

/** Offset tiap bufferView wajib kelipatan 4 (ukuran komponen terbesar di sini). */
function pad4(chunks, length) {
  const rem = length % 4;
  if (rem === 0) return length;
  chunks.push(Buffer.alloc(4 - rem));
  return length + (4 - rem);
}

const bufferViews = [];
const accessors = [];
const meshes = [];
const materials = [];
const nodes = [];
const binChunks = [];
let binLength = 0;

/** Menyalin satu TypedArray ke chunk BIN + mendaftarkannya sebagai bufferView. */
function pushView(typedArray, target) {
  const buf = Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
  const byteOffset = binLength;
  binChunks.push(buf);
  binLength = pad4(binChunks, binLength + buf.byteLength);
  bufferViews.push({ buffer: 0, byteOffset, byteLength: buf.byteLength, target });
  return bufferViews.length - 1;
}

function pushAccessor(accessor) {
  accessors.push(accessor);
  return accessors.length - 1;
}

const ARRAY_BUFFER = 34962;
const ELEMENT_ARRAY_BUFFER = 34963;
const FLOAT = 5126;
const UNSIGNED_SHORT = 5123;

for (const { name, geo, color, metallic, rough } of MESHES) {
  const pos = geo.attributes.position.array;
  const nor = geo.attributes.normal.array;
  const idx = geo.index.array;

  if (pos.length / 3 > 65535) throw new Error(`${name}: butuh index 32-bit`);

  // min/max POSITION wajib ada di spec glTF (dipakai untuk bounding box).
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      min[a] = Math.min(min[a], pos[i + a]);
      max[a] = Math.max(max[a], pos[i + a]);
    }
  }

  const positionAccessor = pushAccessor({
    bufferView: pushView(new Float32Array(pos), ARRAY_BUFFER),
    componentType: FLOAT,
    count: pos.length / 3,
    type: 'VEC3',
    min,
    max,
  });
  const normalAccessor = pushAccessor({
    bufferView: pushView(new Float32Array(nor), ARRAY_BUFFER),
    componentType: FLOAT,
    count: nor.length / 3,
    type: 'VEC3',
  });
  const indexAccessor = pushAccessor({
    bufferView: pushView(new Uint16Array(idx), ELEMENT_ARRAY_BUFFER),
    componentType: UNSIGNED_SHORT,
    count: idx.length,
    type: 'SCALAR',
  });

  materials.push({
    name: `${name}-mat`,
    pbrMetallicRoughness: {
      baseColorFactor: [...srgbHexToLinear(color), 1],
      metallicFactor: metallic,
      roughnessFactor: rough,
    },
    doubleSided: false,
  });

  meshes.push({
    name,
    primitives: [
      {
        attributes: { POSITION: positionAccessor, NORMAL: normalAccessor },
        indices: indexAccessor,
        material: materials.length - 1,
      },
    ],
  });

  nodes.push({ name, mesh: meshes.length - 1 });
}

const gltf = {
  asset: { version: '2.0', generator: 'porto2/scripts/generate-brand-object.mjs' },
  scene: 0,
  scenes: [{ name: 'brand-object', nodes: nodes.map((_, i) => i) }],
  nodes,
  meshes,
  materials,
  accessors,
  bufferViews,
  buffers: [{ byteLength: binLength }],
};

/** Chunk JSON dipad dengan SPASI, chunk BIN dengan nol (spec GLB §4.4.3). */
const jsonRaw = Buffer.from(JSON.stringify(gltf), 'utf8');
const jsonPad = (4 - (jsonRaw.byteLength % 4)) % 4;
const jsonChunk = Buffer.concat([jsonRaw, Buffer.alloc(jsonPad, 0x20)]);
const binChunk = Buffer.concat(binChunks, binLength);

const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0); // 'glTF'
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + jsonChunk.byteLength + 8 + binChunk.byteLength, 8);

const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(jsonChunk.byteLength, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4); // 'JSON'

const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(binChunk.byteLength, 0);
binHeader.writeUInt32LE(0x004e4942, 4); // 'BIN\0'

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, Buffer.concat([header, jsonHeader, jsonChunk, binHeader, binChunk]));

const verts = MESHES.reduce((n, m) => n + m.geo.attributes.position.count, 0);
console.log(`✓ ${OUT}`);
console.log(
  `  ${verts} vertices · ${(12 + 8 + jsonChunk.byteLength + 8 + binChunk.byteLength) / 1024} KB`,
);
